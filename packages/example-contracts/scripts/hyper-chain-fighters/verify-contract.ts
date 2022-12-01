import hardhat from "hardhat";

import { getHyperChainFightersArgs } from "../../lib/Hyper-Chain-Fighters/HyperChainFighters.helpers";
import { getAddress } from "../../lib/shared/address.helpers";

async function main() {
  await hardhat.run("verify:verify", {
    address: getAddress("crossChainNft"),
    constructorArguments: getHyperChainFightersArgs()
  });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
