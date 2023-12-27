//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Verifier.sol';
import '../Registry/Registry.sol';
import '../Utils/DomainManager.sol';

contract PublicListVerifier is Verifier, Context, DomainManager {
    uint256 immutable MAX_INT = 2 ** 256 - 1;

    // TODO: This should be private
    mapping(bytes32 => mapping(address => mapping(uint256 => bool))) public verifiedContracts;

    constructor(address _registry) DomainManager(_registry) {}

    function addAddresses(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) public onlyDomainOwner(domainHash) {
        verifiedContracts[domainHash][contractAddress][chainId] = true;
        // TODO: Add Event
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
