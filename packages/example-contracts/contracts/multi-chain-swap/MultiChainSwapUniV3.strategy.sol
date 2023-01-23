// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@versachain/protocol-contracts/contracts/versaTokenConsumerUniV3.strategy.sol";

import "./MultiChainSwapErrors.sol";
import "./MultiChainSwap.sol";

contract MultiChainSwapUniV3 is MultiChainSwap, versaInteractor, MultiChainSwapErrors, versaTokenConsumerUniV3 {
    using SafeERC20 for IERC20;
    bytes32 public constant CROSS_CHAIN_SWAP_MESSAGE = keccak256("CROSS_CHAIN_SWAP");

    constructor(
        address versaConnector_,
        address versaToken_,
        address uniswapV3Router_,
        address quoter_,
        address WETH9Address_,
        uint24 versaPoolFee_,
        uint24 tokenPoolFee_
    )
        VersaTokenConsumerUniV3(versaToken_, uniswapV3Router_, quoter_, WETH9Address_, versaPoolFee_, tokenPoolFee_)
        VersaInteractor(versaConnector_)
    {}

    function swapETHForTokensCrossChain(
        bytes calldata receiverAddress,
        address destinationOutToken,
        bool isDestinationOutETH,
        /**
         * @dev The minimum amount of tokens that receiverAddress should get,
         * if it's not reached, the transaction will revert on the destination chain
         */
        uint256 outTokenMinAmount,
        uint256 destinationChainId,
        uint256 crossChaindestinationGasLimit
    ) external payable override {
        if (!_isValidChainId(destinationChainId)) revert InvalidDestinationChainId();

        if (msg.value == 0) revert ValueShouldBeGreaterThanZero();
        if (
            (destinationOutToken != address(0) && isDestinationOutETH) ||
            (destinationOutToken == address(0) && !isDestinationOutETH)
        ) revert OutTokenInvariant();

        uint256 versaValueAndGas = this.getVersaFromEth{value: msg.value}(
            address(this),
            0 /// @todo Add min amount
        );
        if (versaValueAndGas == 0) revert ErrorSwappingTokens();

        IERC20(versaToken).safeApprove(address(connector), versaValueAndGas);

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: interactorsByChainId[destinationChainId],
                destinationGasLimit: crossChaindestinationGasLimit,
                message: abi.encode(
                    CROSS_CHAIN_SWAP_MESSAGE,
                    msg.sender,
                    WETH9Address,
                    msg.value,
                    receiverAddress,
                    destinationOutToken,
                    isDestinationOutETH,
                    outTokenMinAmount,
                    true // inputTokenIsETH
                ),
                versaValueAndGas: versaValueAndGas,
                versaParams: abi.encode("")
            })
        );
    }

    function swapTokensForTokensCrossChain(
        address sourceInputToken,
        uint256 inputTokenAmount,
        bytes calldata receiverAddress,
        address destinationOutToken,
        bool isDestinationOutETH,
        /**
         * @dev The minimum amount of tokens that receiverAddress should get,
         * if it's not reached, the transaction will revert on the destination chain
         */
        uint256 outTokenMinAmount,
        uint256 destinationChainId,
        uint256 crossChaindestinationGasLimit
    ) external override {
        if (!_isValidChainId(destinationChainId)) revert InvalidDestinationChainId();

        if (sourceInputToken == address(0)) revert MissingSourceInputTokenAddress();
        if (
            (destinationOutToken != address(0) && isDestinationOutETH) ||
            (destinationOutToken == address(0) && !isDestinationOutETH)
        ) revert OutTokenInvariant();

        uint256 versaValueAndGas;

        IERC20(sourceInputToken).safeTransferFrom(msg.sender, address(this), inputTokenAmount);

        if (sourceInputToken == versaToken) {
            versaValueAndGas = inputTokenAmount;
        } else {
            IERC20(sourceInputToken).safeApprove(address(this), inputTokenAmount);
            versaValueAndGas = this.getVersaFromToken(
                address(this),
                0, /// @todo Add min amount
                sourceInputToken,
                inputTokenAmount
            );

            if (versaValueAndGas == 0) revert ErrorSwappingTokens();
        }

        IERC20(versaToken).safeApprove(address(connector), versaValueAndGas);

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: interactorsByChainId[destinationChainId],
                destinationGasLimit: crossChaindestinationGasLimit,
                message: abi.encode(
                    CROSS_CHAIN_SWAP_MESSAGE,
                    msg.sender,
                    sourceInputToken,
                    inputTokenAmount,
                    receiverAddress,
                    destinationOutToken,
                    isDestinationOutETH,
                    outTokenMinAmount,
                    false // inputTokenIsETH
                ),
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
        (
            bytes32 messageType,
            address sourceTxOrigin,
            address sourceInputToken,
            uint256 inputTokenAmount,
            bytes memory receiverAddressEncoded,
            address destinationOutToken,
            bool isDestinationOutETH,
            uint256 outTokenMinAmount,

        ) = abi.decode(versaMessage.message, (bytes32, address, address, uint256, bytes, address, bool, uint256, bool));
        if (messageType != CROSS_CHAIN_SWAP_MESSAGE) revert InvalidMessageType();

        uint256 outTokenFinalAmount;
        if (destinationOutToken == versaToken) {
            if (versaMessage.versaValue < outTokenMinAmount) revert InsufficientOutToken();

            IERC20(versaToken).safeTransfer(address(uint160(bytes20(receiverAddressEncoded))), versaMessage.versaValue);

            outTokenFinalAmount = versaMessage.versaValue;
        } else {
            /**
             * @dev If the out token is not Versa, get it using Uniswap
             */
            IERC20(versaToken).safeApprove(address(this), versaMessage.versaValue);

            if (isDestinationOutETH) {
                outTokenFinalAmount = this.getEthFromVersa(
                    address(uint160(bytes20(receiverAddressEncoded))),
                    outTokenMinAmount,
                    versaMessage.versaValue
                );
            } else {
                outTokenFinalAmount = this.getTokenFromVersa(
                    address(uint160(bytes20(receiverAddressEncoded))),
                    outTokenMinAmount,
                    destinationOutToken,
                    versaMessage.versaValue
                );
            }

            if (outTokenFinalAmount == 0) revert ErrorSwappingTokens();
            if (outTokenFinalAmount < outTokenMinAmount) revert InsufficientOutToken();
        }

        emit Swapped(
            sourceTxOrigin,
            sourceInputToken,
            inputTokenAmount,
            destinationOutToken,
            outTokenFinalAmount,
            address(uint160(bytes20(receiverAddressEncoded)))
        );
    }

    function onVersaRevert(VersaInterfaces.VersaRevert calldata versaRevert)
        external
        override
        isValidRevertCall(versaRevert)
    {
        /**
         * @dev: If something goes wrong we must swap to the source input token
         */
        (
            ,
            address sourceTxOrigin,
            address sourceInputToken,
            uint256 inputTokenAmount,
            ,
            ,
            ,
            ,
            bool inputTokenIsETH
        ) = abi.decode(versaRevert.message, (bytes32, address, address, uint256, bytes, address, bool, uint256, bool));

        uint256 inputTokenReturnedAmount;
        if (sourceInputToken == versaToken) {
            IERC20(versaToken).safeApprove(address(this), versaRevert.remainingVersaValue);
            IERC20(versaToken).safeTransferFrom(address(this), sourceTxOrigin, versaRevert.remainingVersaValue);
            inputTokenReturnedAmount = versaRevert.remainingVersaValue;
        } else {
            /**
             * @dev If the source input token is not Versa, trade it using Uniswap
             */
            IERC20(versaToken).safeApprove(address(this), versaRevert.remainingVersaValue);

            if (inputTokenIsETH) {
                inputTokenReturnedAmount = this.getEthFromVersa(
                    sourceTxOrigin,
                    0, /// @todo Add min amount
                    versaRevert.remainingVersaValue
                );
            } else {
                inputTokenReturnedAmount = this.getTokenFromVersa(
                    sourceTxOrigin,
                    0, /// @todo Add min amount
                    sourceInputToken,
                    versaRevert.remainingVersaValue
                );
            }
        }

        emit RevertedSwap(sourceTxOrigin, sourceInputToken, inputTokenAmount, inputTokenReturnedAmount);
    }
}
