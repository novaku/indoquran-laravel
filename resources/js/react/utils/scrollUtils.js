import { useEffect, useLayoutEffect } from 'react';

/**
 * Scroll utilities for consistent behavior across the app
 */

/**
 * Scrolls to the top of the page reliably across browsers and async layout rendering.
 * @param {Object} options - Scroll options
 * @param {boolean} options.smooth - Whether to use smooth scroll animation (default: false for page navigation/load)
 */
export const scrollToTop = (options = { smooth: false }) => {
    if (typeof window === 'undefined') return;

    // Ensure browser does not perform conflicting automatic scroll restoration in SPA
    try {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    } catch (e) {
        // Ignore in restricted environments
    }

    const behavior = options?.smooth ? 'smooth' : 'instant';

    const performScroll = () => {
        try {
            window.scrollTo({ top: 0, left: 0, behavior });
        } catch (e) {
            window.scrollTo(0, 0);
        }

        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }
        if (document.body) {
            document.body.scrollTop = 0;
        }
    };

    // 1. Immediate scroll execution
    performScroll();

    // 2. Next animation frame (handles DOM layout reflows)
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
            performScroll();
        });
    }

    // 3. Short timeout fallback (handles React state updates & lazy hydration)
    setTimeout(() => {
        performScroll();
    }, 50);
};

/**
 * Custom React hook to automatically scroll to top when a page mounts
 * or when its internal loading state transitions from true to false.
 * 
 * @param {boolean} isLoading - Current page loading state
 * @param {Array} extraDeps - Optional additional dependency array to trigger scroll-to-top
 */
export const useAutoScrollOnLoad = (isLoading = false, extraDeps = []) => {
    // Initial mount / layout phase
    useLayoutEffect(() => {
        scrollToTop();
    }, []);

    // When loading finishes (isLoading becomes false) or dependencies change
    useEffect(() => {
        if (!isLoading) {
            scrollToTop();
        }
    }, [isLoading, ...extraDeps]);
};

/**
 * Smoothly scrolls to a specific element
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Additional offset from the element (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
    if (typeof window === 'undefined') return;
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
export const scrollToPosition = (position, smooth = true) => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: position, behavior: smooth ? 'smooth' : 'instant' });
};

/**
 * Checks if scroll-to-top should be disabled for current route
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if auto-scroll should be disabled
 */
export const shouldDisableAutoScroll = (pathname) => {
    // Auto-scroll to top is enabled for all routes
    return false;
};

