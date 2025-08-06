#!/bin/bash

# Bitcoin Royalty Frontend - Network Startup Script

set -e

# Default to testnet4
NETWORK=${1:-testnet4}

echo "🚀 Starting Bitcoin Royalty Frontend on $NETWORK..."

# Validate network
case $NETWORK in
    mainnet|testnet4|testnet|regtest|signet)
        echo "✅ Valid network: $NETWORK"
        ;;
    *)
        echo "❌ Invalid network: $NETWORK"
        echo "Valid options: mainnet, testnet4, testnet, regtest, signet"
        exit 1
        ;;
esac

# Show network configuration
echo ""
echo "🌐 Frontend Configuration:"
echo "   Network: $NETWORK"
echo "   Mode: Development"
echo "   API: http://localhost:3000"
echo ""

# Warning for mainnet
if [ "$NETWORK" = "mainnet" ]; then
    echo "🚨 WARNING: Starting on MAINNET mode!"
    echo "🚨 Connected to real Bitcoin network!"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 1
    fi
fi

# Start the frontend
echo "🔄 Starting React frontend..."
case $NETWORK in
    mainnet) npm run dev:mainnet ;;
    testnet4) npm run dev:testnet4 ;;
    testnet) npm run dev:testnet ;;
    regtest) npm run dev:regtest ;;
    signet) npm run dev:testnet4 ;;  # Use testnet4 for signet
esac
