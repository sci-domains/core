// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import './Verifiers/Verifier.sol';
import './Registry/Registry.sol';

contract SCI {
    Registry registry;

    constructor(address registryAddress) {
        registry = Registry(registryAddress);
    }

    // ##################################
    // # Verification
    // ##################################
    function isVerified(
        bytes32 domain,
        uint256 chainId,
        address contractAddress
    ) public returns (bool) {
        (, Verifier verifier) = registry.domainHashToRecord(domain);

        return verifier.isVerified(domain, chainId, contractAddress);
    }

    function isVerifiedForMultipleDomains(
        bytes32[] memory domains,
        uint256 chainId,
        address contractAddress
    ) public returns (bool[] memory) {
        bool[] memory domainsVerification;
        for (uint256 i; i < domains.length; i++) {
            domainsVerification[i] = this.isVerified(domains[i], chainId, contractAddress);
        }
        return domainsVerification;
    }
}
