import { useState, useEffect } from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';

/**
 * OnlineUsersWidget - Displays real-time count of online visitors
 * 
 * Features:
 * - Automatically tracks visitor presence via heartbeat
 * - Updates count every 30 seconds
 * - Lightweight and optimized for performance
 * - Shows animated pulse when updating
 */
function OnlineUsersWidget() {
    const [onlineCount, setOnlineCount] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(false);

    // Track this visitor and get online count
    const trackVisitor = async () => {
        try {
            setIsUpdating(true);
            const response = await fetchWithAuth('/api/online-users/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to track visitor');
            }

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                setOnlineCount(result.data.online_count || 0);
                setError(false);
            }
        } catch (err) {
            console.error('Error tracking visitor:', err);
            setError(true);
            // Don't update count on error to keep last known value
        } finally {
            setTimeout(() => setIsUpdating(false), 500);
        }
    };

    // Get current online count without tracking
    const fetchOnlineCount = async () => {
        try {
            setIsUpdating(true);
            const response = await fetchWithAuth('/api/online-users/count', {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch online count');
            }

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                setOnlineCount(result.data.online_count || 0);
                setError(false);
            }
        } catch (err) {
            console.error('Error fetching online count:', err);
            setError(true);
        } finally {
            setTimeout(() => setIsUpdating(false), 500);
        }
    };

    useEffect(() => {
        // Initial track on mount
        trackVisitor();

        // Send heartbeat every 2 minutes (120 seconds)
        // This is well within the 5-minute threshold to keep user counted as online
        const heartbeatInterval = setInterval(() => {
            trackVisitor();
        }, 120000); // 2 minutes

        // Update display count more frequently (every 30 seconds)
        const updateInterval = setInterval(() => {
            fetchOnlineCount();
        }, 30000); // 30 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(updateInterval);
        };
    }, []); // Empty deps - only run on mount/unmount

    // Don't show widget if there's an error and no count
    if (error && onlineCount === 0) {
        return null;
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
            <div className="relative">
                <UsersIcon className="h-4 w-4 text-green-600" />
                {isUpdating && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-green-700">
                    {onlineCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-green-600">
                    online
                </span>
            </div>
        </div>
    );
}

export default OnlineUsersWidget;
