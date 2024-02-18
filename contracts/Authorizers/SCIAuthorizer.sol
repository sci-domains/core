//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';

/**
 * @dev This contract implements the Authorizer interface
 * and validates that the sender has the IS_AUTHORIZED role.
 *
 * This contract is meant to be use in a test chain for testing.
 */
contract SCIAuthorizer is Authorizer, AccessControlDefaultAdminRules {
    bytes32 public constant IS_AUTHORIZED = keccak256('IS_AUTHORIZED');

    constructor() AccessControlDefaultAdminRules(0, _msgSender()) {}

    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address sender, bytes32) external view returns (bool) {
        return hasRole(IS_AUTHORIZED, sender);
    }
}
