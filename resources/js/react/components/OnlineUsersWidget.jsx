import { useState, useEffect, useRef } from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useOnlineUsersCount } from '../hooks/useOnlineUsers';

/**
 * AnimatedNumber - Lightweight, zero-dependency spring/ease counter using requestAnimationFrame
 */
function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(value);
    const prevValueRef = useRef(value);

    useEffect(() => {
        const start = prevValueRef.current;
        const end = value;
        prevValueRef.current = value;
        if (start === end) return;

        const duration = 350;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quad
            const ease = 1 - (1 - progress) * (1 - progress);
            const current = Math.round(start + (end - start) * ease);
            setDisplay(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return <span>{Math.max(1, display).toLocaleString('id-ID')}</span>;
}

/**
 * OnlineUsersWidget - Displays real-time count of online visitors
 * Optimized without heavy framer-motion library (saves ~110KB bundle size)
 */
function OnlineUsersWidget({ className = '' }) {
    const { data: onlineCount = 0, isFetching, isError } = useOnlineUsersCount();

    // Don't show widget if there's an error and no count
    if (isError && onlineCount === 0) {
        return null;
    }

    const displayCount = Math.max(1, onlineCount || 1);

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-xs hover:border-green-300 transition-all ${className}`}
        >
            <div className="relative flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-emerald-600" />
                {isFetching ? (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                ) : (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/80"></span>
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-emerald-800 tracking-tight">
                    <AnimatedNumber value={displayCount} />
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                    online
                </span>
            </div>
        </div>
    );
}

export default OnlineUsersWidget;
