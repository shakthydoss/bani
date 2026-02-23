/**
 * Node Manager
 *
 * Handles all node-related operations: creation, deletion, updates.
 */

import { getNextNodeId, markUnsaved } from '../core/state.js';
import { DEFAULT_NODE, NODE_OFFSETS } from '../config/constants.js';

export class NodeManager {
    constructor(cy, state) {
        this.cy = cy;
        this.state = state;
    }

    /**
     * Create a new node with default styling
     */
    createNode(x, y, label = DEFAULT_NODE.label, parentId = null) {
        const nodeId = getNextNodeId();

        const node = this.cy.add({
            group: 'nodes',
            data: {
                id: nodeId,
                label: label,
                ...DEFAULT_NODE,
                parentNodeId: parentId
            },
            position: { x, y }
        });

        // If there's a parent, create an edge
        if (parentId) {
            this.cy.add({
                group: 'edges',
                data: {
                    id: `edge_${parentId}_${nodeId}`,
                    source: parentId,
                    target: nodeId
                }
            });
        }

        // Mark as unsaved
        markUnsaved();

        return node;
    }

    /**
     * Add a child node to the selected node
     */
    addChild(node) {
        const pos = node.position();
        return this.createNode(
            pos.x,
            pos.y + NODE_OFFSETS.CHILD_Y,
            'Child Node',
            node.id()
        );
    }

    /**
     * Add a sibling node to the selected node
     */
    addSibling(node) {
        const pos = node.position();
        const parentId = node.data('parentNodeId');
        return this.createNode(
            pos.x + NODE_OFFSETS.SIBLING_X,
            pos.y,
            'Sibling Node',
            parentId
        );
    }

    /**
     * Add a parent node to the selected node
     */
    addParent(node) {
        const pos = node.position();
        const newParent = this.createNode(
            pos.x,
            pos.y + NODE_OFFSETS.PARENT_Y,
            'Parent Node'
        );

        // Create edge from new parent to current node
        this.cy.add({
            group: 'edges',
            data: {
                id: `edge_${newParent.id()}_${node.id()}`,
                source: newParent.id(),
                target: node.id()
            }
        });

        node.data('parentNodeId', newParent.id());
        return newParent;
    }

    /**
     * Delete a node
     */
    deleteNode(node) {
        node.remove();
        markUnsaved();
    }

    /**
     * Update node label format (for nodes with descriptions)
     */
    updateNodeLabel(node) {
        const title = node.data('title');
        const description = node.data('description');

        if (description) {
            node.data('label', `${title}\n─────\n${description}`);
        } else {
            node.data('label', title);
        }

        markUnsaved();
    }

    /**
     * Create initial starter node
     */
    createInitialNode() {
        const centerX = (window.innerWidth - 220) / 2 + 220; // Account for panel
        const centerY = (window.innerHeight - 56) / 2 + 56; // Account for header
        return this.createNode(centerX, centerY, 'New Node');
    }
}
