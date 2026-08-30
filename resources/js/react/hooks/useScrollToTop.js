import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop, shouldDisableAutoScroll } from '../utils/scrollUtils';

/**
 * Custom hook to automatically scroll to top on route changes and page loads
 */
const useScrollToTop = () => {
    const location = useLocation();

    // Disable browser automatic scroll restoration so SPA routing works cleanly
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            try {
                window.history.scrollRestoration = 'manual';
            } catch (e) {}
        }
    }, []);

    // Perform immediate scroll during layout phase before browser paints
    useLayoutEffect(() => {
        if (!shouldDisableAutoScroll(location.pathname)) {
            scrollToTop({ smooth: false });
        }
    }, [location.pathname, location.search, location.key]);

    // Fallback on useEffect for post-render confirmation
    useEffect(() => {
        if (!shouldDisableAutoScroll(location.pathname)) {
            scrollToTop({ smooth: false });
        }
    }, [location.pathname, location.search, location.key]);
};

export default useScrollToTop;

