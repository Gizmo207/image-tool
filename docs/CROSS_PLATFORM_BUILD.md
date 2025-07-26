# 🖼️ SnapForge Cross-Platform Build Guide

This document explains how to build SnapForge for Windows, macOS, and Linux platforms.

## ✅ Build Status Overview

| Platform | Status | Format | Requirements | Notes |
|----------|--------|--------|--------------|-------|
| 🪟 Windows | ✅ Working | `.exe` (Portable) | Windows/WSL | Icon removed to fix build |
| 🐧 Linux | 🔄 Automated | `.AppImage` | Linux/Ubuntu | Via GitHub Actions |
| 🍎 macOS | 🔄 Automated | `.dmg` | macOS only | Apple signing required |

## 🛠️ Local Development Builds

### Prerequisites
- Node.js 18+
- npm or yarn
- Platform-specific build tools

### Quick Start
```bash
# Install dependencies
npm install

# Build web app
npm run build

# Build for your current platform
npm run dist-win    # Windows
npm run dist-mac    # macOS  
npm run dist-linux  # Linux
```

## 🪟 Windows Build

### Requirements
- Windows 10/11 or WSL
- Visual Studio Build Tools (automatic via electron-builder)

### Commands
```bash
# Portable executable (recommended)
npm run dist-win

# With installer (requires icon fix)
npm run build-electron
```

### Output
```
dist-electron/
├── SnapForge-1.0.0.exe              # Portable version
├── SnapForge Setup 1.0.0.exe        # NSIS installer
└── latest.yml                       # Auto-updater metadata
```

### Known Issues
- PNG icon causes build failures - removed for now
- Portable version works perfectly
- NSIS installer needs icon in ICO format

## 🐧 Linux Build

### Requirements
- Ubuntu 18.04+ or compatible Linux distro
- Standard build tools (gcc, make, etc.)

### Manual Build (on Linux)
```bash
# Install system dependencies
sudo apt update
sudo apt install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxss1 libgconf-2-4 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-dev libcairo-dev libgtk-3-dev libgdk-pixbuf2.0-dev

# Build AppImage
npm run dist-linux
```

### Docker Build (from Windows)
```bash
# Using Docker for Linux builds
docker run --rm -ti \
  --env ELECTRON_CACHE="/tmp/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/tmp/.cache/electron-builder" \
  -v ${PWD}:/project \
  -v ${PWD##*/}-node-modules:/project/node_modules \
  electronuserland/builder:wine \
  /bin/bash -c "npm install && npm run dist-linux"
```

### Output
```
dist-electron/
├── SnapForge-1.0.0.AppImage
└── latest-linux.yml
```

## 🍎 macOS Build

### Requirements
- macOS 10.15+ (Catalina or newer)
- Xcode Command Line Tools
- Optional: Apple Developer account for signing

### Commands
```bash
# Build DMG (unsigned)
npm run dist-mac

# For signed builds (requires certificates)
CSC_LINK=path/to/certificate.p12 CSC_KEY_PASSWORD=password npm run dist-mac
```

### Output
```
dist-electron/
├── SnapForge-1.0.0.dmg
├── SnapForge-1.0.0-mac.zip          # Alternative format
└── latest-mac.yml
```

### Code Signing Notes
- Unsigned apps require users to right-click → Open
- For distribution, get Apple Developer certificate
- Notarization recommended for Gatekeeper compatibility

## 🚀 Automated Cross-Platform Builds

### GitHub Actions
The repository includes automated builds via GitHub Actions:

```bash
# Trigger builds
git tag v1.0.0
git push origin v1.0.0
```

This creates:
- Windows .exe on Windows runner
- macOS .dmg on macOS runner  
- Linux .AppImage on Ubuntu runner
- Combined SnapForge-CrossPlatform.zip

### Build Artifacts
Each platform produces:
```
SnapForge-CrossPlatform-v1.0.0.zip
├── Windows/
│   └── SnapForge-1.0.0.exe
├── macOS/
│   └── SnapForge-1.0.0.dmg
├── Linux/
│   └── SnapForge-1.0.0.AppImage
└── README.txt
```

## 🔧 Configuration Details

### electron-builder Settings
```json
{
  "build": {
    "appId": "com.snapforge.app",
    "productName": "SnapForge",
    "directories": {
      "output": "dist-electron"
    },
    
    "win": {
      "target": [{"target": "portable", "arch": ["x64"]}],
      "artifactName": "${productName}-${version}-Windows.${ext}"
    },
    
    "mac": {
      "target": [{"target": "dmg", "arch": ["x64", "arm64"]}],
      "artifactName": "${productName}-${version}-macOS.${ext}",
      "category": "public.app-category.graphics-design"
    },
    
    "linux": {
      "target": [{"target": "AppImage", "arch": ["x64"]}],
      "artifactName": "${productName}-${version}-Linux.${ext}",
      "category": "Graphics"
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**"spawn node ENOENT" on Windows**
- Fixed by using `electron-simple.js` with no external process spawning
- Removed server dependencies for standalone operation

**"PNG icon not supported" on Windows**
- Temporarily removed icon references
- Convert logo.png to logo.ico for proper Windows support

**"Cannot build for macOS on Windows"**
- Use GitHub Actions or build on actual Mac
- Docker solutions exist but are complex

**AppImage fails on older Linux**
- Requires glibc 2.17+ (Ubuntu 13.04+)
- Use older Electron version for broader compatibility

### Debug Commands
```bash
# Verbose electron-builder output
DEBUG=electron-builder npm run dist-win

# Check what files are included
npm run pack

# Test electron app locally
npm run electron-dev
```

## 📦 Distribution Strategy

### For Gumroad/Direct Sales
1. Build all platforms via GitHub Actions
2. Download SnapForge-CrossPlatform.zip
3. Upload to Gumroad as single product
4. Users choose their platform folder

### For App Stores
- **Microsoft Store**: Use `appx` target
- **Mac App Store**: Use `mas` target + proper signing
- **Snap Store**: Use `snap` target for Linux

### For Enterprise
- Provide unsigned builds for internal deployment
- Include deployment scripts for IT departments
- Support custom branding/white-label versions

## 🔄 Auto-Updates

The builds include `latest.yml` files for auto-updates:
- Uses electron-updater
- Checks GitHub releases
- Downloads delta updates when possible

Enable in main electron process:
```javascript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

## 🎯 Next Steps

1. **Fix Windows icon**: Convert PNG to ICO format
2. **Add code signing**: Get certificates for all platforms  
3. **Implement auto-updater**: Enable seamless updates
4. **Store submissions**: Prepare for app store distribution
5. **Performance testing**: Verify builds on target systems

---

**Ready to ship SnapForge to the world! 🚀**
