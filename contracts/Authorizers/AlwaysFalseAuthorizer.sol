// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and always returns false.
 * This contract is meant to be used for testing only.
 * @custom:security-contact security@sci.domains
 */
contract AlwaysFalseAuthorizer is Authorizer {
    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address, bytes32) external pure returns (bool) {
        return false;
    }
}
