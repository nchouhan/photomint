# PhotoMint Vercel Deployment Guide

This guide will help you deploy the PhotoMint application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Node.js 18+**: Ensure you have Node.js 18 or higher

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (use root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`

#### Option B: Deploy via Vercel CLI
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

#### Required Variables:
```
NODE_ENV=production
VITE_API_BASE_URL=https://your-deployment.vercel.app/api
VITE_IMAGE_SERVER_URL=https://your-deployment.vercel.app/api/images
VITE_WATERMARK_SERVICE_URL=https://your-deployment.vercel.app/api/watermark
```

#### Blockchain Variables (for demo):
```
VITE_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_NETWORK_NAME=localhost
VITE_NETWORK_CHAIN_ID=31337
VITE_RPC_URL=http://localhost:8545
```

#### Feature Flags:
```
VITE_ENABLE_WATERMARKING=true
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_IPFS=false
```

### Step 4: Update URLs After Deployment

After your first deployment, update the environment variables with your actual Vercel URL:

1. Replace `your-deployment.vercel.app` with your actual Vercel domain
2. Redeploy to apply changes

## 📁 Project Structure for Vercel

```
photomint/
├── api/                    # Vercel serverless functions
│   ├── images.js          # Image server API
│   └── watermark.py       # Watermark service API
├── frontend/              # React frontend
│   ├── dist/             # Build output
│   ├── src/              # Source code
│   └── vercel.json       # Frontend-specific config
├── vercel.json           # Main Vercel configuration
└── package.json          # Root package.json
```

## 🔧 Configuration Files

### `vercel.json` (Root)
- Configures the entire project deployment
- Routes API calls to serverless functions
- Serves frontend from `/frontend/dist`

### `frontend/vercel.json`
- Frontend-specific configuration
- Handles SPA routing
- Sets security headers

### `package.json` (Root)
- Contains build scripts for Vercel
- Manages dependencies

## 🛠️ API Endpoints

After deployment, your APIs will be available at:

- **Image Server**: `https://your-deployment.vercel.app/api/images`
- **Watermark Service**: `https://your-deployment.vercel.app/api/watermark`
- **Frontend**: `https://your-deployment.vercel.app`

## ✅ Post-Deployment Checklist

1. **Test Frontend**: Visit your Vercel URL and test navigation
2. **Test APIs**: 
   - `GET /api/images` - Should return sample images
   - `GET /api/watermark/health` - Should return health status
3. **Test Features**:
   - Photo upload functionality
   - Watermark embedding/extraction
   - Future demo page
4. **Update Environment Variables**: Replace placeholder URLs with actual Vercel URLs

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version (must be 18+)
   - Verify all dependencies are in `package.json`
   - Check build logs in Vercel dashboard

2. **API Errors**:
   - Verify serverless function paths
   - Check function timeouts (max 30s)
   - Review function logs in Vercel

3. **Frontend Issues**:
   - Ensure environment variables are set
   - Check CSP headers are configured
   - Verify SPA routing is working

4. **CORS Issues**:
   - API functions include CORS headers
   - Check allowed origins in production

### Debug Commands:

```bash
# Test build locally
npm run build

# Test frontend build
cd frontend && npm run build

# Check Vercel logs
vercel logs your-deployment.vercel.app
```

## 🚀 Production Considerations

### For Production Deployment:

1. **Use Real Blockchain Network**:
   - Deploy contract to testnet/mainnet
   - Update contract address
   - Configure proper RPC URLs

2. **Add Database**:
   - Replace in-memory storage with Vercel Postgres/MongoDB
   - Update API functions to use database

3. **Add Authentication**:
   - Implement user authentication
   - Add API rate limiting
   - Secure sensitive endpoints

4. **File Storage**:
   - Use Vercel Blob or AWS S3 for file storage
   - Update upload endpoints

5. **Monitoring**:
   - Set up error tracking (Sentry)
   - Configure monitoring alerts
   - Add analytics

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [React on Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Environment Variables on Vercel](https://vercel.com/docs/projects/environment-variables)

## 🆘 Need Help?

If you encounter issues:

1. Check Vercel dashboard logs
2. Review function and build logs
3. Test APIs using the debug tools provided
4. Contact support through Vercel dashboard
