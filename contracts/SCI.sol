// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import './Verifiers/Verifier.sol';
import './Registry/Registry.sol';

contract SCI {
    Registry registry;

    constructor(address registryAddress) {
        registry = Registry(registryAddress);
    }

    function isVerifiedForDomainHash(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) public returns (bool) {
        (, Verifier verifier) = registry.domainHashToRecord(domainHash);

        return verifier.isVerified(domainHash, chainId, contractAddress);
    }

    function isVerifiedForMultipleDomainHashes(
        bytes32[] memory domainsHash,
        uint256 chainId,
        address contractAddress
    ) public returns (bool[] memory) {
        bool[] memory domainsVerification;
        for (uint256 i; i < domainsHash.length; i++) {
            domainsVerification[i] = this.isVerifiedForDomainHash(
                domainsHash[i],
                chainId,
                contractAddress
            );
        }
        return domainsVerification;
    }
}
