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
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  CloudUpload,
  PhotoCamera,
  Verified,
  Error as ErrorIcon,
  Security,
  Archive,
  HighQuality,
  Settings,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material'
import { useWeb3Context } from '../contexts/Web3Context'
import { computePHash64, sha256Hex, buildDigest, cidToBytes } from '../../../scripts/utils.js'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import WatermarkService from '../services/WatermarkService'

interface WatermarkStatus {
  status: 'idle' | 'checking' | 'embedding' | 'success' | 'error'
  message?: string
  payload?: string
}

const steps = [
  'Upload Photo',
  'Configure Protection',
  'Apply Watermark',
  'Mint NFT'
]

const WatermarkMintPage: React.FC = () => {
  const { isConnected, account, contract } = useWeb3Context()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Watermarking configuration
  const [enableWatermark, setEnableWatermark] = useState(true)
  const [watermarkQuality, setWatermarkQuality] = useState(95)
  const [watermarkFormat, setWatermarkFormat] = useState('JPEG')
  const [customWatermarkData, setCustomWatermarkData] = useState('')
  const [archiveOriginal, setArchiveOriginal] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Watermarking status
  const [watermarkService] = useState(new WatermarkService())
  const [watermarkStatus, setWatermarkStatus] = useState<WatermarkStatus>({ status: 'idle' })
  const [serviceHealth, setServiceHealth] = useState<any>(null)
  
  // Step management
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedFile(null)
    setPreviewUrl(null)
    setPhotoName('')
    setError(null)
    setWatermarkStatus({ status: 'idle' })
  }

  // Check watermarking service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await watermarkService.healthCheck()
      setServiceHealth(health)
      console.log('🛡️ Watermarking service:', health)
    } catch (error) {
      console.warn('⚠️ Watermarking service unavailable:', error)
      setServiceHealth({ status: 'error', error: error.toString() })
    }
  }, [watermarkService])

  React.useEffect(() => {
    if (enableWatermark && activeStep >= 1) {
      checkServiceHealth()
    }
  }, [enableWatermark, activeStep, checkServiceHealth])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
      if (activeStep === 0) {
        handleNext()
      }
    }
  }, [activeStep])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const uploadToIPFS = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const result = await response.json()
    return result
  }

  const handleWatermarkStep = async () => {
    if (!selectedFile || !enableWatermark) {
      handleNext()
      return
    }

    setWatermarkStatus({ status: 'checking', message: 'Checking watermarking service...' })

    try {
      // Check service health
      await watermarkService.healthCheck()
      
      setWatermarkStatus({ status: 'embedding', message: 'Applying invisible watermark...' })
      
      // Generate token ID (simplified for demo)
      const nextTokenId = Math.floor(Math.random() * 1000000).toString()
      
      // Embed watermark
      const watermarkResult = await watermarkService.embedWatermark(
        selectedFile,
        nextTokenId,
        account || 'demo-address',
        customWatermarkData || photoName,
        watermarkFormat,
        watermarkQuality
      )

      setWatermarkStatus({
        status: 'success',
        message: 'Watermark applied successfully!',
        payload: watermarkResult.payload
      })

      toast.success('🛡️ Invisible watermark applied!')
      
      // Store watermarked image data for minting
      const watermarkedBlob = new Blob(
        [Buffer.from(watermarkResult.watermarked_image, 'base64')],
        { type: `image/${watermarkFormat.toLowerCase()}` }
      )
      
      const watermarkedFile = new File([watermarkedBlob], selectedFile.name, {
        type: watermarkedBlob.type
      })
      
      setSelectedFile(watermarkedFile)
      setPreviewUrl(URL.createObjectURL(watermarkedFile))
      
      setTimeout(() => handleNext(), 1500)

    } catch (error: any) {
      console.error('Watermarking failed:', error)
      setWatermarkStatus({
        status: 'error',
        message: `Watermarking failed: ${error.message}`
      })
      toast.error('Watermarking failed, you can proceed without watermark')
    }
  }

  const handleMint = async () => {
    if (!selectedFile || !photoName || !account || !contract) {
      toast.error('Please fill in all fields and connect your wallet')
      return
    }

    setIsMinting(true)
    setError(null)

    try {
      console.log('🎨 Starting enhanced minting process...')
      console.log('🛡️ Watermarked:', watermarkStatus.status === 'success')
      
      // Upload the image
      const uploadResult = await uploadToIPFS(selectedFile)
      
      // Calculate hashes
      const fileBuffer = await selectedFile.arrayBuffer()
      const sha256Hash = sha256Hex(new Uint8Array(fileBuffer))
      const pHashU64 = await computePHash64(new Uint8Array(fileBuffer))
      
      // Create CID and signature
      const cid = uploadResult.filename
      const cidBytes = await cidToBytes(cid)
      const digest = buildDigest(sha256Hash, cidBytes)
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [ethers.hexlify(digest), account]
      })

      const tokenURI = `https://ipfs.io/ipfs/${cid}`

      // Mint the NFT
      const tx = await contract.mintWithProof(
        account,
        sha256Hash,
        cidBytes,
        pHashU64,
        signature,
        account,
        tokenURI,
        { gasLimit: 500000 }
      )

      toast.loading('Waiting for blockchain confirmation...', { id: 'minting' })
      const receipt = await tx.wait()
      
      // Store comprehensive minting record
      const mintingRecord = {
        ...uploadResult,
        customName: photoName,
        minted: true,
        transactionHash: receipt.transactionHash,
        sha256Hash,
        pHash: pHashU64.toString(),
        watermarked: watermarkStatus.status === 'success',
        watermarkPayload: watermarkStatus.payload,
        watermarkSettings: enableWatermark ? {
          quality: watermarkQuality,
          format: watermarkFormat,
          customData: customWatermarkData,
          archived: archiveOriginal
        } : null,
        mintedAt: new Date().toISOString(),
        tokenURI
      }
      
      const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
      uploadedImages.push(mintingRecord)
      localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages))

      toast.success(`🎉 NFT minted successfully! ${watermarkStatus.status === 'success' ? '🛡️ Protected with invisible watermark' : ''}`, { id: 'minting' })
      
      handleNext()

    } catch (error: any) {
      console.error('Minting error:', error)
      setError(error.message || 'Minting failed')
      toast.error(error.message || 'Minting failed')
    } finally {
      setIsMinting(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhotoCamera color="primary" />
                Upload Your Photo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a high-quality photo to mint as an NFT with cryptographic authentication
              </Typography>
              
              {!selectedFile ? (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.400',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                      color: 'white'
                    },
                    backgroundColor: isDragActive ? 'primary.light' : 'grey.50'
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6">
                    {isDragActive ? 'Drop the files here ...' : 'Drag & drop a photo here, or click to select'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    (Max 10MB, JPG, PNG, GIF, WEBP)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: 300,
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
                        setActiveStep(0)
                      }}
                      fullWidth
                    >
                      Change Photo
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      fullWidth
                    >
                      Configure Protection
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )

      case 1:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Security color="primary" />
                Configure Protection
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Photo Name"
                    value={photoName}
                    onChange={(e) => setPhotoName(e.target.value)}
                    placeholder="My Amazing Photo"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enableWatermark}
                        onChange={(e) => setEnableWatermark(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security />
                        Enable Invisible Watermark Protection
                        <Tooltip title="Embeds ownership information invisibly in the image pixels">
                          <Info fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Grid>

                {enableWatermark && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" />
                        Watermark Protection Benefits
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ Survives social media downloads and screenshots
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ Remains even if metadata is stripped
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ Provides legal evidence of ownership
                      </Typography>
                      <Typography variant="body2">
                        ✓ Completely invisible to the human eye
                      </Typography>
                    </Card>
                  </Grid>
                )}

                {enableWatermark && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Advanced Watermark Settings</Typography>
                      <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                    
                    <Collapse in={showAdvanced}>
                      <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Output Format</InputLabel>
                              <Select
                                value={watermarkFormat}
                                onChange={(e) => setWatermarkFormat(e.target.value)}
                                label="Output Format"
                              >
                                <MenuItem value="JPEG">JPEG (Smaller, more compatible)</MenuItem>
                                <MenuItem value="PNG">PNG (Lossless, larger)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography gutterBottom>Quality: {watermarkQuality}%</Typography>
                            <Slider
                              value={watermarkQuality}
                              onChange={(_, value) => setWatermarkQuality(value as number)}
                              min={80}
                              max={100}
                              step={1}
                              marks={[
                                { value: 80, label: '80%' },
                                { value: 90, label: '90%' },
                                { value: 100, label: '100%' }
                              ]}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Custom Watermark Data"
                              value={customWatermarkData}
                              onChange={(e) => setCustomWatermarkData(e.target.value)}
                              placeholder="Limited Edition, Artist Name, etc."
                              helperText="Optional custom data to embed in watermark"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={archiveOriginal}
                                  onChange={(e) => setArchiveOriginal(e.target.checked)}
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Archive />
                                  Archive original unwatermarked image
                                </Box>
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Grid>
                )}

                {enableWatermark && serviceHealth && (
                  <Grid item xs={12}>
                    <Alert 
                      severity={serviceHealth.status === 'healthy' ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    >
                      {serviceHealth.status === 'healthy' ? (
                        <>
                          ✅ Watermarking service is ready
                          <br />
                          Method: {serviceHealth.method} | Max payload: {serviceHealth.max_payload_size} bytes
                        </>
                      ) : (
                        'Watermarking service is unavailable. Please start the service or proceed without watermark.'
                      )}
                    </Alert>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!photoName || (enableWatermark && serviceHealth?.status !== 'healthy')}
                  fullWidth
                >
                  {enableWatermark ? 'Apply Watermark' : 'Skip to Minting'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Security color="primary" />
                Applying Watermark Protection
              </Typography>
              
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {watermarkStatus.status === 'idle' && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Ready to apply invisible watermark</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      This will embed ownership information directly into the image pixels
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleWatermarkStep}
                      startIcon={<Security />}
                    >
                      Apply Watermark Protection
                    </Button>
                  </Box>
                )}
                
                {(watermarkStatus.status === 'checking' || watermarkStatus.status === 'embedding') && (
                  <Box>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>{watermarkStatus.message}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {watermarkStatus.status === 'checking' 
                        ? 'Connecting to watermarking service...'
                        : 'Embedding invisible ownership data...'
                      }
                    </Typography>
                  </Box>
                )}
                
                {watermarkStatus.status === 'success' && (
                  <Box>
                    <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="success.main">
                      Watermark Applied Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your photo is now protected with invisible ownership data
                    </Typography>
                    {watermarkStatus.payload && (
                      <Chip 
                        label={`Payload: ${watermarkStatus.payload}`} 
                        variant="outlined" 
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                      />
                    )}
                    <Box sx={{ mt: 3 }}>
                      <Button variant="contained" onClick={handleNext} size="large">
                        Proceed to Minting
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {watermarkStatus.status === 'error' && (
                  <Box>
                    <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6" gutterBottom color="error">
                      Watermarking Failed
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {watermarkStatus.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button variant="outlined" onClick={() => setWatermarkStatus({ status: 'idle' })}>
                        Try Again
                      </Button>
                      <Button variant="contained" onClick={handleNext}>
                        Continue Without Watermark
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Verified color="primary" />
                Mint Your Protected NFT
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={previewUrl!}
                    alt="Final preview"
                    style={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      borderRadius: 8
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>NFT Details</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                    <Typography variant="body1" fontWeight="bold">{photoName}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Protection Level:</Typography>
                    <Chip 
                      label={watermarkStatus.status === 'success' ? '🛡️ Watermark Protected' : '📸 Standard'} 
                      color={watermarkStatus.status === 'success' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                  
                  {watermarkStatus.status === 'success' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        ✅ This NFT includes invisible watermark protection that will help you prove ownership even if the image is shared or downloaded elsewhere.
                      </Typography>
                    </Alert>
                  )}
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">File Details:</Typography>
                    <Typography variant="body2">
                      Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : '0'} KB
                    </Typography>
                    <Typography variant="body2">
                      Type: {selectedFile?.type || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={handleBack} disabled={isMinting}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleMint}
                      disabled={!isConnected || isMinting}
                      startIcon={isMinting ? <CircularProgress size={20} /> : <Verified />}
                      fullWidth
                      size="large"
                    >
                      {isMinting ? 'Minting NFT...' : 'Mint Protected NFT'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" gutterBottom color="success.main">
                NFT Minted Successfully!
              </Typography>
              <Typography variant="h6" gutterBottom>
                "{photoName}"
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your photo has been successfully minted as an NFT
                {watermarkStatus.status === 'success' && ' with invisible watermark protection'}
              </Typography>
              
              {watermarkStatus.status === 'success' && (
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    🛡️ Your NFT is protected with invisible watermarking!
                  </Typography>
                  <Typography variant="body2">
                    • Ownership data is embedded in the image pixels<br />
                    • Survives downloads, screenshots, and social media uploads<br />
                    • Use the verification page to detect unauthorized usage<br />
                    • Provides legal evidence for copyright protection
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleReset}>
                  Mint Another
                </Button>
                <Button variant="contained" href="/gallery">
                  View Gallery
                </Button>
              </Box>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          Mint Protected Photo NFT
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.8)',
            mb: 4,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Create an authenticated NFT with optional invisible watermark protection for maximum ownership security
        </Typography>

        <Paper sx={{ p: 4, mb: 4, backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please connect your wallet to mint NFTs
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </AnimatePresence>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default WatermarkMintPage

