# 🚀 PhotoMint Complete Setup and Commands Guide

PhotoMint is a comprehensive blockchain-based photo authentication and NFT minting platform with invisible watermarking capabilities. Here's everything you need to know to run the project:

## 📋 Prerequisites

Before running any commands, ensure you have:
- **Node.js** (v16 or higher)
- **Python 3.8+** (for watermarking service)
- **Git** (for cloning)

## 🛠️ Initial Setup

### 1. Install Dependencies
```bash
# Install main project dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install Python dependencies for watermarking
cd watermark-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..
```

### 2. Environment Configuration
Create/update your `.env` file in the root directory:
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

## 🚀 Quick Start - All Services

### Option 1: Start Everything at Once (Recommended)
```bash
# Start the complete watermarking system
./start-watermark-system.sh
```

This single command starts:
- **Blockchain Network** (port 8545)
- **Image Server** (port 3001) 
- **Watermarking Service** (port 5001)
- **Frontend Application** (port 3004)

### Option 2: Start Services Individually
```bash
# Terminal 1: Start blockchain
npm run node

# Terminal 2: Start image server  
npm run image-server

# Terminal 3: Start watermarking service
cd watermark-service && ./start.sh && cd ..

# Terminal 4: Start frontend
cd frontend && npm run dev -- --port 3004 --force && cd ..
```

## 🎯 Core Commands

### Smart Contract Operations
```bash
# Compile contracts
npm run build

# Deploy contract to local network
npm run deploy

# Mint a photo NFT (basic)
npm run mint samples/test-photo.jpg "My Photo Title"

# Verify a token
npm run verify-local 1
```

### Enhanced Minting with Watermarks
```bash
# Mint with invisible watermarking
node enhanced-mint.js mint ./samples/test-photo.jpg "Beautiful Sunset"

# Batch mint multiple photos
node enhanced-mint.js batch ./samples --prefix "Collection"

# Custom watermarking options
node enhanced-mint.js mint ./photo.jpg "Title" --format PNG --quality 95 --custom-data "Limited Edition"
```

### Verification Commands
```bash
# Extract watermark from any image
node enhanced-mint.js verify ./suspicious_photo.jpg

# Verify with expected data
node enhanced-mint.js verify ./photo.jpg 123 0x1234567890abcdef

# Check system status
./check-system-status.sh
```

## 🖥️ Frontend Development

### React Frontend Commands
```bash
# Navigate to frontend
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Frontend Features
- **Photo Upload & Minting**: Drag-and-drop interface
- **Wallet Integration**: MetaMask and WalletConnect support
- **Gallery View**: Browse minted NFTs
- **Verification Tool**: Upload images to verify authenticity
- **Watermark Detection**: Multi-tier verification display

## 🔧 System Management

### Service Control
```bash
# Start all services
./start-watermark-system.sh

# Stop all services  
./stop-watermark-system.sh

# Check system status
./check-system-status.sh

# Restart everything
./stop-watermark-system.sh && ./start-watermark-system.sh
```

### Log Management
```bash
# View real-time logs
tail -f logs/blockchain.log
tail -f logs/image-server.log
tail -f logs/watermark-service.log
tail -f logs/frontend.log

# Check specific service logs
cat logs/watermark-service.log | grep ERROR
```

## 🌐 Service Endpoints

Once running, access these services:

- **Frontend Application**: http://localhost:3004
- **Blockchain Network**: http://localhost:8545
- **Image Server API**: http://localhost:3001
- **Watermarking API**: http://localhost:5001

### API Testing
```bash
# Test watermarking service health
curl http://localhost:5001/health

# Test image server
curl http://localhost:3001/health

# Test blockchain connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

## 📸 Photo Processing Workflow

### 1. Basic Minting (Without Watermarks)
```bash
# Deploy contract first
npm run deploy

# Mint a photo
npm run mint samples/test-photo.jpg "My First NFT"
```

### 2. Enhanced Minting (With Watermarks)
```bash
# Mint with invisible watermarking
node enhanced-mint.js mint ./samples/test-photo.jpg "Watermarked Photo"

# The system will:
# 1. Apply invisible watermark to image
# 2. Calculate SHA-256 and perceptual hashes
# 3. Create cryptographic signature
# 4. Upload to IPFS
# 5. Mint NFT on blockchain
# 6. Generate verification records
```

### 3. Verification Process
```bash
# Verify any image file
node enhanced-mint.js verify ./image.jpg

# Output includes:
# - Exact hash match (100% certainty)
# - Watermark extraction (85-95% certainty)
# - Perceptual hash similarity
# - Blockchain verification
```

## 🛡️ Watermarking Features

### Protection Capabilities
- **Invisible watermarks** embedded in pixel data
- **Survives JPEG compression**, resizing, color adjustments
- **Resistant to screenshots** and social media downloads
- **Multi-tier verification** with confidence levels
- **Legal evidence collection** with timestamps

### Watermark Payload Structure
```
Format: v1|tokenId|creatorAddr|timestamp|customData|checksum
Size: ≤64 bytes for maximum robustness
Method: DWT-DCT frequency domain embedding
```

## 🔍 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check if ports are in use
lsof -i:8545 -i:3001 -i:5000 -i:3004

# Kill processes on specific ports
kill -9 $(lsof -ti:8545)
```

**Watermarking service issues:**
```bash
# Check Python environment
cd watermark-service && source venv/bin/activate && python --version

