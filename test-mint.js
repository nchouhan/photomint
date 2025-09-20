import hre from "hardhat";
const { ethers } = hre;
import fs from "fs";

async function testMint() {
  try {
    console.log('🎯 Testing NFT Minting...');
    
    // Get contract
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const [signer] = await ethers.getSigners();
    
    console.log('Signer address:', signer.address);
    
    // Simple contract ABI for minting
    const abi = [
      "function mintWithProof(address to, bytes32 sha256Hash, bytes cidBytes, uint64 pHash, bytes signature, address creator, string tokenUri) returns (uint256)",
      "function photos(uint256 tokenId) view returns (bytes32 sha256Hash, bytes cidBytes, uint64 pHash, address creator, string tokenURI)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    // Create dummy data for testing
    const sha256Hash = ethers.keccak256(ethers.toUtf8Bytes("test photo"));
    const cidBytes = ethers.toUtf8Bytes("QmTestCid12345"); // dummy CID
    const pHash = 12345n; // dummy pHash
    const creator = signer.address;
    const tokenURI = "ipfs://QmTestMetadata12345";
    
    // Create signature matching contract expectation
    // Contract expects: keccak256(abi.encodePacked("PHOTO:", sha256Hash, cidBytes))
    const digest = ethers.solidityPackedKeccak256(
      ["string", "bytes32", "bytes"],
      ["PHOTO:", sha256Hash, cidBytes]
    );
    const signature = await signer.signMessage(ethers.getBytes(digest));
    
    console.log('Minting with data:');
    console.log('  to:', signer.address);
    console.log('  sha256Hash:', sha256Hash);
    console.log('  cidBytes:', ethers.hexlify(cidBytes));
    console.log('  pHash:', pHash.toString());
    console.log('  creator:', creator);
    console.log('  tokenURI:', tokenURI);
    
    // Mint the NFT
    const tx = await contract.mintWithProof(
      signer.address,
      sha256Hash,
      cidBytes,
      pHash,
      signature,
      creator,
      tokenURI
    );
    
    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    
    // Find the Minted event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'Minted';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      const tokenId = parsed.args.tokenId;
      console.log('🎉 Minted Token ID:', tokenId.toString());
      
      // Verify the NFT exists
      const photo = await contract.photos(tokenId);
      const owner = await contract.ownerOf(tokenId);
      
      console.log('✅ NFT Verification:');
      console.log('  Token ID:', tokenId.toString());
      console.log('  Creator:', photo.creator);
      console.log('  Owner:', owner);
      console.log('  TokenURI:', photo.tokenURI);
      
      // Check balance
      const balance = await contract.balanceOf(signer.address);
      console.log('  Owner Balance:', balance.toString());
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMint();
