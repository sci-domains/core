// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {Authorizer} from './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and always returns true.
 * This contract is meant to be used for testing only.
 * @custom:security-contact security@sci.domains
 */
contract AlwaysTrueAuthorizer is Authorizer {
    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address, bytes32) external pure returns (bool) {
        return true;
    }
}
