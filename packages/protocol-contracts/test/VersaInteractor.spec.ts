import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VersaInteractorMock } from "@Versachain/interfaces/typechain-types";
import chai, { expect } from "chai";
import { ethers } from "hardhat";

import { getVersaInteractorMock } from "../lib/contracts.helpers";
import { getCustomErrorMessage } from "./test.helpers";

chai.should();

describe("VersaInteractor tests", () => {
  let VersaInteractorMock: VersaInteractorMock;
  const chainAId = 1;
  const chainBId = 2;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let crossChainContractB: SignerWithAddress;
  let VersaConnector: SignerWithAddress;

  const encoder = new ethers.utils.AbiCoder();

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, crossChainContractB, VersaConnector] = accounts;

    VersaInteractorMock = await getVersaInteractorMock(VersaConnector.address);

    const encodedCrossChainAddressB = ethers.utils.solidityPack(["address"], [crossChainContractB.address]);
    await (await VersaInteractorMock.setInteractorByChainId(chainBId, encodedCrossChainAddressB)).wait();
  });

  describe("onVersaMessage", () => {
    it("Should revert if the caller is not VersaConnector", async () => {
      await expect(
        VersaInteractorMock.onVersaMessage({
          destinationAddress: crossChainContractB.address,
          message: encoder.encode(["address"], [VersaInteractorMock.address]),
          sourceChainId: chainBId,
          VersaTxSenderAddress: ethers.utils.solidityPack(["address"], [VersaInteractorMock.address]),
          VersaValue: 0,
        })
      ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
    });

    it("Should revert if the VersaTxSenderAddress it not in interactorsByChainId", async () => {
      await expect(
        VersaInteractorMock.connect(VersaConnector).onVersaMessage({
          destinationAddress: crossChainContractB.address,
          message: encoder.encode(["address"], [crossChainContractB.address]),
          sourceChainId: chainBId,
          VersaTxSenderAddress: ethers.utils.solidityPack(["address"], [VersaInteractorMock.address]),
          VersaValue: 0,
        })
      ).to.be.revertedWith(getCustomErrorMessage("InvalidVersaMessageCall"));
    });
  });

  describe("onVersaRevert", () => {
    it("Should revert if the caller is not VersaConnector", async () => {
      await expect(
        VersaInteractorMock.onVersaRevert({
          destinationAddress: ethers.utils.solidityPack(["address"], [crossChainContractB.address]),
          destinationChainId: chainBId,
          message: encoder.encode(["address"], [VersaInteractorMock.address]),
          remainingVersaValue: 0,
          sourceChainId: chainAId,
          VersaTxSenderAddress: deployer.address,
        })
      ).to.be.revertedWith(getCustomErrorMessage("InvalidCaller", [deployer.address]));
    });
  });
});
