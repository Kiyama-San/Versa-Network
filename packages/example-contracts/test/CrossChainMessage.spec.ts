import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VersaTokenConsumerUniV2 } from "@versanetwork/interfaces/typechain-types";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import {
  deployCrossChainMessageMock,
  deployVersaConnectorMock
} from "../lib/cross-chain-message/CrossChainMessage.helpers";
import { getAddress } from "../lib/shared/address.helpers";
import { deployVersaTokenConsumerUniV2, getVersaMock } from "../lib/shared/deploy.helpers";
import { CrossChainMessage, CrossChainMessageConnector, VersaEthMock } from "../typechain-types";
import { addVersaEthLiquidityTest } from "./test.helpers";

describe("CrossChainMessage tests", () => {
  let versaConnectorMockContract: CrossChainMessageConnector;
  let versaEthTokenMockContract: VersaEthMock;
  let versaTokenConsumerUniV2: VersaTokenConsumerUniV2;

  let crossChainMessageContractChainA: CrossChainMessage;
  const chainAId = 1;

  let crossChainMessageContractChainB: CrossChainMessage;
  const chainBId = 2;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let deployerAddress: string;

  const SAMPLE_TEXT = "Hello, Cross-Chain World!";
  const encoder = new ethers.utils.AbiCoder();

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer] = accounts;
    deployerAddress = deployer.address;

    versaEthTokenMockContract = await getVersaMock();
    versaConnectorMockContract = await deployVersaConnectorMock();

    const uniswapRouterAddr = getAddress("uniswapV2Router02", {
      customNetworkName: "eth-mainnet",
      customVersaNetwork: "mainnet"
    });

    await addVersaEthLiquidityTest(versaEthTokenMockContract.address, parseEther("200000"), parseEther("100"), deployer);
    // @dev: guarantee that the account has no versa balance but still can use the protocol :D
    const versaBalance = await versaEthTokenMockContract.balanceOf(deployer.address);
    await versaEthTokenMockContract.transfer(accounts[5].address, versaBalance);

    versaTokenConsumerUniV2 = await deployVersaTokenConsumerUniV2(versaEthTokenMockContract.address, uniswapRouterAddr);

    crossChainMessageContractChainA = await deployCrossChainMessageMock({
      versaConnectorMockAddress: versaConnectorMockContract.address,
      versaTokenConsumerAddress: versaTokenConsumerUniV2.address,
      versaTokenMockAddress: versaEthTokenMockContract.address
    });

    crossChainMessageContractChainB = await deployCrossChainMessageMock({
      versaConnectorMockAddress: versaConnectorMockContract.address,
      versaTokenConsumerAddress: versaTokenConsumerUniV2.address,
      versaTokenMockAddress: versaEthTokenMockContract.address
    });

    await crossChainMessageContractChainB.setInteractorByChainId(
      chainAId,
      ethers.utils.solidityPack(["address"], [crossChainMessageContractChainA.address])
    );

    await crossChainMessageContractChainA.setInteractorByChainId(
      chainBId,
      ethers.utils.solidityPack(["address"], [crossChainMessageContractChainB.address])
    );
  });

  describe("sendHelloWorld", () => {
    it("Should revert if the cross chain address wasn't set", async () => {
      const unsetContract = await deployCrossChainMessageMock({
        versaConnectorMockAddress: versaConnectorMockContract.address,
        versaTokenConsumerAddress: versaTokenConsumerUniV2.address,
        versaTokenMockAddress: versaEthTokenMockContract.address
      });

      await expect(unsetContract.sendHelloWorld(chainAId)).to.be.revertedWith("InvalidDestinationChainId()");
    });

    it("Should send hello world", async () => {
      await expect(crossChainMessageContractChainA.sendHelloWorld(chainBId, { value: parseEther("1") })).to.be.not
        .reverted;
    });
  });

  describe("onVersaMessage", () => {
    it("Should revert if the caller is not the Connector contract", async () => {
      await expect(
        crossChainMessageContractChainA.onVersaMessage({
          destinationAddress: crossChainMessageContractChainB.address,
          message: encoder.encode(["address", "string"], [deployerAddress, SAMPLE_TEXT]),
          sourceChainId: 1,
          versaTxSenderAddress: ethers.utils.solidityPack(["address"], [crossChainMessageContractChainA.address]),
          versaValue: 0
        })
      ).to.be.revertedWith(`InvalidCaller("${deployer.address}")`);
    });

    it("Should revert if the cross-chain address doesn't match with the stored one", async () => {
      await expect(
        versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [deployerAddress]),
          1,
          crossChainMessageContractChainB.address,
          0,
          encoder.encode(["address", "string"], [versaConnectorMockContract.address, SAMPLE_TEXT])
        )
      ).to.be.revertedWith("InvalidVersaMessageCall()");
    });

    describe("Given a valid message", () => {
      it("Should emit `HelloWorldEvent`", async () => {
        const messageType = await crossChainMessageContractChainA.HELLO_WORLD_MESSAGE_TYPE();

        const tx = await versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [crossChainMessageContractChainA.address]),
          1,
          crossChainMessageContractChainB.address,
          0,
          encoder.encode(["bytes32", "string"], [messageType, SAMPLE_TEXT])
        );

        await tx.wait();

        const helloWorldEventFilter = crossChainMessageContractChainB.filters.HelloWorldEvent();
        const e1 = await crossChainMessageContractChainB.queryFilter(helloWorldEventFilter);
        expect(e1.length).to.equal(1);
        expect(e1[0].transactionHash).to.equal(tx.hash);
      });
    });
  });
});
