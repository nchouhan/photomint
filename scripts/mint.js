import hre from "hardhat";
const { ethers } = hre;
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import { uploadToIpfs, sha256Hex, cidToBytes, buildDigest, computePHash64 } from "./utils.js";
// helper: convert "0x...." hex → bigint (uint64)
function hexToUint64(hex) {
    const b = BigInt(hex);
    const mask = (1n << 64n) - 1n;
    return b & mask;
}
async function main() {
    const imgPath = process.env.MINT_IMAGE_PATH || process.argv[2]; // From env var or command line
    const tokenName = process.env.MINT_TOKEN_NAME || process.argv[3] || "My Photo #1";
    if (!imgPath)
        throw new Error("usage: node mint-photo.js <imagePath> [name] or set MINT_IMAGE_PATH env var");
    const buf = fs.readFileSync(imgPath);
    // 1) Upload original bytes → CID
    const cid = await uploadToIpfs(buf);
    console.log("IPFS CID:", cid);
    // 2) sha256 + pHash
    const sha = sha256Hex(buf);
    const pHashHex = await computePHash64(buf);
    const pHashU64 = hexToUint64(pHashHex);
    console.log("sha256:", sha, "pHash64:", pHashHex);
    // 3) build digest and sign with creator key (wallet in Hardhat)
    const [signer] = await ethers.getSigners();
    const creator = process.env.CREATOR || signer.address;
    const cidBytes = cidToBytes(cid);
    const digest = buildDigest(sha, cidBytes);
    const sig = await signer.signMessage(ethers.getBytes(digest)); // personal_sign (EIP-191)
    console.log("creator:", creator, "sig:", sig);
    // 4) create token metadata (off-chain JSON) and upload
    const metadata = {
        version: "1.0",
        name: tokenName,
        description: "Minted via PhotoMint demo",
        image: `ipfs://${cid}`,
        content: { cid, sha256: sha, perceptualHash: pHashHex, byteSize: buf.length, mimeType: "image/jpeg" },
        provenance: {
            creator,
            signature: sig,
            signing_scheme: "eip191:personal_sign",
            digest
        }
    };
    const metaBuf = Buffer.from(JSON.stringify(metadata, null, 2));
    const metaCid = await uploadToIpfs(metaBuf);
    const tokenURI = `ipfs://${metaCid}`;
    console.log("tokenURI:", tokenURI);
    // 5) call mintWithProof
    const photoMintAddr = process.env.CONTRACT || (await (await ethers.getContractFactory("PhotoMint")).deploy()).target;
    const photoMint = await ethers.getContractAt("PhotoMint", photoMintAddr);
    const tx = await photoMint.mintWithProof(signer.address, // to
    sha, // bytes32 sha256Hash
    cidBytes, // bytes cidBytes
    pHashU64, // uint64 pHash
    sig, // bytes signature
    creator, // address creator
    tokenURI // string tokenUri
    );
    const receipt = await tx.wait();
    const ev = receipt?.logs?.find((l) => l.fragment?.name === "Minted");
    console.log("Minted tokenId:", ev?.args?.tokenId?.toString() || "(check events)");
}
main().catch((e) => { console.error(e); process.exit(1); });
