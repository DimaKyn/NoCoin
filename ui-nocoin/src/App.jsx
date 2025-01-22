import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import { Web3Provider } from '@ethersproject/providers';

const CONTRACT_ADDRESS = "0x2D08c91EB2944aD1De848934A5a09C71ccf6cEAd";
const contractABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)"
];

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [spenderAddress, setSpenderAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState({ message: "", isError: false });
  const [transactionHash, setTransactionHash] = useState("");
  const [tokenInfo, setTokenInfo] = useState({
    balance: "0",
    totalSupply: "0",
    allowance: "0"
  });
  const [checkAddress, setCheckAddress] = useState("");
  const [otherBalance, setOtherBalance] = useState("");
  // 'direct' or 'allowance'
  const [transferType, setTransferType] = useState('direct'); 
  const [fromAddress, setFromAddress] = useState('');

  const checkBalance = async () => {
    if (!checkAddress) return;

    try {
      const provider = new Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      const balance = await contract.balanceOf(checkAddress);
      setOtherBalance(ethers.formatEther(balance));
    }
    catch (err) {
      console.error("Error fetching token info:", err);
      setStatus({
        message: "Failed to fetch token information: " + err.message,
        isError: true
      });
    }
  }

  useEffect(() => {
    checkBalance();
  }, [checkAddress]);

  // Handle transaction and update status message
  const handleTransaction = async (txPromise, successMessage) => {
    try {
      const tx = await txPromise;
      setTransactionHash(tx.hash);
      console.log("Transaction sent! Waiting for confirmation...");

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(successMessage);
        setStatus({ message: successMessage, isError: false });
        await getTokenInfo();
        return true;
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Transaction failed:", err.message);
      setStatus({
        message: "Transaction failed: " + err.message,
        isError: true
      });
      return false;
    }
  };

  const getTokenInfo = async () => {
    if (!walletAddress) return;

    try {
      const provider = new Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      // Get balance
      const balance = await contract.balanceOf(walletAddress);

      // Get total supply
      const totalSupply = await contract.totalSupply();

      let allowance = ethers.parseEther("0");
      if (spenderAddress && ethers.isAddress(spenderAddress)) {
        allowance = await contract.allowance(walletAddress, spenderAddress);
      }
      setTokenInfo({
        balance: ethers.formatEther(balance),
        totalSupply: ethers.formatEther(totalSupply),
        allowance: ethers.formatEther(allowance)
      });
    } catch (err) {
      console.error("Error fetching token info:", err);
      setStatus({
        message: "Failed to fetch token information: " + err.message,
        isError: true
      });
    }
  };

  const approveAllowance = async () => {
    if (!walletAddress || !spenderAddress || !allowanceAmount) {
      setStatus({ message: "Please fill in all allowance fields", isError: true });
      return;
    }

    if (!ethers.isAddress(spenderAddress)) {
      setStatus({ message: "Invalid spender address", isError: true });
      return;
    }

    if (parseFloat(allowanceAmount) <= 0) {
      setStatus({ message: "Allowance amount must be greater than 0", isError: true });
      return;
    }

    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const newAmount = ethers.parseEther(allowanceAmount.toString());

      const success = await handleTransaction(
        contract.approve(spenderAddress, newAmount),
        "Allowance approved successfully!"
      );

      if (success) {
        setAllowanceAmount("");
      }
    } catch (err) {
      setStatus({
        message: "Approval failed: " + err.message,
        isError: true
      });
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;

    if (typeof window.ethereum === "undefined") {
      setStatus({ message: "Please install MetaMask!", isError: true });
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts[0]) {
        setWalletAddress(accounts[0]);
        setStatus({ message: "Wallet connected successfully!", isError: false });
        // Get token info after connecting
        getTokenInfo();
      }
    } catch (err) {
      setStatus({
        message: err.code === -32002
          ? "Please check MetaMask. A connection request is pending."
          : "Failed to connect wallet: " + err.message,
        isError: true
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const sendTokens = async () => {
    if (!walletAddress || !recipientAddress || !tokenAmount) {
      setStatus({ message: "Please fill in all required fields", isError: true });
      return;
    }

    if (transferType === 'allowance' && !fromAddress) {
      setStatus({ message: "Please specify the token owner's address", isError: true });
      return;
    }

    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const amount = ethers.parseEther(tokenAmount.toString());

      let txPromise;
      if (transferType === 'allowance') {
        const allowance = await contract.allowance(fromAddress, walletAddress);
        if (allowance < amount) {
          setStatus({
            message: `Insufficient allowance. Current allowance: ${ethers.formatEther(allowance)}`,
            isError: true
          });
          return;
        }
        txPromise = contract.transferFrom(fromAddress, recipientAddress, amount);
      } else {
        txPromise = contract.transfer(recipientAddress, amount);
      }

      const success = await handleTransaction(
        txPromise,
        "Transfer completed successfully!"
      );

      if (success) {
        setRecipientAddress("");
        setTokenAmount("");
        if (transferType === 'allowance') {
          setFromAddress("");
        }
      }
    } catch (err) {
      setStatus({
        message: "Transfer failed: " + err.message,
        isError: true
      });
    }
  };

  // Refresh token info when spender address changes
  useEffect(() => {
    getTokenInfo();
  }, [spenderAddress, walletAddress]);

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== "undefined") {
      const provider = new Web3Provider(window.ethereum);
      provider.send("eth_accounts", [])
        .then(accounts => {
          if (accounts[0]) {
            setWalletAddress(accounts[0]);
            getTokenInfo();
          }
        });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || "");
      });
    }
  }, []);

  return (
    <div>
      <div className="backgroundDiv"></div>
      <section className="hero">
        <div className="faucet-hero-body">
          <div className="container">
            <h1 className="title is-1">Token Dashboard</h1>
            <p>Manage your tokens and allowances</p>

            {status.message && (
              <div className={`notification ${status.isError ? 'is-danger' : 'is-success'}`}>
                {status.message}
              </div>
            )}

            <div className="connectedButtonDiv">
              <button
                className="connectedButton"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <span className="is-link has-text-weight-bold">
                  {isConnecting
                    ? "Connecting..."
                    : walletAddress
                      ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
                      : "Connect Wallet"}
                </span>
              </button>
            </div>


            {walletAddress && (
              <div className="mt-4">
                <div className="box">
                  <h2 className="title is-4">Token Information</h2>
                  <div className="content">
                    <p><strong>Your Balance:</strong> {Math.floor(tokenInfo.balance)} tokens</p>
                    <p><strong>Total Supply:</strong> {Math.floor(tokenInfo.totalSupply)} tokens</p>
                    <p><strong>Currently Providing Allowance:</strong> {tokenInfo.allowance} tokens</p>

                  </div>
                </div>


                <div className="box">
                  <h2 className="title is-4">Transfer Tokens</h2>

                  {/* Transfer Type Selection */}
                  <div className="field">
                    <label className="label">Transfer Type</label>
                    <div className="control">
                      <div className="select is-medium">
                        <select
                          value={transferType}
                          onChange={(e) => setTransferType(e.target.value)}
                        >
                          <option value="direct">Direct Transfer</option>
                          <option value="allowance">Use Allowance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* From Address (only shown when using allowance) */}
                  {transferType === 'allowance' && (
                    <div className="field">
                      <label className="label">From Address (Token Owner)</label>
                      <div className="control">
                        <input
                          className="input is-medium"
                          type="text"
                          placeholder="Enter token owner's address (0x...)"
                          value={fromAddress}
                          onChange={(e) => setFromAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recipient Address */}
                  <div className="field">
                    <label className="label">Recipient Address</label>
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="text"
                        placeholder="Enter recipient address (0x...)"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Token Amount */}
                  <div className="field">
                    <label className="label">Token Amount</label>
                    <div className="control">
                      <input
                        className="inputSmall is-medium"
                        type="number"
                        step="0.000000000000000001"
                        placeholder="Enter amount to send"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="field">
                    <div className="control">
                      <button
                        className="button is-link is-medium"
                        onClick={sendTokens}
                        disabled={!recipientAddress || !tokenAmount || (transferType === 'allowance' && !fromAddress)}
                      >
                        Send Tokens
                      </button>
                    </div>
                  </div>
                </div>

                {transactionHash && (
                  <article className="panel is-grey-darker">
                    <p className="panel-heading">Transaction Data</p>
                    <div className="panel-block">
                      <p style={{ display: "flex", justifyContent: "center" }}>
                        Last transaction hash: {transactionHash}
                      </p>
                    </div>
                  </article>
                )}

                <div className="box">
                  <h2 className="title is-4">Manage Allowances</h2>
                  <div className="field">
                    <label className="label">Spender Address</label>
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="text"
                        placeholder="Enter spender address (0x...)"
                        value={spenderAddress}
                        onChange={(e) => setSpenderAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Allowance Amount</label>
                    <div className="control">
                      <input
                        className="inputSmall is-medium"
                        type="number"
                        placeholder="Enter allowance amount"
                        value={allowanceAmount}
                        onChange={(e) => setAllowanceAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <div className="control">
                      <button
                        className="button is-link is-medium"
                        onClick={approveAllowance}
                        disabled={!spenderAddress || !allowanceAmount}
                      >
                        Approve Allowance
                      </button>
                    </div>
                  </div>
                </div>

                {transactionHash && (
                  <article className="panel is-grey-darker">
                    <p className="panel-heading">Transaction Data</p>
                    <div className="panel-block">
                      <p style={{ display: "flex", justifyContent: "center" }}>
                        Last transaction hash: {transactionHash}
                      </p>
                    </div>
                  </article>
                )}

                <div className="box">
                  <h2 className="title is-4">Balance of wallet</h2>
                  <div className="field">
                    <label className="label">Wallet Address</label>
                    <div className="control">
                      <input
                        className="input is-medium"
                        type="text"
                        placeholder="Enter spender address (0x...)"
                        value={checkAddress}
                        onChange={(e) => setCheckAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <div className="control">
                      <button
                        className="button is-link is-medium"
                        onClick={checkBalance}
                      >
                        Check balance
                      </button>
                    </div>
                  </div>
                </div>

                {otherBalance && (
                  <article className="panel is-grey-darker">
                    <div className="panel-block">
                      <p style={{ display: "flex", justifyContent: "center" }}>
                        Wallet has: {otherBalance} NOC!
                      </p>
                    </div>
                  </article>
                )}


              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;