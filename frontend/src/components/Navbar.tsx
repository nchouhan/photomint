import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  PhotoCamera,
  AccountBalanceWallet,
  VerifiedUser,
  Collections,
  Menu as MenuIcon,
  Close,
  AutoAwesome
} from '@mui/icons-material'
import { useWeb3Context } from '../contexts/Web3Context'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3Context()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletMenuAnchor, setWalletMenuAnchor] = useState<null | HTMLElement>(null)

  const navItems = [
    { label: 'Home', path: '/', icon: PhotoCamera },
    { label: 'Mint', path: '/mint', icon: PhotoCamera },
    { label: 'Verify', path: '/verify', icon: VerifiedUser },
    { label: 'Gallery', path: '/gallery', icon: Collections },
    { label: 'Future', path: '/future', icon: AutoAwesome },
  ]

  const handleWalletClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isConnected) {
      setWalletMenuAnchor(event.currentTarget)
    } else {
      connectWallet()
    }
  }

  const handleWalletMenuClose = () => {
    setWalletMenuAnchor(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <PhotoCamera sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 32 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #4285f4, #34a853)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}
            >
              PhotoMint
            </Typography>
          </Box>
        </motion.div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Button
                    onClick={() => navigate(item.path)}
                    startIcon={<Icon />}
                    sx={{
                      mx: 0.5,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      fontWeight: isActive ? 600 : 400,
                      position: 'relative',
                      '&::after': isActive ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: 3,
                        background: theme.palette.primary.main,
                        borderRadius: 2,
                      } : {},
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              )
            })}
          </Box>
        )}

        {/* Wallet Connection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={isConnected ? "outlined" : "contained"}
              onClick={handleWalletClick}
              startIcon={isConnected ? <Avatar sx={{ width: 24, height: 24 }} /> : <AccountBalanceWallet />}
              sx={{
                borderRadius: 20,
                px: 3,
                color: isConnected ? theme.palette.primary.main : 'white',
                fontWeight: 600,
              }}
            >
              {isConnected ? formatAddress(account!) : 'Connect Wallet'}
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ ml: 1 }}
            >
              {mobileMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>

        {/* Wallet Menu */}
        <Menu
          anchorEl={walletMenuAnchor}
          open={Boolean(walletMenuAnchor)}
          onClose={handleWalletMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
            }
          }}
        >
          <MenuItem disabled>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="caption" color="text.secondary">
                Connected Account
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {account && formatAddress(account)}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { disconnectWallet(); handleWalletMenuClose(); }}>
            Disconnect
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ px: 2, pb: 2, background: 'rgba(255, 255, 255, 0.98)' }}>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Button
                    key={item.path}
                    fullWidth
                    onClick={() => {
                      navigate(item.path)
                      setMobileMenuOpen(false)
                    }}
                    startIcon={<Icon />}
                    sx={{
                      justifyContent: 'flex-start',
                      my: 0.5,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </AppBar>
  )
}

export default Navbar
