#!/bin/bash

# PhotoMint Watermarking System Shutdown Script

echo "🛡️ Stopping PhotoMint Watermarking System..."
echo "============================================="

# Function to stop service by PID file
stop_service() {
    local name=$1
    local pid_file=".${name,,}_pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo "🛑 Stopping $name (PID: $pid)..."
            kill $pid
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                echo "⚡ Force stopping $name..."
                kill -9 $pid
            fi
            
            echo "✅ $name stopped"
        else
            echo "⚠️  $name was not running"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  No PID file found for $name"
    fi
}

# Function to stop by port
stop_by_port() {
    local port=$1
    local name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "🛑 Stopping $name on port $port (PID: $pid)..."
        kill $pid 2>/dev/null
        sleep 1
        
        # Check if still running
        if lsof -ti:$port >/dev/null 2>&1; then
            echo "⚡ Force stopping $name..."
            kill -9 $pid 2>/dev/null
        fi
        
        echo "✅ $name stopped"
    else
        echo "⚠️  No process found on port $port for $name"
    fi
}

echo ""
echo "1️⃣ Stopping Frontend..."
stop_service "Frontend"
stop_by_port 3004 "Frontend"

echo ""
echo "2️⃣ Stopping Watermarking Service..."
stop_service "WatermarkService"
stop_by_port 5001 "Watermarking Service"

echo ""
echo "3️⃣ Stopping Image Server..."
stop_service "ImageServer"
stop_by_port 3001 "Image Server"

echo ""
echo "4️⃣ Stopping Blockchain..."
stop_service "Blockchain"
stop_by_port 8545 "Blockchain"

echo ""
echo "🧹 Cleaning up temporary files..."
rm -f .blockchain_pid .imageserver_pid .watermarkservice_pid .frontend_pid

echo ""
echo "✅ PhotoMint Watermarking System Stopped!"
echo "=========================================="
echo ""
echo "📁 Logs preserved in logs/ directory"
echo "🔄 To restart: ./start-watermark-system.sh"

