// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

interface ICrossDomainMessanger {
    function sendMessage(address target, bytes calldata _message, int32 gasLimit) external;
    function xDomainMessageSender() external view returns (address);
}