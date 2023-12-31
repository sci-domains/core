// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import './Verifiers/Verifier.sol';
import './Registry/Registry.sol';
import './Utils/NameHash.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract SCI is Initializable {
    Registry public registry;
    NameHash public nameHashUtils;

    function initialize(address registryAddress, address nameHashAddress) public initializer {
        registry = Registry(registryAddress);
        nameHashUtils = NameHash(nameHashAddress);
    }

    function domainOwner(bytes32 domainHash) public view returns (address) {
        return registry.domainOwner(domainHash);
    }

    function registerDomainWithTrustedVerifier(
        uint256 authorizer,
        address owner,
        string memory domain,
        bool isWildcard,
        uint256 trustedVerifier
    ) external {
        registry.registerDomainWithTrustedVerifier(
            authorizer,
            owner,
            domain,
            isWildcard,
            trustedVerifier
        );
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
            domainsVerification[i] = isVerifiedForDomainHash(
                domainsHash[i],
                chainId,
                contractAddress
            );
        }
        return domainsVerification;
    }

    function isVerifiedForMultipleDomains(
        string[] memory domains,
        uint256 chainId,
        address contractAddress
    ) public returns (bool[] memory) {
        bool[] memory domainsVerification;
        for (uint256 i; i < domains.length; i++) {
            domainsVerification[i] = isVerifiedForDomainHash(
                nameHashUtils.getDomainHash(domains[i]),
                chainId,
                contractAddress
            );
        }
        return domainsVerification;
    }

    function isVerifiedForDomain(
        string memory domain,
        uint256 chainId,
        address contractAddress
    ) public returns (bool) {
        return
            isVerifiedForDomainHash(
                nameHashUtils.getDomainHash(domains[i]),
                chainId,
                contractAddress
            );
    }
}
