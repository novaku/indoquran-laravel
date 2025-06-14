import React, { useState, useEffect } from 'react';

function ScrollIndicator() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (totalScroll / windowHeight) * 100;
            
            setScrollProgress(progress);
            setIsVisible(totalScroll > 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200/50">
            <div 
                className="h-full bg-gradient-to-r from-islamic-green to-islamic-gold transition-all duration-150 ease-out"
                style={{ width: `${scrollProgress}%` }}
            />
        </div>
    );
}

export default ScrollIndicator;
