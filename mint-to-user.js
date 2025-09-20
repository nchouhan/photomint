import hre from "hardhat";
const { ethers } = hre;

async function mintToUser() {
  try {
    console.log('🎯 Minting NFT to your MetaMask account...');
    console.log('Target address: 0x984048A0Ba7a690D2382C397d5bcA33B77D500Ec');
    
    // Get signer (deployer account)
    const [deployer] = await ethers.getSigners();
    console.log('Deployer address:', deployer.address);
    
    // Get contract instance
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const PhotoMint = await ethers.getContractAt("PhotoMint", contractAddress);
    
    // Target user address
    const userAddress = "0x984048A0Ba7a690D2382C397d5bcA33B77D500Ec";
    
    // Create simple test data
    const photoData = "Your Beautiful Photo " + Date.now();
    const sha256Hash = ethers.keccak256(ethers.toUtf8Bytes(photoData));
    const cidBytes = ethers.toUtf8Bytes(`QmUserPhoto${Date.now()}`);
    const pHash = BigInt(Date.now() % 1000000); // Simple unique pHash
    const creator = deployer.address;
    const tokenURI = `ipfs://QmUserPhotoMeta${Date.now()}`;
    
    console.log('Creating photo with data:');
    console.log('  Photo data:', photoData);
    console.log('  SHA256:', sha256Hash);
    console.log('  CID bytes length:', cidBytes.length);
    console.log('  pHash:', pHash.toString());
    console.log('  Creator:', creator);
    console.log('  Token URI:', tokenURI);
    
    // Create signature (creator signs the photo proof)
    const digest = ethers.solidityPackedKeccak256(
      ["string", "bytes32", "bytes"],
      ["PHOTO:", sha256Hash, cidBytes]
    );
    console.log('Digest:', digest);
    
    const signature = await deployer.signMessage(ethers.getBytes(digest));
    console.log('Signature created');
    
    // Mint the NFT
    console.log('🚀 Calling mintWithProof...');
    const tx = await PhotoMint.mintWithProof(
      userAddress,    // to
      sha256Hash,     // sha256Hash
      cidBytes,       // cidBytes
      pHash,          // pHash
      signature,      // signature
      creator,        // creator
      tokenURI        // tokenUri
    );
    
    console.log('📝 Transaction hash:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block number:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Try to find the token ID from events
    console.log('🔍 Looking for Minted event...');
    for (const log of receipt.logs) {
      try {
        const parsed = PhotoMint.interface.parseLog(log);
        if (parsed && parsed.name === 'Minted') {
          console.log('🎉 Found Minted event!');
          console.log('Token ID:', parsed.args.tokenId.toString());
          console.log('To:', parsed.args.to);
          console.log('Creator:', parsed.args.creator);
          
          // Verify the NFT exists
          const tokenId = parsed.args.tokenId;
          const photo = await PhotoMint.photos(tokenId);
          const owner = await PhotoMint.ownerOf(tokenId);
          
          console.log('');
          console.log('✅ NFT Verification:');
          console.log('  Token ID:', tokenId.toString());
          console.log('  Owner:', owner);
          console.log('  Creator:', photo.creator);
          console.log('  Token URI:', photo.tokenURI);
          console.log('');
          console.log('🎯 SUCCESS! This NFT should appear in your gallery!');
          return;
        }
      } catch (e) {
        // Not our event
      }
    }
    
    console.log('⚠️ Could not find Minted event, but transaction succeeded');
    
  } catch (error) {
    console.error('❌ Minting failed:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    
    // Try to get revert reason
    if (error.transaction) {
      try {
        const result = await error.transaction.wait();
        console.error('Transaction result:', result);
      } catch (e) {
        console.error('Could not get transaction result');
      }
    }
  }
}

// Run the minting
mintToUser();
