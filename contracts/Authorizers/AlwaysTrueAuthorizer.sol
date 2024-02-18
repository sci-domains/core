//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and always returns true.
 * This contract is meant to be used for testing only.
 */
contract AlwaysTrueAuthorizer is Authorizer {
    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address, bytes32) external pure returns (bool) {
        return true;
    }
}
