const { ethers } = require("hardhat");

// scripts/interact.js
export async function Interact() {
  try {
    // Get the deployed contract address from deployment
    const CONTRACT_ADDRESS = process.env.CONTRACT_DESTINATION; // Replace with your deployed contract address
    const RECIPIENT_ADDRESS = process.env.PRIVATE_KEY; // Your MetaMask wallet address

    // Get contract instance
    const Token = await ethers.getContractFactory("NoCoin");
    const token = await Token.attach(CONTRACT_ADDRESS);

    // Get deployer's address (this will be the one with initial token supply)
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with token from address:", deployer.address);

    // Check initial balances
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(deployerBalance));

    // Amount to transfer (e.g., 100 tokens)
    const transferAmount = ethers.parseEther("100");

    // Transfer tokens
    console.log(`Transferring ${ethers.formatEther(transferAmount)} tokens to ${RECIPIENT_ADDRESS}...`);
    const tx = await token.transfer(RECIPIENT_ADDRESS, transferAmount);

    // Wait for transaction to be mined
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Transfer complete!");

    // Check new balances
    const newDeployerBalance = await token.balanceOf(deployer.address);
    const recipientBalance = await token.balanceOf(RECIPIENT_ADDRESS);

    console.log("\nNew balances:");
    console.log("Deployer:", ethers.formatEther(newDeployerBalance));
    console.log("Recipient:", ethers.formatEther(recipientBalance));

  } catch (error) {
    console.error("Error:", error);
  }
}