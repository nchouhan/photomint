import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  PhotoCamera,
  Security,
  Verified,
  CloudUpload,
  AccountBalanceWallet,
  Timeline,
  TrendingUp,
  PhotoLibrary
} from '@mui/icons-material'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const features = [
    {
      icon: Security,
      title: 'Cryptographic Proof',
      description: 'SHA-256 hashing and digital signatures ensure your photos cannot be forged or tampered with.',
      color: '#4285f4'
    },
    {
      icon: PhotoLibrary,
      title: 'Perceptual Matching',
      description: 'Advanced pHash technology detects near-duplicates even when images are resized or compressed.',
      color: '#34a853'
    },
    {
      icon: CloudUpload,
      title: 'IPFS Storage',
      description: 'Decentralized storage ensures your photos are permanently accessible and tamper-proof.',
      color: '#ea4335'
    },
    {
      icon: Verified,
      title: 'NFT Certification',
      description: 'Mint your photos as NFTs with embedded authenticity data for permanent ownership proof.',
      color: '#fbbc04'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Photos Authenticated' },
    { number: '5K+', label: 'NFTs Minted' },
    { number: '99.9%', label: 'Accuracy Rate' },
    { number: '2.5s', label: 'Average Process Time' }
  ]

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  mb: 3,
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Authenticate Your{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Photos
                </Box>
                {' '}on the Blockchain
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  lineHeight: 1.6,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Protect your digital photography with cryptographic proof of ownership. 
                Mint NFTs with embedded authenticity data and prevent unauthorized copying.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/mint')}
                    startIcon={<PhotoCamera />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4285f4, #34a853)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #3367d6, #2d8f40)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Start Minting
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/verify')}
                    startIcon={<Verified />}
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Verify Photo
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 120, color: 'rgba(255,255,255,0.8)' }} />
                </motion.div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', top: 50, right: 50 }}
                >
                  <Avatar sx={{ bgcolor: '#4285f4', width: 60, height: 60 }}>
                    <Security />
                  </Avatar>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', bottom: 50, left: 50 }}
                >
                  <Avatar sx={{ bgcolor: '#34a853', width: 60, height: 60 }}>
                    <Verified />
                  </Avatar>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <CardContent sx={{ py: 4 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 1
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              color: 'white',
              fontWeight: 600,
              mb: 2,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            Powered by Advanced Technology
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.8)',
              mb: 6,
              maxWidth: 600,
              mx: 'auto',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Our cutting-edge blockchain technology ensures your photos are protected 
            with military-grade security and permanent ownership records.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Avatar
                        sx={{
                          bgcolor: feature.color,
                          width: 64,
                          height: 64,
                          mb: 3
                        }}
                      >
                        <Icon sx={{ fontSize: 32 }} />
                      </Avatar>
                      
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: theme.palette.text.primary
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 600,
              mb: 3,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            Ready to Protect Your Photography?
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Join thousands of photographers who trust PhotoMint to secure their digital assets.
          </Typography>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/mint')}
              startIcon={<AccountBalanceWallet />}
              sx={{
                px: 6,
                py: 3,
                fontSize: '1.2rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFC107, #FF8F00)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
            >
              Get Started Now
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  )
}

export default LandingPage
