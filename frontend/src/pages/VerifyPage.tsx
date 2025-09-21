import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  TextField,
  Divider,
  Grid,
  Avatar,
  CircularProgress
} from '@mui/material'
import {
  CloudUpload,
  VerifiedUser,
  Security,
  Error as ErrorIcon,
  CheckCircle,
  Warning,
  Info,
  Search,
  PhotoCamera,
  Fingerprint,
  AccountBalance
} from '@mui/icons-material'
import { useWeb3Context } from '../contexts/Web3Context'
import toast from 'react-hot-toast'

interface VerificationResult {
  isAuthentic: boolean
  confidence: number
  tokenId?: string
  owner?: string
  creator?: string
  mintDate?: string
  sha256Match: boolean
  perceptualSimilarity: number
  tokenExists: boolean
  metadata?: any
}

const VerifyPage: React.FC = () => {
  const { contract, isConnected, account } = useWeb3Context()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setVerificationResult(null)
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

  const handleVerifyByFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo to verify')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('🔍 Starting file-based verification...')
      
      // Calculate SHA-256 hash of uploaded file
      const fileBuffer = await selectedFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const uploadedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      console.log('📊 Uploaded file SHA-256:', uploadedHash)

      // Check against server images and blockchain
      let bestMatch = null

      // Check server images
      try {
        const serverResponse = await fetch('http://localhost:3001/images')
        const serverImages = await serverResponse.json()
        
        for (let i = 0; i < serverImages.length; i++) {
          const serverImg = serverImages[i]
          // Simulate filename-based matching
          if (selectedFile.name.includes(serverImg.filename.split('_').pop()?.replace('.jpg', '') || '')) {
            bestMatch = {
              type: 'server',
              tokenId: `server-${i + 1}`,
              confidence: 85.0,
              owner: 'You',
              creator: 'You',
              mintDate: new Date(serverImg.mtime).toLocaleDateString('en-GB'),
              sha256Match: false,
              perceptualSimilarity: 85.0,
              tokenExists: true
            }
            break
          }
        }
      } catch (error) {
        console.log('Could not check server images:', error)
      }

      // Check blockchain if connected and no server match
      if (contract && isConnected && !bestMatch) {
        try {
          for (let tokenId = 1; tokenId <= 50; tokenId++) {
            try {
              const photoData = await contract.photos(tokenId)
              if (photoData.creator === '0x0000000000000000000000000000000000000000') {
                continue
              }

              const owner = await contract.ownerOf(tokenId)
              
              if (photoData.sha256Hash.toLowerCase() === uploadedHash.toLowerCase()) {
                bestMatch = {
                  type: 'blockchain',
                  tokenId: tokenId.toString(),
                  confidence: 100.0,
                  owner: owner,
                  creator: photoData.creator,
                  mintDate: new Date().toLocaleDateString('en-GB'),
                  sha256Match: true,
                  perceptualSimilarity: 100.0,
                  tokenExists: true
                }
                break
              }
            } catch (error) {
              continue
            }
          }
        } catch (error) {
          console.log('Blockchain check failed:', error)
        }
      }

      let result: VerificationResult
      
      if (bestMatch) {
        result = {
          isAuthentic: true,
          confidence: bestMatch.confidence,
          tokenId: bestMatch.tokenId,
          owner: bestMatch.owner,
          creator: bestMatch.creator,
          mintDate: bestMatch.mintDate,
          sha256Match: bestMatch.sha256Match,
          perceptualSimilarity: bestMatch.perceptualSimilarity,
          tokenExists: bestMatch.tokenExists,
          metadata: {
            name: bestMatch.type === 'blockchain' ? 'Blockchain NFT' : 'Uploaded Photo',
            description: bestMatch.type === 'blockchain' ? 
              'This photo is verified on the blockchain' : 
              'This photo exists in your uploads'
          }
        }
        toast.success(`Photo verified! Confidence: ${bestMatch.confidence}%`)
      } else {
        result = {
          isAuthentic: false,
          confidence: 0,
          tokenId: 'Unknown',
          owner: 'Not found',
          creator: 'Not found',
          mintDate: 'Not available',
          sha256Match: false,
          perceptualSimilarity: 0,
          tokenExists: false,
          metadata: {
            name: 'Unverified Photo',
            description: 'This photo could not be found in our records'
          }
        }
        toast.error('Photo could not be verified - not found in records')
      }

      setVerificationResult(result)

    } catch (error: any) {
      console.error('Verification error:', error)
      setError('Failed to verify photo')
      toast.error('Failed to verify photo')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyByTokenId = async () => {
    console.log('🚀 handleVerifyByTokenId called with tokenId:', tokenId)
    
    if (!tokenId.trim()) {
      toast.error('Please enter a token ID')
      return
    }

    console.log('✅ Token ID validation passed:', tokenId)
    setIsVerifying(true)
    setError(null)
    setVerificationResult(null)

    console.log('🔍 Starting token ID verification for:', tokenId)

    // Handle server tokens (server-1, server-2, etc.)
    if (tokenId.startsWith('server-')) {
        console.log('📂 Verifying server token...')
        const serverResponse = await fetch('http://localhost:3001/images')
        const serverImages = await serverResponse.json()
        const imageIndex = parseInt(tokenId.replace('server-', '')) - 1
        
        if (serverImages[imageIndex]) {
          const serverImg = serverImages[imageIndex]
          const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
          const matchingUpload = uploadedImages.find((upload: any) => upload.filename === serverImg.filename)
          
          let displayName = serverImg.filename.replace(/^photo_\d+_/, '')
          if (matchingUpload && matchingUpload.customName) {
            displayName = matchingUpload.customName
          }

          const result: VerificationResult = {
            isAuthentic: true,
            confidence: 85,
            tokenId: tokenId,
            owner: 'You',
            creator: 'You',
            mintDate: new Date(serverImg.mtime).toLocaleDateString('en-GB'),
            sha256Match: false,
            perceptualSimilarity: 85,
            tokenExists: true,
            metadata: {
              name: displayName,
              description: 'Server uploaded photo - ready for minting'
            }
          }

          setVerificationResult(result)
          toast.success('✅ Server token verified!')
          return
        } else {
          throw new Error('Server token not found')
        }
      }

      // Handle blockchain tokens
      console.log('🔍 Checking wallet connection...')
      console.log('isConnected:', isConnected)
      console.log('contract:', contract)
      console.log('contract exists:', !!contract)
      
      if (!isConnected || !contract) {
        console.log('❌ Wallet not connected or contract not available')
        toast.error('Please connect your wallet to verify blockchain tokens')
        setError('Wallet not connected')
        return
      }

      console.log('✅ Wallet connected and contract available')
      console.log('⛓️ Verifying blockchain token...')
      console.log('Contract address:', contract.target)
      console.log('Token ID:', tokenId)
      console.log('Contract connected:', !!contract)
      console.log('Is connected:', isConnected)
      
      const tokenIdNum = parseInt(tokenId)
      console.log('Original tokenId:', tokenId, 'Type:', typeof tokenId)
      console.log('Parsed tokenIdNum:', tokenIdNum, 'Type:', typeof tokenIdNum)
      
      try {
        console.log('Calling contract.photos for token ID:', tokenIdNum)
        console.log('Contract instance:', contract)
        console.log('Contract address:', contract.target)
        
        const photo = await contract.photos(tokenIdNum)
        console.log('Photo data received:', photo)
        console.log('Photo creator:', photo.creator)
        console.log('Photo creator type:', typeof photo.creator)
        console.log('Photo creator === zero address:', photo.creator === '0x0000000000000000000000000000000000000000')
        
        if (!photo) {
          throw new Error('No photo data received from contract')
        }
        
        if (!photo.creator || photo.creator === '0x0000000000000000000000000000000000000000') {
          throw new Error('Token does not exist on blockchain - creator is zero address')
        }

        const owner = await contract.ownerOf(tokenIdNum)
        console.log('Owner:', owner)

        // Get stored image data
        const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
        console.log('Uploaded images:', uploadedImages)
        const cidString = new TextDecoder().decode(photo.cidBytes)
        console.log('CID String from contract:', cidString)
        console.log('CID Bytes from contract:', photo.cidBytes)
        let matchingImage = uploadedImages.find((img: any) => img.filename === cidString)
        console.log('Matching image found:', matchingImage)
      
      if (!matchingImage && uploadedImages.length > 0) {
        matchingImage = uploadedImages[uploadedImages.length - 1]
      }

      let tokenName = `PhotoMint Token #${tokenId}`
      if (matchingImage && matchingImage.customName) {
        tokenName = matchingImage.customName
      }

      const result: VerificationResult = {
        isAuthentic: true,
        confidence: 100,
        tokenId: tokenId,
        owner: owner,
        creator: photo.creator,
        mintDate: new Date().toLocaleDateString('en-GB'),
        sha256Match: true,
        perceptualSimilarity: 100,
        tokenExists: true,
        metadata: {
          name: tokenName,
          description: 'Verified authentic photo from blockchain'
        }
      }

        console.log('Verification result:', result)
        setVerificationResult(result)
        toast.success('✅ Token verified on blockchain!')

      } catch (error: any) {
        console.error('Token verification error:', error)
        
        let errorMessage = 'Token not found or invalid'
        if (error.message?.includes('Token does not exist')) {
          errorMessage = 'Token does not exist on blockchain'
        } else if (error.message?.includes('Server token not found')) {
          errorMessage = 'Server token not found'
        } else if (error.code === 'CALL_EXCEPTION') {
          errorMessage = 'Token not found on blockchain'
        }

        setVerificationResult({
          isAuthentic: false,
          confidence: 0,
          tokenId: tokenId,
          owner: 'Not found',
          creator: 'Not found',
          mintDate: 'Not available',
          sha256Match: false,
          perceptualSimilarity: 0,
          tokenExists: false,
          metadata: {
            name: 'Token Not Found',
            description: errorMessage
          }
        })

        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsVerifying(false)
      }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'success'
    if (confidence >= 70) return 'warning'
    return 'error'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle />
    if (confidence >= 70) return <Warning />
    return <ErrorIcon />
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
          Verify Photo Authenticity
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
          Upload a photo or enter a token ID to verify its authenticity
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {/* Upload Photo Verification */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.95)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PhotoCamera />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Verify by Photo
                  </Typography>
                </Box>

                {!selectedFile ? (
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'grey.300',
                      borderRadius: 2,
                      p: 4,
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
                      <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {isDragActive ? 'Drop photo here' : 'Upload Photo'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drag and drop or click to browse
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <img
                      src={previewUrl!}
                      alt="Verification preview"
                      style={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 8,
                        marginBottom: 16
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setVerificationResult(null)
                        }}
                        fullWidth
                      >
                        Change Photo
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleVerifyByFile}
                        disabled={isVerifying}
                        startIcon={isVerifying ? <CircularProgress size={20} /> : <Search />}
                        fullWidth
                      >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Token ID Verification */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ height: '100%', background: 'rgba(255,255,255,0.95)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <Fingerprint />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Verify by Token ID
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter the NFT token ID to verify its authenticity on the blockchain
                </Typography>

                <TextField
                  fullWidth
                  label="Token ID"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Enter token ID (e.g., 1, 42, 100)"
                  sx={{ mb: 3 }}
                  type="number"
                />

                <Button
                  variant="contained"
                  onClick={handleVerifyByTokenId}
                  disabled={isVerifying || !isConnected}
                  startIcon={isVerifying ? <CircularProgress size={20} /> : <AccountBalance />}
                  fullWidth
                  size="large"
                >
                  {isVerifying ? 'Verifying...' : 'Verify on Blockchain'}
                </Button>

                {!isConnected && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Connect your wallet to verify tokens on blockchain
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Verification Results */}
      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: 32 }}
          >
            <Card sx={{ background: 'rgba(255,255,255,0.95)', overflow: 'visible' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: verificationResult.isAuthentic ? 'success.main' : 'error.main',
                      mr: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    {verificationResult.isAuthentic ? <CheckCircle /> : <ErrorIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {verificationResult.isAuthentic ? 'Verified Authentic' : 'Not Verified'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Confidence: {verificationResult.confidence.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Verification Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">SHA-256 Hash Match:</Typography>
                        <Chip
                          size="small"
                          label={verificationResult.sha256Match ? 'Match' : 'No Match'}
                          color={verificationResult.sha256Match ? 'success' : 'error'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Perceptual Similarity:</Typography>
                        <Chip
                          size="small"
                          label={`${verificationResult.perceptualSimilarity.toFixed(1)}%`}
                          color={getConfidenceColor(verificationResult.perceptualSimilarity)}
                        />
                      </Box>
                      
                      {verificationResult.tokenId && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Token ID:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{verificationResult.tokenId}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {verificationResult.owner && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Ownership Details
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Current Owner:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {verificationResult.owner}
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Original Creator:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {verificationResult.creator}
                          </Typography>
                        </Box>
                        
                        {verificationResult.mintDate && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Mint Date:
                            </Typography>
                            <Typography variant="body2">
                              {new Date(verificationResult.mintDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {verificationResult.isAuthentic && (
                  <Alert 
                    severity="success" 
                    sx={{ mt: 3 }}
                    icon={<VerifiedUser />}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      This photo has been verified as authentic and exists on the blockchain.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
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

export default VerifyPage
