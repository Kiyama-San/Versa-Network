import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VersaConnectorNonEth, VersaNonEth, VersaReceiverMock } from "@Versachain/interfaces/typechain-types";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { deployVersaConnectorNonEth, deployVersaNonEth, deployVersaReceiverMock } from "../lib/contracts.helpers";

describe("VersaNonEth tests", () => {
  let VersaTokenNonEthContract: VersaNonEth;
  let VersaReceiverMockContract: VersaReceiverMock;
  let VersaConnectorNonEthContract: VersaConnectorNonEth;
  let tssUpdater: SignerWithAddress;
  let tssSigner: SignerWithAddress;
  let randomSigner: SignerWithAddress;
  let pauserSigner: SignerWithAddress;

  const tssUpdaterApproveConnectorNonEth = async () => {
    await (await VersaTokenNonEthContract.approve(VersaConnectorNonEthContract.address, parseEther("100000"))).wait();
  };

  const mint100kVersaNonEth = async (transferTo: string) => {
    const Versa100k = parseEther("100000");

    await (
      await VersaConnectorNonEthContract
        .connect(tssSigner)
        .onReceive(randomSigner.address, 1, transferTo, Versa100k, [], ethers.constants.HashZero)
    ).wait();
  };

  const transfer100kVersaNonEth = async (transferTo: string) => {
    await mint100kVersaNonEth(tssUpdater.address);

    await (await VersaTokenNonEthContract.connect(tssUpdater).transfer(transferTo, 100_000)).wait();
  };

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    [tssUpdater, tssSigner, randomSigner, pauserSigner] = accounts;

    VersaTokenNonEthContract = await deployVersaNonEth({
      args: [tssSigner.address, tssUpdater.address],
    });

    VersaReceiverMockContract = await deployVersaReceiverMock();
    VersaConnectorNonEthContract = await deployVersaConnectorNonEth({
      args: [VersaTokenNonEthContract.address, tssSigner.address, tssUpdater.address, pauserSigner.address],
    });

    await VersaTokenNonEthContract.updateTssAndConnectorAddresses(
      tssSigner.address,
      VersaConnectorNonEthContract.address
    );

    await mint100kVersaNonEth(tssUpdater.address);
  });

  describe("updateTssAndConnectorAddresses", () => {
    it("Should revert if the caller is not tssAddressUpdater or TSS", async () => {
      expect(
        VersaTokenNonEthContract
          .connect(randomSigner)
          .updateTssAndConnectorAddresses(randomSigner.address, VersaConnectorNonEthContract.address)
      ).to.be.revertedWith(`CallerIsNotTssOrUpdater("${randomSigner.address}")`);
    });

    it("Should change the addresses if the caller is tssAddressUpdater", async () => {
      await (
        await VersaTokenNonEthContract.updateTssAndConnectorAddresses(randomSigner.address, randomSigner.address)
      ).wait();

      expect(await VersaTokenNonEthContract.tssAddress()).to.equal(randomSigner.address);
      expect(await VersaTokenNonEthContract.connectorAddress()).to.equal(randomSigner.address);
    });

    it("Should change the addresses if the caller is TSS", async () => {
      await (
        await VersaTokenNonEthContract
          .connect(tssSigner)
          .updateTssAndConnectorAddresses(randomSigner.address, randomSigner.address)
      ).wait();

      expect(await VersaTokenNonEthContract.tssAddress()).to.equal(randomSigner.address);
      expect(await VersaTokenNonEthContract.connectorAddress()).to.equal(randomSigner.address);
    });
  });

  describe("renounceTssAddressUpdater", () => {
    it("Should revert if the caller is not tssAddressUpdater", async () => {
      expect(VersaTokenNonEthContract.connect(randomSigner).renounceTssAddressUpdater()).to.be.revertedWith(
        `CallerIsNotTssUpdater("${randomSigner.address}")`
      );
    });

    it("Should change tssAddressUpdater to tssAddress if the caller is tssAddressUpdater", async () => {
      await (await VersaTokenNonEthContract.renounceTssAddressUpdater()).wait();

      expect(await VersaTokenNonEthContract.tssAddressUpdater()).to.equal(tssSigner.address);
    });
  });

  describe("mint", () => {
    it("Should revert if the caller is not the Connector contract", async () => {
      expect(
        VersaTokenNonEthContract.connect(randomSigner).mint(tssUpdater.address, 100_000, ethers.constants.AddressZero)
      ).to.be.revertedWith(`CallerIsNotConnector("${randomSigner.address}")`);
    });

    it("Should emit `Minted` on success", async () => {
      const VersaMintedFilter = VersaTokenNonEthContract.filters.Minted();
      const e1 = await VersaTokenNonEthContract.queryFilter(VersaMintedFilter);
      expect(e1.length).to.equal(1);

      await (
        await VersaConnectorNonEthContract
          .connect(tssSigner)
          .onReceive(
            randomSigner.address,
            1,
            VersaReceiverMockContract.address,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
      ).wait();

      const e2 = await VersaTokenNonEthContract.queryFilter(VersaMintedFilter);
      expect(e2.length).to.equal(2);
    });
  });

  describe("burnFrom", () => {
    it("Should revert if the caller is not the Connector contract", async () => {
      expect(VersaTokenNonEthContract.connect(randomSigner).burnFrom(tssUpdater.address, 100_000)).to.be.revertedWith(
        `CallerIsNotConnector("${randomSigner.address}")`
      );
    });

    it("Should emit `Burnt` on success", async () => {
      await tssUpdaterApproveConnectorNonEth();
      const VersaBurntFilter = VersaTokenNonEthContract.filters.Burnt();
      const e1 = await VersaTokenNonEthContract.queryFilter(VersaBurntFilter);
      expect(e1.length).to.equal(0);

      await VersaConnectorNonEthContract.send({
        destinationAddress: randomSigner.address,
        destinationChainId: 1,
        destinationGasLimit: 2500000,
        message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
        VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
        VersaValueAndGas: 1000,
      });

      const e2 = await VersaTokenNonEthContract.queryFilter(VersaBurntFilter);
      expect(e2.length).to.equal(1);
    });
  });
});
