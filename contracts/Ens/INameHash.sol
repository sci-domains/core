// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.20;

/**
 * @dev External interface of NameHash declared to support EIP-137 namehash algorithm for domains.
 */
interface INameHash {
    /**
     * @dev Transforms a domain into a domain hash using the namehash algorithm specified in the EIP-137
     * @param domain a string representation of a domain (example.com)
     * @return a bytes32 representation of the namehash algorithm applied to the domain.
     * For example.com it will return 0xf59ba973941fd531b0702df2592a8480fd9f28516c50a93626e652a8ce263832.
     */
    function getDomainHash(string memory domain) external pure returns (bytes32);
}
