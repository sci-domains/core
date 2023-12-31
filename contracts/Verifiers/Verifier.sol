//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface Verifier {
    function isVerified(
        bytes32 domainHash,
        uint256 chainId,
        address contractAddress
    ) external view returns (bool);
}
