import { isNetworkName } from "@versachain/addresses";
import { saveAddress } from "@versachain/addresses-tools";
import { ethers, network } from "hardhat";

import { getHyperChainFighters } from "../../lib/Hyper-Chain-Fighters/HyperChainFighters.helpers";

async function main() {
  if (!isNetworkName(network.name)) throw new Error("Invalid network name");

  const hyperChainFightersContract = await getHyperChainFighters();

  console.log("Setting base URI");
  (
    await hyperChainFightersContract.setBaseURI(
      ""
    )
  ).wait();

  const [deployer] = await ethers.getSigners();

  console.log("Minting");
  await hyperChainFightersContract.mint(deployer.address);

  saveAddress("crossChainNft", hyperChainFightersContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
