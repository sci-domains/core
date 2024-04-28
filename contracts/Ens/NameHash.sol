// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.20;

import './INameHash.sol';

/**
 * @dev Implementation of INameHash. For more information about the algorithm you can visit:
 * https://eips.ethereum.org/EIPS/eip-137#namehash-algorithm.
 */
contract NameHash is INameHash {
    /**
     * @dev See {INameHash-version}.
     */
    function getDomainHash(string memory domain) public pure returns (bytes32) {
        return namehash(abi.encodePacked(domain), 0);
    }

    function namehash(bytes memory domain, uint i) internal pure returns (bytes32) {
        if (domain.length <= i)
            return 0x0000000000000000000000000000000000000000000000000000000000000000;

        uint len = LabelLength(domain, i);

        return keccak256(abi.encodePacked(namehash(domain, i + len + 1), keccak(domain, i, len)));
    }

    function LabelLength(bytes memory domain, uint i) internal pure returns (uint) {
        uint len;
        while (i + len != domain.length && domain[i + len] != 0x2e) {
            len++;
        }
        return len;
    }

    function keccak(bytes memory data, uint offset, uint len) internal pure returns (bytes32 ret) {
        require(offset + len <= data.length);
        assembly {
            ret := keccak256(add(add(data, 32), offset), len)
        }
    }
}
