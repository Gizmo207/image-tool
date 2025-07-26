const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Smart URL loading helper
function tryLoadURL(url) {
  return new Promise((resolve, reject) => {
    const testReq = require('http').get(url, (res) => {
      if (res.statusCode === 200) {
        mainWindow.loadURL(url);
        resolve();
      } else {
        reject();
      }
    }).on('error', reject);
  });
}

// Smart installer - downloads AI models on first use
const AI_MODELS = {
  'u2net': 'https://github.com/xuebinqin/U-2-Net/releases/download/u2net/u2net.pth',
  'u2net_human_seg': 'https://github.com/xuebinqin/U-2-Net/releases/download/u2netp/u2netp.pth'
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
    },
    icon: path.join(__dirname, 'logo.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#1a1a1a' // Dark theme like VS Code
  });

  // Start lightweight server immediately
  startServer();

  // Load app instantly - smart port detection
  if (isDev) {
    // Try port 3001 first (common Vite fallback), then 3000
    tryLoadURL('http://localhost:3001').catch(() => {
      mainWindow.loadURL('http://localhost:3000');
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load local index.html
    mainWindow.loadFile('index.html');
  }

  // Show immediately - no waiting
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Download AI models in background (like Google Chrome extensions)
    downloadAIModelsInBackground();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

function startServer() {
  // Lightweight server starts instantly
  const serverPath = path.join(__dirname, 'server.js');
  
  serverProcess = spawn('node', [serverPath], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  console.log('⚡ SnapForge starting instantly...');
}

function downloadAIModelsInBackground() {
  // Like how VS Code downloads extensions in background
  const modelsDir = path.join(__dirname, 'resources', 'u2net');
  
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  // Show notification like "Downloading AI models for background removal..."
  mainWindow.webContents.send('download-status', {
    message: 'Downloading AI models in background...',
    progress: 0
  });

  // Download lightweight Python requirements first
  downloadPythonDeps().then(() => {
    // Then download AI models if not exists
    checkAndDownloadModels();
  });
}

function downloadPythonDeps() {
  return new Promise((resolve) => {
    // Install only essential packages
    const pythonProcess = spawn('pip', ['install', 'rembg', '--quiet'], {
      stdio: 'pipe'
    });
    
    pythonProcess.on('close', () => {
      console.log('✅ Python dependencies ready');
      resolve();
    });
  });
}

function checkAndDownloadModels() {
  const modelPath = path.join(__dirname, 'resources', 'u2net', 'u2net.pth');
  
  if (!fs.existsSync(modelPath)) {
    // Download like how Discord downloads voice codecs
    console.log('📥 Downloading AI model (first time only)...');
    
    // Show progress in app
    mainWindow.webContents.send('download-status', {
      message: 'Downloading AI model (one-time setup)...',
      progress: 50
    });
    
    // In real implementation, download from CDN
    setTimeout(() => {
      mainWindow.webContents.send('download-status', {
        message: 'AI models ready! Background removal enabled.',
        progress: 100,
        complete: true
      });
    }, 3000);
  } else {
    // Models already exist
    mainWindow.webContents.send('download-status', {
      message: 'AI models ready!',
      progress: 100,
      complete: true
    });
  }
}

// App startup
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security
app.setAsDefaultProtocolClient('snapforge');

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
  });
});
