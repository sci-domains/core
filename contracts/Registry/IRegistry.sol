// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {IVerifier} from '../Verifiers/IVerifier.sol';

/**
 * @custom:security-contact security@sci.domains
 */
interface IRegistry {
    /**
     * @dev Emitted when a new `domain` with the `domainHash` is
     * registered by the `owner`.
     */
    event DomainRegistered(
        address indexed registrar,
        address indexed owner,
        bytes32 indexed domainHash
    );

    /**
     * @dev Emitted when the `owner` of the `domainHash` adds a `IVerifier`.
     *
     * NOTE: This will also be emitted when the IVerifier is changed.
     */
    event VerifierSet(address indexed owner, bytes32 domainHash, IVerifier indexed IVerifier);

    /**
     * @dev Emitted when the owner of a `domainHash` is set.
     *
     */
    event OwnerSet(address indexed msgSender, bytes32 domainHash, address indexed owner);

    /**
     * @dev Thrown when the `account` is not authorized to register the domain with namehash `domainHash`.
     */
    error AccountIsNotAuthorizeToRegisterDomain(address account, bytes32 domainHash);

    /**
     * @dev Returns the owner, the IVerifier, lastOwnerSetTime and lastIVerifierSetTime
     * for a given domainHash.
     * @param domainHash The name hash of the domain
     */
    function domainHashToRecord(
        bytes32 domainHash
    )
        external
        view
        returns (
            address owner,
            IVerifier IVerifier,
            uint256 lastOwnerSetTime,
            uint256 lastIVerifierSetTime
        );

    /**
     * @dev Register a domain.
     *
     * @param owner The owner of the domain.
     * @param domainHash The name hash of the domain being registered.
     *
     * Requirements:
     *
     * - Only valid Registrars must be able to call this function
     *
     * May emit a {DomainRegistered} event.
     */
    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external;

    /**
     * @dev Same as registerDomain but it also adds a IVerifier.
     * 
     * @param domainHash The name hash of the domain being registered.
     * @param IVerifier the IVerifier that is being set for the domain.
     *
     * Requirements:
     *
     * - Only valid Registrars must be able to call this function
     *
     * May emit a {DomainRegistered} and a {IVerifierAdded} events.
     */
    function registerDomainWithVerifier(
        address owner,
        bytes32 domainHash,
        IVerifier IVerifier
    ) external;

    /**
     * @dev Returns true if the account is the owner of the domainHash.
     */
    function isDomainOwner(bytes32 domainHash, address account) external view returns (bool);

    /**
     * @dev Returns the owner of the domainHash.
     * @param domainHash The name hash of the domain
     * @return the address of the owner or the ZERO_ADDRESS if the domain is not registered
     */
    function domainOwner(bytes32 domainHash) external view returns (address);

    /**
     * @dev Returns the IVerifier of the domainHash.
     * @param domainHash The name hash of the domain
     * @return the address of the IVerifier or the ZERO_ADDRESS if the domain or
     * the IVerifier are not registered
     */
    function domainVerifier(bytes32 domainHash) external view returns (IVerifier);

    /**
     * @dev Returns the timestamp of the block where the IVerifier was set.
     * @param domainHash The name hash of the domain
     * @return the timestamp of the block where the IVerifier was set or
     * 0 if it wasn't
     */
    function domainVerifierSetTime(bytes32 domainHash) external view returns (uint256);

    /**
     * @dev Sets a IVerifier to the domain hash.
     * @param domainHash The name hash of the domain
     * @param verifier The address of the IVerifier contract
     *
     * Requirements:
     *
     * - the caller must be the owner of the domain.
     *
     * May emit a {IVerifierAdded} event.
     *
     * NOTE: If you want to remove a IVerifier you can set it to the ZERO_ADDRESS
     */
    function setVerifier(bytes32 domainHash, IVerifier verifier) external;
}
