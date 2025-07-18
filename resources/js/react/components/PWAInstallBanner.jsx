import React, { useState, useEffect, useRef, useCallback } from 'react';

const PWAInstallBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Check if banner was dismissed today
        try {
            const dismissed = localStorage.getItem('pwa-banner-dismissed');
            const dismissedDate = localStorage.getItem('pwa-banner-dismissed-date');
            const today = new Date().toDateString();
            
            if (dismissed === 'true' && dismissedDate === today) {
                return;
            }
        } catch (error) {
            console.warn('PWA: localStorage not available');
        }

        // Check PWA status
        const checkStatus = () => {
            // Wait for PWAManager to be ready
            if (!window.pwaManager || !window._pwaManagerInitialized) {
                setTimeout(checkStatus, 100);
                return;
            }

            const status = window.pwaManager.getInstallStatus();
            setCanInstall(status.canInstall);
            setIsInstalled(status.isInstalled);
            
            if (status.canInstall && !status.isInstalled) {
                setTimeout(() => setIsVisible(true), 5000); // Show after 5 seconds
            }
        };

        const handleInstallAvailable = () => {
            setCanInstall(true);
            if (!isInstalled) {
                setTimeout(() => setIsVisible(true), 5000);
            }
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
        };

        window.addEventListener('pwa-install-available', handleInstallAvailable);
        window.addEventListener('pwa-installed', handleInstalled);

        checkStatus();

        return () => {
            window.removeEventListener('pwa-install-available', handleInstallAvailable);
            window.removeEventListener('pwa-installed', handleInstalled);
        };
    }, []); // Empty dependency array

    const handleInstall = useCallback(async () => {
        if (!window.pwaManager || !window._pwaManagerInitialized) {
            console.warn('PWA: Manager not ready for install');
            return;
        }

        try {
            await window.pwaManager.promptInstall();
        } catch (error) {
            console.error('PWA: Install failed', error);
        }
    }, []);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        try {
            localStorage.setItem('pwa-banner-dismissed', 'true');
            localStorage.setItem('pwa-banner-dismissed-date', new Date().toDateString());
        } catch (error) {
            console.warn('PWA: Could not save dismissal state');
        }
    }, []);

    if (!isVisible || isInstalled || !canInstall) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg z-40 animate-slide-up">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 flex-shrink-0">
                        <span className="text-xl">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">Install IndoQuran</h4>
                        <p className="text-xs opacity-90 mb-3">
                            Akses lebih cepat seperti aplikasi asli
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="bg-white text-green-600 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1"
                            >
                                <span>⬇️</span>
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="text-white hover:bg-white hover:bg-opacity-20 px-2 py-1.5 rounded-md text-xs transition-colors"
                            >
                                Nanti
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 flex-shrink-0"
                    >
                        <span className="text-lg">✕</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
