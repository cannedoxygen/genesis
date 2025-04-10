/**
 * AIKIRA: GENESIS PROTOCOL
 * Deployment Script for Base Network
 * 
 * This script deploys the Genesis NFT contract to Base Network
 * and initializes it with the correct configurations.
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AIKIRA: GENESIS PROTOCOL contracts to Base Network...");

  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Get deployer balance
  const balance = await deployer.getBalance();
  console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Check if we're on Base Network
  const isBase = network.chainId === 8453 || network.chainId === 84531;
  if (!isBase) {
    console.warn("WARNING: Not deploying to Base Network!");
    console.warn("Current network chainId:", network.chainId);
    console.warn("Please connect to Base Mainnet (8453) or Base Goerli (84531)");
  }

  // Deploy Genesis NFT contract
  console.log("Deploying Genesis NFT contract...");
  const GenesisNFT = await ethers.getContractFactory("GenesisNFT");
  
  // Set parameters
  const name = "AIKIRA Genesis Protocol";
  const symbol = "AIKIRA";
  const baseURI = "ipfs://";  // IPFS base URI
  const rewardsWallet = process.env.REWARDS_WALLET || deployer.address;
  
  // Deploy contract
  const genesisNFT = await GenesisNFT.deploy(
    name,
    symbol,
    baseURI,
    rewardsWallet
  );
  
  // Wait for deployment
  await genesisNFT.deployed();
  console.log(`Genesis NFT deployed to: ${genesisNFT.address}`);

  // Set token reward amount if specified
  if (process.env.TOKEN_REWARD_AMOUNT) {
    const amount = ethers.utils.parseEther(process.env.TOKEN_REWARD_AMOUNT);
    console.log(`Setting token reward amount to ${process.env.TOKEN_REWARD_AMOUNT} AIKIRA...`);
    await genesisNFT.setTokenRewardAmount(amount);
    console.log("Token reward amount set successfully");
  }

  // Verify contract on explorer (only for testnets and mainnet)
  if (network.chainId !== 31337) {
    console.log("Waiting for block confirmations...");
    await genesisNFT.deployTransaction.wait(5);
    
    console.log("Verifying contract on BaseScan...");
    await hre.run("verify:verify", {
      address: genesisNFT.address,
      constructorArguments: [name, symbol, baseURI, rewardsWallet],
    });
  }

  console.log("Deployment complete!");
  console.log("Contract addresses:");
  console.log(`- GenesisNFT: ${genesisNFT.address}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });