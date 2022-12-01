import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getAddress as getAddressLib } from "@versachain/addresses";
import { expect } from "chai";
import { utils } from "ethers";
import { ethers } from "hardhat";

import { encodeParams, getBitcoinTxMemo, getSwapBTCInboundData, getSwapParams } from "../scripts/versa-swap/helpers";
import { versaSwap, versaSwap__factory, versaSwapBtcInbound, versaSwapBtcInbound__factory } from "../typechain-types";
import { versaSwapBTC } from "../typechain-types/contracts/versa-swap/versaSwapBTC";
import { versaSwapBTC__factory } from "../typechain-types/factories/contracts/versa-swap/versaSwapBTC__factory";

describe("versaSwap tests", () => {
  let versaSwapContract: versaSwap;
  let versaSwapBTCContract: versaSwapBTC;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer] = accounts;
    const uniswapRouterAddr = getAddressLib({
      address: "uniswapV2Router02",
      networkName: "eth-mainnet",
      versaNetwork: "mainnet"
    });
    const wGasToken = getAddressLib({
      address: "weth9",
      networkName: "eth-mainnet",
      versaNetwork: "mainnet"
    });

    const Factory = (await ethers.getContractFactory("versaSwap")) as versaSwap__factory;
    versaSwapContract = (await Factory.deploy(wGasToken, uniswapRouterAddr)) as versaSwap;
    await versaSwapContract.deployed();

    const FactoryBTC = (await ethers.getContractFactory("versaSwapBtcInbound")) as versaSwapBtcInbound__factory;
    versaSwapBTCContract = (await FactoryBTC.deploy(wGasToken, uniswapRouterAddr)) as versaSwapBtcInbound;
    await versaSwapBTCContract.deployed();
  });

  describe("versaSwap", () => {
    it("Should do swap", async () => {
      //@todo: add test

      const fakeZRC20 = accounts[1];
      const fakeZRC20Destination = accounts[2];

      const params = getSwapParams(fakeZRC20Destination.address, deployer.address, BigNumber.from("10"));
      await versaSwapContract.onCrossChainCall(fakeZRC20.address, 0, params);
    });
  });

  describe("versaSwapBTC", () => {
    it("Should do swap", async () => {
      //@todo: add test

      const fakeZRC20 = accounts[1];
      const fakeZRC20Destination = accounts[2];

      const params = getBitcoinTxMemo("", fakeZRC20Destination.address, "5");
      await versaSwapBTCContract.onCrossChainCall(fakeZRC20.address, 0, params);
    });
  });
});
