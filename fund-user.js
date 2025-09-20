import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log('💰 Funding MetaMask account...');
  
  const [owner] = await ethers.getSigners();
  const userAddress = "0x984048A0Ba7a690D2382C397d5bcA33B77D500Ec";
  
  console.log('From:', owner.address);
  console.log('To:', userAddress);
  
  // Send 100 ETH to the user's MetaMask account
  const tx = await owner.sendTransaction({
    to: userAddress,
    value: ethers.parseEther("100")
  });
  
  console.log('⏳ Transaction sent:', tx.hash);
  await tx.wait();
  
  console.log('✅ Success! Your MetaMask account now has 100 ETH!');
  console.log('🎉 You can now test PhotoMint!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Open MetaMask');
  console.log('2. Switch to "Hardhat Local" network');
  console.log('3. Visit http://localhost:3000');
  console.log('4. Click "Connect Wallet"');
  console.log('5. Start minting photos!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
