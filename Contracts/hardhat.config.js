// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Your API keys from .env file
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";  // Infura API key
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";        // Your wallet's private key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""; // Etherscan API key

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  }
}