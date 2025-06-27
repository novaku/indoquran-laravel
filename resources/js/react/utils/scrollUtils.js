/**
 * Scroll utilities for consistent behavior across the app
 */

/**
 * Smoothly scrolls to the top of the page
 */
export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Smoothly scrolls to a specific element
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Additional offset from the element (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
};

/**
 * Scrolls to a specific position
 * @param {number} position - The Y position to scroll to
 */
export const scrollToPosition = (position) => {
    window.scrollTo({ top: position, behavior: 'smooth' });
};

/**
 * Checks if scroll-to-top should be disabled for current route
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if auto-scroll should be disabled
 */
export const shouldDisableAutoScroll = (pathname) => {
    // Disable auto-scroll for surah detail pages
    return /^\/surah\/\d+/.test(pathname);
};
