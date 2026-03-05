/**
 * Utility Helper Functions
 *
 * Common helper functions used across the application.
 */

/**
 * Hide all menus (context menus, dropdowns, etc.)
 */
export function hideAllMenus() {
    document.querySelectorAll('.canvas-context-menu, .export-dropdown').forEach(menu => {
        menu.classList.remove('active');
    });
}

/**
 * Get current timestamp for file naming
 */
export function getTimestamp() {
    return new Date().toISOString().slice(0, 10);
}
