import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useOnlineUsersCount } from '../hooks/useOnlineUsers';

/**
 * AnimatedNumber - Smooth spring-based counter animation using Framer Motion
 */
function AnimatedNumber({ value }) {
    const spring = useSpring(value, { mass: 0.5, stiffness: 80, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.max(1, Math.round(current)).toLocaleString('id-ID')
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

/**
 * OnlineUsersWidget - Displays real-time count of online visitors with smart polling & tab visibility
 * 
 * Features:
 * - Smart polling via TanStack Query (auto-pause when tab is inactive)
 * - Animated count transitions via Framer Motion
 * - Active presence indicator
 */
function OnlineUsersWidget({ className = '' }) {
    const { data: onlineCount = 0, isFetching, isError } = useOnlineUsersCount();

    // Don't show widget if there's an error and no count
    if (isError && onlineCount === 0) {
        return null;
    }

    const displayCount = Math.max(1, onlineCount || 1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
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
        </motion.div>
    );
}

export default OnlineUsersWidget;
