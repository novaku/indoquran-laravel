import React, { useState } from 'react';
import usePWA from '../hooks/usePWA';

const PWASettings = () => {
    const { isInstalled, isInstallable, installApp, shareApp, updateAvailable, updateApp } = usePWA();
    const [notifications, setNotifications] = useState(
        localStorage.getItem('pwa-notifications') === 'true'
    );

    const handleNotificationToggle = async () => {
        if (!notifications) {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotifications(true);
                localStorage.setItem('pwa-notifications', 'true');
            }
        } else {
            setNotifications(false);
            localStorage.setItem('pwa-notifications', 'false');
        }
    };

    const handleShare = async () => {
        await shareApp({
            title: 'IndoQuran - Al-Quran Digital Indonesia',
            text: 'Platform Al-Quran Digital terlengkap di Indonesia.',
            url: window.location.origin
        });
    };

    const clearCache = async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-islamic-green mb-4">Pengaturan Aplikasi</h3>
                
                {/* Installation Status */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Status Instalasi</h4>
                            <p className="text-sm text-gray-600">
                                {isInstalled ? 'Aplikasi sudah diinstall' : 'Aplikasi belum diinstall'}
                            </p>
                        </div>
                        <div className="flex items-center">
                            {isInstalled ? (
                                <div className="flex items-center text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Terinstall
                                </div>
                            ) : isInstallable ? (
                                <button
                                    onClick={installApp}
                                    className="bg-islamic-green text-white px-4 py-2 rounded-lg text-sm hover:bg-islamic-green/90 transition-colors"
                                >
                                    Install Sekarang
                                </button>
                            ) : (
                                <span className="text-gray-500 text-sm">Tidak tersedia</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Notifikasi</h4>
                            <p className="text-sm text-gray-600">
                                Terima pengingat jadwal shalat dan fitur lainnya
                            </p>
                        </div>
                        <button
                            onClick={handleNotificationToggle}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-islamic-green focus:ring-offset-2 ${
                                notifications ? 'bg-islamic-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    notifications ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Update Available */}
                {updateAvailable && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-blue-900">Update Tersedia</h4>
                                <p className="text-sm text-blue-700">
                                    Versi baru IndoQuran telah tersedia
                                </p>
                            </div>
                            <button
                                onClick={updateApp}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                Update Sekarang
                            </button>
                        </div>
                    </div>
                )}

                {/* Share App */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Bagikan Aplikasi</h4>
                            <p className="text-sm text-gray-600">
                                Ajak teman dan keluarga menggunakan IndoQuran
                            </p>
                        </div>
                        <button
                            onClick={handleShare}
                            className="bg-islamic-green text-white px-4 py-2 rounded-lg text-sm hover:bg-islamic-green/90 transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Bagikan
                        </button>
                    </div>
                </div>

                {/* Cache Management */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">Cache Aplikasi</h4>
                            <p className="text-sm text-gray-600">
                                Hapus data tersimpan untuk membersihkan cache
                            </p>
                        </div>
                        <button
                            onClick={clearCache}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        >
                            Hapus Cache
                        </button>
                    </div>
                </div>

                {/* PWA Features Info */}
                <div className="bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 rounded-xl p-4 border border-islamic-green/10 mt-6">
                    <h4 className="font-medium text-islamic-green mb-3">Fitur Aplikasi Web</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Akses offline untuk konten yang sudah dibuka
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Akses cepat dari home screen perangkat
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Penggunaan data internet yang lebih efisien
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Notifikasi pengingat jadwal shalat
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWASettings;
