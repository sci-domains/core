// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.25;

import {INameHash} from './INameHash.sol';

/**
 * @dev Implementation of INameHash. For more information about the algorithm you can visit:
 * https://eips.ethereum.org/EIPS/eip-137#namehash-algorithm.
 * @custom:security-contact security@sci.domains
 */
contract NameHash is INameHash {
    /**
     * @dev See {INameHash-version}.
     */
    function getDomainHash(string memory domain) external pure returns (bytes32) {
        return namehash(abi.encodePacked(domain), 0);
    }

    function namehash(bytes memory domain, uint256 i) private pure returns (bytes32) {
        if (domain.length <= i)
            return 0x0000000000000000000000000000000000000000000000000000000000000000;

        uint256 len = labelLength(domain, i);

        return keccak256(abi.encodePacked(namehash(domain, i + len + 1), keccak(domain, i, len)));
    }

    function labelLength(bytes memory domain, uint256 i) private pure returns (uint256) {
        uint256 len;
        while (i + len != domain.length && domain[i + len] != 0x2e) {
            ++len;
        }
        return len;
    }

    function keccak(
        bytes memory data,
        uint256 offset,
        uint256 len
    ) private pure returns (bytes32 ret) {
        require(offset + len <= data.length, 'Data is smaller than the offset plus the length');
        assembly {
            ret := keccak256(add(add(data, 32), offset), len)
        }
    }
}
