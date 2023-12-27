//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface Authorizer {
    function isAuthorized(address sender, bytes32 domain) external returns (bool);
}
