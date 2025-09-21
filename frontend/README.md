# 📸 PhotoMint Frontend

A modern, Google Material Design-inspired frontend for the PhotoMint blockchain photo authentication platform.

## ✨ Features

- **🎨 Modern UI**: Google Material Design with smooth animations
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **⚡ Fast**: Built with Vite for lightning-fast development and builds
- **🔗 Web3 Integration**: Connect with MetaMask and other wallets
- **🖼️ Photo Upload**: Drag-and-drop interface with preview
- **🔐 Authentication**: Cryptographic photo verification
- **🎯 NFT Minting**: Step-by-step minting process with progress tracking
- **🔍 Verification**: Photo authenticity verification tools
- **🖼️ Gallery**: Beautiful NFT gallery with filtering and search

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension
- Running PhotoMint blockchain (see parent directory)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Environment Configuration

Update `.env` with your configuration:

```env
# Your deployed contract address
VITE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Local Hardhat network
VITE_CHAIN_ID=31337
VITE_RPC_URL=http://127.0.0.1:8545

# Optional: IPFS configuration
VITE_IPFS_PROJECT_ID=your_infura_project_id
VITE_IPFS_PROJECT_SECRET=your_infura_project_secret
```

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Animations**: Framer Motion
- **Web3**: Ethers.js v6
- **State Management**: React Context
- **Styling**: Emotion (CSS-in-JS)
- **File Upload**: React Dropzone

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingScreen.tsx
│   └── Navbar.tsx
├── contexts/           # React contexts
│   └── Web3Context.tsx
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── MintPage.tsx
│   ├── VerifyPage.tsx
│   └── GalleryPage.tsx
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## 🎨 Design System

### Color Palette

- **Primary**: #4285f4 (Google Blue)
- **Secondary**: #34a853 (Google Green)
- **Error**: #ea4335 (Google Red)
- **Warning**: #fbbc04 (Google Yellow)

### Typography

- **Font Family**: Google Sans, Roboto, Helvetica, Arial
- **Headings**: Google Sans (weights: 400, 500, 600, 700)
- **Body**: Roboto (weights: 300, 400, 500)

### Components

All components follow Google Material Design principles with:
- Consistent spacing (8px grid)
- Smooth transitions and micro-interactions
- Elevation and shadow system
- Responsive breakpoints

## 🔌 Web3 Integration

### Wallet Connection

The app supports:
- MetaMask
- WalletConnect
- Other Web3 wallets

### Smart Contract Integration

- Automatic contract detection
- Transaction status tracking
- Error handling with user-friendly messages
- Gas estimation and optimization

### Network Support

- Local Hardhat network (development)
- Ethereum testnets (Sepolia, Goerli)
- Mainnet ready (update contract address)

## 📱 Pages Overview

### 🏠 Landing Page
- Hero section with animated elements
- Feature highlights
- Statistics dashboard
- Call-to-action buttons

### 🎨 Mint Page
- Drag-and-drop photo upload
- Photo metadata input
- Progress stepper
- Real-time transaction status
- Success confirmation

### 🔍 Verify Page
- Photo upload verification
- Token ID lookup
- Authenticity results
- Ownership history

### 🖼️ Gallery Page
- NFT grid display
- Search and filtering
- Detailed NFT modals
- Ownership indicators

## 🎭 Animations

### Framer Motion Features

- **Page Transitions**: Smooth route changes
- **Micro-interactions**: Button hovers, card lifts
- **Loading States**: Skeleton screens, spinners
- **Gesture Support**: Drag interactions
- **Scroll Animations**: Reveal on scroll

### Performance

- Optimized animations with `will-change`
- Reduced motion support
- 60fps smooth animations
- GPU acceleration

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Material-UI best practices

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

## 🔐 Security

- Environment variable validation
- Input sanitization
- XSS protection
- HTTPS enforcement in production
- Web3 transaction validation

## 🎯 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 Support

For issues and questions:
1. Check the parent project README
2. Review blockchain connection
3. Verify environment variables
4. Check browser console for errors

---

**Built with ❤️ using Google Material Design principles**