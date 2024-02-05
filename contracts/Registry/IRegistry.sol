// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '../Authorizers/Authorizer.sol';
import '../Verifiers/Verifier.sol';

interface IRegistry {
    /**
     * @dev Emitted when a new `domain` with the `domainHash` is
     * registered by the `owner` using the `authorizer`.
     */
    event DomainRegistered(
        uint256 indexed authorizer,
        address indexed owner,
        bytes32 indexed domainHash,
        string domain
    );

    /**
     * @dev Emitted when the `owner` of the `domainHash` add a `verifier`.
     *
     * NOTE: This will also be emitted when the verifier is changed.
     */
    event VerifierAdded(address indexed owner, bytes32 domainHash, Verifier indexed verifier);

    /**
     * @dev Emitted when the `msgSender` adds and `authorizer` with id `authorizerId`.
     *
     * NOTE: This will also be emitted when the authorizer is changed for an existing id.
     */
    event AuthorizerAdded(uint256 indexed authorizerId, Authorizer authorizer, address msgSender);

    /**
     * @dev Thrown when the `account` is not authorized to register the domain with namehash `domainHash`.
     */
    error AccountIsNotAuthorizeToRegisterDomain(address account, bytes32 domainHash);

    /**
     * @dev Returns the owner and the verifier for a given domainHash.
     */
    function domainHashToRecord(
        bytes32 domainHash
    ) external view returns (address owner, Verifier verifier);

    /**
     * @dev Register a domain.
     *
     * @param authorizer The id of the authorizer being used.
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
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard
    ) external;

    /**
     * @dev Same as registerDomain but it also adds a verifier.
     *
     * @param authorizer The id of the authorizer being used.
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
        uint256 authorizer,
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
     *
     * NOTE: If the domainHash is not registered it returns the ZERO_ADDRESS.
     */
    function domainOwner(bytes32 domainHash) external view returns (address);

    /**
     * @dev Returns the verifier of the domainHash.
     *
     * NOTE: If the domainHash is not registered it returns the ZERO_ADDRESS.
     */
    function domainVerifier(bytes32 domainHash) external view returns (Verifier);

    /**
     * @dev Adds a verifier to the domain hash.
     *
     * Requirements:
     *
     * - the caller must be the owner of the domain.
     *
     * May emit a {VerifierAdded} event.
     */
    function addVerifier(bytes32 domainHash, Verifier verifier) external;

    /**
     * @dev Adds an authorizer with id `authorizerId`.
     *
     * Requirements:
     *
     * - the caller must have the ADD_AUTHORIZER_ROLE role.
     *
     * May emit a {AuthorizerAdded} event.
     */
    function addAuthorizer(uint256 authorizerId, Authorizer authorizer) external;
}
