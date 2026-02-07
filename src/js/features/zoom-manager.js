/**
 * Zoom Manager
 *
 * Handles zoom controls for the canvas.
 */

export class ZoomManager {
    constructor(cy) {
        this.cy = cy;
        this.init();
    }

    init() {
        // Zoom in button
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });

        // Zoom out button
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        // Fit all button
        document.getElementById('zoomFit').addEventListener('click', () => {
            this.zoomFit();
        });
    }

    zoomIn() {
        this.cy.zoom({
            level: this.cy.zoom() * 1.2,
            renderedPosition: {
                x: this.cy.width() / 2,
                y: this.cy.height() / 2
            }
        });
    }

    zoomOut() {
        this.cy.zoom({
            level: this.cy.zoom() / 1.2,
            renderedPosition: {
                x: this.cy.width() / 2,
                y: this.cy.height() / 2
            }
        });
    }

    zoomFit() {
        if (this.cy.elements().length > 0) {
            this.cy.fit(this.cy.elements(), 50);
        }
    }
}
