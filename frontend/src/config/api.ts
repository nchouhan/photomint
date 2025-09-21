// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const IMAGE_SERVER_URL = import.meta.env.VITE_IMAGE_SERVER_URL || 'http://localhost:3001'
const WATERMARK_SERVICE_URL = import.meta.env.VITE_WATERMARK_SERVICE_URL || 'http://localhost:5001'

export const API_ENDPOINTS = {
  // Image Server
  IMAGES: `${IMAGE_SERVER_URL}/images`,
  IMAGE_UPLOAD: `${IMAGE_SERVER_URL}/upload`,
  IMAGE_STATS: `${IMAGE_SERVER_URL}/stats`,
  IMAGE_HEALTH: `${IMAGE_SERVER_URL}/health`,
  
  // Watermark Service
  WATERMARK_EMBED: `${WATERMARK_SERVICE_URL}/embed`,
  WATERMARK_EXTRACT: `${WATERMARK_SERVICE_URL}/extract`,
  WATERMARK_VERIFY: `${WATERMARK_SERVICE_URL}/verify`,
  WATERMARK_HEALTH: `${WATERMARK_SERVICE_URL}/health`,
}

// Feature flags
export const FEATURES = {
  ENABLE_WATERMARKING: import.meta.env.VITE_ENABLE_WATERMARKING === 'true',
  ENABLE_BLOCKCHAIN: import.meta.env.VITE_ENABLE_BLOCKCHAIN === 'true',
  ENABLE_IPFS: import.meta.env.VITE_ENABLE_IPFS === 'true',
}

// Network configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(import.meta.env.VITE_NETWORK_CHAIN_ID || '31337'),
  NETWORK_NAME: import.meta.env.VITE_NETWORK_NAME || 'localhost',
  RPC_URL: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
}

export default API_ENDPOINTS
