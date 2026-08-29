import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    IoPlayCircleOutline, 
    IoPauseCircleOutline, 
    IoChevronForwardOutline, 
    IoAddOutline, 
    IoRemoveOutline, 
    IoReloadOutline, 
    IoBookOutline,
    IoImageOutline,
    IoEyeOutline,
    IoEyeOffOutline
} from 'react-icons/io5';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import QuranPaginationNav from '../components/QuranPaginationNav';
import QuranSurahJumpBar from '../components/QuranSurahJumpBar';
import QuranFloatingActions from '../components/QuranFloatingActions';
import QuranBottomNav from '../components/QuranBottomNav';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';

function PageDetailPage() {
    const { user } = useAuth();
    const { number } = useParams();
    const navigate = useNavigate();
    const currentPageNum = parseInt(number, 10) || 1;
    const totalPages = 604;
    
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Active Surah in viewport & floating nav
    const [activeSurahNumber, setActiveSurahNumber] = useState(null);
    const [showFloatingNav, setShowFloatingNav] = useState(false);
    const [showMushafImage, setShowMushafImage] = useState(false);
    const [showTranslation, setShowTranslation] = useState(true);
    
    // Audio state
    const [selectedQari, setSelectedQari] = useState('15'); // Default to Alafasy 128kbps
    const [availableReciters, setAvailableReciters] = useState([]);
    const [recitersLoading, setRecitersLoading] = useState(true);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [playingAyahId, setPlayingAyahId] = useState(null);
    
    // Arabic text zoom state
    const [arabicFontSize, setArabicFontSize] = useState(2.5);

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
            if (pageData && pageData.surahs && pageData.surahs.length > 0) {
                const surahElements = pageData.surahs.map(s => ({
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
    }, [pageData]);
    
    // Fetch page data
    useEffect(() => {
        if (number) {
            stopAudio();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadPageData(number);
        }
    }, [number]);

    const loadPageData = async (pageNumber) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchWithAuth(`/api/halaman/${pageNumber}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setPageData(data.data);
                if (data.data.surahs && data.data.surahs.length > 0) {
                    setActiveSurahNumber(data.data.surahs[0].surah.number);
                }
            } else {
                setError(data.message || 'Gagal memuat data Halaman');
            }
        } catch (err) {
            console.error('Error loading page data:', err);
            setError('Gagal memuat data Halaman. Silakan coba lagi.');
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
    
    // Font size controls
    const handleZoomIn = useCallback(() => {
        setArabicFontSize(prev => Math.min(prev + 0.25, 6));
    }, []);

    const handleZoomOut = useCallback(() => {
        setArabicFontSize(prev => Math.max(prev - 0.25, 1.5));
    }, []);

    const resetZoom = useCallback(() => {
        setArabicFontSize(2.5);
    }, []);
    
    // Navigation handler
    const handlePageChange = (targetPage) => {
        const pageNum = parseInt(targetPage, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
            stopAudio();
            navigate(`/halaman/${pageNum}`);
        }
    };
    
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
        if (!pageData) return;
        const queue = [];
        pageData.surahs.forEach(surahData => {
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
        const audioUrl = getEveryAyahAudioUrl(surahNumber, ayah.ayah_number, selectedQari);
        setPlayAllCurrentIndex(index);
        if (audioUrl) {
            playAudio(audioUrl, ayah.id, () => {
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
                                        onClick={() => loadPageData(currentPageNum)}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        Coba Lagi
                                    </button>
                                    <Link 
                                        to="/halaman"
                                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Daftar Semua Halaman
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }
    
    if (!pageData) {
        return null;
    }

    // Determine Juz info for the page
    const distinctJuzs = Array.from(new Set(
        pageData.surahs.flatMap(s => s.ayahs.map(a => a.juz).filter(Boolean))
    ));
    const juzText = distinctJuzs.length > 0 ? (distinctJuzs.length === 1 ? `Juz ${distinctJuzs[0]}` : `Juz ${distinctJuzs.join(', ')}`) : null;
    const pagePrimarySurah = pageData.surahs[0]?.surah;

    const pageSEO = {
        title: `Al Quran Halaman ${currentPageNum} (${pagePrimarySurah ? pagePrimarySurah.name_latin : ''}) - Teks Arab & Audio | IndoQuran`,
        description: `Baca Al-Quran Halaman ${currentPageNum} lengkap dengan teks Arab, terjemahan Indonesia, dan audio murottal. Total ${pageData.total_ayahs} ayat dari ${pageData.surahs.length} surah (${juzText || ''}).`,
        keywords: `halaman ${currentPageNum}, al quran halaman ${currentPageNum}, mushaf halaman ${currentPageNum}, quran digital, al quran indonesia`,
        canonicalUrl: `https://indoquran.web.id/halaman/${currentPageNum}`,
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Al Quran Halaman ${currentPageNum}`,
            url: `https://indoquran.web.id/halaman/${currentPageNum}`,
            inLanguage: 'id',
            description: `Halaman ${currentPageNum} Al-Quran lengkap dengan teks Arab dan audio murottal.`
        }
    };
    
    return (
        <PageTransition>
            <SEOHead {...pageSEO} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">

                    {/* Top Pagination Navigation Component */}
                    <QuranPaginationNav
                        unitLabel="Halaman"
                        currentIndex={currentPageNum}
                        totalCount={totalPages}
                        indexUrl="/halaman"
                        indexTitle="Daftar Semua 604 Halaman"
                        onNavigate={handlePageChange}
                        itemLabelFormatter={(idx) => {
                            if (idx === currentPageNum && pagePrimarySurah) {
                                return `Halaman ${idx} (${pagePrimarySurah.name_latin})`;
                            }
                            return `Halaman ${idx}`;
                        }}
                    />

                    {/* Header + Controls + Play All */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-green-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-md flex-shrink-0">
                                    <IoBookOutline className="text-2xl" />
                                </div>
                                <div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-green-800">
                                            Halaman {currentPageNum}
                                        </h1>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold border border-green-200">
                                            {currentPageNum} / {totalPages}
                                        </span>
                                        {juzText && (
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                                                {juzText}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-green-600 text-sm mt-0.5">
                                        Total {pageData.total_ayahs} ayat dalam {pageData.surahs.length} surah
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
                            
                            {/* Zoom & View Controls */}
                            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                                <button
                                    onClick={() => setShowMushafImage(prev => !prev)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm cursor-pointer ${
                                        showMushafImage 
                                            ? 'bg-green-600 text-white border-green-600' 
                                            : 'bg-white border-green-200 text-green-700 hover:bg-green-50'
                                    }`}
                                    title="Tampilkan/Sembunyikan Gambar Mushaf"
                                >
                                    <IoImageOutline className="w-4 h-4" />
                                    <span>Mushaf Asli</span>
                                </button>

                                <button
                                    onClick={() => setShowTranslation(prev => !prev)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-sm cursor-pointer ${
                                        showTranslation 
                                            ? 'bg-green-50 border-green-300 text-green-800' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                    title="Tampilkan/Sembunyikan Terjemahan"
                                >
                                    {showTranslation ? <IoEyeOutline className="w-4 h-4" /> : <IoEyeOffOutline className="w-4 h-4" />}
                                    <span>Terjemahan</span>
                                </button>

                                <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block"></div>

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

                    {/* Mushaf Image Panel (Collapsible) */}
                    {showMushafImage && (
                        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-green-100 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-green-800 flex items-center gap-2">
                                    <IoImageOutline className="w-5 h-5" />
                                    <span>Gambar Mushaf Madinah — Halaman {currentPageNum}</span>
                                </h2>
                                <button
                                    onClick={() => setShowMushafImage(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    Tutup ✕
                                </button>
                            </div>
                            <div className="flex justify-center bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                                <img
                                    src={`https://cdn.myquran.com/img/page/${currentPageNum}.png`}
                                    alt={`Halaman ${currentPageNum} Al-Quran`}
                                    className="max-w-full rounded-xl shadow-md border border-amber-200/60 max-h-[800px] object-contain"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    )}

                    {/* Sticky Surah Navigation Bar Component */}
                    <QuranSurahJumpBar
                        navRef={surahNavRef}
                        title={`Navigasi Surah di Halaman ${currentPageNum}`}
                        unitLabel="Halaman"
                        unitNumber={currentPageNum}
                        surahs={pageData.surahs}
                        activeSurahNumber={activeSurahNumber}
                        onSurahClick={scrollToSurah}
                    />

                    {/* Page Content (Surahs & Ayahs) */}
                    <div className="space-y-8">
                        {pageData.surahs.map((surahData) => (
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
                                                    {surahData.ayahs.length} ayat di halaman ini
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
                                            const isPlaying = isAudioPlaying && playingAyahId === ayah.id;
                                            return (
                                                <div
                                                    key={`${ayah.surah_number}-${ayah.ayah_number}`}
                                                    ref={el => ayahRefs.current[ayah.id] = el}
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

                                                    {/* Translation / Indonesian Text */}
                                                    {showTranslation && ayah.text_indonesian && (
                                                        <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
                                                            <p>{ayah.text_indonesian}</p>
                                                        </div>
                                                    )}
                                                    
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
                                                                        playAudio(audioUrl, ayah.id);
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
                        ))}
                    </div>

                    {/* Bottom Completion & Navigation Card Component */}
                    <QuranBottomNav
                        unitLabel="Halaman"
                        currentIndex={currentPageNum}
                        totalCount={totalPages}
                        indexUrl="/halaman"
                        indexLabel="Lihat Indeks Semua Halaman"
                        onNavigate={handlePageChange}
                    />

                    {/* Floating Quick Action Buttons Component */}
                    <QuranFloatingActions
                        show={showFloatingNav}
                        onScrollToSurahNav={scrollToSurahNav}
                        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        showSurahNavButton={Boolean(pageData.surahs && pageData.surahs.length > 0)}
                    />

                </div>
            </div>
        </PageTransition>
    );
}

export default PageDetailPage;
