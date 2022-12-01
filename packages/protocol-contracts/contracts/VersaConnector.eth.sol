// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/ConnectorErrors.sol";
import "./VersaConnector.base.sol";
import "./interfaces/VersaInterfaces.sol";

contract VersaConnectorEth is VersaConnectorBase {
    constructor(
        address VersaToken_,
        address tssAddress_,
        address tssAddressUpdater_,
        address pauserAddress_
    ) VersaConnectorBase(VersaToken_, tssAddress_, tssAddressUpdater_, pauserAddress_) {}

    function getLockedAmount() external view returns (uint256) {
        return IERC20(VersaToken).balanceOf(address(this));
    }

    function send(VersaInterfaces.SendInput calldata input) external override whenNotPaused {
        bool success = IERC20(VersaToken).transferFrom(msg.sender, address(this), input.VersaValueAndGas);
        if (!success) revert VersaTransferError();

        emit VersaSent(
            tx.origin,
            msg.sender,
            input.destinationChainId,
            input.destinationAddress,
            input.VersaValueAndGas,
            input.destinationGasLimit,
            input.message,
            input.VersaParams
        );
    }

    function onReceive(
        bytes calldata VersaTxSenderAddress,
        uint256 sourceChainId,
        address destinationAddress,
        uint256 VersaValue,
        bytes calldata message,
        bytes32 internalSendHash
    ) external override whenNotPaused onlyTssAddress {
        bool success = IERC20(VersaToken).transfer(destinationAddress, VersaValue);
        if (!success) revert VersaTransferError();

        if (message.length > 0) {
            VersaReceiver(destinationAddress).onVersaMessage(
                VersaInterfaces.VersaMessage(VersaTxSenderAddress, sourceChainId, destinationAddress, VersaValue, message)
            );
        }

        emit VersaReceived(VersaTxSenderAddress, sourceChainId, destinationAddress, VersaValue, message, internalSendHash);
    }

    function onRevert(
        address VersaTxSenderAddress,
        uint256 sourceChainId,
        bytes calldata destinationAddress,
        uint256 destinationChainId,
        uint256 remainingVersaValue,
        bytes calldata message,
        bytes32 internalSendHash
    ) external override whenNotPaused onlyTssAddress {
        bool success = IERC20(VersaToken).transfer(VersaTxSenderAddress, remainingVersaValue);
        if (!success) revert VersaTransferError();

        if (message.length > 0) {
            VersaReceiver(VersaTxSenderAddress).onVersaRevert(
                VersaInterfaces.VersaRevert(
                    VersaTxSenderAddress,
                    sourceChainId,
                    destinationAddress,
                    destinationChainId,
                    remainingVersaValue,
                    message
                )
            );
        }

        emit VersaReverted(
            VersaTxSenderAddress,
            sourceChainId,
            destinationChainId,
            destinationAddress,
            remainingVersaValue,
            message,
            internalSendHash
        );
    }
}
