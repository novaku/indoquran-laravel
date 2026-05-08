import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BookOpenIcon,
    MagnifyingGlassIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    PlayIcon,
    ChevronRightIcon,
    StarIcon,
    ArrowPathIcon,
    UserGroupIcon,
    NewspaperIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import OnlineUsersWidget from '../components/OnlineUsersWidget';
import { Card, Button, Badge } from '../components/ui';
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
    const [randomArticle, setRandomArticle] = useState(null);
    const [loadingArticle, setLoadingArticle] = useState(false);
    const [randomTafsir, setRandomTafsir] = useState(null);
    const [loadingTafsir, setLoadingTafsir] = useState(false);

    const exploreOverview = {
        totalSurahs: 114,
        totalJuz: 30,
        totalPages: 604,
        totalAsmaulHusna: 99
    };

    const navigationItems = [
        {
            to: '/surah',
            title: 'Daftar Surah',
            description: `Semua ${exploreOverview.totalSurahs} surah Al-Quran`,
            icon: BookOpenIcon,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            to: '/juz',
            title: 'Telusuri Juz',
            description: `${exploreOverview.totalJuz} bagian bacaan teratur`,
            icon: BookOpenIcon,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            to: '/halaman',
            title: 'Telusuri Halaman',
            description: `${exploreOverview.totalPages} halaman mushaf digital`,
            icon: DocumentTextIcon,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            to: '/asmaul-husna',
            title: 'Asmaul Husna',
            description: `${exploreOverview.totalAsmaulHusna} nama Allah SWT`,
            icon: StarIcon,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600'
        },
        {
            to: '/tafsir-maudhui',
            title: 'Tafsir Tematik',
            description: 'Pelajari tema utama Al-Quran',
            icon: AcademicCapIcon,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
        {
            to: '/doa-bersama',
            title: 'Doa dan Wirid',
            description: 'Rangkaian doa harian pilihan',
            icon: UserGroupIcon,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600'
        }
    ];

    const fetchPopularSurahs = useCallback(async () => {
        if (surahs.length === 0) {
            return;
        }

        setLoadingPopular(true);
        try {
            const token = authUtils.getAuthToken();
            const timestamp = Date.now();
            const response = await fetchWithAuth(`/api/surahs/random?count=6&_t=${timestamp}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch popular surahs');
            }

            const result = await response.json();
            if (result.status === 'success') {
                setPopularSurahs(result.data);
            } else {
                throw new Error('Failed to load popular surahs');
            }
        } catch (err) {
            console.error('Error fetching popular surahs:', err);
            // Fallback keeps recommendations helpful when API fails.
            const fallbackNumbers = [1, 2, 18, 36, 55, 67];
            const fallback = fallbackNumbers
                .map((number) => surahs.find((surah) => surah.number === number))
                .filter(Boolean);
            setPopularSurahs(fallback);
        } finally {
            setLoadingPopular(false);
        }
    }, [surahs]);

    const fetchRandomArticle = useCallback(async () => {
        setLoadingArticle(true);
        try {
            const response = await fetchWithAuth('/api/articles/random', {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch random article');
            }

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                setRandomArticle(result.data);
            }
        } catch (err) {
            console.error('Error fetching random article:', err);
            // Silently fail - article is optional content
        } finally {
            setLoadingArticle(false);
        }
    }, []);

    const fetchRandomTafsir = useCallback(async () => {
        setLoadingTafsir(true);
        try {
            const response = await fetchWithAuth('/api/tafsir-maudhui/random', {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch random tafsir maudhui');
            }

            const result = await response.json();
            if (result.status === 'success' && result.data) {
                setRandomTafsir(result.data);
            }
        } catch (err) {
            console.error('Error fetching random tafsir maudhui:', err);
            // Silently fail - tafsir is optional content
        } finally {
            setLoadingTafsir(false);
        }
    }, []);

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const token = authUtils.getAuthToken();
                const response = await fetchWithAuth('/api/surahs', {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch surahs');
                }

                const result = await response.json();
                if (result.status === 'success') {
                    setSurahs(result.data);
                } else {
                    throw new Error('Failed to load surahs');
                }
            } catch (err) {
                console.error('Error fetching surahs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    useEffect(() => {
        if (surahs.length > 0) {
            fetchPopularSurahs();
        }
    }, [surahs, fetchPopularSurahs]);

    useEffect(() => {
        fetchRandomArticle();
    }, [fetchRandomArticle]);

    useEffect(() => {
        fetchRandomTafsir();
    }, [fetchRandomTafsir]);

    useEffect(() => {
        const fetchReadingProgress = async () => {
            if (!user) {
                setRecentReading(null);
                return;
            }

            try {
                const response = await getReadingProgress();
                if (response.status === 'success' && response.data) {
                    setRecentReading({
                        surah: response.data.surah,
                        lastVerse: response.data.ayah_number,
                        lastReadAt: response.data.last_read_at
                    });
                    return;
                }
            } catch (err) {
                console.error('Error fetching reading progress:', err);
            }

            if (surahs.length > 0) {
                setRecentReading({ surah: surahs[0], lastVerse: 1 });
            }
        };

        fetchReadingProgress();
    }, [user, surahs]);

    const handleStartReading = () => {
        if (recentReading?.surah) {
            navigate(`/surah/${recentReading.surah.number}/${recentReading.lastVerse}`);
        } else {
            navigate('/surah/1');
        }
    };

    const handleRefreshPopular = () => {
        fetchPopularSurahs();
    };

    const handleRefreshTafsir = () => {
        fetchRandomTafsir();
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
                <Card className="text-center max-w-md">
                    <p className="text-red-600 mb-4">Terjadi kesalahan memuat konten</p>
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                    >
                        Coba Lagi
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead
                title="Baca dan Pelajari Al-Quran Online - IndoQuran"
                description="IndoQuran menghadirkan bacaan Al-Quran, audio tilawah, serta referensi belajar yang terkurasi."
            />

            <section className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="flex flex-col items-center text-center space-y-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">IndoQuran</h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
                                Platform Al-Quran yang ringkas dan informatif untuk membaca, mendengar, dan memahami ayat demi ayat.
                            </p>
                        </div>

                        {/* Online Users Widget */}
                        <div className="flex justify-center">
                            <OnlineUsersWidget />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartReading}
                                leftIcon={<BookOpenIcon className="w-5 h-5" />}
                            >
                                Mulai Membaca
                            </Button>
                            <Link to="/cari">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                                >
                                    Pencarian Lanjutan
                                </Button>
                            </Link>
                        </div>

                        <div className="max-w-2xl w-full">
                            <SearchField
                                placeholder="Cari ayat, surah, atau topik..."
                                className="w-full"
                                surahs={surahs}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                            <Card padding="md" className="bg-gray-50">
                                <p className="text-sm text-gray-500">Surah</p>
                                <p className="text-2xl font-semibold text-gray-900">{exploreOverview.totalSurahs}</p>
                            </Card>
                            <Card padding="md" className="bg-gray-50">
                                <p className="text-sm text-gray-500">Juz</p>
                                <p className="text-2xl font-semibold text-gray-900">{exploreOverview.totalJuz}</p>
                            </Card>
                            <Card padding="md" className="bg-gray-50">
                                <p className="text-sm text-gray-500">Halaman Mushaf</p>
                                <p className="text-2xl font-semibold text-gray-900">{exploreOverview.totalPages}</p>
                            </Card>
                            <Card padding="md" className="bg-gray-50">
                                <p className="text-sm text-gray-500">Asmaul Husna</p>
                                <p className="text-2xl font-semibold text-gray-900">{exploreOverview.totalAsmaulHusna}</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Iklan Horizontal - Setelah Hero Section */}

            {/* Main content dengan sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main content - 8 kolom di desktop */}
                    <main className="lg:col-span-8 space-y-10">
                {user && recentReading?.surah && (
                    <Card shadow="sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Lanjutkan Membaca</h2>
                                <p className="text-sm text-gray-500">Mulai dari tempat terakhir Anda membaca</p>
                            </div>
                            <Link
                                to="/profil"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Lihat progres lengkap
                            </Link>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {recentReading.surah.name_latin || recentReading.surah.name_english}
                                    </h3>
                                    <p className="text-gray-600">
                                        {recentReading.surah.name_arabic} • Ayat {recentReading.lastVerse}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {(recentReading.surah.total_ayahs ?? recentReading.surah.verses_count) || '-'} ayat • {recentReading.surah.revelation_place}
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleStartReading}
                                    leftIcon={<PlayIcon className="w-5 h-5" />}
                                >
                                    Buka Surah
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <Card shadow="sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Surah Rekomendasi</h2>
                            <p className="text-sm text-gray-500">Temukan bacaan populer untuk memperdalam tadabbur</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshPopular}
                                disabled={loadingPopular}
                                leftIcon={<ArrowPathIcon className={`w-4 h-4 ${loadingPopular ? 'animate-spin' : ''}`} />}
                                title="Tampilkan rekomendasi lain"
                            >
                                Segarkan
                            </Button>
                            <Link to="/surah" className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium">
                                <span>Semua surah</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loadingPopular ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="p-4 rounded-xl border border-gray-200 animate-pulse">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32" />
                                            <div className="h-3 bg-gray-200 rounded w-24" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : popularSurahs.length > 0 ? (
                            popularSurahs.map((surah) => {
                                const totalAyahs = surah.total_ayahs ?? surah.verses_count;
                                return (
                                    <Link
                                        key={surah.number}
                                        to={`/surah/${surah.number}`}
                                        className="group p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                    <span className="font-bold text-green-700">{surah.number}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700">
                                                        {surah.name_latin}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {totalAyahs} ayat • {surah.revelation_place}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-arabic text-lg text-gray-700 mb-1">
                                                    {surah.name_arabic}
                                                </p>
                                                {[1, 2, 18, 36, 55, 67].includes(surah.number) && (
                                                    <div className="flex items-center space-x-1">
                                                        <StarIcon className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-xs text-gray-500">Sering dibaca</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-6">
                                Rekomendasi surah belum tersedia saat ini.
                            </div>
                        )}
                    </div>
                </Card>

                {randomTafsir && (
                    <Card shadow="sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Tafsir Tematik Pilihan</h2>
                                <p className="text-sm text-gray-500">Pelajari tema penting dalam Al-Quran</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefreshTafsir}
                                    disabled={loadingTafsir}
                                    leftIcon={<ArrowPathIcon className={`w-4 h-4 ${loadingTafsir ? 'animate-spin' : ''}`} />}
                                    title="Tampilkan topik lain"
                                >
                                    Segarkan
                                </Button>
                                <Link to="/tafsir-maudhui" className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium">
                                    <span>Lihat semua</span>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {loadingTafsir ? (
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                            </div>
                        ) : (
                            <Link
                                to={`/tafsir-maudhui/${randomTafsir.slug}`}
                                className="group block p-6 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                                        <AcademicCapIcon className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                                            {randomTafsir.topic}
                                        </h3>
                                        {randomTafsir.description && (
                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                {randomTafsir.description}
                                            </p>
                                        )}
                                        {randomTafsir.verses && randomTafsir.verses.length > 0 && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                                <BookOpenIcon className="w-4 h-4" />
                                                <span>{randomTafsir.verses.length} ayat terkait</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-orange-600 font-medium group-hover:underline">
                                            <span>Pelajari selengkapnya</span>
                                            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </Card>
                )}

                {randomArticle && (
                    <Card shadow="sm" className="overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Artikel Pilihan</h2>
                                <p className="text-sm text-gray-500">Bacaan menarik untuk menambah wawasan Islam</p>
                            </div>
                            <Link to="/artikel" className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium">
                                <span>Lihat semua</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        </div>

                        {loadingArticle ? (
                            <div className="animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        ) : (
                            <Link
                                to={`/artikel/${randomArticle.slug}`}
                                className="group block"
                            >
                                {randomArticle.featured_image_url && (
                                    <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                            src={randomArticle.featured_image_url}
                                            alt={randomArticle.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                                        {randomArticle.title}
                                    </h3>
                                    {randomArticle.excerpt && (
                                        <p className="text-gray-600 line-clamp-3">
                                            {randomArticle.excerpt}
                                        </p>
                                    )}
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        {randomArticle.author && (
                                            <div className="flex items-center space-x-1">
                                                <UserGroupIcon className="w-4 h-4" />
                                                <span>{randomArticle.author.name}</span>
                                            </div>
                                        )}
                                        {randomArticle.reading_time && (
                                            <div className="flex items-center space-x-1">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{randomArticle.reading_time} menit baca</span>
                                            </div>
                                        )}
                                        {randomArticle.formatted_date && (
                                            <span>{randomArticle.formatted_date}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-green-600 font-medium group-hover:underline">
                                        <span>Baca selengkapnya</span>
                                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        )}
                    </Card>
                )}

                <Card shadow="sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Jelajahi Konten</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group p-6 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center group-hover:opacity-90 transition-colors`}>
                                                <Icon className={`w-6 h-6 ${item.iconColor}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 group-hover:text-green-700">{item.title}</h3>
                                                <p className="text-sm text-gray-500">{item.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </Card>
            </main>

                    {/* Sidebar - 4 kolom di desktop, tersembunyi di mobile */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* Sticky sidebar untuk iklan */}
                        <div className="sticky top-4 space-y-6">
                            {/* Informasi Cepat */}
                            <Card shadow="sm">
                                <h3 className="font-semibold text-gray-900 mb-3">Informasi Cepat</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>📖 {exploreOverview.totalSurahs} Surah</p>
                                    <p>📑 {exploreOverview.totalJuz} Juz</p>
                                    <p>📄 {exploreOverview.totalPages} Halaman</p>
                                    <p>⭐ {exploreOverview.totalAsmaulHusna} Asmaul Husna</p>
                                </div>
                            </Card>

                            {/* Jadwal Shalat Widget */}
                            <PrayerTimesWidget />

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default QuranHomePage;
