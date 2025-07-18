import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon, 
    MagnifyingGlassIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    AcademicCapIcon,
    UserGroupIcon,
    HeartIcon,
    PlayIcon,
    ChevronRightIcon,
    StarIcon,
    ArrowPathIcon,
    BookmarkIcon,
    DocumentTextIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import QuranBookAnimation from '../components/QuranBookAnimation';
import { fetchWithAuth } from '../utils/apiUtils';
import { getReadingProgress } from '../services/ReadingProgressService';
import authUtils from '../utils/auth';

function QuranHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentReading, setRecentReading] = useState(null);
    const [popularSurahs, setPopularSurahs] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(false);

    // Fetch popular/random surahs
    const fetchPopularSurahs = useCallback(async () => {
        setLoadingPopular(true);
        try {
            const token = authUtils.getAuthToken();
            const response = await fetchWithAuth('/api/surahs/random?count=6', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch popular surahs');
            const result = await response.json();
            
            if (result.status === 'success') {
                setPopularSurahs(result.data);
            } else {
                throw new Error("Failed to load popular surahs");
            }
        } catch (error) {
            console.error('Error fetching popular surahs:', error);
            // Fallback to featured surahs if API fails
            if (surahs.length > 0) {
                const featured = [
                    surahs.find(s => s.number === 1), // Al-Fatihah
                    surahs.find(s => s.number === 2), // Al-Baqarah
                    surahs.find(s => s.number === 18), // Al-Kahf
                    surahs.find(s => s.number === 36), // Ya-Sin
                    surahs.find(s => s.number === 55), // Ar-Rahman
                    surahs.find(s => s.number === 67), // Al-Mulk
                ].filter(Boolean);
                setPopularSurahs(featured);
            }
        } finally {
            setLoadingPopular(false);
        }
    }, [surahs]);

    // Fetch surahs data
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
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
                    setSurahs(result.data);
                } else {
                    throw new Error("Failed to load surahs");
                }
            } catch (error) {
                console.error('Error fetching surahs:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Fetch popular surahs when surahs are loaded
    useEffect(() => {
        if (surahs.length > 0) {
            fetchPopularSurahs();
        }
    }, [surahs, fetchPopularSurahs]);

    // Get user's real reading progress
    useEffect(() => {
        const fetchReadingProgress = async () => {
            if (user) {
                try {
                    const response = await getReadingProgress();
                    if (response.status === 'success' && response.data) {
                        setRecentReading({
                            surah: response.data.surah,
                            lastVerse: response.data.ayah_number,
                            lastReadAt: response.data.last_read_at
                        });
                    } else {
                        // No reading progress found, default to Al-Fatihah
                        if (surahs.length > 0) {
                            setRecentReading({
                                surah: surahs[0], // Al-Fatihah as default
                                lastVerse: 1
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching reading progress:', error);
                    // Fallback to Al-Fatihah if there's an error
                    if (surahs.length > 0) {
                        setRecentReading({
                            surah: surahs[0],
                            lastVerse: 1
                        });
                    }
                }
            }
        };

        fetchReadingProgress();
    }, [user, surahs]);

    const handleStartReading = () => {
        if (recentReading && recentReading.surah) {
            navigate(`/surah/${recentReading.surah.number}/${recentReading.lastVerse}`);
        } else {
            navigate('/surah/1'); // Default to Al-Fatihah
        }
    };

    const handleRefreshPopular = () => {
        fetchPopularSurahs();
    };

    const handleShareToWhatsApp = () => {
        const url = window.location.origin;
        const text = "Baca, Dengarkan, dan Pelajari Al-Quran Online di IndoQuran 📖✨\n\nNikmati Al-Quran dengan bacaan yang indah, terjemahan akurat, dan alat pembelajaran komprehensif.";
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Terjadi kesalahan memuat konten</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead 
                title="Baca, Dengarkan, dan Pelajari Al-Quran Online - IndoQuran"
                description="Baca Al-Quran dengan terjemahan, dengarkan tilawah indah, dan perdalam pemahaman dengan alat pembelajaran yang komprehensif."
            />

            {/* Hero Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                            Baca, Dengarkan, dan Pelajari
                            <span className="block text-green-600">Al-Quran</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
                            Nikmati Al-Quran dengan bacaan yang indah, terjemahan akurat, 
                            dan alat pembelajaran komprehensif yang dirancang untuk pembelajaran modern.
                        </p>

                        {/* Book Animation */}
                        <div className="flex justify-center mb-8 sm:mb-12">
                            <div className="relative">
                                <QuranBookAnimation 
                                    size="lg" 
                                    autoPlay={true}
                                    className="animate-float"
                                />
                                {/* Decorative elements around the book */}
                                <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-6 h-6 lg:w-8 lg:h-8 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
                                <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 w-4 h-4 lg:w-6 lg:h-6 bg-green-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 -right-4 lg:-right-8 w-3 h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
                            </div>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                            <SearchField 
                                placeholder="Cari ayat, surah, atau topik..."
                                className="w-full"
                                surahs={surahs}
                            />
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
                            <button
                                onClick={handleStartReading}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-base sm:text-lg"
                            >
                                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Mulai Membaca</span>
                            </button>
                            
                            <Link
                                to="/cari"
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-colors font-semibold text-base sm:text-lg"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Pencarian Lanjutan</span>
                            </Link>

                            <button
                                onClick={handleShareToWhatsApp}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-base sm:text-lg"
                                title="Bagikan ke WhatsApp"
                            >
                                <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8 sm:space-y-12">
                        {/* Continue Reading Section */}
                        {user && recentReading && (
                            <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Lanjutkan Membaca</h2>
                                    <Link 
                                        to="/profil"
                                        className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
                                    >
                                        Lihat Progres
                                    </Link>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {recentReading.surah.name_english}
                                            </h3>
                                            <p className="text-gray-600 mb-2">
                                                {recentReading.surah.name_arabic} • Ayat {recentReading.lastVerse}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {recentReading.surah.verses_count} ayat • {recentReading.surah.revelation_place}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleStartReading}
                                            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                                        >
                                            <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Lanjutkan</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Popular Surahs */}
                        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Surah Populer</h2>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={handleRefreshPopular}
                                        disabled={loadingPopular}
                                        className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Dapatkan surah acak"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${loadingPopular ? 'animate-spin' : ''}`} />
                                        <span>Acak</span>
                                    </button>
                                    <Link 
                                        to="/surah"
                                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium text-sm"
                                    >
                                        <span>Lihat Semua</span>
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {loadingPopular ? (
                                    // Loading skeleton
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="p-3 sm:p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg"></div>
                                                    <div>
                                                        <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-24 sm:w-32"></div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="h-4 bg-gray-200 rounded w-12 sm:w-16 mb-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    popularSurahs.map((surah, index) => (
                                        <Link
                                            key={surah.number}
                                            to={`/surah/${surah.number}`}
                                            className="group p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                        <span className="font-bold text-green-700 text-sm sm:text-base">
                                                            {surah.number}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                            {surah.name_latin}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            {surah.total_ayahs} ayat • {surah.revelation_place}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-arabic text-base sm:text-lg text-gray-700 mb-1">
                                                        {surah.name_arabic}
                                                    </p>
                                                    {[1, 2, 18, 36, 55, 67, 112, 113, 114].includes(surah.number) && (
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                                            <span className="text-xs text-gray-500">Populer</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Quick Navigation */}
                        <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Jelajahi</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <Link
                                    to="/surah"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                                            <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Daftar Surah
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Semua 114 surah Al-Quran
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/juz"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                                            <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Telusuri berdasarkan Juz
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Baca Al-Quran dalam 30 bagian
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/halaman"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                                            <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Telusuri berdasarkan Halaman
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Baca seperti dalam Mushaf tradisional
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/tafsir-maudhui"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                                            <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Tafsir Maudhui
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Topik-topik tematik dalam Al-Quran
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/doa-bersama"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200">
                                            <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Doa Bersama
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Kumpulan doa harian dan wirid
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/penanda"
                                    className="group p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200">
                                            <BookmarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700 text-sm sm:text-base">
                                                Bookmark
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                Ayat dan surah yang disimpan
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Prayer Times Widget */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Waktu Shalat Hari Ini</h3>
                            <PrayerTimesWidget />
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Fakta Singkat</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm sm:text-base">Total Surah</span>
                                    <span className="font-semibold text-gray-900">114</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm sm:text-base">Total Ayat</span>
                                    <span className="font-semibold text-gray-900">6,236</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm sm:text-base">Total Juz</span>
                                    <span className="font-semibold text-gray-900">30</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm sm:text-base">Total Halaman</span>
                                    <span className="font-semibold text-gray-900">604</span>
                                </div>
                            </div>
                        </div>

                        {/* Share Widget */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Bagikan</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Ajak teman dan keluarga untuk membaca Al-Quran bersama
                            </p>
                            <button
                                onClick={handleShareToWhatsApp}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Bagikan ke WhatsApp</span>
                            </button>
                        </div>

                        {/* Community Section */}
                        {!user && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Bergabunglah dengan Komunitas Kami</h3>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Daftar untuk menyimpan progres bacaan Anda, menandai ayat, dan mengakses fitur yang dipersonalisasi.
                                </p>
                                <Link
                                    to="/daftar"
                                    className="inline-flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm w-full sm:w-auto justify-center"
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuranHomePage;
