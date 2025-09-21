#!/bin/bash

echo "🚀 PhotoMint Vercel Deployment Script"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "📝 Please log in to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update environment variables in Vercel dashboard with your deployment URL"
    echo "2. Test all functionality on the deployed site"
    echo "3. Update README with your live URL"
    echo ""
    echo "🔗 Visit your Vercel dashboard: https://vercel.com/dashboard"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
