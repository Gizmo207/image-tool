#!/usr/bin/env node

/**
 * 🏗️ SnapForge Cross-Platform Build Script
 * 
 * This script builds SnapForge for Windows, macOS, and Linux
 * with integrated license system and auto-updater
 */

const { build } = require('electron-builder');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building SnapForge for cross-platform distribution...\n');

// Check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'electron-simple.js',
    'licenseManager.js',
    'preload.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, '..', file)));
  
  if (missingFiles.length > 0) {
    console.warn('⚠️  Missing required files:', missingFiles);
  }
  
  // Check for build output
  const buildPaths = ['dist', 'build'];
  const buildExists = buildPaths.some(buildPath => fs.existsSync(path.join(__dirname, '..', buildPath)));
  
  if (!buildExists) {
    console.error('❌ No build output found! Please run "npm run build" first.');
    process.exit(1);
  }
}

const commonConfig = {
  appId: 'com.snapforge.imageEditor',
  productName: 'SnapForge',
  copyright: 'Copyright © 2024 SnapForge Technologies',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'electron-simple.js',
    'licenseManager.js',
    'preload.js',
    'dist/**/*',
    'build/**/*',
    'src/**/*',
    'public/**/*',
    'package.json',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],
  publish: {
    provider: 'github',
    releaseType: 'release'
  }
};

const platforms = {
  win: {
    ...commonConfig,
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64']
        }
      ],
      icon: fs.existsSync(path.join(__dirname, '..', 'assets', 'icon.ico')) ? 'assets/icon.ico' : 'logo.png'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'SnapForge'
    }
  },
  mac: {
    ...commonConfig,
    mac: {
      target: [
        {
          target: 'dmg',
          arch: ['x64', 'arm64']
        }
      ],
      icon: fs.existsSync(path.join(__dirname, '..', 'assets', 'icon.icns')) ? 'assets/icon.icns' : undefined,
      category: 'public.app-category.graphics-design'
    },
    dmg: {
      title: 'SnapForge ${version}',
      icon: 'assets/icon.icns',
      background: 'assets/dmg-background.png',
      contents: [
        {
          x: 130,
          y: 220
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications'
        }
      ]
    }
  },
  linux: {
    ...commonConfig,
    linux: {
      target: [
        {
          target: 'AppImage',
          arch: ['x64']
        }
      ],
      icon: fs.existsSync(path.join(__dirname, '..', 'assets', 'icon.png')) ? 'assets/icon.png' : 'logo.png',
      category: 'Graphics'
    }
  }
};

async function buildForPlatform(platform) {
  console.log(`🔨 Building for ${platform}...`);
  
  // Check required files before building
  checkRequiredFiles();
  
  try {
    console.log(`📋 Build configuration for ${platform}:`);
    console.log(JSON.stringify(platforms[platform], null, 2));
    
    await build({
      config: platforms[platform]
    });
    
    console.log(`✅ ${platform} build completed successfully!`);
    
    // List generated files
    const distPath = path.join(__dirname, '..', 'dist-electron');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      console.log(`📦 Generated files for ${platform}:`);
      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`   - ${file} (${sizeInMB} MB)`);
        }
      });
    }
  } catch (error) {
    console.error(`❌ ${platform} build failed:`);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

async function buildAll() {
  const targetPlatform = process.argv[2];
  
  if (targetPlatform && platforms[targetPlatform]) {
    await buildForPlatform(targetPlatform);
  } else if (!targetPlatform) {
    console.log('🎯 Building for all platforms...\n');
    
    for (const platform of Object.keys(platforms)) {
      await buildForPlatform(platform);
      console.log('');
    }
    
    console.log('🎉 All platform builds completed successfully!');
    console.log('\n📦 Generated files:');
    
    const distPath = path.join(__dirname, 'dist-electron');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`   📄 ${file} (${sizeInMB} MB)`);
        }
      });
    }
  } else {
    console.log('❌ Invalid platform. Use: win, mac, linux, or no argument for all');
    process.exit(1);
  }
}

buildAll().catch(error => {
  console.error('💥 Build process failed:', error);
  process.exit(1);
});
