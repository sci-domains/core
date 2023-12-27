//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Verifier.sol';
import '../Registry/Registry.sol';
import '../Utils/DomainManager.sol';

contract PublicListVerifier is Verifier, Context, DomainManager {
    uint256 immutable MAX_INT = 2 ** 256 - 1;

    // ##################################
    // # Variables
    // ##################################
    // TODO: This should be private
    mapping(bytes32 => mapping(address => mapping(uint256 => bool))) public verifiedContracts;

    // ##################################
    // # Constructor
    // ##################################
    constructor(address _registry) DomainManager(_registry) {}

    function addAddresses(
        bytes32 domain,
        uint256 chainId,
        address contractAddress
    ) public onlyDomainOwner(domain) {
        verifiedContracts[domain][contractAddress][chainId] = true;
    }

    function isVerified(
        bytes32 domain,
        uint256 chainId,
        address contractAddress
    ) public returns (bool) {
        return
            verifiedContracts[domain][contractAddress][chainId] ||
            verifiedContracts[domain][contractAddress][MAX_INT];
    }
}
