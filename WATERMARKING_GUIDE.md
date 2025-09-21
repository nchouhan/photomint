# PhotoMint Robust Invisible Watermarking Guide

## 🛡️ Overview

PhotoMint now includes a comprehensive invisible watermarking system that provides robust ownership protection for your NFT images. This system embeds invisible ownership information directly into image pixels, making it nearly impossible to remove and providing strong legal evidence of ownership.

## 🎯 Key Features

### **Invisible Protection**
- Watermarks are completely invisible to the human eye
- Survive JPEG compression, resizing, and color adjustments
- Resistant to screenshot, social media uploads, and light editing
- Embedded using robust DWT-DCT frequency domain techniques

### **Multi-Tier Verification**
1. **Level 1: Exact Hash Match** (100% certainty)
2. **Level 2: Watermark Extraction** (85-95% certainty)  
3. **Level 3: Perceptual Hash** (moderate certainty)

### **Comprehensive Payload**
- Token ID and creator address
- Timestamp and version information
- CRC32 checksum for integrity validation
- Custom data support (up to 64 bytes total)

## 🚀 Quick Start

### 1. Start the Complete System
```bash
./start-watermark-system.sh
```

This starts:
- Blockchain network (port 8545)
- Image server (port 3001)
- Watermarking service (port 5001)
- Frontend application (port 3004)

### 2. Enhanced Minting with Watermarks
```bash
# Mint a single protected photo
node enhanced-mint.js mint ./photos/sunset.jpg "Beautiful Sunset"

# Batch mint with watermarks
node enhanced-mint.js batch ./photos --prefix "Collection"

# Custom watermarking options
node enhanced-mint.js mint ./photo.jpg "Title" --format PNG --quality 95 --custom-data "Limited Edition"
```

### 3. Verify Watermarked Images
```bash
# Extract watermark from any image
node enhanced-mint.js verify ./suspicious_photo.jpg

# Verify with expected data
node enhanced-mint.js verify ./photo.jpg 123 0x1234567890abcdef
```

### 4. Check System Status
```bash
./check-system-status.sh
```

## 🔧 Technical Implementation

### Watermarking Service (Python)
- **Location**: `watermark-service/`
- **Technology**: Stability AI's invisible-watermark library
- **Method**: DWT-DCT (Discrete Wavelet Transform + Discrete Cosine Transform)
- **API**: REST endpoints for embed, extract, verify

### Node.js Integration
- **File**: `watermark-client.js`
- **Purpose**: Bridge between Node.js backend and Python service
- **Features**: Health checks, batch processing, file management

### Frontend Integration
- **File**: `frontend/src/services/WatermarkService.ts`
- **Purpose**: Watermarking capabilities in React frontend
- **Features**: File upload, verification UI, multi-tier display

### Enhanced Minting
- **File**: `enhanced-mint.js`
- **Process**: 
  1. Apply invisible watermark to image
  2. Calculate cryptographic hashes
  3. Create blockchain signature
  4. Mint NFT with watermarked image
  5. Archive original (optional)
  6. Generate comprehensive records

## 🛡️ Protection Strategy

### **When Images Are Misused**

**Scenario 1: Someone steals your image from social media**
```bash
# Extract watermark to prove ownership
node enhanced-mint.js verify ./stolen_image.jpg
```
- Even if downloaded from Instagram/Twitter, the watermark remains
- Provides token ID and creator address as legal evidence

**Scenario 2: Someone crops or edits your image**
```bash
# Multi-tier verification handles modifications
node enhanced-mint.js verify ./modified_image.jpg 123 your_address
```
- DWT-DCT watermarks survive most edits
- Perceptual hash catches heavy modifications
- Confidence levels indicate likelihood of authenticity

**Scenario 3: Metadata is stripped**
- Traditional metadata (EXIF) is easily removed
- Invisible watermarks are embedded in pixel data
- Cannot be removed without significant image degradation

### **Legal Evidence Collection**

1. **Original Minting Record**: `minting-records/mint-123-timestamp.json`
2. **Watermark Extraction**: Proves ownership embedded in pixels
3. **Blockchain Verification**: Immutable timestamp and ownership record
4. **Archive Copy**: Original unwatermarked version for comparison

## 📊 Verification Confidence Levels

| Confidence | Meaning | Recommended Action |
|------------|---------|-------------------|
| 90-100% | Extremely likely authentic | Strong legal evidence |
| 75-89% | Likely authentic with modifications | Good evidence, investigate changes |
| 50-74% | Possibly authentic | Additional verification needed |
| 0-49% | Unlikely authentic or heavily modified | Weak evidence |

## 🔧 Advanced Configuration

