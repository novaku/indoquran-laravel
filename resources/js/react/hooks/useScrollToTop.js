import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop, shouldDisableAutoScroll } from '../utils/scrollUtils';

/**
 * Custom hook to automatically scroll to top on route changes
 * Excludes surah detail pages to allow auto-scroll to specific ayah
 */
const useScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Don't auto-scroll for specific routes (like surah detail pages)
        if (!shouldDisableAutoScroll(location.pathname)) {
            scrollToTop();
        }
    }, [location.pathname]);
};

export default useScrollToTop;
