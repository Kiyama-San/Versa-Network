import { isNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { Contract } from "ethers";
import { network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { Versa_INITIAL_SUPPLY } from "../lib/contracts.constants";
import { deployVersaEth, deployVersaNonEth, isEthNetworkName } from "../lib/contracts.helpers";

export async function deployVersaToken() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  let contract: Contract;

  if (isEthNetworkName(network.name)) {
    contract = await deployVersaEth({
      args: [Versa_INITIAL_SUPPLY]
    });
  } else {
    contract = await deployVersaNonEth({
      args: [getAddress("tss"), getAddress("tssUpdater")]
    });
  }

  saveAddress("VersaToken", contract.address);
  console.log("Deployed Versa to:", contract.address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deployVersaToken()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
