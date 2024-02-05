// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import './Verifiers/Verifier.sol';
import './Registry/IRegistry.sol';
import './Ens/NameHash.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract SCI is Initializable {
    IRegistry public registry;
    NameHash public nameHashUtils;

    function initialize(address registryAddress, address nameHashAddress) public initializer {
        registry = IRegistry(registryAddress);
        nameHashUtils = NameHash(nameHashAddress);
    }

    function domainOwner(bytes32 domainHash) public view returns (address) {
        return registry.domainOwner(domainHash);
    }

    function isVerifiedForDomainHash(
        bytes32 domainHash,
        address contractAddress,
        uint256 chainId
    ) public view returns (bool) {
        (, Verifier verifier) = registry.domainHashToRecord(domainHash);

        if (address(verifier) == address(0)) {
            return false;
        }

        return verifier.isVerified(domainHash, contractAddress, chainId);
    }

    function isVerifiedForMultipleDomainHashes(
        bytes32[] memory domainsHash,
        address contractAddress,
        uint256 chainId
    ) public view returns (bool[] memory) {
        bool[] memory domainsVerification = new bool[](domainsHash.length);
        for (uint256 i = 0; i < domainsHash.length; i++) {
            domainsVerification[i] = isVerifiedForDomainHash(
                domainsHash[i],
                contractAddress,
                chainId
            );
        }
        return domainsVerification;
    }

    function isVerifiedForMultipleDomains(
        string[] memory domains,
        address contractAddress,
        uint256 chainId
    ) public view returns (bool[] memory) {
        bool[] memory domainsVerification = new bool[](domains.length);
        for (uint256 i = 0; i < domains.length; i++) {
            domainsVerification[i] = isVerifiedForDomainHash(
                nameHashUtils.getDomainHash(domains[i]),
                contractAddress,
                chainId
            );
        }
        return domainsVerification;
    }

    function isVerifiedForDomain(
        string memory domain,
        address contractAddress,
        uint256 chainId
    ) public view returns (bool) {
        return
            isVerifiedForDomainHash(nameHashUtils.getDomainHash(domain), contractAddress, chainId);
    }
}
