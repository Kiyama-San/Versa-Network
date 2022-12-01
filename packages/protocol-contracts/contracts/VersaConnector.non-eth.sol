// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./VersaConnector.base.sol";
import "./interfaces/VersaInterfaces.sol";
import "./interfaces/VersaNonEthInterface.sol";

contract VersaConnectorNonEth is VersaConnectorBase {
    uint256 public maxSupply = 2**256 - 1;

    constructor(
        address VersaTokenAddress_,
        address tssAddress_,
        address tssAddressUpdater_,
        address pauserAddress_
    ) VersaConnectorBase(VersaTokenAddress_, tssAddress_, tssAddressUpdater_, pauserAddress_) {}

    function getLockedAmount() external view returns (uint256) {
        return VersaNonEthInterface(VersaToken).balanceOf(address(this));
    }

    function setMaxSupply(uint256 maxSupply_) external onlyTssAddress {
        maxSupply = maxSupply_;
    }

    function send(VersaInterfaces.SendInput calldata input) external override whenNotPaused {
        VersaNonEthInterface(VersaToken).burnFrom(msg.sender, input.VersaValueAndGas);

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
        if (VersaValue + VersaNonEthInterface(VersaToken).totalSupply() > maxSupply) revert ExceedsMaxSupply(maxSupply);
        VersaNonEthInterface(VersaToken).mint(destinationAddress, VersaValue, internalSendHash);

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
        if (remainingVersaValue + VersaNonEthInterface(VersaToken).totalSupply() > maxSupply)
            revert ExceedsMaxSupply(maxSupply);
        VersaNonEthInterface(VersaToken).mint(VersaTxSenderAddress, remainingVersaValue, internalSendHash);

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
