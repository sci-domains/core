// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {IVerifier} from './Verifiers/IVerifier.sol';
import {ISciRegistry} from './SciRegistry/ISciRegistry.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {Ownable2StepUpgradeable} from '@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol';

/**
 * @title SCI
 * @dev This contract facilitates interaction with the SCI protocol, offering a simplified interface
 * for apps and wallets. Apps and wallets can also directly interact with the
 * Registry and verifiers directly if desired, bypassing this contract.
 * @custom:security-contact security@sci.domains
 */
contract SCI is Initializable, Ownable2StepUpgradeable {
    ISciRegistry public registry;

    /**
     *  @dev Emitted when the Registry is changed.
     */
    event RegistrySet(address indexed oldRegistryAddress, address indexed newRegistryAddress);

    function initialize(address owner, address registryAddress) external initializer {
        __Ownable2Step_init();
        __Ownable_init(owner);
        setRegistry(registryAddress);
    }

    /**
     * @dev Returns info from the domain.
     *
     * @param domainHash The namehash of the domain.
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

    /**
     * @dev Same as isVerifiedForDomainHash but for multiple domains.
     *
     * @param domainHashes An array of domain hashes.
     * @param contractAddress The address of the contract is being verified.
     * @param chainId The id of the chain the contract is deployed in.
     * @return An array of bool indicating whether the contract address is
     * verified for each domain hash or not.
     *
     * Note: If there is no verifier set then it returns false for that `domainHash`.
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
     * @dev Returns if the `contractAddress` deployed in the chain with id `chainId` is verified.
     * to interact with the domain with namehash `domainHash`.
     * @param domainHash The namehash of the domain the contract is interacting with
     * @param contractAddress The address of the contract is being verified.
     * @param chainId The id of the chain the contract is deployed in.
     * @return A bool indicating whether the contract is verified or not.
     *
     * Note: If there is no verifier set then it returns false.
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
     * @dev Sets a new registry.
     *
     * @param newRegistry The address of the new SCI Registry.
     *
     * May emit a {RegistrySet} event.
     */
    function setRegistry(address newRegistry) public onlyOwner {
        address oldRegistryAddress = address(registry);
        registry = ISciRegistry(newRegistry);
        emit RegistrySet(oldRegistryAddress, newRegistry);
    }
}
