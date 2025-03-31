// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ISciRegistry} from '../SciRegistry/ISciRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';
import {ICrossDomainMessanger} from '../Op//ICrossDomainMessanger.sol';

abstract contract SuperChainSourceRegistrar {
    ICrossDomainMessanger public immutable crossDomainMessanger;
    address public targetRegistrar;

    uint32 public constant REGISTER_DOMAIN_GAS_LIMIT = 200000;
    uint32 public constant REGISTER_DOMAIN_WITH_VERIFIER_GAS_LIMIT = 300000;

    constructor(address _crossDomainMessanger, address _targetRegistrar) {
        crossDomainMessanger = ICrossDomainMessanger(_crossDomainMessanger);
        targetRegistrar = _targetRegistrar;
    }

    function _registerDomainCrossChain(address owner, bytes32 domainHash) internal {
        crossDomainMessanger.sendMessage(
            targetRegistrar,
            abi.encodeWithSelector(ISciRegistry.registerDomain.selector, owner, domainHash),
            REGISTER_DOMAIN_GAS_LIMIT
        );
    }

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
