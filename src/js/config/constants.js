/**
 * Application Constants
 *
 * Default values, colors, and configuration constants
 * used throughout the Bani application.
 */

// Default node properties
export const DEFAULT_NODE = {
    label: 'New Node',
    title: '',
    description: '',
    bgColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderStyle: 'solid',
    textColor: '#1a1a2e',
    fontSize: 14,
    fontWeight: 400,
    fontStyle: 'normal',
    padding: 14,
    layoutDirection: 'down'
};

// Node positioning offsets
export const NODE_OFFSETS = {
    CHILD_Y: 120,
    SIBLING_X: 150,
    PARENT_Y: -120
};

// Cytoscape interaction settings
export const CYTOSCAPE_CONFIG = {
    minZoom: 0.3,
    maxZoom: 3,
    wheelSensitivity: 0.3,
    boxSelectionEnabled: false
};

// Export settings
export const EXPORT_CONFIG = {
    PNG: {
        scale: 2,
        bg: '#ffffff',
        maxWidth: 4000,
        maxHeight: 4000
    },
    PDF: {
        scale: 2,
        bg: '#ffffff',
        minDimension: 400
    }
};

// File format version
export const FILE_VERSION = '1.0';

// UI constants
export const UI_CONFIG = {
    panelWidth: 220,
    headerHeight: 56
};

// Layout modes
export const LAYOUT_MODES = {
    FREE_FORM: 'free-form',
    HIERARCHY: 'hierarchy',
    RADIAL: 'radial'
};

// Layout directions (for hierarchy mode)
export const LAYOUT_DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// Layout configuration
export const LAYOUT_CONFIG = {
    HIERARCHY: {
        // Distance from parent to first child
        INITIAL_OFFSET: {
            down: { x: 0, y: 120 },
            up: { x: 0, y: -120 },
            right: { x: 180, y: 0 },
            left: { x: -180, y: 0 }
        },
        // Spacing between siblings in same direction
        SIBLING_SPACING: {
            vertical: 100,   // for up/down
            horizontal: 180  // for left/right
        }
    },
    RADIAL: {
        BASE_RADIUS: 150,
        RADIUS_INCREMENT_PER_4_CHILDREN: 20,
        MAX_RADIUS: 300,
        START_ANGLE: -Math.PI / 2  // Start at top (12 o'clock)
    }
};
