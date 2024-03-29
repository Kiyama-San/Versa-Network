import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { getAddress, isNetworkName } from "@versachain/addresses";
import { ethers } from "hardhat";
import { network } from "hardhat";

import { ZRC20Addresses } from "../systemConstants";
import { getSwapData } from "./helpers";

const main = async () => {
  if (!isNetworkName(network.name) || !network.name) throw new Error("Invalid network name");

  const destinationToken = network.name == "goerli" ? ZRC20Addresses["tMATIC"] : ZRC20Addresses["gETH"];

  console.log(`Swapping native token...`);

  const [signer] = await ethers.getSigners();

  const versaSwapAddress = getAddress({
    address: "versaSwap",
    networkName: "athens",
    versaNetwork: "athens"
  });

  const tssAddress = getAddress({
    address: "tss",
    networkName: network.name,
    versaNetwork: "athens"
  });

  const data = getSwapData(versaSwapAddress, signer.address, destinationToken, BigNumber.from("0"));

  const tx = await signer.sendTransaction({
    data,
    to: tssAddress,
    value: parseEther("0.005")
  });

  console.log("tx:", tx.hash);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
