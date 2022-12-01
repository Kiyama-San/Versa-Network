// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "./interfaces/VersaInterfaces.sol";

interface VersaTokenConsumerUniV2Errors {
    error InvalidAddress();

    error InputCantBeZero();
}

/**
 * @dev Uniswap V2 strategy for VersaTokenConsumer
 */
contract VersaTokenConsumerUniV2 is VersaTokenConsumer, VersaTokenConsumerUniV2Errors {
    using SafeERC20 for IERC20;
    uint256 internal constant MAX_DEADLINE = 200;

    address internal immutable wETH;
    address public immutable VersaToken;

    IUniswapV2Router02 internal immutable uniswapV2Router;

    constructor(address VersaToken_, address uniswapV2Router_) {
        if (VersaToken_ == address(0) || uniswapV2Router_ == address(0)) revert InvalidAddress();

        VersaToken = VersaToken_;
        uniswapV2Router = IUniswapV2Router02(uniswapV2Router_);
        wETH = IUniswapV2Router02(uniswapV2Router_).WETH();
    }

    function getVersaFromEth(address destinationAddress, uint256 minAmountOut)
        external
        payable
        override
        returns (uint256)
    {
        if (destinationAddress == address(0)) revert InvalidAddress();
        if (msg.value == 0) revert InputCantBeZero();

        address[] memory path = new address[](2);
        path[0] = wETH;
        path[1] = VersaToken;

        uint256[] memory amounts = uniswapV2Router.swapExactETHForTokens{value: msg.value}(
            minAmountOut,
            path,
            destinationAddress,
            block.timestamp + MAX_DEADLINE
        );

        uint256 amountOut = amounts[path.length - 1];

        emit EthExchangedForVersa(msg.value, amountOut);
        return amountOut;
    }

    function getVersaFromToken(
        address destinationAddress,
        uint256 minAmountOut,
        address inputToken,
        uint256 inputTokenAmount
    ) external override returns (uint256) {
        if (destinationAddress == address(0) || inputToken == address(0)) revert InvalidAddress();
        if (inputTokenAmount == 0) revert InputCantBeZero();

        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), inputTokenAmount);
        IERC20(inputToken).safeApprove(address(uniswapV2Router), inputTokenAmount);

        address[] memory path;
        if (inputToken == wETH) {
            path = new address[](2);
            path[0] = wETH;
            path[1] = VersaToken;
        } else {
            path = new address[](3);
            path[0] = inputToken;
            path[1] = wETH;
            path[2] = VersaToken;
        }

        uint256[] memory amounts = uniswapV2Router.swapExactTokensForTokens(
            inputTokenAmount,
            minAmountOut,
            path,
            destinationAddress,
            block.timestamp + MAX_DEADLINE
        );
        uint256 amountOut = amounts[path.length - 1];

        emit TokenExchangedForVersa(inputToken, inputTokenAmount, amountOut);
        return amountOut;
    }

    function getEthFromVersa(
        address destinationAddress,
        uint256 minAmountOut,
        uint256 VersaTokenAmount
    ) external override returns (uint256) {
        if (destinationAddress == address(0)) revert InvalidAddress();
        if (VersaTokenAmount == 0) revert InputCantBeZero();

        IERC20(VersaToken).safeTransferFrom(msg.sender, address(this), VersaTokenAmount);
        IERC20(VersaToken).safeApprove(address(uniswapV2Router), VersaTokenAmount);

        address[] memory path = new address[](2);
        path[0] = VersaToken;
        path[1] = wETH;

        uint256[] memory amounts = uniswapV2Router.swapExactTokensForETH(
            VersaTokenAmount,
            minAmountOut,
            path,
            destinationAddress,
            block.timestamp + MAX_DEADLINE
        );

        uint256 amountOut = amounts[path.length - 1];

        emit VersaExchangedForEth(VersaTokenAmount, amountOut);
        return amountOut;
    }

    function getTokenFromVersa(
        address destinationAddress,
        uint256 minAmountOut,
        address outputToken,
        uint256 VersaTokenAmount
    ) external override returns (uint256) {
        if (destinationAddress == address(0) || outputToken == address(0)) revert InvalidAddress();
        if (VersaTokenAmount == 0) revert InputCantBeZero();

        IERC20(VersaToken).safeTransferFrom(msg.sender, address(this), VersaTokenAmount);
        IERC20(VersaToken).safeApprove(address(uniswapV2Router), VersaTokenAmount);

        address[] memory path;
        if (outputToken == wETH) {
            path = new address[](2);
            path[0] = VersaToken;
            path[1] = wETH;
        } else {
            path = new address[](3);
            path[0] = VersaToken;
            path[1] = wETH;
            path[2] = outputToken;
        }

        uint256[] memory amounts = uniswapV2Router.swapExactTokensForTokens(
            VersaTokenAmount,
            minAmountOut,
            path,
            destinationAddress,
            block.timestamp + MAX_DEADLINE
        );

        uint256 amountOut = amounts[path.length - 1];

        emit VersaExchangedForToken(outputToken, VersaTokenAmount, amountOut);
        return amountOut;
    }
}
