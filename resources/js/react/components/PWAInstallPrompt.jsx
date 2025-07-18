import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Check if app is already installed (running in standalone mode)
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://');
        
        // Set initial states
        setIsIOS(isIOSDevice);
        setIsStandalone(isInStandaloneMode);

        // Don't show prompt if already installed
        if (isInStandaloneMode) {
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show install prompt to user only if not already shown
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show iOS install instructions if on iOS and not installed
        if (isIOSDevice && !isInStandaloneMode) {
            // Check if user has dismissed the prompt before
            const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
            const dismissedTime = localStorage.getItem('pwa-install-prompt-dismissed-time');
            const lastShownTime = localStorage.getItem('pwa-install-prompt-last-shown');
            const now = Date.now();
            
            // Don't show if permanently dismissed within last 7 days
            if (hasSeenPrompt && dismissedTime && (now - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000)) {
                return;
            }
            
            // Only show prompt if not shown recently (24 hours)
            if (!lastShownTime || now - parseInt(lastShownTime) > 24 * 60 * 60 * 1000) {
                const timeoutId = setTimeout(() => {
                    setShowInstallPrompt(true);
                    localStorage.setItem('pwa-install-prompt-last-shown', now.toString());
                }, 3000);
                
                return () => {
                    clearTimeout(timeoutId);
                    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                };
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            // Track installation
            if (window.gtag) {
                window.gtag('event', 'pwa_install', {
                    event_category: 'PWA',
                    event_label: 'User Installed App'
                });
            }
            // Mark as permanently dismissed since user installed
            localStorage.setItem('pwa-install-prompt-dismissed', 'true');
            localStorage.setItem('pwa-install-prompt-dismissed-time', Date.now().toString());
        } else {
            console.log('User dismissed the install prompt');
            // Set a cooldown period before showing again
            localStorage.setItem('pwa-install-prompt-last-shown', Date.now().toString());
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        setShowIOSInstructions(false);
        // Remember that user dismissed the prompt with timestamp
        localStorage.setItem('pwa-install-prompt-dismissed', 'true');
        localStorage.setItem('pwa-install-prompt-dismissed-time', Date.now().toString());
    };

    const handleTryAgainLater = () => {
        setShowInstallPrompt(false);
        setShowIOSInstructions(false);
        // Set a shorter delay before showing again (1 hour)
        localStorage.setItem('pwa-install-prompt-last-shown', Date.now().toString());
    };

    // Don't show anything if app is already installed
    if (isStandalone) return null;

    if (showIOSInstructions) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
                <div className="bg-white rounded-t-2xl max-w-md w-full p-6 transform transition-transform duration-300 ease-out">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Install IndoQuran
                        </h3>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="space-y-4 text-sm text-gray-700">
                        <p className="font-medium">Untuk menginstall aplikasi IndoQuran di iPhone/iPad:</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs font-bold">1</span>
                                </div>
                                <div>
                                    <p>Tap tombol <strong>Share</strong> di Safari</p>
                                    <div className="text-xs text-gray-500">Ikon kotak dengan panah ke atas di bagian bawah</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs font-bold">2</span>
                                </div>
                                <div>
                                    <p>Pilih <strong>"Add to Home Screen"</strong></p>
                                    <div className="text-xs text-gray-500">Scroll ke bawah jika tidak terlihat</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-xs font-bold">3</span>
                                </div>
                                <div>
                                    <p>Tap <strong>"Add"</strong> untuk konfirmasi</p>
                                    <div className="text-xs text-gray-500">IndoQuran akan muncul di home screen</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={handleTryAgainLater}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
                        >
                            Nanti Saja
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showInstallPrompt) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 transform transition-transform duration-300 ease-out">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Install IndoQuran
                            </h3>
                            <p className="text-xs text-gray-500">
                                Akses lebih cepat dan offline
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 text-sm px-2 py-1"
                        >
                            ✕
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            {isIOS ? 'Cara Install' : 'Install'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PWAInstallPrompt;
