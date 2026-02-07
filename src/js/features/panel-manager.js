/**
 * Panel Manager
 *
 * Manages the left sidebar panel interactions and node styling.
 */

export class PanelManager {
    constructor(cy, state, nodeManager, modalManager) {
        this.cy = cy;
        this.state = state;
        this.nodeManager = nodeManager;
        this.modalManager = modalManager;
        this.panel = document.getElementById('nodePanel');
        this.panelHint = document.getElementById('panelHint');
        this.addDescBtn = document.getElementById('addDescBtn');
        this.editDescBtn = document.getElementById('editDescBtn');
        this.deleteDescBtn = document.getElementById('deleteDescBtn');

        this.setupEventHandlers();
    }

    /**
     * Set up event handlers for panel interactions
     */
    setupEventHandlers() {
        // Panel action handlers
        this.panel.addEventListener('click', (e) => {
            const item = e.target.closest('[data-action]');
            if (!item || !this.state.selectedNode || this.panel.classList.contains('disabled')) return;

            const action = item.dataset.action;
            const value = item.dataset.value;
            const node = this.state.selectedNode;

            this.handleAction(action, value, node);
        });

        // Submenu toggle handlers
        document.querySelectorAll('.panel-submenu > .panel-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (this.panel.classList.contains('disabled')) return;

                const submenu = item.parentElement;
                const isExpanded = submenu.classList.contains('expanded');

                // Close all other submenus
                document.querySelectorAll('.panel-submenu.expanded').forEach(s => {
                    if (s !== submenu) s.classList.remove('expanded');
                });

                // Toggle this submenu
                submenu.classList.toggle('expanded', !isExpanded);
            });
        });
    }

    /**
     * Handle panel actions
     */
    handleAction(action, value, node) {
        switch (action) {
            case 'add-child': {
                const newNode = this.nodeManager.addChild(node);
                this.enablePanel(newNode);
                break;
            }

            case 'add-sibling': {
                const newNode = this.nodeManager.addSibling(node);
                this.enablePanel(newNode);
                break;
            }

            case 'add-parent': {
                const newNode = this.nodeManager.addParent(node);
                this.enablePanel(newNode);
                break;
            }

            case 'bg-color':
                node.data('bgColor', value);
                break;

            case 'border-color':
                node.data('borderColor', value);
                break;

            case 'border-size':
                node.data('borderWidth', parseInt(value));
                break;

            case 'border-style':
                node.data('borderStyle', value);
                if (value === 'none') {
                    node.data('borderWidth', 0);
                } else if (node.data('borderWidth') === 0) {
                    node.data('borderWidth', 1);
                }
                break;

            case 'text-color':
                node.data('textColor', value);
                break;

            case 'text-size':
                node.data('fontSize', parseInt(value));
                break;

            case 'text-weight':
                node.data('fontWeight', parseInt(value));
                break;

            case 'text-style':
                node.data('fontStyle', value);
                break;

            case 'padding':
                node.data('padding', parseInt(value));
                break;

            case 'add-description':
            case 'edit-description':
                this.modalManager.show(node);
                break;

            case 'delete-description':
                this.modalManager.deleteDescription(node);
                this.enablePanel(node); // Refresh panel state
                break;

            case 'delete-node':
                this.nodeManager.deleteNode(node);
                this.disablePanel();
                break;
        }
    }

    /**
     * Enable the node panel when a node is selected
     */
    enablePanel(node) {
        this.state.selectedNode = node;
        this.panel.classList.remove('disabled');

        // Get node label for display
        const label = node.data('title') || node.data('label');
        const shortLabel = label.length > 20 ? label.substring(0, 20) + '...' : label;
        this.panelHint.textContent = shortLabel;
        this.panelHint.classList.add('active');

        // Update description buttons visibility
        const hasDescription = node.data('description') && node.data('description').trim() !== '';
        if (hasDescription) {
            this.addDescBtn.style.display = 'none';
            this.editDescBtn.style.display = 'flex';
            this.deleteDescBtn.style.display = 'flex';
        } else {
            this.addDescBtn.style.display = 'flex';
            this.editDescBtn.style.display = 'none';
            this.deleteDescBtn.style.display = 'none';
        }
    }

    /**
     * Disable the node panel when no node is selected
     */
    disablePanel() {
        this.state.selectedNode = null;
        this.panel.classList.add('disabled');
        this.panelHint.textContent = 'Select a node to edit';
        this.panelHint.classList.remove('active');

        // Collapse all submenus
        document.querySelectorAll('.panel-submenu.expanded').forEach(submenu => {
            submenu.classList.remove('expanded');
        });
    }
}
