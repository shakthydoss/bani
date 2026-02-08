/**
 * Status Bar Manager
 *
 * Manages the status bar UI showing filename and unsaved changes indicator.
 */

export class StatusBarManager {
    constructor(state) {
        this.state = state;
        this.statusBar = document.getElementById('statusBar');
        this.statusFilename = document.getElementById('statusFilename');
        this.statusUnsaved = document.getElementById('statusUnsaved');

        // Set up callback for state changes
        this.state.onUnsavedChange = (hasUnsaved) => {
            this.updateUnsavedIndicator(hasUnsaved);
        };

        // Initialize UI
        this.updateFilename(this.state.currentFileName);
        this.updateUnsavedIndicator(this.state.hasUnsavedChanges);
    }

    /**
     * Update the filename display
     */
    updateFilename(filename) {
        this.statusFilename.textContent = filename;
    }

    /**
     * Update the unsaved changes indicator
     */
    updateUnsavedIndicator(hasUnsaved) {
        if (hasUnsaved) {
            this.statusUnsaved.style.display = 'flex';
        } else {
            this.statusUnsaved.style.display = 'none';
        }
    }

    /**
     * Update both filename and unsaved state
     */
    update(filename, hasUnsaved) {
        this.updateFilename(filename);
        this.updateUnsavedIndicator(hasUnsaved);
    }
}
