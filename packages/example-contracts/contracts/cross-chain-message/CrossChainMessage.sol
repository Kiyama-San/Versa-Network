// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@versachain/protocol-contracts/contracts/VersaInteractor.sol";
import "@versachain/protocol-contracts/contracts/interfaces/VersaInterfaces.sol";

interface CrossChainMessageErrors {
    error InvalidMessageType();
}

/**
 * @dev A simple contract able to send and receive Hello World messages from other chains.
 * Emits a HelloWorldEvent on successful messages
 * Emits a RevertedHelloWorldEvent on failed messages
 */
contract CrossChainMessage is VersaInteractor, VersaReceiver, CrossChainMessageErrors {
    bytes32 public constant HELLO_WORLD_MESSAGE_TYPE = keccak256("CROSS_CHAIN_HELLO_WORLD");

    event HelloWorldEvent(string messageData);
    event RevertedHelloWorldEvent(string messageData);

    VersaTokenConsumer private immutable _versaConsumer;
    IERC20 internal immutable _versaToken;

    constructor(
        address connectorAddress,
        address versaTokenAddress,
        address versaConsumerAddress
    ) VersaInteractor(connectorAddress) {
        _versaToken = IERC20(versaTokenAddress);
        _versaConsumer = VersaTokenConsumer(versaConsumerAddress);
    }

    function sendHelloWorld(uint256 destinationChainId) external payable {
        if (!_isValidChainId(destinationChainId)) revert InvalidDestinationChainId();

        uint256 crossChainGas = 18 * (10**18);
        uint256 versaValueAndGas = _versaConsumer.getVersaFromEth{value: msg.value}(address(this), crossChainGas);
        _versaToken.approve(address(connector), versaValueAndGas);

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: interactorsByChainId[destinationChainId],
                destinationGasLimit: 2500000,
                message: abi.encode(HELLO_WORLD_MESSAGE_TYPE, "Hello, Cross-Chain World!"),
                versaValueAndGas: versaValueAndGas,
                versaParams: abi.encode("")
            })
        );
    }

    function onVersaMessage(VersaInterfaces.VersaMessage calldata versaMessage)
        external
        override
        isValidMessageCall(versaMessage)
    {
        /**
         * @dev Decode should follow the signature of the message provided to versa.send.
         */
        (bytes32 messageType, string memory helloWorldMessage) = abi.decode(versaMessage.message, (bytes32, string));

        /**
         * @dev Setting a message type is a useful pattern to distinguish between different messages.
         */
        if (messageType != HELLO_WORLD_MESSAGE_TYPE) revert InvalidMessageType();

        emit HelloWorldEvent(helloWorldMessage);
    }

    /**
     * @dev Called by the Versa Connector contract when the message fails to be sent.
     * Useful to cleanup and leave the application on its initial state.
     * Note that the require statements and the functionality are similar to onVersaMessage.
     */
    function onVersaRevert(VersaInterfaces.VersaRevert calldata versaRevert)
        external
        override
        isValidRevertCall(versaRevert)
    {
        (bytes32 messageType, string memory helloWorldMessage) = abi.decode(versaRevert.message, (bytes32, string));

        if (messageType != HELLO_WORLD_MESSAGE_TYPE) revert InvalidMessageType();

        emit RevertedHelloWorldEvent(helloWorldMessage);
    }
}