### Watermark Payload Customization
```bash
# Custom payload format: version|tokenId|creator|timestamp|custom|checksum
export WATERMARK_CUSTOM_DATA="Limited Edition"
node enhanced-mint.js mint photo.jpg "Title" --custom-data "$WATERMARK_CUSTOM_DATA"
```

### Quality vs Robustness Trade-offs
```bash
# Higher quality, less robust to compression
node enhanced-mint.js mint photo.jpg "Title" --format PNG --quality 100

# More robust to compression, slightly lower quality
node enhanced-mint.js mint photo.jpg "Title" --format JPEG --quality 85
```

### Archive Management
```bash
# Enable original archiving
export ARCHIVE_ORIGINALS=true
node enhanced-mint.js mint photo.jpg "Title"
```

## 🚨 Security Considerations

### **What Watermarks Protect Against**
✅ Social media downloads  
✅ Screenshot captures  
✅ JPEG compression  
✅ Image resizing  
✅ Color/brightness adjustments  
✅ Metadata stripping  
✅ Format conversion  

### **What Watermarks Cannot Protect Against**
❌ Heavy image editing (complete redrawing)  
❌ Extreme cropping (removing watermarked regions)  
❌ Advanced AI-based restoration attacks  
❌ Complete image recreation  

### **Best Practices**
1. **Always archive originals** in secure storage
2. **Use high-quality source images** for better watermark embedding
3. **Regularly verify** your watermarked images
4. **Document the minting process** for legal purposes
5. **Combine with other protection methods** (visible watermarks, copyright notices)

## 🛠️ Troubleshooting

### Watermarking Service Issues
```bash
# Check service health
curl http://localhost:5001/health

# Restart watermarking service
cd watermark-service && ./start.sh
```

### Verification Failures
```bash
# Check image format support
file suspicious_image.jpg

# Try different payload sizes
node enhanced-mint.js verify image.jpg --payload-size 32
```

### System Management
```bash
# Stop all services
./stop-watermark-system.sh

# Full restart
./stop-watermark-system.sh && ./start-watermark-system.sh

# Check all services
./check-system-status.sh
```

## 📝 API Reference

### Watermarking Service Endpoints

**Health Check**
```bash
GET http://localhost:5001/health
```

**Embed Watermark**
```bash
POST http://localhost:5001/embed
Content-Type: multipart/form-data

file: image file
token_id: NFT token ID
creator_address: wallet address
custom_data: optional custom data
output_format: JPEG|PNG
quality: 1-100
```

**Extract Watermark**
```bash
POST http://localhost:5001/extract
Content-Type: multipart/form-data

file: image file
expected_payload_size: 64 (bytes)
```

**Comprehensive Verification**
```bash
POST http://localhost:5001/verify
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "expected_sha256": "optional_hash",
  "expected_token_id": "optional_id",
  "expected_creator": "optional_address"
}
```

## 🎯 Use Cases

### **Content Creator Protection**
- Embed ownership in every image before sharing
- Track unauthorized usage across the internet
- Provide legal evidence for DMCA takedowns

### **NFT Marketplace Integration**
- Verify authenticity of listed images
- Detect unauthorized re-listings
- Protect collector investments

### **Brand Protection**
- Embed brand information in product images
- Track unauthorized commercial usage
- Protect marketing materials

### **Legal Evidence**
- Timestamped ownership records
- Tamper-evident digital signatures
- Blockchain-verified provenance

## 📚 Technical Deep Dive

### DWT-DCT Watermarking Process
1. **Decompose image** using Discrete Wavelet Transform
2. **Select mid-frequency coefficients** (robust to compression)
3. **Embed payload bits** using Discrete Cosine Transform
4. **Reconstruct image** with invisible modifications
5. **Validate extraction** using checksum verification

### Payload Structure
```
Format: v1|tokenId|creatorAddr|timestamp|customData|checksum
Example: v1|123|0x1234|1640995200|Edition|a1b2c3d4
Size: ≤64 bytes for maximum robustness
```

### Verification Algorithm
```python
def verify_image(image, expectations):
    # Level 1: Exact hash comparison
    if sha256_match(image, expectations.sha256):
        return VerificationResult(confidence=100, method="exact")
    
    # Level 2: Watermark extraction
    try:
        watermark = extract_watermark(image)
        if validate_payload(watermark, expectations):
            return VerificationResult(confidence=90, method="watermark")
    except ExtractionError:
        pass
    
    # Level 3: Perceptual hash comparison
    if phash_similarity(image, expectations.phash) > 0.8:
        return VerificationResult(confidence=60, method="perceptual")
    
    return VerificationResult(confidence=0, method="none")
```

---

## 🎉 Success! Your PhotoMint system now provides enterprise-grade invisible watermarking protection!

For support or advanced features, refer to the detailed code documentation in each service directory.

