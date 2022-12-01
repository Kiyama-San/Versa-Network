// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

import "../MultiChainSwap.sol";

contract MultiChainSwapVersaConnector is VersaConnector {
    address public versaToken;

    constructor(address versaToken_) {
        versaToken = versaToken_;
    }

    function callOnVersaMessage(
        bytes memory versaTxSenderAddress,
        uint256 sourceChainId,
        address destinationAddress,
        uint256 versaValue,
        bytes calldata message
    ) public {
        return
            MultiChainSwap(payable(destinationAddress)).onVersaMessage(
                versaInterfaces.VersaMessage({
                    versaTxSenderAddress: VersaTxSenderAddress,
                    sourceChainId: sourceChainId,
                    destinationAddress: destinationAddress,
                    VersaValue: VersaValue,
                    message: message
                })
            );
    }

    function callOnVersaRevert(
        address VersaTxSenderAddress,
        uint256 sourceChainId,
        uint256 destinationChainId,
        bytes calldata destinationAddress,
        uint256 remainingVersaValue,
        uint256, // destinationGasLimit
        bytes calldata message
    ) public {
        return
            MultiChainSwap(payable(VersaTxSenderAddress)).onVersaRevert(
                VersaInterfaces.VersaRevert({
                    VersaTxSenderAddress: VersaTxSenderAddress,
                    sourceChainId: sourceChainId,
                    destinationAddress: destinationAddress,
                    destinationChainId: destinationChainId,
                    remainingVersaValue: remainingVersaValue,
                    message: message
                })
            );
    }

    function send(VersaInterfaces.SendInput calldata sendInput) external override {
        uint256 sourceChainId = sendInput.destinationChainId == 2 ? 1 : 2;
        address dest = address(uint160(bytes20(sendInput.destinationAddress)));

        if (sendInput.VersaValueAndGas > 0) {
            bool success = IERC20(VersaToken).transferFrom(msg.sender, dest, sendInput.VersaValueAndGas);
            require(success == true, "MultiChainSwap: error transferring token");
        }

        return
            callOnVersaMessage(
                abi.encodePacked(msg.sender),
                sourceChainId,
                dest,
                sendInput.VersaValueAndGas,
                sendInput.message
            );
    }
}
