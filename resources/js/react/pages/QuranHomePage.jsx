import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon, 
    MagnifyingGlassIcon,
    AcademicCapIcon,
    UserGroupIcon,
    HeartIcon,
    PlayIcon,
    ChevronRightIcon,
    StarIcon,
    ArrowPathIcon,
    BookmarkIcon,
    DocumentTextIcon,
    ShareIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import QuranBookAnimation from '../components/QuranBookAnimation';
import StatsWidget from '../components/StatsWidget';
import HeroStatsSection from '../components/HeroStatsSection';
import StatsTickerBanner from '../components/StatsTickerBanner';
import { fetchWithAuth } from '../utils/apiUtils';
import { getReadingProgress } from '../services/ReadingProgressService';
import authUtils from '../utils/auth';

// Add custom styles for Arabic calligraphy in Asmaul Husna card
const asmaulHusnaStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    
    .arabic-calligraphy-asmaul {
        font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', serif;
        font-feature-settings: 'liga' on, 'dlig' on, 'calt' on;
        text-rendering: optimizeLegibility;
        direction: rtl;
        font-weight: 400;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
`;

function QuranHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentReading, setRecentReading] = useState(null);
    const [popularSurahs, setPopularSurahs] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [randomAsmaulHusna, setRandomAsmaulHusna] = useState(null);
    const [loadingAsmaulHusna, setLoadingAsmaulHusna] = useState(false);
    const [exploreStats, setExploreStats] = useState({
        totalSurahs: 114,
        totalJuz: 30,
        totalPages: 604,
        totalAsmaulHusna: 99,
        totalTopics: 0,
        totalDuas: 0,
        totalBookmarks: 0
    });

    // Fetch popular/random surahs
    const fetchPopularSurahs = useCallback(async () => {
        setLoadingPopular(true);
        try {
            const token = authUtils.getAuthToken();
            // Add cache-busting parameter to ensure fresh random results
            const timestamp = Date.now();
            const response = await fetchWithAuth(`/api/surahs/random?count=6&_t=${timestamp}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
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

    // Fetch random Asmaul Husna
    const fetchRandomAsmaulHusna = useCallback(async () => {
        setLoadingAsmaulHusna(true);
        try {
            const response = await fetchWithAuth('/api/asmaul-husna', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch asmaul husna data');
            const result = await response.json();
            
            if (Array.isArray(result) && result.length > 0) {
                // Get a random name from the array
                const randomIndex = Math.floor(Math.random() * result.length);
                const randomName = result[randomIndex];
                setRandomAsmaulHusna(randomName);
            }
        } catch (error) {
            console.error('Error fetching asmaul husna:', error);
            // Fallback to a static name if API fails
            setRandomAsmaulHusna({
                id: 1,
                arabic: "الرَّحْمَٰنُ",
                latin: "Ar-Rahman",
                meaning: "Yang Maha Pengasih",
                description: "Allah yang memberikan rahmat kepada semua makhluk tanpa memandang apakah mereka beriman atau tidak."
            });
        } finally {
            setLoadingAsmaulHusna(false);
        }
    }, []);

    // Fetch explore statistics
    const fetchExploreStats = useCallback(async () => {
        try {
            const token = authUtils.getAuthToken();
            
            // Fetch various statistics in parallel
            const requests = [
                fetchWithAuth('/api/tafsir-maudhui/count', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).catch(() => ({ ok: false })),
                fetchWithAuth('/api/dua-bersama/count', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).catch(() => ({ ok: false })),
                user ? fetchWithAuth('/api/bookmarks/count', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).catch(() => ({ ok: false })) : Promise.resolve({ ok: false })
            ];

            const [topicsResponse, duasResponse, bookmarksResponse] = await Promise.all(requests);

            // Prepare updates object
            const updates = {};

            // Process topics count
            if (topicsResponse.ok) {
                try {
                    const topicsData = await topicsResponse.json();
                    if (topicsData.status === 'success') {
                        updates.totalTopics = topicsData.data.count || 0;
                    }
                } catch (error) {
                    console.error('Error parsing topics response:', error);
                }
            }

            // Process duas count
            if (duasResponse.ok) {
                try {
                    const duasData = await duasResponse.json();
                    if (duasData.status === 'success') {
                        updates.totalDuas = duasData.data.count || 0;
                    }
                } catch (error) {
                    console.error('Error parsing duas response:', error);
                }
            }

            // Process bookmarks count (only if user is logged in)
            if (user && bookmarksResponse.ok) {
                try {
                    const bookmarksData = await bookmarksResponse.json();
                    if (bookmarksData.status === 'success') {
                        updates.totalBookmarks = bookmarksData.data.count || 0;
                    }
                } catch (error) {
                    console.error('Error parsing bookmarks response:', error);
                }
            }

            // Update state with all changes at once
            if (Object.keys(updates).length > 0) {
                setExploreStats(prev => ({ ...prev, ...updates }));
            }
        } catch (error) {
            console.error('Error fetching explore statistics:', error);
            // Keep default values if API fails
        }
    }, [user]); // Re-fetch when user changes (for bookmarks count)

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

    // Fetch random Asmaul Husna on component mount
    useEffect(() => {
        fetchRandomAsmaulHusna();
    }, [fetchRandomAsmaulHusna]);

    // Fetch explore statistics on component mount
    useEffect(() => {
        fetchExploreStats();
    }, [user, fetchExploreStats]); // Re-fetch when user changes (for bookmarks count)

    // Inject styles for Asmaul Husna calligraphy
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = asmaulHusnaStyles;
        document.head.appendChild(styleElement);

        // Cleanup function to remove styles when component unmounts
        return () => {
            if (styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
        };
    }, []);

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

    const handleRefreshAsmaulHusna = () => {
        fetchRandomAsmaulHusna();
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

            {/* Stats Ticker Banner */}
            <StatsTickerBanner />

            {/* Hero Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Baca, Dengarkan, dan Pelajari
                            <span className="block text-green-600">Al-Quran</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Nikmati Al-Quran dengan bacaan yang indah, terjemahan akurat, 
                            dan alat pembelajaran komprehensif yang dirancang untuk pembelajaran modern.
                        </p>

                        {/* Book Animation */}
                        <div className="flex justify-center mb-12">
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
                        <div className="max-w-2xl mx-auto mb-8">
                            <SearchField 
                                placeholder="Cari ayat, surah, atau topik..."
                                className="w-full"
                                surahs={surahs}
                            />
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleStartReading}
                                className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
                            >
                                <BookOpenIcon className="w-6 h-6" />
                                <span>Mulai Membaca</span>
                            </button>
                            
                            <Link
                                to="/cari"
                                className="flex items-center space-x-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-colors font-semibold text-lg"
                            >
                                <MagnifyingGlassIcon className="w-6 h-6" />
                                <span>Pencarian Lanjutan</span>
                            </Link>

                            <button
                                onClick={handleShareToWhatsApp}
                                className="flex items-center space-x-2 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-lg"
                                title="Bagikan ke WhatsApp"
                            >
                                <ShareIcon className="w-6 h-6" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero Statistics Section */}
            <HeroStatsSection />

            {/* Member Benefits Promotion Banner */}
            <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                            <HeartIcon className="w-5 h-5 mr-2" />
                            Fitur Member Eksklusif
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Dapatkan Pengalaman Premium
                        </h2>
                        <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                            Bookmark ayat, catat refleksi pribadi, tracking progress baca, dan bergabung dengan komunitas muslim
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/member"
                                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Lihat Semua Keuntungan
                            </Link>
                            {!user && (
                                <Link
                                    to="/daftar"
                                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-full transition-all duration-300"
                                >
                                    Daftar Gratis
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Highlight Banner */}
            {!user && (
                <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                                <StarIcon className="w-5 h-5 mr-2" />
                                Bergabung Gratis
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Mulai Perjalanan Spiritual Anda
                            </h2>
                            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                                Daftar sekarang dan nikmati fitur lengkap: simpan progres bacaan, 
                                bookmark ayat favorit, dan dapatkan pengalaman Al-Quran yang personal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    to="/daftar"
                                    className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-gray-50 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <UserGroupIcon className="w-6 h-6" />
                                    <span>Daftar Sekarang</span>
                                </Link>
                                <Link
                                    to="/masuk"
                                    className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-semibold text-lg"
                                >
                                    <span>Sudah Punya Akun?</span>
                                </Link>
                            </div>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                <div className="flex items-center justify-center space-x-3 text-white">
                                    <BookmarkIcon className="w-6 h-6 text-green-200" />
                                    <span className="text-sm">Simpan Bookmark</span>
                                </div>
                                <div className="flex items-center justify-center space-x-3 text-white">
                                    <ChartBarIcon className="w-6 h-6 text-green-200" />
                                    <span className="text-sm">Lacak Progres</span>
                                </div>
                                <div className="flex items-center justify-center space-x-3 text-white">
                                    <HeartIcon className="w-6 h-6 text-green-200" />
                                    <span className="text-sm">Pengalaman Personal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-8">
                    {/* Main Content */}
                    <div className="space-y-12">
                        {/* Continue Reading Section */}
                        {user && recentReading && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Lanjutkan Membaca</h2>
                                    <Link 
                                        to="/profil"
                                        className="text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Lihat Progres
                                    </Link>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <PlayIcon className="w-5 h-5" />
                                            <span>Lanjutkan</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Popular Surahs */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Surah Populer</h2>
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
                                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
                                    >
                                        <span>Lihat Semua</span>
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loadingPopular ? (
                                    // Loading skeleton
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="p-4 rounded-xl border border-gray-200 animate-pulse">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                                    <div>
                                                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    popularSurahs.map((surah, index) => (
                                        <Link
                                            key={surah.number}
                                            to={`/surah/${surah.number}`}
                                            className="group p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                        <span className="font-bold text-green-700">
                                                            {surah.number}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                            {surah.name_latin}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {surah.total_ayahs} ayat • {surah.revelation_place}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-arabic text-lg text-gray-700 mb-1">
                                                        {surah.name_arabic}
                                                    </p>
                                                    {[1, 2, 18, 36, 55, 67, 112, 113, 114].includes(surah.number) && (
                                                        <div className="flex items-center space-x-1">
                                                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
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

                        {/* Statistics Widget */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistik Komunitas</h2>
                            <StatsWidget />
                        </section>

                        {/* Quick Navigation */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Jelajahi</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/surah"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                                                <BookOpenIcon className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Daftar Surah
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Semua {exploreStats.totalSurahs} surah Al-Quran
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {exploreStats.totalSurahs}
                                            </div>
                                            <div className="text-xs text-gray-500">surah</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/juz"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                                                <BookOpenIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Telusuri berdasarkan Juz
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Baca Al-Quran dalam {exploreStats.totalJuz} bagian
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {exploreStats.totalJuz}
                                            </div>
                                            <div className="text-xs text-gray-500">juz</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/halaman"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                                                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Telusuri berdasarkan Halaman
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Baca seperti dalam Mushaf tradisional
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {exploreStats.totalPages}
                                            </div>
                                            <div className="text-xs text-gray-500">halaman</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/asmaul-husna"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200">
                                                <StarIcon className="w-6 h-6 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Asmaul Husna
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {exploreStats.totalAsmaulHusna} nama indah Allah SWT
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {exploreStats.totalAsmaulHusna}
                                            </div>
                                            <div className="text-xs text-gray-500">nama</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/tafsir-maudhui"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                                                <AcademicCapIcon className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Tafsir Maudhui
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Topik-topik tematik dalam Al-Quran
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {exploreStats.totalTopics || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">topik</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/doa-bersama"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200">
                                                <UserGroupIcon className="w-6 h-6 text-rose-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Doa Bersama
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Kumpulan doa harian dan wirid
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-rose-600">
                                                {exploreStats.totalDuas || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">doa</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/penanda"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200">
                                                <BookmarkIcon className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Bookmark
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Ayat dan surah yang disimpan
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-amber-600">
                                                {user ? (exploreStats.totalBookmarks || '0') : '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">bookmark</div>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/statistik"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                                                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                    Statistik
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Data dan analisis penggunaan
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-indigo-600">
                                                📊
                                            </div>
                                            <div className="text-xs text-gray-500">data</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuranHomePage;
