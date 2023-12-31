//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import './Authorizer.sol';

contract ENSAuthorizer is Authorizer {
    ENS public ensRegistry;

    constructor(address _ensRegistryAddress) {
        ensRegistry = ENS(_ensRegistryAddress);
    }

    function isAuthorized(address sender, bytes32 domain) external view returns (bool) {
        address owner = ensRegistry.owner(domain);
        return (owner == sender);
    }
}
