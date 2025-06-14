import React from 'react';
import usePWA from '../hooks/usePWA';

const PWAStatus = ({ className = '' }) => {
    const { isInstalled, isOnline, shareApp } = usePWA();

    const handleShare = async () => {
        const currentUrl = window.location.href;
        const currentTitle = document.title;
        
        const success = await shareApp({
            title: currentTitle,
            url: currentUrl
        });
        
        if (!success) {
            // Fallback: copy to clipboard
            alert('Link telah disalin ke clipboard!');
        }
    };

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Installation Status */}
            {isInstalled && (
                <div className="flex items-center text-islamic-green text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">App Installed</span>
                </div>
            )}

            {/* Online/Offline Status */}
            <div className={`flex items-center text-sm ${isOnline ? 'text-green-600' : 'text-amber-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Share Button */}
            <button
                onClick={handleShare}
                className="flex items-center text-islamic-green hover:text-islamic-green/80 transition-colors text-sm"
                title="Bagikan IndoQuran"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="hidden sm:inline">Bagikan</span>
            </button>
        </div>
    );
};

export default PWAStatus;
