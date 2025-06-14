import React, { memo } from 'react';

// Lightweight, optimized loading spinner component
const LoadingSpinner = memo(({ size = 'md', color = 'islamic-green', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent border-${color} ${sizeClasses[size]} ${className}`} />
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
