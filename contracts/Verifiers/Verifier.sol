//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @dev Required interface of a Verifier compliant contract for the SCI Registry
 */
interface Verifier {
    function isVerified(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) external view returns (bool);
}
