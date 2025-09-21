#!/bin/bash

# PhotoMint Complete Watermarking System Startup
# This script starts all components needed for watermarked minting

echo "🛡️ Starting PhotoMint Watermarking System..."
echo "=============================================="

# Function to check if a port is in use
check_port() {
    lsof -i:$1 >/dev/null 2>&1
}

# Function to start service in background and track PID
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local log_file=$4
    
    echo "🚀 Starting $name..."
    
    if [ ! -z "$port" ] && check_port $port; then
        echo "⚠️  Port $port already in use, checking if $name is already running..."
        return 0
    fi
    
    nohup $command > $log_file 2>&1 &
    local pid=$!
    echo $pid > ".${name,,}_pid"
    echo "✅ $name started (PID: $pid, Port: $port)"
    
    # Wait a moment for service to start
    sleep 2
    
    # Check if still running
    if ! kill -0 $pid 2>/dev/null; then
        echo "❌ $name failed to start. Check $log_file for errors."
        return 1
    fi
}

# Create logs directory
mkdir -p logs

echo ""
echo "1️⃣ Starting Hardhat Blockchain Network..."
if check_port 8545; then
    echo "✅ Blockchain already running on port 8545"
else
    start_service "Blockchain" "npm run node" 8545 "logs/blockchain.log"
fi

echo ""
echo "2️⃣ Starting Image Server..."
if check_port 3001; then
    echo "✅ Image server already running on port 3001"
else
    start_service "ImageServer" "node image-server.cjs" 3001 "logs/image-server.log"
fi

echo ""
echo "3️⃣ Starting Watermarking Service..."
if check_port 5001; then
    echo "✅ Watermarking service already running on port 5001"
else
    cd watermark-service
    start_service "WatermarkService" "./start.sh" 5001 "../logs/watermark-service.log"
    cd ..
fi

echo ""
echo "4️⃣ Starting Frontend..."
if check_port 3004; then
    echo "✅ Frontend already running on port 3004"
else
    cd frontend
    start_service "Frontend" "npm run dev -- --port 3004 --force" 3004 "../logs/frontend.log"
    cd ..
fi

echo ""
echo "🎉 PHOTOMINT WATERMARKING SYSTEM READY!"
echo "========================================"
echo ""
echo "🌐 SERVICES:"
echo "   • Blockchain: http://localhost:8545"
echo "   • Image Server: http://localhost:3001"
echo "   • Watermarking API: http://localhost:5001"
echo "   • Frontend: http://localhost:3004"
echo ""
echo "🛠️ DEVELOPMENT TOOLS:"
echo "   • Enhanced Minting: node enhanced-mint.js mint <image> <name>"
echo "   • Watermark Verification: node enhanced-mint.js verify <image>"
echo "   • Batch Processing: node enhanced-mint.js batch <directory>"
echo ""
echo "📁 LOGS:"
echo "   • Blockchain: logs/blockchain.log"
echo "   • Image Server: logs/image-server.log"
echo "   • Watermarking: logs/watermark-service.log"
echo "   • Frontend: logs/frontend.log"
echo ""
echo "🔧 MANAGEMENT:"
echo "   • Stop all: ./stop-watermark-system.sh"
echo "   • View logs: tail -f logs/<service>.log"
echo "   • Check status: ./check-system-status.sh"
echo ""
echo "🚀 Ready for watermarked photo minting!"

