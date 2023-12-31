//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import './Authorizer.sol';

contract AlwaysFalseAuthorizer is Authorizer {
    /**
     * @dev Validates if an address is authorized to register a domain.
        This function returns always false
     * @param sender The address trying to register the domain.
     * @param domain The name hash of the domain.
     * @return false
     */
    function isAuthorized(address sender, bytes32 domain) external pure returns (bool) {
        return false;
    }
}
