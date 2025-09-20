import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();
import { cidToBytes, buildDigest } from "./utils.js";
async function main() {
    const tokenId = BigInt(process.argv[2] || "1");
    const addr = process.env.CONTRACT;
    if (!addr)
        throw new Error("CONTRACT addr missing");
    const pm = await ethers.getContractAt("PhotoMint", addr);
    const photo = await pm.photos(tokenId);
    const owner = await pm.ownerOf(tokenId);
    console.log("owner:", owner);
    console.log("creator:", photo.creator);
    console.log("sha256Hash:", photo.sha256Hash);
    console.log("pHash (u64):", photo.pHash.toString());
    console.log("tokenURI:", photo.tokenURI);
    // Recompute digest from on-chain sha256 and cidBytes, verify creator (pure function)
    // Note: in this minimal contract we didn't store `signature` on-chain.
    // You can verify signature off-chain if you have it in metadata.
    const cid = (await (await fetch(photo.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"))).json()).content.cid;
    const cidBytes = cidToBytes(cid);
    const digest = buildDigest(photo.sha256Hash, cidBytes);
    // Optional: compare to metadata.provenance.digest for sanity
    console.log("recomputed digest:", digest);
}
main().catch((e) => { console.error(e); process.exit(1); });
