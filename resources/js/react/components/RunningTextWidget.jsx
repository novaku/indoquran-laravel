import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/apiUtils';

// Simple cache for prayers to reduce API calls
const prayerCache = {
    prayers: [],
    lastFetch: null,
    CACHE_DURATION: 10 * 60 * 1000 // 10 minutes
};

const RunningTextWidget = ({ className = '' }) => {
    const [prayer, setPrayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);

    useEffect(() => {
        loadPrayer();
        
        // Auto refresh every 5 minutes
        const interval = setInterval(() => {
            loadPrayer();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const loadPrayer = async (forceRefresh = false) => {
        try {
            // Check cache first
            const now = Date.now();
            const isCacheValid = prayerCache.lastFetch && 
                                 (now - prayerCache.lastFetch) < prayerCache.CACHE_DURATION &&
                                 prayerCache.prayers.length > 0;

            if (!forceRefresh && isCacheValid) {
                // Use cached prayer
                const randomIndex = Math.floor(Math.random() * prayerCache.prayers.length);
                setPrayer(prayerCache.prayers[randomIndex]);
                setLoading(false);
                setError(null);
                return;
            }

            // Fetch new prayers
            await fetchRandomPrayer(forceRefresh);
        } catch (err) {
            console.error('Error loading prayer:', err);
            setError('Gagal memuat doa');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRandomPrayer = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const response = await fetchWithAuth('/api/doa-bersama/random');
            const data = await response.json();
            
            if (data.success && data.data) {
                setPrayer(data.data);
                setError(null);
                
                // Update cache
                const existingIndex = prayerCache.prayers.findIndex(p => p.id === data.data.id);
                if (existingIndex === -1) {
                    prayerCache.prayers.push(data.data);
                    // Keep only last 20 prayers in cache
                    if (prayerCache.prayers.length > 20) {
                        prayerCache.prayers = prayerCache.prayers.slice(-20);
                    }
                }
                prayerCache.lastFetch = Date.now();
            } else {
                setError('Gagal memuat doa');
            }
        } catch (err) {
            console.error('Error fetching random prayer:', err);
            setError('Gagal memuat doa');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadPrayer(true);
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full ${className}`}>
                <div className="bg-islamic-green/95 text-white px-4 py-3">
                    <h2 className="text-lg font-semibold flex items-center">
                        <span className="text-white text-lg mr-2">🤲</span>
                        <span>Doa Bersama</span>
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-islamic-green"></div>
                        <span className="ml-2 text-gray-600">Memuat doa bersama...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !prayer) {
        return (
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full ${className}`}>
                <div className="bg-islamic-green/95 text-white px-4 py-3">
                    <h2 className="text-lg font-semibold flex items-center">
                        <span className="text-white text-lg mr-2">🤲</span>
                        <span>Doa Bersama</span>
                    </h2>
                </div>
                <div className="p-4">
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md mb-3">
                        <div className="flex items-center">
                            <span className="text-red-500 text-lg mr-2">⚠️</span>
                            <div>
                                <span className="text-red-700 font-medium text-sm">Gagal memuat doa bersama</span>
                                <p className="text-red-600 text-xs mt-1">Coba muat ulang atau kunjungi halaman doa bersama</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => loadPrayer(true)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                            >
                                🔄 Coba Lagi
                            </button>
                            <a 
                                href="/doa-bersama"
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                                Ke Halaman Doa
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Truncate content if too long for running text
    const getOptimalContentLength = () => {
        // Adjust content length based on screen size
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;
        
        if (isMobile) return 80;
        if (isTablet) return 100;
        return 150;
    };

    const optimalLength = getOptimalContentLength();
    const truncatedContent = prayer.content.length > optimalLength 
        ? prayer.content.substring(0, optimalLength) + '...' 
        : prayer.content;

    return (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full ${className}`}>
            <div className="bg-islamic-green/95 text-white px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                    <span className="text-white text-lg mr-2">🤲</span>
                    <span className="text-black">Doa Bersama</span>
                </h2>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-white hover:text-islamic-cream transition-colors"
                    title="Muat doa lainnya"
                >
                    <span className={`text-xl ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                </button>
            </div>
            
            <div className="p-4">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center text-xs text-islamic-green font-medium">
                        <span className="bg-islamic-green/15 px-2 py-1 rounded-full mr-2 border border-islamic-green/20 text-black">
                            ✨ Doa Bersama
                        </span>
                        <span className="text-gray-500">oleh</span>
                        <span className="ml-1 font-semibold">
                            {prayer.is_anonymous ? 'Hamba Allah' : prayer.user?.name || 'Anonim'}
                        </span>
                    </div>
                    <h4 className="font-bold text-islamic-green text-sm truncate">
                        {prayer.title}
                    </h4>
                    <div className="text-black text-sm leading-relaxed">
                        <div className="overflow-hidden relative bg-gray-50 rounded-md px-3 py-2 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                             onClick={() => setShowFullContent(!showFullContent)}
                             title="Klik untuk melihat/sembunyikan teks lengkap">
                            {showFullContent ? (
                                <div className="whitespace-pre-wrap">
                                    "{prayer.content}"
                                </div>
                            ) : (
                                <div className="animate-marquee whitespace-nowrap hover:animation-paused">
                                    <span className="inline-block">"{truncatedContent}"</span>
                                </div>
                            )}
                            {prayer.content.length > optimalLength && (
                                <div className="absolute top-1 right-1">
                                    <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5 border">
                                        {showFullContent ? '📖' : '👁️'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <span className="flex items-center mr-4">
                            <span className="text-green-600 mr-1">🤲</span>
                            <span className="font-medium">{prayer.amin_count || 0}</span>
                            <span className="ml-1">Amin</span>
                        </span>
                        <span className="flex items-center mr-4">
                            <span className="text-blue-600 mr-1">💬</span>
                            <span className="font-medium">{prayer.comment_count || 0}</span>
                            <span className="ml-1">Komentar</span>
                        </span>
                        <span className="text-gray-400 text-xs">
                            • {new Date(prayer.created_at).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                            })}
                        </span>
                    </div>
                    <div className="flex justify-center pt-2">
                        <a 
                            href="/doa-bersama"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
                        >
                            <span className="mr-2 group-hover:scale-110 transition-transform duration-200 text-white">🤝</span>
                            <span className="hidden sm:inline">Bergabung</span>
                            <span className="sm:hidden">Join</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunningTextWidget;
