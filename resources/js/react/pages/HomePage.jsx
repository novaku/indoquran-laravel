import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ClockIcon, 
    ArrowPathIcon as RefreshIcon, 
    MapPinIcon as LocationMarkerIcon, 
    CalendarIcon, 
    ExclamationTriangleIcon as ExclamationIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import { getUserBookmarks } from '../services/BookmarkService';
import QuranHeader from '../components/QuranHeader';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import SearchField from '../components/SearchField';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { getHomeSEO } from '../utils/seoConfig';
import { useApiCache } from '../hooks/useApiCache';
import authUtils from '../utils/auth';
import { prefetchResources } from '../utils/resourcePrefetch';
import { fetchWithAuth } from '../utils/apiUtils';
import { useComponentPreloader } from '../hooks/useResourcePreloader';
import { getResponsiveImageProps } from '../utils/imageOptimization';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import RunningTextWidget from '../components/RunningTextWidget';

function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Bookmarks state
    const [bookmarks, setBookmarks] = useState([]);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    // Preload critical resources for this page
    useComponentPreloader([
        { url: '/api/surahs', type: 'prefetch', delay: 500 },
        { url: '/api/prayer-times', type: 'prefetch', delay: 1000 },
        { url: '/images/quran-logo.png', type: 'preload', as: 'image', delay: 100 }
    ]);

    // Use API cache for surahs data
    const {
        data: cachedSurahs,
        loading: cacheLoading,
        error: cacheError,
        refetch: refetchSurahs
    } = useApiCache('surahs', async () => {
        const token = authUtils.getAuthToken();
        const response = await fetchWithAuth('/api/surahs', {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch surahs');
        const result = await response.json();
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error("Gagal memuat data surah");
        }
    }, []);

    // Update state when cached data changes
    useEffect(() => {
        if (cachedSurahs) {
            setSurahs(cachedSurahs);
            setLoading(false);
            setError(null);
        }
        if (cacheError) {
            setError(cacheError.message);
            setLoading(false);
        }
        if (cacheLoading !== undefined) {
            setLoading(cacheLoading);
        }
    }, [cachedSurahs, cacheLoading, cacheError]);
    
    // Load user bookmarks if user is logged in
    useEffect(() => {
        const loadBookmarks = async () => {
            if (user) {
                setBookmarkLoading(true);
                try {
                    const data = await getUserBookmarks();
                    // Get the 5 most recent bookmarks
                    const recentBookmarks = data
                        .sort((a, b) => {
                            const dateA = a.pivot?.created_at || a.created_at || '';
                            const dateB = b.pivot?.created_at || b.created_at || '';
                            return new Date(dateB) - new Date(dateA);
                        })
                        .slice(0, 5);
                    setBookmarks(recentBookmarks);
                } catch (error) {
                    console.error('Error loading bookmarks:', error);
                } finally {
                    setBookmarkLoading(false);
                }
            }
        };
        
        loadBookmarks();
    }, [user]);

    // Handle Escape key press for modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showModal]);
    
    // Memoized helper function for better performance
    const truncateDescription = useCallback((htmlText, maxLength = 80) => {
        if (!htmlText) return '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        return textContent.length > maxLength 
            ? textContent.substring(0, maxLength) + '...' 
            : textContent;
    }, []);
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedSurah(null);
    };

    const handleSurahClick = useCallback((e, surah) => {
        e.preventDefault();
        setSelectedSurah(surah);
        setShowModal(true);
    }, []);

    // Memoized Surah Card Component for better performance
    const SurahCard = memo(({ surah, onSurahClick }) => {
        const handleClick = useCallback((e) => {
            if (onSurahClick) {
                onSurahClick(e, surah);
            }
        }, [surah, onSurahClick]);

        const handleDetailClick = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSurahClick) {
                onSurahClick(e, surah);
            }
        }, [surah, onSurahClick]);

        return (
            <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 rounded-bl-3xl"></div>
                
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-islamic-green to-islamic-gold rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg relative">
                            <span className="text-black font-bold drop-shadow-sm">{surah.number}</span>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-islamic-gold rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-islamic-green group-hover:text-islamic-gold transition-colors mb-1">
                                {surah.name_latin}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {surah.revelation_place}
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                    </svg>
                                    {surah.total_ayahs} ayat
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Arabic Name Section */}
                    <div className="text-right ml-4">
                        <h4 className="text-3xl font-arabic text-islamic-green mb-1 leading-none">{surah.name_arabic}</h4>
                        <p className="text-sm text-gray-500 font-medium">{surah.name_indonesian}</p>
                    </div>
                </div>
                
                {/* Description Section */}
                {surah.description_short && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 rounded-xl border border-islamic-green/10">
                        <h5 className="text-sm font-semibold text-islamic-green mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tentang Surah
                        </h5>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {truncateDescription(surah.description_short, 150)}
                        </p>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        onClick={handleDetailClick}
                        className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 text-sm font-medium shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Detail
                    </button>
                    
                    <a 
                        href={`/surah/${surah.number}`}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 text-sm font-medium shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Baca Surah
                    </a>
                </div>
            </div>
        );
    });

    // Handle click on a bookmark
    const handleBookmarkClick = useCallback((bookmark) => {
        navigate(`/surah/${bookmark.surah_number}/${bookmark.ayah_number}`);
    }, [navigate]);

    // Memoized filtered surahs for better performance
    const filteredSurahs = useMemo(() => {
        return surahs || [];
    }, [surahs]);

    // BookmarkSummary component
    const BookmarkSummary = ({ bookmarks, loading, onBookmarkClick }) => {
        if (loading) {
            return (
                <div className="mb-8 bg-gradient-to-r from-green-50 to-amber-50 rounded-xl shadow-lg p-6 border border-islamic-green/10">
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-islamic-green"></div>
                        <span className="ml-3 text-islamic-green">Memuat bookmark...</span>
                    </div>
                </div>
            );
        }

        if (!bookmarks || bookmarks.length === 0) {
            return (
                <div className="mb-8 bg-gradient-to-r from-green-50 to-amber-50 rounded-xl shadow-lg p-6 border border-islamic-green/10">
                    <h2 className="text-lg font-bold text-islamic-green mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Bookmark Ayat
                    </h2>
                    <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-islamic-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <p className="text-gray-600">Anda belum memiliki ayat yang di-bookmark</p>
                        <button 
                            onClick={() => window.location.href = '/surah/1'}
                            className="mt-4 px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors"
                        >
                            Mulai Membaca Al-Quran
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-8 bg-gradient-to-r from-green-50 to-amber-50 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-islamic-green flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Bookmark Ayat Terakhir
                    </h2>
                    <a 
                        href="/bookmarks" 
                        className="text-sm text-islamic-green hover:text-islamic-green/80 font-medium flex items-center"
                    >
                        Lihat Semua
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
                
                <div className="space-y-3">
                    {bookmarks.map((bookmark, index) => (
                        <div 
                            key={`bookmark-${bookmark.id}-${index}`}
                            className="bg-white p-4 rounded-lg hover:shadow-md transition-all cursor-pointer"
                            onClick={() => onBookmarkClick(bookmark)}
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-islamic-green/10 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-islamic-green font-semibold">{bookmark.ayah_number}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center text-islamic-brown text-sm mb-1.5">
                                        <span className="font-medium">{bookmark.surah?.name_latin || bookmark.surah?.name_indonesian || `Surah ${bookmark.surah_number}`}</span>
                                        <span className="mx-1.5">•</span>
                                        <span>Ayat {bookmark.ayah_number}</span>
                                        {bookmark.is_favorite && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                Favorit
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm overflow-hidden text-ellipsis" 
                                       style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                        "{bookmark.text_indonesian?.substring(0, 120)}..."
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-islamic-green/10">
                    <a 
                        href="/bookmarks" 
                        className="w-full block py-2 text-center bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green font-medium rounded-lg transition-colors"
                    >
                        Kelola Bookmark Anda
                    </a>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <PageTransition isLoading={true}>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </PageTransition>
        );
    }
    
    if (error) {
        return (
            <PageTransition>
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-islamic" role="alert">
                    <strong className="font-bold">Kesalahan! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </PageTransition>
        );
    }
    
    /* Remove the first return statement */

    return (
        <>
            <PWAInstallPrompt />
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 pb-20">
                    <SEOHead {...getHomeSEO()} />
                    
                    <StructuredData type="WebSite" data={{}} />
                    
                    <div className="container mx-auto px-4">
                        <QuranHeader />
                        
                        {/* Search Widget */}
                        <div className="mb-8 mt-8 w-full">
                            <SearchField 
                                surahs={surahs}
                                onSuggestionClick={(suggestion) => {
                                    // Additional handling can be added here if needed
                                }}
                                onViewAllResults={(query) => {
                                    // Additional handling can be added here if needed
                                }}
                                className="w-full"
                                theme="islamic"
                            />
                            <p className="text-center text-sm text-islamic-green/70 mt-3 px-2 flex items-center justify-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Cari berdasarkan kata kunci, nama surah, atau terjemahan bahasa Indonesia</span>
                            </p>
                        </div>
                        
                        {/* Running Text for Random Doa Bersama */}
                        <RunningTextWidget className="mb-8" />
                        
                        <PrayerTimesWidget className="mb-12" />
                    
                        {/* Display bookmark summary for logged in users */}
                        {user && (
                            <div className="mb-12 mt-8">
                                <BookmarkSummary 
                                    bookmarks={bookmarks} 
                                    loading={bookmarkLoading} 
                                    onBookmarkClick={handleBookmarkClick} 
                                />
                            </div>
                        )}
                    
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-islamic-green mb-2">Al-Quran Digital</h1>
                            <p className="text-lg text-gray-600 mb-6">Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia</p>
                        </div>
                    
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSurahs.map(surah => (
                                    <SurahCard 
                                        key={surah.number} 
                                        surah={surah}
                                        onSurahClick={handleSurahClick}
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </PageTransition>
            
            {/* Enhanced Surah Detail Modal */}
            {showModal && selectedSurah && (
                <div 
                    className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50"
                    onClick={closeModal}
                    style={{ zIndex: 9999 }}
                >
                    <div 
                        className="bg-white rounded-3xl p-0 max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient Background */}
                        <div className="relative bg-gradient-to-r from-islamic-green to-islamic-gold text-black p-8 pb-12">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-islamic-pattern opacity-10"></div>
                            
                            {/* Close Button */}
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-black/80 hover:text-black transition-colors p-2 rounded-full hover:bg-white/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header Content */}
                            <div className="relative z-10">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-black font-bold text-xl mr-4 backdrop-blur-sm">
                                        {selectedSurah?.number}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-1 text-black">
                                            {selectedSurah?.name_latin || 'Surah'}
                                        </h2>
                                        <p className="text-black/90 text-lg">
                                            {selectedSurah?.name_indonesian || ''}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Arabic Name */}
                                <div className="text-center mb-4">
                                    <h3 className="text-5xl font-arabic leading-none mb-2 text-black">
                                        {selectedSurah?.name_arabic || ''}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {/* Quick Stats */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-amber-50 p-5 rounded-xl border border-islamic-green/10">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center text-blue-700">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-blue-600">Wahyu</div>
                                                <div className="font-bold text-blue-800">
                                                    {selectedSurah?.revelation_place}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-10 w-0.5 bg-gray-300 rounded-full"></div>
                                        
                                        <div className="flex items-center text-purple-700">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-purple-600">Ayat</div>
                                                <div className="font-bold text-purple-800">
                                                    {selectedSurah?.total_ayahs || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="h-10 w-0.5 bg-gray-300 rounded-full"></div>
                                        
                                        <div className="flex items-center text-amber-700">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-amber-600">Urutan</div>
                                                <div className="font-bold text-amber-800">
                                                    #{selectedSurah?.number || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center text-green-700">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-green-600">Periode</div>
                                            <div className="font-bold text-green-800">
                                                {selectedSurah?.revelation_place}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Themes */}
                            {selectedSurah?.description_short && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-islamic-green/10 rounded-lg flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        Tema & Kandungan Utama
                                    </h4>
                                    <div className="bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 p-6 rounded-2xl border border-islamic-green/10">
                                        <div 
                                            className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_short }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Detailed Description */}
                            {selectedSurah?.description_long && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-islamic-gold/10 rounded-lg flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-islamic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        Penjelasan Lengkap
                                    </h4>
                                    <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-6 rounded-2xl border border-amber-100">
                                        <div 
                                            className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_long }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Fun Facts */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                                <h4 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Fakta Menarik
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center text-indigo-700">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                                        <span><strong>Nama:</strong> {selectedSurah?.name_latin} berarti "{selectedSurah?.name_indonesian}"</span>
                                    </div>
                                    <div className="flex items-center text-indigo-700">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                                        <span><strong>Posisi:</strong> Surah ke-{selectedSurah?.number} dari 114 surah</span>
                                    </div>
                                    <div className="flex items-center text-indigo-700">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                                        <span><strong>Klasifikasi:</strong> {selectedSurah?.revelation_place}</span>
                                    </div>
                                    <div className="flex items-center text-indigo-700">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                                        <span><strong>Panjang:</strong> {selectedSurah?.total_ayahs} ayat</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-8 pt-0">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate(`/surah/${selectedSurah?.number}`)}
                                    className="flex-1 bg-gradient-to-r from-islamic-green to-emerald-600 text-white py-4 px-6 rounded-2xl hover:from-islamic-green/90 hover:to-emerald-600/90 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Mulai Membaca Surah
                                </button>
                                
                                <button
                                    onClick={() => {
                                        const shareText = `🕌 ${selectedSurah?.name_latin} (${selectedSurah?.name_arabic})\n\n📖 Surah ke-${selectedSurah?.number} | ${selectedSurah?.total_ayahs} ayat | ${selectedSurah?.revelation_place}\n\n${selectedSurah?.name_indonesian}\n\n🔗 Baca di IndoQuran: ${window.location.origin}/surah/${selectedSurah?.number}`;
                                        const encodedText = encodeURIComponent(shareText);
                                        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="sm:w-auto px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    Bagikan
                                </button>
                                
                                <button
                                    onClick={closeModal}
                                    className="sm:w-auto px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold flex items-center justify-center"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HomePage;
