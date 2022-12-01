import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  deployTestCrossChainCounter,
  deployVersaConnectorMock,
} from "../lib/cross-chain-counter/CrossChainCounter.helpers";
import { CounterVersaConnectorMock, CrossChainCounter } from "../typechain-types";

describe("CrossChainCounter tests", () => {
  let crossChainCounterContractA: CrossChainCounter;
  const chainAId = 1;

  let crossChainCounterContractB: CrossChainCounter;
  const chainBId = 2;

  let versaConnectorMockContract: CounterVersaConnectorMock;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let deployerAddress: string;

  const encoder = new ethers.utils.AbiCoder();

  beforeEach(async () => {
    versaConnectorMockContract = await deployVersaConnectorMock();
    crossChainCounterContractA = await deployTestCrossChainCounter({
      versaConnectorMockAddress: versaConnectorMockContract.address,
    });
    crossChainCounterContractB = await deployTestCrossChainCounter({
      versaConnectorMockAddress: versaConnectorMockContract.address,
    });

    await crossChainCounterContractA.setInteractorByChainId(
      chainBId,
      ethers.utils.solidityPack(["address"], [crossChainCounterContractB.address])
    );
    await crossChainCounterContractB.setInteractorByChainId(
      chainAId,
      ethers.utils.solidityPack(["address"], [crossChainCounterContractA.address])
    );

    accounts = await ethers.getSigners();
    [deployer] = accounts;
    deployerAddress = deployer.address;
  });

  describe("crossChainCount", () => {
    it("Should revert if the cross chain address wasn't set", async () => {
      const unsetContract = await deployTestCrossChainCounter({
        versaConnectorMockAddress: versaConnectorMockContract.address,
      });

      await expect(unsetContract.crossChainCount(chainAId)).to.be.revertedWith("InvalidDestinationChainId()");
    });
  });

  describe("onVersaMessage", () => {
    it("Should revert if the caller is not the Connector contract", async () => {
      await expect(
        crossChainCounterContractA.onVersaMessage({
          destinationAddress: crossChainCounterContractB.address,
          message: encoder.encode(["address"], [deployerAddress]),
          sourceChainId: 1,
          versaTxSenderAddress: ethers.utils.solidityPack(["address"], [crossChainCounterContractA.address]),
          versaValue: 0,
        })
      ).to.be.revertedWith(`InvalidCaller("${deployer.address}")`);
    });

    it("Should revert if the cross-chain address doesn't match with the stored one", async () => {
      await expect(
        versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [deployerAddress]),
          1,
          crossChainCounterContractB.address,
          0,
          encoder.encode(["address"], [versaConnectorMockContract.address])
        )
      ).to.be.revertedWith("InvalidVersaMessageCall()");
    });

    describe("Given a valid message", () => {
      it("Should increment the counter", async () => {
        const messageType = await crossChainCounterContractA.CROSS_CHAIN_INCREMENT_MESSAGE();

        const originalValue = await crossChainCounterContractB.counter(deployerAddress);
        expect(originalValue.toNumber()).to.equal(0);

        await (
          await versaConnectorMockContract.callOnVersaMessage(
            ethers.utils.solidityPack(["address"], [crossChainCounterContractA.address]),
            1,
            crossChainCounterContractB.address,
            0,
            encoder.encode(["bytes32", "address"], [messageType, deployer.address])
          )
        ).wait();

        const newValue = await crossChainCounterContractB.counter(deployerAddress);
        expect(newValue.toNumber()).to.equal(1);
      });
    });
  });

  describe("onVersaRevert", () => {
    it("Should work", async () => {});
  });
});
