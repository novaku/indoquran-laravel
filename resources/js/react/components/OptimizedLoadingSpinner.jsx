import React, { memo } from 'react';

/**
 * Optimized loading spinner with minimal re-renders
 */
const OptimizedLoadingSpinner = memo(({ 
    size = 'md', 
    color = 'green', 
    className = '',
    message = 'Loading...' 
}) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8', 
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };
    
    const colorClasses = {
        green: 'border-green-600',
        blue: 'border-blue-600',
        gray: 'border-gray-600'
    };
    
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div 
                className={`
                    animate-spin rounded-full border-t-2 border-b-2 
                    ${sizeClasses[size]} 
                    ${colorClasses[color]}
                `}
                role="status"
                aria-label={message}
            />
            {message && (
                <p className="mt-2 text-sm text-gray-600" aria-live="polite">
                    {message}
                </p>
            )}
        </div>
    );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';

/**
 * Skeleton loader for better perceived performance
 */
const SkeletonLoader = memo(({ 
    lines = 3, 
    className = '',
    animate = true 
}) => {
    const animationClass = animate ? 'animate-pulse' : '';
    
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }, (_, index) => (
                <div
                    key={index}
                    className={`h-4 bg-gray-200 rounded ${animationClass}`}
                    style={{
                        width: `${Math.random() * 40 + 60}%` // Random width between 60-100%
                    }}
                />
            ))}
        </div>
    );
});

SkeletonLoader.displayName = 'SkeletonLoader';

/**
 * Progressive loading component that shows skeleton first, then content
 */
const ProgressiveLoader = memo(({ 
    isLoading, 
    children, 
    skeleton,
    fallback,
    delay = 200 
}) => {
    const [showSkeleton, setShowSkeleton] = React.useState(true);
    
    React.useEffect(() => {
        if (!isLoading) {
            // Small delay to prevent flash between skeleton and content
            const timer = setTimeout(() => setShowSkeleton(false), delay);
            return () => clearTimeout(timer);
        } else {
            setShowSkeleton(true);
        }
    }, [isLoading, delay]);
    
    if (isLoading || showSkeleton) {
        return skeleton || fallback || <SkeletonLoader />;
    }
    
    return children;
});

ProgressiveLoader.displayName = 'ProgressiveLoader';

export { OptimizedLoadingSpinner, SkeletonLoader, ProgressiveLoader };
export default OptimizedLoadingSpinner;
