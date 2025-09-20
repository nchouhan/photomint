// Simple image server for development
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const app = express()
const port = 3001

// Enable CORS for frontend
app.use(cors())
app.use(express.json())

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  console.log('Created uploads directory:', UPLOAD_DIR)
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const filename = `photo_${timestamp}_${file.originalname}`
    cb(null, filename)
  }
})

const upload = multer({ storage })

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const imageInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      timestamp: Date.now(),
      url: `http://localhost:${port}/image/${req.file.filename}`
    }

    console.log('📸 Image uploaded:', imageInfo.filename)
    res.json(imageInfo)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// Serve images
app.get('/image/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(UPLOAD_DIR, filename)
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ error: 'Image not found' })
  }
})

// List all images
app.get('/images', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR)
    const images = files
      .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(filename => ({
        filename,
        url: `http://localhost:${port}/image/${filename}`,
        path: path.join(UPLOAD_DIR, filename)
      }))
    
    res.json(images)
  } catch (error) {
    console.error('Error listing images:', error)
    res.status(500).json({ error: 'Failed to list images' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uploadDir: UPLOAD_DIR })
})

app.listen(port, () => {
  console.log(`🖼️  Image server running on http://localhost:${port}`)
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`)
  console.log(`🔗 Upload endpoint: http://localhost:${port}/upload`)
  console.log(`📋 List images: http://localhost:${port}/images`)
})

module.exports = app
