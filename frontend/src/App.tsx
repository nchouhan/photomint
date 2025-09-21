import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Box } from '@mui/material'

// Pages
import LandingPage from './pages/LandingPage'
import MintPage from './pages/MintPage'
import VerifyPage from './pages/VerifyPage'
import GalleryPage from './pages/GalleryPage'
import PhotoDetailPage from './pages/PhotoDetailPage'
import FutureDemoPage from './pages/FutureDemoPage'

// Components
import Navbar from './components/Navbar'
import LoadingScreen from './components/LoadingScreen'

// Contexts
import { Web3Provider } from './contexts/Web3Context'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Quick initialization for debugging
    console.log('🚀 App initializing...')
    const timer = setTimeout(() => {
      console.log('✅ App loaded, removing loading screen')
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Web3Provider>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Navbar />
        
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/mint" element={<MintPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/photo/:tokenId" element={<PhotoDetailPage />} />
              <Route path="/future" element={<FutureDemoPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Web3Provider>
  )
}

export default App