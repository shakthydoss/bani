/**
 * Cytoscape Configuration
 *
 * Initializes and configures the Cytoscape.js graph visualization instance.
 */

import { CYTOSCAPE_CONFIG } from './constants.js';

/**
 * Get Cytoscape style configuration
 */
export function getCytoscapeStyles(isDark = false) {
    const edgeColor = isDark ? '#e2e8f0' : '#1a1a2e';
    const flashBg = isDark ? '#1e3a5f' : '#dbeafe';

    return [
        {
            selector: 'node',
            style: {
                // Shape and size
                'shape': 'rectangle',
                'width': 'label',
                'height': 'label',
                'padding': 'data(padding)',

                // Text styling
                'label': 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': '140px',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                'font-size': 'data(fontSize)',
                'font-weight': 'data(fontWeight)',
                'font-style': 'data(fontStyle)',
                'color': 'data(textColor)',

                // Background
                'background-color': 'data(bgColor)',

                // Border (using data properties for dynamic styling)
                'border-width': 'data(borderWidth)',
                'border-color': 'data(borderColor)',
                'border-style': 'data(borderStyle)',

                // Corner radius (square corners)
                'corner-radius': '0px',

                // Transitions for flash effect
                'transition-property': 'border-color, border-width, background-color',
                'transition-duration': '0.6s'
            }
        },
        {
            selector: 'node:selected',
            style: {
                'border-color': '#3b82f6',
                'border-width': 1.5
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 1,
                'line-color': edgeColor,
                'curve-style': 'taxi',
                'taxi-direction': 'auto',
                // Keep orthogonal turns sharp and aligned
                'taxi-radius': 0,
                'taxi-padding': 0,
                'taxi-turn-min-distance': 0,
                'target-arrow-shape': 'none',
                'source-arrow-shape': 'none',
                'transition-property': 'line-color, width',
                'transition-duration': '0.6s'
            }
        },
        {
            selector: 'node.flash-new',
            style: {
                'border-color': '#3b82f6',
                'border-width': 2.5,
                'background-color': flashBg
            }
        },
        {
            selector: 'edge.flash-new',
            style: {
                'line-color': '#3b82f6',
                'width': 2
            }
        }
    ];
}

/**
 * Initialize Cytoscape instance
 */
export function initCytoscape(container) {
    const cy = cytoscape({
        container: container,
        style: getCytoscapeStyles(),
        minZoom: CYTOSCAPE_CONFIG.minZoom,
        maxZoom: CYTOSCAPE_CONFIG.maxZoom,
        wheelSensitivity: CYTOSCAPE_CONFIG.wheelSensitivity,
        boxSelectionEnabled: CYTOSCAPE_CONFIG.boxSelectionEnabled,
        elements: []
    });

    return cy;
}
