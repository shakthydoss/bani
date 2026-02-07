/**
 * File Manager
 *
 * Handles save/load functionality for .bani files.
 */

import { FILE_VERSION, UI_CONFIG } from '../config/constants.js';
import { getTimestamp, downloadFile } from '../utils/helpers.js';

export class FileManager {
    constructor(cy, state, nodeManager, panelManager) {
        this.cy = cy;
        this.state = state;
        this.nodeManager = nodeManager;
        this.panelManager = panelManager;
        this.fileInput = document.getElementById('fileInput');

        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for file operations
     */
    setupEventHandlers() {
        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.save();
        });

        // Load button - trigger file input
        document.getElementById('loadBtn').addEventListener('click', () => {
            this.fileInput.click();
        });

        // New button
        document.getElementById('newBtn').addEventListener('click', () => {
            this.new();
        });

        // Handle file selection
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                this.load(event.target.result);
            };
            reader.readAsText(file);

            // Reset input so same file can be loaded again
            this.fileInput.value = '';
        });

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
                this.fileInput.click();
            }
            // Ctrl/Cmd + N for new
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.new();
            }
        });
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
    save() {
        const data = this.getMindMapData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const filename = `mindmap-${getTimestamp()}.bani`;

        downloadFile(blob, filename);
        console.log(`✓ Mind map saved: ${filename}`);
    }

    /**
     * Load mind map from file data
     */
    load(data) {
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

            console.log('✓ Mind map loaded successfully');
            return true;
        } catch (err) {
            console.error('Failed to load mind map:', err);
            alert('Failed to load mind map file. Please check the file format.');
            return false;
        }
    }

    /**
     * Create new mind map
     */
    new() {
        if (this.cy.nodes().length > 1 ||
            (this.cy.nodes().length === 1 && this.cy.nodes()[0].data('label') !== 'New Node')) {
            if (!confirm('Create a new mind map? Any unsaved changes will be lost.')) {
                return;
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

        console.log('✓ New mind map created');
    }
}
