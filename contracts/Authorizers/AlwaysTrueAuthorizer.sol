//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

contract AlwaysTrueAuthorizer is Authorizer {
    uint256 public ttl;

    function setTtl(uint256 newTtl) public {
        ttl = newTtl;
    }

    function isAuthorize(
        address sender,
        string memory domain
    ) external returns (uint256) {
        return block.timestamp + ttl;
    }
}
