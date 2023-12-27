//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

contract AlwaysTrueAuthorizer is Authorizer {
    function isAuthorized(address sender, bytes32 domain) external view returns (bool) {
        return true;
    }
}
