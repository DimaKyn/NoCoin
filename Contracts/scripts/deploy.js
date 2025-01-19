// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    }
  }
};

// scripts/deploy.js
async function main() {
  console.log("Starting deployment...");
  
  // Get the contract factory
  const Token = await ethers.getContractFactory("NoCoin");
  console.log("Deploying token...");
  
  // Deploy the contract
  const token = await Token.deploy();
  console.log("Token deployed, waiting for confirmations...");
  
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log("Token deployed to:", tokenAddress);
  
  // Get deployment details
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  
  console.log("\nToken Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", totalSupply.toString());
  console.log("\nVerify on Etherscan:");
  console.log("--------------------");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });