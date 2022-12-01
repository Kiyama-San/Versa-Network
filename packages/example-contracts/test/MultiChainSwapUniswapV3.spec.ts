import { FakeContract, smock } from "@defi-wonderland/smock";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, MaxUint256 } from "@ethersproject/constants";
import { parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getAddress } from "@versanetwork/addresses";
import { IERC20__factory } from "@versanetwork/interfaces/typechain-types";
import chai, { expect } from "chai";
import { ethers } from "hardhat";

import { getMultiChainSwapUniV3, getMultiChainSwapVersaConnector } from "../lib/multi-chain-swap/MultiChainSwap.helpers";
import { getNow } from "../lib/shared/deploy.helpers";
import {
  ERC20__factory,
  IERC20,
  MultiChainSwapUniV3,
  MultiChainSwapVersaConnector,
  UniswapV2Router02__factory,
} from "../typechain-types";
import { getCustomErrorMessage, parseInteractorLog } from "./test.helpers";

chai.should();
chai.use(smock.matchers);

const swapToken = async (signer: SignerWithAddress, tokenAddress: string, expectedAmount: BigNumber) => {
  const uniswapV2RouterAddr = getAddress("uniswapV2Router02", {
    customNetworkName: "eth-mainnet",
    customVersaNetwork: "mainnet",
  });

  const uniswapRouter = UniswapV2Router02__factory.connect(uniswapV2RouterAddr, signer);

  const WETH = await uniswapRouter.WETH();
  const path = [WETH, tokenAddress];
  const tx = await uniswapRouter
    .connect(signer)
    .swapETHForExactTokens(expectedAmount, path, signer.address, (await getNow()) + 360, { value: parseEther("10") });

  await tx.wait();
};

const encoder = new ethers.utils.AbiCoder();
const HARDHAT_CHAIN_ID = 1337;

const VERSA_TO_TRANSFER = parseUnits("1");
const USDC_TO_TRANSFER = parseUnits("1", 6);

