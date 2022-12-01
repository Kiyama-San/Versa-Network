import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import {
  deployCrossChainWarriorsMock,
  deployVersaConnectorMock
} from "../lib/Hyper-Chain-Fighters/HyperChainFighters.helpers";
import { getAddress } from "../lib/shared/address.helpers";
import { deployVersaTokenConsumerUniV2, getVersaMock } from "../lib/shared/deploy.helpers";
import { HyperChainFightersMock, HyperChainFightersVersaConnectorMock, VersaEthMock } from "../typechain-types";
import { VersaTokenConsumerUniV2 } from "../typechain-types/@versanetwork/protocol-contracts/contracts/VersaTokenConsumerUniV2.strategy.sol";
import { addVersaEthLiquidityTest, getMintTokenId } from "./test.helpers";

describe("CrossChainWarriors tests", () => {
  let versaConnectorMockContract: HyperChainFightersVersaConnectorMock;
  let versaEthTokenMockContract: VersaEthMock;
  let versaTokenConsumerUniV2: VersaTokenConsumerUniV2;

  let hyperChainFightersContractChainA: HyperChainFightersMock;
  const chainAId = 1;

  let hyperChainFightersContractChainB: HyperChainFightersMock;
  const chainBId = 2;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let account1: SignerWithAddress;
  let deployerAddress: string;
  let account1Address: string;
  const encoder = new ethers.utils.AbiCoder();

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, account1] = accounts;
    deployerAddress = deployer.address;
    account1Address = account1.address;

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

    hyperChainFightersContractChainA = await deployHyperChainFightersMock({
      customUseEven: false,
      versaConnectorMockAddress: versaConnectorMockContract.address,
      versaTokenConsumerAddress: versaTokenConsumerUniV2.address,
      versaTokenMockAddress: versaEthTokenMockContract.address
    });

    hyperChainFightersContractChainB = await deployCrossChainWarriorsMock({
      customUseEven: true,
      versaConnectorMockAddress: versaConnectorMockContract.address,
      versaTokenConsumerAddress: versaTokenConsumerUniV2.address,
      versaTokenMockAddress: versaEthTokenMockContract.address
    });

    await hyperChainFightersContractChainB.setInteractorByChainId(
      chainAId,
      ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address])
    );

    await hyperChainFightersContractChainA.setInteractorByChainId(
      chainBId,
      ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainB.address])
    );
  });

  describe("constructor", () => {
    it("Should set the tokenIds counter to 1 when useEven is false", async () => {
      expect(await crossChainWarriorsContractChainA.tokenIds()).to.equal(1);
    });

    it("Should set the tokenIds counter to 2 when useEven is true", async () => {
      expect(await crossChainWarriorsContractChainB.tokenIds()).to.equal(2);
    });
  });

  describe("mint", () => {
    it("Should increment tokenIds by two", async () => {
      expect(await hyperChainFightersContractChainA.tokenIds()).to.equal(1);

      await (await hyperChainFightersContractChainA.mint(account1Address)).wait();

      expect(await hyperChainFightersContractChainA.tokenIds()).to.equal(3);
    });

    it("Should create a new NFT owned by the input address", async () => {
      const result = await (await hyperChainFightersContractChainA.mint(account1Address)).wait();

      const tokenId = getMintTokenId(result);

      expect(await hyperChainFightersContractChainA.ownerOf(tokenId)).to.equal(account1Address);
    });
  });

  describe("mintId", () => {
    it("Should mint an NFT with the given input id owned by the input address", async () => {
      const id = 10;

      await (await hyperChainFightersContractChainA.mintId(account1Address, id)).wait();

      expect(await hyperChainFightersContractChainA.ownerOf(id)).to.equal(account1Address);
    });
  });

  describe("crossChainTransfer", () => {
    it("Should revert if the caller is not the NFT owner nor approved", async () => {
      const id = 10;

      await (await hyperChainFightersContractChainA.mintId(account1Address, id)).wait();

      /**
       * The caller is the contract deployer and the NFT owner is account1
       */
      expect(
        hyperChainFightersContractChainA.crossChainTransfer(chainBId, account1Address, id, { value: parseEther("1") })
      ).to.be.revertedWith("Transfer caller is not owner nor approved");
    });

    it("Should burn the tokenId", async () => {
      const id = 10;

      await (await hyperChainFightersContractChainA.mintId(deployerAddress, id)).wait();

      expect(await hyperChainFightersContractChainA.ownerOf(id)).to.equal(deployerAddress);

      await (
        await hyperChainFightersContractChainA.crossChainTransfer(chainBId, account1Address, id, {
          value: parseEther("1")
        })
      ).wait();

      expect(hyperChainFightersContractChainA.ownerOf(id)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });

    it("Should mint tokenId in the destination chain", async () => {
      const id = 10;

      await (await hyperChainFightersContractChainA.mintId(deployerAddress, id)).wait();

      await (
        await hyperChainFightersContractChainA.crossChainTransfer(chainBId, account1Address, id, {
          value: parseEther("1")
        })
      ).wait();

      expect(await hyperChainFightersContractChainB.ownerOf(id)).to.equal(account1Address);
    });
  });

  describe("onVersaMessage", () => {
    it("Should revert if the caller is not the Connector contract", async () => {
      await expect(
        hyperChainFightersContractChainA.onVersaMessage({
          destinationAddress: hyperChainFightersContractChainB.address,
          message: encoder.encode(["address"], [deployerAddress]),
          sourceChainId: 1,
          versaTxSenderAddress: ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address]),
          versaValue: 0
        })
      ).to.be.revertedWith(`InvalidCaller("${deployer.address}")`);
    });

    it("Should revert if the cross-chain address doesn't match with the stored one", async () => {
      await expect(
        versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [deployerAddress]),
          1,
          hyperChainFightersContractChainB.address,
          0,
          encoder.encode(["address"], [versaConnectorMockContract.address])
        )
      ).to.be.revertedWith("InvalidVersaMessageCall()");
    });

    it("Should revert if the message type doesn't match with CROSS_CHAIN_TRANSFER_MESSAGE", async () => {
      const messageType = await hyperChainFightersContractChainB.CROSS_CHAIN_TRANSFER_MESSAGE();

      const invalidMessageType = messageType.replace("9", "8");

      await expect(
        versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address]),
          1,
          hyperChainFightersContractChainB.address,
          0,
          encoder.encode(
            ["bytes32", "uint256 ", "address", "address"],
            [invalidMessageType, 1, deployerAddress, deployerAddress]
          )
        )
      ).to.be.revertedWith("InvalidMessageType()");
    });

    it("Should revert if the token already exists", async () => {
      const messageType = await hyperChainFightersContractChainA.CROSS_CHAIN_TRANSFER_MESSAGE();

      await hyperChainFightersContractChainB.mintId(deployerAddress, 1);

      await expect(
        versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address]),
          1,
          hyperChainFightersContractChainB.address,
          0,
          encoder.encode(
            ["bytes32", "uint256 ", "address", "address"],
            [messageType, 1, deployerAddress, deployerAddress]
          )
        )
      ).to.be.revertedWith("ERC721: token already minted");
    });

    describe("Given a valid input", () => {
      it("Should mint a new token in the destination chain", async () => {
        const messageType = await hyperChainFightersContractChainA.CROSS_CHAIN_TRANSFER_MESSAGE();

        await versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address]),
          1,
          hyperChainFightersContractChainB.address,
          0,
          encoder.encode(
            ["bytes32", "uint256 ", "address", "address"],
            [messageType, 1, deployerAddress, deployerAddress]
          )
        );

        expect(await hyperChainFightersContractChainB.ownerOf(1)).to.equal(deployerAddress);
      });

      it("Should mint a new token in the destination chain, owned by the provided 'to' address", async () => {
        const messageType = await hyperChainFightersContractChainA.CROSS_CHAIN_TRANSFER_MESSAGE();

        await versaConnectorMockContract.callOnVersaMessage(
          ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainA.address]),
          1,
          hyperChainFightersContractChainB.address,
          0,
          encoder.encode(
            ["bytes32", "uint256 ", "address", "address"],
            [messageType, 1, deployerAddress, account1Address]
          )
        );

        expect(await hyperChainFightersContractChainB.ownerOf(1)).to.equal(account1Address);
      });
    });
  });

  describe("onVersaRevert", () => {
    /**
     * @description note that given how this test was implemented, the NFT will exist in the two chains
     * that's not the real-world behavior but it's ok for this unit test
     */
    it("Should give the NFT back to the sourceTxOriginAddress", async () => {
      const nftId = 1;

      await (await hyperChainFightersContractChainA.mintId(deployerAddress, nftId)).wait();

      await (
        await hyperChainFightersContractChainA.crossChainTransfer(chainBId, deployerAddress, nftId, {
          value: parseEther("1")
        })
      ).wait();

      // Make sure that the NFT was removed from the source chain
      await expect(hyperChainFightersContractChainA.ownerOf(nftId)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );

      const messageType = await hyperChainFightersContractChainA.CROSS_CHAIN_TRANSFER_MESSAGE();

      await versaConnectorMockContract.callOnVersaRevert(
        hyperChainFightersContractChainA.address,
        1337,
        chainBId,
        ethers.utils.solidityPack(["address"], [hyperChainFightersContractChainB.address]),
        0,
        2500000,
        encoder.encode(
          ["bytes32", "uint256 ", "address", "address"],
          [messageType, nftId, deployerAddress, account1Address]
        )
      );

      expect(await hyperChainFightersContractChainB.ownerOf(nftId)).to.equal(deployerAddress);
    });
  });
});
