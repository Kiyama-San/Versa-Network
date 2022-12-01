import {
  ImmutableCreate2Factory,
  ImmutableCreate2Factory__factory,
  VersaConnectorBase,
  VersaConnectorBase__factory as VersaConnectorBaseFactory,
  VersaConnectorEth,
  VersaConnectorEth__factory as VersaConnectorEthFactory,
  VersaConnectorNonEth,
  VersaConnectorNonEth__factory as VersaConnectorNonEthFactory,
  VersaEth,
  VersaEth__factory as VersaEthFactory,
  VersaInteractorMock,
  VersaInteractorMock__factory as VersaInteractorMockFactory,
  VersaNonEth,
  VersaNonEth__factory as VersaNonEthFactory,
  VersaReceiverMock,
  VersaReceiverMock__factory as VersaReceiverMockFactory,
  VersaTokenConsumerUniV2,
  VersaTokenConsumerUniV2__factory as VersaTokenConsumerUniV2Factory,
  VersaTokenConsumerUniV3,
  VersaTokenConsumerUniV3__factory as VersaTokenConsumerUniV3Factory,
} from "@Versachain/interfaces/typechain-types";
import { BaseContract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

export const isEthNetworkName = (networkName: string) =>
  networkName === "eth-localnet" || networkName === "goerli" || networkName === "eth-mainnet";

export const deployVersaConnectorBase = async ({ args }: { args: Parameters<VersaConnectorBaseFactory["deploy"]> }) => {
  const Factory = (await ethers.getContractFactory("VersaConnectorBase")) as VersaConnectorBaseFactory;

  const VersaConnectorContract = (await Factory.deploy(...args)) as VersaConnectorBase;

  await VersaConnectorContract.deployed();

  return VersaConnectorContract;
};

export const deployVersaConnectorEth = async ({ args }: { args: Parameters<VersaConnectorEthFactory["deploy"]> }) => {
  const Factory = (await ethers.getContractFactory("VersaConnectorEth")) as VersaConnectorEthFactory;

  const VersaConnectorContract = (await Factory.deploy(...args)) as VersaConnectorEth;

  await VersaConnectorContract.deployed();

  return VersaConnectorContract;
};

export const deployVersaConnectorNonEth = async ({
  args,
}: {
  args: Parameters<VersaConnectorNonEthFactory["deploy"]>;
}) => {
  const Factory = (await ethers.getContractFactory("VersaConnectorNonEth")) as VersaConnectorNonEthFactory;

  const VersaConnectorContract = (await Factory.deploy(...args)) as VersaConnectorNonEth;

  await VersaConnectorContract.deployed();

  return VersaConnectorContract;
};

export const deployVersaReceiverMock = async () => {
  const Factory = (await ethers.getContractFactory("VersaReceiverMock")) as VersaReceiverMockFactory;

  const VersaReceiverMock = (await Factory.deploy()) as VersaReceiverMock;

  await VersaReceiverMock.deployed();

  return VersaReceiverMock;
};

export const deployVersaEth = async ({ args }: { args: Parameters<VersaEthFactory["deploy"]> }) => {
  const Factory = (await ethers.getContractFactory("VersaEth")) as VersaEthFactory;

  const VersaEthContract = (await Factory.deploy(...args)) as VersaEth;

  await VersaEthContract.deployed();

  return VersaEthContract;
};

export const deployVersaNonEth = async ({ args }: { args: Parameters<VersaNonEthFactory["deploy"]> }) => {
  const Factory = (await ethers.getContractFactory("VersaNonEth")) as VersaNonEthFactory;

  const VersaNonEthContract = (await Factory.deploy(...args)) as VersaNonEth;

  await VersaNonEthContract.deployed();

  return VersaNonEthContract;
};

export const deployImmutableCreate2Factory = async () => {
  const Factory = (await ethers.getContractFactory("ImmutableCreate2Factory")) as ImmutableCreate2Factory__factory;

  const ImmutableCreate2FactoryContract = (await Factory.deploy()) as ImmutableCreate2Factory;

  await ImmutableCreate2FactoryContract.deployed();

  return ImmutableCreate2FactoryContract;
};

export const getVersaConnectorEth = async (params: GetContractParams<VersaConnectorEthFactory>) =>
  getContract<VersaConnectorEthFactory, VersaConnectorEth>({
    contractName: "VersaConnectorEth",
    ...params,
  });

export const getVersaConnectorNonEth = async (params: GetContractParams<VersaConnectorNonEthFactory>) =>
  getContract<VersaConnectorNonEthFactory, VersaConnectorNonEth>({
    contractName: "VersaConnectorNonEth",
    ...params,
  });

export const getVersaFactoryNonEth = async (params: GetContractParams<VersaNonEthFactory>) =>
  await getContract<VersaNonEthFactory, VersaNonEth>({
    contractName: "VersaNonEth",
    ...params,
  });

export const getVersaFactoryEth = async (params: GetContractParams<VersaEthFactory>) =>
  await getContract<VersaEthFactory, VersaEth>({
    contractName: "VersaNonEth",
    ...params,
  });

export const getVersaInteractorMock = async (VersaToken: string) =>
  getContract<VersaInteractorMockFactory, VersaInteractorMock>({
    contractName: "VersaInteractorMock",
    deployParams: [VersaToken],
  });

export const getVersaTokenConsumerUniV2Strategy = async (params: GetContractParams<VersaTokenConsumerUniV2Factory>) =>
  getContract<VersaTokenConsumerUniV2Factory, VersaTokenConsumerUniV2>({
    contractName: "VersaTokenConsumerUniV2",
    ...params,
  });

export const getVersaTokenConsumerUniV3Strategy = async (params: GetContractParams<VersaTokenConsumerUniV3Factory>) =>
  getContract<VersaTokenConsumerUniV3Factory, VersaTokenConsumerUniV3>({
    contractName: "VersaTokenConsumerUniV3",
    ...params,
  });

export type GetContractParams<Factory extends ContractFactory> =
  | {
      deployParams: Parameters<Factory["deploy"]>;
      existingContractAddress?: null;
    }
  | {
      deployParams?: null;
      existingContractAddress: string;
    };

export const getContract = async <Factory extends ContractFactory, Contract extends BaseContract>({
  contractName,
  deployParams,
  existingContractAddress,
}: GetContractParams<Factory> & { contractName: string }): Promise<Contract> => {
  const ContractFactory = (await ethers.getContractFactory(contractName)) as Factory;

  const isGetExistingContract = Boolean(existingContractAddress);
  if (isGetExistingContract) {
    console.log("Getting existing contract from address:", existingContractAddress);
    return ContractFactory.attach(existingContractAddress!) as Contract;
  }

  const contract = (await ContractFactory.deploy(...deployParams!)) as Contract;
  await contract.deployed();

  return contract;
};
