// Script to fund your MetaMask account with test ETH
const { ethers } = require("hardhat");

async function main() {
  // Replace with your MetaMask address
  const metamaskAddress = "PASTE_YOUR_METAMASK_ADDRESS_HERE";
  
  if (metamaskAddress === "PASTE_YOUR_METAMASK_ADDRESS_HERE") {
    console.log("❌ Please replace the address in the script first!");
    console.log("1. Copy your MetaMask address");
    console.log("2. Edit fund-account.js");
    console.log("3. Replace PASTE_YOUR_METAMASK_ADDRESS_HERE with your address");
    return;
  }

  const [owner] = await ethers.getSigners();
  
  console.log("💰 Funding MetaMask account...");
  console.log("From:", owner.address);
  console.log("To:", metamaskAddress);
  
  // Send 100 ETH to your MetaMask account
  const tx = await owner.sendTransaction({
    to: metamaskAddress,
    value: ethers.parseEther("100")
  });
  
  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();
  
  console.log("✅ Success! Your MetaMask account now has 100 ETH");
  console.log("🎉 You can now test PhotoMint!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
