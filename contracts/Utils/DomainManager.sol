// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "../Registry.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

contract DomainManager is Context {
    Registry public registry;

    error AccountIsNotDomainOwner(address account, string domain);

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
    modifier onlyDomainOwner(string memory domain) {
        _checkDomainOwner(domain);
        _;
    }

    // TODO: This should be an abstract contract
    function _checkDomainOwner(string memory domain) internal {
        if(registry.domainOwner(domain) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domain);
        }
    }

}
