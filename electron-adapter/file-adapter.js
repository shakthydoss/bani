/**
 * FileAdapter - Abstracts file operations to work in both Electron and browser environments
 *
 * In Electron: Uses native file dialogs and Node.js fs module via IPC
 * In Browser: Uses FileReader API and blob URL downloads
 */
export class FileAdapter {
  constructor() {
    // Detect if running in Electron
    this.isElectron = window.electronAPI?.isElectron || false;
    console.log(`FileAdapter initialized in ${this.isElectron ? 'Electron' : 'Browser'} mode`);
  }

  /**
   * Save JSON data to file
   * @param {Object} data - The data to save
   * @param {string} defaultFilename - Default filename
   * @param {string} filePath - Specific file path to save to (Electron only, null to show dialog)
   * @returns {Promise<{success: boolean, filePath?: string}>} Result with file path if saved
   */
  async saveJSON(data, defaultFilename, filePath = null) {
    const jsonString = JSON.stringify(data, null, 2);

    if (this.isElectron) {
      return this._saveJSONElectron(jsonString, defaultFilename, filePath);
    } else {
      return this._saveJSONBrowser(jsonString, defaultFilename);
    }
  }

  /**
   * Open and read JSON file
   * @returns {Promise<{data: Object, filename: string, filePath?: string}|null>} File data and metadata, or null if canceled
   */
  async openJSON() {
    if (this.isElectron) {
      return this._openJSONElectron();
    } else {
      return this._openJSONBrowser();
    }
  }

  /**
   * Save image from data URL
   * @param {string} dataUrl - Base64 data URL of the image
   * @param {string} defaultFilename - Default filename
   * @returns {Promise<boolean>} true if saved successfully
   */
  async saveImage(dataUrl, defaultFilename) {
    if (this.isElectron) {
      return this._saveImageElectron(dataUrl, defaultFilename);
    } else {
      return this._saveImageBrowser(dataUrl, defaultFilename);
    }
  }

  /**
   * Save PDF from blob
   * @param {Blob} pdfBlob - The PDF blob
   * @param {string} defaultFilename - Default filename
   * @returns {Promise<boolean>} true if saved successfully
   */
  async savePDF(pdfBlob, defaultFilename) {
    if (this.isElectron) {
      return this._savePDFElectron(pdfBlob, defaultFilename);
    } else {
      return this._savePDFBrowser(pdfBlob, defaultFilename);
    }
  }

  /**
   * Show confirmation dialog
   * @param {string} message - The message to display
   * @returns {Promise<boolean>} true if user confirmed
   */
  async confirm(message) {
    if (this.isElectron) {
      return await window.electronAPI.showConfirmDialog(message);
    } else {
      return window.confirm(message);
    }
  }

  /**
   * Show alert dialog
   * @param {string} message - The message to display
   * @param {string} type - Message type (info, warning, error)
   * @returns {Promise<void>}
   */
  async alert(message, type = 'info') {
    if (this.isElectron) {
      await window.electronAPI.showMessageBox({ message, type });
    } else {
      window.alert(message);
    }
  }

  // ============================================================================
  // Electron Implementation Methods
  // ============================================================================

  async _saveJSONElectron(jsonString, defaultFilename, filePath = null) {
    try {
      // If filePath is provided, save directly without dialog
      if (filePath) {
        const saveResult = await window.electronAPI.saveFile(filePath, jsonString);
        return { success: saveResult.success, filePath: filePath };
      }

      // Otherwise, show save dialog
      const result = await window.electronAPI.showSaveDialog(defaultFilename, [
        { name: 'Bani Mind Map', extensions: ['bani'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      if (result.canceled || !result.filePath) {
        return { success: false };
      }

      const saveResult = await window.electronAPI.saveFile(result.filePath, jsonString);
      return { success: saveResult.success, filePath: result.filePath };
    } catch (error) {
      console.error('Error saving JSON in Electron:', error);
      await this.alert('Failed to save file: ' + error.message, 'error');
      return { success: false };
    }
  }

  async _openJSONElectron() {
    try {
      const result = await window.electronAPI.showOpenDialog([
        { name: 'Bani Mind Map', extensions: ['bani'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]);

      if (result.canceled || !result.filePath) {
        return null;
      }

      const readResult = await window.electronAPI.readFile(result.filePath);
      if (!readResult.success) {
        throw new Error(readResult.error);
      }

      // Extract filename from path
      const path = result.filePath;
      const filename = path.split('/').pop().split('\\').pop(); // Handle both Unix and Windows paths

      return {
        data: JSON.parse(readResult.content),
        filename: filename,
        filePath: path
      };
    } catch (error) {
      console.error('Error opening JSON in Electron:', error);
      await this.alert('Failed to open file: ' + error.message, 'error');
      return null;
    }
  }

  async _saveImageElectron(dataUrl, defaultFilename) {
    try {
      const result = await window.electronAPI.saveImage(dataUrl, defaultFilename);
      if (result.canceled) {
        return false;
      }
      if (!result.success) {
        throw new Error(result.error);
      }
      return true;
    } catch (error) {
      console.error('Error saving image in Electron:', error);
      await this.alert('Failed to export image: ' + error.message, 'error');
      return false;
    }
  }

  async _savePDFElectron(pdfBlob, defaultFilename) {
    try {
      // Convert blob to ArrayBuffer for IPC transfer
      const arrayBuffer = await pdfBlob.arrayBuffer();

      const result = await window.electronAPI.savePDF(arrayBuffer, defaultFilename);
      if (result.canceled) {
        return false;
      }
      if (!result.success) {
        throw new Error(result.error);
      }
      return true;
    } catch (error) {
      console.error('Error saving PDF in Electron:', error);
      await this.alert('Failed to export PDF: ' + error.message, 'error');
      return false;
    }
  }

  // ============================================================================
  // Browser Implementation Methods
  // ============================================================================

  async _saveJSONBrowser(jsonString, defaultFilename) {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      this._downloadBlob(blob, defaultFilename);
      return { success: true }; // Browser mode doesn't have file paths
    } catch (error) {
      console.error('Error saving JSON in browser:', error);
      await this.alert('Failed to save file: ' + error.message);
      return { success: false };
    }
  }

  async _openJSONBrowser() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.bani,.json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            resolve({
              data: data,
              filename: file.name,
              filePath: null // Browser doesn't have file paths
            });
          } catch (error) {
            console.error('Error parsing JSON:', error);
            this.alert('Failed to parse file: ' + error.message);
            resolve(null);
          }
        };

        reader.onerror = () => {
          console.error('Error reading file:', reader.error);
          this.alert('Failed to read file: ' + reader.error.message);
          resolve(null);
        };

        reader.readAsText(file);
      };

      input.click();
    });
  }

  async _saveImageBrowser(dataUrl, defaultFilename) {
    try {
      // Handle both blob and data URL
      let blob;
      if (dataUrl instanceof Blob) {
        blob = dataUrl;
      } else {
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        blob = await response.blob();
      }
      this._downloadBlob(blob, defaultFilename);
      return true;
    } catch (error) {
      console.error('Error saving image in browser:', error);
      await this.alert('Failed to export image: ' + error.message);
      return false;
    }
  }

  async _savePDFBrowser(pdfBlob, defaultFilename) {
    try {
      this._downloadBlob(pdfBlob, defaultFilename);
      return true;
    } catch (error) {
      console.error('Error saving PDF in browser:', error);
      await this.alert('Failed to export PDF: ' + error.message);
      return false;
    }
  }

  /**
   * Download blob as file (browser only)
   * @param {Blob} blob - The blob to download
   * @param {string} filename - The filename
   */
  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
