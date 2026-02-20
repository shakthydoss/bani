/**
 * Layout Manager
 *
 * Manages layout modes (free-form, hierarchy, radial) and controls
 * node positioning, dragging behavior, and auto-repositioning.
 */

import { LAYOUT_MODES, LAYOUT_DIRECTIONS, LAYOUT_CONFIG } from '../config/constants.js';
import { getLayoutMode, setLayoutMode } from '../core/state.js';

export class LayoutManager {
    constructor(cy, state) {
        this.cy = cy;
        this.state = state;
        this.draggingEnabled = true;
        this.setupDragHandlers();
    }

    /**
     * Get current layout mode
     */
    getCurrentMode() {
        return getLayoutMode();
    }

    /**
     * Switch to a new layout mode
     */
    switchMode(newMode) {
        const oldMode = this.getCurrentMode();
        if (oldMode === newMode) return;

        setLayoutMode(newMode);

        // Enable/disable dragging based on mode
        if (newMode === LAYOUT_MODES.FREE_FORM) {
            this.setDraggingEnabled(true);
        } else {
            this.setDraggingEnabled(false);
        }

        console.log(`✓ Layout mode switched from ${oldMode} to ${newMode}`);
    }

    /**
     * Enable or disable node dragging
     */
    setDraggingEnabled(enabled) {
        this.draggingEnabled = enabled;

        if (enabled) {
            // Enable dragging for all nodes
            this.cy.nodes().forEach(node => {
                node.grabify();
            });
        } else {
            // Disable dragging for all nodes
            this.cy.nodes().forEach(node => {
                node.ungrabify();
            });
        }
    }

    /**
     * Calculate position for a new child node
     */
    calculateChildPosition(parent, direction = LAYOUT_DIRECTIONS.DOWN) {
        const mode = this.getCurrentMode();

        switch (mode) {
            case LAYOUT_MODES.HIERARCHY:
                return this.calculateHierarchyPosition(parent, direction);
            case LAYOUT_MODES.RADIAL:
                return this.calculateRadialPosition(parent);
            case LAYOUT_MODES.FREE_FORM:
            default:
                return this.calculateFreeFormPosition(parent);
        }
    }

    /**
     * Calculate position for free-form mode (default offset)
     */
    calculateFreeFormPosition(parent) {
        const pos = parent.position();
        return {
            x: pos.x,
            y: pos.y + 120  // Default offset below parent
        };
    }

    /**
     * Calculate position for hierarchy mode
     */
    calculateHierarchyPosition(parent, direction) {
        const parentPos = parent.position();
        const config = LAYOUT_CONFIG.HIERARCHY;

        // Get all existing siblings in the same direction
        const siblings = this.getSiblingsInDirection(parent, direction);

        if (siblings.length === 0) {
            // First child in this direction - use initial offset
            const offset = config.INITIAL_OFFSET[direction];
            return {
                x: parentPos.x + offset.x,
                y: parentPos.y + offset.y
            };
        }

        // Calculate position based on direction
        switch (direction) {
            case LAYOUT_DIRECTIONS.DOWN:
                // Stack vertically below existing siblings
                const lowestSibling = siblings.reduce((lowest, node) =>
                    node.position().y > lowest.position().y ? node : lowest
                );
                return {
                    x: parentPos.x,  // Maintain vertical alignment
                    y: lowestSibling.position().y + config.SIBLING_SPACING.vertical
                };

            case LAYOUT_DIRECTIONS.UP:
                // Stack vertically above existing siblings
                const highestSibling = siblings.reduce((highest, node) =>
                    node.position().y < highest.position().y ? node : highest
                );
                return {
                    x: parentPos.x,  // Maintain vertical alignment
                    y: highestSibling.position().y - config.SIBLING_SPACING.vertical
                };

            case LAYOUT_DIRECTIONS.RIGHT:
                // Arrange horizontally to the right
                const rightmostSibling = siblings.reduce((rightmost, node) =>
                    node.position().x > rightmost.position().x ? node : rightmost
                );
                return {
                    x: rightmostSibling.position().x + config.SIBLING_SPACING.horizontal,
                    y: parentPos.y  // Maintain horizontal alignment
                };

            case LAYOUT_DIRECTIONS.LEFT:
                // Arrange horizontally to the left
                const leftmostSibling = siblings.reduce((leftmost, node) =>
                    node.position().x < leftmost.position().x ? node : leftmost
                );
                return {
                    x: leftmostSibling.position().x - config.SIBLING_SPACING.horizontal,
                    y: parentPos.y  // Maintain horizontal alignment
                };

            default:
                return this.calculateFreeFormPosition(parent);
        }
    }

    /**
     * Calculate position for radial mode
     */
    calculateRadialPosition(parent) {
        const parentPos = parent.position();
        const config = LAYOUT_CONFIG.RADIAL;

        // Get all existing children
        const children = this.getChildrenOfNode(parent);
        const childCount = children.length + 1; // +1 for the new child

        // Calculate dynamic radius
        const radiusIncrement = Math.floor(childCount / 4) * config.RADIUS_INCREMENT_PER_4_CHILDREN;
        const radius = Math.min(config.BASE_RADIUS + radiusIncrement, config.MAX_RADIUS);

        // Calculate angle for the new child
        const angleStep = (2 * Math.PI) / childCount;
        const angle = config.START_ANGLE + (children.length * angleStep);

        return {
            x: parentPos.x + radius * Math.cos(angle),
            y: parentPos.y + radius * Math.sin(angle)
        };
    }

