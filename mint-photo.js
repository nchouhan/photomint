#!/usr/bin/env node

// Wrapper script to pass arguments to mint.ts through Hardhat
import { execSync } from 'child_process';
import process from 'process';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node mint-photo.js <image-path> [token-name]');
  process.exit(1);
}

// Set the arguments as environment variables that the script can read
process.env.MINT_IMAGE_PATH = args[0];
process.env.MINT_TOKEN_NAME = args[1] || 'My Photo NFT';

try {
  execSync('npx hardhat run scripts/mint.ts --network local', { 
    stdio: 'inherit',
    env: process.env 
  });
} catch (error) {
  console.error('Minting failed:', error.message);
  process.exit(1);
}
