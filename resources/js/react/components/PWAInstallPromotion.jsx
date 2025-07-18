import React, { useState, useEffect, useRef } from 'react';
import PWAInstallAd from './PWAInstallAd';
import PWAInstallBanner from './PWAInstallBanner';
import PWAFloatingInstall from './PWAFloatingInstall';

const PWAInstallPromotion = ({ strategy = 'auto' }) => {
    // Temporarily disable all PWA install promotions to prevent reload issues
    return null;
    
    const [currentStrategy, setCurrentStrategy] = useState(strategy);
    const [deviceType, setDeviceType] = useState('desktop');
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Detect device type
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768;
        
        setDeviceType(isMobile && !isTablet ? 'mobile' : isTablet ? 'tablet' : 'desktop');

        // Auto-select strategy based on device and context
        if (strategy === 'auto') {
            // Get visit count safely
            let visitCount = 1;
            try {
                const stored = localStorage.getItem('pwa-visit-count');
                visitCount = stored ? parseInt(stored, 10) + 1 : 1;
                localStorage.setItem('pwa-visit-count', visitCount.toString());
            } catch (error) {
                console.warn('PWA: localStorage not available, using default strategy');
            }

            // Set strategy based on visit count (no page refresh)
            if (visitCount === 1) {
                setCurrentStrategy('modal');
            } else if (visitCount <= 3) {
                setCurrentStrategy('banner');
            } else {
                setCurrentStrategy('floating');
            }
        }
    }, []); // Empty dependency array to run only once

    const renderStrategy = () => {
        switch (currentStrategy) {
            case 'modal':
                return <PWAInstallAd key="modal" />;
            case 'banner':
                return <PWAInstallBanner key="banner" />;
            case 'floating':
                return <PWAFloatingInstall key="floating" />;
            default:
                return null;
        }
    };

    return renderStrategy();
};

export default PWAInstallPromotion;
