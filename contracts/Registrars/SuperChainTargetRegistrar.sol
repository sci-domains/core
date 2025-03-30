// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ISciRegistry} from '../SciRegistry/ISciRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {SuperChainAccessControlDefaultAdminRules} from '../Op/SuperChainAccessControlDefaultAdminRules.sol';

contract SuperChainTargetRegistrar is SuperChainAccessControlDefaultAdminRules {
    // Role that allows registering domains
    bytes32 public constant REGISTER_DOMAIN_ROLE = keccak256('REGISTER_DOMAIN_ROLE');

    ISciRegistry public immutable registry;

    /**
     * @dev Initializes the contract by setting up the SCI Registry reference and defining the admin rules.
     * @param _sciRegistryAddress Address of the custom domain registry contract.
     * @param _crossDomainMessangerAddress TODO.
     * @param initialDelay The {defaultAdminDelay}. See AccessControlDefaultAdminRules for more information.
     */
    constructor(
        address _sciRegistryAddress,
        address _crossDomainMessangerAddress,
        uint48 initialDelay
    )
        SuperChainAccessControlDefaultAdminRules(
            _crossDomainMessangerAddress,
            initialDelay,
            msg.sender
        )
    {
        registry = ISciRegistry(_sciRegistryAddress);
    }

    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external onlyCrossChainRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomain(owner, domainHash);
    }

    function registerDomainWithVerifier(
        address owner,
        bytes32 domainHash,
        IVerifier verifier
    ) external onlyCrossChainRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomainWithVerifier(owner, domainHash, verifier);
    }
}
