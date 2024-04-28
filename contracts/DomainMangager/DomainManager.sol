// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.20;

import '../SCI.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

/**
 * @dev Contract module that allows children to implement access
 * control only to owners of a domain.
 *
 */
abstract contract DomainManager is Context {
    SCI public immutable sci;

    /**
     * @dev The caller account is not the owner of the domain.
     */
    error AccountIsNotDomainOwner(address account, bytes32 domainHash);

    /**
     * @dev Initializes the contract setting the address
     * provided by the deployer as the SCI contract.
     */
    constructor(address _sciAddress) {
        sci = SCI(_sciAddress);
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
    function _checkDomainOwner(bytes32 domainHash) internal view virtual {
        if (sci.domainOwner(domainHash) != _msgSender()) {
            revert AccountIsNotDomainOwner(_msgSender(), domainHash);
        }
    }
}
