/**
 * Node Manager
 *
 * Handles all node-related operations: creation, deletion, updates.
 */

import { getNextNodeId, markUnsaved } from '../core/state.js';
import { DEFAULT_NODE, NODE_OFFSETS } from '../config/constants.js';

export function snapNodeToGrid(node) {
    node.removeStyle('width');
    node.removeStyle('height');
    const w = Math.ceil(node.width() / 20) * 20;
    const h = Math.ceil(node.height() / 20) * 20;
    node.style({ width: w, height: h });
    const pos = node.position();
    node.position({
        x: Math.round((pos.x - w / 2) / 10) * 10 + w / 2,
        y: Math.round((pos.y - h / 2) / 10) * 10 + h / 2
    });
}

export class NodeManager {
    constructor(cy, state) {
        this.cy = cy;
        this.state = state;
    }

    /**
     * Check whether a candidate position is free from nearby nodes.
     */
    isPositionFree(x, y, minDistance = 120) {
        return this.cy.nodes().every((node) => {
            const pos = node.position();
            const dx = pos.x - x;
            const dy = pos.y - y;
            return Math.hypot(dx, dy) >= minDistance;
        });
    }

    /**
     * Find a nearby free position around a preferred coordinate.
     */
    findNearestFreePosition(preferredX, preferredY, step = 110, maxRings = 8) {
        if (this.isPositionFree(preferredX, preferredY)) {
            return { x: preferredX, y: preferredY };
        }

        // Spiral-like ring scan around preferred position.
        for (let ring = 1; ring <= maxRings; ring++) {
            for (let gx = -ring; gx <= ring; gx++) {
                for (let gy = -ring; gy <= ring; gy++) {
                    if (Math.max(Math.abs(gx), Math.abs(gy)) !== ring) continue;

                    const x = preferredX + gx * step;
                    const y = preferredY + gy * step;
                    if (this.isPositionFree(x, y)) {
                        return { x, y };
                    }
                }
            }
        }

        // Fallback if map is dense: push further down-right.
        return {
            x: preferredX + step * (maxRings + 1),
            y: preferredY + step * (maxRings + 1)
        };
    }

    /**
     * Create edge between two nodes.
     */
    createEdge(sourceId, targetId) {
        return this.cy.add({
            group: 'edges',
            data: {
                id: `edge_${sourceId}_${targetId}`,
                source: sourceId,
                target: targetId
            }
        });
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

        snapNodeToGrid(node);

        // If there's a parent, create an edge
        if (parentId) {
            this.createEdge(parentId, nodeId);
        }

        // Mark as unsaved
        markUnsaved();

        return node;
    }

    /**
     * Flash a new child node and its connecting edge, then fade back.
     */
    flashNewChild(childNode) {
        const edge = childNode.connectedEdges();
        childNode.addClass('flash-new');
        edge.addClass('flash-new');

        setTimeout(() => {
            childNode.removeClass('flash-new');
            edge.removeClass('flash-new');
        }, 1200);
    }

    /**
     * Add a child node to the selected node
     */
    addChild(node) {
        const pos = node.position();
        const preferredX = pos.x;
        const preferredY = pos.y + NODE_OFFSETS.CHILD_Y;
        const freePos = this.findNearestFreePosition(preferredX, preferredY);

        const childNode = this.createNode(
            freePos.x,
            freePos.y,
            'Child Node',
            node.id()
        );

        this.flashNewChild(childNode);
        return childNode;
    }

    /**
     * Add a sibling node to the selected node
     */
    addSibling(node) {
        const pos = node.position();
        const parentId = node.data('parentNodeId');
        const freePos = this.findNearestFreePosition(pos.x + NODE_OFFSETS.SIBLING_X, pos.y);
        return this.createNode(
            freePos.x,
            freePos.y,
            'Sibling Node',
            parentId
        );
    }

    /**
     * Add a parent node to the selected node
     */
    addParent(node) {
        const pos = node.position();
        const freePos = this.findNearestFreePosition(pos.x, pos.y + NODE_OFFSETS.PARENT_Y);
        const newParent = this.createNode(
            freePos.x,
            freePos.y,
            'Parent Node'
        );

        // Create edge from new parent to current node
        this.createEdge(newParent.id(), node.id());

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
        snapNodeToGrid(node);
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
