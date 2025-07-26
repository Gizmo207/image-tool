// Preload script for secure IPC communication
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('snapAPI', {
  // License management (secure)
  activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
  validateLicense: (key) => ipcRenderer.invoke('validate-license', key),
  getStoredLicense: () => ipcRenderer.invoke('get-license'),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  saveFile: (data, suggestedName) => ipcRenderer.invoke('save-file', data, suggestedName),
  
  // Platform info
  platform: process.platform,
  
  // Auto-updater functions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // Auto-updater events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),
  
  // Tool store
  openToolStore: () => ipcRenderer.invoke('open-tool-store'),
  
  // Utility functions
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});

console.log('🔌 SnapForge Secure Bridge loaded');
