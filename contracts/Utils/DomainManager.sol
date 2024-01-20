// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import '../SCI.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

// TODO: This should be an abstract contract
contract DomainManager is Context {
    SCI public sci;

    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    // ##################################
    // # Constructor
    // ##################################
    constructor(address _sciAddress) {
        sci = SCI(_sciAddress);
    }

    // ##################################
    // # Modifiers
    // ##################################
    modifier onlyDomainOwner(bytes32 domainHash) {
        _checkDomainOwner(domainHash);
        _;
    }

    function _checkDomainOwner(bytes32 domainHash) internal view {
        if (sci.domainOwner(domainHash) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domainHash);
        }
    }
}
