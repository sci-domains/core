// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import '../Verifiers/Verifier.sol';
import '../Registry.sol';

contract VerifiedSolver {
    Registry registry;

    constructor(address registryAddress) {
        registry = Registry(registryAddress);
    }

    // ##################################
    // # Verification
    // ##################################
    // TODO: We should check that is a valid verifier
    function isVerified(
        string memory domain,
        uint256 chainId,
        address contractAddress
    ) public returns (bool) {
        // TODO: Improve gas, we are accessing multiple times to storage
        if (!registry.isDomainValid(domain)) return false;

        (, , Verifier verifier) = registry.domainToRecord(domain);

        return verifier.isVerified(domain, chainId, contractAddress);
    }

    function isVerifiedForMultipleDomains(
        string[] memory domains,
        uint256 chainId,
        address contractAddress
    ) public returns (bool[] memory) {
        bool[] memory domainsVerification;
        for (uint256 i; i < domains.length; i++) {
            domainsVerification[i] = this.isVerified(
                domains[i],
                chainId,
                contractAddress
            );
        }
        return domainsVerification;
    }
}
