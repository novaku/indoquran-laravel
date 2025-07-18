import React, { useState, useEffect } from 'react';

const PWAInstallAd = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if ad was previously dismissed
        const dismissed = localStorage.getItem('pwa-install-ad-dismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // Check PWA install status
        const checkInstallStatus = () => {
            if (window.pwaManager) {
                const status = window.pwaManager.getInstallStatus();
                setCanInstall(status.canInstall);
                setIsInstalled(status.isInstalled);
                
                // Show ad if app can be installed and is not already installed
                if (status.canInstall && !status.isInstalled) {
                    // Show after 3 seconds delay
                    setTimeout(() => setIsVisible(true), 3000);
                }
            }
        };

        // Listen for PWA events
        const handleInstallAvailable = () => {
            setCanInstall(true);
            if (!isInstalled) {
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
        };

        window.addEventListener('pwa-install-available', handleInstallAvailable);
        window.addEventListener('pwa-installed', handleInstalled);

        // Initial check
        checkInstallStatus();

        return () => {
            window.removeEventListener('pwa-install-available', handleInstallAvailable);
            window.removeEventListener('pwa-installed', handleInstalled);
        };
    }, [isInstalled]);

    const handleInstall = async () => {
        if (window.pwaManager) {
            const success = await window.pwaManager.promptInstall();
            if (success) {
                setIsVisible(false);
            }
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('pwa-install-ad-dismissed', 'true');
    };

    const handleRemindLater = () => {
        setIsVisible(false);
        // Show again after 24 hours
        setTimeout(() => {
            if (!isInstalled) {
                setIsVisible(true);
            }
        }, 24 * 60 * 60 * 1000);
    };

    if (!isVisible || isDismissed || isInstalled || !canInstall) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 rounded-full p-2">
                            <span className="text-2xl">📖</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Install IndoQuran</h3>
                            <p className="text-sm opacity-90">Aplikasi Al-Qur'an Digital</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">
                            Dapatkan Pengalaman Terbaik!
                        </h4>
                        <p className="text-gray-600 text-sm">
                            Install aplikasi IndoQuran untuk akses yang lebih cepat dan mudah
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 rounded-full p-2">
                                <span className="text-green-600">⚡</span>
                            </div>
                            <span className="text-sm text-gray-700">Akses lebih cepat dan responsif</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <span className="text-blue-600">📶</span>
                            </div>
                            <span className="text-sm text-gray-700">Bisa digunakan tanpa internet</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 rounded-full p-2">
                                <span className="text-purple-600">📱</span>
                            </div>
                            <span className="text-sm text-gray-700">Seperti aplikasi asli di ponsel</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 rounded-full p-2">
                                <span className="text-orange-600">📖</span>
                            </div>
                            <span className="text-sm text-gray-700">Bookmark dan catatan tersimpan</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleInstall}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                        >
                            <span className="text-xl">⬇️</span>
                            Install Aplikasi
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRemindLater}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                                Nanti Saja
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                                Tidak, Terima Kasih
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 text-center">
                    <p className="text-xs text-gray-500">
                        Gratis • Tanpa iklan • Ringan • Aman
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallAd;
