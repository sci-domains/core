// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {Verifier} from './Verifier.sol';
import {DomainManager} from '../DomainMangager/DomainManager.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';

/**
 * @dev This contract implements the Verifier interface.
 * Domain owners can add or remove addresses that can interact within their domain.
 *
 * If the owner of the domain sets a contract address with MAX_INT as chain id then it assumes
 * this contract is verified for all chains for that domain.
 * @custom:security-contact security@sci.domains
 */
contract PublicListVerifier is Verifier, Context, DomainManager {
    uint256 private constant MAX_INT = 2 ** 256 - 1;

    // Domain hash -> contract address -> chain id -> true/false.
    mapping(bytes32 domainHash => mapping(address contractAddress => mapping(uint256 chainId => bool exists)))
        public verifiedContracts;

    /**
     *  @dev Emitted when the `msgSender` removes an address to a `domainHash` for a `chainId`
     */
    event AddressRemoved(
        bytes32 indexed domainHash,
        uint256 indexed chainId,
        address indexed contractAddress,
        address msgSender
    );

    /**
     *  @dev Emitted when the `msgSender` adds an address to a `domainHash` for a `chainId`
     */
    event AddressAdded(
        bytes32 indexed domainHash,
        uint256 indexed chainId,
        address indexed contractAddress,
        address msgSender
    );

    constructor(address _registry) DomainManager(_registry) {}

    /**
     * @dev
     *
     * Requirements:
     *
     * - The message sender must be the owner of the domain.
     */
    function addAddresses(
        bytes32 domainHash,
        address[] calldata contractAddresses,
        uint256[][] calldata chainIds
    ) external onlyDomainOwner(domainHash) {
        for (uint256 i; i < contractAddresses.length; ) {
            for (uint256 j; j < chainIds[i].length; ) {
                verifiedContracts[domainHash][contractAddresses[i]][chainIds[i][j]] = true;
                emit AddressAdded(domainHash, chainIds[i][j], contractAddresses[i], _msgSender());
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - The message sender must be the owner of the domain.
     */
    function removeAddresses(
        bytes32 domainHash,
        address[] calldata contractAddresses,
        uint256[][] calldata chainIds
    ) external onlyDomainOwner(domainHash) {
        for (uint256 i; i < contractAddresses.length; ) {
            for (uint256 j; j < chainIds[i].length; ++j) {
                verifiedContracts[domainHash][contractAddresses[i]][chainIds[i][j]] = false;
                emit AddressRemoved(domainHash, chainIds[i][j], contractAddresses[i], _msgSender());
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev See {Verifier-version}.
     */
    function isVerified(
        bytes32 domainHash,
        address contractAddress,
        uint256 chainId
    ) external view returns (bool) {
        return
            verifiedContracts[domainHash][contractAddress][chainId] ||
            verifiedContracts[domainHash][contractAddress][MAX_INT];
    }
}
