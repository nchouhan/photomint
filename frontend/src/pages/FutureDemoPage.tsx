import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  Slide,
  Zoom,
  CircularProgress,
  Grid,
  Avatar,
  Divider
} from '@mui/material'
import {
  PhotoCamera,
  Security,
  Verified,
  MonetizationOn,
  CloudUpload,
  Shield,
  TouchApp,
  Visibility,
  CropFree,
  Transform,
  CheckCircle,
  AutoAwesome,
  TrendingUp,
  Public,
  Lock
} from '@mui/icons-material'
import { keyframes } from '@mui/system'

// Animation keyframes
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const watermarkFloat = keyframes`
  0% { opacity: 0.3; transform: translateY(0px) rotate(0deg); }
  50% { opacity: 0.7; transform: translateY(-10px) rotate(2deg); }
  100% { opacity: 0.3; transform: translateY(0px) rotate(0deg); }
`

const FutureDemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWatermark, setShowWatermark] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(0)

  const demoSteps = [
    {
      title: "Capture Original Content",
      description: "Professional photographer captures a unique moment",
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      color: "#2196F3"
    },
    {
      title: "AI-Powered Signature",
      description: "Advanced AI creates unique cryptographic signature",
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      color: "#FF9800"
    },
    {
      title: "Invisible Watermark Applied",
      description: "Quantum-resistant watermark embedded invisibly",
      icon: <Security sx={{ fontSize: 40 }} />,
      color: "#4CAF50"
    },
    {
      title: "Blockchain Registration",
      description: "Content ownership recorded on immutable ledger",
      icon: <Lock sx={{ fontSize: 40 }} />,
      color: "#9C27B0"
    },
    {
      title: "Global Distribution",
      description: "Content distributed across platforms with protection",
      icon: <Public sx={{ fontSize: 40 }} />,
      color: "#00BCD4"
    },
    {
      title: "Monetization Ready",
      description: "Creators earn from every verified interaction",
      icon: <MonetizationOn sx={{ fontSize: 40 }} />,
      color: "#4CAF50"
    }
  ]

  const verificationScenarios = [
    { name: "Original", verified: true, revenue: "$24.50" },
    { name: "Resized 50%", verified: true, revenue: "$18.20" },
    { name: "Cropped", verified: true, revenue: "$15.80" },
    { name: "Filtered", verified: true, revenue: "$12.40" },
    { name: "Compressed", verified: true, revenue: "$8.90" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [currentStep])

  const handleLongPress = () => {
    setIsVerifying(true)
    setLongPressProgress(0)
    
    const interval = setInterval(() => {
      setLongPressProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsVerifying(false)
          setShowResults(true)
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setIsProcessing(false)
    setShowWatermark(false)
    setIsVerifying(false)
    setShowResults(false)
    setLongPressProgress(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          The Future of Digital Trust
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Invisible Protection • Instant Verification • Continuous Monetization
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Experience how tomorrow's creators will protect, verify, and monetize their digital assets 
          with quantum-resistant watermarking and blockchain-powered trust.
        </Typography>
      </Box>

      {/* Demo Journey */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield color="primary" />
          Creation to Monetization Journey
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {demoSteps.map((step, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Fade in={currentStep >= index} timeout={1000}>
                <Card sx={{
                  height: '100%',
                  background: currentStep >= index ? 
                    `linear-gradient(135deg, ${step.color}15 0%, ${step.color}05 100%)` : 
                    'rgba(0,0,0,0.02)',
                  border: currentStep === index ? `2px solid ${step.color}` : '1px solid rgba(0,0,0,0.1)',
                  transition: 'all 0.5s ease',
                  animation: currentStep === index ? `${pulse} 2s infinite` : 'none'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: step.color, width: 56, height: 56 }}>
                        {step.icon}
                      </Avatar>
                      {currentStep >= index && (
                        <Zoom in timeout={500}>
                          <CheckCircle sx={{ color: step.color, fontSize: 32 }} />
                        </Zoom>
                      )}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    {currentStep === index && (
                      <LinearProgress 
                        sx={{ mt: 2, borderRadius: 1 }} 
                        color="primary" 
                      />
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Interactive Watermark Demo */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Visibility color="primary" />
          Invisible Watermark Technology
        </Typography>
        
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer'
            }} onClick={() => setShowWatermark(!showWatermark)}>
              {/* Simulated Image */}
              <Box sx={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, #FFE66D, #FF6B6B)',
                borderRadius: '50%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }} />
              
              {/* Invisible Watermark Visualization */}
              {showWatermark && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
                  animation: `${watermarkFloat} 3s ease-in-out infinite`,
                  pointerEvents: 'none'
                }} />
              )}
              
              {/* Watermark indicator */}
              <Chip
                icon={<Security />}
                label="Quantum-Protected"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Next-Generation Protection
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Our quantum-resistant watermarking technology embeds invisible signatures that survive:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Resizing & Compression', 'Cropping & Rotation', 'Color Adjustments', 'Format Conversion', 'Social Media Processing'].map((feature, index) => (
                <Fade in timeout={1000 + index * 200} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle color="success" />
                    <Typography>{feature}</Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
            
            <Button
              variant="outlined"
              onClick={() => setShowWatermark(!showWatermark)}
              sx={{ mt: 3 }}
            >
              {showWatermark ? 'Hide' : 'Visualize'} Watermark Layer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Long Press Verification Demo */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TouchApp color="primary" />
          Instant Verification Experience
        </Typography>
        
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Long Press to Verify
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Future consumers will instantly verify content authenticity with a simple long press gesture.
            </Typography>
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onMouseDown={handleLongPress}
                disabled={isVerifying}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: isVerifying ? 
                    'conic-gradient(from 0deg, #2196F3, #21CBF3, #2196F3)' :
                    'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  position: 'relative',
                  animation: isVerifying ? `${pulse} 1s infinite` : 'none'
                }}
              >
                {isVerifying ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={longPressProgress} 
                      sx={{ color: 'white', mb: 1 }} 
                    />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Verifying...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <TouchApp sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">
                      Hold to Verify
                    </Typography>
                  </Box>
                )}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {showResults ? (
              <Fade in timeout={1000}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Verified />
                    Verification Complete
                  </Typography>
                  
                  <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #4CAF5015 0%, #4CAF5005 100%)' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Original Creator:</strong> Alex Chen Photography
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Creation Date:</strong> March 15, 2024
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>License:</strong> Commercial Use Permitted
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Authenticity:</strong> 99.97% Verified
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Revenue Sharing:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Creator: 70%</Typography>
                      <Typography variant="body2">Platform: 20%</Typography>
                      <Typography variant="body2">Network: 10%</Typography>
                    </Box>
                  </Paper>
                  
                  <Button
                    variant="outlined"
                    onClick={resetDemo}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Reset Demo
                  </Button>
                </Box>
              </Fade>
            ) : (
              <Box sx={{ opacity: 0.5 }}>
                <Typography variant="h6" gutterBottom>
                  Verification Results
                </Typography>
                <Typography variant="body2">
                  Complete the verification to see detailed authenticity information, 
                  creator details, and revenue sharing data.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Manipulation Resistance Demo */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Transform color="primary" />
          Manipulation Resistance
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Our technology maintains verification integrity even when content is modified:
        </Typography>
        
        <Grid container spacing={2}>
          {verificationScenarios.map((scenario, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Slide in timeout={1000 + index * 200} direction="up">
                <Card sx={{
                  textAlign: 'center',
                  p: 2,
                  background: scenario.verified ? 
                    'linear-gradient(135deg, #4CAF5015 0%, #4CAF5005 100%)' : 
                    'linear-gradient(135deg, #F4433615 0%, #F4433605 100%)',
                  border: scenario.verified ? '1px solid #4CAF50' : '1px solid #F44336'
                }}>
                  <Avatar sx={{
                    mx: 'auto',
                    mb: 1,
                    bgcolor: scenario.verified ? 'success.main' : 'error.main'
                  }}>
                    {scenario.verified ? <CheckCircle /> : <CropFree />}
                  </Avatar>
                  <Typography variant="subtitle2" gutterBottom>
                    {scenario.name}
                  </Typography>
                  <Chip
                    label={scenario.verified ? 'Verified' : 'Failed'}
                    color={scenario.verified ? 'success' : 'error'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {scenario.verified && (
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {scenario.revenue}
                    </Typography>
                  )}
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <TrendingUp color="success" />
            Total Creator Revenue: $79.80
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Continuous monetization from every verified interaction across all platforms
          </Typography>
        </Box>
      </Paper>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Ready to Secure the Future of Digital Content?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Join the revolution of trustable, monetizable digital assets
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            px: 4,
            py: 1.5
          }}
        >
          Get Early Access
        </Button>
      </Box>
    </Container>
  )
}

export default FutureDemoPage
