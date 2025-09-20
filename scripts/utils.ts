import { create as createIpfs } from "ipfs-http-client";
import { createHash } from "crypto";
import { ethers } from "ethers";
import { base58btc } from "multiformats/bases/base58";
import fs from "fs";
import sharp from "sharp";
import { pHash64 } from "../src/phase.js";

export async function uploadToIpfs(pathOrBuffer: string | Buffer) {
  const project = process.env.IPFS_PROJECT_ID;
  const secret = process.env.IPFS_PROJECT_SECRET;
  const endpoint = process.env.IPFS_ENDPOINT || "https://ipfs.infura.io:5001";
  const auth = project && secret ? "Basic " + Buffer.from(project + ":" + secret).toString("base64") : undefined;

  const ipfs = createIpfs({
    url: endpoint + "/api/v0",
    headers: auth ? { authorization: auth } : {}
  });

  const content = Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : fs.readFileSync(pathOrBuffer);
  const { cid } = await ipfs.add(content, { pin: true });
  return cid.toString();
}

export function sha256Hex(buf: Buffer) {
  const hash = createHash("sha256");
  hash.update(buf);
  return "0x" + hash.digest("hex");
}

// Minimal CID→bytes helper: for CIDv0 base58btc (Qm...)
// For CIDv1, use multiformats CID.parse(cid).bytes
export async function cidToBytes(cidStr: string): Promise<Uint8Array> {
  try {
    // CIDv1 path:
    const { CID } = await import("multiformats/cid");
    return CID.parse(cidStr).bytes;
  } catch {
    // CIDv0 path (base58btc)
    return base58btc.decode(cidStr);
  }
}

// compute 64-bit perceptual hash (hex string) using custom pHash implementation
export async function computePHash64(pathOrBuffer: string | Buffer): Promise<string> {
  const buf = Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : fs.readFileSync(pathOrBuffer);
  const hash64 = await pHash64(buf); // returns bigint
  // Convert to 16-char hex string with 0x prefix
  const hexStr = hash64.toString(16).padStart(16, "0");
  return "0x" + hexStr;
}

// EIP-191 signed digest: keccak256("PHOTO:" || sha256 || cidBytes)
export function buildDigest(sha256Hex: string, cidBytes: Uint8Array): string {
  const prefix = Buffer.from("PHOTO:");
  const s = Buffer.from(sha256Hex.slice(2), "hex");
  const digest = ethers.keccak256(ethers.concat([prefix, s, cidBytes]));
  return digest;
}
