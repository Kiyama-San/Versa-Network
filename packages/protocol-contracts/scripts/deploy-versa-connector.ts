import { isNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { Contract } from "ethers";
import { network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { deployVersaConnectorEth, deployVersaConnectorNonEth, isEthNetworkName } from "../lib/contracts.helpers";

export async function deployVersaConnector() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  let contract: Contract;
  console.log(`Deploying VersaConnector to ${network.name}`);

  if (isEthNetworkName(network.name)) {
    contract = await deployVersaConnectorEth({
      args: [getAddress("VersaToken"), getAddress("tss"), getAddress("tssUpdater"), getAddress("tssUpdater")]
    });
  } else {
    contract = await deployVersaConnectorNonEth({
      args: [getAddress("VersaToken"), getAddress("tss"), getAddress("tssUpdater"), getAddress("tssUpdater")]
    });
  }

  saveAddress("connector", contract.address);
  console.log("Deployed VersaConnector. Address:", contract.address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deployVersaConnector()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