describe("MultiChainSwap tests", () => {
  let WETH: string;
  let versaTokenMock: IERC20;
  let versaTokenNonEthAddress: string;
  let USDCTokenContract: IERC20;
  let versaConnectorMock: MultiChainSwapVersaConnector;

  let multiChainSwapContractA: MultiChainSwapUniV3;
  const chainAId = 1;

  let multiChainSwapContractB: MultiChainSwapUniV3;
  const chainBId = 2;

  let versaConnectorSmock: FakeContract<MultiChainSwapVersaConnector>;
  let multiChainSwapContractWithSmock: MultiChainSwapUniV3;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let account1: SignerWithAddress;

  const clearUSDCBalance = async (account: SignerWithAddress) => {
    const balance = await USDCTokenContract.balanceOf(account.address);
    const w = ethers.Wallet.createRandom();
    const tx = await USDCTokenContract.connect(account).transfer(w.address, balance);
    await tx.wait();
  };

  const clearVersaBalance = async (account: SignerWithAddress) => {
    const balance = await versaTokenMock.balanceOf(account.address);
    const w = ethers.Wallet.createRandom();
    const tx = await versaTokenMock.connect(account).transfer(w.address, balance);
    await tx.wait();
  };

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, account1] = accounts;

    const DAI = getAddress("dai", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet",
    });

    const UNI_QUOTER_V3 = getAddress("uniswapV3Quoter", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet",
    });

    const UNI_ROUTER_V3 = getAddress("uniswapV3Router", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet",
    });

    WETH = getAddress("weth9", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet",
    });

    const USDC_ADDR = getAddress("usdc", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet",
    });

    const ERC20Factory = new ERC20__factory(deployer);
    USDCTokenContract = ERC20Factory.attach(USDC_ADDR);

    // For testing purposes we use an existing uni v3 pool
    await swapToken(deployer, DAI, parseEther("10000"));

    versaTokenNonEthAddress = DAI;
    versaTokenMock = IERC20__factory.connect(versaTokenNonEthAddress, deployer);
    versaConnectorMock = await getMultiChainSwapVersaConnector(versaTokenMock.address);
    multiChainSwapContractA = await getMultiChainSwapUniV3({
      deployParams: [versaConnectorMock.address, versaTokenNonEthAddress, UNI_ROUTER_V3, UNI_QUOTER_V3, WETH, 3000, 3000],
    });

    multiChainSwapContractB = await getMultiChainSwapUniV3({
      deployParams: [versaConnectorMock.address, versaTokenNonEthAddress, UNI_ROUTER_V3, UNI_QUOTER_V3, WETH, 3000, 3000],
    });

    versaConnectorSmock = await smock.fake("MultiChainSwapVersaConnector");
    multiChainSwapContractWithSmock = await getMultiChainSwapUniV3({
      deployParams: [
        versaConnectorSmock.address,
        versaTokenNonEthAddress,
        UNI_ROUTER_V3,
        UNI_QUOTER_V3,
        WETH,
        3000,
        3000,
      ],
    });

    const encodedCrossChainAddressB = ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]);
    multiChainSwapContractA.setInteractorByChainId(chainBId, encodedCrossChainAddressB);

    const encodedCrossChainAddressA = ethers.utils.solidityPack(["address"], [multiChainSwapContractA.address]);
    multiChainSwapContractB.setInteractorByChainId(chainAId, encodedCrossChainAddressA);

    multiChainSwapContractWithSmock.setInteractorByChainId(chainBId, encodedCrossChainAddressB);

    await clearUSDCBalance(deployer);
    await clearUSDCBalance(account1);
    await clearVersaBalance(account1);
  });

  describe("swapTokensForTokensCrossChainUniswapV3", () => {
    it("Should revert if the destinationChainId is not in the storage", async () => {
      await expect(
        multiChainSwapContractA.swapETHForTokensCrossChain(
          ethers.utils.solidityPack(["address"], [account1.address]),
          versaTokenMock.address,
          false,
          0,
          10,
          MaxUint256,
          {
            value: parseUnits("1"),
          }
        )
      ).to.be.revertedWith(getCustomErrorMessage("InvalidDestinationChainId"));
    });

    it("Should revert if the sourceInputToken isn't provided", async () => {
      await expect(
        multiChainSwapContractA.swapTokensForTokensCrossChain(
          AddressZero,
          BigNumber.from(10),
          ethers.utils.solidityPack(["address"], [account1.address]),
          versaTokenMock.address,
          false,
          0,
          chainBId,
          MaxUint256
        )
      ).to.be.revertedWith(getCustomErrorMessage("MissingSourceInputTokenAddress"));
    });

    it("Should revert if the destinationOutToken isn't provided", async () => {
      await expect(
        multiChainSwapContractA.swapTokensForTokensCrossChain(
          versaTokenMock.address,
          BigNumber.from(10),
          ethers.utils.solidityPack(["address"], [account1.address]),
          AddressZero,
          false,
          0,
          chainBId,
          MaxUint256
        )
      ).to.be.revertedWith(getCustomErrorMessage("OutTokenInvariant"));
    });

    it("Should trade ETH for Versa", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapETHForTokensCrossChain(
        ethers.utils.solidityPack(["address"], [account1.address]),
        versaTokenMock.address,
        false,
        0,
        chainBId,
        MaxUint256,
        { value: VERSA_TO_TRANSFER }
      );
      const result = await tx3.wait();
      expect(await versaTokenMock.balanceOf(account1.address)).to.be.gt(0);

      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(1);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(0);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should trade Versa for ETH", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      const initialETHbalance = await ethers.provider.getBalance(account1.address);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        versaTokenMock.address,
        VERSA_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        AddressZero,
        true,
        0,
        chainBId,
        MaxUint256
      );
      const result = await tx3.wait();
      expect(await ethers.provider.getBalance(account1.address)).to.be.gt(initialETHbalance);

      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(1);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(0);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should not perform any trade if the input token is Versa", async () => {
      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        versaTokenMock.address,
        VERSA_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        versaTokenMock.address,
        false,
        0,
        chainBId,
        MaxUint256
      );
      await tx3.wait();
      expect(await versaTokenMock.balanceOf(account1.address)).to.be.gt(0);

      const result = await tx3.wait();
      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(0);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should trade the input token for Versa", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDCTokenContract.address,
        USDC_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        versaTokenMock.address,
        false,
        0,
        chainBId,
        MaxUint256
      );
      const result = await tx3.wait();
      expect(await versaTokenMock.balanceOf(account1.address)).to.be.gt(0);

      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(1);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(0);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should trade versa for the output token", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        versaTokenMock.address,
        VERSA_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDCTokenContract.address,
        false,
        0,
        chainBId,
        MaxUint256
      );
      const result = await tx3.wait();
      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.gt(0);

      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(1);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should trade input token for versa and versa for the output token", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await zetaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDCTokenContract.address,
        USDC_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDCTokenContract.address,
        false,
        0,
        chainBId,
        MaxUint256
      );
      const result = await tx3.wait();
      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.gt(0);

      const eventNames = parseInteractorLog(result.logs);
      expect(eventNames.filter(e => e === "EthExchangedForVersa")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "TokenExchangedForVersa")).to.have.lengthOf(1);
      expect(eventNames.filter(e => e === "VersaExchangedForEth")).to.have.lengthOf(0);
      expect(eventNames.filter(e => e === "VersaExchangedForToken")).to.have.lengthOf(1);

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    it("Should call connector.send", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractWithSmock.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractWithSmock.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractWithSmock.swapTokensForTokensCrossChain(
        USDCTokenContract.address,
        USDC_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDCTokenContract.address,
        false,
        0,
        chainBId,
        MaxUint256
      );

      versaConnectorSmock.send.atCall(0).should.be.called;
    });

    it("Should emit a SentTokenSwap event", async () => {
      await swapToken(deployer, USDCTokenContract.address, USDC_TO_TRANSFER);

      expect(await USDCTokenContract.balanceOf(account1.address)).to.be.eq(0);

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx2 = await USDCTokenContract.approve(multiChainSwapContractA.address, USDC_TO_TRANSFER);
      await tx2.wait();

      const tx3 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDCTokenContract.address,
        USDC_TO_TRANSFER,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDCTokenContract.address,
        false,
        0,
        chainBId,
        MaxUint256
      );
      await tx3.wait();

      const swappedFilter = multiChainSwapContractB.filters.Swapped();
      const e1 = await multiChainSwapContractB.queryFilter(swappedFilter);
      expect(e1.length).to.equal(1);
    });

    describe("onVersaMessage", () => {
      it("Should revert if the caller is not VersaConnector", async () => {
        await expect(
          multiChainSwapContractA.onVersaMessage({
            destinationAddress: multiChainSwapContractB.address,
            message: encoder.encode(["address"], [multiChainSwapContractA.address]),
            sourceChainId: chainBId,
            versaTxSenderAddress: ethers.utils.solidityPack(["address"], [multiChainSwapContractA.address]),
            versaValue: 0,
          })
        ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
      });

      it("Should revert if the versaTxSenderAddress it not in interactorsByChainId", async () => {
        await expect(
          versaConnectorMock.callOnVersaMessage(
            ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]),
            chainAId,
            multiChainSwapContractB.address,
            0,
            encoder.encode(["address"], [multiChainSwapContractB.address])
          )
        ).to.be.revertedWith(getCustomErrorMessage("InvalidVersaMessageCall"));
      });
    });

    describe("onVersaRevert", () => {
      it("Should revert if the caller is not VersaConnector", async () => {
        await expect(
          multiChainSwapContractA.onVersaRevert({
            destinationAddress: ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]),
            destinationChainId: chainBId,
            message: encoder.encode(["address"], [multiChainSwapContractA.address]),
            remainingVersaValue: 0,
            sourceChainId: chainAId,
            versaTxSenderAddress: deployer.address,
          })
        ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
      });

      it("Should trade the returned Versa back for the input versa token", async () => {
        const tx1 = await versaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("10"));
        await tx1.wait();

        const originAddressInitialVersaBalance = await versaTokenMock.balanceOf(deployer.address);

        const message = encoder.encode(
          ["bytes32", "address", "address", "uint256", "bytes", "address", "bool", "uint256", "bool"],
          [
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            deployer.address,
            zetaTokenMock.address,
            0,
            "0xffffffff",
            multiChainSwapContractA.address,
            true,
            0,
            false,
          ]
        );

        const tx2 = await versaConnectorMock.callOnVersaRevert(
          multiChainSwapContractA.address,
          HARDHAT_CHAIN_ID,
          chainBId,
          encoder.encode(["address"], [multiChainSwapContractB.address]),
          10,
          0,
          message
        );

        await tx2.wait();

        const originAddressFinalVersaBalance = await versaTokenMock.balanceOf(deployer.address);
        expect(originAddressFinalVersaBalance).to.be.eq(originAddressInitialVersaBalance.add(10));
      });

      it("Should trade the returned Versa back for the input token", async () => {
        const tx1 = await versaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
        await tx1.wait();

        const originAddressInitialUSDCBalance = await USDCTokenContract.balanceOf(deployer.address);

        const message = encoder.encode(
          ["bytes32", "address", "address", "uint256", "bytes", "address", "bool", "uint256", "bool"],
          [
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            deployer.address,
            USDCTokenContract.address,
            0,
            "0xffffffff",
            multiChainSwapContractA.address,
            true,
            0,
            false,
          ]
        );

        const tx2 = await versaConnectorMock.callOnVersaRevert(
          multiChainSwapContractA.address,
          HARDHAT_CHAIN_ID,
          chainBId,
          encoder.encode(["address"], [multiChainSwapContractB.address]),
          VERSA_TO_TRANSFER,
          0,
          message
        );

        await tx2.wait();

        const originAddressFinalUSDCBalance = await USDCTokenContract.balanceOf(deployer.address);
        expect(originAddressFinalUSDCBalance).to.be.lt(originAddressInitialUSDCBalance.add(USDC_TO_TRANSFER));
        expect(originAddressFinalUSDCBalance).to.be.gt(
          originAddressInitialUSDCBalance
            .add(USDC_TO_TRANSFER)
            .mul(990)
            .div(1000)
        );
      });

      it("Should trade the returned ETH back to the caller", async () => {
        const tx1 = await versaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
        await tx1.wait();

        const originAddressInitialETHBalance = await ethers.provider.getBalance(deployer.address);

        const message = encoder.encode(
          ["bytes32", "address", "address", "uint256", "bytes", "address", "bool", "uint256", "bool"],
          [
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            deployer.address,
            WETH,
            0,
            "0xffffffff",
            multiChainSwapContractA.address,
            true,
            0,
            true,
          ]
        );

        const tx2 = await versaConnectorMock.callOnVersaRevert(
          multiChainSwapContractA.address,
          HARDHAT_CHAIN_ID,
          chainBId,
          encoder.encode(["address"], [multiChainSwapContractB.address]),
          parseUnits("2"),
          0,
          message
        );

        await tx2.wait();

        const originAddressFinalETHBalance = await ethers.provider.getBalance(deployer.address);
        expect(originAddressFinalETHBalance).to.be.gt(originAddressInitialETHBalance.add("1"));
        expect(originAddressFinalETHBalance).to.be.lt(
          originAddressInitialETHBalance
            .add("1")
            .mul(1005)
            .div(1000)
        );
      });

      it("Should emit a RevertedSwap event", async () => {
        const tx1 = await versaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("10"));
        await tx1.wait();

        const message = encoder.encode(
          ["bytes32", "address", "address", "uint256", "bytes", "address", "bool", "uint256", "bool"],
          [
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            deployer.address,
            WETH,
            0,
            "0xffffffff",
            multiChainSwapContractA.address,
            true,
            0,
            true,
          ]
        );

        const tx2 = await versaConnectorMock.callOnVersaRevert(
          multiChainSwapContractA.address,
          HARDHAT_CHAIN_ID,
          chainBId,
          encoder.encode(["address"], [multiChainSwapContractB.address]),
          parseUnits("2"),
          0,
          message
        );

        const swappedFilter = multiChainSwapContractA.filters.RevertedSwap();
        const e1 = await multiChainSwapContractA.queryFilter(swappedFilter);
        expect(e1.length).to.equal(1);
      });
    });
  });
});
