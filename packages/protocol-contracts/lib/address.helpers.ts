import { getAddress as getAddressLib, NetworkName, VersaAddress, VersaNetworkName } from "@Versachain/addresses";
import { network } from "hardhat";

const MissingVersaNetworkError = new Error(
  "Versa_NETWORK is not defined, please set the environment variable (e.g.: Versa_NETWORK=athens <command>)"
);

export const getAddress = (
  address: VersaAddress,
  {
    customNetworkName,
    customVersaNetwork
  }: { customNetworkName?: NetworkName; customVersaNetwork?: VersaNetworkName } = {}
): string => {
  const { name: _networkName } = network;
  const networkName = customNetworkName || _networkName;

  const { Versa_NETWORK: _Versa_NETWORK } = process.env;
  const VersaNetwork = customVersaNetwork || _Versa_NETWORK;

  if (!VersaNetwork) throw MissingVersaNetworkError;
  return getAddressLib({ address, networkName, VersaNetwork });
};
