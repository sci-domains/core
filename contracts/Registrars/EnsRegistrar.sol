// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {ENS} from '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import {IRegistry} from '../Registry/IRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {INameHash} from '../NameHash/INameHash.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

// TODO: Update the documentation 
contract EnsRegistrar is Context  {
    ENS public immutable ensRegistry;
    IRegistry public immutable registry;
    INameHash public immutable nameHashUtils;

    error AccountIsNotEnsOwner(address sender, bytes32 domainHash);

    constructor(address _ensRegistryAddress, address _sciRegistryAddress, address _nameHashAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
        registry = IRegistry(_sciRegistryAddress);
        nameHashUtils = INameHash(_nameHashAddress);
    }

    modifier onlyEnsOwner(bytes32 domainHash, address owner) {
        _checkEnsOwner(domainHash, owner);
        _;
    }

    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external onlyEnsOwner(domainHash, owner) {
        registry.registerDomain(owner, domainHash);
    }

    function registerDomainWithVerifier(
        bytes32 domainHash,
        IVerifier verifier
    ) external onlyEnsOwner(domainHash, _msgSender()) {
        registry.registerDomainWithVerifier(_msgSender(), domainHash, verifier);
    }

    function _checkEnsOwner(bytes32 domainHash, address owner) private view {
        if (ensRegistry.owner(domainHash) != owner) {
            revert AccountIsNotEnsOwner(owner, domainHash);
        }
    }
}
