import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to ensure Google AdSense runs cleanly on route transitions
 * and explicitly suppresses full-screen vignette ads by tagging links with data-google-vignette="false".
 */
export default function useAdSense() {
    const location = useLocation();

    // Prevent Google AdSense from triggering full-screen vignette ads
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const preventVignetteOnLinks = (e) => {
            try {
                const target = e.target;
                if (!target || typeof target.closest !== 'function') return;

                const link = target.closest('a');
                if (link && !link.hasAttribute('data-google-vignette')) {
                    link.setAttribute('data-google-vignette', 'false');
                }
            } catch (err) {
                // Ignore any DOM traversal edge-cases
            }
        };

        // Capture phase to intercept before AdSense click listeners fire
        document.addEventListener('pointerdown', preventVignetteOnLinks, { capture: true, passive: true });
        document.addEventListener('click', preventVignetteOnLinks, { capture: true, passive: true });

        return () => {
            document.removeEventListener('pointerdown', preventVignetteOnLinks, { capture: true });
            document.removeEventListener('click', preventVignetteOnLinks, { capture: true });
        };
    }, []);

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

