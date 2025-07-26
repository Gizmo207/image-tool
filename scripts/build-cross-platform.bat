@echo off
:: SnapForge Cross-Platform Build Script for Windows
:: Builds what we can locally and provides instructions for the rest

echo 🚀 SnapForge Cross-Platform Builder
echo ===================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Run this script from the project root.
    pause
    exit /b 1
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

:: Build web app
echo 🏗️ Building web application...
call npm run build
if errorlevel 1 (
    echo ❌ Web build failed
    pause
    exit /b 1
)

:: Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist-electron" rmdir /s /q "dist-electron"
if exist "release" rmdir /s /q "release"
mkdir release
mkdir release\Windows
mkdir release\macOS
mkdir release\Linux

:: Build Windows version
echo 🪟 Building Windows executable...
call npm run dist-win
if errorlevel 1 (
    echo ❌ Windows build failed
    pause
    exit /b 1
)

:: Copy Windows files
echo 📁 Copying Windows files...
copy "dist-electron\*.exe" "release\Windows\" >nul 2>&1

:: Create README for release
echo 📝 Creating release README...
(
echo 🖼️ SnapForge - Professional Image Editor
echo ========================================
echo.
echo 📦 Installation Instructions:
echo.
echo 🪟 Windows:
echo - Navigate to Windows/ folder
echo - Run SnapForge-1.0.0.exe ^(portable^) 
echo - Windows may show security warning - click "More info" → "Run anyway"
echo.
echo 🍎 macOS:
echo - Navigate to macOS/ folder  
echo - Open SnapForge-1.0.0.dmg
echo - Drag SnapForge to Applications folder
echo - Right-click → Open ^(for unsigned apps^)
echo.
echo 🐧 Linux:
echo - Navigate to Linux/ folder
echo - Make executable: chmod +x SnapForge-1.0.0.AppImage
echo - Run: ./SnapForge-1.0.0.AppImage
echo.
echo 🔑 Test License Key: IMG_PRO_test123_LIFETIME
echo.
echo 📧 Support: support@snapforge.com
echo 🌐 Website: https://snapforge.com
echo.
echo Version: 1.0.0
echo Build Date: %date% %time%
echo.
echo All platforms included - choose your folder!
) > "release\README.txt"

:: Check what we have
echo.
echo ✅ Windows Build Complete!
echo 📁 Files created:
dir "release\Windows\*.exe" 2>nul
echo.

:: Instructions for other platforms
echo 📋 Next Steps for Full Cross-Platform Build:
echo.
echo 🐧 For Linux AppImage:
echo    1. Open WSL Ubuntu: wsl
echo    2. Navigate to project: cd /mnt/c/Users/%USERNAME%/OneDrive/Documents/Desktop/image-tool
echo    3. Run: bash scripts/build-linux.sh
echo    4. Copy result: cp dist-electron/*.AppImage release/Linux/
echo.
echo 🍎 For macOS DMG:
echo    1. Copy project to Mac
echo    2. Run: npm install ^&^& npm run build ^&^& npm run dist-mac
echo    3. Copy result to release/macOS/
echo.
echo 🚀 Or use GitHub Actions:
echo    1. Push to GitHub with tag: git tag v1.0.0 ^&^& git push origin v1.0.0
echo    2. Wait for automated builds
echo    3. Download SnapForge-CrossPlatform.zip from releases
echo.

:: Ask if user wants to create ZIP now
echo 📦 Create partial ZIP with Windows build? (y/n)
set /p choice="Enter choice: "
if /i "%choice%"=="y" (
    echo 📦 Creating SnapForge-Windows-Only.zip...
    powershell -Command "Compress-Archive -Path 'release\*' -DestinationPath 'SnapForge-Windows-Only.zip' -Force"
    echo ✅ Created: SnapForge-Windows-Only.zip
)

echo.
echo 🎉 Windows build complete! 
echo 💡 Use GitHub Actions for full cross-platform automation.
echo.
pause
