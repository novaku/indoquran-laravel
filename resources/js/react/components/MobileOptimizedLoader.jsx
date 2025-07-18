import React, { memo } from 'react';
import { useMobilePerformance } from '../hooks/useMobilePerformance';

/**
 * Performance-optimized loading component for mobile devices
 * Adapts animation complexity based on device capabilities
 */
const MobileOptimizedLoader = memo(({ 
    isLoading = true, 
    size = 'medium',
    showText = true,
    message = 'Loading...',
    className = ''
}) => {
    const { isLowEndDevice, shouldUseAnimations } = useMobilePerformance();

    if (!isLoading) return null;

    // Size configurations
    const sizeConfig = {
        small: { spinner: 'w-4 h-4', container: 'p-2', text: 'text-xs' },
        medium: { spinner: 'w-8 h-8', container: 'p-4', text: 'text-sm' },
        large: { spinner: 'w-12 h-12', container: 'p-6', text: 'text-base' }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    // Use simpler animation for low-end devices
    const spinnerClass = shouldUseAnimations() && !isLowEndDevice
        ? 'animate-spin' 
        : 'animate-pulse';

    // Simplified spinner for low-end devices
    const SpinnerComponent = isLowEndDevice ? SimpleSpinner : AnimatedSpinner;

    return (
        <div 
            className={`
                fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm
                flex flex-col items-center justify-center z-50
                ${className}
            `}
            role="status"
            aria-live="polite"
            aria-label={message}
        >
            <div className={`flex flex-col items-center ${config.container}`}>
                <SpinnerComponent 
                    className={`${config.spinner} ${spinnerClass}`}
                    isLowEnd={isLowEndDevice}
                />
                
                {showText && (
                    <p className={`
                        mt-3 text-gray-600 font-medium text-center
                        ${config.text}
                    `}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
});

/**
 * Animated spinner for high-end devices
 */
const AnimatedSpinner = memo(({ className }) => (
    <div className={`${className} relative`}>
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
        <div className="relative border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
));

/**
 * Simple spinner for low-end devices (CSS-only animation)
 */
const SimpleSpinner = memo(({ className }) => (
    <div 
        className={`
            ${className} 
            border-2 border-gray-200 border-t-green-500 rounded-full
            animate-pulse
        `}
        style={{
            // Fallback for browsers that don't support CSS animations
            animation: 'pulse 1.5s ease-in-out infinite'
        }}
    />
));

/**
 * Skeleton loader for content placeholders
 */
export const SkeletonLoader = memo(({ 
    lines = 3, 
    className = '',
    showAvatar = false 
}) => {
    const { isLowEndDevice } = useMobilePerformance();
    
    // Reduce animation complexity on low-end devices
    const animationClass = isLowEndDevice ? 'animate-pulse' : 'animate-pulse';
    
    return (
        <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
            {showAvatar && (
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gray-200 rounded-full ${animationClass}`}></div>
                    <div className="flex-1 space-y-2">
                        <div className={`h-4 bg-gray-200 rounded w-3/4 ${animationClass}`}></div>
                        <div className={`h-3 bg-gray-200 rounded w-1/2 ${animationClass}`}></div>
                    </div>
                </div>
            )}
            
            {Array.from({ length: lines }).map((_, index) => (
                <div 
                    key={index}
                    className={`
                        h-4 bg-gray-200 rounded ${animationClass}
                        ${index === lines - 1 ? 'w-3/4' : 'w-full'}
                    `}
                    style={{
                        // Stagger animation slightly for better visual effect
                        animationDelay: `${index * 100}ms`
                    }}
                ></div>
            ))}
        </div>
    );
});

/**
 * Lazy loading wrapper with performance optimization
 */
export const LazyLoadWrapper = memo(({ 
    children, 
    fallback = <MobileOptimizedLoader />,
    threshold = 0.1,
    rootMargin = '50px'
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const elementRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsVisible(true);
                    setHasLoaded(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin, hasLoaded]);

    return (
        <div ref={elementRef}>
            {isVisible ? children : fallback}
        </div>
    );
});

// Add display names for debugging
MobileOptimizedLoader.displayName = 'MobileOptimizedLoader';
AnimatedSpinner.displayName = 'AnimatedSpinner';
SimpleSpinner.displayName = 'SimpleSpinner';
SkeletonLoader.displayName = 'SkeletonLoader';
LazyLoadWrapper.displayName = 'LazyLoadWrapper';

export default MobileOptimizedLoader;
