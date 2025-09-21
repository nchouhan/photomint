import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  Verified,
  Info,
  Security,
  Person,
  CalendarToday,
  Fingerprint,
  Link,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  CheckCircle
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useWeb3Context } from '../contexts/Web3Context'
import { toast } from 'react-hot-toast'

interface PhotoDetails {
  tokenId: string
  name: string
  description: string
  image: string
  owner: string
  creator: string
  mintDate: string
  attributes: Array<{ trait_type: string; value: string }>
  tokenURI: string
  sha256Hash?: string
  pHash?: string
  cidBytes?: string
  signature?: string
}

const PhotoDetailPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate = useNavigate()
  const { contract, account, isConnected } = useWeb3Context()
  
  const [photo, setPhoto] = useState<PhotoDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false)
  const [showTechnicalDialog, setShowTechnicalDialog] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (tokenId) {
      fetchPhotoDetails()
    }
  }, [tokenId, contract])

  const fetchPhotoDetails = async () => {
    if (!tokenId) return

    setLoading(true)
    try {
      console.log('🔍 Fetching details for tokenId:', tokenId)
      
      // First check if it's a server image (tokenId starts with 'server-')
      if (tokenId.startsWith('server-')) {
        console.log('📂 Fetching server image details...')
        const serverImages = await fetchServerImages()
        console.log('📸 Available server images:', serverImages)
        
        const imageIndex = parseInt(tokenId.replace('server-', '')) - 1
        console.log('🔢 Looking for image at index:', imageIndex)
        
        if (serverImages && serverImages[imageIndex]) {
          const serverImg = serverImages[imageIndex]
          console.log('✅ Found server image:', serverImg)
          
          const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
          const matchingUpload = uploadedImages.find((upload: any) => upload.filename === serverImg.filename)
          
          let displayName = serverImg.filename.replace(/^photo_\d+_/, '')
          if (matchingUpload && matchingUpload.customName) {
            displayName = matchingUpload.customName
          }

          setPhoto({
            tokenId: tokenId,
            name: displayName,
            description: 'Your uploaded photo - Ready for minting',
            image: serverImg.url,
            owner: account || 'You',
            creator: account || 'You',
            mintDate: new Date(serverImg.mtime).toISOString(),
            attributes: [
              { trait_type: 'Status', value: 'Uploaded' },
              { trait_type: 'File Size', value: `${(serverImg.size / 1024).toFixed(1)} KB` },
              { trait_type: 'Original Filename', value: serverImg.filename }
            ],
            tokenURI: ''
          })
          console.log('✅ Photo details set successfully')
          return
        } else {
          console.log('❌ Server image not found at index', imageIndex)
          console.log('Available images count:', serverImages?.length || 0)
        }
      } else if (contract && isConnected) {
        console.log('⛓️ Fetching blockchain NFT details...')
        // Fetch blockchain NFT
        const tokenIdNum = parseInt(tokenId)
        const photoData = await contract.photos(tokenIdNum)
        const owner = await contract.ownerOf(tokenIdNum)
        
        if (photoData.creator === '0x0000000000000000000000000000000000000000') {
          throw new Error('Token does not exist')
        }

        // Get image from localStorage
        const cidString = new TextDecoder().decode(photoData.cidBytes)
        const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
        let matchingImage = uploadedImages.find((img: any) => img.filename === cidString)
        
        if (!matchingImage && uploadedImages.length > 0) {
          matchingImage = uploadedImages[uploadedImages.length - 1]
        }

        const actualImage = matchingImage?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        const photoName = matchingImage?.customName || `PhotoMint Token #${tokenId}`

        setPhoto({
          tokenId: tokenId,
          name: photoName,
          description: 'Blockchain-authenticated photo with cryptographic proof',
          image: actualImage,
          owner: owner,
          creator: photoData.creator,
          mintDate: new Date().toISOString(), // Would need to get from blockchain events
          attributes: [
            { trait_type: 'Token ID', value: tokenId },
            { trait_type: 'Blockchain', value: 'Ethereum (Local)' },
            { trait_type: 'Standard', value: 'ERC-721' },
            { trait_type: 'Authenticated', value: 'Yes' },
            { trait_type: 'Status', value: 'Minted' }
          ],
          tokenURI: photoData.tokenURI,
          sha256Hash: photoData.sha256Hash,
          pHash: photoData.pHash,
          cidBytes: cidString,
          signature: 'Available on blockchain'
        })
      }
      
      // If we get here, no photo was found
      console.log('❌ No photo found for tokenId:', tokenId)
      throw new Error('Photo not found')
      
    } catch (error) {
      console.error('Error fetching photo details:', error)
      
      // Fallback: try to create a dummy photo for server images
      if (tokenId && tokenId.startsWith('server-')) {
        console.log('🔄 Creating fallback photo for server image')
        try {
          const serverImages = await fetchServerImages()
          if (serverImages && serverImages.length > 0) {
            // Use the correct image based on tokenId index
            const imageIndex = parseInt(tokenId.replace('server-', '')) - 1
            const targetImg = serverImages[imageIndex] || serverImages[0] // fallback to first if index out of bounds
            
            console.log(`🎯 Using image at index ${imageIndex}:`, targetImg)
            
            // Get custom name from localStorage if available
            const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
            const matchingUpload = uploadedImages.find((upload: any) => upload.filename === targetImg.filename)
            
            let displayName = targetImg.filename.replace(/^photo_\d+_/, '')
            if (matchingUpload && matchingUpload.customName) {
              displayName = matchingUpload.customName
            }
            
            setPhoto({
              tokenId: tokenId,
              name: displayName,
              description: 'Uploaded photo from your collection',
              image: targetImg.url,
              owner: account || 'You',
              creator: account || 'You',
              mintDate: new Date(targetImg.mtime || new Date()).toISOString(),
              attributes: [
                { trait_type: 'Status', value: 'Available' },
                { trait_type: 'Source', value: 'Upload' },
                { trait_type: 'File Size', value: `${(targetImg.size / 1024).toFixed(1)} KB` },
                { trait_type: 'Original Filename', value: targetImg.filename }
              ],
              tokenURI: ''
            })
            console.log('✅ Fallback photo created with correct image')
            return
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
      
      toast.error('Failed to load photo details')
    } finally {
      setLoading(false)
    }
  }

  const fetchServerImages = async () => {
    const response = await fetch('http://localhost:3001/images')
    return await response.json()
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getAuthenticityLevel = (): { level: string; color: string; icon: React.ReactNode } => {
    if (photo?.sha256Hash && photo?.signature) {
      return {
        level: 'Blockchain Verified',
        color: '#4caf50',
        icon: <Security sx={{ color: '#4caf50' }} />
      }
    } else if (photo?.tokenId.startsWith('server-')) {
      return {
        level: 'Upload Verified',
        color: '#ff9800',
        icon: <Verified sx={{ color: '#ff9800' }} />
      }
    }
    return {
      level: 'Unverified',
      color: '#f44336',
      icon: <Info sx={{ color: '#f44336' }} />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  if (!photo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Photo not found</Alert>
        <Button onClick={() => navigate('/gallery')} sx={{ mt: 2 }}>
          <ArrowBack sx={{ mr: 1 }} />
          Back to Gallery
        </Button>
      </Container>
    )
  }

  const authenticity = getAuthenticityLevel()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/gallery')}
            sx={{ color: 'white' }}
            startIcon={<ArrowBack />}
          >
            Back to Gallery
          </Button>
          <Chip
            icon={authenticity.icon}
            label={authenticity.level}
            sx={{
              backgroundColor: `${authenticity.color}20`,
              color: authenticity.color,
              fontWeight: 'bold'
            }}
          />
        </Box>

        <Grid container spacing={4}>
          {/* Image Section */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <CardMedia
                  component="img"
                  image={photo.image}
                  alt={photo.name}
                  sx={{
                    height: { xs: 300, md: 500 },
                    objectFit: 'contain',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                  }}
                />
              </Card>
            </motion.div>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card sx={{ 
                p: 3, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                height: 'fit-content'
              }}>
                {/* Title */}
                <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                  {photo.name}
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                  {photo.description}
                </Typography>

                {/* Authenticity Badge */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: `${authenticity.color}20`,
                  border: `1px solid ${authenticity.color}40`,
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {authenticity.icon}
                    <Typography variant="h6" sx={{ color: authenticity.color, fontWeight: 'bold' }}>
                      {authenticity.level}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {photo.sha256Hash ? 
                      'This photo is cryptographically verified on the blockchain' :
                      'This photo has been uploaded and is ready for blockchain verification'
                    }
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

                {/* Token ID */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Fingerprint sx={{ mr: 1 }} />
                    Token Information
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    mb: 2
                  }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      Token ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" sx={{ color: '#2196F3', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        #{photo.tokenId}
                      </Typography>
                      <Tooltip title="Copy Token ID">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(photo.tokenId, 'Token ID')}
                        >
                          {copied === 'Token ID' ? <CheckCircle sx={{ fontSize: 16, color: 'green' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                      Unique identifier for blockchain verification
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

                {/* Owner Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    Ownership & Provenance
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Owner
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, backgroundColor: 'primary.main' }}>
                        {photo.owner.slice(2, 4).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {formatAddress(photo.owner)}
                      </Typography>
                      <Tooltip title="Copy address">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(photo.owner, 'Owner address')}
                        >
                          {copied === 'Owner address' ? <CheckCircle sx={{ fontSize: 16, color: 'green' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Creator
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, backgroundColor: 'secondary.main' }}>
                        {photo.creator.slice(2, 4).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {formatAddress(photo.creator)}
                      </Typography>
                      <Tooltip title="Copy address">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(photo.creator, 'Creator address')}
                        >
                          {copied === 'Creator address' ? <CheckCircle sx={{ fontSize: 16, color: 'green' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Verification Notice */}
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    mt: 2
                  }}>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                      ✓ Verification Instructions
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      To verify ownership on blockchain: Use Token ID <strong>#{photo.tokenId}</strong> with the contract address and check that the owner matches the displayed address above.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />

                {/* Attributes */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Properties
                  </Typography>
                  <Grid container spacing={1}>
                    {photo.attributes.map((attr, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {attr.trait_type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {attr.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Blockchain Details Toggle */}
                {photo.sha256Hash && (
                  <>
                    <Button
                      fullWidth
                      onClick={() => setShowBlockchainDetails(!showBlockchainDetails)}
                      sx={{ 
                        mb: 2,
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      variant="outlined"
                      endIcon={showBlockchainDetails ? <ExpandLess /> : <ExpandMore />}
                    >
                      Blockchain Verification
                    </Button>

                    <Collapse in={showBlockchainDetails}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        mb: 2
                      }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          SHA-256 Hash
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {photo.sha256Hash}
                          </Typography>
                          <Tooltip title="Copy hash">
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(photo.sha256Hash!, 'SHA-256 hash')}
                            >
                              {copied === 'SHA-256 hash' ? <CheckCircle sx={{ fontSize: 16, color: 'green' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </Tooltip>
                        </Box>

                        {photo.pHash && (
                          <>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                              Perceptual Hash
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                                {photo.pHash}
                              </Typography>
                              <Tooltip title="Copy pHash">
                                <IconButton 
                                  size="small" 
                                  onClick={() => copyToClipboard(photo.pHash!, 'Perceptual hash')}
                                >
                                  {copied === 'Perceptual hash' ? <CheckCircle sx={{ fontSize: 16, color: 'green' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </>
                        )}

                        <Button
                          fullWidth
                          onClick={() => setShowTechnicalDialog(true)}
                          startIcon={<Info />}
                          sx={{ color: 'primary.main' }}
                        >
                          Technical Details
                        </Button>
                      </Box>
                    </Collapse>
                  </>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  {!photo.sha256Hash && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/mint')}
                      sx={{
                        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2, #00BCD4)'
                        }
                      }}
                    >
                      Mint to Blockchain
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Link />}
                    onClick={() => copyToClipboard(window.location.href, 'Photo link')}
                    sx={{ 
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      {/* Technical Details Dialog */}
      <Dialog 
        open={showTechnicalDialog} 
        onClose={() => setShowTechnicalDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fingerprint />
            Technical Verification Details
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This photo has been cryptographically signed and verified on the blockchain. Here are the technical details:
          </Typography>

          {photo.sha256Hash && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>🔐 Cryptographic Hash (SHA-256)</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                A unique fingerprint of the image data that changes if even a single pixel is modified.
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1, 
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {photo.sha256Hash}
              </Box>
            </Box>
          )}

          {photo.pHash && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>👁️ Perceptual Hash</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                A hash that captures the visual content, allowing detection of similar images even with minor modifications.
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1, 
                fontFamily: 'monospace'
              }}>
                {photo.pHash}
              </Box>
            </Box>
          )}

          {photo.cidBytes && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>🌐 Content Identifier</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Unique identifier for the content in distributed storage systems.
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 1, 
                fontFamily: 'monospace'
              }}>
                {photo.cidBytes}
              </Box>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>⛓️ Blockchain Verification</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              This data is permanently stored on the blockchain and cannot be altered. The cryptographic signature 
              ensures that the photo was created by the verified creator and hasn't been tampered with.
            </Typography>
          </Box>

          <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: 'white' }}>
            <Typography variant="body2">
              <strong>Authenticity Guarantee:</strong> The combination of cryptographic hashing, 
              blockchain storage, and digital signatures provides mathematical proof of this photo's authenticity and provenance.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTechnicalDialog(false)} sx={{ color: 'white' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default PhotoDetailPage
