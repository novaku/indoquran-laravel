import { useState, useEffect, useCallback, useMemo } from 'react';
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
    ClockIcon,
    SparklesIcon,
    BookmarkIcon,
    ArrowRightIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    TagIcon,
    BuildingLibraryIcon,
    HeartIcon,
    FireIcon,
    EyeIcon,
    XMarkIcon,
    WifiIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import OnlineUsersWidget from '../components/OnlineUsersWidget';
import ArticleHoverCard from '../components/ArticleHoverCard';
import { Card, Button } from '../components/ui';
import AdSenseVertical from '../components/AdSenseVertical';
import { fetchWithAuth } from '../utils/apiUtils';
import { getReadingProgress } from '../services/ReadingProgressService';
import { getCachedSurahs, fetchSurahsWithFallback } from '../services/SurahDataService';
import authUtils from '../utils/auth';
import { scrollToTop } from '../utils/scrollUtils';
import { getRandomPopularSearches } from '../data/popularSearches';


// Curated daily inspiration verses for tadabbur
const DAILY_INSPIRATIONS = [
    {
        surahNumber: 2,
        ayahNumber: 152,
        surahName: 'Al-Baqarah',
        arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
        translation: 'Maka ingatlah kepada-Ku, niscaya Aku ingat (pula) kepadamu, dan bersyukurlah kepada-Ku, dan janganlah kamu mengingkari (nikmat-Ku).',
        theme: 'Mengingat Allah & Syukur'
    },
    {
        surahNumber: 13,
        ayahNumber: 28,
        surahName: "Ar-Ra'd",
        arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        translation: '(yaitu) orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram.',
        theme: 'Ketenangan Hati'
    },
    {
        surahNumber: 94,
        ayahNumber: 5,
        surahName: 'Asy-Syarh',
        arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Maka sesungguhnya bersama kesulitan ada kemudahan, sesungguhnya bersama kesulitan ada kemudahan.',
        theme: 'Harapan & Kemudahan'
    },
    {
        surahNumber: 14,
        ayahNumber: 7,
        surahName: 'Ibrahim',
        arabic: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِنْ كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
        translation: 'Dan (ingatlah juga), tatkala Tuhanmu memaklumkan; "Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu..."',
        theme: 'Keberkahan Syukur'
    },
    {
        surahNumber: 2,
        ayahNumber: 186,
        surahName: 'Al-Baqarah',
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        translation: 'Dan apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka sesungguhnya Aku adalah dekat. Aku mengabulkan permohonan orang yang berdoa apabila ia memohon kepada-Ku...',
        theme: 'Kedekatan Doa'
    },
    {
        surahNumber: 39,
        ayahNumber: 53,
        surahName: 'Az-Zumar',
        arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنْفُسِهِمْ لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
        translation: 'Katakanlah: "Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri! Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya..."',
        theme: 'Rahmat & Ampunan'
    },
    {
        surahNumber: 65,
        ayahNumber: 3,
        surahName: 'At-Talaq',
        arabic: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
        translation: 'Dan Dia memberinya rezeki dari arah yang tiada disangka-sangkanya. Dan barangsiapa yang bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya.',
        theme: 'Tawakkal & Rezeki'
    }
];

const POPULAR_SURAH_NUMBERS = [1, 2, 18, 36, 55, 56, 67];

function QuranHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Instant-load surahs from cache or static fallback data for zero-latency first render
    const initialSurahState = useMemo(() => getCachedSurahs(), []);
    const [surahs, setSurahs] = useState(initialSurahState.data || []);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackType, setFallbackType] = useState(null);
    const [isFallbackDismissed, setIsFallbackDismissed] = useState(false);
    const [isRetryingSurahs, setIsRetryingSurahs] = useState(false);
    const [popularChips] = useState(() => getRandomPopularSearches(10));
    const [loading, setLoading] = useState(() => !initialSurahState.data || initialSurahState.data.length === 0);
    const [error, setError] = useState(null);
    const [recentReading, setRecentReading] = useState(null);
    const [popularSurahs, setPopularSurahs] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [surahTab, setSurahTab] = useState('rekomendasi'); // 'rekomendasi' | 'populer' | 'juz30'
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [articleTab, setArticleTab] = useState('terbaru'); // 'terbaru' | 'populer' | 'rekomendasi'
    const [articleSearch, setArticleSearch] = useState('');
    const [randomTafsir, setRandomTafsir] = useState(null);
    const [loadingTafsir, setLoadingTafsir] = useState(false);
    const [popularTopics, setPopularTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [copiedAyah, setCopiedAyah] = useState(false);
    const [dailyInspirationIndex, setDailyInspirationIndex] = useState(0);

    // Pick inspiration based on day of year
    useEffect(() => {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        setDailyInspirationIndex(dayOfYear % DAILY_INSPIRATIONS.length);
    }, []);

    const activeInspiration = DAILY_INSPIRATIONS[dailyInspirationIndex] || DAILY_INSPIRATIONS[0];

    const navigationItems = [
        {
            to: '/surah',
            title: 'Daftar Surah',
            subtitle: '114 Surah, teks Arab & murottal',
            badgeText: '114 Surah',
            icon: BookOpenIcon,
            iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
            hoverBorder: 'hover:border-emerald-300',
            hoverBg: 'hover:from-white hover:to-emerald-50/40'
        },
        {
            to: '/juz',
            title: 'Telusuri Juz',
            subtitle: 'Navigasi 30 Juz & target khatam',
            badgeText: '30 Juz',
            icon: DocumentTextIcon,
            iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
            badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
            hoverBorder: 'hover:border-blue-300',
            hoverBg: 'hover:from-white hover:to-blue-50/40'
        },
        {
            to: '/halaman',
            title: 'Halaman Mushaf',
            subtitle: 'Mushaf Madinah 604 halaman',
            badgeText: '604 Hal',
            icon: BuildingLibraryIcon,
            iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
            badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200/60',
            hoverBorder: 'hover:border-purple-300',
            hoverBg: 'hover:from-white hover:to-purple-50/40'
        },
        {
            to: '/asmaul-husna',
            title: 'Asmaul Husna',
            subtitle: '99 nama agung Allah & maknanya',
            badgeText: '99 Nama',
            icon: StarIcon,
            iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
            badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
            hoverBorder: 'hover:border-amber-300',
            hoverBg: 'hover:from-white hover:to-amber-50/40'
        },
        {
            to: '/tafsir-maudhui',
            title: 'Tafsir Tematik',
            subtitle: 'Kajian ayat per topik kehidupan',
            badgeText: 'Tematik',
            icon: AcademicCapIcon,
            iconBg: 'bg-orange-50 text-orange-600 border border-orange-100',
            badgeBg: 'bg-orange-50 text-orange-700 border border-orange-200/60',
            hoverBorder: 'hover:border-orange-300',
            hoverBg: 'hover:from-white hover:to-orange-50/40'
        },
        {
            to: '/doa-bersama',
            title: 'Doa & Dzikir',
            subtitle: 'Kumpulan doa Quran & Hadits',
            badgeText: 'Doa Harian',
            icon: UserGroupIcon,
            iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
            badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
            hoverBorder: 'hover:border-rose-300',
            hoverBg: 'hover:from-white hover:to-rose-50/40'
        },
        {
            to: '/cari',
            title: 'Pencarian Cerdas',
            subtitle: 'Cari lafadz Arab, latin & arti',
            badgeText: 'Cari Cepat',
            icon: MagnifyingGlassIcon,
            iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
            badgeBg: 'bg-teal-50 text-teal-700 border border-teal-200/60',
            hoverBorder: 'hover:border-teal-300',
            hoverBg: 'hover:from-white hover:to-teal-50/40'
        },
        {
            to: '/penanda',
            title: 'Penanda & Progres',
            subtitle: 'Bookmark & riwayat tilawah',
            badgeText: 'Bookmark',
            icon: BookmarkIcon,
            iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
            badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
            hoverBorder: 'hover:border-indigo-300',
            hoverBg: 'hover:from-white hover:to-indigo-50/40'
        },
        {
            to: '/artikel',
            title: 'Artikel & Edukasi',
            subtitle: 'Tadabbur, tajwid & wawasan',
            badgeText: 'Khazanah',
            icon: NewspaperIcon,
            iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
            badgeBg: 'bg-sky-50 text-sky-700 border border-sky-200/60',
            hoverBorder: 'hover:border-sky-300',
            hoverBg: 'hover:from-white hover:to-sky-50/40'
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
            if (result.status === 'success' && Array.isArray(result.data)) {
                setPopularSurahs(result.data);
            } else {
                throw new Error('Failed to load popular surahs');
            }
        } catch (err) {
            console.error('Error fetching popular surahs:', err);
            const fallback = POPULAR_SURAH_NUMBERS
                .slice(0, 6)
                .map((number) => surahs.find((surah) => surah.number === number))
                .filter(Boolean);
            setPopularSurahs(fallback);
        } finally {
            setLoadingPopular(false);
        }
    }, [surahs]);

    const fetchArticles = useCallback(async (tab = 'terbaru', search = '') => {
        setLoadingArticles(true);
        try {
            const params = new URLSearchParams();
            params.append('per_page', '10');

            if (search && search.trim()) {
                params.append('search', search.trim());
            }

            if (tab === 'populer') {
                params.append('sort', 'popular');
            } else if (tab === 'rekomendasi') {
                params.append('sort', 'random');
                params.append('_t', Date.now().toString());
            } else {
                params.append('sort', 'latest');
            }

            const response = await fetchWithAuth(`/api/articles?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }

            const result = await response.json();
            if (result.data && Array.isArray(result.data)) {
                setArticles(result.data);
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoadingArticles(false);
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
        } finally {
            setLoadingTafsir(false);
        }
    }, []);

    const fetchPopularTopics = useCallback(async () => {
        setLoadingTopics(true);
        try {
            const response = await fetchWithAuth('/api/tafsir-maudhui/popular', {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch popular tafsir topics');
            }

            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                setPopularTopics(result.data);
            }
        } catch (err) {
            console.error('Error fetching popular tafsir topics:', err);
        } finally {
            setLoadingTopics(false);
        }
    }, []);

    const loadSurahs = useCallback(async (isManualRetry = false) => {
        if (isManualRetry) {
            setIsRetryingSurahs(true);
        }
        try {
            const res = await fetchSurahsWithFallback();
            if (res.data && res.data.length > 0) {
                setSurahs(res.data);
            }
            if (res.isFallback) {
                setIsFallback(true);
                setFallbackType(res.fallbackType);
                setError(res.error);
            } else {
                setIsFallback(false);
                setFallbackType(null);
                setError(null);
            }
        } catch (err) {
            console.error('Unexpected error loading surahs:', err);
            const cached = getCachedSurahs();
            setSurahs(cached.data);
            setIsFallback(true);
            setFallbackType(cached.from);
            setError(err.message || 'Gagal memuat surah');
        } finally {
            setLoading(false);
            if (isManualRetry) {
                setIsRetryingSurahs(false);
            }
        }
    }, []);

    useEffect(() => {
        scrollToTop();
        loadSurahs(false);
    }, [loadSurahs]);

    // Ensure scroll position is reset once surahs data is ready
    useEffect(() => {
        if (surahs.length > 0) {
            scrollToTop();
            fetchPopularSurahs();
        }
    }, [surahs, fetchPopularSurahs]);


    useEffect(() => {
        fetchArticles('terbaru', '');
    }, [fetchArticles]);

    useEffect(() => {
        fetchRandomTafsir();
    }, [fetchRandomTafsir]);

    useEffect(() => {
        fetchPopularTopics();
    }, [fetchPopularTopics]);

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

    const handleCopyInspiration = () => {
        const textToCopy = `${activeInspiration.arabic}\n\n"${activeInspiration.translation}"\n(QS. ${activeInspiration.surahName}: ${activeInspiration.ayahNumber})\n\nDibaca melalui IndoQuran.web.id`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedAyah(true);
        setTimeout(() => setCopiedAyah(false), 2500);
    };

    const displayedSurahs = useMemo(() => {
        if (surahTab === 'populer') {
            return POPULAR_SURAH_NUMBERS
                .map((num) => surahs.find((s) => s.number === num))
                .filter(Boolean);
        }
        if (surahTab === 'juz30') {
            return surahs.filter((s) => s.number >= 78 && s.number <= 114).slice(0, 6);
        }
        return popularSurahs.length > 0
            ? popularSurahs
            : POPULAR_SURAH_NUMBERS.slice(0, 6).map((num) => surahs.find((s) => s.number === num)).filter(Boolean);
    }, [surahTab, popularSurahs, surahs]);

    if (loading && surahs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <SEOHead
                title="AlQuran Online Indonesia - Baca, Dengar, Terjemahan | IndoQuran"
                description="AlQuran online lengkap untuk Indonesia: baca teks Arab, dengarkan audio murottal, dan pelajari terjemahan per ayat di IndoQuran web."
                keywords="alquran online, al quran online, indo quran, quran web, al quran indonesia, baca quran online, murottal quran"
                canonicalUrl="https://indoquran.web.id/"
            />

            {/* HERO SECTION - Sleek, minimalist, eye-catching */}
            <section className="relative bg-gradient-to-b from-emerald-50/70 via-white to-gray-50/50 border-b border-gray-200/80 z-20">
                {/* Subtle decorative background circles constrained within overflow-hidden layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
                    <div className="flex flex-col items-center text-center space-y-6">
                        
                        {/* Status / Highlight Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-medium shadow-sm transition-transform hover:scale-[1.02]">
                            <SparklesIcon className="w-4 h-4 text-emerald-600" />
                            <span>Al-Quran Digital Indonesia & Terjemahan Lengkap</span>
                        </div>

                        {/* Title & Tagline with IndoQuran Logo */}
                        <div className="flex flex-col items-center max-w-3xl space-y-4">
                            <div className="relative group transition-transform duration-300 hover:scale-105">
                                <picture>
                                    <source srcSet="/images/logo.webp" type="image/webp" />
                                    <img
                                        src="/images/logo.png"
                                        alt="IndoQuran - Al-Quran Online Indonesia"
                                        className="h-28 sm:h-36 md:h-44 w-auto object-contain drop-shadow-sm"
                                        width="190"
                                        height="210"
                                        loading="eager"
                                        decoding="async"
                                    />
                                </picture>
                            </div>
                            <h1 className="sr-only">IndoQuran - Al-Quran Online Indonesia</h1>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-normal leading-relaxed max-w-2xl">
                                Membaca, mendengar murottal, dan mentadabburi ayat-ayat suci Al-Quran dengan tampilan yang tenang, bersih, dan informatif.
                            </p>
                        </div>

                        {/* Online Users Widget */}
                        <div className="flex justify-center pt-1">
                            <OnlineUsersWidget />
                        </div>

                        {/* Primary Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleStartReading}
                                leftIcon={<BookOpenIcon className="w-5 h-5" />}
                                className="shadow-md shadow-emerald-700/10 hover:shadow-lg transition-all"
                            >
                                Mulai Membaca
                            </Button>
                            <Link to="/juz">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    leftIcon={<DocumentTextIcon className="w-5 h-5 text-gray-600" />}
                                    className="bg-white/80 hover:bg-gray-50 border-gray-300"
                                >
                                    Telusuri Juz
                                </Button>
                            </Link>
                            <Link to="/cari">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    leftIcon={<MagnifyingGlassIcon className="w-5 h-5 text-emerald-600" />}
                                    className="hover:bg-emerald-50 text-emerald-700 font-medium"
                                >
                                    Pencarian Ayat
                                </Button>
                            </Link>
                        </div>

                        {/* Search Field with Quick Chips */}
                        <div className="relative z-30 max-w-2xl w-full pt-4">
                            <SearchField
                                placeholder="Cari nomor surah, nama ayat, atau terjemahan..."
                                className="w-full"
                                surahs={surahs}
                                showExactSearchToggle={true}
                            />
                            
                            {/* Quick Search / Jump Chips */}
                            <div className="mt-3 flex items-center justify-center flex-wrap gap-1.5 text-xs text-gray-500">
                                <span className="font-medium mr-1 text-gray-600 flex items-center gap-1">
                                    <TagIcon className="w-3.5 h-3.5 text-emerald-600" /> Populer:
                                </span>
                                {popularChips.map((chip) => (
                                    <button
                                        key={chip.id || chip.label}
                                        type="button"
                                        onClick={() => navigate(chip.path)}
                                        title={chip.description || chip.label}
                                        className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors shadow-2xs font-medium cursor-pointer"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* GRACEFUL FALLBACK NOTIFICATION BANNER */}
            {isFallback && !isFallbackDismissed && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 sm:px-5 rounded-2xl bg-amber-50/95 border border-amber-200/90 text-amber-950 shadow-xs backdrop-blur-xs transition-all">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                                <WifiIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                                        {fallbackType === 'cache' ? 'Mode Cache' : 'Mode Offline'}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                                        {fallbackType === 'cache'
                                            ? 'Menampilkan data tersimpan dari kunjungan sebelumnya'
                                            : 'Koneksi ke server terputus (Menampilkan data lokal Al-Quran)'}
                                    </h4>
                                </div>
                                <p className="text-xs text-amber-800/90">
                                    Pembaruan data dari server belum berhasil. Anda tetap dapat membaca, mencari, dan membuka seluruh 114 surah dengan normal.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadSurahs(true)}
                                disabled={isRetryingSurahs}
                                leftIcon={<ArrowPathIcon className={`w-3.5 h-3.5 ${isRetryingSurahs ? 'animate-spin' : ''}`} />}
                                className="bg-white/90 hover:bg-white border-amber-300 text-amber-900 text-xs font-semibold shadow-2xs"
                            >
                                {isRetryingSurahs ? 'Menghubungkan...' : 'Coba Lagi'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setIsFallbackDismissed(true)}
                                className="p-1.5 rounded-lg text-amber-700 hover:text-amber-950 hover:bg-amber-100/70 transition-colors cursor-pointer"
                                title="Tutup pemberitahuan ini"
                                aria-label="Tutup pemberitahuan"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA WITH SIDEBAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content Column (8 cols) */}
                    <main className="lg:col-span-8 space-y-8">

                        {/* Ayat Hari Ini & Mutiara Tadabbur (Daily Inspiration) */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-7 shadow-md">
                            {/* Decorative background aura */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold tracking-wide">
                                            <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                                            Ayat Pilihan Hari Ini
                                        </span>
                                        <span className="text-xs text-emerald-200/90 font-medium">
                                            • {activeInspiration.theme}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCopyInspiration}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600/80 text-xs text-emerald-100 transition-colors border border-emerald-500/30 cursor-pointer"
                                            title="Salin ayat & terjemahan"
                                        >
                                            {copiedAyah ? (
                                                <>
                                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-300" />
                                                    <span>Tersalin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                                                    <span>Salin</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setDailyInspirationIndex((prev) => (prev + 1) % DAILY_INSPIRATIONS.length)}
                                            className="p-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 transition-colors border border-emerald-500/30 cursor-pointer"
                                            title="Ganti ayat lain"
                                        >
                                            <ArrowPathIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="py-2 text-right">
                                    <p className="font-arabic text-2xl sm:text-3xl text-emerald-50 leading-loose">
                                        {activeInspiration.arabic}
                                    </p>
                                </div>

                                <div className="border-t border-emerald-700/60 pt-3">
                                    <p className="text-emerald-100 text-sm sm:text-base leading-relaxed italic">
                                        "{activeInspiration.translation}"
                                    </p>
                                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                                        <span className="text-xs font-semibold text-emerald-300">
                                            QS. {activeInspiration.surahName}: Ayat {activeInspiration.ayahNumber}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/surah/${activeInspiration.surahNumber}/${activeInspiration.ayahNumber}`)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
                                        >
                                            <span>Buka Surah</span>
                                            <ArrowRightIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lanjutkan Membaca (Only shown if user is logged in or has active reading session) */}
                        {user && recentReading?.surah && (
                            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                            <BookmarkIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">Lanjutkan Membaca</h2>
                                            <p className="text-xs text-gray-500">Mulai dari ayat terakhir yang Anda baca</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/profil"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                                    >
                                        Riwayat Lengkap →
                                    </Link>
                                </div>

                                <div className="bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 rounded-xl p-4 sm:p-5 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-gray-900">
                                                {recentReading.surah.name_latin || recentReading.surah.name_english}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                                                Ayat {recentReading.lastVerse}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {recentReading.surah.revelation_place} • {(recentReading.surah.total_ayahs ?? recentReading.surah.verses_count) || '-'} Total Ayat
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={handleStartReading}
                                        leftIcon={<PlayIcon className="w-4 h-4" />}
                                        size="sm"
                                        className="self-start sm:self-center shadow-xs"
                                    >
                                        Buka Bacaan
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Fitur & Navigasi Utama (Feature Hub) */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">Jelajahi Al-Quran & Fitur</h2>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                            9 Modul
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        Pintasan cepat modul bacaan, kajian tafsir, pencarian, dan panduan ibadah.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`group p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/90 bg-white hover:bg-gradient-to-br ${item.hoverBg || 'hover:from-white hover:to-emerald-50/30'} ${item.hoverBorder || 'hover:border-emerald-300'} transition-all duration-200 hover:shadow-xs flex flex-row sm:flex-col sm:justify-between items-center sm:items-stretch gap-3 sm:gap-3`}
                                        >
                                            {/* Top row for desktop, left column for mobile */}
                                            <div className="flex sm:items-center sm:justify-between flex-shrink-0">
                                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${item.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-2xs`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${item.badgeBg} transition-colors`}>
                                                    {item.badgeText}
                                                </span>
                                            </div>

                                            {/* Title & subtitle */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors truncate sm:whitespace-normal">
                                                        {item.title}
                                                    </h3>
                                                    <ChevronRightIcon className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate sm:line-clamp-1">
                                                    {item.subtitle}
                                                </p>
                                            </div>

                                            {/* Mobile right badge & chevron */}
                                            <div className="flex sm:hidden items-center gap-2 flex-shrink-0">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                                                    {item.badgeText}
                                                </span>
                                                <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Surah Rekomendasi & Populer */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Pilihan Surah</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Surah pilihan utama yang sering dibaca dan dipelajari</p>
                                </div>

                                <div className="flex items-center flex-wrap gap-2">
                                    {/* Tabs */}
                                    <div className="inline-flex rounded-lg bg-gray-100 p-1 text-xs">
                                        <button
                                            onClick={() => setSurahTab('rekomendasi')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                                surahTab === 'rekomendasi'
                                                    ? 'bg-white text-emerald-700 shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Rekomendasi
                                        </button>
                                        <button
                                            onClick={() => setSurahTab('populer')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                                surahTab === 'populer'
                                                    ? 'bg-white text-emerald-700 shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Populer
                                        </button>
                                        <button
                                            onClick={() => setSurahTab('juz30')}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                                                surahTab === 'juz30'
                                                    ? 'bg-white text-emerald-700 shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Juz 30
                                        </button>
                                    </div>

                                    {surahTab === 'rekomendasi' && (
                                        <button
                                            onClick={fetchPopularSurahs}
                                            disabled={loadingPopular}
                                            className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="Segarkan rekomendasi"
                                        >
                                            <ArrowPathIcon className={`w-4 h-4 ${loadingPopular ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}

                                    <Link
                                        to="/surah"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 ml-1"
                                    >
                                        <span>Semua Surah</span>
                                        <ChevronRightIcon className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Surah List Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {loadingPopular ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 animate-pulse">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                                    <div className="space-y-2">
                                                        <div className="h-4 bg-gray-200 rounded w-28" />
                                                        <div className="h-3 bg-gray-200 rounded w-20" />
                                                    </div>
                                                </div>
                                                <div className="h-6 bg-gray-200 rounded w-16" />
                                            </div>
                                        </div>
                                    ))
                                ) : displayedSurahs.length > 0 ? (
                                    displayedSurahs.map((surah) => {
                                        const totalAyahs = surah.total_ayahs ?? surah.verses_count;
                                        return (
                                            <Link
                                                key={surah.number}
                                                to={`/surah/${surah.number}`}
                                                className="group p-4 rounded-xl border border-gray-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 hover:shadow-xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                            {surah.number}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">
                                                                    {surah.name_latin || surah.name_simple}
                                                                </h3>
                                                                {POPULAR_SURAH_NUMBERS.includes(surah.number) && (
                                                                    <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {surah.name_translated || surah.meaning || surah.revelation_place} • {totalAyahs} Ayat
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-arabic text-lg text-gray-800 group-hover:text-emerald-800 transition-colors">
                                                            {surah.name_arabic}
                                                        </p>
                                                        <span className="text-[10px] font-medium text-gray-400 capitalize">
                                                            {surah.revelation_place?.toLowerCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : surahs.length === 0 ? (
                                    <div className="col-span-1 md:col-span-2 text-center p-6 sm:p-8 rounded-xl border border-dashed border-amber-200 bg-amber-50/50">
                                        <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-gray-800 mb-1">Daftar surah belum dapat dimuat</p>
                                        <p className="text-xs text-gray-500 mb-4">Periksa koneksi internet Anda atau coba muat ulang.</p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => loadSurahs(true)}
                                            disabled={isRetryingSurahs}
                                            leftIcon={<ArrowPathIcon className={`w-3.5 h-3.5 ${isRetryingSurahs ? 'animate-spin' : ''}`} />}
                                        >
                                            {isRetryingSurahs ? 'Memuat...' : 'Coba Lagi'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="col-span-1 md:col-span-2 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-6">
                                        Rekomendasi surah belum tersedia saat ini.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tafsir Tematik Highlight - Informative & Engaging Feature Showcase */}
                        {randomTafsir && (
                            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-5">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                                    <div className="flex items-start sm:items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/70 flex items-center justify-center text-orange-600 shadow-2xs flex-shrink-0">
                                            <AcademicCapIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-xl font-bold text-gray-900">Tafsir Tematik (Maudhu'i)</h2>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200/60">
                                                    Kajian Per Topik
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                                Himpunan ayat-ayat Al-Quran dari berbagai surah yang membahas tema tertentu secara komprehensif
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                                        <button
                                            onClick={fetchRandomTafsir}
                                            disabled={loadingTafsir}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-700 rounded-lg hover:bg-orange-50/80 border border-gray-200 transition-colors cursor-pointer"
                                            title="Tampilkan topik acak lainnya"
                                        >
                                            <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingTafsir ? 'animate-spin text-orange-600' : ''}`} />
                                            <span>Acak Topik</span>
                                        </button>
                                        <Link
                                            to="/tafsir-maudhui"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline px-2 py-1.5"
                                        >
                                            <span>Semua Tema</span>
                                            <ChevronRightIcon className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Edukasi / Nilai Fitur (3 Key Pillars of Maudhu'i) */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-orange-50/40 rounded-xl p-3 border border-orange-100/80 text-xs">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span className="w-5 h-5 rounded-md bg-orange-100/80 text-orange-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">1</span>
                                        <span className="font-medium text-gray-800">Menghubungkan ayat lintas surah</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span className="w-5 h-5 rounded-md bg-orange-100/80 text-orange-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">2</span>
                                        <span className="font-medium text-gray-800">Pemahaman konsep secara menyeluruh</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span className="w-5 h-5 rounded-md bg-orange-100/80 text-orange-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">3</span>
                                        <span className="font-medium text-gray-800">Solusi praktis kehidupan sehari-hari</span>
                                    </div>
                                </div>

                                {/* Main Active Topic Showcase Card */}
                                {loadingTafsir ? (
                                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse space-y-3">
                                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 p-5 sm:p-6 shadow-2xs hover:border-orange-300 transition-all">
                                        {/* Subtle ambient decorative gradient */}
                                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />

                                        <div className="relative space-y-4">
                                            {/* Topic Heading & Badge */}
                                            <div className="flex items-start justify-between flex-wrap gap-2">
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2.5 py-0.5 rounded-full mb-2">
                                                        <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                                                        Topik Pilihan Hari Ini
                                                    </div>
                                                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                                                        {randomTafsir.topic}
                                                    </h3>
                                                </div>
                                                {randomTafsir.verses && randomTafsir.verses.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-orange-200 text-orange-700 shadow-2xs">
                                                        <BookOpenIcon className="w-3.5 h-3.5" />
                                                        {randomTafsir.verses.length} Ayat Terkait
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {randomTafsir.description && (
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {randomTafsir.description}
                                                </p>
                                            )}

                                            {/* Verses Preview List (Direct Verse Chips) */}
                                            {randomTafsir.verses && randomTafsir.verses.length > 0 && (
                                                <div className="pt-2 border-t border-orange-100/80 space-y-2">
                                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                                                        Contoh Rujukan Ayat dalam Tema Ini:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {randomTafsir.verses.slice(0, 5).map((verse, idx) => {
                                                            const surahObj = surahs.find((s) => s.number === verse.surah);
                                                            const surahName = surahObj ? (surahObj.name_latin || surahObj.name_simple) : `Surah ${verse.surah}`;
                                                            return (
                                                                <Link
                                                                    key={idx}
                                                                    to={`/surah/${verse.surah}/${verse.ayah}`}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-orange-200/80 text-xs text-gray-800 hover:border-orange-400 hover:text-orange-800 hover:bg-orange-50 transition-colors shadow-2xs font-medium"
                                                                    title={`Buka Surah ${surahName} Ayat ${verse.ayah}`}
                                                                >
                                                                    <span className="text-orange-600 font-semibold">QS. {surahName}</span>
                                                                    <span className="text-gray-500">: {verse.ayah}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                        {randomTafsir.verses.length > 5 && (
                                                            <Link
                                                                to={`/tafsir-maudhui/${randomTafsir.slug}`}
                                                                className="text-xs font-semibold text-orange-700 bg-orange-100/70 hover:bg-orange-200 px-2.5 py-1 rounded-lg transition-colors"
                                                            >
                                                                +{randomTafsir.verses.length - 5} ayat lainnya
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Footer */}
                                            <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                                                <Link
                                                    to={`/tafsir-maudhui/${randomTafsir.slug}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <span>Pelajari Kajian Tema "{randomTafsir.topic}"</span>
                                                    <ChevronRightIcon className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={fetchRandomTafsir}
                                                    disabled={loadingTafsir}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-orange-700 cursor-pointer"
                                                >
                                                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingTafsir ? 'animate-spin' : ''}`} />
                                                    <span>Ganti contoh tema lain</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Shortcuts to Other Popular Topics */}
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                            <TagIcon className="w-3.5 h-3.5 text-orange-600" />
                                            <span>Jelajahi Tema Populer Lainnya:</span>
                                        </span>
                                        <Link
                                            to="/tafsir-maudhui"
                                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                                        >
                                            Lihat Indeks A-Z →
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {loadingTopics ? (
                                            Array.from({ length: 6 }).map((_, i) => (
                                                <div key={i} className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
                                            ))
                                        ) : popularTopics.length > 0 ? (
                                            popularTopics.map((topic) => (
                                                <Link
                                                    key={topic.slug}
                                                    to={`/tafsir-maudhui/${topic.slug}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-300 text-xs font-medium text-gray-700 hover:text-orange-800 transition-all shadow-2xs"
                                                >
                                                    <span>{topic.icon || '📖'}</span>
                                                    <span>{topic.label || topic.topic}</span>
                                                    {topic.verses_count ? (
                                                        <span className="text-[10px] text-gray-400 font-normal">
                                                            ({topic.verses_count})
                                                        </span>
                                                    ) : null}
                                                </Link>
                                            ))
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Artikel & Wawasan Islami */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">Artikel & Wawasan Islami</h2>
                                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                            Kajian & Inspirasi
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                        Tulisan inspiratif, panduan ibadah, dan kajian seputar Al-Quran
                                    </p>
                                </div>
                                <Link
                                    to="/artikel"
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-center transition-colors group"
                                >
                                    <span>Lihat Semua Artikel</span>
                                    <ChevronRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>

                            {/* Control Bar: Filter Tabs & Quick Search */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
                                {/* Tab Switcher */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="inline-flex rounded-xl bg-gray-100/90 p-1 text-xs font-medium">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArticleTab('terbaru');
                                                fetchArticles('terbaru', articleSearch);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                                articleTab === 'terbaru'
                                                    ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Terbaru</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArticleTab('populer');
                                                fetchArticles('populer', articleSearch);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                                articleTab === 'populer'
                                                    ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <FireIcon className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Populer</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArticleTab('rekomendasi');
                                                fetchArticles('rekomendasi', articleSearch);
                                            }}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                                articleTab === 'rekomendasi'
                                                    ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Rekomendasi</span>
                                        </button>
                                    </div>

                                    {articleTab === 'rekomendasi' && (
                                        <button
                                            type="button"
                                            onClick={() => fetchArticles('rekomendasi', articleSearch)}
                                            disabled={loadingArticles}
                                            className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="Acak / Segarkan Rekomendasi"
                                        >
                                            <ArrowPathIcon className={`w-4 h-4 ${loadingArticles ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                </div>

                                {/* Quick Search Form */}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        fetchArticles(articleTab, articleSearch);
                                    }}
                                    className="relative w-full md:w-64"
                                >
                                    <input
                                        type="text"
                                        value={articleSearch}
                                        onChange={(e) => setArticleSearch(e.target.value)}
                                        placeholder="Cari judul / topik artikel..."
                                        className="w-full text-xs bg-gray-50/90 border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    {articleSearch ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArticleSearch('');
                                                fetchArticles(articleTab, '');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                                            title="Hapus pencarian"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    ) : null}
                                </form>
                            </div>

                            {/* Search status banner */}
                            {articleSearch.trim() && (
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-4 bg-emerald-50/60 px-3 py-2 rounded-lg border border-emerald-100">
                                    <span>
                                        Hasil pencarian untuk: <strong className="text-emerald-800">"{articleSearch}"</strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setArticleSearch('');
                                            fetchArticles(articleTab, '');
                                        }}
                                        className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                                    >
                                        Hapus Filter
                                    </button>
                                </div>
                            )}

                            {/* Article Cards */}
                            {loadingArticles ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="flex gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 animate-pulse">
                                            <div className="w-24 sm:w-28 h-24 sm:h-28 bg-gray-200 rounded-xl flex-shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-4/5" />
                                                <div className="h-3 bg-gray-200 rounded w-full" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : articles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {articles.map((article, idx) => (
                                        <ArticleHoverCard
                                            key={article.id}
                                            article={article}
                                            index={idx}
                                            articleTab={articleTab}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <NewspaperIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                                        {articleSearch ? `Tidak ditemukan artikel untuk "${articleSearch}"` : 'Belum ada artikel pada kategori ini.'}
                                    </p>
                                    {articleSearch ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setArticleSearch('');
                                                fetchArticles(articleTab, '');
                                            }}
                                            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                                        >
                                            <span>Tampilkan Semua Artikel</span>
                                        </button>
                                    ) : null}
                                </div>
                            )}
                        </div>

                    </main>

                    {/* Sidebar Column (4 cols) */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="sticky top-20 space-y-6">
                            
                            {/* Jadwal Shalat Widget */}
                            <PrayerTimesWidget />

                            {/* Sticky Sidebar AdSense Unit (Detik.com Pattern) */}
                            <AdSenseVertical 
                                adSlot="9021708920"
                                labelText="IKLAN"
                                minHeight="280px"
                                isSticky={false}
                            />

                            {/* Informasi Cepat & Struktur Al-Quran */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs">
                                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                                    <BookOpenIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Struktur Al-Quran</span>
                                </h3>
                                <div className="divide-y divide-gray-100 text-xs">
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Total Surah
                                        </span>
                                        <span className="font-bold text-gray-900">114 Surah</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Total Ayat
                                        </span>
                                        <span className="font-bold text-gray-900">6.236 Ayat</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            Jumlah Juz
                                        </span>
                                        <span className="font-bold text-gray-900">30 Juz</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Halaman Standar
                                        </span>
                                        <span className="font-bold text-gray-900">604 Halaman</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            Pembagian Surah
                                        </span>
                                        <span className="font-medium text-gray-700">86 Makkiyah • 28 Madaniyah</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tips Membaca & Tadabbur */}
                            <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100 shadow-2xs">
                                <h3 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
                                    <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Adab Membaca Al-Quran</span>
                                </h3>
                                <ul className="space-y-1.5 text-xs text-emerald-800/90 leading-relaxed list-disc list-inside">
                                    <li>Berwudhu dan menghadap kiblat</li>
                                    <li>Membaca ta'awudz & basmalah</li>
                                    <li>Membaca dengan tartil dan tenang</li>
                                    <li>Mentadabburi makna ayat per ayat</li>
                                </ul>
                            </div>

                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

export default QuranHomePage;
