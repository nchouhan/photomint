require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config();

// Helper to validate private key
const getValidPrivateKey = () => {
  const envKey = process.env.PRIVATE_KEY;
  const defaultKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  
  // Return default if no env key or if env key is just placeholder
  if (!envKey || envKey.length < 64 || envKey.includes("...")) {
    return defaultKey;
  }
  return envKey;
};

const config = {
  solidity: "0.8.24",
  networks: {
    local: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
      accounts: [getValidPrivateKey()]
    }
    // add testnets as needed (sepolia, amoy, etc.)
  }
};

module.exports = config;
