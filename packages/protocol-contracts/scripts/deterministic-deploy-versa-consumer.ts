import { isNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { VersaTokenConsumerUniV2__factory } from "@Versachain/interfaces/typechain-types";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { Versa_CONSUMER_SALT_NUMBER } from "../lib/contracts.constants";
import { deployContractToAddress, saltToHex } from "../lib/ImmutableCreate2Factory/ImmutableCreate2Factory.helpers";

const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";

export async function deterministicDeployVersaConsumer() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const accounts = await ethers.getSigners();
  const [signer] = accounts;

  const saltNumber = Versa_CONSUMER_SALT_NUMBER;
  const saltStr = BigNumber.from(saltNumber).toHexString();

  const VersaToken = getAddress("VersaToken");
  const uniswapV2Router02 = getAddress("uniswapV2Router02");

  const immutableCreate2Factory = getAddress("immutableCreate2Factory");

  const salthex = saltToHex(saltStr, DEPLOYER_ADDRESS);
  const constructorTypes = ["address", "address"];
  const constructorArgs = [VersaToken, uniswapV2Router02];

  const contractBytecode = VersaTokenConsumerUniV2__factory.bytecode;

  const { address } = await deployContractToAddress({
    constructorArgs,
    constructorTypes,
    contractBytecode,
    factoryAddress: immutableCreate2Factory,
    salt: salthex,
    signer
  });

  saveAddress("VersaTokenConsumerUniV2", address);
  console.log("Deployed VersaConsumer. Address:", address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployVersaConsumer()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
