// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import '../Registry/Registry.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

// TODO: This should be an abstract contract
contract DomainManager is Context {
    Registry public registry;

    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    // ##################################
    // # Constructor
    // ##################################
    constructor(address _registry) {
        registry = Registry(_registry);
    }

    // ##################################
    // # Modifiers
    // ##################################
    modifier onlyDomainOwner(bytes32 domainHash) {
        _checkDomainOwner(domainHash);
        _;
    }

    function _checkDomainOwner(bytes32 domainHash) internal {
        if (registry.domainOwner(domainHash) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domainHash);
        }
    }
}
