// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '../Authorizers/Authorizer.sol';
import '../Verifiers/Verifier.sol';

interface IRegistry {
    event DomainRegistered(
        uint256 indexed authorizer,
        address indexed owner,
        bytes32 indexed domainHash,
        string domain
    );
    event VerifierAdded(address indexed owner, bytes32 domainHash, Verifier indexed verifier);
    event AuthorizerAdded(uint256 indexed authorizerId, Authorizer authorizer, address msgSender);
    event TrustedVerifierAdded(uint256 indexed verifierId, Verifier verifier, address msgSender);

    error AccountIsNotAuthorizeToRegisterDomain(address account, bytes32 domainHash);
    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    function domainHashToRecord(
        bytes32 domainHash
    ) external view returns (address owner, Verifier verifier);

    function registerDomain(
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard
    ) external;

    function registerDomainWithVerifier(
        uint256 authorizer,
        string memory domain,
        bool isWildcard,
        Verifier verifier
    ) external;

    function isDomainOwner(bytes32 domainHash, address account) external view returns (bool);

    function domainOwner(bytes32 domainHash) external view returns (address);

    function addVerifier(bytes32 domainHash, Verifier verifier) external;

    function domainVerifier(bytes32 domainHash) external view returns (Verifier);

    function addAuthorizer(uint256 authorizerId, Authorizer authorizer) external;
}
