// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

import "./interfaces/VersaInterfaces.sol";

interface VersaTokenConsumerUniV3Errors {
    error InvalidAddress();

    error InputCantBeZero();

    error ErrorSendingETH();

    error ReentrancyError();
}

interface WETH9 {
    function withdraw(uint256 wad) external;
}

/**
 * @dev Uniswap V3 strategy for VersaTokenConsumer
 */
contract VersaTokenConsumerUniV3 is VersaTokenConsumer, VersaTokenConsumerUniV3Errors {
    using SafeERC20 for IERC20;
    uint256 internal constant MAX_DEADLINE = 200;

    uint24 public immutable VersaPoolFee;
    uint24 public immutable tokenPoolFee;

    address internal immutable WETH9Address;
    address public immutable VersaToken;

    ISwapRouter public immutable uniswapV3Router;
    IQuoter public immutable quoter;

    bool internal _locked;

    constructor(
        address VersaToken_,
        address uniswapV3Router_,
        address quoter_,
        address WETH9Address_,
        uint24 VersaPoolFee_,
        uint24 tokenPoolFee_
    ) {
        if (
            VersaToken_ == address(0) ||
            uniswapV3Router_ == address(0) ||
            quoter_ == address(0) ||
            WETH9Address_ == address(0)
        ) revert InvalidAddress();

        VersaToken = VersaToken_;
        uniswapV3Router = ISwapRouter(uniswapV3Router_);
        quoter = IQuoter(quoter_);
        WETH9Address = WETH9Address_;
        VersaPoolFee = VersaPoolFee_;
        tokenPoolFee = tokenPoolFee_;
    }

    modifier nonReentrant() {
        if (_locked) revert ReentrancyError();
        _locked = true;
        _;
        _locked = false;
    }

    receive() external payable {}

    function getVersaFromEth(address destinationAddress, uint256 minAmountOut)
        external
        payable
        override
        returns (uint256)
    {
        if (destinationAddress == address(0)) revert InvalidAddress();
        if (msg.value == 0) revert InputCantBeZero();

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            deadline: block.timestamp + MAX_DEADLINE,
            tokenIn: WETH9Address,
            tokenOut: VersaToken,
            fee: VersaPoolFee,
            recipient: destinationAddress,
            amountIn: msg.value,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });

        uint256 amountOut = uniswapV3Router.exactInputSingle{value: msg.value}(params);

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
        IERC20(inputToken).safeApprove(address(uniswapV3Router), inputTokenAmount);

        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            deadline: block.timestamp + MAX_DEADLINE,
            path: abi.encodePacked(inputToken, tokenPoolFee, WETH9Address, VersaPoolFee, VersaToken),
            recipient: destinationAddress,
            amountIn: inputTokenAmount,
            amountOutMinimum: minAmountOut
        });

        uint256 amountOut = uniswapV3Router.exactInput(params);

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
        IERC20(VersaToken).safeApprove(address(uniswapV3Router), VersaTokenAmount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            deadline: block.timestamp + MAX_DEADLINE,
            tokenIn: VersaToken,
            tokenOut: WETH9Address,
            fee: VersaPoolFee,
            recipient: address(this),
            amountIn: VersaTokenAmount,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });

        uint256 amountOut = uniswapV3Router.exactInputSingle(params);

        WETH9(WETH9Address).withdraw(amountOut);

        emit VersaExchangedForEth(VersaTokenAmount, amountOut);

        (bool sent, ) = destinationAddress.call{value: amountOut}("");
        if (!sent) revert ErrorSendingETH();

        return amountOut;
    }

    function getTokenFromVersa(
        address destinationAddress,
        uint256 minAmountOut,
        address outputToken,
        uint256 VersaTokenAmount
    ) external override nonReentrant returns (uint256) {
        if (destinationAddress == address(0) || outputToken == address(0)) revert InvalidAddress();
        if (VersaTokenAmount == 0) revert InputCantBeZero();

        IERC20(VersaToken).safeTransferFrom(msg.sender, address(this), VersaTokenAmount);
        IERC20(VersaToken).safeApprove(address(uniswapV3Router), VersaTokenAmount);

        ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            deadline: block.timestamp + MAX_DEADLINE,
            path: abi.encodePacked(VersaToken, VersaPoolFee, WETH9Address, tokenPoolFee, outputToken),
            recipient: destinationAddress,
            amountIn: VersaTokenAmount,
            amountOutMinimum: minAmountOut
        });

        uint256 amountOut = uniswapV3Router.exactInput(params);

        emit VersaExchangedForToken(outputToken, VersaTokenAmount, amountOut);
        return amountOut;
    }
}
