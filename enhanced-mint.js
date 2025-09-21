#!/usr/bin/env node
/**
 * Enhanced PhotoMint with Invisible Watermarking
 * Integrates robust watermarking into the minting workflow
 */

import hre from "hardhat"
import WatermarkClient from './watermark-client.js'
import { computePHash64, sha256Hex, buildDigest, cidToBytes } from './scripts/utils.js'
import fs from 'fs/promises'
import path from 'path'

const { ethers } = hre

// Configuration
const WATERMARK_SERVICE_URL = process.env.WATERMARK_SERVICE_URL || 'http://localhost:5001'
const CONTRACT_ADDRESS = process.env.CONTRACT || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ARCHIVE_ORIGINALS = process.env.ARCHIVE_ORIGINALS === 'true'

class EnhancedPhotoMint {
    constructor() {
        this.watermarkClient = new WatermarkClient(WATERMARK_SERVICE_URL)
        this.provider = null
        this.signer = null
        this.contract = null
    }

    async initialize() {
        console.log('🚀 Initializing Enhanced PhotoMint...')
        
        // Setup blockchain connection
        this.provider = hre.ethers.provider
        this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider)
        
        // Load contract
        const PhotoMint = await hre.ethers.getContractFactory("PhotoMint")
        this.contract = PhotoMint.attach(CONTRACT_ADDRESS).connect(this.signer)
        
        console.log('📄 Contract address:', CONTRACT_ADDRESS)
        console.log('👤 Signer address:', await this.signer.getAddress())
        
