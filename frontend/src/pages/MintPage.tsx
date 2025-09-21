import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material'
import {
  CloudUpload,
  PhotoCamera,
  Security,
  Verified,
  AccountBalanceWallet,
  CheckCircle,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material'
import { useWeb3Context } from '../contexts/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface MintingStep {
  label: string
  description: string
}

const steps: MintingStep[] = [
  { label: 'Upload Photo', description: 'Select your photo for authentication' },
  { label: 'Process Image', description: 'Generate cryptographic hashes' },
  { label: 'Create Metadata', description: 'Build NFT metadata with proofs' },
  { label: 'Mint NFT', description: 'Create your authenticated photo NFT' }
]

const MintPage: React.FC = () => {
  const { isConnected, connectWallet, contract, account, signer } = useWeb3Context()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [photoDescription, setPhotoDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mintingProgress, setMintingProgress] = useState(0)
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock functions for now - in a real app these would call your backend/utils
  const processImage = async (file: File) => {
    // Simulate image processing
    setMintingProgress(25)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock hashes
    const sha256Hash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    const pHash = '0x' + Array(16).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    
    setMintingProgress(50)
    return { sha256Hash, pHash }
  }

  const uploadToIPFS = async (file: File, metadata: any) => {
    setMintingProgress(75)
    
    try {
      // Upload to our local image server
      const formData = new FormData()
      formData.append('image', file)
      
      console.log('📤 Uploading image to server...')
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const imageInfo = await response.json()
      console.log('✅ Image uploaded:', imageInfo)
      
      // Store image info in localStorage for easy access
      const imageData = {
        filename: imageInfo.filename,
        originalName: imageInfo.originalName,
        customName: null, // Will be set during minting with the user's custom name
        timestamp: imageInfo.timestamp,
        size: imageInfo.size,
        type: imageInfo.mimetype,
        url: imageInfo.url,
        serverPath: imageInfo.path
      }
      
      const existingImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
      existingImages.push(imageData)
      localStorage.setItem('uploadedImages', JSON.stringify(existingImages))
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Return the filename as CID for development
      return imageInfo.filename
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload image to server')
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setActiveStep(1)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleMint = async () => {
    if (!isConnected || !contract || !selectedFile) {
      toast.error('Please connect your wallet and select a photo')
      return
    }

    if (!photoName.trim()) {
      toast.error('Please enter a name for your photo')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setActiveStep(2)

      // Step 1: Process image
      const { sha256Hash, pHash } = await processImage(selectedFile)

      // Step 2: Create metadata
      const metadata = {
        name: photoName,
        description: photoDescription || 'Authenticated photo minted via PhotoMint',
        attributes: [
          { trait_type: 'File Size', value: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` },
          { trait_type: 'File Type', value: selectedFile.type },
          { trait_type: 'Authenticated', value: 'Yes' }
        ],
        created_by: account,
        timestamp: new Date().toISOString()
      }

      // Step 3: Upload to IPFS
      const cid = await uploadToIPFS(selectedFile, metadata)
      const tokenURI = `ipfs://${cid}`

      setActiveStep(3)
      setMintingProgress(85)

      // Step 4: Sign message and mint NFT
      // Create the proper digest that matches the contract expectation
      const cidBytes = new TextEncoder().encode(cid)
      const digest = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "bytes"],
        ["PHOTO:", sha256Hash, cidBytes]
      )
      const signature = await signer!.signMessage(ethers.getBytes(digest))

      // Convert pHash to uint64
      const pHashU64 = BigInt(pHash)

      // Mint the NFT
      const tx = await contract.mintWithProof(
        account,
        sha256Hash,
        cidBytes,
        pHashU64,
        signature,
        account,
        tokenURI,
        {
          gasLimit: 500000 // Set explicit gas limit to prevent estimation errors
        }
      )

      setMintingProgress(95)
      const receipt = await tx.wait()
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find((log: any) => log.fragment?.name === 'Minted')
      const tokenId = mintEvent?.args?.tokenId?.toString() || '1'
      
      // Update the stored image data with the custom name
      const existingImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
      const updatedImages = existingImages.map((img: any) => {
        if (img.filename === cid) {
          return { ...img, customName: photoName }
        }
        return img
      })
      localStorage.setItem('uploadedImages', JSON.stringify(updatedImages))
      console.log('✅ Updated image with custom name:', photoName)
      
      setMintedTokenId(tokenId)
      setMintingProgress(100)
      setActiveStep(4)
      
      toast.success('🎉 Your photo NFT has been minted successfully!')

    } catch (error: any) {
      console.error('Minting error:', error)
      setError(error.message || 'Failed to mint NFT')
      toast.error('Failed to mint NFT')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetMinting = () => {
    setActiveStep(0)
    setSelectedFile(null)
    setPreviewUrl(null)
    setPhotoName('')
    setPhotoDescription('')
    setIsProcessing(false)
    setMintingProgress(0)
    setMintedTokenId(null)
    setError(null)
  }

  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <AccountBalanceWallet sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Please connect your wallet to start minting photo NFTs
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              sx={{ px: 4, py: 2 }}
            >
              Connect Wallet
            </Button>
          </Paper>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            color: 'white',
            fontWeight: 600,
            mb: 2,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          Mint Your Photo NFT
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            mb: 6,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Transform your photos into authenticated blockchain assets
        </Typography>
      </motion.div>

      {/* Progress Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(255,255,255,0.95)' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={mintingProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {mintingProgress < 25 ? 'Processing image...' :
                 mintingProgress < 50 ? 'Generating hashes...' :
                 mintingProgress < 75 ? 'Uploading to IPFS...' :
                 mintingProgress < 95 ? 'Minting NFT...' : 'Complete!'}
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 0 & 1: Upload Photo */}
        {activeStep <= 1 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.95)' }}>
              {!selectedFile ? (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 8,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isDragActive ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      background: 'rgba(66, 133, 244, 0.05)'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CloudUpload sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  </motion.div>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                    {isDragActive ? 'Drop your photo here' : 'Upload Your Photo'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Drag and drop your image here, or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Supports JPG, PNG, GIF, WebP (max 10MB)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'contain',
                          borderRadius: 8
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Photo Details
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Photo Name"
                        value={photoName}
                        onChange={(e) => setPhotoName(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="Enter a name for your photo"
                      />
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description (Optional)"
                        value={photoDescription}
                        onChange={(e) => setPhotoDescription(e.target.value)}
                        sx={{ mb: 3 }}
                        placeholder="Describe your photo..."
                      />
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Chip
                          icon={<Info />}
                          label={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                          variant="outlined"
                        />
                        <Chip
                          icon={<PhotoCamera />}
                          label={selectedFile.type}
                          variant="outlined"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                            setActiveStep(0)
                          }}
                        >
                          Change Photo
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleMint}
                          disabled={isProcessing || !photoName.trim()}
                          startIcon={isProcessing ? <CircularProgress size={20} /> : <Security />}
                        >
                          {isProcessing ? 'Processing...' : 'Mint NFT'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}

        {/* Success State */}
        {activeStep === 4 && mintedTokenId && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Paper sx={{ p: 6, textAlign: 'center', background: 'rgba(255,255,255,0.95)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
              </motion.div>
              
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                Success! NFT Minted
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Your photo has been successfully authenticated and minted as NFT #{mintedTokenId}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={resetMinting}
                >
                  Mint Another
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.open(`/gallery`)}
                >
                  View in Gallery
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 16 }}
        >
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ background: 'rgba(234, 67, 53, 0.1)' }}
          >
            {error}
          </Alert>
        </motion.div>
      )}
    </Container>
  )
}

export default MintPage
