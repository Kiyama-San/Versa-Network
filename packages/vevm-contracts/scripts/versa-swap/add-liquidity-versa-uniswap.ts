import { MaxUint256 } from "@ethersproject/constants";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getChainId } from "@versachain/addresses";
import { NetworkName } from "@versachain/addresses";
import { getAddress } from "@versachain/addresses";
import { getGasSymbolByNetwork } from "@versachain/addresses-tools";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import {
  ERC20,
  ERC20__factory,
  IUniswapV2Factory__factory,
  IUniswapV2Pair__factory,
  IUniswapV2Router02,
  SystemContract__factory,
  UniswapV2Router02__factory
} from "../../typechain-types";
import { SYSTEM_CONTRACT } from "../systemConstants";

const BTC_TO_ADD = parseUnits("0", 8);
const ETH_TO_ADD = parseUnits("1500");
const MATIC_TO_ADD = parseUnits("1500");
const BNB_TO_ADD = parseUnits("100");

const VERSA_TO_ADD = parseUnits("0");

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

const addTokenEthLiquidity = async (
  tokenContract: ERC20,
  tokenAmountToAdd: BigNumber,
  ETHToAdd: BigNumber,
  uniswapRouter: IUniswapV2Router02,
  deployer: SignerWithAddress
) => {
  const tx1 = await tokenContract.approve(uniswapRouter.address, MaxUint256);
  await tx1.wait();

  const tx2 = await uniswapRouter.addLiquidityETH(
    tokenContract.address,
    tokenAmountToAdd,
    0,
    0,
    deployer.address,
    (await getNow()) + 360,
    { gasLimit: 10_000_000, value: ETHToAdd }
  );
  await tx2.wait();
};

const estimateversaForToken = async (
  network: NetworkName,
  WversaAddress: string,
  uniswapFactoryAddress: string,
  tokenContract: ERC20,
  tokenAmountToAdd: BigNumber,
  deployer: SignerWithAddress
) => {
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(uniswapFactoryAddress, deployer);

  const pair = sortPair(tokenContract.address, WversaAddress);

  const poolAddress = await uniswapV2Factory.getPair(pair.TokenA, pair.TokenB);

  const pool = IUniswapV2Pair__factory.connect(poolAddress, deployer);

  const reserves = await pool.getReserves();

  const reservesversa = WversaAddress < tokenContract.address ? reserves.reserve0 : reserves.reserve1;
  const reservesToken = WversaAddress > tokenContract.address ? reserves.reserve0 : reserves.reserve1;

  const versaValue = reservesversa.mul(tokenAmountToAdd).div(reservesToken);

  const tokenDecimals = await tokenContract.decimals();
  console.log(
    `versa/${getGasSymbolByNetwork(network)} reserves ${formatUnits(reservesversa)}/${formatUnits(
      reservesToken,
      tokenDecimals
    )}`
  );
  return versaValue;
};

async function addLiquidity(
  network: NetworkName,
  tokenAmountToAdd: BigNumber,
  WversaAddress: string,
  uniswapFactoryAddress: string,
  uniswapRouterAddress: string
) {
  console.log(`Adding liquidity for: ${network}`);
  const initLiquidityPool = !versa_TO_ADD.isZero();

  const [deployer] = await ethers.getSigners();

  const systemContract = await SystemContract__factory.connect(SYSTEM_CONTRACT, deployer);
  const uniswapRouter = await UniswapV2Router02__factory.connect(uniswapRouterAddress, deployer);

  const tokenAddress = await systemContract.gasCoinZRC20ByChainId(getChainId(network));
  const tokenContract = ERC20__factory.connect(tokenAddress, deployer);
  const tokenDecimals = await tokenContract.decimals();

  const versaToAdd = initLiquidityPool
    ? versa_TO_ADD
    : await estimateversaForToken(
        network,
        WversaAddress,
        uniswapFactoryAddress,
        tokenContract,
        tokenAmountToAdd,
        deployer
      );

  console.log(
    `versa/${getGasSymbolByNetwork(network)} to add ${formatUnits(versaToAdd)}/${formatUnits(
      tokenAmountToAdd,
      tokenDecimals
    )}`
  );

  // await addTokenEthLiquidity(tokenContract, tokenAmountToAdd, versaToAdd, uniswapRouter, deployer);
}
async function main() {
  const Wversa_ADDRESS = getAddress({
    address: "weth9",
    networkName: "athens",
    versaNetwork: "athens"
  });

  const UNISWAP_FACTORY_ADDRESS = getAddress({
    address: "uniswapV2Factory",
    networkName: "athens",
    versaNetwork: "athens"
  });

  const UNISWAP_ROUTER_ADDRESS = getAddress({
    address: "uniswapV2Router02",
    networkName: "athens",
    versaNetwork: "athens"
  });

  if (!ETH_TO_ADD.isZero()) {
    await addLiquidity("goerli", ETH_TO_ADD, Wversa_ADDRESS, UNISWAP_FACTORY_ADDRESS, UNISWAP_ROUTER_ADDRESS);
  }
  if (!MATIC_TO_ADD.isZero()) {
    await addLiquidity("polygon-mumbai", MATIC_TO_ADD, Wversa_ADDRESS, UNISWAP_FACTORY_ADDRESS, UNISWAP_ROUTER_ADDRESS);
  }
  if (!BNB_TO_ADD.isZero()) {
    await addLiquidity("bsc-testnet", BNB_TO_ADD, Wversa_ADDRESS, UNISWAP_FACTORY_ADDRESS, UNISWAP_ROUTER_ADDRESS);
  }
  if (!BTC_TO_ADD.isZero()) {
    await addLiquidity("bitcoin-test", BTC_TO_ADD, Wversa_ADDRESS, UNISWAP_FACTORY_ADDRESS, UNISWAP_ROUTER_ADDRESS);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
