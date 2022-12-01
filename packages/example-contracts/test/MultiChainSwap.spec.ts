import { FakeContract, smock } from "@defi-wonderland/smock";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, MaxUint256 } from "@ethersproject/constants";
import { parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { ethers } from "hardhat";

import { getMultiChainSwapUniV2, getMultiChainSwapVersaConnector } from "../lib/multi-chain-swap/MultiChainSwap.helpers";
import { getAddress } from "../lib/shared/address.helpers";
import { getNow, getVersaMock } from "../lib/shared/deploy.helpers";
import {
  ERC20__factory,
  IERC20,
  IUniswapV2Router02,
  MultiChainSwapUniV2,
  MultiChainSwapVersaConnector,
  UniswapV2Router02__factory
} from "../typechain-types";
import { USDC_ADDR } from "./MultiChainSwap.constants";
import { getCustomErrorMessage, parseUniswapLog, parseVersaLog } from "./test.helpers";

chai.should();
chai.use(smock.matchers);

const HARDHAT_CHAIN_ID = 1337;

describe("MultiChainSwap tests", () => {
  let uniswapRouterFork: IUniswapV2Router02;
  let WETH: string;
  let versaTokenMock: IERC20;
  let USDCTokenContract: IERC20;
  let versaConnectorMock: MultiChainSwapVersaConnector;

  let multiChainSwapContractA: MultiChainSwapUniV2;
  const chainAId = 1;

  let multiChainSwapContractB: MultiChainSwapUniV2;
  const chainBId = 2;

  let versaConnectorSmock: FakeContract<MultiChainSwapVersaConnector>;
  let multiChainSwapContractWithSmock: MultiChainSwapUniV2;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let account1: SignerWithAddress;

  const encoder = new ethers.utils.AbiCoder();

  const VERSA_USDC_PRICE = BigNumber.from("1455462180");

  const addVersaEthLiquidity = async () => {
    const tx1 = await versaTokenMock.approve(uniswapRouterFork.address, MaxUint256);
    await tx1.wait();

    // 2 VERSA = 1 ETH
    const tx2 = await uniswapRouterFork.addLiquidityETH(
      versaTokenMock.address,
      parseUnits("1000"),
      0,
      0,
      deployer.address,
      (await getNow()) + 360,
      { value: parseUnits("500") }
    );
    await tx2.wait();
  };

  const clearUSDCBalance = async (account: SignerWithAddress) => {
    const balance = await USDCTokenContract.balanceOf(account.address);
    const w = ethers.Wallet.createRandom();
    const tx = await USDCTokenContract.connect(account).transfer(w.address, balance);
    await tx.wait();
  };

  const swapVersaToUSDC = async (signer: SignerWithAddress, versaValueAndGas: BigNumber) => {
    const path = [versaTokenMock.address, WETH, USDC_ADDR];
    const tx = await uniswapRouterFork
      .connect(signer)
      .swapExactTokensForTokens(versaValueAndGas, 0, path, signer.address, (await getNow()) + 360);

    await tx.wait();
  };

  beforeEach(async () => {
    const uniswapRouterAddr = getAddress("uniswapV2Router02", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });
    accounts = await ethers.getSigners();
    [deployer, account1] = accounts;

    const uniswapRouterFactory = new UniswapV2Router02__factory(deployer);
    uniswapRouterFork = uniswapRouterFactory.attach(uniswapRouterAddr);

    WETH = await uniswapRouterFork.WETH();

    versaTokenMock = await getVersaMock();
    versaConnectorMock = await getMultiChainSwapVersaConnector(versaTokenMock.address);

    const ERC20Factory = new ERC20__factory(deployer);
    USDCTokenContract = ERC20Factory.attach(USDC_ADDR);

    multiChainSwapContractA = await getMultiChainSwapUniV2({
      deployParams: [versaConnectorMock.address, versaTokenMock.address, uniswapRouterAddr]
    });

    multiChainSwapContractB = await getMultiChainSwapUniV2({
      deployParams: [versaConnectorMock.address, versaTokenMock.address, uniswapRouterAddr]
    });

    versaConnectorSmock = await smock.fake("MultiChainSwapVersaConnector");
    multiChainSwapContractWithSmock = await getMultiChainSwapUniV2({
      deployParams: [versaConnectorSmock.address, versaTokenMock.address, uniswapRouterAddr]
    });

    const encodedCrossChainAddressB = ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]);
    multiChainSwapContractA.setInteractorByChainId(chainBId, encodedCrossChainAddressB);
    multiChainSwapContractWithSmock.setInteractorByChainId(chainBId, encodedCrossChainAddressB);

    const encodedCrossChainAddressA = ethers.utils.solidityPack(["address"], [multiChainSwapContractA.address]);
    multiChainSwapContractB.setInteractorByChainId(chainAId, encodedCrossChainAddressA);

    await clearUSDCBalance(deployer);
    await clearUSDCBalance(account1);
  });

  describe("swapTokensForTokensCrossChain", () => {
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
            value: parseUnits("1")
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

    it("Should not perform any trade if the input token is Zeta", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractA.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        versaTokenMock.address,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        versaTokenMock.address,
        false,
        0,
        chainBId,
        MaxUint256
      );

      const result = await tx2.wait();
      const eventNames = parseUniswapLog(result.logs);
      expect(eventNames.filter(e => e === "Swap")).to.have.lengthOf(0);
    });

    it("Should trade the input token for Versa", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractA.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDC_ADDR,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        versaTokenMock.address,
        false,
        0,
        chainBId,
        MaxUint256
      );

      const result = await tx2.wait();
      const eventNames = parseUniswapLog(result.logs);
      expect(eventNames.filter(e => e === "Swap")).to.have.lengthOf(2);
    });

    it("Should trade versa for the output token", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractA.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        versaTokenMock.address,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId,
        MaxUint256
      );

      const result = await tx2.wait();
      const eventNames = parseUniswapLog(result.logs);
      expect(eventNames.filter(e => e === "Swap")).to.have.lengthOf(2);
    });

    it("Should trade input token for versa and versa for the output token", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractA.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDC_ADDR,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId,
        MaxUint256
      );

      const result = await tx2.wait();
      const eventNames = parseUniswapLog(result.logs);
      expect(eventNames.filter(e => e === "Swap")).to.have.lengthOf(4);
    });

    it("Should call connector.send", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractWithSmock.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractWithSmock.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractWithSmock.swapTokensForTokensCrossChain(
        USDC_ADDR,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId,
        MaxUint256
      );

      versaConnectorSmock.send.atCall(0).should.be.called;
    });

    it("Should emit a SentTokenSwap event", async () => {
      await addVersaEthLiquidity();
      await swapVersaToUSDC(deployer, parseUnits("10"));

      const originAddressInitialVersaBalance = await versaTokenMock.balanceOf(deployer.address);
      expect(await versaTokenMock.balanceOf(account1.address)).to.be.eq(0);

      const VERSA_TO_TRANSFER = parseUnits("1");

      const tx1 = await versaTokenMock.approve(multiChainSwapContractA.address, VERSA_TO_TRANSFER);
      await tx1.wait();

      const tx3 = await USDCTokenContract.approve(multiChainSwapContractA.address, VERSA_USDC_PRICE);
      await tx3.wait();

      const tx2 = await multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDC_ADDR,
        VERSA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId,
        MaxUint256
      );

      const result = await tx2.wait();
      const eventNames = parseZetaLog(result.logs);

      expect(eventNames.filter(e => e === "Swapped")).to.have.lengthOf(1);
    });

    it("Should revert if the destinationChainId is not in the storage", async () => {
      const call = multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDC_ADDR,
        ZETA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId + 5,
        MaxUint256
      );

      await expect(call).to.be.revertedWith(getCustomErrorMessage("InvalidDestinationChainId"));
    });

    it("Should revert if the sourceInputToken isn't provided", async () => {
      const call = multiChainSwapContractA.swapTokensForTokensCrossChain(
        AddressZero,
        ZETA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        USDC_ADDR,
        false,
        0,
        chainBId,
        MaxUint256
      );

      await expect(call).to.be.revertedWith(getCustomErrorMessage("MissingSourceInputTokenAddress"));
    });

    it("Should revert if the destinationOutToken isn't provided", async () => {
      const call = multiChainSwapContractA.swapTokensForTokensCrossChain(
        USDC_ADDR,
        ZETA_USDC_PRICE,
        ethers.utils.solidityPack(["address"], [account1.address]),
        AddressZero,
        false,
        0,
        chainBId,
        MaxUint256
      );

      await expect(call).to.be.revertedWith(getCustomErrorMessage("OutTokenInvariant"));
    });
  });

  describe("onZetaMessage", () => {
    it("Should revert if the caller is not ZetaConnector", async () => {
      await expect(
        multiChainSwapContractA.onZetaMessage({
          destinationAddress: multiChainSwapContractB.address,
          message: encoder.encode(["address"], [multiChainSwapContractA.address]),
          sourceChainId: chainBId,
          zetaTxSenderAddress: ethers.utils.solidityPack(["address"], [multiChainSwapContractA.address]),
          zetaValue: 0
        })
      ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
    });

    it("Should revert if the zetaTxSenderAddress it not in interactorsByChainId", async () => {
      await expect(
        zetaConnectorMock.callOnZetaMessage(
          ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]),
          chainAId,
          multiChainSwapContractB.address,
          0,
          encoder.encode(["address"], [multiChainSwapContractB.address])
        )
      ).to.be.revertedWith(getCustomErrorMessage("InvalidZetaMessageCall"));
    });
  });

  describe("onZetaRevert", () => {
    it("Should revert if the caller is not ZetaConnector", async () => {
      await expect(
        multiChainSwapContractA.onZetaRevert({
          destinationAddress: ethers.utils.solidityPack(["address"], [multiChainSwapContractB.address]),
          destinationChainId: chainBId,
          message: encoder.encode(["address"], [multiChainSwapContractA.address]),
          remainingZetaValue: 0,
          sourceChainId: chainAId,
          zetaTxSenderAddress: deployer.address
        })
      ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
    });

    it("Should trade the returned Zeta back for the input zeta token", async () => {
      await addZetaEthLiquidity();
      await swapZetaToUSDC(deployer, parseUnits("10"));

      const tx1 = await zetaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
      await tx1.wait();

      const originAddressInitialZetaBalance = await zetaTokenMock.balanceOf(deployer.address);

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
          false
        ]
      );

      const tx2 = await zetaConnectorMock.callOnZetaRevert(
        multiChainSwapContractA.address,
        HARDHAT_CHAIN_ID,
        chainBId,
        encoder.encode(["address"], [multiChainSwapContractB.address]),
        10,
        0,
        message
      );

      await tx2.wait();

      const originAddressFinalZetaBalance = await zetaTokenMock.balanceOf(deployer.address);
      expect(originAddressFinalZetaBalance).to.be.eq(originAddressInitialZetaBalance.add(10));
    });

    it("Should trade the returned Zeta back for the input token", async () => {
      await addZetaEthLiquidity();
      await swapZetaToUSDC(deployer, parseUnits("10"));

      const tx1 = await zetaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
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
          false
        ]
      );

      const tx2 = await zetaConnectorMock.callOnZetaRevert(
        multiChainSwapContractA.address,
        HARDHAT_CHAIN_ID,
        chainBId,
        encoder.encode(["address"], [multiChainSwapContractB.address]),
        parseUnits("1"),
        0,
        message
      );

      await tx2.wait();

      const originAddressFinalUSDCBalance = await USDCTokenContract.balanceOf(deployer.address);
      expect(originAddressFinalUSDCBalance).to.be.lt(originAddressInitialUSDCBalance.add(ZETA_USDC_PRICE));
      expect(originAddressFinalUSDCBalance).to.be.gt(
        originAddressInitialUSDCBalance
          .add(ZETA_USDC_PRICE)
          .mul(995)
          .div(1000)
      );
    });

    it("Should trade the returned ETH back to the caller", async () => {
      await addZetaEthLiquidity();
      await swapZetaToUSDC(deployer, parseUnits("10"));

      const tx1 = await zetaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
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
          true
        ]
      );

      const tx2 = await zetaConnectorMock.callOnZetaRevert(
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
      await addZetaEthLiquidity();
      await swapZetaToUSDC(deployer, parseUnits("10"));

      const tx1 = await zetaTokenMock.transfer(multiChainSwapContractA.address, parseUnits("100"));
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
          true
        ]
      );

      const tx2 = await zetaConnectorMock.callOnZetaRevert(
        multiChainSwapContractA.address,
        HARDHAT_CHAIN_ID,
        chainBId,
        encoder.encode(["address"], [multiChainSwapContractB.address]),
        parseUnits("2"),
        0,
        message
      );

      const result = await tx2.wait();
      const eventNames = parseZetaLog(result.logs);
      expect(eventNames.filter(e => e === "RevertedSwap")).to.have.lengthOf(1);
    });
  });
});
