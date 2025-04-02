// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';
import {ICrossDomainMessanger} from './ICrossDomainMessanger.sol';

/**
 * @title SuperChainAccessControlDefaultAdminRules
 * @dev This contract extends the OpenZeppelin AccessControlDefaultAdminRules contract to include cross-chain role management. 
 * @custom:security-contact security@sci.domains
 */
contract SuperChainAccessControlDefaultAdminRules is AccessControlDefaultAdminRules {
    ICrossDomainMessanger public immutable crossDomainMessanger;

    /**
     * @dev Thrown when the caller is not the cross domain messanger.
     */
    error InvalidMessageSender(address account);

    /**
     * @dev Modifier that checks that an account on a source chain has a specific role.
     * Reverts with an {AccessControlUnauthorizedAccount} error including the required role.
     */
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

    /**
     * @param _crossDomainMessangerAddress Address of the cross-domain messenger contract.
     * @dev See {AccessControlDefaultAdminRules-constructor}.
    */ 
    constructor(
        address _crossDomainMessangerAddress,
        uint48 initialDelay,
        address initialDefaultAdmin
    ) AccessControlDefaultAdminRules(initialDelay, initialDefaultAdmin) {
        crossDomainMessanger = ICrossDomainMessanger(_crossDomainMessangerAddress);
    }
}
