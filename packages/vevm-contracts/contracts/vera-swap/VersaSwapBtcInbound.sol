// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./versaSwap.sol";
import "../system/SystemContract.sol";

contract versaSwapBtcInbound is versaSwap {
    address immutable systemContractAddress;

    constructor(
        address versaToken_,
        address uniswapV2Router_,
        address systemContractAddress_
    ) versaSwap(versaToken_, uniswapV2Router_) {
        systemContractAddress = systemContractAddress_;
    }

    function bytesToAddress(
        bytes calldata data,
        uint256 offset,
        uint256 size
    ) private pure returns (address output) {
        bytes memory b = data[offset:offset + size];
        assembly {
            output := mload(add(b, size))
        }
    }

    function bytesToUint32(
        bytes calldata data,
        uint256 offset,
        uint256 size
    ) private pure returns (uint32 output) {
        bytes memory b = data[offset:offset + size];
        assembly {
            output := mload(add(b, size))
        }
    }

    function onCrossChainCall(
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override {
        address receipient = bytesToAddress(message, 0, 20);
        uint32 targetZRC20ChainId = bytesToUint32(message, 20, 4);
        address targetZRC20 = SystemContract(systemContractAddress).gasCoinZRC20ByChainId(targetZRC20ChainId);

        _doSwap(zrc20, amount, targetZRC20, bytes32(uint256(uint160(receipient))), 0);
    }
}