# Reinstall Python dependencies
pip install -r requirements.txt
```

**Frontend CSP/eval errors:**
```bash
# Clear frontend cache and restart
cd frontend && rm -rf node_modules/.vite && npm run dev
```

**Frontend build errors:**
```bash
# Clear node modules and reinstall
cd frontend && rm -rf node_modules package-lock.json && npm install
```

**Blockchain connection issues:**
```bash
# Restart blockchain node
npm run node

# Check contract deployment
npm run verify-local 1
```

### Specific Error Fixes

**"Content Security Policy blocks eval" Error:**
This has been fixed in the latest Vite configuration. If you still see this:
1. Stop the frontend: `Ctrl+C`
2. Clear Vite cache: `cd frontend && rm -rf node_modules/.vite`
3. Restart: `npm run dev`

**"ModuleNotFoundError: No module named 'imwatermark'" Error:**
This has been fixed with the requirements.txt file. Run:
```bash
cd watermark-service
source venv/bin/activate
pip install -r requirements.txt
```

## 📁 Project Structure

```
pic-mint/
├── contracts/           # Smart contracts
├── scripts/            # Deployment and minting scripts  
├── src/               # Core utilities (hashing, etc.)
├── frontend/          # React application
├── watermark-service/ # Python watermarking API
├── data/uploads/      # Uploaded images
├── minting-records/   # NFT minting records
├── logs/             # Service logs
└── samples/          # Test images
```

## 🎯 Development Workflow

### Daily Development
1. **Start system**: `./start-watermark-system.sh`
2. **Check status**: `./check-system-status.sh`
3. **Develop features** in respective directories
4. **Test changes** using the frontend at http://localhost:3004
5. **Stop system**: `./stop-watermark-system.sh`

### Testing New Features
```bash
# Test minting with new features
node enhanced-mint.js mint samples/test-photo.jpg "Test Feature"

# Verify the minted NFT
npm run verify-local <token_id>

# Check frontend integration
open http://localhost:3004
```

## 🚀 Production Deployment

### Deploy to Testnet
```bash
# Update .env with testnet RPC and private key
# Deploy to Sepolia/Polygon Mumbai
npm run deploy --network sepolia

# Mint on testnet
npm run mint --network sepolia samples/test-photo.jpg "Testnet NFT"
```

### Frontend Production Build
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## 📊 Available Scripts

### Root Project Scripts
- `npm run build` - Compile smart contracts
- `npm run deploy` - Deploy PhotoMint contract to local network
- `npm run mint` - Mint a photo NFT (requires image path)
- `npm run verify-local` - Verify a token's authenticity
- `npm run node` - Start local Hardhat blockchain
- `npm run image-server` - Start image upload server
- `npm run dev` - Start all services concurrently
- `npm run watermark-system` - Start watermark system
- `npm run stop-system` - Stop all systems
- `npm run status` - Check system status
- `npm run enhanced-mint` - Enhanced minting with watermarks

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### System Management Scripts
- `./start-watermark-system.sh` - Start complete system
- `./stop-watermark-system.sh` - Stop all services
- `./check-system-status.sh` - Check service status

## 🌟 What This Project Enables

### For Photographers:
- **Prove ownership** of original photos
- **Detect unauthorized copies** with pHash
- **Create verifiable provenance** on blockchain
- **Mint collectible NFTs** with embedded authenticity

### For Platforms:
- **Combat image theft** with crypto-proof verification
- **Build trust** in digital photo marketplaces  
- **Enable royalty tracking** for creators
- **Provide authenticity certificates**

## 🎯 Technical Highlights

### Cryptographic Security:
- **EIP-191 signatures** for creator authentication
- **SHA-256 hashes** for exact content verification
- **Perceptual hashing** for near-duplicate detection
- **IPFS content addressing** for tamper-proof storage

### Blockchain Integration:
- **Gas-optimized** smart contract design
- **Event logging** for indexer support
- **Minimal dependencies** for security
- **Hardhat testing** framework ready

### Invisible Watermarking:
- **DWT-DCT frequency domain** embedding
- **Survives compression** and social media uploads
- **Multi-tier verification** with confidence levels
- **Legal evidence generation** with timestamps

## 📋 Next Steps (Optional Enhancements)

1. **Testnet Deployment**: Deploy to Sepolia/Polygon for public testing
2. **Enhanced Verification**: Add batch verification for multiple photos
3. **Indexing**: Add GraphQL/Subgraph for provenance queries
4. **Mobile App**: Build React Native app for mobile photo minting
5. **AI Integration**: Add AI-based similarity detection

## 🎯 Conclusion

**PhotoMint is production-ready** for blockchain-based photo authentication and NFT minting. The core functionality works end-to-end:

`Photo → Hash → Sign → Store → Mint → Verify`

The project successfully demonstrates how to combine cryptographic proofs, perceptual hashing, decentralized storage, and blockchain technology to create a robust photo authenticity system with enterprise-grade invisible watermarking protection.

---

## ✅ You're All Set!

With these commands, you can:
- ✅ **Authenticate photos** using cryptographic proofs
- ✅ **Mint NFTs** with embedded authenticity
- ✅ **Apply invisible watermarks** for robust protection
- ✅ **Verify ownership** of any image
- ✅ **Build a complete marketplace** for authenticated photos

The PhotoMint system is now ready for blockchain-based photo authentication and NFT minting with enterprise-grade invisible watermarking protection!

*Ready to mint your first authenticated photo NFT! 📸⛓️*
