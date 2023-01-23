import {
  isLocalNetworkName,
  isMainnetNetworkName,
  isNetworkName,
  isTestnetNetworkName,
  isVersaLocalnet,
  isVersaMainnet,
  isVersaNetworkName,
  isVersaTestnet,
  LocalnetAddressGroup,
  LocalNetworkName,
  MainnetAddressGroup,
  MainnetNetworkName,
  NetworkAddresses,
  NetworkName,
  TestnetAddressGroup,
  TestnetNetworkName,
  VersaAddress,
  VersaLocalNetworkName,
  VersaMainnetNetworkName,
  VersaNetworkName,
  VersaTestnetNetworkName
} from "@Versachain/addresses";
import dotenv from "dotenv";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { network } from "hardhat";
import { join } from "path";

import { deepCloneSerializable } from "./misc.helpers";

const LOCAL_PKG = "addresses-tools";
const PUBLIC_PKG = "addresses";

const dirname = __dirname.replace(LOCAL_PKG, PUBLIC_PKG);

export const getScanVariable = ({ customNetworkName }: { customNetworkName?: string } = {}): string => {
  const networkName = customNetworkName || network.name;
  if (!isNetworkName(networkName)) throw new Error();
  dotenv.config();

  const v = {
    theta: "",
    "bitcoin-test": "",
    "bsc-localnet": "",
    "bsc-testnet": process.env.BSCSCAN_API_KEY || "",
    "eth-localnet": "",
    "eth-mainnet": process.env.ETHERSCAN_API_KEY || "",
    goerli: process.env.ETHERSCAN_API_KEY || "",
    hardhat: "",
    "klaytn-baobab": "",
    "klaytn-cypress": "",
    "polygon-localnet": "",
    "polygon-mumbai": process.env.POLYGONSCAN_API_KEY || "",
    ropsten: process.env.ETHERSCAN_API_KEY || ""
  };

  return v[networkName];
};

export const getExplorerUrl = ({ customNetworkName }: { customNetworkName?: string } = {}): string => {
  const networkName = customNetworkName || network.name;
  if (!isNetworkName(networkName)) throw new Error();
  dotenv.config();

  const v = {
    theta: "",
    "bitcoin-test": "",
    "bsc-localnet": "",
    "bsc-testnet": "https://testnet.bscscan.com/",
    "eth-localnet": "",
    "eth-mainnet": "https://etherscan.io/",
    goerli: "https://goerli.etherscan.io/",
    hardhat: "",
    "klaytn-baobab": "https://baobab.scope.klaytn.com/",
    "klaytn-cypress": "https://scope.klaytn.com/",
    "polygon-localnet": "",
    "polygon-mumbai": "https://mumbai.polygonscan.com/",
    ropsten: "https://ropsten.etherscan.io/"
  };

  return v[networkName];
};

export const getGasSymbolByNetwork = (networkName: NetworkName): string => {
  const v = {
   theta: "VERSA",
    "bitcoin-test": "BTC",
    "bsc-localnet": "BNB",
    "bsc-testnet": "BNB",
    "eth-localnet": "ETH",
    "eth-mainnet": "ETH",
    goerli: "ETH",
    hardhat: "ETH",
    "klaytn-baobab": "KLAY",
    "klaytn-cypress": "KLAY",
    "polygon-localnet": "MATIC",
    "polygon-mumbai": "MATIC",
    ropsten: "BYEBYE"
  };

  return v[networkName];
};

const MissingVersaNetworkError = new Error(
  "VERSA_NETWORK is not defined, please set the environment variable (e.g.: VERSA_NETWORK=theta <command>)"
);

export const saveAddress = (addressName: VersaAddress, newAddress: string) => {
  const { VERSA_NETWORK } = process.env;
  const { name: networkName } = network;

  if (!VERSA_NETWORK) throw MissingVersaNetworkError;

  console.log(`Updating ${addressName} address on ${VERSA_NETWORK}: ${networkName}.`);

  const filename = join(dirname, `./addresses.${VERSA_NETWORK}.json`);

  if (isVersaLocalnet(VERSA_NETWORK) && isLocalNetworkName(networkName)) {
    const newAddresses: LocalnetAddressGroup = JSON.parse(readFileSync(filename, "utf8"));
    if (typeof newAddresses[networkName][addressName] === "undefined") {
      console.log(
        `The address ${addressName} does not exist, it will get created but make sure to add it to the types.`
      );
    }

    newAddresses[networkName][addressName] = newAddress;

    writeFileSync(filename, JSON.stringify(newAddresses, null, 2));

    console.log(`Updated, new address: ${newAddress}.`);

    return;
  }

  if (isVersaTestnet(VERSA_NETWORK) && isTestnetNetworkName(networkName)) {
    const newAddresses: TestnetAddressGroup = JSON.parse(readFileSync(filename, "utf8"));
    newAddresses[networkName][addressName] = newAddress;

    writeFileSync(filename, JSON.stringify(newAddresses, null, 2));

    console.log(`Updated, new address: ${newAddress}.`);

    return;
  }

  if (isVersaMainnet(VERSA_NETWORK) && isMainnetNetworkName(networkName)) {
    const newAddresses: MainnetAddressGroup = JSON.parse(readFileSync(filename, "utf8"));
    newAddresses[networkName][addressName] = newAddress;

    writeFileSync(filename, JSON.stringify(newAddresses, null, 2));

    console.log(`Updated, new address: ${newAddress}.`);

    return;
  }

  throw new Error(`Invalid VERSA_NETWORK + network combination ${VERSA_NETWORK} ${networkName}.`);
};

