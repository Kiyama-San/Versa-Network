import { isNetworkName } from "@Versachain/addresses";
import { VersaEth__factory, VersaNonEth__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber } from "ethers";
import { network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { Versa_INITIAL_SUPPLY } from "../lib/contracts.constants";
import { isEthNetworkName } from "../lib/contracts.helpers";
import { calculateBestSalt } from "./deterministic-deploy.helpers";

const MAX_ITERATIONS = BigNumber.from(100000);
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";

export async function deterministicDeployGetSaltVersaToken() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const tss = getAddress("tss");
  const tssUpdater = getAddress("tssUpdater");

  let constructorTypes;
  let constructorArgs;
  let contractBytecode;

  if (isEthNetworkName(network.name)) {
    constructorTypes = ["uint256"];
    constructorArgs = [Versa_INITIAL_SUPPLY.toString()];
    contractBytecode = VersaEth__factory.bytecode;
  } else {
    constructorTypes = ["address", "address"];
    constructorArgs = [tss, tssUpdater];
    contractBytecode = VersaNonEth__factory.bytecode;
  }

  calculateBestSalt(MAX_ITERATIONS, DEPLOYER_ADDRESS, constructorTypes, constructorArgs, contractBytecode);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployGetSaltVersaToken()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
