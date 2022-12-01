import { MaxUint256 } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { getAddress } from "../lib/shared/address.helpers";
import { getContract } from "../lib/shared/deploy.helpers";
import {
  ERC20__factory,
  IUniswapV2Factory__factory,
  IUniswapV2Pair__factory,
  IUniswapV2Router02,
  UniswapV2Router02,
  UniswapV2Router02__factory
} from "../typechain-types";

const UNISWAP_FACTORY_ADDRESS = "0xb7926c0430afb07aa7defde6da862ae0bde767bc";

const VERSA_TO_ADD = parseUnits("19000");
const ETH_TO_ADD = parseUnits("10");

interface Pair {
  TokenA: string;
  TokenB: string;
}

export const getNow = async () => {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
};

export const sortPair = (token1: string, token2: string): Pair => {
  if (token1 < token2) {
    return { TokenA: token1, TokenB: token2 };
  }
  return { TokenA: token2, TokenB: token1 };
};

const addVersaEthLiquidity = async (
  versaTokenAddress: string,
  versaToAdd: BigNumber,
  ETHToAdd: BigNumber,
  uniswapRouter: IUniswapV2Router02,
  deployer: SignerWithAddress
) => {
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

const estimateEthForVersa = async (
  versaTokenAddress: string,
  versaToAdd: BigNumber,
  uniswapRouter: IUniswapV2Router02,
  deployer: SignerWithAddress
) => {
  const WETH = await uniswapRouter.WETH();

  const uniswapV2Factory = IUniswapV2Factory__factory.connect(UNISWAP_FACTORY_ADDRESS, deployer);

  const pair = sortPair(versaTokenAddress, WETH);

  const poolAddress = await uniswapV2Factory.getPair(pair.TokenA, pair.TokenB);

  const pool = IUniswapV2Pair__factory.connect(poolAddress, deployer);

  const reserves = await pool.getReserves();
  const reservesVersa = WETH < versaTokenAddress ? reserves.reserve0 : reserves.reserve1;
  const reservesETH = WETH > versaTokenAddress ? reserves.reserve0 : reserves.reserve1;
  const ETHValue = await uniswapRouter.quote(versaToAdd, reservesVersa, reservesETH);

  return ETHValue;
};

export const getUniswapV2Router02 = async () =>
  getContract<UniswapV2Router02__factory, UniswapV2Router02>({
    contractName: "UniswapV2Router02",
    existingContractAddress: getAddress("uniswapV2Router02")
  });

async function main() {
  const [deployer] = await ethers.getSigners();

  const versaTokenAddress = getAddress("versaToken");

  const uniswapRouter = await getUniswapV2Router02();

  let ethToAdd = ETH_TO_ADD;
  if (ETH_TO_ADD.isZero()) {
    ethToAdd = await estimateEthForVersa(versaTokenAddress, VERSA_TO_ADD, uniswapRouter, deployer);
  }

  await addVersaEthLiquidity(versaTokenAddress, VERSA_TO_ADD, ethToAdd, uniswapRouter, deployer);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
