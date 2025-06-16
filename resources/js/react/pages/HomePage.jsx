import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ClockIcon, 
    ArrowPathIcon as RefreshIcon, 
    MapPinIcon as LocationMarkerIcon, 
    CalendarIcon, 
    ExclamationTriangleIcon as ExclamationIcon,
    BookOpenIcon,
    MagnifyingGlassIcon,
    BookmarkIcon,
    MusicalNoteIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    HeartIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
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
import FeatureTabsSection from '../components/FeatureTabsSection';

function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
            <div className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 rounded-bl-2xl sm:rounded-bl-3xl"></div>
                
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                        <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gradient-to-br from-islamic-green to-islamic-gold rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-lg relative flex-shrink-0">
                            <span className="text-black font-bold drop-shadow-sm">{surah.number}</span>
                            <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 bg-islamic-gold rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 sm:h-2.5 md:h-3 w-2 sm:w-2.5 md:w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-islamic-green group-hover:text-islamic-gold transition-colors mb-1 truncate">
                                {surah.name_latin}
                            </h3>
                            <div className="flex flex-col space-y-0.5 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-islamic-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate">{surah.revelation_place}</span>
                                </span>
                                <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-islamic-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                    </svg>
                                    {surah.total_ayahs} ayat
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Arabic Name Section */}
                    <div className="text-right ml-2 sm:ml-3 md:ml-4 flex-shrink-0">
                        <h4 className="text-lg sm:text-xl md:text-3xl font-arabic text-islamic-green mb-1 leading-none">{surah.name_arabic}</h4>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[80px] sm:max-w-[100px] md:max-w-none">{surah.name_indonesian}</p>
                    </div>
                </div>
                
                {/* Description Section */}
                {surah.description_short && (
                    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 rounded-lg sm:rounded-xl border border-islamic-green/10">
                        <h5 className="text-xs sm:text-sm font-semibold text-islamic-green mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tentang Surah
                        </h5>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                            {truncateDescription(surah.description_short, 100)}
                        </p>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 space-x-2">
                    <button
                        onClick={handleDetailClick}
                        className="flex items-center px-2 sm:px-3 md:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm flex-1 justify-center min-w-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">Detail</span>
                    </button>
                    
                    <a 
                        href={`/surah/${surah.number}`}
                        className="flex items-center px-2 sm:px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 text-xs sm:text-sm font-medium shadow-sm flex-1 justify-center min-w-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="truncate">Baca</span>
                    </a>
                </div>
            </div>
        );
    });

    // Memoized filtered surahs for better performance
    const filteredSurahs = useMemo(() => {
        return surahs || [];
    }, [surahs]);

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
                <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 pb-16 sm:pb-20">
                    <SEOHead {...getHomeSEO()} />
                    
                    <StructuredData type="WebSite" data={{}} />
                    
                    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <QuranHeader />
                        
                        {/* Widget Pencarian */}
                        <div className="mb-4 sm:mb-6 md:mb-8 mt-4 sm:mt-6 md:mt-8 w-full">
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
                            <p className="text-center text-xs sm:text-sm text-islamic-green/70 mt-2 sm:mt-3 px-2 flex items-center justify-center gap-1 sm:gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-center leading-tight">Cari berdasarkan kata kunci, nama surah, atau terjemahan bahasa Indonesia</span>
                            </p>
                        </div>
                        
                        {/* Running Text for Random Doa Bersama */}
                        <RunningTextWidget className="mb-4 sm:mb-6 md:mb-8" />
                        
                        <PrayerTimesWidget className="mb-8 sm:mb-12 md:mb-16 lg:mb-24 p-2 sm:p-3 md:p-4" />
                        
                        {/* Bagian Tab Fitur */}
                        <FeatureTabsSection className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 p-2 sm:p-3 md:p-4 mt-4 sm:mt-6 md:mt-8" />
                    
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-islamic-green mb-2">Al-Quran Digital</h1>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-3 sm:mb-4 md:mb-6 leading-relaxed">Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia</p>
                        </div>
                    
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                    className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm z-50"
                    onClick={closeModal}
                    style={{ zIndex: 9999 }}
                >
                    <div 
                        className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-0 max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl relative transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with Gradient Background */}
                        <div className="relative bg-gradient-to-r from-islamic-green to-islamic-gold text-black p-3 sm:p-4 md:p-6 lg:p-8 pb-6 sm:pb-8 md:pb-12">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-islamic-pattern opacity-10"></div>
                            
                            {/* Close Button */}
                            <button 
                                onClick={closeModal}
                                className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-black/80 hover:text-black transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Header Content */}
                            <div className="relative z-10">
                                <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                                    <div className="w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-white/20 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center text-black font-bold text-base sm:text-lg md:text-xl mr-2 sm:mr-3 md:mr-4 backdrop-blur-sm">
                                        {selectedSurah?.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-black truncate">
                                            {selectedSurah?.name_latin || 'Surah'}
                                        </h2>
                                        <p className="text-black/90 text-sm sm:text-base md:text-lg truncate">
                                            {selectedSurah?.name_indonesian || ''}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Arabic Name */}
                                <div className="text-center mb-2 sm:mb-3 md:mb-4">
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-arabic leading-none mb-2 text-black">
                                        {selectedSurah?.name_arabic || ''}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                            {/* Quick Stats */}
                            <div className="mb-6 sm:mb-8">
                                <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-islamic-green/10">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                        <div className="flex flex-col items-center text-blue-700">
                                            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm font-medium text-blue-600">Wahyu</div>
                                                <div className="font-bold text-blue-800 text-xs sm:text-sm">
                                                    {selectedSurah?.revelation_place}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center text-purple-700">
                                            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm font-medium text-purple-600">Ayat</div>
                                                <div className="font-bold text-purple-800 text-xs sm:text-sm">
                                                    {selectedSurah?.total_ayahs || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center text-amber-700">
                                            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm font-medium text-amber-600">Urutan</div>
                                                <div className="font-bold text-amber-800 text-xs sm:text-sm">
                                                    #{selectedSurah?.number || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    
                                        <div className="flex flex-col items-center text-green-700">
                                            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm font-medium text-green-600">Periode</div>
                                                <div className="font-bold text-green-800 text-xs sm:text-sm">
                                                    {selectedSurah?.revelation_place}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Themes */}
                            {selectedSurah?.description_short && (
                                <div className="mb-6 sm:mb-8">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-islamic-green/10 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <span className="text-base sm:text-lg md:text-xl">Tema & Kandungan Utama</span>
                                    </h4>
                                    <div className="bg-gradient-to-r from-islamic-green/5 to-islamic-gold/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-islamic-green/10">
                                        <div 
                                            className="text-gray-700 leading-relaxed prose prose-gray max-w-none text-sm sm:text-base"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_short }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Detailed Description */}
                            {selectedSurah?.description_long && (
                                <div className="mb-6 sm:mb-8">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-islamic-gold/10 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 text-islamic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <span className="text-base sm:text-lg md:text-xl">Penjelasan Lengkap</span>
                                    </h4>
                                    <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-amber-100">
                                        <div 
                                            className="text-gray-700 leading-relaxed prose prose-gray max-w-none text-sm sm:text-base"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_long }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Fun Facts */}
                            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-indigo-100">
                                <h4 className="text-base sm:text-lg font-bold text-indigo-800 mb-3 sm:mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Fakta Menarik
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-start text-indigo-700">
                                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-indigo-400 rounded-full mr-2 sm:mr-3 mt-2 flex-shrink-0"></span>
                                        <span><strong>Nama:</strong> {selectedSurah?.name_latin} berarti "{selectedSurah?.name_indonesian}"</span>
                                    </div>
                                    <div className="flex items-start text-indigo-700">
                                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-indigo-400 rounded-full mr-2 sm:mr-3 mt-2 flex-shrink-0"></span>
                                        <span><strong>Posisi:</strong> Surah ke-{selectedSurah?.number} dari 114 surah</span>
                                    </div>
                                    <div className="flex items-start text-indigo-700">
                                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-indigo-400 rounded-full mr-2 sm:mr-3 mt-2 flex-shrink-0"></span>
                                        <span><strong>Klasifikasi:</strong> {selectedSurah?.revelation_place}</span>
                                    </div>
                                    <div className="flex items-start text-indigo-700">
                                        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-indigo-400 rounded-full mr-2 sm:mr-3 mt-2 flex-shrink-0"></span>
                                        <span><strong>Panjang:</strong> {selectedSurah?.total_ayahs} ayat</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-3 sm:p-4 md:p-6 lg:p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-gray-50/80">
                            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                {/* Primary Action - Always full width */}
                                <button
                                    onClick={() => navigate(`/surah/${selectedSurah?.number}`)}
                                    className="w-full bg-gradient-to-r from-islamic-green to-emerald-600 hover:from-islamic-green/90 hover:to-emerald-600/90 text-white py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 active:scale-98 group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="tracking-wide">Mulai Membaca Surah</span>
                                </button>
                                
                                {/* Secondary Actions Row */}
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <button
                                        onClick={() => {
                                            const shareText = `🕌 ${selectedSurah?.name_latin} (${selectedSurah?.name_arabic})\n\n📖 Surah ke-${selectedSurah?.number} | ${selectedSurah?.total_ayahs} ayat | ${selectedSurah?.revelation_place}\n\n${selectedSurah?.name_indonesian}\n\n🔗 Baca di IndoQuran: ${window.location.origin}/surah/${selectedSurah?.number}`;
                                            const encodedText = encodeURIComponent(shareText);
                                            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                                            window.open(whatsappUrl, '_blank');
                                        }}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-medium text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 active:scale-98 group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        <span className="tracking-wide">Bagikan</span>
                                    </button>
                                    
                                    <button
                                        onClick={closeModal}
                                        className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-medium text-xs sm:text-sm md:text-base flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 active:scale-98 group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="tracking-wide">Tutup</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HomePage;
