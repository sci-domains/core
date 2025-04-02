// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ISciRegistry} from '../SciRegistry/ISciRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {ICrossDomainMessanger} from '../Op//ICrossDomainMessanger.sol';

/**
 * @title SuperChainSourceRegistrar
 * @dev This abstract contract is designed to be inherited by registrar contracts that register domains on a superchain.
 * It provides functionality to register a domain on a different chain via the superchain cross-domain messaging.
 * 
 * @custom:security-contact security@sci.domains
*/
abstract contract SuperChainSourceRegistrar {
    // Cross-domain messenger contract for sending messages to the target chain.
    ICrossDomainMessanger public immutable crossDomainMessanger;
    // The address of the SuperChainTargetRegistrar on the target chain.
    address public targetRegistrar;

    // Gas limits for cross-domain messages on the target chain.
    uint32 public constant REGISTER_DOMAIN_GAS_LIMIT = 200000;
    uint32 public constant REGISTER_DOMAIN_WITH_VERIFIER_GAS_LIMIT = 300000;

    /**
     * @dev Initializes the contract by setting up the Cross domain messenger and the target registrar.
     * @param _crossDomainMessanger The address of the cross-domain messenger contract.
     * @param _targetRegistrar The address of the registrar contract on the target chain.
    */
    constructor(address _crossDomainMessanger, address _targetRegistrar) {
        crossDomainMessanger = ICrossDomainMessanger(_crossDomainMessanger);
        targetRegistrar = _targetRegistrar;
    }

    /**
     * @dev Registers a domain on the target registrar contract via cross-domain messaging.
     * @param owner Address expected to be the domain owner.
     * @param domainHash The namehash of the domain to be registered.
    */
    function _registerDomainCrossChain(address owner, bytes32 domainHash) internal {
        crossDomainMessanger.sendMessage(
            targetRegistrar,
            abi.encodeWithSelector(ISciRegistry.registerDomain.selector, owner, domainHash),
            REGISTER_DOMAIN_GAS_LIMIT
        );
    }

    /**
     * @dev Registers a domain with a verifier on the target registrar contract via cross-domain messaging.
     * @param owner Address expected to be the domain owner.
     * @param domainHash The namehash of the domain to be registered.
     * @param verifier The address of the verifier contract.
    */
    function _registerDomainWithVerifierCrossChain(
        address owner,
        bytes32 domainHash,
        IVerifier verifier
    ) internal {
        crossDomainMessanger.sendMessage(
            targetRegistrar,
            abi.encodeWithSelector(
                ISciRegistry.registerDomainWithVerifier.selector,
                owner,
                domainHash,
                verifier
            ),
            REGISTER_DOMAIN_WITH_VERIFIER_GAS_LIMIT
        );
    }
}
