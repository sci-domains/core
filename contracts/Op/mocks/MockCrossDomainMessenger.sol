// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ICrossDomainMessanger} from '../ICrossDomainMessanger.sol';
/// @dev Mock contract for testing cross-domain messaging functionality.
contract MockCrossDomainMessenger is ICrossDomainMessanger {
    address private xDomainMessageSenderAddress;

    bool public shouldSendMessage;

    event MessageSent(address target, bytes message, uint32 gasLimit);

    constructor(address _xDomainMessageSender, bool _shouldSendMessage) {
        xDomainMessageSenderAddress = _xDomainMessageSender;
        shouldSendMessage = _shouldSendMessage;
    }

    function sendMessage(address target, bytes calldata _message, uint32 gasLimit) external {
        if (shouldSendMessage) {
            (bool success, bytes memory result) = target.call{gas: uint256(gasLimit)}(
                _message
            );

            if (!success) {
                // Bubble up the original revert reason if present
                if (result.length > 0) {
                    // The easiest way to bubble the reason is using assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(result, 32), returndata_size)
                    }
                } else {
                    revert('Call failed without reason');
                }
            }
        }
        emit MessageSent(target, _message, gasLimit);
    }

    function xDomainMessageSender() external view override returns (address) {
        return xDomainMessageSenderAddress;
    }

    function setXDomainMessageSenderAddress(address _xDomainMessageSenderAddress) external {
        xDomainMessageSenderAddress = _xDomainMessageSenderAddress;
    }

    function setShouldSendMessage(bool _shouldSendMessage) external {
        shouldSendMessage = _shouldSendMessage;
    }
}
