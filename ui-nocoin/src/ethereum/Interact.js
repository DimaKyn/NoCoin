// Interact.js
import { ethers } from "ethers";

const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "_balances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_total",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "_totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address payable",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "allowed",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStat",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "Amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "Volume",
              "type": "uint256"
            }
          ],
          "internalType": "struct NoCoin.Transactions",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address payable",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }];
    
export const Interact = async () => {
    try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }

        // Contract address from your deployment
        const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address

        // Array of recipient addresses
        const RECIPIENT_ADDRESSES = [
            "0x993B3E26bdCfCaF41a0cAf0A626a408BC7E8E124",
            "0x4F87454c4Ab841C3a1063923d6914E9F6621B82D",
        ];

        // Connect to MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Get contract instance
        const token = new ethers.Contract(
            CONTRACT_ADDRESS,
            contractABI,
            signer
        );

        // Get connected address
        const address = await signer.getAddress();
        console.log("Sending tokens from address:", address);

        // Check initial balance
        const initialBalance = await token.balanceOf(address);
        console.log("Initial balance:", ethers.utils.formatEther(initialBalance));

        // Amount to transfer (17 tokens per recipient)
        const transferAmount = ethers.utils.parseEther("17");

        // Check if we have enough balance
        const totalRequired = transferAmount.mul(RECIPIENT_ADDRESSES.length);
        if (initialBalance.lt(totalRequired)) {
            throw new Error("Insufficient balance for all transfers");
        }

        const results = [];
        
        // Perform transfers
        for (const recipient of RECIPIENT_ADDRESSES) {
            console.log(`Transferring 17 tokens to ${recipient}...`);

            // Send transaction
            const tx = await token.transfer(recipient, transferAmount);
            console.log("Transaction hash:", tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log("Transfer confirmed!");

            // Get recipient's new balance
            const recipientBalance = await token.balanceOf(recipient);
            
            results.push({
                recipient,
                hash: tx.hash,
                newBalance: ethers.utils.formatEther(recipientBalance)
            });
        }

        // Check final balance of sender
        const finalBalance = await token.balanceOf(address);
        
        return {
            success: true,
            initialBalance: ethers.utils.formatEther(initialBalance),
            finalBalance: ethers.utils.formatEther(finalBalance),
            transfers: results
        };

    } catch (error) {
        console.error("Error during transfer:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

export default Interact;




// import hardhat from "../../../Contracts/node_modules/hardhat";
// import dotenv from "../../../Contracts/node_modules/dotenv";
// dotenv.config();

// async function Interact() {
//     try {
//         // Contract address from your deployment
//         const CONTRACT_ADDRESS = process.env.CONTRACT_DESTINATION;

//         // Array of recipient addresses - replace with actual addresses
//         const RECIPIENT_ADDRESSES = [
//             "0x993B3E26bdCfCaF41a0cAf0A626a408BC7E8E124",  // Replace with actual address
//             "0x4F87454c4Ab841C3a1063923d6914E9F6621B82D",  // Replace with actual address
//         ];

//         // Get contract instance
//         const Token = await ethers.getContractFactory("NoCoin");
//         const token = await Token.attach(CONTRACT_ADDRESS);

//         // Get deployer's address
//         const [deployer] = await ethers.getSigners();
//         console.log("Sending tokens from address:", deployer.address);

//         // Check initial balance
//         const initialBalance = await token.balanceOf(deployer.address);
//         console.log("Initial balance:", ethers.formatEther(initialBalance));

//         // Amount to transfer (5 tokens per recipient)
//         const transferAmount = ethers.parseEther("17");

//         // Check if we have enough balance
//         const totalRequired = transferAmount * BigInt(RECIPIENT_ADDRESSES.length);
//         if (initialBalance < totalRequired) {
//             throw new Error("Insufficient balance for all transfers");
//         }

//         console.log(`\nStarting transfers of 5 tokens to ${RECIPIENT_ADDRESSES.length} addresses...`);

//         // Perform transfers
//         for (let i = 0; i < RECIPIENT_ADDRESSES.length; i++) {
//             const recipient = RECIPIENT_ADDRESSES[i];
//             console.log(`\nTransferring 5 tokens to ${recipient}...`);

//             // Send transaction
//             const tx = await token.transfer(recipient, transferAmount);
//             console.log("Transaction hash:", tx.hash);

//             // Wait for confirmation
//             await tx.wait();
//             console.log("Transfer confirmed!");

//             // Get recipient's new balance
//             const recipientBalance = await token.balanceOf(recipient);
//             console.log(`Recipient ${i + 1} new balance:`, ethers.formatEther(recipientBalance));
//         }

//         // Check final balance of sender
//         const finalBalance = await token.balanceOf(deployer.address);
//         console.log("\nFinal sender balance:", ethers.formatEther(finalBalance));
//         console.log("All transfers completed successfully!");

//     } catch (error) {
//         console.error("Error during transfer:", error);
//         throw error;
//     }
// }

// export defaultInteract;