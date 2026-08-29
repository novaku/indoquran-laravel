import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import SEOHead from '../components/SEOHead';
import QuranPaginationNav from '../components/QuranPaginationNav';
import QuranSurahJumpBar from '../components/QuranSurahJumpBar';
import QuranFloatingActions from '../components/QuranFloatingActions';
import QuranBottomNav from '../components/QuranBottomNav';
import { 
    IoBookOutline, 
    IoAddOutline, 
    IoRemoveOutline, 
    IoReloadOutline, 
    IoPlayCircleOutline, 
    IoPauseCircleOutline,
    IoChevronForwardOutline,
    IoCompassOutline
} from 'react-icons/io5';

// Mapping of starting surah for each Juz (1-30)
const JUZ_STARTING_SURAHS = {
    1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Al-Baqarah', 4: 'Ali \'Imran',
    5: 'An-Nisa\'', 6: 'An-Nisa\'', 7: 'Al-Ma\'idah', 8: 'Al-An\'am',
    9: 'Al-A\'raf', 10: 'Al-Anfal', 11: 'Yunus', 12: 'Hud',
    13: 'Yusuf', 14: 'Al-Hijr', 15: 'Al-Isra\'', 16: 'Al-Kahf',
    17: 'Al-Anbya\'', 18: 'Al-Mu\'minun', 19: 'Al-Furqan', 20: 'An-Naml',
    21: 'Al-\'Ankabut', 22: 'Al-Ahzab', 23: 'Ya-Sin', 24: 'Az-Zumar',
    25: 'Fussilat', 26: 'Al-Ahqaf', 27: 'Adh-Dhariyat', 28: 'Al-Mujadilah',
    29: 'Al-Mulk', 30: 'An-Naba\''
};

