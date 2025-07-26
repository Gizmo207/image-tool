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
    'assets/**/*',
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
      icon: 'assets/icon.ico'
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
      icon: 'assets/icon.icns',
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
      icon: 'assets/icon.png',
      category: 'Graphics'
    }
  }
};

async function buildForPlatform(platform) {
  console.log(`🔨 Building for ${platform}...`);
  
  try {
    await build({
      config: platforms[platform]
    });
    
    console.log(`✅ ${platform} build completed successfully!`);
  } catch (error) {
    console.error(`❌ ${platform} build failed:`, error);
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
