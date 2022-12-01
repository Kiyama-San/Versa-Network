import theta from "./addresses.theta.json";
import mainnet from "./addresses.mainnet.json";
import alpha from "./addresses.alpha.json";

export type VersaAddress =
  | "connector"
  | "crossChainCounter"
  | "crossChainNft"
  | "dai"
  | "immutableCreate2Factory"
  | "multiChainSwap"
  | "multiChainSwapVersaConnector"
  | "multiChainValue"
  | "tss"
  | "tssUpdater"
  | "uniswapV2Factory"
  | "uniswapV2Router02"
  | "uniswapV3NftManager"
  | "uniswapV3Quoter"
  | "uniswapV3Router"
  | "usdc"
  | "weth9"
  | "versaSwap"
  | "versaSwapBtcInbound"
  | "versaToken"
  | "versaTokenConsumerUniV2";

export type NetworkAddresses = Record<VersaAddress, string>;
const versaAddresses: Record<VersaAddress, boolean> = {
  connector: true,
  crossChainCounter: true,
  crossChainNft: true,
  dai: true,
  immutableCreate2Factory: true,
  multiChainSwap: true,
  multiChainSwapVersaConnector: true,
  multiChainValue: true,
  tss: true,
  tssUpdater: true,
  uniswapV2Factory: true,
  uniswapV2Router02: true,
  uniswapV3NftManager: true,
  uniswapV3Quoter: true,
  uniswapV3Router: true,
  usdc: true,
  weth9: true,
  versaSwap: true,
  versaSwapBtcInbound: true,
  versaToken: true,
  versaTokenConsumerUniV2: true
};

export const isVersaAddress = (a: string | undefined): a is VersaAddress => Boolean(versaAddresses[a as VersaAddress]);

/**
 * @description Localnet
 */

export type LocalNetworkName = "bsc-localnet" | "eth-localnet" | "hardhat" | "polygon-localnet";
export type VersaLocalNetworkName = "troy";
export type LocalnetAddressGroup = Record<LocalNetworkName, NetworkAddresses>;
export const isLocalNetworkName = (networkName: string): networkName is LocalNetworkName =>
  networkName === "hardhat" ||
  networkName === "eth-localnet" ||
  networkName === "bsc-localnet" ||
  networkName === "polygon-localnet";
export const isVersaLocalnet = (networkName: string | undefined): networkName is VersaLocalNetworkName =>
  networkName === "troy";

export const getLocalnetList = (): Record<VersaLocalNetworkName, LocalnetAddressGroup> => ({
  troy: troy as LocalnetAddressGroup
});

/**
 * @description Testnet
 */

export type TestnetNetworkName =
  | "athens"
  | "bitcoin-test"
  | "bsc-testnet"
  | "goerli"
  | "klaytn-baobab"
  | "polygon-mumbai"
  | "ropsten";
export type VersaTestnetNetworkName = "theta";
export type TestnetAddressGroup = Record<TestnetNetworkName, NetworkAddresses>;
export const isTestnetNetworkName = (networkName: string): networkName is TestnetNetworkName =>
  networkName === "goerli" ||
  networkName === "bsc-testnet" ||
  networkName === "polygon-mumbai" ||
  networkName === "ropsten" ||
  networkName === "klaytn-baobab" ||
  networkName === "theta";
export const isVersaTestnet = (networkName: string | undefined): networkName is VersaTestnetNetworkName =>
  networkName === "theta";

export const getTestnetList = (): Record<VersaTestnetNetworkName, TestnetAddressGroup> => ({
  theta: theta as TestnetAddressGroup
});

/**
 * @description Mainnet
 */

export type MainnetNetworkName = "eth-mainnet" | "klaytn-cypress";
export type VersaMainnetNetworkName = "Versa-Mainnet";
export type MainnetAddressGroup = Record<MainnetNetworkName, NetworkAddresses>;
export const isMainnetNetworkName = (networkName: string): networkName is MainnetNetworkName =>
  networkName === "eth-mainnet" || networkName === "klaytn-cypress";
export const isVersaMainnet = (networkName: string | undefined): networkName is VersaMainnetNetworkName =>
  networkName === "mainnet";

export const getMainnetList = (): Record<VersaMainnetNetworkName, MainnetAddressGroup> => ({
  mainnet: mainnet as MainnetAddressGroup
});

/**
 * @description Shared
 */

export type NetworkName = LocalNetworkName | MainnetNetworkName | TestnetNetworkName;
export type VersaNetworkName = VersaLocalNetworkName | VersaMainnetNetworkName | VersaTestnetNetworkName;

export const getChainId = (networkName: NetworkName) => {
  const chainIds: Record<NetworkName, number> = {
    theta: 7001,
    "bitcoin-test": 18332,
    "bsc-localnet": 97,
    "bsc-testnet": 97,
    "eth-localnet": 5,
    "eth-mainnet": 1,
    goerli: 5,
    hardhat: 1337,
    "klaytn-baobab": 1001,
    "klaytn-cypress": 8217,
    "polygon-localnet": 80001,
    "polygon-mumbai": 80001,
    ropsten: 3
  };

  return chainIds[networkName];
};

export const isNetworkName = (str: string): str is NetworkName =>
  isLocalNetworkName(str) || isTestnetNetworkName(str) || isMainnetNetworkName(str);

export const isVersaNetworkName = (str: string): str is VersaNetworkName =>
  isVersaLocalnet(str) || isVersaTestnet(str) || isVersaMainnet(str);

const getInvalidNetworkError = (network: string, isVersa: boolean) =>
  new Error(`Network: ${network} is invalid${isVersa ? " VersaNetwork" : ""}, please provide a valid value`);

export const getAddress = ({
  address,
  networkName,
  versaNetwork
}: {
  address: VersaAddress;
  networkName: string;
  versaNetwork: string;
}): string => {
  if (!isNetworkName(networkName)) throw getInvalidNetworkError(networkName, false);
  if (!isVersaNetworkName(versaNetwork)) throw getInvalidNetworkError(networkName, true);

  console.log(`Getting ${address} address from ${versaNetwork}: ${networkName}.`);

  if (isVersaLocalnet(versaNetwork) && isLocalNetworkName(networkName)) {
    return getLocalnetList()[versaNetwork][networkName][address];
  }

  if (isVersaTestnet(versaNetwork) && isTestnetNetworkName(networkName)) {
    return getTestnetList()[versaNetwork][networkName][address];
  }

  if (isVersaMainnet(versaNetwork) && isMainnetNetworkName(networkName)) {
    return getMainnetList()[versaNetwork][networkName][address];
  }

  throw new Error(`Invalid VERSA_NETWORK + network combination ${versaNetwork} ${networkName}.`);
};
