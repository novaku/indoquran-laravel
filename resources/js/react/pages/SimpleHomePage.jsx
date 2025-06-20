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
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import { fetchWithAuth } from '../utils/apiUtils';
import { getReadingProgress } from '../services/ReadingProgressService';
import authUtils from '../utils/auth';

function SimpleHomePage() {
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
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-12">
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
                                        to="/cari"
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

                        {/* Quick Navigation */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Jelajahi</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    to="/juz"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                                            <BookOpenIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                Telusuri berdasarkan Juz
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Baca Al-Quran dalam 30 bagian
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    to="/halaman"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
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
                                </Link>

                                <Link
                                    to="/doa-bersama"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
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
                                </Link>

                                <Link
                                    to="/penanda"
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
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
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">
                        {/* Prayer Times Widget */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waktu Shalat Hari Ini</h3>
                            <PrayerTimesWidget />
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fakta Singkat</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Surah</span>
                                    <span className="font-semibold text-gray-900">114</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Ayat</span>
                                    <span className="font-semibold text-gray-900">6,236</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Juz</span>
                                    <span className="font-semibold text-gray-900">30</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Halaman</span>
                                    <span className="font-semibold text-gray-900">604</span>
                                </div>
                            </div>
                        </div>

                        {/* Community Section */}
                        {!user && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bergabunglah dengan Komunitas Kami</h3>
                                <p className="text-gray-600 mb-4">
                                    Daftar untuk menyimpan progres bacaan Anda, menandai ayat, dan mengakses fitur yang dipersonalisasi.
                                </p>
                                <Link
                                    to="/auth/register"
                                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Buat Akun
                                </Link>
                                <Link
                                    to="/masuk"
                                    className="block w-full text-center px-4 py-2 mt-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                                >
                                    Masuk
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimpleHomePage;
