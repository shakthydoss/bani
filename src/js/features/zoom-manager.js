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

        // Electron menu event handlers
        if (window.electronAPI) {
            window.electronAPI.onMenuAction((action) => {
                switch (action) {
                    case 'zoom-in':
                        this.zoomIn();
                        break;
                    case 'zoom-out':
                        this.zoomOut();
                        break;
                    case 'zoom-fit':
                        this.zoomFit();
                        break;
                }
            });
        }
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
