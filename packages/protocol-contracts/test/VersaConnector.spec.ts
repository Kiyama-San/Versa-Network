import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  VersaConnectorBase,
  VersaConnectorEth,
  VersaConnectorNonEth,
  VersaEth,
  VersaNonEth,
  VersaReceiverMock,
} from "@Versachain/interfaces/typechain-types";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import {
  deployVersaConnectorBase,
  deployVersaConnectorEth,
  deployVersaConnectorNonEth,
  deployVersaEth,
  deployVersaNonEth,
  deployVersaReceiverMock,
} from "../lib/contracts.helpers";

describe("VersaConnector tests", () => {
  let VersaTokenEthContract: VersaEth;
  let VersaTokenNonEthContract: VersaNonEth;
  let VersaConnectorBaseContract: VersaConnectorBase;
  let VersaConnectorEthContract: VersaConnectorEth;
  let VersaReceiverMockContract: VersaReceiverMock;
  let VersaConnectorNonEthContract: VersaConnectorNonEth;

  let tssUpdater: SignerWithAddress;
  let tssSigner: SignerWithAddress;
  let randomSigner: SignerWithAddress;
  let pauserSigner: SignerWithAddress;

  const tssUpdaterApproveConnectorEth = async () => {
    await (await VersaTokenEthContract.approve(VersaConnectorEthContract.address, parseEther("100000"))).wait();
  };

  const tssUpdaterApproveConnectorNonEth = async () => {
    await (await VersaTokenNonEthContract.approve(VersaConnectorNonEthContract.address, parseEther("100000"))).wait();
  };

  const transfer100kVersaEth = async (transferTo: string) => {
    await (await VersaTokenEthContract.transfer(transferTo, 100_000)).wait();
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

    VersaTokenEthContract = await deployVersaEth({
      args: [100_000],
    });

    VersaTokenNonEthContract = await deployVersaNonEth({
      args: [tssSigner.address, tssUpdater.address],
    });

    VersaReceiverMockContract = await deployVersaReceiverMock();
    VersaConnectorBaseContract = await deployVersaConnectorBase({
      args: [VersaTokenEthContract.address, tssSigner.address, tssUpdater.address, pauserSigner.address],
    });
    VersaConnectorEthContract = await deployVersaConnectorEth({
      args: [VersaTokenEthContract.address, tssSigner.address, tssUpdater.address, pauserSigner.address],
    });
    VersaConnectorNonEthContract = await deployVersaConnectorNonEth({
      args: [VersaTokenNonEthContract.address, tssSigner.address, tssUpdater.address, pauserSigner.address],
    });

    await VersaTokenNonEthContract.updateTssAndConnectorAddresses(
      tssSigner.address,
      VersaConnectorNonEthContract.address
    );

    await mint100kVersaNonEth(tssUpdater.address);
  });

  describe("VersaConnector.base", () => {
    describe("updateTssAddress", () => {
      it("Should revert if the caller is not TSS or TSS updater", async () => {
        await expect(
          VersaConnectorBaseContract.connect(randomSigner).updateTssAddress(randomSigner.address)
        ).to.revertedWith(`CallerIsNotTssOrUpdater("${randomSigner.address}")`);
      });

      it("Should revert if the new TSS address is invalid", async () => {
        await expect(
          VersaConnectorBaseContract.updateTssAddress("0x0000000000000000000000000000000000000000")
        ).to.revertedWith(`InvalidAddress()`);
      });

      it("Should change the TSS address if called by TSS", async () => {
        await (await VersaConnectorBaseContract.connect(tssSigner).updateTssAddress(randomSigner.address)).wait();

        const address = await VersaConnectorBaseContract.tssAddress();

        expect(address).to.equal(randomSigner.address);
      });

      it("Should change the TSS address if called by TSS updater", async () => {
        await (await VersaConnectorBaseContract.updateTssAddress(randomSigner.address)).wait();

        const address = await VersaConnectorBaseContract.tssAddress();

        expect(address).to.equal(randomSigner.address);
      });
    });

    describe("updatePauserAddress", () => {
      it("Should revert if the caller is not the Pauser", async () => {
        await expect(
          VersaConnectorBaseContract.connect(randomSigner).updatePauserAddress(randomSigner.address)
        ).to.revertedWith(`CallerIsNotPauser("${randomSigner.address}")`);
      });

      it("Should revert if the new Pauser address is invalid", async () => {
        await expect(
          VersaConnectorBaseContract
            .connect(pauserSigner)
            .updatePauserAddress("0x0000000000000000000000000000000000000000")
        ).to.revertedWith(`InvalidAddress()`);
      });

      it("Should change the Pauser address if called by Pauser", async () => {
        await (await VersaConnectorBaseContract.connect(pauserSigner).updatePauserAddress(randomSigner.address)).wait();

        const address = await VersaConnectorBaseContract.pauserAddress();

        expect(address).to.equal(randomSigner.address);
      });

      it("Should emit `PauserAddressUpdated` on success", async () => {
        const pauserAddressUpdatedFilter = VersaConnectorBaseContract.filters.PauserAddressUpdated();
        const e1 = await VersaConnectorBaseContract.queryFilter(pauserAddressUpdatedFilter);
        expect(e1.length).to.equal(0);

        await (await VersaConnectorBaseContract.connect(pauserSigner).updatePauserAddress(randomSigner.address)).wait();

        const address = await VersaConnectorBaseContract.pauserAddress();

        expect(address).to.equal(randomSigner.address);

        const e2 = await VersaConnectorBaseContract.queryFilter(pauserAddressUpdatedFilter);
        expect(e2.length).to.equal(1);
      });
    });

    describe("pause, unpause", () => {
      it("Should revert if not called by the Pauser", async () => {
        await expect(VersaConnectorBaseContract.connect(randomSigner).pause()).to.revertedWith(
          `CallerIsNotPauser("${randomSigner.address}")`
        );

        await expect(VersaConnectorBaseContract.connect(randomSigner).unpause()).to.revertedWith(
          `CallerIsNotPauser("${randomSigner.address}")`
        );
      });

      it("Should pause if called by the Pauser", async () => {
        await (await VersaConnectorBaseContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorBaseContract.paused();
        expect(paused1).to.equal(true);

        await (await VersaConnectorBaseContract.connect(pauserSigner).unpause()).wait();
        const paused2 = await VersaConnectorBaseContract.paused();
        expect(paused2).to.equal(false);
      });
    });
  });

  describe("VersaConnector.eth", () => {
    describe("send", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if the VersaTxSender has no enough Versa", async () => {
        await (
          await VersaTokenEthContract.connect(randomSigner).approve(VersaConnectorEthContract.address, 100_000)
        ).wait();

        await expect(
          VersaConnectorEthContract.connect(randomSigner).send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("Should revert if the VersaTxSender didn't allow VersaConnector to spend Versa token", async () => {
        await expect(
          VersaConnectorEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("ERC20: insufficient allowance");
      });

      it("Should transfer Versa token from the VersaTxSender account to the Connector contract", async () => {
        const initialBalanceDeployer = await VersaTokenEthContract.balanceOf(tssUpdater.address);
        const initialBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);

        expect(initialBalanceDeployer.toString()).to.equal("100000000000000000000000");
        expect(initialBalanceConnector.toString()).to.equal("0");

        await tssUpdaterApproveConnectorEth();

        await (
          await VersaConnectorEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).wait();

        const finalBalanceDeployer = await VersaTokenEthContract.balanceOf(tssUpdater.address);
        const finalBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);

        expect(finalBalanceDeployer.toString()).to.equal("99999999999999999999000");
        expect(finalBalanceConnector.toString()).to.equal("1000");
      });

      it("Should emit `VersaSent` on success", async () => {
        const VersaSentFilter = VersaConnectorEthContract.filters.VersaSent();
        const e1 = await VersaConnectorEthContract.queryFilter(VersaSentFilter);
        expect(e1.length).to.equal(0);

        await VersaConnectorEthContract.send({
          destinationAddress: randomSigner.address,
          destinationChainId: 1,
          destinationGasLimit: 2500000,
          message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaValueAndGas: 0,
        });

        const e2 = await VersaConnectorEthContract.queryFilter(VersaSentFilter);
        expect(e2.length).to.equal(1);
      });

      it("Should emit `VersaSent` with tx.origin as the first parameter", async () => {
        const VersaSentFilter = VersaConnectorEthContract.filters.VersaSent();
        const e1 = await VersaConnectorEthContract.queryFilter(VersaSentFilter);
        expect(e1.length).to.equal(0);

        await VersaConnectorEthContract.connect(randomSigner).send({
          destinationAddress: randomSigner.address,
          destinationChainId: 1,
          destinationGasLimit: 2500000,
          message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaValueAndGas: 0,
        });

        const e2 = await VersaConnectorEthContract.queryFilter(VersaSentFilter);
        expect(e2[0].args[0].toString()).to.equal(randomSigner.address);
      });
    });

    describe("onReceive", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorEthContract.onReceive(
            tssUpdater.address,
            1,
            randomSigner.address,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if not called by TSS address", async () => {
        await expect(
          VersaConnectorEthContract.onReceive(
            tssUpdater.address,
            1,
            randomSigner.address,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith(`CallerIsNotTss("${tssUpdater.address}")'`);
      });

      it("Should revert if Versa transfer fails", async () => {
        await expect(
          VersaConnectorEthContract
            .connect(tssSigner)
            .onReceive(
              randomSigner.address,
              1,
              randomSigner.address,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).to.revertedWith("ERC20: transfer amount exceeds balance");
      });

      it("Should transfer to the receiver address", async () => {
        await transfer100kVersaEth(VersaConnectorEthContract.address);

        const initialBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);
        const initialBalanceReceiver = await VersaTokenEthContract.balanceOf(VersaReceiverMockContract.address);
        expect(initialBalanceConnector.toString()).to.equal("100000");
        expect(initialBalanceReceiver.toString()).to.equal("0");

        await (
          await VersaConnectorEthContract
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

        const finalBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);
        const finalBalanceReceiver = await VersaTokenEthContract.balanceOf(VersaReceiverMockContract.address);

        expect(finalBalanceConnector.toString()).to.equal("99000");
        expect(finalBalanceReceiver.toString()).to.equal("1000");
      });

      it("Should emit `VersaReceived` on success", async () => {
        await transfer100kVersaEth(VersaConnectorEthContract.address);

        const VersaReceivedFilter = VersaConnectorEthContract.filters.VersaReceived();
        const e1 = await VersaConnectorEthContract.queryFilter(VersaReceivedFilter);
        expect(e1.length).to.equal(0);

        await (
          await VersaConnectorEthContract
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

        const e2 = await VersaConnectorEthContract.queryFilter(VersaReceivedFilter);
        expect(e2.length).to.equal(1);
      });
    });

    describe("onRevert", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorEthContract.onRevert(
            randomSigner.address,
            1,
            randomSigner.address,
            2,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if not called by TSS address", async () => {
        await expect(
          VersaConnectorEthContract.onRevert(
            randomSigner.address,
            1,
            tssUpdater.address,
            1,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith(`CallerIsNotTss("${tssUpdater.address}")`);
      });

      it("Should transfer to the VersaTxSender address", async () => {
        await transfer100kVersaEth(VersaConnectorEthContract.address);

        const initialBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);
        const initialBalanceVersaTxSender = await VersaTokenEthContract.balanceOf(VersaReceiverMockContract.address);
        expect(initialBalanceConnector.toString()).to.equal("100000");
        expect(initialBalanceVersaTxSender.toString()).to.equal("0");

        await (
          await VersaConnectorEthContract
            .connect(tssSigner)
            .onRevert(
              VersaReceiverMockContract.address,
              1,
              randomSigner.address,
              1,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).wait();

        const finalBalanceConnector = await VersaTokenEthContract.balanceOf(VersaConnectorEthContract.address);
        const finalBalanceVersaTxSender = await VersaTokenEthContract.balanceOf(VersaReceiverMockContract.address);

        expect(finalBalanceConnector.toString()).to.equal("99000");
        expect(finalBalanceVersaTxSender.toString()).to.equal("1000");
      });

      it("Should emit `VersaReverted` on success", async () => {
        await transfer100kVersaEth(VersaConnectorEthContract.address);

        const VersaRevertedFilter = VersaConnectorEthContract.filters.VersaReverted();
        const e1 = await VersaConnectorEthContract.queryFilter(VersaRevertedFilter);
        expect(e1.length).to.equal(0);

        await (
          await VersaConnectorEthContract
            .connect(tssSigner)
            .onRevert(
              VersaReceiverMockContract.address,
              1,
              randomSigner.address,
              1,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).wait();

        const e2 = await VersaConnectorEthContract.queryFilter(VersaRevertedFilter);
        expect(e2.length).to.equal(1);
      });
    });
  });

  describe("VersaConnector.non-eth", () => {
    describe("send", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorNonEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorNonEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorNonEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if the VersaTxSender has no enough Versa", async () => {
        await (
          await VersaTokenEthContract.connect(randomSigner).approve(VersaConnectorEthContract.address, 100_000)
        ).wait();

        await expect(
          VersaConnectorNonEthContract.connect(randomSigner).send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("ERC20: insufficient allowance");
      });

      it("Should revert if the VersaTxSender didn't allow VersaConnector to spend Versa token", async () => {
        await expect(
          VersaConnectorNonEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: 1000,
          })
        ).to.revertedWith("ERC20: insufficient allowance");
      });

      it("Should burn Versa token from the VersaTxSender account", async () => {
        const initialBalanceDeployer = await VersaTokenNonEthContract.balanceOf(tssUpdater.address);
        expect(initialBalanceDeployer.toString()).to.equal(parseEther("100000"));

        await tssUpdaterApproveConnectorNonEth();

        await (
          await VersaConnectorNonEthContract.send({
            destinationAddress: randomSigner.address,
            destinationChainId: 1,
            destinationGasLimit: 2500000,
            message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            VersaValueAndGas: parseEther("1"),
          })
        ).wait();

        const finalBalanceDeployer = await VersaTokenNonEthContract.balanceOf(tssUpdater.address);
        expect(finalBalanceDeployer.toString()).to.equal(parseEther("99999"));
      });

      it("Should emit `VersaSent` on success", async () => {
        const VersaSentFilter = VersaConnectorNonEthContract.filters.VersaSent();
        const e1 = await VersaConnectorNonEthContract.queryFilter(VersaSentFilter);
        expect(e1.length).to.equal(0);

        await VersaConnectorNonEthContract.send({
          destinationAddress: randomSigner.address,
          destinationChainId: 1,
          destinationGasLimit: 2500000,
          message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaValueAndGas: 0,
        });

        const e2 = await VersaConnectorNonEthContract.queryFilter(VersaSentFilter);
        expect(e2.length).to.equal(1);
      });

      it("Should emit `VersaSent` with tx.origin as the first parameter", async () => {
        const VersaSentFilter = VersaConnectorNonEthContract.filters.VersaSent();
        const e1 = await VersaConnectorNonEthContract.queryFilter(VersaSentFilter);
        expect(e1.length).to.equal(0);

        await VersaConnectorNonEthContract.connect(randomSigner).send({
          destinationAddress: randomSigner.address,
          destinationChainId: 1,
          destinationGasLimit: 2500000,
          message: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaParams: new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
          VersaValueAndGas: 0,
        });

        const e2 = await VersaConnectorNonEthContract.queryFilter(VersaSentFilter);
        expect(e2[0].args[0].toString()).to.equal(randomSigner.address);
      });
    });

    describe("onReceive", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorNonEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorNonEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorNonEthContract.onReceive(
            tssUpdater.address,
            1,
            randomSigner.address,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if not called by TSS address", async () => {
        await expect(
          VersaConnectorNonEthContract.onReceive(
            tssUpdater.address,
            1,
            randomSigner.address,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith(`CallerIsNotTss("${tssUpdater.address}")'`);
      });

      it("Should revert if mint fails", async () => {
        /**
         * Update TSS and Connector addresses so minting fails
         */
        await VersaTokenNonEthContract.updateTssAndConnectorAddresses(tssSigner.address, randomSigner.address);

        await expect(
          VersaConnectorNonEthContract
            .connect(tssSigner)
            .onReceive(
              randomSigner.address,
              1,
              VersaReceiverMockContract.address,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).to.revertedWith(`CallerIsNotConnector("${VersaConnectorNonEthContract.address}")`);
      });

      it("Should mint on the receiver address", async () => {
        const initialBalanceReceiver = await VersaTokenNonEthContract.balanceOf(VersaReceiverMockContract.address);
        expect(initialBalanceReceiver.toString()).to.equal("0");

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

        const finalBalanceReceiver = await VersaTokenNonEthContract.balanceOf(VersaReceiverMockContract.address);

        expect(finalBalanceReceiver.toString()).to.equal("1000");
      });

      it("Should emit `VersaReceived` on success", async () => {
        const VersaReceivedFilter = VersaConnectorNonEthContract.filters.VersaReceived();
        const e1 = await VersaConnectorNonEthContract.queryFilter(VersaReceivedFilter);
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

        const e2 = await VersaConnectorNonEthContract.queryFilter(VersaReceivedFilter);
        expect(e2.length).to.equal(2);
      });
    });

    describe("onRevert", () => {
      it("Should revert if the contract is paused", async () => {
        await (await VersaConnectorNonEthContract.connect(pauserSigner).pause()).wait();
        const paused1 = await VersaConnectorNonEthContract.paused();
        expect(paused1).to.equal(true);

        await expect(
          VersaConnectorNonEthContract.onRevert(
            randomSigner.address,
            1,
            randomSigner.address,
            2,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith("Pausable: paused");
      });

      it("Should revert if not called by TSS address", async () => {
        await expect(
          VersaConnectorNonEthContract.onRevert(
            randomSigner.address,
            1,
            tssUpdater.address,
            1,
            1000,
            new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
            ethers.constants.HashZero
          )
        ).to.revertedWith(`CallerIsNotTss("${tssUpdater.address}")`);
      });

      it("Should mint on the VersaTxSender address", async () => {
        const initialBalanceVersaTxSender = await VersaTokenNonEthContract.balanceOf(VersaReceiverMockContract.address);
        expect(initialBalanceVersaTxSender.toString()).to.equal("0");

        await (
          await VersaConnectorNonEthContract
            .connect(tssSigner)
            .onRevert(
              VersaReceiverMockContract.address,
              1,
              randomSigner.address,
              1,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).wait();

        const finalBalanceVersaTxSender = await VersaTokenNonEthContract.balanceOf(VersaReceiverMockContract.address);
        expect(finalBalanceVersaTxSender.toString()).to.equal("1000");
      });

      it("Should emit `VersaReverted` on success", async () => {
        await transfer100kVersaNonEth(VersaConnectorNonEthContract.address);

        const VersaRevertedFilter = VersaConnectorNonEthContract.filters.VersaReverted();
        const e1 = await VersaConnectorNonEthContract.queryFilter(VersaRevertedFilter);
        expect(e1.length).to.equal(0);

        await (
          await VersaConnectorNonEthContract
            .connect(tssSigner)
            .onRevert(
              VersaReceiverMockContract.address,
              1,
              randomSigner.address,
              1,
              1000,
              new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
              ethers.constants.HashZero
            )
        ).wait();

        const e2 = await VersaConnectorNonEthContract.queryFilter(VersaRevertedFilter);
        expect(e2.length).to.equal(1);
      });
    });

    describe("MaxSupply", () => {
      describe("setMaxSupply", () => {
        it("Should revert if the caller is not the TSS address", async () => {
          await expect(VersaConnectorNonEthContract.connect(randomSigner).setMaxSupply(0)).to.revertedWith(
            `CallerIsNotTss("${randomSigner.address}")`
          );
        });

        it("Should revert if want to mint more than MaxSupply", async () => {
          await VersaConnectorNonEthContract.connect(tssSigner).setMaxSupply(999);
          await expect(
            VersaConnectorNonEthContract
              .connect(tssSigner)
              .onReceive(
                randomSigner.address,
                1,
                VersaReceiverMockContract.address,
                1000,
                new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
                ethers.constants.HashZero
              )
          ).to.revertedWith(`ExceedsMaxSupply(999)`);
        });
      });

      describe("onReceive, onRevert (mint)", () => {
        it("Should mint if total supply + supply to add < max supply", async () => {
          const supplyToAdd = 1000;
          const initialSupply = await VersaTokenNonEthContract.totalSupply();

          await VersaConnectorNonEthContract.connect(tssSigner).setMaxSupply(initialSupply.add(supplyToAdd));

          await expect(
            VersaConnectorNonEthContract
              .connect(tssSigner)
              .onReceive(
                randomSigner.address,
                1,
                VersaReceiverMockContract.address,
                supplyToAdd,
                new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
                ethers.constants.HashZero
              )
          ).to.be.not.reverted;

          const finalSupply = await VersaTokenNonEthContract.totalSupply();

          expect(finalSupply).to.eq(initialSupply.add(supplyToAdd));

          await expect(
            VersaConnectorNonEthContract
              .connect(tssSigner)
              .onReceive(
                randomSigner.address,
                1,
                VersaReceiverMockContract.address,
                1,
                new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
                ethers.constants.HashZero
              )
          ).to.revertedWith(`ExceedsMaxSupply(${initialSupply.add(supplyToAdd)})`);

          await expect(
            VersaConnectorNonEthContract
              .connect(tssSigner)
              .onRevert(
                randomSigner.address,
                1,
                randomSigner.address,
                2,
                1000,
                new ethers.utils.AbiCoder().encode(["string"], ["hello"]),
                ethers.constants.HashZero
              )
          ).to.revertedWith(`ExceedsMaxSupply(${initialSupply.add(supplyToAdd)})`);
        });
      });
    });
  });
});
