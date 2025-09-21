import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const app = express()

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Sample data for demo purposes (in production, use a database)
let images = [
  {
    id: 1,
    filename: 'sample-1.jpg',
    originalName: 'Professional Portrait',
    mimetype: 'image/jpeg',
    size: 2048576,
    uploadDate: new Date().toISOString(),
    sha256: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    path: '/sample-images/sample-1.jpg'
  },
  {
    id: 2,
    filename: 'sample-2.jpg',
    originalName: 'Landscape Photography',
    mimetype: 'image/jpeg',
    size: 3145728,
    uploadDate: new Date().toISOString(),
    sha256: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    path: '/sample-images/sample-2.jpg'
  },
  {
    id: 3,
    filename: 'sample-3.jpg',
    originalName: 'Street Photography',
    mimetype: 'image/jpeg',
    size: 1887436,
    uploadDate: new Date().toISOString(),
    sha256: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    path: '/sample-images/sample-3.jpg'
  }
]

// Configure multer for memory storage (Vercel doesn't support file system writes)
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'PhotoMint Image Server',
    timestamp: new Date().toISOString()
  })
})

// Get all images
app.get('/images', (req, res) => {
  try {
    res.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    res.status(500).json({ error: 'Failed to fetch images' })
  }
})

// Get specific image by ID
app.get('/images/:id', (req, res) => {
  try {
    const imageId = parseInt(req.params.id)
    const image = images.find(img => img.id === imageId)
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    res.json(image)
  } catch (error) {
    console.error('Error fetching image:', error)
    res.status(500).json({ error: 'Failed to fetch image' })
  }
})

// Upload new image
app.post('/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256')
    hash.update(req.file.buffer)
    const sha256 = hash.digest('hex')

    // Create new image record
    const newImage = {
      id: images.length + 1,
      filename: `photo_${Date.now()}_${req.file.originalname}`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      sha256: sha256,
      path: `/uploads/${req.file.filename}`,
      // Store base64 data for demo (in production, use cloud storage)
      data: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    }

    images.push(newImage)

    res.json({
      success: true,
      message: 'File uploaded successfully',
      image: newImage
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

// Delete image
app.delete('/images/:id', (req, res) => {
  try {
    const imageId = parseInt(req.params.id)
    const imageIndex = images.findIndex(img => img.id === imageId)
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    images.splice(imageIndex, 1)
    
    res.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

// Get image statistics
app.get('/stats', (req, res) => {
  try {
    const totalImages = images.length
    const totalSize = images.reduce((sum, img) => sum + img.size, 0)
    const avgSize = totalSize / totalImages || 0
    
    res.json({
      totalImages,
      totalSize,
      averageSize: avgSize,
      lastUpload: images.length > 0 ? images[images.length - 1].uploadDate : null
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// Vercel serverless function export
export default function handler(req, res) {
  return app(req, res)
}
