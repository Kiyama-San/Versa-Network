import { MaxUint256 } from "@ethersproject/constants";
import { parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  IERC20,
  IERC20__factory,
  INonfungiblePositionManager,
  INonfungiblePositionManager__factory,
  IPoolInitializer__factory,
  UniswapV2Router02__factory,
  VersaTokenConsumer,
  VersaTokenConsumerUniV2,
  VersaTokenConsumerUniV3
} from "@Versachain/interfaces/typechain-types";
import chai, { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import {
  deployVersaNonEth,
  getVersaTokenConsumerUniV2Strategy,
  getVersaTokenConsumerUniV3Strategy
} from "../lib/contracts.helpers";
import { parseVersaConsumerLog } from "./test.helpers";

chai.should();

describe("VersaTokenConsumer tests", () => {
  let uniswapV2RouterAddr: string;
  let uniswapV3RouterAddr: string;
  let USDCAddr: string;

  let VersaTokenConsumerUniV2: VersaTokenConsumerUniV2;
  let VersaTokenConsumerUniV3: VersaTokenConsumerUniV3;
  let VersaTokenNonEthAddress: string;
  let VersaTokenNonEth: IERC20;

  let accounts: SignerWithAddress[];
  let tssUpdater: SignerWithAddress;
  let tssSigner: SignerWithAddress;
  let randomSigner: SignerWithAddress;

  const getNow = async () => {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  };

  const swapToken = async (signer: SignerWithAddress, tokenAddress: string, expectedAmount: BigNumber) => {
    const uniswapRouter = UniswapV2Router02__factory.connect(uniswapV2RouterAddr, signer);

    const WETH = await uniswapRouter.WETH();
    const path = [WETH, tokenAddress];
    const tx = await uniswapRouter
      .connect(signer)
      .swapETHForExactTokens(expectedAmount, path, signer.address, (await getNow()) + 360, { value: parseEther("10") });

    await tx.wait();
  };

  /**
   * @todo (andy): WIP, not in use yet
   */
  const createPoolV3 = async (signer: SignerWithAddress, tokenAddress: string) => {
    const DAI = getAddress("dai", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const UNI_NFT_MANAGER_V3 = getAddress("uniswapV3NftManager", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const USDC = getAddress("usdc", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    await swapToken(signer, DAI, parseUnits("10000", 18));

    const token = IERC20__factory.connect(USDC, signer);
    const tx1 = await token.approve(UNI_NFT_MANAGER_V3, MaxUint256);
    await tx1.wait();

    const token2 = IERC20__factory.connect(DAI, signer);
    const tx2 = await token2.approve(UNI_NFT_MANAGER_V3, MaxUint256);
    await tx2.wait();

    const uniswapRouter = INonfungiblePositionManager__factory.connect(UNI_NFT_MANAGER_V3, signer);

    const uniswapNFTManager = IPoolInitializer__factory.connect(UNI_NFT_MANAGER_V3, signer);
    const tx3 = await uniswapNFTManager.createAndInitializePoolIfNecessary(
      USDC,
      DAI,
      3000,
      "80000000000000000000000000000"
    );
    await tx3.wait();

    const params: INonfungiblePositionManager.MintParamsStruct = {
      amount0Desired: parseEther("10"),
      amount0Min: 0,
      amount1Desired: parseEther("10"),
      amount1Min: 0,
      deadline: (await getNow()) + 360,
      fee: 3000,
      recipient: signer.address,
      tickLower: 193,
      tickUpper: 194,
      token0: USDC,
      token1: DAI
    };

    const tx4 = await uniswapRouter.mint(params);
    await tx4.wait();
  };

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [tssUpdater, tssSigner, randomSigner] = accounts;

    VersaTokenNonEth = await deployVersaNonEth({
      args: [tssSigner.address, tssUpdater.address]
    });

    uniswapV2RouterAddr = getAddress("uniswapV2Router02", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const DAI = getAddress("dai", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const UNI_QUOTER_V3 = getAddress("uniswapV3Quoter", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const UNI_ROUTER_V3 = getAddress("uniswapV3Router", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    const WETH9 = getAddress("weth9", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    USDCAddr = getAddress("usdc", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    // For testing purposes we use an existing uni v3 pool
    await swapToken(tssUpdater, DAI, parseEther("10000"));
    await swapToken(randomSigner, DAI, parseEther("10000"));
    await swapToken(randomSigner, DAI, parseEther("10000"));
    await swapToken(randomSigner, DAI, parseEther("10000"));
    await swapToken(randomSigner, DAI, parseEther("10000"));
    VersaTokenNonEthAddress = DAI;
    VersaTokenNonEth = IERC20__factory.connect(VersaTokenNonEthAddress, tssSigner);

    VersaTokenConsumerUniV2 = await getVersaTokenConsumerUniV2Strategy({
      deployParams: [VersaTokenNonEthAddress, uniswapV2RouterAddr]
    });

    uniswapV3RouterAddr = UNI_ROUTER_V3;
    VersaTokenConsumerUniV3 = await getVersaTokenConsumerUniV3Strategy({
      deployParams: [VersaTokenNonEthAddress, uniswapV3RouterAddr, UNI_QUOTER_V3, WETH9, 3000, 3000]
    });
  });

  describe("getVersaFromEth", () => {
    const shouldGetVersaFromETH = async (VersaTokenConsumer: VersaTokenConsumer) => {
      const initialVersaBalance = await VersaTokenNonEth.balanceOf(randomSigner.address);
      const tx = await VersaTokenConsumer.getVersaFromEth(randomSigner.address, 1, { value: parseEther("1") });

      const result = await tx.wait();
      const eventNames = parseVersaConsumerLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(1);

      const finalVersaBalance = await VersaTokenNonEth.balanceOf(randomSigner.address);
      expect(finalVersaBalance).to.be.gt(initialVersaBalance);
    };

    it("Should get Versa from eth using UniV2", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV2.connect(randomSigner);
      await shouldGetVersaFromETH(VersaTokenConsumer);
    });

    it("Should get Versa from eth using UniV3", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV3.connect(randomSigner);
      await shouldGetVersaFromETH(VersaTokenConsumer);
    });
  });

  describe("getVersaFromToken", () => {
    const shouldGetVersaFromToken = async (VersaTokenConsumer: VersaTokenConsumer) => {
      const USDCContract = IERC20__factory.connect(USDCAddr, randomSigner);
      await swapToken(randomSigner, USDCAddr, parseUnits("10000", 6));

      const initialVersaBalance = await VersaTokenNonEth.balanceOf(randomSigner.address);
      const tx1 = await USDCContract.approve(VersaTokenConsumer.address, MaxUint256);
      await tx1.wait();

      const tx2 = await VersaTokenConsumer.getVersaFromToken(randomSigner.address, 1, USDCAddr, parseUnits("100", 6));
      const result = await tx2.wait();

      const eventNames = parseVersaConsumerLog(result.logs);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(1);

      const finalVersaBalance = await VersaTokenNonEth.balanceOf(randomSigner.address);
      expect(finalVersaBalance).to.be.gt(initialVersaBalance);
    };

    it("Should get Versa from token using UniV2", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV2.connect(randomSigner);
      await shouldGetVersaFromToken(VersaTokenConsumer);
    });

    it("Should get Versa from token using UniV3", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV3.connect(randomSigner);
      await shouldGetVersaFromToken(VersaTokenConsumer);
    });
  });

  describe("getEthFromVersa", () => {
    const shouldGetETHFromVersa = async (VersaTokenConsumer: VersaTokenConsumer) => {
      const initialEthBalance = await ethers.provider.getBalance(randomSigner.address);
      const tx1 = await VersaTokenNonEth.connect(randomSigner).approve(VersaTokenConsumer.address, MaxUint256);
      await tx1.wait();

      const tx2 = await VersaTokenConsumer.getEthFromVersa(randomSigner.address, 1, parseUnits("5000", 18));
      const result = await tx2.wait();

      const eventNames = parseVersaConsumerLog(result.logs);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(1);

      const finalEthBalance = await ethers.provider.getBalance(randomSigner.address);
      expect(finalEthBalance).to.be.gt(initialEthBalance);
    };

    it("Should get eth from Versa using UniV2", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV2.connect(randomSigner);
      await shouldGetETHFromVersa(VersaTokenConsumer);
    });

    it("Should get eth from Versa using UniV3", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV3.connect(randomSigner);

      await shouldGetETHFromVersa(VersaTokenConsumer);
    });
  });

  describe("getTokenFromVersa", () => {
    const shouldGetTokenFromVersa = async (VersaTokenConsumer: VersaTokenConsumer) => {
      const USDCContract = IERC20__factory.connect(USDCAddr, randomSigner);

      const initialTokenBalance = await USDCContract.balanceOf(randomSigner.address);
      const tx1 = await VersaTokenNonEth.connect(randomSigner).approve(VersaTokenConsumer.address, MaxUint256);
      await tx1.wait();

      const tx2 = await VersaTokenConsumer.getTokenFromVersa(randomSigner.address, 1, USDCAddr, parseUnits("5000", 18));
      const result = await tx2.wait();

      const eventNames = parseVersaConsumerLog(result.logs);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(1);

      const finalTokenBalance = await USDCContract.balanceOf(randomSigner.address);
      expect(finalTokenBalance).to.be.gt(initialTokenBalance);
    };

    it("Should get token from Versa using UniV2", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV2.connect(randomSigner);
      await shouldGetTokenFromVersa(VersaTokenConsumer);
    });

    it("Should get token from Versa using UniV3", async () => {
      const VersaTokenConsumer = VersaTokenConsumerUniV3.connect(randomSigner);
      await shouldGetTokenFromVersa(VersaTokenConsumer);
    });
  });
});
