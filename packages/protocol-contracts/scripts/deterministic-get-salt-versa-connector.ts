import { isNetworkName } from "@Versachain/addresses";
import { VersaConnectorEth__factory, VersaConnectorNonEth__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber } from "ethers";
import { network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { isEthNetworkName } from "../lib/contracts.helpers";
import { calculateBestSalt } from "./deterministic-deploy.helpers";

const MAX_ITERATIONS = BigNumber.from(100000);
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";

export async function deterministicDeployGetSaltVersaConnector() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const VersaToken = getAddress("VersaToken");
  const tss = getAddress("tss");
  const tssUpdater = getAddress("tssUpdater");

  // @todo: decide which address use as pauser
  const constructorTypes = ["address", "address", "address", "address"];
  const constructorArgs = [VersaToken, tss, tssUpdater, tssUpdater];

  let contractBytecode;

  if (isEthNetworkName(network.name)) {
    contractBytecode = VersaConnectorEth__factory.bytecode;
  } else {
    contractBytecode = VersaConnectorNonEth__factory.bytecode;
  }

  calculateBestSalt(MAX_ITERATIONS, DEPLOYER_ADDRESS, constructorTypes, constructorArgs, contractBytecode);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployGetSaltVersaConnector()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
