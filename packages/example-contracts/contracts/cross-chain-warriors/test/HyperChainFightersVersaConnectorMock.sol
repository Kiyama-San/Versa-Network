// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

import "../HyperChainFighters.sol";

contract HyperChainFightersVersaConnectorMock is VersaConnector {
    function callOnVersaMessage(
        bytes memory versaTxSenderAddress,
        uint256 sourceChainId,
        address destinationAddress,
        uint256 versaValue,
        bytes calldata message
    ) public {
        return
            HyperChainFighters(destinationAddress).onVersaMessage(
                VersaInterfaces.VersaMessage({
                    versaTxSenderAddress: versaTxSenderAddress,
                    sourceChainId: sourceChainId,
                    destinationAddress: destinationAddress,
                    versaValue: versaValue,
                    message: message
                })
            );
    }

    function callOnVersaRevert(
        address versaTxSenderAddress,
        uint256 sourceChainId,
        uint256 destinationChainId,
        bytes calldata destinationAddress,
        uint256 remainingVersaValue,
        uint256, // destinationGasLimit
        bytes calldata message
    ) public {
        return
            HyperChainFighters(zetaTxSenderAddress).onVersaRevert(
                VersaInterfaces.VersaRevert({
                    versaTxSenderAddress: versaTxSenderAddress,
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

        return
            callOnVersaMessage(
                abi.encodePacked(msg.sender),
                sourceChainId,
                dest,
                sendInput.versaValueAndGas,
                sendInput.message
            );
    }
}
