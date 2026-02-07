/**
 * Modal Manager
 *
 * Handles the description modal for nodes.
 */

export class ModalManager {
    constructor(cy, nodeManager) {
        this.cy = cy;
        this.nodeManager = nodeManager;
        this.modal = document.getElementById('descriptionModal');
        this.titleInput = document.getElementById('descriptionTitle');
        this.textInput = document.getElementById('descriptionText');
        this.descriptionNode = null;

        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for the modal
     */
    setupEventHandlers() {
        // Close buttons
        document.getElementById('modalClose').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('modalCancel').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('modalSave').addEventListener('click', () => {
            this.save();
        });

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Keyboard shortcuts in title input
        this.titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.textInput.focus();
            }
            if (e.key === 'Escape') {
                this.hide();
            }
        });

        // Keyboard shortcuts in description textarea
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
            // Ctrl/Cmd + Enter to save
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.save();
            }
        });
    }

    /**
     * Show description modal for a node
     */
    show(node) {
        this.descriptionNode = node;

        // If node has description, use title and description
        // Otherwise, use current label as title
        if (node.data('description') && node.data('description').trim() !== '') {
            this.titleInput.value = node.data('title') || node.data('label');
            this.textInput.value = node.data('description');
        } else {
            this.titleInput.value = node.data('label');
            this.textInput.value = '';
        }

        this.modal.classList.add('active');
        this.titleInput.focus();
    }

    /**
     * Hide description modal
     */
    hide() {
        this.modal.classList.remove('active');
        this.descriptionNode = null;
    }

    /**
     * Save description to node
     */
    save() {
        if (!this.descriptionNode) return;

        const title = this.titleInput.value.trim() || 'Node';
        const description = this.textInput.value.trim();

        if (description) {
            // Node has description - show as title + body
            this.descriptionNode.data('title', title);
            this.descriptionNode.data('description', description);
            // Update label to show title + description
            this.nodeManager.updateNodeLabel(this.descriptionNode);
        } else {
            // No description - just update the label
            this.descriptionNode.data('label', title);
            this.descriptionNode.data('title', '');
            this.descriptionNode.data('description', '');
        }

        this.hide();
    }

    /**
     * Delete description from node
     */
    deleteDescription(node) {
        const title = node.data('title') || node.data('label');
        node.data('label', title);
        node.data('title', '');
        node.data('description', '');
    }
}
