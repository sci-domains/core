// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {Authorizer} from '../Authorizers/Authorizer.sol';
import {Verifier} from '../Verifiers/Verifier.sol';

/**
 * @custom:security-contact security@sci.domains
 */
interface IRegistry {
    /**
     * @dev Emitted when a new `domain` with the `domainHash` is
     * registered by the `owner` using the authorizer with id `authorizerId`.
     */
    event DomainRegistered(
        uint256 indexed authorizerId,
        address indexed owner,
        bytes32 indexed domainHash,
        string domain
    );

    /**
     * @dev Emitted when the `owner` of the `domainHash` adds a `verifier`.
     *
     * NOTE: This will also be emitted when the verifier is changed.
     */
    event VerifierSet(address indexed owner, bytes32 domainHash, Verifier indexed verifier);

    /**
     * @dev Emitted when the owner of a `domainHash` is set.
     *
     */
    event OwnerSet(address indexed msgSender, bytes32 domainHash, address indexed owner);

    /**
     * @dev Emitted when the `msgSender` adds and `authorizer` with id `authorizerId`.
     *
     * NOTE: This will also be emitted when the authorizer is changed for an existing id.
     */
    event AuthorizerSet(uint256 indexed authorizerId, Authorizer authorizer, address msgSender);

    /**
     * @dev Thrown when the `account` is not authorized to register the domain with namehash `domainHash`.
     */
    error AccountIsNotAuthorizeToRegisterDomain(address account, bytes32 domainHash);

    /**
     * @dev Returns the owner, the verifier, lastOwnerSetTime and lastVerifierSetTime
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
            Verifier verifier,
            uint256 lastOwnerSetTime,
            uint256 lastVerifierSetTime
        );

    /**
     * @dev Register a domain.
     *
     * @param authorizerId The id of the authorizer being used.
     * @param owner The owner of the domain.
     * @param domain The domain being registered (example.com).
     * @param isWildcard If you are registering a wildcard to set a verifier for all subdomains.
     *
     * NOTE: If wildcard is true then it registers the name hash of `*.domain`.
     *
     * Requirements:
     *
     * - the owner must be authorized by the authorizer.
     *
     * May emit a {DomainRegistered} event.
     */
    function registerDomain(
        uint256 authorizerId,
        address owner,
        string memory domain,
        bool isWildcard
    ) external;

    /**
     * @dev Same as registerDomain but it also adds a verifier.
     *
     * @param authorizerId The id of the authorizer being used.
     * @param domain The domain being registered (example.com).
     * @param isWildcard if you are registering a wildcard to set a verifier for all subdomains.
     * @param verifier the verifier that is being set for the domain.
     *
     * Requirements:
     *
     * - the caller must be authorized by the authorizer.
     *
     * May emit a {DomainRegistered} and a {VerifierAdded} events.
     */
    function registerDomainWithVerifier(
        uint256 authorizerId,
        string memory domain,
        bool isWildcard,
        Verifier verifier
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
     * @dev Returns the verifier of the domainHash.
     * @param domainHash The name hash of the domain
     * @return the address of the verifier or the ZERO_ADDRESS if the domain or
     * the verifier are not registered
     */
    function domainVerifier(bytes32 domainHash) external view returns (Verifier);

    /**
     * @dev Returns the timestamp of the block where the verifier was set.
     * @param domainHash The name hash of the domain
     * @return the timestamp of the block where the verifier was set or
     * 0 if it wasn't
     */
    function domainVerifierSetTime(bytes32 domainHash) external view returns (uint256);

    /**
     * @dev Sets a verifier to the domain hash.
     * @param domainHash The name hash of the domain
     * @param verifier The address of the verifier contract
     *
     * Requirements:
     *
     * - the caller must be the owner of the domain.
     *
     * May emit a {VerifierAdded} event.
     *
     * NOTE: If you want to remove a verifier you can set it to the ZERO_ADDRESS
     */
    function setVerifier(bytes32 domainHash, Verifier verifier) external;

    /**
     * @dev Sets an authorizer with id `authorizerId`.
     * @param authorizerId The id of the authorizer
     * @param authorizer The address of the authorizer contract
     *
     * Requirements:
     *
     * - the caller must have the ADD_AUTHORIZER_ROLE role.
     *
     * May emit a {AuthorizerAdded} event.
     *
     * NOTE: If you want to remove an authorizer you can set it to the ZERO_ADDRESS
     */
    function setAuthorizer(uint256 authorizerId, Authorizer authorizer) external;
}
