# 🚀 PhotoMint Setup and Usage Guide

## What This Project Does

**PhotoMint** is a blockchain-based photo authentication and NFT minting platform that:

1. **Authenticates photos** using SHA-256 + perceptual hash (pHash)
2. **Binds provenance** to creators via cryptographic signatures  
3. **Stores original files** on IPFS (content-addressed storage)
4. **Mints NFTs** (ERC-721-style) that record hashes, CID, pHash, and signatures
5. **Verifies ownership** and authenticity of images later

## 🔧 What Was Fixed

The following issues were resolved to make the project work:

1. ✅ **Dependencies installed** - Fixed package.json and installed all required packages
2. ✅ **Deploy script created** - Added missing deployment script 
3. ✅ **TypeScript configuration** - Fixed tsconfig.json for proper compilation
4. ✅ **Import statements** - Fixed .js extensions and crypto dependencies
5. ✅ **Build configuration** - Fixed Hardhat/module compatibility issues
6. ✅ **Private key handling** - Added fallback for development

## ⚙️ Setup Instructions

### 1. Environment Configuration

Update your `.env` file with proper values:

```bash
# Required: Use a real private key (32 bytes/64 hex chars)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Blockchain network (for local development)
RPC_URL=http://127.0.0.1:8545

# Optional: Specify creator address (defaults to deployer)
CREATOR=

# Will be set after deployment
CONTRACT=

# Optional: IPFS configuration (for decentralized storage)
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
```

**⚠️ Security Note:** The current private key is Hardhat's default test account. For production, use your own private key and NEVER commit it to git!

### 2. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npm run node
```

This will start a local Ethereum blockchain at `http://127.0.0.1:8545`

### 3. Deploy Contract

```bash
# Terminal 2: Deploy the PhotoMint contract
npm run deploy
```

Copy the contract address from the output and add it to your `.env` file:
```bash
CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 🖼️ Usage Examples

### Mint a Photo NFT

```bash
# Create a sample image first
mkdir -p samples
echo "Creating test image..." # You'll need to add a real image file

# Mint an NFT from your photo
npm run mint samples/photo.jpg "My Awesome Photo #1"
```

### Verify a Token

```bash
# Verify token ID 1
npm run verify-local 1
```

## 🔧 Available Scripts

- `npm run build` - Compile smart contracts
- `npm run deploy` - Deploy PhotoMint contract to local network
- `npm run mint` - Mint a photo NFT (requires image path)
- `npm run verify-local` - Verify a token's authenticity
- `npm run node` - Start local Hardhat blockchain

## 🌍 Next Steps

1. **Add a real image** to the `samples/` directory for testing
2. **Configure IPFS** for decentralized storage (optional but recommended)
3. **Deploy to testnet** (Sepolia, Polygon Mumbai, etc.) for real testing
4. **Build a frontend** to make the minting process user-friendly

## 🐛 Troubleshooting

- **"Invalid private key"**: Ensure your private key is 64 hex characters long
- **"Contract not found"**: Run `npm run deploy` first and update CONTRACT in .env
- **"IPFS upload failed"**: Check your IPFS credentials or use local storage for testing
- **Build errors**: Ensure all dependencies are installed with `npm install`

## 📖 Technical Details

The project uses:
- **Hardhat** for Ethereum development
- **TypeScript** for type safety
- **Sharp** for image processing
- **Custom pHash** implementation for perceptual hashing
- **IPFS** for decentralized file storage
- **Ethers.js** for blockchain interactions

1. Start Local Blockchain
npm run node 

2. Deploy Contract
npm run deploy 
Copy the contract address to your .env file as CONTRACT=0x...

3. Mint Your First Photo NFT
npm run mint samples/test-photo.jpg "My First Photo NFT"

4. Verify the Token
npm run verify-local 1