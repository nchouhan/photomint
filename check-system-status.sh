#!/bin/bash

# PhotoMint Watermarking System Status Checker

echo "🛡️ PhotoMint Watermarking System Status"
echo "======================================="

# Function to check if a port is in use and get process info
check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    echo -n "🔍 $name (port $port): "
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "✅ RUNNING (PID: $pid)"
        
        # Try to get additional info
        if [ ! -z "$url" ]; then
            local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
            if [ "$status_code" = "200" ]; then
                echo "   📡 API responding: ✅"
            else
                echo "   📡 API status: ⚠️ (HTTP $status_code)"
            fi
        fi
    else
        echo "❌ NOT RUNNING"
    fi
}

# Function to check watermarking service health
check_watermark_health() {
    echo -n "🛡️ Watermarking Service Health: "
    
    local response=$(curl -s "http://localhost:5001/health" 2>/dev/null)
    if [ $? -eq 0 ] && echo "$response" | grep -q "healthy"; then
        echo "✅ HEALTHY"
        echo "   📊 $(echo "$response" | grep -o '"method":"[^"]*"' | cut -d'"' -f4')"
        echo "   📦 $(echo "$response" | grep -o '"max_payload_size":[0-9]*' | cut -d':' -f2') byte payload limit"
    else
        echo "❌ UNHEALTHY"
    fi
}

# Function to check blockchain connection
check_blockchain() {
    echo -n "⛓️ Blockchain Connection: "
    
    # Try to get block number
    local block_number=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8545 2>/dev/null | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$block_number" ]; then
        local decimal_block=$((16#${block_number#0x}))
        echo "✅ CONNECTED (Block: $decimal_block)"
    else
        echo "❌ DISCONNECTED"
    fi
}

# Function to check frontend build status
check_frontend() {
    echo -n "🖥️ Frontend Application: "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004" 2>/dev/null)
    if [ "$response" = "200" ]; then
        echo "✅ ACCESSIBLE"
        
        # Check if React is loaded
        local react_check=$(curl -s "http://localhost:3004" | grep -o "React" | head -1)
        if [ ! -z "$react_check" ]; then
            echo "   ⚛️ React app: ✅"
        fi
    else
        echo "❌ NOT ACCESSIBLE (HTTP $response)"
    fi
}

echo ""
echo "🌐 CORE SERVICES:"
check_service "Blockchain Node" 8545 "http://localhost:8545"
check_service "Image Server" 3001 "http://localhost:3001/health"
check_service "Watermarking API" 5001 "http://localhost:5001/health"
check_service "Frontend" 3004 "http://localhost:3004"

echo ""
echo "🔍 DETAILED HEALTH CHECKS:"
check_watermark_health
check_blockchain
check_frontend

echo ""
echo "📁 SYSTEM RESOURCES:"

# Check disk space for uploads
if [ -d "data/uploads" ]; then
    local upload_count=$(find data/uploads -type f | wc -l)
    local upload_size=$(du -sh data/uploads 2>/dev/null | cut -f1)
    echo "📸 Uploaded images: $upload_count files ($upload_size)"
else
    echo "📸 Upload directory: Not found"
fi

# Check minting records
if [ -d "minting-records" ]; then
    local record_count=$(find minting-records -name "*.json" | wc -l)
    echo "📄 Minting records: $record_count files"
else
    echo "📄 Minting records: No records yet"
fi

# Check logs
if [ -d "logs" ]; then
    echo "📋 Recent logs:"
    for log_file in logs/*.log; do
        if [ -f "$log_file" ]; then
            local log_name=$(basename "$log_file" .log)
            local log_size=$(du -h "$log_file" | cut -f1)
            local last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$log_file" 2>/dev/null || date)
            echo "   📝 $log_name: $log_size (modified: $last_modified)"
        fi
    done
else
    echo "📋 Logs: No log directory found"
fi

echo ""
echo "🎯 QUICK ACTIONS:"
echo "   🚀 Start all: ./start-watermark-system.sh"
echo "   🛑 Stop all: ./stop-watermark-system.sh"
echo "   🔄 Restart: ./stop-watermark-system.sh && ./start-watermark-system.sh"
echo ""
echo "🛠️ TESTING COMMANDS:"
echo "   📸 Test mint: node enhanced-mint.js mint samples/test-photo.jpg \"Test Photo\""
echo "   🔍 Test verify: node enhanced-mint.js verify <image_path>"
echo "   🌐 Open frontend: open http://localhost:3004"

echo ""
echo "Status check completed! 🎉"

