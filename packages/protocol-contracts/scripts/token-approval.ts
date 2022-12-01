import { isNetworkName } from "@Versachain/addresses";
import { ethers, network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { getVersaFactoryEth, getVersaFactoryNonEth, isEthNetworkName } from "../lib/contracts.helpers";

const approvalAmount = ethers.utils.parseEther("10000000.0");

export async function setTokenApproval() {
  if (!isNetworkName(network.name)) {
    throw new Error(`network.name: ${network.name} isn't supported.`);
  }

  let contract;
  if (isEthNetworkName(network.name)) {
    contract = await getVersaFactoryEth({ deployParams: null, existingContractAddress: getAddress("VersaToken") });
  } else {
    contract = await getVersaFactoryNonEth({ deployParams: null, existingContractAddress: getAddress("VersaToken") });
  }

  let tx = await contract.approve(getAddress("connector"), approvalAmount);
  tx.wait();

  console.log(`Approved Connector Contract ${getAddress("connector")} for ${approvalAmount} `);
}

setTokenApproval()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
