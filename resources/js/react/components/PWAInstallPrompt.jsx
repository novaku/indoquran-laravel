import React, { useState } from 'react';
import usePWA from '../hooks/usePWA';

const PWAInstallPrompt = () => {
    const { isInstallable, isInstalled, installApp, isOnline, updateAvailable, updateApp } = usePWA();
    const [showPrompt, setShowPrompt] = useState(true);
    const [installing, setInstalling] = useState(false);

    // Don't show if not installable, already installed, or user dismissed
    if (!isInstallable || isInstalled || !showPrompt) {
        return null;
    }

    const handleInstall = async () => {
        setInstalling(true);
        try {
            const success = await installApp();
            if (success) {
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Installation failed:', error);
        } finally {
            setInstalling(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Store dismissal in localStorage to remember user preference
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Check if user previously dismissed (within last 7 days)
    React.useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            if (dismissedTime > sevenDaysAgo) {
                setShowPrompt(false);
            }
        }
    }, []);

    return (
        <>
            {/* Install Prompt */}
            <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto lg:left-auto lg:right-4 lg:mx-0">
                <div className="bg-white rounded-2xl shadow-2xl border border-islamic-green/10 overflow-hidden transform transition-all duration-300 hover:scale-105">
                    <div className="bg-gradient-to-r from-islamic-green to-islamic-gold p-4">
                        <div className="flex items-center text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Install IndoQuran</h3>
                                <p className="text-xs opacity-90">Akses cepat dari home screen</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <div className="flex items-start mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-islamic-green mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Akses offline & loading lebih cepat</span>
                        </div>
                        <div className="flex items-start mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-islamic-green mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Notifikasi pengingat shalat</span>
                        </div>
                        <div className="flex items-start mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-islamic-green mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Hemat data internet</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                disabled={installing}
                                className="flex-1 bg-gradient-to-r from-islamic-green to-emerald-600 text-white py-2.5 px-4 rounded-xl font-medium text-sm hover:from-islamic-green/90 hover:to-emerald-600/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {installing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                                        Installing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Install
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Available Prompt */}
            {updateAvailable && (
                <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto lg:left-auto lg:right-4 lg:mx-0">
                    <div className="bg-blue-600 text-white rounded-xl shadow-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-sm font-medium">Update tersedia</span>
                            </div>
                            <button
                                onClick={updateApp}
                                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offline Indicator */}
            {!isOnline && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-amber-500 text-white rounded-lg shadow-lg p-3">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v4m0 12v4M2 12h4m12 0h4" />
                            </svg>
                            <span className="text-sm font-medium">Mode Offline</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAInstallPrompt;
