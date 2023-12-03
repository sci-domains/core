// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import './Authorizers/Authorizer.sol';
import './Verifiers/Verifier.sol';

contract Registry is Context, AccessControlDefaultAdminRules {
    struct Record {
        address owner;
        // TODO: Why ENS has bytes64?
        uint256 ttl;
        Verifier verifier;
    }

    mapping(string => Record) public domainToRecord;
    mapping(uint256 => Authorizer) public authorizers;
    bytes32 public constant ADD_AUTHORIZER_ROLE = keccak256('ADD_AUTHORIZER_ROLE');

    event DomainRegistered(
        uint256 indexed authorizer,
        address indexed owner,
        string domain,
        uint256 indexed ttl
    );
    event VerifierAdded(address indexed owner, string domain, Verifier indexed verifier);

    error AccountIsNotAuthorizeToRegisterDomain(address account, string domain);
    error AccountIsNotDomainOwner(address account, string domain);
    error DomainIsExpired(address messageSender, string domain);

    modifier onlyDomainOwner(string memory domain) {
        _checkDomainOwner(domain);
        _;
    }

    modifier onlyValidDomain(string memory domain) {
        _checkValidDomain(domain);
        _;
    }

    constructor() AccessControlDefaultAdminRules(0, _msgSender()) {}

    // TODO: Should we set a period in which the domain is not valid for security?
    function registerDomain(uint256 authorizer, string memory domain, bool isWildcard) public {
        uint256 ttl = authorizers[authorizer].isAuthorize(_msgSender(), domain);

        if (ttl == 0) {
            revert AccountIsNotAuthorizeToRegisterDomain(_msgSender(), domain);
        }

        string memory recordDomain = domain;

        if (isWildcard) {
            recordDomain = string.concat('*.', domain);
        }

        domainToRecord[recordDomain].owner = _msgSender();
        domainToRecord[recordDomain].ttl = ttl;

        emit DomainRegistered(authorizer, _msgSender(), recordDomain, ttl);
    }

    function isDomainValid(string memory domain) public view returns (bool) {
        uint256 ttl = domainTtl(domain);
        return ttl != 0 && ttl >= block.timestamp;
    }

    function isDomainOwner(string memory domain, address account) public view returns (bool) {
        return domainOwner(domain) == account;
    }

    function domainTtl(string memory domain) public view virtual returns (uint256) {
        return domainToRecord[domain].ttl;
    }

    function domainOwner(string memory domain) public view returns (address) {
        if (!isDomainValid(domain)) return 0x0000000000000000000000000000000000000000;

        return domainToRecord[domain].owner;
    }

    function addVerifier(string memory domain, Verifier verifier) public onlyDomainOwner(domain) {
        domainToRecord[domain].verifier = verifier;
        emit VerifierAdded(_msgSender(), domain, verifier);
    }

    function domainVerifier(string memory domain) public view virtual returns (Verifier) {
        return domainToRecord[domain].verifier;
    }

    function _checkDomainOwner(string memory domain) internal virtual {
        _checkValidDomain(domain);
        if (!isDomainOwner(domain, _msgSender())) {
            revert AccountIsNotDomainOwner(_msgSender(), domain);
        }
    }

    function addAuthorizer(
        uint256 authorizerId,
        Authorizer authorizer
    ) public onlyRole(ADD_AUTHORIZER_ROLE) {
        authorizers[authorizerId] = authorizer;
    }

    function _checkValidDomain(string memory domain) internal virtual {
        if (!isDomainValid(domain)) {
            revert DomainIsExpired(_msgSender(), domain);
        }
    }
}
