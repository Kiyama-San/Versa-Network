// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@versanetwork/protocol-contracts/contracts/VersaInteractor.sol";
import "@versanetwork/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

interface CrossChainCounterErrors {
    error InvalidMessageType();

    error DecrementOverflow();
}

contract CrossChainCounter is VersaInteractor, VersaReceiver, CrossChainCounterErrors {
    bytes32 public constant CROSS_CHAIN_INCREMENT_MESSAGE = keccak256("CROSS_CHAIN_INCREMENT");

    mapping(address => uint256) public counter;

    constructor(address connectorAddress_) VersaInteractor(connectorAddress_) {}

    function crossChainCount(uint256 destinationChainId) external {
        if (!_isValidChainId(destinationChainId)) revert InvalidDestinationChainId();

        counter[msg.sender]++;
        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: interactorsByChainId[destinationChainId],
                destinationGasLimit: 2500000,
                message: abi.encode(CROSS_CHAIN_INCREMENT_MESSAGE, msg.sender),
                versaValueAndGas: 0,
                versaParams: abi.encode("")
            })
        );
    }

    function onVersaMessage(VersaInterfaces.VersaMessage calldata versaMessage)
        external
        override
        isValidMessageCall(versaMessage)
    {
        (bytes32 messageType, address messageFrom) = abi.decode(versaMessage.message, (bytes32, address));

        if (messageType != CROSS_CHAIN_INCREMENT_MESSAGE) revert InvalidMessageType();

        counter[messageFrom]++;
    }

    function onVersaRevert(VersaInterfaces.VersaRevert calldata versaRevert)
        external
        override
        isValidRevertCall(versaRevert)
    {
        (bytes32 messageType, address messageFrom) = abi.decode(versaRevert.message, (bytes32, address));

        if (messageType != CROSS_CHAIN_INCREMENT_MESSAGE) revert InvalidMessageType();
        if (counter[messageFrom] <= 0) revert DecrementOverflow();

        counter[messageFrom]--;
    }
}
