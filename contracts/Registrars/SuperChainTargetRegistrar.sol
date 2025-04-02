// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ISciRegistry} from '../SciRegistry/ISciRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {SuperChainAccessControlDefaultAdminRules} from '../Op/SuperChainAccessControlDefaultAdminRules.sol';

/**
 * @title SuperChainTargetRegistrar
 * @dev This contract allows addresses from the source chain with REGISTER_DOMAIN_ROLE role to register a domain.
 * It uses the superchain cross-domain messaging to "listen" for domain registration requests from the source chain.
 * 
 * @custom:security-contact security@sci.domains
*/
contract SuperChainTargetRegistrar is SuperChainAccessControlDefaultAdminRules {
    // Role that allows registering domains
    bytes32 public constant REGISTER_DOMAIN_ROLE = keccak256('REGISTER_DOMAIN_ROLE');

    ISciRegistry public immutable registry;

    /**
     * @dev Initializes the contract by setting up the SCI Registry reference and defining the admin rules.
     * @param _sciRegistry Address of the custom domain registry contract.
     * @param _crossDomainMessanger Address of the cross-domain messenger contract.
     * @param initialDelay The {defaultAdminDelay}. See AccessControlDefaultAdminRules for more information.
     */
    constructor(
        address _sciRegistry,
        address _crossDomainMessanger,
        uint48 initialDelay
    )
        SuperChainAccessControlDefaultAdminRules(
            _crossDomainMessanger,
            initialDelay,
            msg.sender
        )
    {
        registry = ISciRegistry(_sciRegistry);
    }

    /**
     * @dev Registers a domain in the SCI Registry contract.
     * @param owner Address expected to be the domain owner.
     * @param domainHash The namehash of the domain to be registered.
     *
     * Requirements:
     *
     * - The xDomainMessageSender must have the REGISTER_DOMAIN_ROLE role.
     * - The caller must be the superchain cross domain messanger
     */
    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external onlyCrossChainRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomain(owner, domainHash);
    }

    /**
     * @dev Registers a domain with a verifier in the SCI Registry contract.
     * @param owner Address expected to be the domain owner.
     * @param domainHash The namehash of the domain to be registered.
     * @param verifier Address of the verifier contract.
     *
     * Requirements:
     *
     * - The xDomainMessageSender must have the REGISTER_DOMAIN_ROLE role.
     * - The caller must be the superchain cross domain messanger
     */
    function registerDomainWithVerifier(
        address owner,
        bytes32 domainHash,
        IVerifier verifier
    ) external onlyCrossChainRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomainWithVerifier(owner, domainHash, verifier);
    }
}
