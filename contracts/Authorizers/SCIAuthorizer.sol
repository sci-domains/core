//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';
import {AccessControlDefaultAdminRules} from '@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol';

contract SCIAuthorizer is Authorizer, AccessControlDefaultAdminRules {
    bytes32 public constant IS_AUTHORIZED = keccak256('IS_AUTHORIZED');

    constructor() AccessControlDefaultAdminRules(0, _msgSender()) {}

    function isAuthorized(address sender, bytes32 domain) external view returns (bool) {
        return hasRole(IS_AUTHORIZED, sender);
    }
}
