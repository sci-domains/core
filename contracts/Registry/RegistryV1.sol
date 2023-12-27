// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import '../Utils/NameHash.sol';
import '../Authorizers/Authorizer.sol';
import '../Verifiers/Verifier.sol';
import './Registry.sol';
import '../Utils/NameHash.sol';

contract RegistryV1 is Registry, Context, AccessControlDefaultAdminRules {
    struct Record {
        address owner;
        Verifier verifier;
    }

    mapping(bytes32 => Record) public domainHashToRecord;
    mapping(uint256 => Authorizer) public authorizers;
    bytes32 public constant ADD_AUTHORIZER_ROLE = keccak256('ADD_AUTHORIZER_ROLE');
    NameHash public immutable nameHashUtils;

    modifier onlyDomainOwner(bytes32 domain) {
        _checkDomainOwner(domain);
        _;
    }

    constructor(address _nameHashAddress) AccessControlDefaultAdminRules(0, _msgSender()) {
        nameHashUtils = NameHash(_nameHashAddress);
    }

    function registerDomain(
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard
    ) external {
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

        // TODO: Improve
        emit DomainRegistered(authorizer, owner, recordDomain, domain);
    }

    function isDomainOwner(
        bytes32 domain,
        address account
    ) public view virtual override returns (bool) {
        return domainOwner(domain) == account;
    }

    function domainOwner(bytes32 domain) public view virtual override returns (address) {
        return domainHashToRecord[domain].owner;
    }

    function addVerifier(bytes32 domain, Verifier verifier) external onlyDomainOwner(domain) {
        domainHashToRecord[domain].verifier = verifier;
        emit VerifierAdded(_msgSender(), domain, verifier);
    }

    function domainVerifier(bytes32 domain) external view virtual returns (Verifier) {
        return domainHashToRecord[domain].verifier;
    }

    function _checkDomainOwner(bytes32 domain) internal virtual {
        if (!isDomainOwner(domain, _msgSender())) {
            revert AccountIsNotDomainOwner(_msgSender(), domain);
        }
    }

    function addAuthorizer(
        uint256 authorizerId,
        Authorizer authorizer
    ) external onlyRole(ADD_AUTHORIZER_ROLE) {
        authorizers[authorizerId] = authorizer;
    }
}
