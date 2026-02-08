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
    lastClickPosition: { x: 0, y: 0 },
    // File tracking
    currentFileName: 'untitled.bani',
    currentFilePath: null, // Full path in Electron mode
    hasUnsavedChanges: false,
    // Callback for UI updates when unsaved state changes
    onUnsavedChange: null
};

/**
 * Initialize or reset application state
 */
export function initState() {
    state.nodeIdCounter = 0;
    state.selectedNode = null;
    state.contextMenuTarget = null;
    state.lastClickPosition = { x: 0, y: 0 };
    state.currentFileName = 'untitled.bani';
    state.currentFilePath = null;
    state.hasUnsavedChanges = false;
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

/**
 * Mark that there are unsaved changes
 */
export function markUnsaved() {
    if (!state.hasUnsavedChanges) {
        state.hasUnsavedChanges = true;
        if (state.onUnsavedChange) {
            state.onUnsavedChange(true);
        }
    }
}

/**
 * Mark that all changes are saved
 */
export function markSaved() {
    if (state.hasUnsavedChanges) {
        state.hasUnsavedChanges = false;
        if (state.onUnsavedChange) {
            state.onUnsavedChange(false);
        }
    }
}

/**
 * Set the current file name
 */
export function setFileName(fileName) {
    state.currentFileName = fileName;
}

/**
 * Set the current file path (Electron only)
 */
export function setFilePath(filePath) {
    state.currentFilePath = filePath;
}
