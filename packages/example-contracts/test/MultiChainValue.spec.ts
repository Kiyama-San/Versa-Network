import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VersaEth } from "@versanetwork/interfaces/typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";

import {
  deployMultiChainValueMock,
  deployVersaConnectorMock,
  deployVersaEthMock,
} from "../lib/multi-chain-value/MultiChainValue.helpers";
import { MultiChainValueMock, VersaConnectorMockValue } from "../typechain-types";

describe("MultiChainValue tests", () => {
  let multiChainValueContractA: MultiChainValueMock;
  const chainAId = 1;
  const chainBId = 2;

  let versaConnectorMockContract: VersaConnectorMockValue;
  let versaEthMockContract: VersaEth;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let account1: SignerWithAddress;
  let deployerAddress: string;
  let account1Address: string;

  beforeEach(async () => {
    versaConnectorMockContract = await deployVersaConnectorMock();
    versaEthMockContract = await deployVersaEthMock();
    multiChainValueContractA = await deployMultiChainValueMock({
      versaConnectorMockAddress: versaConnectorMockContract.address,
      versaTokenMockAddress: versaEthMockContract.address,
    });

    await multiChainValueContractA.addAvailableChainId(chainBId);

    accounts = await ethers.getSigners();
    [deployer, account1] = accounts;
    deployerAddress = deployer.address;
    account1Address = account1.address;
  });

  describe("addAvailableChainId", () => {
    it("Should prevent enabling a chainId that's already enabled", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();

      await expect(multiChainValueContractA.addAvailableChainId(1)).to.be.revertedWith("ChainIdAlreadyEnabled()");
    });

    it("Should enable the provided chainId", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();

      expect(await multiChainValueContractA.availableChainIds(1)).to.equal(true);
    });
  });

  describe("removeAvailableChainId", () => {
    it("Should prevent disabling a chainId that's already disabled", async () => {
      await expect(multiChainValueContractA.removeAvailableChainId(1)).to.be.revertedWith("ChainIdNotAvailable()");
    });

    it("Should disable the provided chainId", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();
      expect(await multiChainValueContractA.availableChainIds(1)).to.equal(true);

      await (await multiChainValueContractA.removeAvailableChainId(1)).wait();
      expect(await multiChainValueContractA.availableChainIds(1)).to.equal(false);
    });
  });

  describe("send", () => {
    it("Should prevent sending value to a disabled chainId", async () => {
      await expect(multiChainValueContractA.send(1, account1Address, 100_000)).to.be.revertedWith(
        "InvalidDestinationChainId()"
      );
    });

    it("Should prevent sending 0 value", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();

      await expect(multiChainValueContractA.send(1, account1Address, 0)).to.be.revertedWith("InvalidVersaValueAndGas()");
    });

    it("Should prevent sending if the account has no Versa balance", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();
    });

    it("Should prevent sending value to an invalid address", async () => {
      await (await multiChainValueContractA.addAvailableChainId(1)).wait();
    });

    describe("Given a valid input", () => {
      it("Should send value", async () => {
        await (await multiChainValueContractA.addAvailableChainId(1)).wait();
      });
    });
  });
});
