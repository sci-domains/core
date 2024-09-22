// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {IRegistry} from './IRegistry.sol';
import {DomainManager} from '../DomainMangager/DomainManager.sol';

// TODO: Add Pausable
/**
 * @title Registry
 * @dev See {IRegistry-version}.
 * @custom:security-contact security@sci.domains
 */
contract Registry is IRegistry, Context, AccessControlDefaultAdminRules, DomainManager {
    /**
     * @dev Structure to hold domain record details, including:
     * - owner: Address of the domain owner.
     * - verifier: Address of the verifier contract associated with the domain.
     * - ownerSetTime: Timestamp of when the domain owner was last set.
     * - verifierSetTime: Timestamp of when the verifier was last set.
     */
    struct Record {
        address owner;
        IVerifier verifier;
        uint256 ownerSetTime;
        uint256 verifierSetTime;
    }

    // Role that allows managing registrar roles
    bytes32 public constant REGISTRAR_MANAGER_ROLE = keccak256('REGISTRAR_MANAGER_ROLE');
    // Role that allows registering domains
    bytes32 public constant REGISTRAR_ROLE = keccak256('REGISTRAR_ROLE');

    /**
     * @dev Maps the namehash of a domain to a Record.
     */
    mapping(bytes32 nameHash => Record domain) public domainHashToRecord;

    /**
     * @dev Constructor to initialize the Registry contract.
     * Sets the REGISTRAR_MANAGER_ROLE as the admin role of REGISTRAR_ROLE.
     * @param initialDelay The {defaultAdminDelay}. See AccessControlDefaultAdminRules for more information
     */
    constructor(
        uint48 initialDelay
    ) AccessControlDefaultAdminRules(initialDelay, _msgSender()) DomainManager(address(this)) {
        _setRoleAdmin(REGISTRAR_ROLE, REGISTRAR_MANAGER_ROLE);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external {
        _registerDomain(owner, domainHash);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function registerDomainWithVerifier(
        address owner,
        bytes32 domainHash,
        IVerifier verifier
    ) external {
        _registerDomain(owner, domainHash);
        _setVerifier(domainHash, verifier);
    }

    /**
     * @dev Grants a role to an account.
     * @param role The role to grant.
     * @param account The account receiving the role.
     * 
     * Note: Overrides the OpenZeppelin function to require the 
     * _msgSender() to have the admin role for the role being granted.
     */
    function grantRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function isDomainOwner(
        bytes32 domainHash,
        address account
    ) external view virtual override returns (bool) {
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
        IVerifier verifier
    ) external onlyDomainOwner(domainHash) {
        _setVerifier(domainHash, verifier);
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function domainVerifier(bytes32 domainHash) external view virtual returns (IVerifier) {
        return domainHashToRecord[domainHash].verifier;
    }

    /**
     * @dev See {IRegistry-version}.
     */
    function domainVerifierSetTime(bytes32 domainHash) external view virtual returns (uint256) {
        return domainHashToRecord[domainHash].verifierSetTime;
    }

    /**
     * @dev Base function to register a domain.
     *
     * @param owner The owner of the domain.
     * @param domainHash The namehash of the domain being registered.
     *
     * Requirements:
     *
     * - the owner must be authorized by the authorizer.
     *
     * May emit a {DomainRegistered} event.
     */
    function _registerDomain(
        address owner,
        bytes32 domainHash
    ) private onlyRole(REGISTRAR_ROLE) {
        _setDomainOwner(domainHash, owner);
        emit DomainRegistered(_msgSender(), owner, domainHash);
    }

    /**
     * @dev Sets the verifier, updates the verifier timestamp and
     * emits VerifierSet events.
     * All updates to a verifier should be through this function
     */
    function _setVerifier(bytes32 domainHash, IVerifier verifier) private {
        domainHashToRecord[domainHash].verifier = verifier;
        domainHashToRecord[domainHash].verifierSetTime = block.timestamp;
        emit VerifierSet(_msgSender(), domainHash, verifier);
    }

    /**
     * @dev Sets the owner of a domain,
     * All updates to an owner should be through this function
     */
    function _setDomainOwner(bytes32 domainHash, address owner) private {
        domainHashToRecord[domainHash].owner = owner;
        domainHashToRecord[domainHash].ownerSetTime = block.timestamp;
        emit OwnerSet(_msgSender(), domainHash, owner);
    }
}
