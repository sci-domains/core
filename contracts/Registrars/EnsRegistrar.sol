// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {ENS} from '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import {IRegistry} from '../Registry/IRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

/**
 * @title EnsRegistrar
 * @dev This contract allows owners of an ENS (Ethereum Name Service) domain to register it
 * in the SCI Registry contract. 
 * The contract ensures that only the legitimate ENS owner can register a domain 
 * by verifying the domain ownership through the ENS contract.
 * @custom:security-contact security@sci.domains
 */
contract EnsRegistrar is Context  {
    ENS public immutable ensRegistry;
    IRegistry public immutable registry;

    /**
     * @dev Thrown when the `account` is not the owner of the ENS `domainhash`.
     */
    error AccountIsNotEnsOwner(address account, bytes32 domainHash);

    /**
     * @dev Initializes the contract with references to the ENS and the SCI Registry.
     * @param _ensRegistryAddress Address of the ENS Registry contract.
     * @param _sciRegistryAddress Address of the SCI Registry contract.
     */
    constructor(address _ensRegistryAddress, address _sciRegistryAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
        registry = IRegistry(_sciRegistryAddress);
    }

    /**
     * @dev Modifier that checks if the provided `account` is the owner of the `domainhash`.
     * @param account Address expected to be the domain owner.
     * @param domainHash Namehash of the domain.
     * 
     * Note: Reverts with `AccountIsNotEnsOwner` error if the check fails.
     */
    modifier onlyEnsOwner(address account, bytes32 domainHash) {
        _checkEnsOwner(account, domainHash);
        _;
    }

    /**
     * @dev Registers a domain in the SCI Registry contract.
     * @param owner Address of the domain owner.
     * @param domainHash Namehash of domain.
     *
     * Requirements:
     *
     * - The owner must be the ENS owner of the domainHash.
     */
    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external onlyEnsOwner(owner, domainHash) {
        registry.registerDomain(owner, domainHash);
    }

    /**
     * @dev Registers a domain with a verifier in the SCI Registry contract.
     * @param domainHash Namehash of the domain.
     * @param verifier Address of the verifier contract.
     *
     * Requirements:
     *
     * - The caller must be the ENS owner of the domainHash.
     */
    function registerDomainWithVerifier(
        bytes32 domainHash,
        IVerifier verifier
    ) external onlyEnsOwner(_msgSender(), domainHash) {
        registry.registerDomainWithVerifier(_msgSender(), domainHash, verifier);
    }

    /**
     * @dev Private helper function to check if the specified address owns the ENS domain.
     * @param account Address expected to be the domain owner.
     * @param domainHash Namehash of the domain.
     * 
     * Note: Reverts with `AccountIsNotEnsOwner` error if the address is not the owner of the ENS domain.
     */
    function _checkEnsOwner(address account, bytes32 domainHash) private view {
        if (ensRegistry.owner(domainHash) != account) {
            revert AccountIsNotEnsOwner(account, domainHash);
        }
    }
}
