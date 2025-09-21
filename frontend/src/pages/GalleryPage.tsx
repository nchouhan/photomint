import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Collections,
  Verified,
  Share,
  Favorite,
  FavoriteBorder,
  Visibility,
  Search,
  FilterList,
  AccountBalanceWallet,
  PhotoCamera,
  Close,
  OpenInNew,
  Refresh
} from '@mui/icons-material'
import { useWeb3Context } from '../contexts/Web3Context'
import toast from 'react-hot-toast'

interface NFTItem {
  tokenId: string
  name: string
  description: string
  image: string
  owner: string
  creator: string
  mintDate: string
  attributes: Array<{ trait_type: string; value: string }>
  isLiked: boolean
  views: number
  tokenURI?: string
}

const GalleryPage: React.FC = () => {
  const { isConnected, account, contract } = useWeb3Context()
  const navigate = useNavigate()
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([])
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMyNfts, setShowMyNfts] = useState(false)
  const [totalSupply, setTotalSupply] = useState(0)

  // Debug function to clear localStorage
  const clearStoredImages = () => {
    localStorage.removeItem('uploadedImages')
    console.log('🗑️ Cleared stored images from localStorage')
    toast.success('Cleared stored images')
  }

  // Fetch NFTs from blockchain
  const fetchNFTs = async () => {
    if (!contract || !isConnected) {
      console.log('❌ No contract or not connected')
      console.log('Contract:', contract)
      console.log('IsConnected:', isConnected)
      console.log('Account:', account)
      setNfts([])
      return
    }

    setLoading(true)
    console.log('🔍 Fetching NFTs from blockchain...')
    console.log('Contract address:', contract.target || contract.address)
    console.log('Connected account:', account)
    console.log('Expected contract address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
    console.log('Expected account with NFT: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    
    // Debug uploaded images in localStorage
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
    console.log('📂 Uploaded images in localStorage:', uploadedImages)
    
    // Also fetch images from server
    try {
      const serverResponse = await fetch('http://localhost:3001/images')
      const serverImages = await serverResponse.json()
      console.log('🖥️ Images on server:', serverImages)
    } catch (error) {
      console.log('❌ Could not fetch server images:', error)
    }
    
    try {
      // Get total supply (we'll estimate based on recent transactions)
      // For now, let's check tokens 1-10 to see what exists
      const nftList: NFTItem[] = []
      
      for (let tokenId = 1; tokenId <= 10; tokenId++) {
        try {
          console.log(`Checking token ${tokenId}...`)
          const photo = await contract.photos(tokenId)
          const owner = await contract.ownerOf(tokenId)
          
          console.log(`Token ${tokenId}:`, { creator: photo.creator, owner })
          
          // Skip if no data (token doesn't exist)
          if (photo.creator === '0x0000000000000000000000000000000000000000') {
            console.log(`Token ${tokenId} doesn't exist, skipping`)
            continue
          }

          // Get the actual image from localStorage (development mode)
          let actualImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' // Default fallback
          let tokenName = `PhotoMint Token #${tokenId}`
          
          try {
            // Extract CID/filename from cidBytes
            const cidString = new TextDecoder().decode(photo.cidBytes)
            console.log(`🔍 Token ${tokenId} raw cidBytes:`, photo.cidBytes)
            console.log(`🔍 Token ${tokenId} decoded CID/filename:`, cidString)
            
            // Look for the image in localStorage
            const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
            console.log(`📂 All uploaded images:`, uploadedImages.map(img => ({ filename: img.filename, originalName: img.originalName })))
            
            // Try different matching strategies
            let matchingImage = uploadedImages.find((img: any) => img.filename === cidString)
            
            if (!matchingImage) {
              // Try partial match (in case of encoding differences)
              matchingImage = uploadedImages.find((img: any) => cidString.includes(img.filename) || img.filename.includes(cidString))
            }
            
            if (!matchingImage && uploadedImages.length > 0) {
              // As fallback, use the most recent image
              matchingImage = uploadedImages[uploadedImages.length - 1]
              console.log(`⚠️ Using most recent image as fallback for token ${tokenId}`)
            }
            
            if (matchingImage) {
              actualImage = matchingImage.url || matchingImage.base64Data || matchingImage.localUrl // Support all formats
              tokenName = `Photo: ${matchingImage.originalName}`
              console.log(`✅ Found local image for token ${tokenId}:`, matchingImage.originalName)
              console.log(`🖼️ Using image URL:`, actualImage)
              console.log(`📁 Server path:`, matchingImage.serverPath)
            } else {
              console.log(`❌ No local image found for token ${tokenId}, using fallback`)
              console.log(`🔍 Looking for CID: "${cidString}"`)
              console.log(`📂 Available filenames:`, uploadedImages.map(img => img.filename))
            }
          } catch (error) {
            console.log(`❌ Error getting image for token ${tokenId}:`, error)
          }
          
          // Create metadata with actual image
          const metadata = {
            name: tokenName,
            description: 'Authenticated photo from PhotoMint',
            image: actualImage,
            attributes: [
              { trait_type: 'Token ID', value: tokenId.toString() },
              { trait_type: 'Authenticated', value: 'Yes' },
              { trait_type: 'Creator', value: photo.creator }
            ]
          }

          const nftItem: NFTItem = {
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            owner: owner,
            creator: photo.creator,
            mintDate: new Date().toISOString(), // In real app, get from blockchain
            attributes: metadata.attributes,
            isLiked: false,
            views: Math.floor(Math.random() * 1000) + 100,
            tokenURI: photo.tokenURI
          }

          nftList.push(nftItem)
          console.log(`✅ Added token ${tokenId} to list`)
        } catch (error) {
          // Token doesn't exist, continue
          console.log(`Token ${tokenId} doesn't exist:`, error.message)
          continue
        }
      }

      // Always try to show server images as well, regardless of blockchain NFTs
      let showServerImages = false;
      if (nftList.length === 0) {
        showServerImages = true;
      } else {
        // Check if any blockchain NFTs actually have valid images
        const hasValidImages = nftList.some(nft => nft.image && !nft.image.includes('unsplash.com'));
        if (!hasValidImages) {
          console.log('🔄 Blockchain NFTs found but no valid images, showing server images instead');
          showServerImages = true;
          nftList.length = 0; // Clear blockchain NFTs to show server images
        }
      }
      
      if (showServerImages) {
        try {
          const serverResponse = await fetch('http://localhost:3001/images')
          const serverImages = await serverResponse.json()
          console.log('📸 Showing server images (actual uploaded photos)')
          
          const fallbackNfts = serverImages.map((img: any, index: number) => {
            // Find matching image in localStorage to get custom name
            const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]')
            const matchingUpload = uploadedImages.find((upload: any) => upload.filename === img.filename)
            
            // Use custom name if available, otherwise extract from filename
            let displayName = img.filename.replace(/^photo_\d+_/, ''); // Default: remove timestamp
            if (matchingUpload && matchingUpload.customName) {
              displayName = matchingUpload.customName;
            }
            
            return {
              tokenId: `server-${index + 1}`,
              name: displayName,
              description: 'Your uploaded photo',
              image: img.url,
              owner: account || 'You',
              creator: account || 'You',
              mintDate: new Date().toISOString(),
              attributes: [
                { trait_type: 'Source', value: 'Your Upload' },
                { trait_type: 'Status', value: 'Ready' },
                { trait_type: 'Original Filename', value: img.filename }
              ],
              isLiked: false,
              views: Math.floor(Math.random() * 100) + 50,
              tokenURI: ''
            }
          })
          
          setNfts(fallbackNfts)
          setTotalSupply(fallbackNfts.length)
          toast.success(`Found ${fallbackNfts.length} uploaded photos`)
        } catch (error) {
          console.log('Could not fetch server images:', error)
        }
      } else {
        console.log(`🎉 Found ${nftList.length} NFTs total`)
        setNfts(nftList)
        setTotalSupply(nftList.length)
        toast.success(`Found ${nftList.length} NFTs`)
      }
    } catch (error) {
      console.error('Error fetching NFTs:', (error as Error).message || error)
      toast.error('Failed to fetch NFTs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTs()
  }, [contract, isConnected])

  useEffect(() => {
    // Filter NFTs based on search and ownership
    let filtered = nfts.filter(nft =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (showMyNfts && isConnected) {
      filtered = filtered.filter(nft => 
        nft.owner.toLowerCase() === account?.toLowerCase() ||
        nft.creator.toLowerCase() === account?.toLowerCase()
      )
    }

    setFilteredNfts(filtered)
  }, [searchQuery, showMyNfts, nfts, isConnected, account])

  const handleLike = (tokenId: string) => {
    setNfts(prev => prev.map(nft =>
      nft.tokenId === tokenId ? { ...nft, isLiked: !nft.isLiked } : nft
    ))
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isOwner = (nft: NFTItem) => {
    return isConnected && (
      nft.owner.toLowerCase() === account?.toLowerCase() ||
      nft.creator.toLowerCase() === account?.toLowerCase()
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 600,
                mb: 1,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              PhotoMint Gallery
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {totalSupply > 0 ? `${totalSupply} authenticated photos` : 'Explore authenticated photos and their ownership history'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchNFTs}
              disabled={loading}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={clearStoredImages}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Clear Cache
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ mb: 4, background: 'rgba(255,255,255,0.95)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant={showMyNfts ? "contained" : "outlined"}
                onClick={() => setShowMyNfts(!showMyNfts)}
                startIcon={<AccountBalanceWallet />}
                disabled={!isConnected}
              >
                My NFTs ({nfts.filter(nft => isOwner(nft)).length})
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FilterList />}
              >
                Filter
              </Button>
            </Box>

            {!isConnected && showMyNfts && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Connect your wallet to view your NFTs
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* NFT Grid */}
      {!loading && (
        <AnimatePresence>
          <Grid container spacing={3}>
            {filteredNfts.map((nft, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={nft.tokenId}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.95)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => navigate(`/photo/${nfts[index]?.tokenId}`)}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={nft.image}
                        alt={nft.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      
                      {/* Overlay with verified badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0,0,0,0.7)',
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        <Verified sx={{ fontSize: 20, color: '#4285f4' }} />
                      </Box>
                      
                      {/* Like button */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': {
                            background: 'rgba(0,0,0,0.8)'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(nft.tokenId)
                        }}
                      >
                        {nft.isLiked ? <Favorite sx={{ color: '#ea4335' }} /> : <FavoriteBorder />}
                      </IconButton>
                      
                      {/* Owner badge */}
                      {isOwner(nft) && (
                        <Chip
                          label="Owned"
                          size="small"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                    
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {nft.name}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          height: 40,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {nft.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Token #{nft.tokenId}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {nft.views}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && filteredNfts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 0' }}
        >
          <PhotoCamera sx={{ fontSize: 80, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
            {searchQuery ? 'No photos found' : 'No photos in gallery'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Be the first to mint an authenticated photo!'
            }
          </Typography>
          {!isConnected && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/mint'}
            >
              Start Minting
            </Button>
          )}
        </motion.div>
      )}

      {/* NFT Detail Modal */}
      <Dialog
        open={!!selectedNft}
        onClose={() => setSelectedNft(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {selectedNft && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedNft.name}
                </Typography>
                <IconButton onClick={() => setSelectedNft(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <img
                src={selectedNft.image}
                alt={selectedNft.name}
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain'
                }}
              />
              
              <Box sx={{ p: 3 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedNft.description}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Token ID:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{selectedNft.tokenId}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Views:</Typography>
                        <Typography variant="body2">{selectedNft.views}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Mint Date:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedNft.mintDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Ownership
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Owner:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(selectedNft.owner)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Creator:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(selectedNft.creator)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {selectedNft.attributes.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Attributes
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedNft.attributes.map((attr, index) => (
                        <Chip
                          key={index}
                          label={`${attr.trait_type}: ${attr.value}`}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
                
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied to clipboard')
                    }}
                  >
                    Share
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    onClick={() => window.open(`https://opensea.io/assets/ethereum/${selectedNft.tokenId}`)}
                  >
                    View on OpenSea
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={selectedNft.isLiked ? <Favorite /> : <FavoriteBorder />}
                    onClick={() => handleLike(selectedNft.tokenId)}
                    color={selectedNft.isLiked ? "error" : "primary"}
                  >
                    {selectedNft.isLiked ? 'Liked' : 'Like'}
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default GalleryPage