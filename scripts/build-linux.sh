#!/bin/bash
# SnapForge Linux Build Script
# Run this on Ubuntu/WSL to build Linux AppImage

echo "🐧 SnapForge Linux Build Script"
echo "================================"

# Check if we're on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ This script must run on Linux or WSL"
    echo "💡 Try: wsl --install Ubuntu"
    exit 1
fi

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y build-essential libnss3-dev libatk-bridge2.0-dev \
    libdrm2 libxss1 libgconf-2-4 libxrandr2 libasound2 \
    libpangocairo-1.0-0 libatk1.0-dev libcairo-dev libgtk-3-dev \
    libgdk-pixbuf2.0-dev fuse

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if in correct directory
if [[ ! -f "package.json" ]]; then
    echo "❌ package.json not found. Run this script from the project root."
    exit 1
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build web app
echo "🏗️ Building web application..."
npm run build

# Build Linux AppImage
echo "🐧 Building Linux AppImage..."
npm run dist-linux

# Check if build succeeded
if [[ -f "dist-electron/"*.AppImage ]]; then
    echo "✅ Linux build completed successfully!"
    echo "📦 Output files:"
    ls -la dist-electron/*.AppImage
    
    # Make executable
    chmod +x dist-electron/*.AppImage
    
    echo ""
    echo "🚀 To test the AppImage:"
    echo "   ./dist-electron/SnapForge-1.0.0.AppImage"
    echo ""
    echo "📤 Copy to Windows:"
    echo "   cp dist-electron/*.AppImage /mnt/c/Users/\$USER/Desktop/"
else
    echo "❌ Linux build failed!"
    exit 1
fi
