/**
 * Export Manager
 *
 * Handles PNG and PDF export functionality.
 */

import { EXPORT_CONFIG } from '../config/constants.js';
import { hideAllMenus } from '../utils/helpers.js';
import { FileAdapter } from '../../../electron-adapter/file-adapter.js';

export class ExportManager {
    constructor(cy) {
        this.cy = cy;
        this.exportBtn = document.getElementById('exportBtn');
        this.exportDropdown = document.getElementById('exportDropdown');
        this.fileAdapter = new FileAdapter();

        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for export functionality
     */
    setupEventHandlers() {
        // Toggle export dropdown
        this.exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.exportDropdown.classList.toggle('active');
        });

        // PNG export
        document.querySelector('[data-export="png"]').addEventListener('click', async () => {
            await this.exportToPNG();
            hideAllMenus();
        });

        // PDF export
        document.querySelector('[data-export="pdf"]').addEventListener('click', async () => {
            await this.exportToPDF();
            hideAllMenus();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-container')) {
                this.exportDropdown.classList.remove('active');
            }
        });

        // Electron menu event handlers
        if (this.fileAdapter.isElectron && window.electronAPI) {
            window.electronAPI.onMenuAction((action) => {
                switch (action) {
                    case 'export-png':
                        this.exportToPNG();
                        break;
                    case 'export-pdf':
                        this.exportToPDF();
                        break;
                }
            });
        }
    }

    /**
     * Export mind map to PNG
     */
    async exportToPNG() {
        try {
            // In Electron, use base64uri for better compatibility
            // In browser, use blob for efficiency
            const outputType = this.fileAdapter.isElectron ? 'base64uri' : 'blob';

            const pngData = this.cy.png({
                output: outputType,
                full: true,
                scale: EXPORT_CONFIG.PNG.scale,
                bg: EXPORT_CONFIG.PNG.bg,
                maxWidth: EXPORT_CONFIG.PNG.maxWidth,
                maxHeight: EXPORT_CONFIG.PNG.maxHeight
            });

            const success = await this.fileAdapter.saveImage(pngData, 'mindmap.png');
            if (success) {
                console.log('✓ Exported to PNG');
            }
        } catch (err) {
            console.error('Failed to export PNG:', err);
            await this.fileAdapter.alert('Failed to export to PNG', 'error');
        }
    }

    /**
     * Export mind map to PDF
     */
    async exportToPDF() {
        try {
            const { jsPDF } = window.jspdf;

            // Get PNG data as base64
            const pngData = this.cy.png({
                output: 'base64uri',
                full: true,
                scale: EXPORT_CONFIG.PDF.scale,
                bg: EXPORT_CONFIG.PDF.bg
            });

            // Get bounding box for sizing
            const bb = this.cy.elements().boundingBox();
            const width = bb.w + 100;
            const height = bb.h + 100;

            // Create PDF with appropriate orientation
            const orientation = width > height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation,
                unit: 'px',
                format: [
                    Math.max(width, EXPORT_CONFIG.PDF.minDimension),
                    Math.max(height, EXPORT_CONFIG.PDF.minDimension)
                ]
            });

            // Add the image to PDF
            pdf.addImage(pngData, 'PNG', 50, 50, width - 100, height - 100);

            // Get PDF as blob
            const pdfBlob = pdf.output('blob');

            // Save using adapter
            const success = await this.fileAdapter.savePDF(pdfBlob, 'mindmap.pdf');
            if (success) {
                console.log('✓ Exported to PDF');
            }
        } catch (err) {
            console.error('Failed to export PDF:', err);
            await this.fileAdapter.alert('Failed to export to PDF', 'error');
        }
    }
}
