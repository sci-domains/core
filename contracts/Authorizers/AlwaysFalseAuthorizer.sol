//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and always returns false.
 * This contract is meant to be used for testing purpose
 */
contract AlwaysFalseAuthorizer is Authorizer {
    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address sender, bytes32 domainHash) external pure returns (bool) {
        return false;
    }
}
