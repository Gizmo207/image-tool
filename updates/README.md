# SnapForge Auto-Updates Directory

This directory contains update metadata files for the electron-updater system.

## 📁 Directory Structure
```
updates/
├── latest.yml          # Windows update metadata
├── latest-mac.yml      # macOS update metadata  
├── latest-linux.yml    # Linux update metadata
└── README.md          # This file
```

## 🔄 How Auto-Updates Work

1. **Update Check**: SnapForge checks for updates weekly
2. **Metadata Download**: Downloads `latest.yml` (platform-specific)
3. **Version Compare**: Compares current vs available version
4. **User Notification**: Shows update available dialog
5. **Download**: Downloads new version in background
6. **Install**: Prompts user to restart and install

## 🚀 Deployment Process

### For GitHub Releases (Recommended)
```bash
# Create a tagged release
git tag v1.0.1
git push origin v1.0.1

# GitHub Actions will build and create release
# Update files are automatically generated
```

### For Firebase Hosting
```bash
# Copy update files from GitHub Actions artifacts
cp dist-releases/latest*.yml updates/

# Deploy to Firebase
firebase deploy --only hosting:updates
```

### For Custom Server
Upload the `latest*.yml` files to your server at:
- Windows: `https://yourdomain.com/updates/latest.yml`
- macOS: `https://yourdomain.com/updates/latest-mac.yml`  
- Linux: `https://yourdomain.com/updates/latest-linux.yml`

## 🎯 Update File Format

**latest.yml** (Windows):
```yaml
version: 1.0.1
files:
  - url: SnapForge-1.0.1-Windows.exe
    sha512: [hash]
    size: 123456789
path: SnapForge-1.0.1-Windows.exe
sha512: [hash]
releaseDate: '2024-01-15T10:30:00.000Z'
```

**latest-mac.yml** (macOS):
```yaml
version: 1.0.1
files:
  - url: SnapForge-1.0.1-macOS.dmg
    sha512: [hash]
    size: 123456789
path: SnapForge-1.0.1-macOS.dmg
sha512: [hash]
releaseDate: '2024-01-15T10:30:00.000Z'
```

## 🔒 Security Features

- **SHA512 Hashes**: All downloads verified with cryptographic hashes
- **HTTPS Only**: Updates only work over secure connections
- **Code Signing**: Executables should be code-signed for trust
- **User Consent**: Users must approve updates before installation

## 📊 Update Statistics

You can track update adoption by monitoring:
- Download counts of update files
- Version usage in analytics
- Support tickets by version

## 🛠️ Testing Updates

```bash
# Test update check (in SnapForge console)
await window.snapAPI.checkForUpdates()

# Force download update
await window.snapAPI.downloadUpdate()

# Simulate update available
# (modify version in package.json to be lower)
```

## 🎨 Customization

Update the following in `electron-simple.js`:
- `checkIntervalMs`: How often to check (default: 7 days)
- `autoDownload`: Whether to auto-download updates  
- `allowPrerelease`: Whether to include beta versions

## 📧 Support

For update-related issues:
- Check console logs in SnapForge
- Verify internet connection
- Ensure update server is accessible
- Contact: support@snapforge.com

---
**Automatic updates keep SnapForge fresh without user hassle!** 🚀
