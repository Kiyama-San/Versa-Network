import assert from "assert";
import { ContractFactory, ContractReceipt } from "ethers";
import { ethers, network } from "hardhat";

import {
  CrossChainMessage,
  CrossChainMessage__factory,
  CrossChainMessageConnector,
  CrossChainMessageConnector__factory,
} from "../../typechain-types";

export type GetContractParams<Factory extends ContractFactory> =
  | {
      deployParams: Parameters<Factory["deploy"]>;
      existingContractAddress?: null;
    }
  | {
      deployParams?: null;
      existingContractAddress: string;
    };

/**
 * @description only for testing or local environment
 */
export const deployCrossChainMessageMock = async ({
  versaConnectorMockAddress,
  versaTokenConsumerAddress,
  versaTokenMockAddress,
}: {
  versaConnectorMockAddress: string;
  versaTokenConsumerAddress: string;
  versaTokenMockAddress: string;
}) => {
  const isLocalEnvironment = network.name === "hardhat";

  assert(isLocalEnvironment, "deployCrossChainMessageMock is only intended to be used in the local environment");

  const Factory = (await ethers.getContractFactory("CrossChainMessage")) as CrossChainMessage__factory;

  const crossChainMessageContract = (await Factory.deploy(
    versaConnectorMockAddress,
    versaTokenMockAddress,
    versaTokenConsumerAddress
  )) as CrossChainMessage;

  await crossChainMessageContract.deployed();

  return crossChainMessageContract;
};

export const deployVersaConnectorMock = async () => {
  const Factory = (await ethers.getContractFactory(
    "CrossChainMessageConnector"
  )) as CrossChainMessageConnector__factory;

  const versaConnectorMockContract = (await Factory.deploy()) as CrossChainMessageConnector;

  await versaConnectorMockContract.deployed();

  return versaConnectorMockContract;
};
