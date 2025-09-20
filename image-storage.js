// Simple image storage service for development
const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads')

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  console.log('Created uploads directory:', UPLOAD_DIR)
}

// Function to save uploaded image
function saveImage(buffer, filename) {
  const filePath = path.join(UPLOAD_DIR, filename)
  fs.writeFileSync(filePath, buffer)
  console.log('Saved image:', filePath)
  return filePath
}

// Function to get image
function getImage(filename) {
  const filePath = path.join(UPLOAD_DIR, filename)
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath)
  }
  return null
}

// Function to list all images
function listImages() {
  if (!fs.existsSync(UPLOAD_DIR)) return []
  return fs.readdirSync(UPLOAD_DIR).filter(file => 
    file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  )
}

module.exports = {
  saveImage,
  getImage,
  listImages,
  UPLOAD_DIR
}

if (require.main === module) {
  console.log('Image storage service')
  console.log('Upload directory:', UPLOAD_DIR)
  console.log('Existing images:', listImages())
}
