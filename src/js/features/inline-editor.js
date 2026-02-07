/**
 * Inline Editor
 *
 * Handles inline text editing for nodes.
 */

export class InlineEditor {
    constructor(cy) {
        this.cy = cy;
        this.inlineEditor = document.getElementById('inlineEditor');
        this.editorTextarea = document.getElementById('editorTextarea');
        this.editingNode = null;

        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for the inline editor
     */
    setupEventHandlers() {
        // Save on blur
        this.editorTextarea.addEventListener('blur', () => {
            this.hide(true);
        });

        // Keyboard shortcuts
        this.editorTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.hide(true);
            } else if (e.key === 'Escape') {
                this.hide(false);
            }
        });

        // Auto-resize textarea
        this.editorTextarea.addEventListener('input', () => {
            this.editorTextarea.style.height = 'auto';
            this.editorTextarea.style.height = this.editorTextarea.scrollHeight + 'px';
        });
    }

    /**
     * Show inline editor for a node
     */
    show(node) {
        this.editingNode = node;
        const pos = node.renderedPosition();
        const zoom = this.cy.zoom();

        // Position editor at node location
        const containerRect = document.getElementById('cy').getBoundingClientRect();
        const x = containerRect.left + pos.x;
        const y = containerRect.top + pos.y;

        this.editorTextarea.value = node.data('label');

        // Auto-size textarea
        this.editorTextarea.style.width = Math.max(120, node.width() * zoom) + 'px';

        this.inlineEditor.style.left = `${x}px`;
        this.inlineEditor.style.top = `${y}px`;
        this.inlineEditor.style.transform = 'translate(-50%, -50%)';
        this.inlineEditor.classList.add('active');

        this.editorTextarea.focus();
        this.editorTextarea.select();
    }

    /**
     * Hide inline editor and optionally save changes
     */
    hide(save = true) {
        if (save && this.editingNode) {
            const newLabel = this.editorTextarea.value.trim() || 'Node';
            this.editingNode.data('label', newLabel);
        }
        this.inlineEditor.classList.remove('active');
        this.editingNode = null;
    }

    /**
     * Check if editor is currently active
     */
    isActive() {
        return this.inlineEditor.classList.contains('active');
    }
}
