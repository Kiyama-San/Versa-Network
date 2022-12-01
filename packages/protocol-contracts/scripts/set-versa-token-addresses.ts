import { isNetworkName } from "@Versachain/addresses";
import { VersaNonEth__factory as VersaNonEthFactory } from "@Versachain/interfaces/typechain-types";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";

export async function setVersaAddresses() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const factory = (await ethers.getContractFactory("VersaNonEth")) as VersaNonEthFactory;

  const [, tssSigner] = await ethers.getSigners();

  const contract = factory.attach(getAddress("VersaToken")).connect(tssSigner);

  console.log("Updating");
  await (await contract.updateTssAndConnectorAddresses(getAddress("tss"), getAddress("connector"))).wait();
  console.log("Updated");
}

if (!process.env.EXECUTE_PROGRAMMATICALLY) {
  setVersaAddresses()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
