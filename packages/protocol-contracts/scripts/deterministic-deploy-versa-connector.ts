import { isNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { VersaConnectorEth__factory, VersaConnectorNonEth__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { Versa_CONNECTOR_SALT_NUMBER_ETH, Versa_CONNECTOR_SALT_NUMBER_NON_ETH } from "../lib/contracts.constants";
import { isEthNetworkName } from "../lib/contracts.helpers";
import { deployContractToAddress, saltToHex } from "../lib/ImmutableCreate2Factory/ImmutableCreate2Factory.helpers";

const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";

export async function deterministicDeployVersaConnector() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const accounts = await ethers.getSigners();
  const [signer] = accounts;

  const saltNumber = isEthNetworkName(network.name)
    ? Versa_CONNECTOR_SALT_NUMBER_ETH
    : Versa_CONNECTOR_SALT_NUMBER_NON_ETH;
  const saltStr = BigNumber.from(saltNumber).toHexString();

  const VersaToken = getAddress("VersaToken");
  const tss = getAddress("tss");
  const tssUpdater = getAddress("tssUpdater");
  const immutableCreate2Factory = getAddress("immutableCreate2Factory");

  const salthex = saltToHex(saltStr, DEPLOYER_ADDRESS);
  const constructorTypes = ["address", "address", "address", "address"];
  const constructorArgs = [VersaToken, tss, tssUpdater, tssUpdater];

  let contractBytecode;
  if (isEthNetworkName(network.name)) {
    contractBytecode = VersaConnectorEth__factory.bytecode;
  } else {
    contractBytecode = VersaConnectorNonEth__factory.bytecode;
  }

  const { address } = await deployContractToAddress({
    constructorArgs,
    constructorTypes,
    contractBytecode,
    factoryAddress: immutableCreate2Factory,
    salt: salthex,
    signer
  });

  saveAddress("connector", address);
  console.log("Deployed VersaConnector. Address:", address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployVersaConnector()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
