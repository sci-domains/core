// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import '../Ens/INameHash.sol';
import '../Authorizers/Authorizer.sol';
import '../Verifiers/Verifier.sol';
import './IRegistry.sol';
import '../DomainMangager/DomainManager.sol';

contract Registry is IRegistry, Context, AccessControlDefaultAdminRules, DomainManager {
    struct Record {
        address owner;
        Verifier verifier;
    }

    bytes32 public constant ADD_AUTHORIZER_ROLE = keccak256('ADD_AUTHORIZER_ROLE');
    INameHash public immutable nameHashUtils;

    /**
     * @dev Maps the name hash of a domain to a Record.
     */
    mapping(bytes32 => Record) public domainHashToRecord;

    /**
     * @dev Maps the id of an authorizer to the Authorizer address.
     */
    mapping(uint256 => Authorizer) public authorizers;

    /**
     * @dev Sets the address for {nameHashUtils} and gives the deployer the ADMIN role.
     */
    constructor(
        address _nameHashAddress
    ) AccessControlDefaultAdminRules(0, _msgSender()) DomainManager(address(this)) {
        nameHashUtils = INameHash(_nameHashAddress);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function registerDomain(
        uint256 authorizerId,
        address owner,
        string memory domain,
        bool isWildcard
    ) external {
        _registerDomain(authorizerId, owner, domain, isWildcard);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function registerDomainWithVerifier(
        uint256 authorizerId,
        string memory domain,
        bool isWildcard,
        Verifier verifier
    ) external {
        bytes32 domainHash = _registerDomain(authorizerId, _msgSender(), domain, isWildcard);
        domainHashToRecord[domainHash].verifier = verifier;
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function isDomainOwner(
        bytes32 domainHash,
        address account
    ) public view virtual override returns (bool) {
        return domainOwner(domainHash) == account;
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function domainOwner(bytes32 domainHash) public view virtual override returns (address) {
        return domainHashToRecord[domainHash].owner;
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function setVerifier(
        bytes32 domainHash,
        Verifier verifier
    ) external onlyDomainOwner(domainHash) {
        domainHashToRecord[domainHash].verifier = verifier;
        emit VerifierSet(_msgSender(), domainHash, verifier);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function domainVerifier(bytes32 domainHash) external view virtual returns (Verifier) {
        return domainHashToRecord[domainHash].verifier;
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function setAuthorizer(
        uint256 authorizerId,
        Authorizer authorizer
    ) external onlyRole(ADD_AUTHORIZER_ROLE) {
        authorizers[authorizerId] = authorizer;
        emit AuthorizerSet(authorizerId, authorizer, _msgSender());
    }

    /**
     * @dev Base function to register a domain.
     *
     * @param authorizerId The id of the authorizer being used.
     * @param owner The owner of the domain.
     * @param domain The domain being registered (example.com).
     * @param isWildcard If you are registering a wildcard to set a verifier for all subdomains.
     * @return the name hash of the domain.
     *
     * NOTE: If wildcard is true then it registers the name hash of `*.domain`.
     *
     * Requirements:
     *
     * - the owner must be authorized by the authorizer.
     *
     * May emit a {DomainRegistered} event.
     */
    function _registerDomain(
        uint256 authorizerId,
        address owner,
        string memory domain,
        bool isWildcard
    ) internal returns (bytes32) {
        bytes32 domainHash = nameHashUtils.getDomainHash(domain);

        if (!authorizers[authorizerId].isAuthorized(owner, domainHash)) {
            revert AccountIsNotAuthorizeToRegisterDomain(owner, domainHash);
        }

        bytes32 recordDomain = domainHash;

        if (isWildcard) {
            recordDomain = keccak256(
                abi.encodePacked(domainHash, keccak256(abi.encodePacked('*')))
            );
        }

        domainHashToRecord[recordDomain].owner = owner;
        emit DomainRegistered(authorizerId, owner, recordDomain, domain);

        return domainHash;
    }
}
