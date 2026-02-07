/**
 * Cytoscape Configuration
 *
 * Initializes and configures the Cytoscape.js graph visualization instance.
 */

import { CYTOSCAPE_CONFIG } from './constants.js';

/**
 * Get Cytoscape style configuration
 */
export function getCytoscapeStyles() {
    return [
        {
            selector: 'node',
            style: {
                // Shape and size
                'shape': 'round-rectangle',
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

                // Corner radius
                'corner-radius': '8px'
            }
        },
        {
            selector: 'node:selected',
            style: {
                'border-color': '#3b82f6',
                'border-width': 1.5,
                'box-shadow': '0 0 0 4px rgba(59, 130, 246, 0.2)'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 1,
                'line-color': '#1a1a2e',
                'curve-style': 'bezier',
                'target-arrow-shape': 'none',
                'source-arrow-shape': 'none'
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
