// PWA Hook for IndoQuran - Handles installation and service worker
import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [swRegistration, setSwRegistration] = useState(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        // Check if app is installed
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                                window.navigator.standalone ||
                                document.referrer.includes('android-app://');
            setIsInstalled(isStandalone);
        };

        // Register service worker
        const registerServiceWorker = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none'
                    });

                    setSwRegistration(registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });

                    console.log('Service Worker registered successfully');
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            }
        };

        // Handle beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setIsInstallable(true);
        };

        // Handle app installed event
        const handleAppInstalled = () => {
            setIsInstallable(false);
            setInstallPrompt(null);
            setIsInstalled(true);
            console.log('PWA was installed');
        };

        // Handle online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Add event listeners
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initialize
        checkInstalled();
        registerServiceWorker();

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const installApp = async () => {
        if (!installPrompt) return false;

        try {
            const result = await installPrompt.prompt();
            if (result.outcome === 'accepted') {
                setIsInstallable(false);
                setInstallPrompt(null);
                return true;
            }
        } catch (error) {
            console.error('Error during installation:', error);
        }
        return false;
    };

    const updateApp = () => {
        if (swRegistration && swRegistration.waiting) {
            swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            // Removed auto-reload - user can manually refresh if needed
            console.log('App update ready - please refresh manually to activate');
        }
    };

    const shareApp = async (data = {}) => {
        const shareData = {
            title: 'IndoQuran - Al-Quran Digital Indonesia',
            text: 'Platform Al-Quran Digital terlengkap di Indonesia. Baca, dengar, dan pelajari Al-Quran online.',
            url: window.location.origin,
            ...data
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        }
        
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(shareData.url);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
        
        return false;
    };

    return {
        isInstallable,
        isInstalled,
        isOnline,
        updateAvailable,
        installApp,
        updateApp,
        shareApp,
        swRegistration
    };
};

export default usePWA;
