//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Verifier.sol';
import '../Registry/Registry.sol';
import '../Utils/DomainManager.sol';

contract PublicListVerifier is Verifier, Context, DomainManager {
    uint256 constant MAX_INT = 2 ** 256 - 1;

    event AddressRemoved(
        bytes32 indexed domainHash,
        uint256 indexed chainId,
        address indexed contractAddress,
        address msgSender
    );
    event AddressAdded(
        bytes32 indexed domainHash,
        uint256 indexed chainId,
        address indexed contractAddress,
        address msgSender
    );

    mapping(bytes32 => mapping(address => mapping(uint256 => bool))) public verifiedContracts;

    constructor(address _registry) DomainManager(_registry) {}

    function addAddress(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) public onlyDomainOwner(domainHash) {
        verifiedContracts[domainHash][contractAddress][chainId] = true;
        emit AddressAdded(domainHash, chainId, contractAddress, _msgSender());
    }

    function removeAddress(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) public onlyDomainOwner(domainHash) {
        verifiedContracts[domainHash][contractAddress][chainId] = false;
        emit AddressRemoved(domainHash, chainId, contractAddress, _msgSender());
    }

    function isVerified(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) public view returns (bool) {
        return
            verifiedContracts[domainHash][contractAddress][chainId] ||
            verifiedContracts[domainHash][contractAddress][MAX_INT];
    }
}
