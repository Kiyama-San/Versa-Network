import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

export const encodeParams = (dataTypes: any[], data: any[]) => {
  const abiCoder = ethers.utils.defaultAbiCoder;
  return abiCoder.encode(dataTypes, data);
};

export const getSwapParams = (destination: string, destinationToken: string, minOutput: BigNumber) => {
  const paddedDestination = ethers.utils.hexlify(ethers.utils.zeroPad(destination, 32));
  const params = encodeParams(["address", "bytes32", "uint256"], [destinationToken, paddedDestination, minOutput]);

  return params;
};

export const getSwapData = (versaSwap: string, destination: string, destinationToken: string, minOutput: BigNumber) => {
  const params = getSwapParams(destination, destinationToken, minOutput);

  return `${versaSwap}${params.slice(2)}`;
};

export const getBitcoinTxMemo = (versaSwapAddress: string, destinationAddress: string, chainId: string) => {
  const paddedHexChainId = ethers.utils
    .hexlify(Number(chainId))
    .slice(2)
    .padStart(8, "0");
  const rawMemo = `${versaSwapAddress}${destinationAddress.slice(2)}${paddedHexChainId}`;
  return ethers.utils.base64.encode(rawMemo);
};
