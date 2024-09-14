// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.26;

import {IRegistry} from '../Registry/IRegistry.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

/**
 * @dev Contract module that allows children to implement access
 * control only to owners of a domain.
 * @custom:security-contact security@sci.domains
 */
abstract contract DomainManager is Context {
    IRegistry public immutable registry;

    /**
     * @dev The caller account is not the owner of the domain.
     */
    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    /**
     * @dev Initializes the contract setting the address
     * provided by the deployer as the SCI contract.
     */
    constructor(address _sciAddress) {
        registry = IRegistry(_sciAddress);
    }

    /**
     * @dev Modifier that checks that only the owner of the domain hash is able to call
     * the function.
     * Reverts with an {AccountIsNotDomainOwner} error including the account
     * and the domain hash.
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
