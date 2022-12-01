import { isLocalNetworkName } from "@Versachain/addresses";
import { saveAddress } from "@Versachain/addresses-tools";
import { ethers, network } from "hardhat";

import { isEthNetworkName } from "../lib/contracts.helpers";
import { deployVersaConnector } from "./deploy-versa-connector";
import { deployVersaToken } from "./deploy-versa-token";
import { setVersaAddresses } from "./set-Versa-token-addresses";

async function main() {
  if (isLocalNetworkName(network.name)) {
    const [owner] = await ethers.getSigners();
    saveAddress("tssUpdater", owner.address);
  }

  await deployVersaToken();
  await deployVersaConnector();

  /**
   * @description The Eth implementation of Versa token doesn't need any address
   */
  if (isEthNetworkName(network.name)) return;

  /**
   * @description Avoid setting Versa addresses for local network,
   * since it must be done after starting the local Versa node
   */
  if (!isLocalNetworkName(network.name)) {
    await setVersaAddresses();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
