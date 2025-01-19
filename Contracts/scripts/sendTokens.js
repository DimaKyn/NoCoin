const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    try {
        // Contract address from your deployment
        const CONTRACT_ADDRESS = process.env.CONTRACT_DESTINATION;

        // Array of recipient addresses - replace with actual addresses
        const RECIPIENT_ADDRESSES = [
            "0x993B3E26bdCfCaF41a0cAf0A626a408BC7E8E124",  // Replace with actual address
            "0x4F87454c4Ab841C3a1063923d6914E9F6621B82D",  // Replace with actual address
        ];

        // Get contract instance
        const Token = await ethers.getContractFactory("NoCoin");
        const token = await Token.attach(CONTRACT_ADDRESS);

        // Get deployer's address
        const [deployer] = await ethers.getSigners();
        console.log("Sending tokens from address:", deployer.address);

        // Check initial balance
        const initialBalance = await token.balanceOf(deployer.address);
        console.log("Initial balance:", ethers.formatEther(initialBalance));

        // Amount to transfer (5 tokens per recipient)
        const transferAmount = ethers.parseEther("17");

        // Check if we have enough balance
        const totalRequired = transferAmount * BigInt(RECIPIENT_ADDRESSES.length);
        if (initialBalance < totalRequired) {
            throw new Error("Insufficient balance for all transfers");
        }

        console.log(`\nStarting transfers of 5 tokens to ${RECIPIENT_ADDRESSES.length} addresses...`);

        // Perform transfers
        for (let i = 0; i < RECIPIENT_ADDRESSES.length; i++) {
            const recipient = RECIPIENT_ADDRESSES[i];
            console.log(`\nTransferring 5 tokens to ${recipient}...`);

            // Send transaction
            const tx = await token.transfer(recipient, transferAmount);
            console.log("Transaction hash:", tx.hash);
            
            // Wait for confirmation
            await tx.wait();
            console.log("Transfer confirmed!");

            // Get recipient's new balance
            const recipientBalance = await token.balanceOf(recipient);
            console.log(`Recipient ${i + 1} new balance:`, ethers.formatEther(recipientBalance));
        }

        // Check final balance of sender
        const finalBalance = await token.balanceOf(deployer.address);
        console.log("\nFinal sender balance:", ethers.formatEther(finalBalance));
        console.log("All transfers completed successfully!");

    } catch (error) {
        console.error("Error during transfer:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });