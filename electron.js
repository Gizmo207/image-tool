const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow local file access for images
    },
    icon: path.join(__dirname, 'logo.png'), // Using your SnapForge logo
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Start the Express server
  startServer();

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, the React app will be built and served from the Express server
    mainWindow.loadURL('http://localhost:3001');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Kill server process when window closes
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

function startServer() {
  // Start the Express server that handles the Python U-2-Net processing
  const serverPath = path.join(__dirname, 'server.js');
  
  serverProcess = spawn('node', [serverPath], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Kill server process
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

// Handle app updates and deep links
app.setAsDefaultProtocolClient('snapforge');

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, url) => {
    navigationEvent.preventDefault();
  });
});
