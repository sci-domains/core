// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Authorizers/Authorizer.sol";
import "./Verifiers/Verifier.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";


contract Registry is Context, AccessControl {

    // ##################################
    // # Access Control
    // ##################################
    bytes32 public constant ADD_AUTHORIZER_ROLE = keccak256("ADD_AUTHORIZER_ROLE");

    // ##################################
    // # Events
    // ##################################
    event DomainRegistered(uint256 indexed authorizer, address indexed owner, string domain, uint256 indexed ttl);
    event VerifierAdded(address indexed owner, string domain, Verifier indexed verifier);

    // ##################################
    // # Errors
    // ##################################
    error AccountIsNotAuthorizeToRegisterDomain(address account, string domain);
    error AccountIsNotDomainOwner(address account, string domain);
    error DomainIsExpired(address messageSender, string domain);

    // ##################################
    // # Structs
    // ##################################
    struct Record {
        address owner;
        // TODO: Why ENS has bytes64?
        uint256 ttl;
        Verifier verifier;
    }

    // ##################################
    // # Variables
    // ##################################
    mapping(uint256 => Authorizer) public authorizers;
    mapping(string => Record) public domainToRecord;

    // ##################################
    // # Modifiers
    // ##################################
    modifier onlyDomainOwner(string memory domain) {
        _checkDomainOwner(domain);
        _;
    }

    modifier onlyValidDomain(string memory domain) {
        _checkValidDomain(domain);
        _;
    }

    // ##################################
    // # Domain Logic
    // ##################################
    // TODO: Should we charge?
    // TODO: Should we set a period in which the domain is not valid for security?
    // TODO: Check wildcard implementation
    function registerDomain(uint256 authorizer, string memory domain, bool isWildcard) public {
        uint256 ttl = authorizers[authorizer].isAuthorize(_msgSender(), domain);

        if(ttl == 0) {
            revert AccountIsNotAuthorizeToRegisterDomain(_msgSender(), domain);
        }

        string memory recordDomain = domain;

        if(isWildcard) {
            recordDomain = string.concat('*.', domain);
        }

        domainToRecord[domain].owner = _msgSender();
        domainToRecord[domain].ttl = ttl;

        emit DomainRegistered(authorizer, _msgSender(), domain, ttl);
    }

    function isDomainValid(string memory domain) public returns (bool){
        return domainTtl(domain) <= block.timestamp;
    }

    function isDomainOwner(string memory domain, address account) public returns (bool){
        return domainOwner(domain) == account;
    }

    function _checkDomainOwner(string memory domain) internal virtual {
        _checkValidDomain(domain);
        if (isDomainOwner(domain, _msgSender())) {
            revert AccountIsNotDomainOwner(_msgSender(), domain);
        }
    }

    function _checkValidDomain(string memory domain) internal virtual {
        if (!isDomainValid(domain)) {
            revert DomainIsExpired(_msgSender(), domain);
        }
    }

    function domainTtl(string memory domain) public view virtual returns (uint256) {
        return domainToRecord[domain].ttl;
    }

    function domainOwner(string memory domain) public virtual returns (address) {

        if(isDomainValid(domain)) return 0x0000000000000000000000000000000000000000;

        return domainToRecord[domain].owner;
    }

    // ##################################
    // # Resolvers Logic
    // ##################################
    function addVerifier(string memory domain, Verifier verifier) public onlyDomainOwner(domain) {
        domainToRecord[domain].verifier = verifier;
        emit VerifierAdded(_msgSender(), domain, verifier);
    }

    // ##################################
    // # Authorizers Logic
    // ##################################
    function addAuthorizer(uint256 authorizerId, Authorizer authorizer) public onlyRole(ADD_AUTHORIZER_ROLE) {
        authorizers[authorizerId] = authorizer;
    }

    // ##################################
    // # Verification
    // ##################################
    // TODO: We should check that is a valid verifier
    function isVerified(string memory domain, uint256 chainId,  address contractAddress) public returns (bool) {
        // TODO: Improve gas, we are accessing multiple times to storage
        if(!isDomainValid(domain)) return false;

        Verifier verifier = domainToRecord[domain].verifier;

        return verifier.isVerified(domain, chainId, contractAddress);
    }

    function isVerifiedForMultipleDomains(string[] memory domains, uint256 chainId, address contractAddress) public returns (bool[] memory) {
        bool[] memory domainsVerification;
        for(uint256 i; i < domains.length; i++) {
            domainsVerification[i] = this.isVerified(domains[i], chainId, contractAddress);
        }
        return domainsVerification;
    }

}
