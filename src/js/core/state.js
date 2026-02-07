/**
 * Application State Management
 *
 * Global state for the Bani application.
 * Keeps track of node IDs, selections, and UI state.
 */

export const state = {
    nodeIdCounter: 0,
    selectedNode: null,
    contextMenuTarget: null,
    lastClickPosition: { x: 0, y: 0 }
};

/**
 * Initialize or reset application state
 */
export function initState() {
    state.nodeIdCounter = 0;
    state.selectedNode = null;
    state.contextMenuTarget = null;
    state.lastClickPosition = { x: 0, y: 0 };
    return state;
}

/**
 * Update last click position
 */
export function updateClickPosition(x, y) {
    state.lastClickPosition = { x, y };
}

/**
 * Set selected node
 */
export function setSelectedNode(node) {
    state.selectedNode = node;
}

/**
 * Clear selected node
 */
export function clearSelectedNode() {
    state.selectedNode = null;
}

/**
 * Increment and return new node ID
 */
export function getNextNodeId() {
    return `node_${++state.nodeIdCounter}`;
}
