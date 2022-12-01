import { getAddress } from "@versachain/addresses";
import { saveAddress } from "@versachain/addresses-tools";
import { ethers } from "hardhat";

import { versaSwap, versaSwap__factory, versaSwapBtcInbound, versaSwapBtcInbound__factory } from "../../typechain-types";
import { SYSTEM_CONTRACT } from "../systemConstants";

const main = async () => {
  console.log(`Deploying versaSwap...`);

  const WVERSA_ADDRESS = getAddress({
    address: "weth9",
    networkName: "theta",
    versaNetwork: "theta"
  });

  const UNISWAP_ROUTER_ADDRESS = getAddress({
    address: "uniswapV2Router02",
    networkName: "theta",
    versaNetwork: "theta"
  });

  const Factory = (await ethers.getContractFactory("versaSwap")) as versaSwap__factory;
  const contract = (await Factory.deploy(WVERSA_ADDRESS, UNISWAP_ROUTER_ADDRESS)) as versaSwap;
  await contract.deployed();

  console.log("Deployed versaSwap. Address:", contract.address);
  saveAddress("versaSwap", contract.address);

  const FactoryBTC = (await ethers.getContractFactory("versaSwapBtcInbound")) as versaSwapBtcInbound__factory;
  const contractBTC = (await FactoryBTC.deploy(
    Wversa_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    SYSTEM_CONTRACT
  )) as versaSwapBtcInbound;
  await contractBTC.deployed();

  console.log("Deployed versaSwapBtcInbound. Address:", contractBTC.address);
  saveAddress("versaSwapBtcInbound", contractBTC.address);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
