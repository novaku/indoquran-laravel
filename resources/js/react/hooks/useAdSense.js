import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to ensure Google AdSense runs on every page transition except admin routes.
 */
export default function useAdSense() {
    const location = useLocation();

    useEffect(() => {
        // Skip on admin routes
        if (location.pathname.startsWith('/admin')) {
            return;
        }

        // On route change in non-admin routes, notify AdSense
        if (typeof window !== 'undefined') {
            try {
                window.adsbygoogle = window.adsbygoogle || [];
            } catch (e) {
                // Silently catch in case of restricted environment
            }
        }
    }, [location.pathname]);
}
