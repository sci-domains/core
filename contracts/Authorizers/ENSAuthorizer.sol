// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {ENS} from '@ensdomains/ens-contracts/contracts/registry/ENS.sol';
import {Authorizer} from './Authorizer.sol';

/**
 * @dev This contract implements the Authorizer interface and validates that the sender is
 * the owner of the ENS domain using the ENS IRegistry.sol.
 * @custom:security-contact security@sci.domains
 */
contract ENSAuthorizer is Authorizer {
    ENS public immutable ensRegistry;

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