export const addNewAddress = (addressName: string, addressValue: string = "") => {
  if (!addressName) throw new Error("Emtpy address name.");

  const addressesDirname = join(dirname, `./`);
  const addressesFiles = readdirSync(addressesDirname).filter(fileName => fileName.includes(".json"));

  addressesFiles.forEach(addressesFilename => {
    const addressPath = join(addressesDirname, addressesFilename);

    const addressesByNetwork = JSON.parse(readFileSync(addressPath, "utf8"));

    Object.keys(addressesByNetwork).forEach(network => {
      if (!isNetworkName(network) && !isVersaNetworkName(network)) return;

      addressesByNetwork[network][addressName] = addressValue;
      addressesByNetwork[network] = Object.keys(addressesByNetwork[network])
        .sort()
        .reduce((obj, key) => {
          obj[key as VersaAddress] = addressesByNetwork[network][key];
          return obj;
        }, {} as NetworkAddresses);
    });

    writeFileSync(addressPath, JSON.stringify(addressesByNetwork, null, 2));
  });

  console.log(`To enable IntelliSense, add the address (${addressName}) to the constants (addresses.helpers.ts).`);
};

export const addNewNetwork = (newNetworkName: string, addTo: VersaNetworkName[]) => {
  if (!newNetworkName) throw new Error("Emtpy networkName name.");
  const addressesDirname = join(dirname, `./`);
  const addressesFiles = readdirSync(addressesDirname).filter(fileName => fileName.includes(".json"));

  addressesFiles.forEach(addressFilename => {
    const addressesFilePath = join(addressesDirname, addressFilename);
    /**
     * Gets the Versa network name using the filename, e.g.: addresses.theta.json -> theta
     */
    const versaNetworkName = addressFilename.substring(
      addressFilename.indexOf(".") + 1,
      addressFilename.lastIndexOf(".")
    );

    if (!isVersaNetworkName(versaNetworkName)) throw new Error("Error getting Versa network name.");

    if (!addTo.includes(versaNetworkName)) return;

    const fileNetworks = JSON.parse(readFileSync(addressesFilePath, "utf8"));

    if (Boolean(fileNetworks[newNetworkName])) throw new Error("Network already exists.");

    /**
     * Use an existing network object to populate the new one
     */
    const randomNetworkName = Object.keys(fileNetworks)[0];
    fileNetworks[newNetworkName] = deepCloneSerializable(fileNetworks[randomNetworkName]);

    const emptyNewNetworkAddresses = () => {
      Object.keys(fileNetworks[newNetworkName]).forEach(addressName => {
        fileNetworks[newNetworkName][addressName] = "";
      });
    };
    emptyNewNetworkAddresses();

    const orderedFileNetworks = Object.keys(fileNetworks)
      .sort()
      .reduce((obj, key) => {
        obj[key as LocalNetworkName | MainnetNetworkName | TestnetNetworkName] = fileNetworks[key];
        return obj;
      }, {} as LocalnetAddressGroup & MainnetAddressGroup & TestnetAddressGroup);

    writeFileSync(addressesFilePath, JSON.stringify(orderedFileNetworks, null, 2));
  });

  console.log(`To enable IntelliSense, add the network (${newNetworkName}) to the constants (addresses.helpers.ts).`);
};

export const getLocalnetListFromFile = async (): Promise<Record<VersaLocalNetworkName, LocalnetAddressGroup>> => {
  const alpha = await require("./addresses.alpha.json");
  return {
    alpha: alpha as LocalnetAddressGroup
  };
};

export const getTestnetListFromFile = async (): Promise<Record<VersaTestnetNetworkName, TestnetAddressGroup>> => {
  const theta = await require("./addresses.theta.json");
  return {
    theta: theta as TestnetAddressGroup
  };
};

export const getMainnetListFromFile = async (): Promise<Record<VersaMainnetNetworkName, MainnetAddressGroup>> => {
  const mainnet = await require("./addresses.mainnet.json");
  return {
    mainnet: mainnet as MainnetAddressGroup
  };
};

export const loadAddressFromFile = async (
  address: VersaAddress,
  {
    customNetworkName,
    customVersaNetwork
  }: { customNetworkName?: NetworkName; customVersaNetwork?: VersaNetworkName } = {}
): Promise<string> => {
  const { name: _networkName } = network;
  const networkName = customNetworkName || _networkName;

  const { VERSA_NETWORK: _VERSA_NETWORK } = process.env;
  const VERSA_NETWORK = customVersaNetwork || _VERSA_NETWORK;

  if (!VERSA_NETWORK) throw MissingVersaNetworkError;

  console.log(`Getting ${address} address from ${VERSA_NETWORK}: ${networkName}.`);

  if (isVersaLocalnet(VERSA_NETWORK) && isLocalNetworkName(networkName)) {
    return (await getLocalnetListFromFile())[VERSA_NETWORK][networkName][address];
  }

  if (isVersaTestnet(VERSA_NETWORK) && isTestnetNetworkName(networkName)) {
    return (await getTestnetListFromFile())[VERSA_NETWORK][networkName][address];
  }

  if (isVersaMainnet(VERSA_NETWORK) && isMainnetNetworkName(networkName)) {
    return (await getMainnetListFromFile())[VERSA_NETWORK][networkName][address];
  }

  throw new Error(`Invalid VERSA_NETWORK + network combination ${VERSA_NETWORK} ${networkName}.`);
};
