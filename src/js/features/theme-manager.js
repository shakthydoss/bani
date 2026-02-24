/**
 * Theme Manager
 * 
 * Handles switching between light and dark modes, persisting preference,
 * and updating the UI and Cytoscape styling.
 */

export class ThemeManager {
    constructor(cy) {
        this.cy = cy;
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.currentTheme = localStorage.getItem('bani-theme') || 'light';
        
        this.init();
    }

    /**
     * Initialize theme and event listeners
     */
    init() {
        // Apply initial theme
        if (this.currentTheme === 'dark') {
            this.body.classList.add('dark-theme');
        }

        // Setup toggle listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Apply theme to Cytoscape
        this.updateCytoscapeStyle();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        if (this.currentTheme === 'dark') {
            this.body.classList.add('dark-theme');
        } else {
            this.body.classList.remove('dark-theme');
        }

        // Save preference
        localStorage.setItem('bani-theme', this.currentTheme);

        // Update Cytoscape style
        this.updateCytoscapeStyle();
    }

    /**
     * Update Cytoscape stylesheet for theme changes
     */
    updateCytoscapeStyle() {
        if (!this.cy) return;

        const isDark = this.currentTheme === 'dark';
        
        // Define theme-aware colors for Cytoscape
        // These match the design system in variables.css
        const edgeColor = isDark ? '#94a3b8' : '#1a1a2e';
        const selectionColor = '#3b82f6';
        const selectionShadow = isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)';
        
        // Update the global edge style and selected node style
        this.cy.style()
            .selector('edge')
                .style('line-color', edgeColor)
            .selector('node:selected')
                .style('border-color', selectionColor)
                .style('box-shadow', `0 0 0 4px ${selectionShadow}`)
            .update();

        // Update existing nodes if they are using default theme colors
        this.cy.nodes().forEach(node => {
            const data = node.data();
            
            // If switching TO dark mode
            if (isDark) {
                // If it looks like light mode default, update to dark mode default
                if (data.bgColor === '#ffffff') node.data('bgColor', '#1e293b');
                if (data.borderColor === '#1a1a2e') node.data('borderColor', '#f8fafc');
                if (data.textColor === '#1a1a2e') node.data('textColor', '#f8fafc');
            } 
            // If switching TO light mode
            else {
                // If it looks like dark mode default, update to light mode default
                if (data.bgColor === '#1e293b') node.data('bgColor', '#ffffff');
                if (data.borderColor === '#f8fafc') node.data('borderColor', '#1a1a2e');
                if (data.textColor === '#f8fafc') node.data('textColor', '#1a1a2e');
            }
        });
    }
}
