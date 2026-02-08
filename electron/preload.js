const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose secure API to renderer process via contextBridge
 * This creates window.electronAPI in the renderer
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Environment detection
  isElectron: true,

  // File dialogs
  showSaveDialog: (defaultPath, filters) =>
    ipcRenderer.invoke('dialog:save', defaultPath, filters),

  showOpenDialog: (filters) =>
    ipcRenderer.invoke('dialog:open', filters),

  // File operations
  saveFile: (filePath, content) =>
    ipcRenderer.invoke('file:save', filePath, content),

  readFile: (filePath) =>
    ipcRenderer.invoke('file:read', filePath),

  // Export operations
  saveImage: (dataUrl, defaultPath) =>
    ipcRenderer.invoke('export:image', dataUrl, defaultPath),

  savePDF: (arrayBuffer, defaultPath) =>
    ipcRenderer.invoke('export:pdf', arrayBuffer, defaultPath),

  // Dialogs
  showMessageBox: (options) =>
    ipcRenderer.invoke('dialog:message', options),

  showConfirmDialog: (message) =>
    ipcRenderer.invoke('dialog:confirm', message),

  showSaveConfirmDialog: (message, filename) =>
    ipcRenderer.invoke('dialog:save-confirm', message, filename),

  // App info
  getAppVersion: () =>
    ipcRenderer.invoke('app:version'),

  getPlatform: () =>
    ipcRenderer.invoke('app:platform'),

  // Menu event listeners
  onMenuAction: (callback) => {
    ipcRenderer.on('menu:action', (event, action) => callback(action));
  }
});

// Log preload script loaded (helpful for debugging)
console.log('Electron preload script loaded');
