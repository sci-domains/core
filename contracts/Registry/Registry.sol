// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import '../Ens/INameHash.sol';
import '../Authorizers/Authorizer.sol';
import '../Verifiers/Verifier.sol';
import './IRegistry.sol';

contract Registry is IRegistry, Context, AccessControlDefaultAdminRules {
    struct Record {
        address owner;
        Verifier verifier;
    }

    mapping(bytes32 => Record) public domainHashToRecord;
    mapping(uint256 => Authorizer) public authorizers;
    bytes32 public constant ADD_AUTHORIZER_ROLE = keccak256('ADD_AUTHORIZER_ROLE');
    INameHash public immutable nameHashUtils;

    modifier onlyDomainOwner(bytes32 domainHash) {
        _checkDomainOwner(domainHash);
        _;
    }

    constructor(address _nameHashAddress) AccessControlDefaultAdminRules(0, _msgSender()) {
        nameHashUtils = INameHash(_nameHashAddress);
    }

    function registerDomain(
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard
    ) external {
        _registerDomain(authorizer, owner, domain, isWildcard);
    }

    function registerDomainWithVerifier(
        uint256 authorizer,
        string memory domain,
        bool isWildcard,
        Verifier verifier
    ) external {
        bytes32 domainHash = _registerDomain(authorizer, _msgSender(), domain, isWildcard);
        domainHashToRecord[domainHash].verifier = verifier;
    }

    function _registerDomain(
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard
    ) internal returns (bytes32) {
        bytes32 domainHash = nameHashUtils.getDomainHash(domain);

        if (!authorizers[authorizer].isAuthorized(owner, domainHash)) {
            revert AccountIsNotAuthorizeToRegisterDomain(owner, domainHash);
        }

        bytes32 recordDomain = domainHash;

        if (isWildcard) {
            recordDomain = keccak256(
                abi.encodePacked(domainHash, keccak256(abi.encodePacked('*')))
            );
        }

        domainHashToRecord[recordDomain].owner = owner;
        emit DomainRegistered(authorizer, owner, recordDomain, domain);

        return domainHash;
    }

    function isDomainOwner(
        bytes32 domainHash,
        address account
    ) public view virtual override returns (bool) {
        return domainOwner(domainHash) == account;
    }

    function domainOwner(bytes32 domainHash) public view virtual override returns (address) {
        return domainHashToRecord[domainHash].owner;
    }

    // TODO: This should be setVerifier
    function addVerifier(
        bytes32 domainHash,
        Verifier verifier
    ) external onlyDomainOwner(domainHash) {
        domainHashToRecord[domainHash].verifier = verifier;
        emit VerifierAdded(_msgSender(), domainHash, verifier);
    }

    function domainVerifier(bytes32 domainHash) external view virtual returns (Verifier) {
        return domainHashToRecord[domainHash].verifier;
    }

    function _checkDomainOwner(bytes32 domainHash) internal virtual {
        if (!isDomainOwner(domainHash, _msgSender())) {
            revert AccountIsNotDomainOwner(_msgSender(), domainHash);
        }
    }

    function addAuthorizer(
        uint256 authorizerId,
        Authorizer authorizer
    ) external onlyRole(ADD_AUTHORIZER_ROLE) {
        authorizers[authorizerId] = authorizer;
        emit AuthorizerAdded(authorizerId, authorizer, _msgSender());
    }
}
