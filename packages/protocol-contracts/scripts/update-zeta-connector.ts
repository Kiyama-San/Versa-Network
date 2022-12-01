import { isNetworkName } from "@Versachain/addresses";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { getVersaFactoryNonEth, isEthNetworkName } from "../lib/contracts.helpers";

async function updateVersaConnector() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const [, tssUpdaterSigner] = await ethers.getSigners();

  if (isEthNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  const contract = (
    await getVersaFactoryNonEth({ deployParams: null, existingContractAddress: getAddress("VersaToken") })
  ).connect(tssUpdaterSigner);

  await (await contract.updateTssAndConnectorAddresses(getAddress("tss"), getAddress("connector"))).wait();

  console.log(`Updated TSS address to ${getAddress("tss")}.`);
  console.log(`Updated Connector address to ${getAddress("connector")}.`);
}

updateVersaConnector()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
