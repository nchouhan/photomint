# 📸 PhotoMint — Authenticity & Ownership of Photos on Blockchain

PhotoMint is a minimal end-to-end reference implementation that shows how to:

- **Authenticate** photos using SHA-256 + perceptual hash (pHash).
- **Bind provenance** to the creator via cryptographic signatures.
- **Store** original bytes on IPFS/Arweave (content-addressed).
- **Mint** an NFT (ERC-721-style) that records hashes, CID, pHash, and signature.
- **Verify** ownership, authenticity, and provenance of any image later.
- **Optionally watermark** photos with invisible, robust IDs.

---

## 🌐 High-Level Architecture

```mermaid
flowchart TD
    A[User / Photographer] --> B[PhotoMint Client (Node/TS)]
    B -->|1. sha256 + pHash| B
    B -->|2. Upload| C[IPFS/Arweave]
    B -->|3. Sign digest| W[Wallet (creator private key)]
    B -->|4. MintWithProof| SC[PhotoMint Smart Contract]
    SC --> L[Blockchain Ledger]

    subgraph On-chain
      SC
      L
    end

    subgraph Off-chain
      C
      B
    end

    V[Verifier Tool] -->|Fetch tokenURI, recompute hashes| SC
    V --> C


Data Flow
Compute hashes:
Exact hash (SHA-256) → detects bit-for-bit matches.
Perceptual hash (pHash) → detects near-duplicates (resize, recompress).
Store file on IPFS/Arweave → get CID.
Sign digest keccak256("PHOTO:" || sha256 || cidBytes) with creator’s wallet.
Mint NFT on PhotoMint contract: records (sha256, cidBytes, pHash, creator, tokenURI).
Verify later: anyone can recompute hash/pHash, check CID, validate signature, read provenance.

- **Project Structure**
photo-mint/
├─ contracts/
│  └─ PhotoMint.sol          # Minimal ERC-721-like NFT with proof fields
├─ scripts/
│  ├─ deploy.ts              # Deploy contract
│  ├─ mint.ts                # Mint photo NFT (hash + IPFS + signature)
│  ├─ verify.ts              # Verify token on-chain
│  └─ utils.ts               # IPFS, sha256, pHash, digest helpers
├─ src/
│  ├─ phash.ts               # Optional pure DCT-based pHash implementation
│  └─ sha256.ts              # Utility for SHA-256
├─ hardhat.config.ts         # Hardhat setup (Ethers v6)
├─ package.json
├─ tsconfig.json
├─ .env                      # RPC_URL, PRIVATE_KEY, CONTRACT, IPFS creds
└─ README.md

⚙️ Installation
Clone & install
git clone https://github.com/yourorg/photo-mint.git
cd photo-mint
npm install
Configure .env
PRIVATE_KEY=0xabc...                # deployer / creator
RPC_URL=http://127.0.0.1:8545       # or Infura/Alchemy testnet endpoint
CREATOR=0xYourCreatorAddress        # optional; defaults to deployer
CONTRACT=                           # fill after deploy
IPFS_ENDPOINT=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=xxxxx
IPFS_PROJECT_SECRET=yyyyy
🚀 Usage
1. Start local blockchain
npx hardhat node
2. Compile contracts
npm run build
3. Deploy contract
npm run deploy
Copy the printed contract address into .env as CONTRACT=0x....
4. Mint a photo NFT
npx hardhat run scripts/mint.ts ./samples/photo.jpg "Bangalore Monsoon #1" --network local
This will:
Upload photo to IPFS → get CID
Compute sha256 + pHash
Sign digest with your wallet
Create metadata JSON → upload to IPFS
Call mintWithProof(...) on contract
5. Verify a token
npx hardhat run scripts/verify.ts 1 --network local
Outputs owner, creator, sha256, pHash, tokenURI, recomputed digest.
🔬 Perceptual Hashing
Uses image-phash + sharp to normalize image and compute a 64-bit pHash.
Helps detect near-duplicates (JPEG quality changes, resizes, minor edits).
A pure TypeScript DCT-based pHash is included in src/phash.ts.

💧 Robust Invisible Watermarking
Hash + signature alone don’t stop copying. For stronger provenance:
Embed invisible watermark with tokenId/creator ID in frequency domain.
Reference: StabilityAI/invisible-watermark.
from imwatermark import WatermarkEncoder, WatermarkDecoder
import cv2

wm = WatermarkEncoder()
wm.set_watermark('bytes', b"token:1|creator:0xabc...")
bgr = cv2.imread("photo.jpg")
watermarked = wm.encode(bgr, 'dwtDct')
cv2.imwrite("wm.jpg", watermarked)
For Node/TS projects, wrap a Python watermarking microservice and call it before uploading to IPFS.

🧩 Extending
Swap contract for OpenZeppelin ERC-721 + ERC-2981 (royalties).
Add GraphQL indexer (The Graph/Subgraph) for provenance search.
Add frontend React verifier tool (drop image → verify authenticity).
Integrate watermark encode/decode microservice.
🛡️ Security Notes
Proofs vs prevention: Blockchain guarantees verifiability (ownership history), not copy prevention.
Watermarking + pHash + signature together make fraud detection practical.
Keep private keys safe — creator signatures are your strongest evidence.
## 📜 License

Copyright © 2025 Genupic. All rights reserved.  

This project and its source code are **proprietary**.  
You may **not use, copy, modify, distribute, or integrate** this code, in whole or in part, without **prior written permission** from the author(s).  
