// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.28;

import {ICrossDomainMessanger} from "../ICrossDomainMessanger.sol";

contract MockCrossDomainMessanger is ICrossDomainMessanger {
    address private xDomainMessageSenderAddress;

    bool public shouldSendMessage;

    event MessageSent(address target, bytes message, int32 gasLimit);

    constructor(address _xDomainMessageSenderAddress, bool _shouldSendMessage) {
        xDomainMessageSenderAddress = _xDomainMessageSenderAddress;
        shouldSendMessage = _shouldSendMessage;
    }

    function sendMessage(address target, bytes calldata _message, int32 gasLimit) external {
        if(shouldSendMessage) {
            (bool success, bytes memory result) = target.call{gas: uint256(uint32(gasLimit))}(_message);

            if (!success) {
                // Bubble up the original revert reason if present
                if (result.length > 0) {
                    // The easiest way to bubble the reason is using assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(result, 32), returndata_size)
                    }
                } else {
                    revert("Call failed without reason");
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