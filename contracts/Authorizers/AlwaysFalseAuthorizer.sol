//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

contract AlwaysFalseAuthorizer is Authorizer {
    function isAuthorize(address sender, string memory domain) external pure returns (uint256) {
        return 0;
    }
}
