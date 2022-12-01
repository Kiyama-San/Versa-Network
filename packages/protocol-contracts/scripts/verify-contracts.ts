import hardhat, { network } from "hardhat";

import { getAddress } from "../lib/address.helpers";
import { VERSA_INITIAL_SUPPLY } from "../lib/contracts.constants";
import { isEthNetworkName } from "../lib/contracts.helpers";

/**
 * @description Prevents breaking the execution flow when contract A is verified (so verifying again throws)
 * and contract B isn't yet verified
 */
const handleCatch = (e: any) => e?.message && console.error(e.message);

async function main() {
  if (isEthNetworkName(network.name)) {
    await hardhat
      .run("verify:verify", {
        address: getAddress("VersaToken"),
        constructorArguments: [Versa_INITIAL_SUPPLY],
        contract: "contracts/evm/Versa.eth.sol:VersaEth"
      })
      .catch(handleCatch);

    await hardhat
      .run("verify:verify", {
        address: getAddress("connector"),
        constructorArguments: [getAddress("VersaToken"), getAddress("tss"), getAddress("tssUpdater")],
        contract: "contracts/evm/VersaConnector.eth.sol:VersaConnectorEth"
      })
      .catch(handleCatch);
  } else {
    await hardhat
      .run("verify:verify", {
        address: getAddress("VersaToken"),
        constructorArguments: [getAddress("tss"), getAddress("tssUpdater")]
      })
      .catch(handleCatch);

    await hardhat
      .run("verify:verify", {
        address: getAddress("connector"),
        constructorArguments: [getAddress("VersaToken"), getAddress("tss"), getAddress("tssUpdater")],
        contract: "contracts/evm/VersaConnector.non-eth.sol:VersaConnectorNonEth"
      })
      .catch(handleCatch);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
