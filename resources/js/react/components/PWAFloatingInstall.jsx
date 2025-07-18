import React, { useState, useEffect, useRef, useCallback } from 'react';

const PWAFloatingInstall = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        // Check if permanently dismissed
        try {
            const dismissed = localStorage.getItem('pwa-floating-dismissed');
            if (dismissed === 'true') {
                return;
            }
        } catch (error) {
            console.warn('PWA: localStorage not available');
        }

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
                setTimeout(() => setIsVisible(true), 10000); // Show after 10 seconds
            }
        };

        const handleInstallAvailable = () => {
            setCanInstall(true);
            if (!isInstalled) {
                setTimeout(() => setIsVisible(true), 10000);
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
            const success = await window.pwaManager.promptInstall();
            if (success) {
                setIsVisible(false);
            }
        } catch (error) {
            console.error('PWA: Install failed', error);
        }
    }, []);

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        try {
            localStorage.setItem('pwa-floating-dismissed', 'true');
        } catch (error) {
            console.warn('PWA: Could not save dismissal state');
        }
    }, []);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    if (!isVisible || isInstalled || !canInstall) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded card */}
            {isExpanded && (
                <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 w-72 mb-2 animate-fade-in">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 rounded-full p-2">
                                <span className="text-green-600">📱</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Install IndoQuran</h4>
                                <p className="text-xs text-gray-500">Aplikasi Al-Qur'an Digital</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-lg">✕</span>
                        </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-green-500">⚡</span>
                            <span>Akses lebih cepat</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-blue-500">📱</span>
                            <span>Seperti aplikasi asli</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                            <span>⬇️</span>
                            Install
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Tidak
                        </button>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={toggleExpanded}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group relative"
            >
                <span className="text-2xl animate-bounce">⬇️</span>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                
                {/* Tooltip */}
                {!isExpanded && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Install Aplikasi
                    </div>
                )}
            </button>
        </div>
    );
};

export default PWAFloatingInstall;
