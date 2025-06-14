import React, { useState, useEffect } from 'react';

const PageTransition = ({ children, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(false);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-islamic-green" />
      </div>
    );
  }

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