    /**
     * Reposition radial children (called after add/remove)
     */
    repositionRadialChildren(parent) {
        const children = this.getChildrenOfNode(parent);
        if (children.length === 0) return;

        const parentPos = parent.position();
        const config = LAYOUT_CONFIG.RADIAL;

        // Calculate radius based on child count
        const childCount = children.length;
        const radiusIncrement = Math.floor(childCount / 4) * config.RADIUS_INCREMENT_PER_4_CHILDREN;
        const radius = Math.min(config.BASE_RADIUS + radiusIncrement, config.MAX_RADIUS);

        // Distribute children evenly around circle
        const angleStep = (2 * Math.PI) / childCount;

        this.cy.batch(() => {
            children.forEach((child, index) => {
                const angle = config.START_ANGLE + (index * angleStep);
                child.position({
                    x: parentPos.x + radius * Math.cos(angle),
                    y: parentPos.y + radius * Math.sin(angle)
                });
            });
        });
    }

    /**
     * Redistribute hierarchy children in a direction (called after node deletion)
     */
    redistributeHierarchyChildren(parent, direction) {
        const siblings = this.getSiblingsInDirection(parent, direction);
        if (siblings.length === 0) return;

        const parentPos = parent.position();
        const config = LAYOUT_CONFIG.HIERARCHY;
        const offset = config.INITIAL_OFFSET[direction];

        this.cy.batch(() => {
            siblings.forEach((sibling, index) => {
                let newPos;

                switch (direction) {
                    case LAYOUT_DIRECTIONS.DOWN:
                        newPos = {
                            x: parentPos.x,
                            y: parentPos.y + offset.y + (index * config.SIBLING_SPACING.vertical)
                        };
                        break;

                    case LAYOUT_DIRECTIONS.UP:
                        newPos = {
                            x: parentPos.x,
                            y: parentPos.y + offset.y - (index * config.SIBLING_SPACING.vertical)
                        };
                        break;

                    case LAYOUT_DIRECTIONS.RIGHT:
                        newPos = {
                            x: parentPos.x + offset.x + (index * config.SIBLING_SPACING.horizontal),
                            y: parentPos.y
                        };
                        break;

                    case LAYOUT_DIRECTIONS.LEFT:
                        newPos = {
                            x: parentPos.x + offset.x - (index * config.SIBLING_SPACING.horizontal),
                            y: parentPos.y
                        };
                        break;
                }

                if (newPos) {
                    sibling.position(newPos);
                }
            });
        });
    }

    /**
     * Handle node deletion and auto-reposition siblings
     */
    onNodeDeleted(deletedNode) {
        const mode = this.getCurrentMode();
        if (mode === LAYOUT_MODES.FREE_FORM) return;

        const parentId = deletedNode.data('parentNodeId');
        if (!parentId) return;

        const parent = this.cy.getElementById(parentId);
        if (!parent || parent.length === 0) return;

        if (mode === LAYOUT_MODES.RADIAL) {
            // Redistribute all children in radial pattern
            this.repositionRadialChildren(parent);
        } else if (mode === LAYOUT_MODES.HIERARCHY) {
            // Redistribute siblings in the same direction
            const direction = deletedNode.data('layoutDirection');
            if (direction) {
                this.redistributeHierarchyChildren(parent, direction);
            }
        }
    }

    /**
     * Handle child addition and auto-reposition (for radial mode)
     */
    onChildAdded(parent) {
        const mode = this.getCurrentMode();
        if (mode === LAYOUT_MODES.RADIAL) {
            // Redistribute all children in radial pattern
            this.repositionRadialChildren(parent);
        }
    }

    /**
     * Get all children of a node
     */
    getChildrenOfNode(parent) {
        return this.cy.nodes().filter(node =>
            node.data('parentNodeId') === parent.id()
        );
    }

    /**
     * Get all children in a specific direction (hierarchy mode)
     */
    getSiblingsInDirection(parent, direction) {
        return this.cy.nodes().filter(node =>
            node.data('parentNodeId') === parent.id() &&
            node.data('layoutDirection') === direction
        );
    }

    /**
     * Get all descendants of a node (recursive)
     */
    getAllDescendants(node) {
        const descendants = [];
        const children = this.getChildrenOfNode(node);

        children.forEach(child => {
            descendants.push(child);
            descendants.push(...this.getAllDescendants(child));
        });

        return descendants;
    }

    /**
     * Setup drag handlers for parent drag synchronization
     */
    setupDragHandlers() {
        let draggedNodePrevPos = { x: 0, y: 0 };

        // Store initial position when drag starts
        this.cy.on('grab', 'node', (e) => {
            const node = e.target;
            draggedNodePrevPos = { ...node.position() };
        });

        // Synchronize children during drag
        this.cy.on('drag', 'node', (e) => {
            const mode = this.getCurrentMode();
            if (mode === LAYOUT_MODES.FREE_FORM) return;

            const node = e.target;
            const currentPos = node.position();

            // Calculate offset from previous position
            const dx = currentPos.x - draggedNodePrevPos.x;
            const dy = currentPos.y - draggedNodePrevPos.y;

            // Move all descendants by the same offset
            const descendants = this.getAllDescendants(node);
            this.cy.batch(() => {
                descendants.forEach(descendant => {
                    const pos = descendant.position();
                    descendant.position({
                        x: pos.x + dx,
                        y: pos.y + dy
                    });
                });
            });

            // Update previous position
            draggedNodePrevPos = { ...currentPos };
        });
    }
}
