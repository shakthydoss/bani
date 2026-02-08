const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

console.log('Electron main process starting...');

/**
 * Create the main application window
 */
function createWindow() {
  console.log('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Bani - Mind Mapping',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    backgroundColor: '#ffffff',
    show: false
  });

  // Load the app
  const indexPath = path.join(__dirname, '../src/index.html');
  console.log('Loading index.html from:', indexPath);
  mainWindow.loadFile(indexPath);

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Set up application menu
  console.log('Setting up application menu...');
  const menuBuilder = require('./menu');
  menuBuilder.buildMenu(mainWindow);
  console.log('✓ Window created successfully');

  // Clean up reference when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--enable-logging')) {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * App lifecycle: When Electron has finished initialization
 */
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * App lifecycle: Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * App lifecycle: Before quit - check for unsaved changes
 */
app.on('before-quit', async (event) => {
  if (!mainWindow) return;

  // Ask renderer if there are unsaved changes
  try {
    const hasUnsaved = await mainWindow.webContents.executeJavaScript(
      'window.bani?.fileManager?.hasUnsavedChanges() || false'
    );

    if (hasUnsaved) {
      event.preventDefault();

      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        message: 'Do you want to save the changes you made?',
        detail: 'Your changes will be lost if you don\'t save them.',
        noLink: true
      });

      if (response === 0) {
        // Save
        await mainWindow.webContents.executeJavaScript('window.bani.fileManager.save()');
        app.quit();
      } else if (response === 1) {
        // Don't Save
        app.quit();
      }
      // Cancel - do nothing, preventDefault already called
    }
  } catch (error) {
    console.error('Error checking unsaved changes:', error);
  }
});

// ============================================================================
// IPC Handlers - File Dialogs
// ============================================================================

/**
 * Show native save dialog
 * @returns {Promise<{canceled: boolean, filePath?: string}>}
 */
ipcMain.handle('dialog:save', async (event, defaultPath, filters) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    properties: ['createDirectory', 'showOverwriteConfirmation']
  });

  return { canceled, filePath };
});

/**
 * Show native open dialog
 * @returns {Promise<{canceled: boolean, filePath?: string}>}
 */
ipcMain.handle('dialog:open', async (event, filters) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    properties: ['openFile']
  });

  return { canceled, filePath: filePaths?.[0] };
});

/**
 * Show confirmation dialog
 * @returns {Promise<boolean>} true if user clicked Yes/OK
 */
ipcMain.handle('dialog:confirm', async (event, message) => {
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    cancelId: 0,
    message,
    noLink: true
  });

  return response === 1; // OK button
});

/**
 * Show save confirmation dialog with three buttons
 * @returns {Promise<number>} 0 = Save, 1 = Don't Save, 2 = Cancel
 */
ipcMain.handle('dialog:save-confirm', async (event, message, filename) => {
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Save', "Don't Save", 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    message: message || 'Do you want to save the changes you made?',
    detail: filename ? `File: ${filename}` : 'Your changes will be lost if you don\'t save them.',
    noLink: true
  });

  return response;
});

/**
 * Show message box
 * @returns {Promise<void>}
 */
ipcMain.handle('dialog:message', async (event, options) => {
  await dialog.showMessageBox(mainWindow, {
    type: options.type || 'info',
    message: options.message,
    detail: options.detail,
    buttons: ['OK']
  });
});

// ============================================================================
// IPC Handlers - File Operations
// ============================================================================

/**
 * Save file to disk
 * @returns {Promise<{success: boolean, error?: string}>}
 */
ipcMain.handle('file:save', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('File save error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Read file from disk
 * @returns {Promise<{success: boolean, content?: string, error?: string}>}
 */
ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    console.error('File read error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Save image from base64 data URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
ipcMain.handle('export:image', async (event, dataUrl, defaultPath) => {
  try {
    // Show save dialog
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [
        { name: 'PNG Image', extensions: ['png'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Extract base64 data from data URL
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to file
    await fs.writeFile(filePath, buffer);
    return { success: true, filePath };
  } catch (error) {
    console.error('Image export error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Save PDF from blob array buffer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
ipcMain.handle('export:pdf', async (event, arrayBuffer, defaultPath) => {
  try {
    // Show save dialog
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [
        { name: 'PDF Document', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Convert ArrayBuffer to Buffer and save
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    return { success: true, filePath };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================================================
// IPC Handlers - App Info
// ============================================================================

/**
 * Get app version
 * @returns {string}
 */
ipcMain.handle('app:version', () => {
  return app.getVersion();
});

/**
 * Get platform
 * @returns {string}
 */
ipcMain.handle('app:platform', () => {
  return process.platform;
});

// ============================================================================
// Error Handling
// ============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
