import { isNetworkName } from "@versanetwork/addresses";
import { saveAddress } from "@versanetwork/addresses-tools";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { getAddress } from "../../lib/shared/address.helpers";
import { deployContractToAddress, saltToHex } from "../../lib/shared/ImmutableCreate2Factory.helpers";
import { isEthNetworkName } from "../../lib/shared/network.constants";
import { HyperChainFighters__factory } from "../../typechain-types";

const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS ?? "";
const SALT_NUMBER = "0";

export async function deterministicDeployCrossChainNft() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const accounts = await ethers.getSigners();
  const [signer] = accounts;

  const saltNumber = SALT_NUMBER;
  const saltStr = BigNumber.from(saltNumber).toHexString();

  const connector = getAddress("connector");
  const versaToken = getAddress("versaToken");
  const versaTokenConsumerUniV2 = getAddress("versaTokenConsumerUniV2");

  const immutableCreate2Factory = getAddress("immutableCreate2Factory");

  const salthex = saltToHex(saltStr, DEPLOYER_ADDRESS);

  const useEven = isEthNetworkName(network.name);
  const constructorTypes = ["address", "address", "address", "bool"];
  const constructorArgs = [connector, versaToken, versaTokenConsumerUniV2, useEven];

  const contractBytecode = HyperChainFighters__factory.bytecode;

  const { address } = await deployContractToAddress({
    constructorArgs,
    constructorTypes,
    contractBytecode,
    factoryAddress: immutableCreate2Factory,
    salt: salthex,
    signer
  });

  saveAddress("crossChainNft", address);
  console.log("Deployed crossChainNft. Address:", address);
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  deterministicDeployCrossChainNft()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
