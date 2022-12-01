import { getChainId, isNetworkName, isVersaTestnet } from "@versachain/addresses";
import { saveAddress } from "@versachain/addresses-tools";
import { network } from "hardhat";

import { getMultiChainValue } from "../../lib/multi-chain-value/MultiChainValue.helpers";
import { getAddress } from "../../lib/shared/address.helpers";

const networkName = network.name;
const { VERSA_NETWORK } = process.env;

async function main() {
  if (!isNetworkName(networkName)) throw new Error("Invalid network name");

  const multiChainValueContract = await getMultiChainValue(getAddress("multiChainValue"));

  if (isVersaTestnet(VERSA_NETWORK)) {
    networkName !== "goerli" &&
      (await (await multiChainValueContract.addAvailableChainId(getChainId("goerli")))
        .wait()
        .catch(e => console.error(e)));

    networkName !== "polygon-mumbai" &&
      (await (await multiChainValueContract.addAvailableChainId(getChainId("polygon-mumbai")))
        .wait()
        .catch(e => console.error(e)));

    networkName !== "bsc-testnet" &&
      (await (await multiChainValueContract.addAvailableChainId(getChainId("bsc-testnet")))
        .wait()
        .catch(e => console.error(e)));

    networkName !== "ropsten" &&
      (await (await multiChainValueContract.addAvailableChainId(getChainId("ropsten")))
        .wait()
        .catch(e => console.error(e)));
  }

  saveAddress("multiChainValue", multiChainValueContract.address);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
