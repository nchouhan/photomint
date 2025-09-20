import hre from "hardhat";
const { ethers } = hre;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Deploying PhotoMint contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const PhotoMint = await ethers.getContractFactory("PhotoMint");
  const photoMint = await PhotoMint.deploy();
  
  await photoMint.waitForDeployment();
  const address = await photoMint.getAddress();
  
  console.log("PhotoMint deployed to:", address);
  console.log("Contract name:", await photoMint.name());
  console.log("Contract symbol:", await photoMint.symbol());
  
  console.log("\n🔧 Next steps:");
  console.log(`1. Add this to your .env file: CONTRACT=${address}`);
  console.log("2. Run: npm run mint <image-path> [name] to mint your first photo NFT");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
