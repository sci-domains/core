//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface Verifier {
    function isVerified(
        string memory domain,
        uint256 chainId,
        address contractAddress
    ) external returns (bool);
}