        // Check watermarking service
        try {
            const health = await this.watermarkClient.healthCheck()
            console.log('🛡️ Watermarking service:', health.status)
        } catch (error) {
            console.warn('⚠️ Watermarking service unavailable:', error.message)
            console.warn('📝 Note: Minting will proceed without watermarking')
        }
    }

    async mintWithWatermark(imagePath, tokenName, options = {}) {
        console.log('\n🎨 Starting Enhanced Minting Process...')
        console.log('📸 Image:', imagePath)
        console.log('🏷️ Token Name:', tokenName)
        
        try {
            // Step 1: Pre-mint validation
            const imageStats = await fs.stat(imagePath)
            console.log(`📊 Image size: ${(imageStats.size / 1024).toFixed(1)} KB`)
            
            const originalImage = await fs.readFile(imagePath)
            const originalSha256 = sha256Hex(originalImage)
            console.log('🔒 Original SHA-256:', originalSha256)

            // Step 2: Get next token ID
            const nextTokenId = await this.getNextTokenId()
            console.log('🆔 Token ID:', nextTokenId)

            // Step 3: Apply invisible watermark
            let processedImage = originalImage
            let watermarkData = null
            let processedSha256 = originalSha256

            try {
                console.log('\n🛡️ Applying invisible watermark...')
                
                const watermarkResult = await this.watermarkClient.embedWatermark(
                    originalImage,
                    nextTokenId.toString(),
                    await this.signer.getAddress(),
                    options.customData || tokenName,
                    options.format || 'JPEG',
                    options.quality || 95
                )

                processedImage = watermarkResult.watermarked_buffer
                processedSha256 = watermarkResult.watermarked_sha256
                watermarkData = {
                    payload: watermarkResult.payload,
                    method: watermarkResult.method,
                    originalSha256: watermarkResult.original_sha256,
                    watermarkedSha256: watermarkResult.watermarked_sha256
                }

                console.log('✅ Watermark embedded successfully')
                console.log('📦 Payload:', watermarkResult.payload)
                console.log('🔒 Watermarked SHA-256:', processedSha256)

                // Save watermarked image
                const watermarkedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_watermarked.$1')
                await fs.writeFile(watermarkedPath, processedImage)
                console.log('💾 Watermarked image saved:', watermarkedPath)

                // Archive original if requested
                if (ARCHIVE_ORIGINALS) {
                    const archivePath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_original.$1')
                    await fs.copyFile(imagePath, archivePath)
                    console.log('📁 Original archived:', archivePath)
                }

            } catch (watermarkError) {
                console.warn('⚠️ Watermarking failed:', watermarkError.message)
                console.warn('📝 Proceeding with original image...')
            }

            // Step 4: Calculate hashes and prepare blockchain data
            console.log('\n📊 Calculating cryptographic hashes...')
            
            const pHash = await computePHash64(processedImage)
            console.log('🖼️ Perceptual hash:', pHash)

            // Create mock CID (in production, upload to IPFS first)
            const cid = `QmWatermark${nextTokenId}${Date.now()}`
            const cidBytes = await cidToBytes(cid)
            console.log('🌐 Content ID:', cid)

            // Step 5: Create signature
            console.log('\n✍️ Creating cryptographic signature...')
            
            const digest = buildDigest(processedSha256, cidBytes)
            const signature = await this.signer.signMessage(ethers.getBytes(digest))
            console.log('🔐 Signature created')

            // Step 6: Mint NFT on blockchain
            console.log('\n⛓️ Minting NFT on blockchain...')
            
            const tokenURI = `https://ipfs.io/ipfs/${cid}`
            const creatorAddress = await this.signer.getAddress()

            const tx = await this.contract.mintWithProof(
                creatorAddress,      // to
                processedSha256,     // sha256Hash (of watermarked image)
                cidBytes,           // cidBytes
                pHash,              // pHash
                signature,          // signature
                creatorAddress,     // creator
                tokenURI,           // tokenURI
                {
                    gasLimit: 500000
                }
            )

            console.log('📡 Transaction submitted:', tx.hash)
            const receipt = await tx.wait()
            console.log('✅ Transaction confirmed in block:', receipt.blockNumber)

            // Step 7: Create comprehensive minting record
            const mintingRecord = {
                tokenId: nextTokenId.toString(),
                tokenName: tokenName,
                imagePath: imagePath,
                watermarkedPath: watermarkData ? imagePath.replace(/\.(jpg|jpeg|png)$/i, '_watermarked.$1') : null,
                archivePath: ARCHIVE_ORIGINALS ? imagePath.replace(/\.(jpg|jpeg|png)$/i, '_original.$1') : null,
                
                // Blockchain data
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                contractAddress: CONTRACT_ADDRESS,
                creator: creatorAddress,
                tokenURI: tokenURI,
                
                // Cryptographic data
                originalSha256: originalSha256,
                processedSha256: processedSha256,
                pHash: pHash.toString(),
                cid: cid,
                signature: signature,
                
                // Watermark data
                watermarkData: watermarkData,
                watermarked: watermarkData !== null,
                
                // Metadata
                mintedAt: new Date().toISOString(),
                version: 'v2.0-watermarked'
            }

            // Save minting record
            const recordPath = `./minting-records/mint-${nextTokenId}-${Date.now()}.json`
            await fs.mkdir('./minting-records', { recursive: true })
            await fs.writeFile(recordPath, JSON.stringify(mintingRecord, null, 2))

            console.log('\n🎉 ENHANCED MINTING COMPLETED!')
            console.log('=====================================')
            console.log(`🆔 Token ID: ${nextTokenId}`)
            console.log(`🏷️ Token Name: ${tokenName}`)
            console.log(`🛡️ Watermarked: ${watermarkData ? 'YES' : 'NO'}`)
            console.log(`🔒 Final SHA-256: ${processedSha256}`)
            console.log(`📄 Record saved: ${recordPath}`)
            console.log(`🌐 View on blockchain: Token #${nextTokenId}`)
            
            if (watermarkData) {
                console.log('\n🛡️ WATERMARK PROTECTION ACTIVE')
                console.log('================================')
                console.log('✓ Invisible watermark embedded in image pixels')
                console.log('✓ Token ID and creator address encoded')
                console.log('✓ Robust against compression and minor edits')
                console.log('✓ Can be extracted even if metadata is stripped')
                console.log('\n💡 Use the verification system to detect unauthorized use!')
            }

            return mintingRecord

        } catch (error) {
            console.error('\n❌ MINTING FAILED!')
            console.error('==================')
            console.error('Error:', error.message)
            
            if (error.code) {
                console.error('Code:', error.code)
            }
            
            throw error
        }
    }

    async verifyWatermark(imagePath, expectedTokenId = null, expectedCreator = null) {
        console.log('\n🔍 WATERMARK VERIFICATION')
        console.log('=========================')
        console.log('📸 Image:', imagePath)
        
        try {
            const imageData = await fs.readFile(imagePath)
            
            const verification = await this.watermarkClient.verifyImage(imageData, {
                tokenId: expectedTokenId,
                creatorAddress: expectedCreator
            })

            console.log('📊 Verification Results:')
            console.log('------------------------')
            console.log(`Overall Result: ${verification.overall_result.toUpperCase()}`)
            console.log(`Confidence: ${verification.confidence}%`)
            console.log(`Current SHA-256: ${verification.current_sha256}`)

            for (const [level, result] of Object.entries(verification.verification_levels)) {
                console.log(`\n${level.toUpperCase()}:`)
                if (result.method) {
                    console.log(`  Method: ${result.method}`)
                    console.log(`  Found: ${result.found || result.match || 'N/A'}`)
                    console.log(`  Confidence: ${result.confidence || 0}%`)
                    
                    if (result.extracted_data) {
                        console.log(`  Token ID: ${result.extracted_data.token_id}`)
                        console.log(`  Creator: ${result.extracted_data.creator_address}`)
                        console.log(`  Created: ${result.extracted_data.created_at}`)
                    }
                }
            }

            return verification

        } catch (error) {
            console.error('❌ Verification failed:', error.message)
            throw error
        }
    }

    async getNextTokenId() {
        // Simple approach: try token IDs until we find one that doesn't exist
        for (let tokenId = 1; tokenId <= 10000; tokenId++) {
            try {
                await this.contract.ownerOf(tokenId)
                // If we get here, token exists, continue to next
            } catch (error) {
                // Token doesn't exist, this is our next token ID
                return tokenId
            }
        }
        throw new Error('Unable to find next available token ID')
    }

    async batchMint(imageDirectory, options = {}) {
        console.log('\n📦 BATCH MINTING WITH WATERMARKS')
        console.log('=================================')
        
        const imageFiles = await fs.readdir(imageDirectory)
        const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        
        const imagesToMint = imageFiles.filter(file => 
            supportedExtensions.some(ext => file.toLowerCase().endsWith(ext))
        )

        console.log(`📸 Found ${imagesToMint.length} images to mint`)

        const results = []

        for (const imageFile of imagesToMint) {
            const imagePath = path.join(imageDirectory, imageFile)
            const tokenName = options.namePrefix ? 
                `${options.namePrefix} ${imageFile}` : 
                path.parse(imageFile).name

            try {
                console.log(`\n🎨 Processing: ${imageFile}`)
                const result = await this.mintWithWatermark(imagePath, tokenName, options)
                results.push({ success: true, file: imageFile, result })
                
                // Delay between mints to avoid overwhelming the network
                if (options.delayMs) {
                    console.log(`⏳ Waiting ${options.delayMs}ms before next mint...`)
                    await new Promise(resolve => setTimeout(resolve, options.delayMs))
                }
                
            } catch (error) {
                console.error(`❌ Failed to mint ${imageFile}:`, error.message)
                results.push({ success: false, file: imageFile, error: error.message })
            }
        }

        // Summary
        const successful = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length

        console.log('\n📊 BATCH MINTING SUMMARY')
        console.log('========================')
        console.log(`✅ Successful: ${successful}`)
        console.log(`❌ Failed: ${failed}`)
        console.log(`📁 Total processed: ${results.length}`)

        return results
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2)
    
    if (args.length === 0) {
        console.log(`
🛡️ Enhanced PhotoMint with Invisible Watermarking
================================================

Usage:
  node enhanced-mint.js mint <image_path> <token_name> [options]
  node enhanced-mint.js verify <image_path> [token_id] [creator_address]
  node enhanced-mint.js batch <directory> [options]

Examples:
  node enhanced-mint.js mint ./photos/sunset.jpg "Beautiful Sunset"
  node enhanced-mint.js verify ./photos/sunset_watermarked.jpg 123 0x1234...
  node enhanced-mint.js batch ./photos --prefix "Collection"

Options for mint/batch:
  --format JPEG|PNG        Output format (default: JPEG)
  --quality 1-100          JPEG quality (default: 95)
  --custom-data "text"     Custom watermark data
  --archive                Archive original files
  --delay 2000             Delay between batch mints (ms)
  --prefix "text"          Token name prefix for batch

Environment Variables:
  WATERMARK_SERVICE_URL    Watermarking service URL (default: http://localhost:5000)
  CONTRACT                 Contract address
  PRIVATE_KEY              Wallet private key
  ARCHIVE_ORIGINALS        Archive original images (true/false)
        `)
        process.exit(0)
    }

    const command = args[0]
    const enhancedMint = new EnhancedPhotoMint()
    
    try {
        await enhancedMint.initialize()

        switch (command) {
            case 'mint': {
                const imagePath = args[1]
                const tokenName = args[2]
                
                if (!imagePath || !tokenName) {
                    console.error('❌ Usage: node enhanced-mint.js mint <image_path> <token_name>')
                    process.exit(1)
                }
                
                const options = {}
                
                // Parse additional options
                for (let i = 3; i < args.length; i++) {
                    if (args[i] === '--format' && args[i + 1]) {
                        options.format = args[++i]
                    } else if (args[i] === '--quality' && args[i + 1]) {
                        options.quality = parseInt(args[++i])
                    } else if (args[i] === '--custom-data' && args[i + 1]) {
                        options.customData = args[++i]
                    }
                }
                
                await enhancedMint.mintWithWatermark(imagePath, tokenName, options)
                break
            }

            case 'verify': {
                const imagePath = args[1]
                const expectedTokenId = args[2]
                const expectedCreator = args[3]
                
                if (!imagePath) {
                    console.error('❌ Usage: node enhanced-mint.js verify <image_path> [token_id] [creator_address]')
                    process.exit(1)
                }
                
                await enhancedMint.verifyWatermark(imagePath, expectedTokenId, expectedCreator)
                break
            }

            case 'batch': {
                const directory = args[1]
                
                if (!directory) {
                    console.error('❌ Usage: node enhanced-mint.js batch <directory>')
                    process.exit(1)
                }
                
                const options = {}
                
                // Parse batch options
                for (let i = 2; i < args.length; i++) {
                    if (args[i] === '--prefix' && args[i + 1]) {
                        options.namePrefix = args[++i]
                    } else if (args[i] === '--delay' && args[i + 1]) {
                        options.delayMs = parseInt(args[++i])
                    }
                }
                
                await enhancedMint.batchMint(directory, options)
                break
            }

            default:
                console.error(`❌ Unknown command: ${command}`)
                console.error('Use: mint, verify, or batch')
                process.exit(1)
        }

    } catch (error) {
        console.error('\n💥 FATAL ERROR!')
        console.error('===============')
        console.error(error.message)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error)
}

export default EnhancedPhotoMint

