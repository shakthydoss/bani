/**
 * Theme Manager
 *
 * Handles light/dark theme toggling with localStorage persistence
 * and system preference detection on first launch.
 */

import { getCytoscapeStyles } from '../config/cytoscape-config.js';

export class ThemeManager {
    constructor(cy) {
        this.cy = cy;
        this.isDark = false;
        this.init();
    }

    init() {
        // Determine initial theme: stored preference > system preference
        const stored = localStorage.getItem('bani-theme');
        if (stored === 'dark') {
            this.isDark = true;
        } else if (stored === 'light') {
            this.isDark = false;
        } else {
            this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        this.applyTheme(this.isDark);

        // UI button
        document.getElementById('themeToggleBtn')?.addEventListener('click', () => this.toggle());

        // Electron menu
        if (window.electronAPI) {
            window.electronAPI.onMenuAction((action) => {
                if (action === 'toggle-dark-mode') this.toggle();
            });
        }
    }

    toggle() {
        this.isDark = !this.isDark;
        localStorage.setItem('bani-theme', this.isDark ? 'dark' : 'light');
        this.applyTheme(this.isDark);
    }

    applyTheme(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Update Cytoscape canvas styles (CSS variables don't reach the canvas)
        this.cy.style(getCytoscapeStyles(isDark)).update();

        // Update toggle button icon
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.setAttribute('aria-pressed', String(isDark));
            btn.querySelector('.icon-sun').style.display = isDark ? 'none' : 'block';
            btn.querySelector('.icon-moon').style.display = isDark ? 'block' : 'none';
        }
    }
}
