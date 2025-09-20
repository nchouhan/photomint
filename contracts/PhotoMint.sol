// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Minimal Photo NFT registry.
 * - Mints tokens with on-chain proofs: sha256, CID, pHash, signature.
 * - Verifies that `signature` recovers `creator` over digest("PHOTO:", sha256, cidBytes).
 * - Stores provenance; emits events for indexers.
 *
 * NOTE: For production, inherit OpenZeppelin ERC721 & Ownable, add royalty support (ERC2981),
 * and tighter input validation. This is a compact, dependency-free example.
 */
contract PhotoMint {
    // --- Storage ---
    string public name = "PhotoMint";
    string public symbol = "PMNT";

    uint256 private _nextId = 1;

    struct Photo {
        bytes32 sha256Hash; // exact bytes hash (SHA-256)
        bytes   cidBytes;   // raw multihash bytes for CID (or UTF-8 if preferred)
        uint64  pHash;      // 64-bit perceptual hash
        address creator;    // original signer
        string  tokenURI;   // off-chain JSON with richer metadata
    }

    mapping(uint256 => Photo) public photos;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;

    // --- Events ---
    event Minted(
        uint256 indexed tokenId,
        address indexed to,
        address indexed creator,
        bytes32 sha256Hash,
        bytes cidBytes,
        uint64 pHash
    );

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    // --- View helpers ---
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return photos[tokenId].tokenURI;
    }

    // Returns the signer recovered from `signature` and verifies it equals `creator`.
    function verifyCreatorSignature(
        bytes32 sha256Hash,
        bytes calldata cidBytes,
        bytes calldata signature,
        address creator
    ) public pure returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked("PHOTO:", sha256Hash, cidBytes));
        address recovered = _recoverEIP191(digest, signature);
        return recovered == creator;
    }

    // --- Mint with proof ---
    function mintWithProof(
        address to,
        bytes32 sha256Hash,
        bytes calldata cidBytes,
        uint64 pHash,
        bytes calldata signature,   // signature over digest("PHOTO:", sha256Hash, cidBytes)
        address creator,
        string calldata tokenUri
    ) external returns (uint256 tokenId) {
        require(to != address(0), "bad to");
        require(creator != address(0), "bad creator");
        require(verifyCreatorSignature(sha256Hash, cidBytes, signature, creator), "bad signature");

        tokenId = _nextId++;
        photos[tokenId] = Photo({
            sha256Hash: sha256Hash,
            cidBytes: cidBytes,
            pHash: pHash,
            creator: creator,
            tokenURI: tokenUri
        });

        // minimal ERC721-like mint
        ownerOf[tokenId] = to;
        balanceOf[to] += 1;

        emit Transfer(address(0), to, tokenId);
        emit Minted(tokenId, to, creator, sha256Hash, cidBytes, pHash);
    }

    // --- Transfers (very minimal; add safety in production) ---
    function approve(address to, uint256 tokenId) external {
        require(msg.sender == ownerOf[tokenId], "not owner");
        getApproved[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(from == ownerOf[tokenId], "bad from");
        require(msg.sender == from || msg.sender == getApproved[tokenId], "not allowed");
        require(to != address(0), "bad to");

        // clear approval
        if (getApproved[tokenId] != address(0)) getApproved[tokenId] = address(0);

        balanceOf[from] -= 1;
        balanceOf[to] += 1;
        ownerOf[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    // --- Internal: EIP-191 ("Ethereum Signed Message") recover ---
    function _recoverEIP191(bytes32 digest, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "sig len");
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        // personal_sign prefix
        bytes32 ethSigned = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", digest));
        return ecrecover(ethSigned, v, r, s);
    }
}
