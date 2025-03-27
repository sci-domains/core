// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import {ICrossDomainMessanger} from './ICrossDomainMessanger.sol';

contract SuperChainAccessControlDefaultAdminRules is AccessControlDefaultAdminRules {

    ICrossDomainMessanger public immutable crossDomainMessanger;

    modifier onlyCrossChainRole(bytes32 role) {
        require(msg.sender == address(crossDomainMessanger), 'SuperChainRegistrar: sender must be the OP Bridge');
        require(hasRole(role, crossDomainMessanger.xDomainMessageSender()), 'SuperChainRegistrar: cross domain sender must be an admin to grant');
        _;
    }

    constructor(
        address _crossDomainMessangerAddress,
        uint48 initialDelay,
        address initialDefaultAdmin
    ) AccessControlDefaultAdminRules(initialDelay, initialDefaultAdmin) {
        crossDomainMessanger = ICrossDomainMessanger(_crossDomainMessangerAddress);
    }

}