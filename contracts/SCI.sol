// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {IVerifier} from './Verifiers/IVerifier.sol';
import {IRegistry} from './Registry/IRegistry.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {Ownable2StepUpgradeable} from '@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol';

/**
 * @custom:security-contact security@sci.domains
 */
contract SCI is Initializable, Ownable2StepUpgradeable {
    IRegistry public registry;

    function initialize(
        address owner,
        address registryAddress
    ) external initializer {
        registry = IRegistry(registryAddress);
        __Ownable2Step_init();
        __Ownable_init(owner);
    }

    /**
     * @dev Returns the owner of the domainHash.
     * @param domainHash The name hash of the domain.
     * @return the address of the owner or the ZERO_ADDRESS if the domain is not registered.
     */
    function domainOwner(bytes32 domainHash) public view returns (address) {
        return registry.domainOwner(domainHash);
    }

    /**
     * @dev Returns if the `contractAddress` deployed in the chain with id `chainId` is verified.
     * to interact with the domain with name hash `domainHash`.
     * @param domainHash The name hash of the domain the contract is interacting with
     * @param contractAddress The address of the contract is being verified.
     * @param chainId The id of the chain the contract is deployed in.
     * @return a bool indicating whether the contract is verified or not.
     *
     * NOTE: If there is no verifier set then it returns false.
     */
    function isVerifiedForDomainHash(
        bytes32 domainHash,
        address contractAddress,
        uint256 chainId
    ) public view returns (bool) {
        (, IVerifier verifier, , ) = registry.domainHashToRecord(domainHash);

        if (address(verifier) == address(0)) {
            return false;
        }

        return verifier.isVerified(domainHash, contractAddress, chainId);
    }

    /**
     * @dev Same as isVerifiedForDomainHash but for multiple domains.
     * This is useful to check for subdomains and wildcard verification.
     * For example: subdomain.example.com and *.example.com.
     *
     * @param domainHashes An array of domain hashes.
     * @param contractAddress The address of the contract is being verified.
     * @param chainId The id of the chain the contract is deployed in.
     * @return an array of bool indicating whether the contract address is
     * verified for each domain hash or not.
     *
     * NOTE: If there is no verifier set then it returns false for that `domainHash`.
     */
    function isVerifiedForMultipleDomainHashes(
        bytes32[] memory domainHashes,
        address contractAddress,
        uint256 chainId
    ) external view returns (bool[] memory) {
        bool[] memory domainsVerification = new bool[](domainHashes.length);
        uint256 domainHashesLength = domainHashes.length;
        for (uint256 i; i < domainHashesLength; ) {
            domainsVerification[i] = isVerifiedForDomainHash(
                domainHashes[i],
                contractAddress,
                chainId
            );
            unchecked {
                ++i;
            }
        }
        return domainsVerification;
    }

    /**
     * @dev Returns info from the domain
     *
     * @param domainHash The name hash of the domain
     */
    function domainHashToRecord(
        bytes32 domainHash
    )
        external
        view
        returns (
            address owner,
            IVerifier verifier,
            uint256 lastOwnerSetTime,
            uint256 lastVerifierSetTime
        )
    {
        return registry.domainHashToRecord(domainHash);
    }

    function setRegistry(address newRegistry) public onlyOwner {
        registry = IRegistry(newRegistry);
    }
}