function JuzPage() {
    const { number } = useParams();
    const navigate = useNavigate();
    const currentJuz = parseInt(number, 10) || 1;

    const [juzData, setJuzData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [arabicFontSize, setArabicFontSize] = useState(2.5); // Default size in rem
    
    // Active Surah in viewport
    const [activeSurahNumber, setActiveSurahNumber] = useState(null);
    const [showFloatingNav, setShowFloatingNav] = useState(false);
    
    // Audio state
    const [selectedQari, setSelectedQari] = useState('15'); // Default to Alafasy 128kbps
    const [availableReciters, setAvailableReciters] = useState([]);
    const [recitersLoading, setRecitersLoading] = useState(true);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [playingAyahId, setPlayingAyahId] = useState(null);

    // Play All state
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [playAllCurrentIndex, setPlayAllCurrentIndex] = useState(0);
    const playAllQueueRef = useRef([]);
    const playAllIndexRef = useRef(0);
    const isPlayingAllRef = useRef(false);

    const audioRef = useRef(null);
    const ayahRefs = useRef({});
    const surahNavRef = useRef(null);

    // Auto-scroll to playing ayah
    useEffect(() => {
        if (playingAyahId && ayahRefs.current[playingAyahId]) {
            ayahRefs.current[playingAyahId].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [playingAyahId]);

    // Handle scroll for floating nav & active surah tracking
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowFloatingNav(true);
            } else {
                setShowFloatingNav(false);
            }

            // Detect active surah
            if (juzData && juzData.surahs && juzData.surahs.length > 0) {
                const surahElements = juzData.surahs.map(s => ({
                    number: s.surah.number,
                    element: document.getElementById(`surah-${s.surah.number}`)
                })).filter(item => item.element !== null);

                const scrollPosition = window.scrollY + 200;
                for (let i = surahElements.length - 1; i >= 0; i--) {
                    const item = surahElements[i];
                    if (item.element.offsetTop <= scrollPosition) {
                        setActiveSurahNumber(item.number);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [juzData]);

    useEffect(() => {
        if (number) {
            // Stop audio when switching juz
            stopAudio();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadJuzData(number);
        }
    }, [number]);

    const loadJuzData = async (juzNumber) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchWithAuth(`/api/juz/${juzNumber}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setJuzData(data.data);
                if (data.data.surahs && data.data.surahs.length > 0) {
                    setActiveSurahNumber(data.data.surahs[0].surah.number);
                }
            } else {
                setError(data.message || 'Gagal memuat data Juz');
            }
        } catch (err) {
            console.error('Error loading Juz data:', err);
            setError('Gagal memuat data Juz. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const scrollToSurah = (surahNum) => {
        const el = document.getElementById(`surah-${surahNum}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSurahNumber(surahNum);
        }
    };

    const scrollToSurahNav = () => {
        if (surahNavRef.current) {
            surahNavRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleZoomIn = useCallback(() => {
        setArabicFontSize(prev => Math.min(prev + 0.25, 6));
    }, []);

    const handleZoomOut = useCallback(() => {
        setArabicFontSize(prev => Math.max(prev - 0.25, 1.5));
    }, []);

    const resetZoom = useCallback(() => {
        setArabicFontSize(2.5);
    }, []);
    
    // Load available reciters from API
    useEffect(() => {
        const loadReciters = async () => {
            try {
                const response = await fetchWithAuth('/api/reciters/recommended');
                const data = await response.json();
                
                if (data.status === 'success') {
                    setAvailableReciters(data.data || []);
                } else {
                    console.warn('Failed to load reciters, using defaults');
                    setAvailableReciters([
                        { id: '15', name: 'Alafasy', bitrate: '128kbps', subfolder: 'Alafasy_128kbps' },
                        { id: '2', name: 'Abdul Basit Murattal', bitrate: '192kbps', subfolder: 'Abdul_Basit_Murattal_192kbps' },
                        { id: '8', name: 'Abdurrahmaan As-Sudais', bitrate: '192kbps', subfolder: 'Abdurrahmaan_As-Sudais_192kbps' }
                    ]);
                }
            } catch (error) {
                console.error('Error loading reciters:', error);
                setAvailableReciters([
                    { id: '15', name: 'Alafasy', bitrate: '128kbps', subfolder: 'Alafasy_128kbps' },
                    { id: '2', name: 'Abdul Basit Murattal', bitrate: '192kbps', subfolder: 'Abdul_Basit_Murattal_192kbps' },
                    { id: '8', name: 'Abdurrahmaan As-Sudais', bitrate: '192kbps', subfolder: 'Abdurrahmaan_As-Sudais_192kbps' }
                ]);
            } finally {
                setRecitersLoading(false);
            }
        };
        
        loadReciters();
    }, []);
    
    // Cleanup audio when component unmounts
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                setIsAudioPlaying(false);
                setAudioElement(null);
            }
        };
    }, []);
    
    // Audio functions
    const playAudio = (audioUrl, ayahId, onEnded) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsAudioPlaying(false);
        setPlayingAyahId(null);
        setAudioElement(null);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.play()
            .then(() => {
                setIsAudioPlaying(true);
                setAudioElement(audio);
                setPlayingAyahId(ayahId);

                audio.onended = () => {
                    setIsAudioPlaying(false);
                    setAudioElement(null);
                    setPlayingAyahId(null);
                    if (onEnded) onEnded();
                };
            })
            .catch(err => {
                console.error('Audio playback error:', err);
                if (onEnded) onEnded();
            });
    };

    const stopAudio = () => {
        isPlayingAllRef.current = false;
        setIsPlayingAll(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsAudioPlaying(false);
        setAudioElement(null);
        setPlayingAyahId(null);
    };

    const playAllAyahs = () => {
        if (!juzData) return;
        const queue = [];
        juzData.surahs.forEach(surahData => {
            surahData.ayahs.forEach(ayah => {
                queue.push({ ayah, surahNumber: surahData.surah.number });
            });
        });
        playAllQueueRef.current = queue;
        playAllIndexRef.current = 0;
        isPlayingAllRef.current = true;
        setIsPlayingAll(true);
        setPlayAllCurrentIndex(0);
        playNextInQueue();
    };

    const playNextInQueue = () => {
        const queue = playAllQueueRef.current;
        const index = playAllIndexRef.current;

        if (!isPlayingAllRef.current || index >= queue.length) {
            isPlayingAllRef.current = false;
            setIsPlayingAll(false);
            setPlayAllCurrentIndex(0);
            return;
        }

        const { ayah, surahNumber } = queue[index];
        const ayahId = ayah.id || `${ayah.surah_number}-${ayah.ayah_number}`;
        const audioUrl = getEveryAyahAudioUrl(surahNumber, ayah.ayah_number, selectedQari);
        setPlayAllCurrentIndex(index);

        if (audioUrl) {
            playAudio(audioUrl, ayahId, () => {
                playAllIndexRef.current = index + 1;
                playNextInQueue();
            });
        } else {
            playAllIndexRef.current = index + 1;
            playNextInQueue();
        }
    };
    
    // Helper function to get audio URL from EveryAyah API
    const getEveryAyahAudioUrl = (surahNumber, ayahNumber, reciterId) => {
        const reciter = availableReciters.find(r => r.id === reciterId);
        
        if (!reciter) {
            console.warn('⚠️ Reciter not found, using default');
            // Default to Alafasy 128kbps
            const defaultReciter = availableReciters.find(r => r.id === '15') || availableReciters[0];
            if (!defaultReciter) return null;
            
            const surahStr = String(surahNumber).padStart(3, '0');
            const ayahStr = String(ayahNumber).padStart(3, '0');
            return `https://everyayah.com/data/${defaultReciter.subfolder}/${surahStr}${ayahStr}.mp3`;
        }
        
        const surahStr = String(surahNumber).padStart(3, '0');
        const ayahStr = String(ayahNumber).padStart(3, '0');
        return `https://everyayah.com/data/${reciter.subfolder}/${surahStr}${ayahStr}.mp3`;
    };
    
    const getAudioUrl = (ayah, surahNumber) => {
        return getEveryAyahAudioUrl(surahNumber, ayah.ayah_number, selectedQari);
    };

    if (loading) {
        return (
            <PageTransition isLoading={true}>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner size="lg" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
                            <div className="text-center">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                                <p className="text-red-600 mb-6">{error}</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button 
                                        onClick={() => loadJuzData(currentJuz)}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                                    >
                                        Coba Lagi
                                    </button>
                                    <Link 
                                        to="/juz"
                                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Daftar Semua Juz
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (!juzData) {
        return null;
    }

    const juzSEO = {
        title: `Juz ${juzData.juz_number} Arab Saja - Teks Arab Al-Quran | IndoQuran`,
        description: `Baca Juz ${juzData.juz_number} Arab saja dengan teks Arab lengkap. Total ${juzData.total_ayahs} ayat dari ${juzData.surahs.length} surah, plus audio murottal untuk membantu tilawah harian.`,
        keywords: `juz ${juzData.juz_number}, juz ${juzData.juz_number} arab saja, para ${juzData.juz_number}, al quran juz ${juzData.juz_number}, quran digital, teks arab, al quran indonesia`,
        canonicalUrl: `https://indoquran.web.id/juz/${juzData.juz_number}`,
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Juz ${juzData.juz_number} Arab Saja`,
            url: `https://indoquran.web.id/juz/${juzData.juz_number}`,
            inLanguage: 'id',
            description: `Juz ${juzData.juz_number} Al-Quran dengan teks Arab lengkap dan audio murottal.`
        }
    };

    return (
        <PageTransition>
            <SEOHead {...juzSEO} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">

                    {/* Top Pagination Navigation Component */}
                    <QuranPaginationNav
                        unitLabel="Juz"
                        currentIndex={currentJuz}
                        totalCount={30}
                        indexUrl="/juz"
                        indexTitle="Daftar Semua 30 Juz"
                        onNavigate={(targetJuz) => navigate(`/juz/${targetJuz}`)}
                        itemLabelFormatter={(idx) => `Juz ${idx} (${JUZ_STARTING_SURAHS[idx] || `Juz ${idx}`})`}
                    />

                    {/* Header + Controls + Play All */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-green-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md flex-shrink-0">
                                    <IoBookOutline className="text-2xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">
                                            Juz {juzData.juz_number}
                                        </h1>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold border border-green-200">
                                            {juzData.juz_number} / 30
                                        </span>
                                    </div>
                                    <p className="text-green-600 text-sm mt-0.5">
                                        Total {juzData.total_ayahs} ayat dalam {juzData.surahs.length} surah
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isPlayingAll ? (
                                    <button
                                        onClick={stopAudio}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium shadow-sm cursor-pointer"
                                    >
                                        <IoPauseCircleOutline className="w-5 h-5" />
                                        Berhenti Audio
                                    </button>
                                ) : (
                                    <button
                                        onClick={playAllAyahs}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-medium shadow-md hover:shadow-lg cursor-pointer"
                                    >
                                        <IoPlayCircleOutline className="w-5 h-5" />
                                        Putar Semua Ayat
                                    </button>
                                )}
                            </div>
                        </div>

                        {isPlayingAll && (
                            <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-green-50 rounded-xl border border-green-200">
                                <span className="text-xs font-medium text-green-700">Sedang diputar:</span>
                                <span className="text-xs font-semibold text-green-800">
                                    Ayat {playAllCurrentIndex + 1} / {playAllQueueRef.current.length}
                                </span>
                                <span className="flex gap-0.5 ml-2">
                                    <span className="w-1.5 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                        )}

                        {/* Arabic Text Zoom Controls & Qari Selector */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2">
                            {/* Qari Selector */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1.5">
                                    <span>🎙️</span> Pilih Qari:
                                </label>
                                {recitersLoading ? (
                                    <div className="text-xs text-gray-500">Memuat qari...</div>
                                ) : (
                                    <select 
                                        value={selectedQari}
                                        onChange={(e) => {
                                            setSelectedQari(e.target.value);
                                            if (audioElement) {
                                                audioElement.pause();
                                                setIsAudioPlaying(false);
                                                setAudioElement(null);
                                                setPlayingAyahId(null);
                                            }
                                        }}
                                        className="w-full sm:w-auto px-3.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800 shadow-sm"
                                    >
                                        {availableReciters.map(reciter => (
                                            <option key={reciter.id} value={reciter.id}>
                                                {reciter.name} ({reciter.bitrate})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2 self-start lg:self-auto">
                                <span className="text-xs sm:text-sm text-gray-600 mr-1">Ukuran Font:</span>
                                <button 
                                    onClick={handleZoomOut} 
                                    disabled={arabicFontSize <= 1.5}
                                    className="p-1.5 sm:p-2 rounded-lg bg-white border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                                    title="Perkecil teks Arab"
                                >
                                    <IoRemoveOutline className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={resetZoom}
                                    className="px-2.5 py-1.5 sm:py-2 rounded-lg bg-white border border-green-200 text-green-700 hover:bg-green-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
                                    title="Reset ukuran teks Arab"
                                >
                                    <IoReloadOutline className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={handleZoomIn} 
                                    disabled={arabicFontSize >= 6}
                                    className="p-1.5 sm:p-2 rounded-lg bg-white border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                                    title="Perbesar teks Arab"
                                >
                                    <IoAddOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Surah Navigation Bar Component */}
                    <QuranSurahJumpBar
                        navRef={surahNavRef}
                        title={`Navigasi Surah di Juz ${juzData.juz_number}`}
                        unitLabel="Juz"
                        unitNumber={currentJuz}
                        surahs={juzData.surahs}
                        activeSurahNumber={activeSurahNumber}
                        onSurahClick={scrollToSurah}
                    />

                    {/* Surahs and Ayahs */}
                    <div className="space-y-8">
                        {juzData.surahs.map((surahData) => {
                            const firstAyah = surahData.ayahs[0]?.ayah_number;
                            const lastAyah = surahData.ayahs[surahData.ayahs.length - 1]?.ayah_number;
                            const rangeText = firstAyah === lastAyah ? `Ayat ${firstAyah}` : `Ayat ${firstAyah} - ${lastAyah}`;

                            return (
                            <div 
                                key={surahData.surah.number} 
                                id={`surah-${surahData.surah.number}`}
                                className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden transition-all"
                            >
                                {/* Surah Header */}
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white text-sm">
                                                {surahData.surah.number}
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                                                    <span>{surahData.surah.name_latin}</span>
                                                    <span className="text-sm font-normal text-green-100 opacity-90 hidden sm:inline">
                                                        ({surahData.surah.name_indonesian})
                                                    </span>
                                                </h2>
                                                <p className="text-green-100 text-xs sm:text-sm mt-0.5">
                                                    {rangeText} &bull; {surahData.ayahs.length} ayat di Juz ini
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl sm:text-2xl font-arabic font-bold text-white">
                                                {surahData.surah.name_arabic}
                                            </div>
                                            <Link
                                                to={`/surah/${surahData.surah.number}`}
                                                className="text-xs text-green-100 hover:text-white underline inline-flex items-center gap-1 mt-1"
                                            >
                                                <span>Buka Full Surah</span>
                                                <IoChevronForwardOutline className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Ayahs List */}
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-6">
                                        {surahData.ayahs.map((ayah) => {
                                            const ayahId = ayah.id || `${ayah.surah_number}-${ayah.ayah_number}`;
                                            const isPlaying = isAudioPlaying && playingAyahId === ayahId;
                                            return (
                                            <div
                                                key={`${ayah.surah_number}-${ayah.ayah_number}`}
                                                ref={el => ayahRefs.current[ayahId] = el}
                                                className={`group rounded-2xl p-4 transition-all duration-300 border ${
                                                    isPlaying
                                                        ? 'bg-green-50/90 ring-2 ring-green-500 border-green-300 shadow-md'
                                                        : 'bg-white hover:bg-gray-50/80 border-gray-100'
                                                }`}
                                            >
                                                {/* Ayah Header Bar */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                                            isPlaying ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {ayah.ayah_number}
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-500">
                                                            QS. {surahData.surah.name_latin}: {ayah.ayah_number}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`/surah/${ayah.surah_number}/${ayah.ayah_number}`}
                                                        className="text-xs text-green-600 hover:text-green-800 font-semibold inline-flex items-center gap-1 hover:underline"
                                                    >
                                                        <span>Detail & Tafsir</span>
                                                        <IoChevronForwardOutline className="w-3 h-3" />
                                                    </Link>
                                                </div>

                                                {/* Arabic Text */}
                                                <div className="bg-green-50/70 rounded-2xl p-5 sm:p-6 text-center shadow-inner border border-green-100/50">
                                                    <p 
                                                        className="text-right leading-relaxed font-arabic text-gray-800"
                                                        style={{ 
                                                            fontSize: `${arabicFontSize}rem`,
                                                            lineHeight: arabicFontSize > 3 ? '1.8' : '1.6'
                                                        }}
                                                        dir="rtl"
                                                    >
                                                        {ayah.text_arabic}
                                                    </p>
                                                </div>
                                                
                                                {/* Audio Player Controls */}
                                                <div className="mt-3 flex items-center gap-3 bg-green-50/90 rounded-xl px-4 py-2.5 border border-green-100">
                                                    {isPlaying ? (
                                                        <button
                                                            onClick={stopAudio}
                                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
                                                            title="Jeda Audio"
                                                        >
                                                            <IoPauseCircleOutline className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const audioUrl = getAudioUrl(ayah, surahData.surah.number);
                                                                if (audioUrl) {
                                                                    playAudio(audioUrl, ayahId);
                                                                }
                                                            }}
                                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
                                                            title="Putar Audio"
                                                        >
                                                            <IoPlayCircleOutline className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {isPlaying ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-medium text-green-700">Sedang diputar...</span>
                                                                    <span className="flex gap-0.5">
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-600">
                                                                    Surah {surahData.surah.name_latin} : Ayat {ayah.ayah_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>

                    {/* Bottom Completion & Navigation Card Component */}
                    <QuranBottomNav
                        unitLabel="Juz"
                        currentIndex={currentJuz}
                        totalCount={30}
                        indexUrl="/juz"
                        indexLabel="Lihat Indeks Semua 30 Juz"
                        onNavigate={(targetJuz) => navigate(`/juz/${targetJuz}`)}
                        prevSubtitle={currentJuz > 1 ? `Dimulai ${JUZ_STARTING_SURAHS[currentJuz - 1] || `Juz ${currentJuz - 1}`}` : null}
                        nextSubtitle={currentJuz < 30 ? `Dimulai ${JUZ_STARTING_SURAHS[currentJuz + 1] || `Juz ${currentJuz + 1}`}` : null}
                        quickSelector={
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Pilih Juz (1 - 30):
                                    </h4>
                                    <Link
                                        to="/juz"
                                        className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1"
                                    >
                                        <span>Lihat Indeks Juz</span>
                                        <IoCompassOutline className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                                        const isCurrent = juzNum === currentJuz;
                                        return (
                                            <button
                                                key={juzNum}
                                                onClick={() => navigate(`/juz/${juzNum}`)}
                                                className={`h-9 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center border cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-green-600 text-white border-green-600 shadow-md scale-105'
                                                        : 'bg-white hover:bg-green-50 text-gray-700 border-gray-200 hover:border-green-300'
                                                }`}
                                                title={`Juz ${juzNum} (${JUZ_STARTING_SURAHS[juzNum] || `Juz ${juzNum}`})`}
                                            >
                                                {juzNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        }
                    />

                    {/* Floating Quick Action Buttons Component */}
                    <QuranFloatingActions
                        show={showFloatingNav}
                        onScrollToSurahNav={scrollToSurahNav}
                        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        showSurahNavButton={Boolean(juzData.surahs && juzData.surahs.length > 0)}
                    />

                </div>
            </div>
        </PageTransition>
    );
}

export default JuzPage;
