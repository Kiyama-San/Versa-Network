import { getChainId } from "@Versachain/addresses";
import { VersaConnectorEth__factory as VersaConnectorEthFactory } from "@Versachain/interfaces/typechain-types";
import { AbiCoder } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { getAddress } from "../lib/address.helpers";

const encoder = new AbiCoder();

async function main() {
  const factory = (await ethers.getContractFactory("VersaConnectorEth")) as VersaConnectorEthFactory;

  const contract = factory.attach(getAddress("connector"));

  console.log("Sending");
  await (
    await contract.send({
      destinationAddress: encoder.encode(["address"], ["0x09b80BEcBe709Dd354b1363727514309d1Ac3C7b"]),
      destinationChainId: getChainId("bsc-testnet"),
      destinationGasLimit: 1_000_000,
      message: encoder.encode(["address"], ["0x09b80BEcBe709Dd354b1363727514309d1Ac3C7b"]),
      VersaParams: [],
      VersaValueAndGas: 0
    })
  ).wait();
  console.log("Sent");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
