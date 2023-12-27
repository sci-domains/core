//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

contract AlwaysFalseAuthorizer is Authorizer {
    function isAuthorized(address sender, bytes32 domain) external pure returns (bool) {
        return false;
    }
}
