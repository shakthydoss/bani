/**
 * File Manager
 *
 * Handles save/load functionality for .bani files.
 */

import { FILE_VERSION, UI_CONFIG } from '../config/constants.js';
import { getTimestamp } from '../utils/helpers.js';
import { FileAdapter } from '../../../electron-adapter/file-adapter.js';
import { markSaved, markUnsaved, setFileName, setFilePath } from '../core/state.js';

export class FileManager {
    constructor(cy, state, nodeManager, panelManager, statusBarManager) {
        this.cy = cy;
        this.state = state;
        this.nodeManager = nodeManager;
        this.panelManager = panelManager;
        this.statusBarManager = statusBarManager;
        this.fileInput = document.getElementById('fileInput');
        this.fileAdapter = new FileAdapter();

        this.setupEventHandlers();
        this.setupFilenameModal();
        this.setupBeforeUnload();
    }

    /**
     * Set up event handlers for file operations
     */
    setupEventHandlers() {
        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.save();
        });

        // Load button
        document.getElementById('loadBtn').addEventListener('click', () => {
            this.open();
        });

        // New button
        document.getElementById('newBtn').addEventListener('click', () => {
            this.new();
        });

        // Handle file selection (fallback for browser mode)
        if (!this.fileAdapter.isElectron) {
            this.fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    this.load(event.target.result, file.name, null);
                };
                reader.readAsText(file);

                // Reset input so same file can be loaded again
                this.fileInput.value = '';
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.save();
            }
            // Ctrl/Cmd + O to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.open();
            }
            // Ctrl/Cmd + N for new
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.new();
            }
        });

        // Electron menu event handlers
        if (this.fileAdapter.isElectron && window.electronAPI) {
            window.electronAPI.onMenuAction((action) => {
                switch (action) {
                    case 'new':
                        this.new();
                        break;
                    case 'open':
                        this.open();
                        break;
                    case 'save':
                        this.save();
                        break;
                }
            });
        }
    }

    /**
     * Get current mind map data for saving
     */
    getMindMapData() {
        const nodes = [];
        const edges = [];

        this.cy.nodes().forEach(node => {
            nodes.push({
                data: node.data(),
                position: node.position()
            });
        });

        this.cy.edges().forEach(edge => {
            edges.push({
                data: edge.data()
            });
        });

        return {
            version: FILE_VERSION,
            created: new Date().toISOString(),
            viewport: {
                zoom: this.cy.zoom(),
                pan: this.cy.pan()
            },
            nodes,
            edges
        };
    }

    /**
     * Save mind map to file
     */
    async save() {
        const data = this.getMindMapData();

        // If this is a new file (untitled), prompt for filename
        if (this.state.currentFileName === 'untitled.bani' && !this.state.currentFilePath) {
            const filename = await this.promptForFilename();
            if (!filename) {
                return; // User canceled
            }

            const result = await this.fileAdapter.saveJSON(data, filename, null);
            if (result.success) {
                // Extract filename from path (Electron) or use provided filename (Browser)
                const savedFilename = result.filePath
                    ? result.filePath.split('/').pop().split('\\').pop()
                    : filename;

                setFileName(savedFilename);
                if (result.filePath) {
                    setFilePath(result.filePath);
                }
                this.statusBarManager.updateFilename(savedFilename);
                markSaved();
                console.log(`✓ Mind map saved: ${savedFilename}`);
            }
        } else {
            // Save to existing file
            const result = await this.fileAdapter.saveJSON(data, this.state.currentFileName, this.state.currentFilePath);
            if (result.success) {
                markSaved();
                console.log(`✓ Mind map saved: ${this.state.currentFileName}`);
            }
        }
    }

    /**
     * Open mind map from file
     */
    async open() {
        // Check for unsaved changes
        if (this.state.hasUnsavedChanges) {
            const shouldSave = await this.confirmSaveChanges();
            if (shouldSave === null) {
                return; // User canceled
            }
            if (shouldSave) {
                await this.save();
            }
        }

        const result = await this.fileAdapter.openJSON();
        if (result) {
            this.load(result.data, result.filename, result.filePath);
        }
    }

    /**
     * Load mind map from file data
     */
    load(data, filename = null, filePath = null) {
        try {
            const mindmap = typeof data === 'string' ? JSON.parse(data) : data;

            // Clear existing graph
            this.cy.elements().remove();

            // Reset node counter
            this.state.nodeIdCounter = 0;

            // Add nodes
            mindmap.nodes.forEach(nodeData => {
                this.cy.add({
                    group: 'nodes',
                    data: nodeData.data,
                    position: nodeData.position
                });

                // Update counter to avoid ID conflicts
                const idNum = parseInt(nodeData.data.id.replace('node_', ''));
                if (idNum > this.state.nodeIdCounter) {
                    this.state.nodeIdCounter = idNum;
                }
            });

            // Add edges
            mindmap.edges.forEach(edgeData => {
                this.cy.add({
                    group: 'edges',
                    data: edgeData.data
                });
            });

            // Restore viewport if available
            if (mindmap.viewport) {
                this.cy.zoom(mindmap.viewport.zoom);
                this.cy.pan(mindmap.viewport.pan);
            } else {
                this.cy.fit(this.cy.elements(), 50);
            }

            // Reset panel
            this.panelManager.disablePanel();

            // Update file tracking
            if (filename) {
                setFileName(filename);
                this.statusBarManager.updateFilename(filename);
            }
            if (filePath) {
                setFilePath(filePath);
            }
            markSaved();

            console.log('✓ Mind map loaded successfully');
            return true;
        } catch (err) {
            console.error('Failed to load mind map:', err);
            this.fileAdapter.alert('Failed to load mind map file. Please check the file format.', 'error');
            return false;
        }
    }

    /**
     * Create new mind map
     */
    async new() {
        // Check for unsaved changes
        if (this.state.hasUnsavedChanges) {
            const shouldSave = await this.confirmSaveChanges();
            if (shouldSave === null) {
                return; // User canceled
            }
            if (shouldSave) {
                await this.save();
            }
        }

        // Clear graph
        this.cy.elements().remove();
        this.state.nodeIdCounter = 0;

        // Create initial node
        this.nodeManager.createInitialNode();

        // Reset view
        this.cy.center();
        this.panelManager.disablePanel();

        // Reset file tracking
        setFileName('untitled.bani');
        setFilePath(null);
        this.statusBarManager.updateFilename('untitled.bani');
        markSaved();

        console.log('✓ New mind map created');
    }

    /**
     * Set up filename prompt modal
     */
    setupFilenameModal() {
        this.filenameModal = document.getElementById('filenameModal');
        this.filenameInput = document.getElementById('filenameInput');
        this.filenameSave = document.getElementById('filenameSave');
        this.filenameCancel = document.getElementById('filenameCancel');

        // Save button handler
        this.filenameSave.addEventListener('click', () => {
            const filename = this.filenameInput.value.trim();
            if (filename) {
                // Resolve the promise (set in promptForFilename)
                if (this.filenameResolve) {
                    this.filenameResolve(filename);
                    this.filenameResolve = null;
                }
                this.hideFilenameModal();
            }
        });

        // Cancel button handler
        this.filenameCancel.addEventListener('click', () => {
            if (this.filenameResolve) {
                this.filenameResolve(null);
                this.filenameResolve = null;
            }
            this.hideFilenameModal();
        });

        // Enter key to save
        this.filenameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.filenameSave.click();
            } else if (e.key === 'Escape') {
                this.filenameCancel.click();
            }
        });

        // Click overlay to cancel
        this.filenameModal.addEventListener('click', (e) => {
            if (e.target === this.filenameModal) {
                this.filenameCancel.click();
            }
        });
    }

    /**
     * Set up beforeunload handler to warn about unsaved changes
     */
    setupBeforeUnload() {
        // Browser mode: beforeunload event
        if (!this.fileAdapter.isElectron) {
            window.addEventListener('beforeunload', (e) => {
                if (this.state.hasUnsavedChanges) {
                    e.preventDefault();
                    e.returnValue = ''; // Modern browsers require this
                }
            });
        }
        // Electron mode: handled in main process via IPC
    }

    /**
     * Show filename prompt modal
     */
    showFilenameModal() {
        this.filenameInput.value = 'untitled';
        this.filenameModal.classList.add('active');
        setTimeout(() => {
            this.filenameInput.select();
        }, 100);
    }

    /**
     * Hide filename prompt modal
     */
    hideFilenameModal() {
        this.filenameModal.classList.remove('active');
        this.filenameInput.value = '';
    }

    /**
     * Prompt user for filename (browser mode only, Electron uses native dialog)
     * @returns {Promise<string|null>} Validated filename with .bani extension, or null if canceled
     */
    async promptForFilename() {
        if (this.fileAdapter.isElectron) {
            // Electron will show native dialog, return default name
            return 'untitled.bani';
        }

        // Browser mode: show custom modal
        return new Promise((resolve) => {
            this.filenameResolve = (input) => {
                if (!input) {
                    resolve(null);
                    return;
                }

                const validated = this.validateFilename(input);
                if (validated) {
                    resolve(validated);
                } else {
                    this.fileAdapter.alert('Invalid filename. Only letters, numbers, hyphens (-) and underscores (_) are allowed.', 'error');
                    resolve(null);
                }
            };

            this.showFilenameModal();
        });
    }

    /**
     * Validate and sanitize filename
     * @param {string} filename - User input filename
     * @returns {string|null} Validated filename with .bani extension, or null if invalid
     */
    validateFilename(filename) {
        // Remove whitespace
        filename = filename.trim();

        // Remove .bani extension if user added it
        if (filename.endsWith('.bani')) {
            filename = filename.slice(0, -5);
        }

        // Validate: only letters, numbers, hyphens, underscores
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(filename)) {
            return null;
        }

        // Add .bani extension
        return filename + '.bani';
    }

    /**
     * Show confirmation dialog for unsaved changes
     * @returns {Promise<boolean|null>} true to save, false to discard, null to cancel
     */
    async confirmSaveChanges() {
        const message = `Save changes to ${this.state.currentFileName}?`;

        if (this.fileAdapter.isElectron) {
            // Use Electron's native dialog with three buttons
            const result = await window.electronAPI.showSaveConfirmDialog(message, this.state.currentFileName);
            // result: 0 = Save, 1 = Don't Save, 2 = Cancel
            if (result === 0) return true;
            if (result === 1) return false;
            return null;
        } else {
            // Browser mode: use simple confirm dialog
            const shouldSave = window.confirm(message + '\n\nClick OK to save, Cancel to discard changes.');
            return shouldSave ? true : false;
        }
    }

    /**
     * Check if there are unsaved changes before closing (called from Electron main process)
     * @returns {boolean}
     */
    hasUnsavedChanges() {
        return this.state.hasUnsavedChanges;
    }
}
