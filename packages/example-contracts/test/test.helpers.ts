import { MaxUint256 } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VersaTokenConsumerUniV3__factory } from "@versanetwork/interfaces/typechain-types";
import { BigNumber, ContractReceipt } from "ethers";

import { getAddress } from "../lib/shared/address.helpers";
import { getNow } from "../lib/shared/deploy.helpers";
import {
  ERC20__factory,
  IUniswapV2Pair__factory,
  MultiChainSwapUniV2__factory,
  UniswapV2Router02__factory
} from "../typechain-types";

export const getMintTokenId = (mintTx: ContractReceipt) => mintTx.events?.[0].args?.tokenId;

export const parseUniswapLog = (logs: ContractReceipt["logs"]) => {
  const iface = IUniswapV2Pair__factory.createInterface();

  const eventNames = logs.map(log => {
    try {
      const parsedLog = iface.parseLog(log);

      return parsedLog.name;
    } catch (e) {
      return "NO_UNI_LOG";
    }
  });

  return eventNames;
};

export const parseVersaLog = (logs: ContractReceipt["logs"]) => {
  const iface = MultiChainSwapUniV2__factory.createInterface();

  const eventNames = logs.map(log => {
    try {
      const parsedLog = iface.parseLog(log);

      return parsedLog.name;
    } catch (e) {
      return "NO_VERSA_LOG";
    }
  });

  return eventNames;
};

export const parseInteractorLog = (logs: ContractReceipt["logs"]) => {
  const iface = VersaTokenConsumerUniV3__factory.createInterface();

  const eventNames = logs.map(log => {
    try {
      const parsedLog = iface.parseLog(log);

      return parsedLog.name;
    } catch (e) {
      return "NO_VERSA_LOG";
    }
  });

  return eventNames;
};

type CustomErrorParamType = BigNumber | number | string;
export const getCustomErrorMessage = (errorMethod: string, params?: [CustomErrorParamType]) => {
  const stringParams = params
    ? params
        .map((p: CustomErrorParamType) => {
          if (typeof p === "number") {
            return p;
          }

          return `"${p.toString()}"`;
        })
        .join(", ")
    : "";
  return `VM Exception while processing transaction: reverted with custom error '${errorMethod}(${stringParams})'`;
};

export const addVersaEthLiquidityTest = async (
  versaTokenAddress: string,
  versaToAdd: BigNumber,
  ETHToAdd: BigNumber,
  deployer: SignerWithAddress
) => {
  const uniswapRouterAddr = getAddress("uniswapV2Router02", {
    customNetworkName: "eth-mainnet",
    customVersaNetwork: "mainnet"
  });
  const uniswapRouter = UniswapV2Router02__factory.connect(uniswapRouterAddr, deployer);

  const VersaTokenContract = ERC20__factory.connect(versaTokenAddress, deployer);

  const tx1 = await VersaTokenContract.approve(uniswapRouter.address, MaxUint256);
  await tx1.wait();

  const tx2 = await uniswapRouter.addLiquidityETH(
    VersaTokenContract.address,
    versaToAdd,
    0,
    0,
    deployer.address,
    (await getNow()) + 360,
    { gasLimit: 10_000_000, value: ETHToAdd }
  );
  await tx2.wait();
};
