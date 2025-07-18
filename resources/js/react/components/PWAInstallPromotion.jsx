import React, { useState, useEffect } from 'react';
import PWAInstallAd from './PWAInstallAd';
import PWAInstallBanner from './PWAInstallBanner';
import PWAFloatingInstall from './PWAFloatingInstall';

const PWAInstallPromotion = ({ strategy = 'auto' }) => {
    const [currentStrategy, setCurrentStrategy] = useState(strategy);
    const [deviceType, setDeviceType] = useState('desktop');

    useEffect(() => {
        // Detect device type
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768;
        
        setDeviceType(isMobile && !isTablet ? 'mobile' : isTablet ? 'tablet' : 'desktop');

        // Auto-select strategy based on device and context
        if (strategy === 'auto') {
            const visitCount = parseInt(localStorage.getItem('visit-count') || '0') + 1;
            localStorage.setItem('visit-count', visitCount.toString());

            if (visitCount === 1) {
                // First visit - show modal for impact
                setCurrentStrategy('modal');
            } else if (visitCount <= 3) {
                // Early visits - show banner
                setCurrentStrategy('banner');
            } else {
                // Regular users - subtle floating button
                setCurrentStrategy('floating');
            }
        }
    }, [strategy]);

    const renderStrategy = () => {
        switch (currentStrategy) {
            case 'modal':
                return <PWAInstallAd />;
            case 'banner':
                return <PWAInstallBanner />;
            case 'floating':
                return <PWAFloatingInstall />;
            default:
                return null;
        }
    };

    return renderStrategy();
};

export default PWAInstallPromotion;
