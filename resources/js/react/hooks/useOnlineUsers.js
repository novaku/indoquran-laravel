import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../utils/apiUtils';

const ONLINE_COUNT_QUERY_KEY = ['online-users-count'];
const HEARTBEAT_INTERVAL_MS = 120000; // 2 minutes (threshold in backend is 5 minutes)
const POLLING_INTERVAL_MS = 15000; // 15 seconds smart poll

/**
 * Sends a tracking heartbeat to register the visitor as online.
 */
async function trackVisitorPresence() {
    try {
        const response = await fetchWithAuth('/api/online-users/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to track presence: ${response.status}`);
        }

        const result = await response.json();
        return result.status === 'success' && result.data ? result.data.online_count : null;
    } catch (err) {
        // Silently catch to avoid disrupting user experience
        return null;
    }
}

/**
 * Fetches the current online users count.
 */
async function fetchOnlineUsersCount() {
    const response = await fetchWithAuth('/api/online-users/count', {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch online count: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success' && result.data) {
        return Number(result.data.online_count) || 0;
    }

    return 0;
}

/**
 * Global hook to track visitor presence across ALL pages (homepage, surah detail, articles, etc.).
 * Should be mounted once in AppContent.
 */
export function useOnlinePresenceTracker() {
    const queryClient = useQueryClient();
    const lastTrackTimeRef = useRef(0);

    const performTrack = async () => {
        const now = Date.now();
        lastTrackTimeRef.current = now;
        const count = await trackVisitorPresence();
        if (typeof count === 'number') {
            // Instantly sync the count in TanStack Query cache
            queryClient.setQueryData(ONLINE_COUNT_QUERY_KEY, count);
        }
    };

    useEffect(() => {
        // 1. Initial track on app mount
        performTrack();

        // 2. Periodic heartbeat every 2 minutes
        const intervalId = setInterval(() => {
            // Only send heartbeat if document is visible
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                performTrack();
            }
        }, HEARTBEAT_INTERVAL_MS);

        // 3. Track on visibility change / focus if user returns after >90s idle
        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === 'visible') {
                const elapsed = Date.now() - lastTrackTimeRef.current;
                if (elapsed > 90000) {
                    performTrack();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityOrFocus);
        window.addEventListener('focus', handleVisibilityOrFocus);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
            window.removeEventListener('focus', handleVisibilityOrFocus);
        };
    }, [queryClient]);
}

/**
 * Hook to retrieve the real-time count of online users.
 * Utilizes TanStack Query for smart polling, caching, and auto-pause when tab is inactive.
 */
export function useOnlineUsersCount() {
    return useQuery({
        queryKey: ONLINE_COUNT_QUERY_KEY,
        queryFn: fetchOnlineUsersCount,
        refetchInterval: POLLING_INTERVAL_MS,
        refetchIntervalInBackground: false, // PAUSE polling when tab is hidden/minimized
        refetchOnWindowFocus: true, // Instantly refresh when returning to tab
        staleTime: 10000,
        placeholderData: (previousData) => previousData ?? 0,
    });
}
