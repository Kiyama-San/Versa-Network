import assert from "assert";
import { ContractFactory } from "ethers";
import { ethers, network } from "hardhat";

import {
  HyperChainFighters,
  HyperChainFighters__factory as HyperChainFightersFactory,
  HyperChainFightersMock,
  HyperChainFightersMock__factory as HyperChainFightersMockFactory,
  HyperChainFightersVersaConnectorMock,
  HyperChainFightersVersaConnectorMock__factory as HyperChainFightersVersaConnectorMockFactory
} from "../../typechain-types";
import { getAddress } from "../shared/address.helpers";
import { isNetworkName } from "../shared/network.constants";

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
export const deployHyperChainFightersMock = async ({
  customUseEven,
  versaConnectorMockAddress,
  versaTokenMockAddress,
  versaTokenConsumerAddress
}: {
  customUseEven: boolean;
  versaConnectorMockAddress: string;
  versaTokenConsumerAddress: string;
  versaTokenMockAddress: string;
}) => {
  const isLocalEnvironment = network.name === "hardhat";

  assert(isLocalEnvironment, "localDeployHyperChainFighters is only intended to be used in the local environment");

  const Factory = (await ethers.getContractFactory("HyperChainFightersMock")) as HyperChainFightersMockFactory;

  const useEven = customUseEven;

  const HyperChainFightersContract = (await Factory.deploy(
    versaConnectorMockAddress,
    versaTokenMockAddress,
    versaTokenConsumerAddress,
    useEven
  )) as HyperChainFightersMock;

  await HyperChainFightersContract.deployed();

  return HyperChainFightersContract;
};

export const getHyperChainFightersArgs = (): [string, string, string, boolean] => [
  getAddress("connector"),
  getAddress("versaToken"),
  getAddress("versaTokenConsumerUniV2"),
  network.name === "goerli"
];

export const getHyperChainFighters = async (existingContractAddress?: string) => {
  if (!isNetworkName(network.name)) throw new Error("Invalid network name");
  const isGetExistingContract = typeof existingContractAddress !== "undefined";

  const Factory = (await ethers.getContractFactory("HyperChainFighters")) as HyperChainFightersFactory;

  if (isGetExistingContract) {
    console.log("Getting existing Cross Chain Warriors");
    return Factory.attach(existingContractAddress) as HyperChainFighters;
  }

  console.log("Deploying Cross Chain Warriors");
  const HyperChainFightersContract = (await Factory.deploy(
    getHyperChainFightersArgs()[0],
    getHyperChainFightersArgs()[1],
    getHyperChainFightersArgs()[2],
    getHyperChainFightersArgs()[3]
  )) as HyperChainFighters;

  await HyperChainFightersContract.deployed();

  return HyperChainFightersContract;
};

export const deployversaConnectorMock = async () => {
  const Factory = (await ethers.getContractFactory(
    "HyperChainFightersversaConnectorMock"
  )) as HyperChainFightersversaConnectorMockFactory;

  const versaConnectorMockContract = (await Factory.deploy()) as HyperChainFightersversaConnectorMock;

  await versaConnectorMockContract.deployed();

  return versaConnectorMockContract;
};
