// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {IVerifier} from './IVerifier.sol';
import {DomainManager} from '../DomainMangager/DomainManager.sol';

/**
 * @title ExplorerVerifier
 * @dev Verifies any contract on whitelisted chains for a domain.
 * If a chainId is allowed for a domain, any contract is considered verified.
 * @custom:security-contact security@sci.domains
 */
contract ExplorerVerifier is IVerifier, DomainManager {
    mapping(bytes32 domainHash => mapping(uint256 chainId => uint256 timestamp))
        public allowedChains;

    /**
     *  @dev Emitted when the `msgSender` adds a chain to a `domainHash`.
     */
    event ChainAdded(bytes32 indexed domainHash, uint256 indexed chainId, address indexed sender);

    /**
     *  @dev Emitted when the `msgSender` adds a chain to a `domainHash`.
     */
    event ChainRemoved(bytes32 indexed domainHash, uint256 indexed chainId, address indexed sender);

    constructor(address _registry) DomainManager(_registry) {}

    /**
     * @notice Allows a chain for a given domain. Any contract on this chain will be considered verified.
     * @param domainHash The domain identifier
     * @param chainIds Array of chain IDs to allow
     *
     * Requirements:
     *
     * - The caller must be the owner of the domain.
     */
    function addChains(
        bytes32 domainHash,
        uint256[] calldata chainIds
    ) external onlyDomainOwner(msg.sender, domainHash) {
        for (uint256 i = 0; i < chainIds.length; ) {
            allowedChains[domainHash][chainIds[i]] = block.timestamp;
            emit ChainAdded(domainHash, chainIds[i], msg.sender);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Removes allowed chains from a domain.
     *
     * Requirements:
     *
     * - The caller must be the owner of the domain.
     */
    function removeChains(
        bytes32 domainHash,
        uint256[] calldata chainIds
    ) external onlyDomainOwner(msg.sender, domainHash) {
        for (uint256 i = 0; i < chainIds.length; ) {
            delete allowedChains[domainHash][chainIds[i]];
            emit ChainRemoved(domainHash, chainIds[i], msg.sender);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev See {IVerifier-isVerified}.
     */
    function isVerified(
        bytes32 domainHash,
        address, // contractAddress is ignored in this verifier
        uint256 chainId
    ) external view override returns (uint256) {
        return allowedChains[domainHash][chainId];
    }
}
