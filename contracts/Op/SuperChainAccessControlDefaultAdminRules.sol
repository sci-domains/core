// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import {ICrossDomainMessanger} from './ICrossDomainMessanger.sol';

contract SuperChainAccessControlDefaultAdminRules is AccessControlDefaultAdminRules {
    ICrossDomainMessanger public immutable crossDomainMessanger;

    error InvalidMessageSender(address account);

    modifier onlyCrossChainRole(bytes32 role) {
        if (msg.sender != address(crossDomainMessanger)) {
            revert InvalidMessageSender(msg.sender);
        }

        address account = crossDomainMessanger.xDomainMessageSender();
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
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
