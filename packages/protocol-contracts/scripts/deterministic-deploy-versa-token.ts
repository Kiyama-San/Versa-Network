import { isNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { VersaEth__factory, VersaNonEth__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import {
  Versa_INITIAL_SUPPLY,
  Versa_TOKEN_SALT_NUMBER_ETH,
  Versa_TOKEN_SALT_NUMBER_NON_ETH
} from "../lib/contracts.constants";
import { isEthNetworkName } from "../lib/contracts.helpers";
import { deployContractToAddress, saltToHex } from "../lib/ImmutableCreate2Factory/ImmutableCreate2Factory.helpers";

const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";

export async function deterministicDeployVersaToken() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const accounts = await ethers.getSigners();
  const [signer] = accounts;

  const saltNumber = isEthNetworkName(network.name) ? Versa_TOKEN_SALT_NUMBER_ETH : Versa_TOKEN_SALT_NUMBER_NON_ETH;
  const saltStr = BigNumber.from(saltNumber).toHexString();

  const tss = getAddress("tss");
  const tssUpdater = getAddress("tssUpdater");
  const immutableCreate2Factory = getAddress("immutableCreate2Factory");

  const salthex = saltToHex(saltStr, DEPLOYER_ADDRESS);

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

  const { address } = await deployContractToAddress({
    constructorArgs,
    constructorTypes,
    contractBytecode,
    factoryAddress: immutableCreate2Factory,
    salt: salthex,
    signer
  });

  saveAddress("VersaToken", address);
  console.log("Deployed VersaToken. Address:", address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployVersaToken()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
