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
  "function approve(address spender, uint256 amount) public returns (bool)"
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

  const getTokenInfo = async () => {
    if (!walletAddress) return;

    try {
      const provider = new Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      // Get balance
      const balance = await contract.balanceOf(walletAddress);

      // Get total supply
      const totalSupply = await contract.totalSupply();

      // Get allowance if spender address is set
      let allowance = "0";
      if (spenderAddress) {
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

  const approveAllowance = async () => {
    if (!walletAddress || !spenderAddress || !allowanceAmount) {
      setStatus({ message: "Please fill in all allowance fields", isError: true });
      return;
    }

    try {
      setStatus({ message: "Approving allowance...", isError: false });
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const amount = ethers.parseEther(allowanceAmount.toString());
      const tx = await contract.approve(spenderAddress, amount);

      setStatus({ message: "Approval transaction sent! Waiting for confirmation...", isError: false });
      await tx.wait();

      setStatus({ message: "Allowance approved successfully!", isError: false });
      getTokenInfo(); // Refresh token info
      setAllowanceAmount("");
    } catch (err) {
      setStatus({
        message: "Approval failed: " + err.message,
        isError: true
      });
    }
  };

  const sendTokens = async () => {
    if (!walletAddress || !recipientAddress || !tokenAmount) {
      setStatus({ message: "Please fill in all transfer fields", isError: true });
      return;
    }

    try {
      setStatus({ message: "Initiating transfer...", isError: false });
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      const amount = ethers.parseEther(tokenAmount.toString());
      const tx = await contract.transfer(recipientAddress, amount);
      setTransactionHash(tx.hash);
      setStatus({ message: "Transaction sent! Waiting for confirmation...", isError: false });

      await tx.wait();

      // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here we can show a notification


      setStatus({ message: "Transfer completed successfully!", isError: false });
      getTokenInfo(); // Refresh token info after transfer
      setRecipientAddress("");
      setTokenAmount("");
    } catch (err) {
      setStatus({
        message: "Transaction failed: Transaction rejected or failed",
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
                    {spenderAddress && (
                      <p><strong>Current Allowance:</strong> {tokenInfo.allowance} tokens</p>
                    )}
                  </div>
                </div>


                <div className="box">
                  <h2 className="title is-4">Transfer Tokens</h2>
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

                  <div className="field">
                    <div className="control">
                      <button
                        className="button is-link is-medium"
                        onClick={sendTokens}
                        disabled={!recipientAddress || !tokenAmount}
                      >
                        Send Tokens
                      </button>
                    </div>
                  </div>
                </div>

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
                        Transaction hash: {transactionHash}
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