// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface VersaInterfaces {
    /**
     * @dev Use SendInput to interact with the Connector: connector.send(SendInput)
     */
    struct SendInput {
        /// @dev Chain id of the destination chain. More about chain ids https://docs.Versachain.com/learn/glossary#chain-id
        uint256 destinationChainId;
        /// @dev Address receiving the message on the destination chain (expressed in bytes since it can be non-EVM)
        bytes destinationAddress;
        /// @dev Gas limit for the destination chain's transaction
        uint256 destinationGasLimit;
        /// @dev An encoded, arbitrary message to be parsed by the destination contract
        bytes message;
        /// @dev Versa to be sent cross-chain + VersaChain gas fees + destination chain gas fees (expressed in Versa)
        uint256 VersaValueAndGas;
        /// @dev Optional parameters for the VersaChain protocol
        bytes VersaParams;
    }

    /**
     * @dev Our Connector calls onVersaMessage with this struct as argument
     */
    struct VersaMessage {
        bytes VersaTxSenderAddress;
        uint256 sourceChainId;
        address destinationAddress;
        /// @dev Remaining Versa from VersaValueAndGas after subtracting VersaChain gas fees and destination gas fees
        uint256 VersaValue;
        bytes message;
    }

    /**
     * @dev Our Connector calls onVersaRevert with this struct as argument
     */
    struct VersaRevert {
        address VersaTxSenderAddress;
        uint256 sourceChainId;
        bytes destinationAddress;
        uint256 destinationChainId;
        /// @dev Equals to: VersaValueAndGas - VersaChain gas fees - destination chain gas fees - source chain revert tx gas fees
        uint256 remainingVersaValue;
        bytes message;
    }
}

interface VersaConnector {
    /**
     * @dev Sending value and data cross-chain is as easy as calling connector.send(SendInput)
     */
    function send(VersaInterfaces.SendInput calldata input) external;
}

interface VersaReceiver {
    /**
     * @dev onVersaMessage is called when a cross-chain message reaches a contract
     */
    function onVersaMessage(VersaInterfaces.VersaMessage calldata VersaMessage) external;

    /**
     * @dev onVersaRevert is called when a cross-chain message reverts.
     * It's useful to rollback to the original state
     */
    function onVersaRevert(VersaInterfaces.VersaRevert calldata VersaRevert) external;
}

/**
 * @dev VersaTokenConsumer makes it easier to handle the following situations:
 *   - Getting Versa using native coin (to pay for destination gas while using `connector.send`)
 *   - Getting Versa using a token (to pay for destination gas while using `connector.send`)
 *   - Getting native coin using Versa (to return unused destination gas when `onVersaRevert` is executed)
 *   - Getting a token using Versa (to return unused destination gas when `onVersaRevert` is executed)
 * @dev The interface can be implemented using different strategies, like UniswapV2, UniswapV3, etc
 */
interface VersaTokenConsumer {
    event EthExchangedForVersa(uint256 amountIn, uint256 amountOut);
    event TokenExchangedForVersa(address token, uint256 amountIn, uint256 amountOut);
    event VersaExchangedForEth(uint256 amountIn, uint256 amountOut);
    event VersaExchangedForToken(address token, uint256 amountIn, uint256 amountOut);

    function getVersaFromEth(address destinationAddress, uint256 minAmountOut) external payable returns (uint256);

    function getVersaFromToken(
        address destinationAddress,
        uint256 minAmountOut,
        address inputToken,
        uint256 inputTokenAmount
    ) external returns (uint256);

    function getEthFromVersa(
        address destinationAddress,
        uint256 minAmountOut,
        uint256 VersaTokenAmount
    ) external returns (uint256);

    function getTokenFromVersa(
        address destinationAddress,
        uint256 minAmountOut,
        address outputToken,
        uint256 VersaTokenAmount
    ) external returns (uint256);
}
