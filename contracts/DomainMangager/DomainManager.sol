// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {IRegistry} from '../Registry/IRegistry.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

/**
 * @title DomainManager
 * @dev Contract module that implement access.
 * control only to owners of a domain.
 * @custom:security-contact security@sci.domains
 */
abstract contract DomainManager is Context {
    IRegistry public immutable registry;

    /**
     * @dev Thrown when the account is not the owner of the SCI domain hash.
     */
    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    /**
     * @dev Initializes the contract with references to the SCI Registry.
     * @param _sciRegistryAddress Address of the SCI Registry contract.
     */
    constructor(address _sciRegistryAddress) {
        registry = IRegistry(_sciRegistryAddress);
    }

    /**
     * @dev Modifier that checks if the provided address is the owner of the SCI domain.
     * 
     * Note: Reverts with `AccountIsNotDomainOwner` error if the check fails.
     */
    modifier onlyDomainOwner(bytes32 domainHash) {
        _checkDomainOwner(domainHash);
        _;
    }

    /**
     * @dev Reverts with an {AccountIsNotDomainOwner} error if `_msgSender()`
     * is not the owner of the domain.
     * Overriding this function changes the behavior of the {onlyDomainOwner} modifier.
     */
    function _checkDomainOwner(bytes32 domainHash) private view {
        if (registry.domainOwner(domainHash) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domainHash);
        }
    }
}
