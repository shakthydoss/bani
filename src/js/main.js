/**
 * Bani - Main Application Entry Point
 *
 * Initializes all modules and starts the application.
 */

// Core modules
import { state, initState, updateClickPosition } from './core/state.js';
import { initCytoscape } from './config/cytoscape-config.js';

// Feature modules
import { NodeManager } from './features/node-manager.js';
import { PanelManager } from './features/panel-manager.js';
import { ZoomManager } from './features/zoom-manager.js';
import { InlineEditor } from './features/inline-editor.js';
import { ModalManager } from './features/modal-manager.js';
import { FileManager } from './features/file-manager.js';
import { ExportManager } from './features/export-manager.js';

/**
 * Application class
 */
class BaniApp {
    constructor() {
        // Initialize state
        initState();

        // Initialize Cytoscape
        this.cy = initCytoscape(document.getElementById('cy'));

        // Initialize feature managers (order matters for dependencies)
        this.nodeManager = new NodeManager(this.cy, state);
        this.modalManager = new ModalManager(this.cy, this.nodeManager);
        this.panelManager = new PanelManager(this.cy, state, this.nodeManager, this.modalManager);
        this.inlineEditor = new InlineEditor(this.cy);
        this.fileManager = new FileManager(this.cy, state, this.nodeManager, this.panelManager);
        this.exportManager = new ExportManager(this.cy);
        this.zoomManager = new ZoomManager(this.cy);

        // Set up event handlers
        this.setupCytoscapeEvents();
        this.setupCanvasContextMenu();
        this.setupGlobalEvents();

        // Create initial node
        this.nodeManager.createInitialNode();

        // Center the view
        setTimeout(() => {
            this.cy.center();
        }, 100);

        // Expose to window for debugging
        window.bani = {
            cy: this.cy,
            state,
            nodeManager: this.nodeManager,
            panelManager: this.panelManager,
            fileManager: this.fileManager,
            exportManager: this.exportManager,
            zoomManager: this.zoomManager
        };

        console.log('✨ Bani initialized successfully!');
    }

    /**
     * Set up Cytoscape event handlers
     */
    setupCytoscapeEvents() {
        // Node selection
        this.cy.on('tap', 'node', (e) => {
            this.panelManager.enablePanel(e.target);
            this.hideCanvasMenu();
        });

        // Deselect on canvas click
        this.cy.on('tap', (e) => {
            if (e.target === this.cy) {
                this.panelManager.disablePanel();
                this.hideCanvasMenu();
                this.inlineEditor.hide(true);
            }
        });

        // Double-click to edit
        this.cy.on('dblclick', 'node', (e) => {
            e.preventDefault();
            const node = e.target;

            // If node has description, open modal for editing
            if (node.data('description') && node.data('description').trim() !== '') {
                this.modalManager.show(node);
            } else {
                // Otherwise, use inline editor for simple text
                this.inlineEditor.show(node);
            }
        });

        // Right-click on node - also select it
        this.cy.on('cxttap', 'node', (e) => {
            e.preventDefault();
            this.panelManager.enablePanel(e.target);
            this.hideCanvasMenu();
        });

        // Right-click on canvas - show add node menu
        this.cy.on('cxttap', (e) => {
            if (e.target === this.cy) {
                e.preventDefault();
                updateClickPosition(e.position.x, e.position.y);
                this.showCanvasMenu(e.originalEvent.clientX, e.originalEvent.clientY);
            }
        });
    }

    /**
     * Set up canvas context menu
     */
    setupCanvasContextMenu() {
        const canvasContextMenu = document.getElementById('canvasContextMenu');

        // Add Node action
        document.querySelector('.canvas-menu-item[data-action="add-node"]').addEventListener('click', () => {
            this.nodeManager.createNode(state.lastClickPosition.x, state.lastClickPosition.y);
            this.hideCanvasMenu();
        });
    }

    /**
     * Set up global event handlers
     */
    setupGlobalEvents() {
        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.canvas-context-menu') &&
                !e.target.closest('.export-container') &&
                !e.target.closest('#cy')) {
                this.hideCanvasMenu();
            }
        });

        // Close menus on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCanvasMenu();
                this.inlineEditor.hide(false);
                document.getElementById('exportDropdown').classList.remove('active');
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.cy.resize();
        });
    }

    /**
     * Show canvas context menu at position
     */
    showCanvasMenu(x, y) {
        const menu = document.getElementById('canvasContextMenu');
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('active');
    }

    /**
     * Hide canvas context menu
     */
    hideCanvasMenu() {
        document.getElementById('canvasContextMenu').classList.remove('active');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BaniApp();
});
