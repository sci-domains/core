//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import './Authorizer.sol';

contract ENSAuthorizer is Authorizer {
    ENS public ensRegistry;

    constructor(address _ensRegistryAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
    }

    /**
    * @dev Validates if an address is authorized to register a domain.
        This function returns always false
     * @param sender The address trying to register the domain.
     * @param domain The name hash of the domain.
     * @return false
     */
    function isAuthorized(address sender, bytes32 domain) external view returns (bool) {
        address owner = ensRegistry.owner(domain);
        return (owner == sender);
    }
}
