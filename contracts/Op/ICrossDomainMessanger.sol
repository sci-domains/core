// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

/**
 * @title ICrossDomainMessanger
 * @dev Interface for the Superchain Cross Domain Messenger
 * which facilitates sending messages between a source and a target chain.
 */
interface ICrossDomainMessanger {
    /**
     * @dev Sends a message to a target contract on a different chain.
     * @param target The address of the target contract on the destination chain.
     * @param _message The encoded message data containing function selectors and parameters.
     * @param gasLimit The maximum amount of gas allocated for executing the message on the target chain.
     */
    function sendMessage(address target, bytes calldata _message, uint32 gasLimit) external;

    /**
     * @dev Retrieves the address of the sender of the cross-domain message.
     * @return The address of the entity that originated the cross-domain message.
     */
    function xDomainMessageSender() external view returns (address);
}
