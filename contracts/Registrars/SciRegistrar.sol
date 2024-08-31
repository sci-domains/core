// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import {IRegistry} from '../Registry/IRegistry.sol';
import {IVerifier} from '../Verifiers/IVerifier.sol';

// TODO: Update documentation on the hole contract

contract SciRegistrar is AccessControlDefaultAdminRules {
    bytes32 public constant REGISTER_DOMAIN_ROLE = keccak256('REGISTER_DOMAIN_ROLE');
    IRegistry public immutable registry;

    constructor(address _sciRegistryAddress) AccessControlDefaultAdminRules(0, _msgSender()) {
        registry = IRegistry(_sciRegistryAddress);
    }

    function registerDomain(
        address owner,
        bytes32 domainHash
    ) external onlyRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomain(owner, domainHash);
    }

    function registerDomainWithVerifier(
        bytes32 domainHash,
        IVerifier verifier
    ) external onlyRole(REGISTER_DOMAIN_ROLE) {
        registry.registerDomainWithVerifier(_msgSender(), domainHash, verifier);
    }
}
