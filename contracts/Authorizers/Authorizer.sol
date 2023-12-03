//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface Authorizer {
    // TODO: Add docs
    function isAuthorize(address sender, string memory domain) external returns (uint256);
}
