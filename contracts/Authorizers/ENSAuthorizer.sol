//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and validates that the sender is
 * the owner of the ENS domain using the ENS IRegistry.sol.
 */
contract ENSAuthorizer is Authorizer {
    ENS public ensRegistry;

    constructor(address _ensRegistryAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
    }

    /**
     * @dev See {Authorizer-version}.
     */
    function isAuthorized(address sender, bytes32 domainHash) external view returns (bool) {
        address owner = ensRegistry.owner(domainHash);
        return (owner == sender);
    }
}
