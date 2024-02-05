//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @dev Required interface of an Authorizer compliant contract for the SCI IRegistry.sol
 */
interface Authorizer {
    /**
     * @dev Validates if an address is authorized to register a domain.
     * @param sender The address trying to register the domain.
     * @param domainHash The name hash of the domain.
     * @return a bool indicating if the sender is authorizer or not
     */
    function isAuthorized(address sender, bytes32 domainHash) external returns (bool);
}
