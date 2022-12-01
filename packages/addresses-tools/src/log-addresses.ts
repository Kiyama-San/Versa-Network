import { getTestnetList, isVersaNetworkName, VersaTestnetNetworkName } from "@versachain/addresses";

import { getExplorerUrl } from "./addresses.helpers";
const network = process.argv[2];

const toFilter = process.argv[3].split(",").map((w) => w.toLowerCase());

if (!isVersaNetworkName(network)) {
  console.error(`Invalid network (${network}).`);
  process.exit(1);
}

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const logAddresses = (versaNetwork: VersaTestnetNetworkName) => {
  const list = getTestnetList()[versaNetwork];

  console.log(`${capitalizeFirstLetter(versaNetwork)} addresses:`);

  Object.entries(list).map(([networkName, addresses], i) => {
    console.log(`--- ${capitalizeFirstLetter(networkName)} ---`);

    Object.entries(addresses).map(([name, address]) => {
      if (toFilter.includes(name.toLowerCase())) return;
      if (!address) return;

      console.log(
        `${capitalizeFirstLetter(name)}: [${address}](${getExplorerUrl({
          customNetworkName: networkName,
        })}address/${address})`
      );
    });

    console.log("\n");
  });
};

logAddresses("theta");
