import React from 'react'
import { motion } from 'framer-motion'
import { Box, Typography } from '@mui/material'
import { PhotoCamera } from '@mui/icons-material'

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <PhotoCamera 
            sx={{ 
              fontSize: 80, 
              color: 'white',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }} 
          />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 600,
            mt: 3,
            mb: 1,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          PhotoMint
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          Blockchain Photo Authentication
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{ marginTop: 40 }}
      >
        <Box
          sx={{
            width: 60,
            height: 4,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{ x: [-60, 60] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            style={{
              width: 30,
              height: '100%',
              background: 'white',
              borderRadius: 2
            }}
          />
        </Box>
      </motion.div>
    </Box>
  )
}

export default LoadingScreen
