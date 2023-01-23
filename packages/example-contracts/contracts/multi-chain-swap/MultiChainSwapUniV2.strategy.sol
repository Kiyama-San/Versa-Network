// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "./MultiChainSwapErrors.sol";
import "./MultiChainSwap.sol";

contract MultiChainSwapUniV2 is MultiChainSwap, VersaInteractor, MultiChainSwapErrors {
    using SafeERC20 for IERC20;
    uint16 internal constant MAX_DEADLINE = 200;
    bytes32 public constant CROSS_CHAIN_SWAP_MESSAGE = keccak256("CROSS_CHAIN_SWAP");

    address public immutable uniswapV2RouterAddress;
    address internal immutable wETH;
    address public immutable versaToken;

    IUniswapV2Router02 internal uniswapV2Router;

    constructor(
        address versaConnector_,
        address versaToken_,
        address uniswapV2Router_
    ) VersaInteractor(versaConnector_) {
        versaToken = versaToken_;
        uniswapV2RouterAddress = uniswapV2Router_;
        uniswapV2Router = IUniswapV2Router02(uniswapV2Router_);
        wETH = uniswapV2Router.WETH();
    }

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

        uint256 versaValueAndGas;
        {
            address[] memory path = new address[](2);
            path[0] = wETH;
            path[1] = versaToken;

            uint256[] memory amounts = uniswapV2Router.swapExactETHForTokens{value: msg.value}(
                0, /// @todo Add min amount
                path,
                address(this),
                block.timestamp + MAX_DEADLINE
            );

            versaValueAndGas = amounts[path.length - 1];
        }
        if (versaValueAndGas == 0) revert ErrorSwappingTokens();

        {
            bool success = IERC20(versaToken).approve(address(connector), versaValueAndGas);
            if (!success) revert ErrorApprovingTokens(versaToken);
        }

        connector.send(
            VersaInterfaces.SendInput({
                destinationChainId: destinationChainId,
                destinationAddress: interactorsByChainId[destinationChainId],
                destinationGasLimit: crossChaindestinationGasLimit,
                message: abi.encode(
                    CROSS_CHAIN_SWAP_MESSAGE,
                    msg.sender,
                    wETH,
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

        if (sourceInputToken == versaToken) {
            bool success1 = IERC20(versaToken).transferFrom(msg.sender, address(this), inputTokenAmount);
            bool success2 = IERC20(versaToken).approve(address(connector), inputTokenAmount);
            if (!success1 || !success2) revert ErrorTransferringTokens(versaToken);

            versaValueAndGas = inputTokenAmount;
        } else {
            /**
             * @dev If the input token is not Versa, trade it using Uniswap
             */
            {
                IERC20(sourceInputToken).safeTransferFrom(msg.sender, address(this), inputTokenAmount);
                IERC20(sourceInputToken).safeApprove(uniswapV2RouterAddress, inputTokenAmount);
            }

            address[] memory path;
            if (sourceInputToken == wETH) {
                path = new address[](2);
                path[0] = wETH;
                path[1] = versaToken;
            } else {
                path = new address[](3);
                path[0] = sourceInputToken;
                path[1] = wETH;
                path[2] = versaToken;
            }

            uint256[] memory amounts = uniswapV2Router.swapExactTokensForTokens(
                inputTokenAmount,
                0, /// @todo Add min amount
                path,
                address(this),
                block.timestamp + MAX_DEADLINE
            );

            versaValueAndGas = amounts[path.length - 1];
            if (versaValueAndGas == 0) revert ErrorSwappingTokens();
        }

        {
            bool success = IERC20(versaToken).approve(address(connector), versaValueAndGas);
            if (!success) revert ErrorApprovingTokens(versaToken);
        }

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

        address receiverAddress = address(uint160(bytes20(receiverAddressEncoded)));

        if (messageType != CROSS_CHAIN_SWAP_MESSAGE) revert InvalidMessageType();

        uint256 outTokenFinalAmount;
        if (destinationOutToken == versaToken) {
            if (versaMessage.versaValue < outTokenMinAmount) revert InsufficientOutToken();

            bool success = IERC20(versaToken).transfer(receiverAddress, versaMessage.versaValue);
            if (!success) revert ErrorTransferringTokens(versaToken);

            outTokenFinalAmount = versaMessage.versaValue;
        } else {
            /**
             * @dev If the out token is not Versa, get it using Uniswap
             */
            {
                bool success = IERC20(versaToken).approve(uniswapV2RouterAddress, versaMessage.versaValue);
                if (!success) revert ErrorApprovingTokens(versaToken);
            }

            address[] memory path;
            if (destinationOutToken == wETH || isDestinationOutETH) {
                path = new address[](2);
                path[0] = versaToken;
                path[1] = wETH;
            } else {
                path = new address[](3);
                path[0] = versaToken;
                path[1] = wETH;
                path[2] = destinationOutToken;
            }

            uint256[] memory amounts;
            if (isDestinationOutETH) {
                amounts = uniswapV2Router.swapExactTokensForETH(
                    versaMessage.versaValue,
                    outTokenMinAmount,
                    path,
                    receiverAddress,
                    block.timestamp + MAX_DEADLINE
                );
            } else {
                amounts = uniswapV2Router.swapExactTokensForTokens(
                    versaMessage.versaValue,
                    outTokenMinAmount,
                    path,
                    receiverAddress,
                    block.timestamp + MAX_DEADLINE
                );
            }

            outTokenFinalAmount = amounts[amounts.length - 1];
            if (outTokenFinalAmount == 0) revert ErrorSwappingTokens();
            if (outTokenFinalAmount < outTokenMinAmount) revert InsufficientOutToken();
        }

        emit Swapped(
            sourceTxOrigin,
            sourceInputToken,
            inputTokenAmount,
            destinationOutToken,
            outTokenFinalAmount,
            receiverAddress
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
            bool success1 = IERC20(versaToken).approve(address(this), versaRevert.remainingVersaValue);
            bool success2 = IERC20(versaToken).transferFrom(
                address(this),
                sourceTxOrigin,
                versaRevert.remainingVersaValue
            );
            if (!success1 || !success2) revert ErrorTransferringTokens(versaToken);
            inputTokenReturnedAmount = versaRevert.remainingVersaValue;
        } else {
            /**
             * @dev If the source input token is not Versa, trade it using Uniswap
             */
            {
                bool success = IERC20(versaToken).approve(uniswapV2RouterAddress, versaRevert.remainingVersaValue);
                if (!success) revert ErrorTransferringTokens(versaToken);
            }

            address[] memory path;
            if (sourceInputToken == wETH) {
                path = new address[](2);
                path[0] = verseToken;
                path[1] = wETH;
            } else {
                path = new address[](3);
                path[0] = versaToken;
                path[1] = wETH;
                path[2] = sourceInputToken;
            }
            {
                uint256[] memory amounts;

                if (inputTokenIsETH) {
                    amounts = uniswapV2Router.swapExactTokensForETH(
                        versaRevert.remainingVersaValue,
                        0, /// @todo Add min amount
                        path,
                        sourceTxOrigin,
                        block.timestamp + MAX_DEADLINE
                    );
                } else {
                    amounts = uniswapV2Router.swapExactTokensForTokens(
                        versaRevert.remainingVersaValue,
                        0, /// @todo Add min amount
                        path,
                        sourceTxOrigin,
                        block.timestamp + MAX_DEADLINE
                    );
                }
                inputTokenReturnedAmount = amounts[amounts.length - 1];
            }
        }

        emit RevertedSwap(sourceTxOrigin, sourceInputToken, inputTokenAmount, inputTokenReturnedAmount);
    }
}
