#!/usr/bin/env node
/**
 * Watermark Client for PhotoMint
 * Bridge between Node.js backend and Python watermarking service
 */

import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs/promises'
import path from 'path'

export default class WatermarkClient {
    constructor(serviceUrl = 'http://localhost:5001') {
        this.serviceUrl = serviceUrl
    }

    /**
     * Check if watermarking service is healthy
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.serviceUrl}/health`)
            if (!response.ok) {
                throw new Error(`Service returned ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            throw new Error(`Watermarking service health check failed: ${error.message}`)
        }
    }

    /**
     * Embed watermark in image
     */
    async embedWatermark(imagePath, tokenId, creatorAddress, options = {}) {
        try {
            const {
                customData = '',
                outputFormat = 'JPEG',
                quality = 95
            } = options

            const formData = new FormData()
            formData.append('file', await fs.readFile(imagePath), {
                filename: path.basename(imagePath),
                contentType: 'image/jpeg'
            })
            formData.append('token_id', tokenId.toString())
            formData.append('creator_address', creatorAddress)
            formData.append('custom_data', customData)
            formData.append('output_format', outputFormat)
            formData.append('quality', quality.toString())

            const response = await fetch(`${this.serviceUrl}/embed`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Embed failed: ${response.status} - ${errorText}`)
            }

            return await response.json()
        } catch (error) {
            throw new Error(`Watermark embedding failed: ${error.message}`)
        }
    }

    /**
     * Extract watermark from image
     */
    async extractWatermark(imagePath, options = {}) {
        try {
            const { expectedPayloadSize = 64 } = options

            const formData = new FormData()
            formData.append('file', await fs.readFile(imagePath), {
                filename: path.basename(imagePath),
                contentType: 'image/jpeg'
            })
            formData.append('expected_payload_size', expectedPayloadSize.toString())

            const response = await fetch(`${this.serviceUrl}/extract`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Extract failed: ${response.status} - ${errorText}`)
            }

            return await response.json()
        } catch (error) {
            throw new Error(`Watermark extraction failed: ${error.message}`)
        }
    }

    /**
     * Comprehensive image verification
     */
    async verifyImage(imagePath, expectations = {}) {
        try {
            const imageBuffer = await fs.readFile(imagePath)
            const imageBase64 = imageBuffer.toString('base64')

            const requestData = {
                image: imageBase64,
                ...expectations
            }

            const response = await fetch(`${this.serviceUrl}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Verify failed: ${response.status} - ${errorText}`)
            }

            return await response.json()
        } catch (error) {
            throw new Error(`Image verification failed: ${error.message}`)
        }
    }

    /**
     * Save watermarked image to file
     */
    async saveWatermarkedImage(watermarkResult, outputPath) {
        try {
            if (!watermarkResult.watermarked_image) {
                throw new Error('No watermarked image data in result')
            }

            const imageBuffer = Buffer.from(watermarkResult.watermarked_image, 'base64')
            await fs.writeFile(outputPath, imageBuffer)
            
            console.log(`✅ Watermarked image saved to: ${outputPath}`)
            return outputPath
        } catch (error) {
            throw new Error(`Failed to save watermarked image: ${error.message}`)
        }
    }

    /**
     * Process image with watermark and return file path
     */
    async processImageWithWatermark(imagePath, tokenId, creatorAddress, outputDir = './data/uploads', options = {}) {
        try {
            // Embed watermark
            const watermarkResult = await this.embedWatermark(imagePath, tokenId, creatorAddress, options)
            
            // Generate output filename
            const timestamp = Date.now()
            const extension = options.outputFormat === 'PNG' ? 'png' : 'jpg'
            const outputFilename = `watermarked_${timestamp}_token_${tokenId}.${extension}`
            const outputPath = path.join(outputDir, outputFilename)

            // Ensure output directory exists
            await fs.mkdir(outputDir, { recursive: true })

            // Save watermarked image
            await this.saveWatermarkedImage(watermarkResult, outputPath)

            return {
                originalPath: imagePath,
                watermarkedPath: outputPath,
                watermarkData: watermarkResult,
                filename: outputFilename
            }
        } catch (error) {
            throw new Error(`Image processing failed: ${error.message}`)
        }
    }
}

// Export for CommonJS compatibility
module.exports = WatermarkClient
