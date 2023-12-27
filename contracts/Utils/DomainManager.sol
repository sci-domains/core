// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import '../Registry/Registry.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

contract DomainManager is Context {
    Registry public registry;

    error AccountIsNotDomainOwner(address account, bytes32 domain);

    // ##################################
    // # Constructor
    // ##################################
    constructor(address _registry) {
        registry = Registry(_registry);
    }

    // ##################################
    // # Modifiers
    // ##################################
    // TODO: This should be an abstract contract
    modifier onlyDomainOwner(bytes32 domain) {
        _checkDomainOwner(domain);
        _;
    }

    // TODO: This should be an abstract contract
    function _checkDomainOwner(bytes32 domain) internal {
        if (registry.domainOwner(domain) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domain);
        }
    }
}
