import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoBookOutline } from 'react-icons/io5';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';

function PageDetailPage() {
    const { user } = useAuth();
    const { number } = useParams();
    const navigate = useNavigate();
    
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(604);
    
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

    // Auto-scroll to playing ayah
    useEffect(() => {
        if (playingAyahId && ayahRefs.current[playingAyahId]) {
            ayahRefs.current[playingAyahId].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [playingAyahId]);
    
    // Fetch page data
    useEffect(() => {
        if (number) {
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
            } else {
                setError(data.message || 'Failed to load page data');
            }
        } catch (err) {
            console.error('Error loading page data:', err);
            setError('Failed to load page data. Please try again.');
        } finally {
            setLoading(false);
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
    
    // Navigation handlers
    const handlePrevPage = () => {
        const currentPageNum = parseInt(number);
        if (currentPageNum > 1) {
            navigate(`/pages/${currentPageNum - 1}`, { replace: true });
        }
    };
    
    const handleNextPage = () => {
        const currentPageNum = parseInt(number);
        if (currentPageNum < totalPages) {
            navigate(`/pages/${currentPageNum + 1}`, { replace: true });
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
        // Flatten all ayahs from all surahs in order
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
    
    const currentPageNum = parseInt(number);
    
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
                                <p className="text-red-600 mb-4">{error}</p>
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

    const pageSEO = {
        title: `Al Quran Halaman ${number} - Arab, Terjemahan, Audio | IndoQuran`,
        description: `Baca Al-Quran halaman ${number} lengkap dengan teks Arab, terjemahan Indonesia, dan audio murottal. Tersedia ${pageData.total_ayahs} ayat untuk tilawah dan murajaah.`,
        keywords: `halaman ${number}, al quran halaman ${number}, alquran halaman ${number}, quran halaman ${number}, terjemahan halaman ${number}, quran digital, al quran indonesia`,
        canonicalUrl: `https://indoquran.web.id/halaman/${number}`,
        structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Al Quran Halaman ${number}`,
            url: `https://indoquran.web.id/halaman/${number}`,
            inLanguage: 'id',
            description: `Halaman ${number} Al-Quran lengkap dengan teks Arab, terjemahan, dan audio murottal.`
        }
    };
    
    return (
        <PageTransition>
            <SEOHead {...pageSEO} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                    {/* Header + Controls + Play All — single panel */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                        {/* Title row */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl">
                                    <IoBookOutline className="text-2xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-green-800">
                                        Halaman {number}
                                    </h1>
                                    <p className="text-green-600">
                                        {pageData.total_ayahs} ayat dari {pageData.surahs.length} surah
                                    </p>
                                </div>
                            </div>
                            {/* Play All button */}
                            {isPlayingAll ? (
                                <button
                                    onClick={stopAudio}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    <IoPauseCircleOutline className="w-4 h-4" />
                                    Berhenti
                                </button>
                            ) : (
                                <button
                                    onClick={playAllAyahs}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                                >
                                    <IoPlayCircleOutline className="w-4 h-4" />
                                    Putar Semua
                                </button>
                            )}
                        </div>

                        {/* Now-playing bar (shown when playing all) */}
                        {isPlayingAll && (
                            <div className="flex items-center gap-2 mb-5 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                                <span className="text-xs font-medium text-green-700">Sedang diputar:</span>
                                <span className="text-xs text-green-600">
                                    Ayat {playAllCurrentIndex + 1} / {playAllQueueRef.current.length}
                                </span>
                                <span className="flex gap-0.5 ml-1">
                                    <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                        )}

                        {/* Controls row */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan teks Arab dari Halaman {number}
                            </div>
                            
                            {/* Qari Selector */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    🎙️ Pilih Qari:
                                </label>
                                {recitersLoading ? (
                                    <div className="text-sm text-gray-500">Memuat daftar qari...</div>
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
                                        className="w-full sm:w-auto px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition-colors bg-white text-gray-800"
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
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 mr-2">Ukuran Teks:</span>
                                <button 
                                    onClick={handleZoomOut} 
                                    disabled={arabicFontSize <= 1.5}
                                    className="p-2 rounded-md bg-white border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Perkecil teks Arab"
                                >
                                    <IoRemoveOutline className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={resetZoom}
                                    className="px-3 py-2 rounded-md bg-white border border-green-200 text-green-700 hover:bg-green-50 transition-colors text-xs font-medium"
                                    title="Reset ukuran teks Arab"
                                >
                                    <IoReloadOutline className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={handleZoomIn} 
                                    disabled={arabicFontSize >= 6}
                                    className="p-2 rounded-md bg-white border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Perbesar teks Arab"
                                >
                                    <IoAddOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quran Page Image */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-green-100">
                        <h2 className="text-lg font-semibold text-green-800 mb-4">Gambar Halaman Al-Quran</h2>
                        <div className="flex justify-center">
                            <img
                                src={`https://cdn.myquran.com/img/page/${number}.png`}
                                alt={`Halaman ${number} Al-Quran`}
                                className="max-w-full rounded-2xl shadow-md border border-green-100"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="space-y-8">
                        {pageData.surahs.map((surahData) => (
                            <div key={surahData.surah.number} className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
                                {/* Surah Header */}
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-1">
                                                {surahData.surah.name_latin}
                                            </h2>
                                            <p className="text-green-100 text-lg">
                                                {surahData.surah.name_arabic}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-green-200">Surah</div>
                                            <div className="text-2xl font-bold">#{surahData.surah.number}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ayahs */}
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {surahData.ayahs.map((ayah) => {
                                            const isPlaying = isAudioPlaying && playingAyahId === ayah.id;
                                            return (
                                            <div
                                                key={`${ayah.surah_number}-${ayah.ayah_number}`}
                                                ref={el => ayahRefs.current[ayah.id] = el}
                                                className={`group rounded-2xl p-3 -mx-3 transition-all duration-300 ${
                                                    isPlaying
                                                        ? 'bg-green-50 ring-2 ring-green-400 shadow-md'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                {/* Ayah Number */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                            {ayah.ayah_number}
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            Ayat {ayah.ayah_number}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/surah/${ayah.surah_number}/${ayah.ayah_number}`)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        Lihat Detail →
                                                    </button>
                                                </div>

                                                {/* Arabic Text */}
                                                <div className="bg-green-50/70 rounded-2xl p-6 text-center">
                                                    <p 
                                                        className="text-right leading-relaxed font-arabic text-gray-800"
                                                        style={{ 
                                                            fontSize: `${arabicFontSize}rem`,
                                                            lineHeight: arabicFontSize > 3 ? '1.8' : '1.6',
                                                            fontFeatureSettings: "'calt', 'liga', 'dlig', 'clig'"
                                                        }}
                                                        dir="rtl"
                                                    >
                                                        {ayah.text_arabic}
                                                    </p>
                                                </div>
                                                
                                                {/* Audio Player */}
                                                <div className="mt-3 flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2 border border-green-100">
                                                    {isAudioPlaying && playingAyahId === ayah.id ? (
                                                        <button
                                                            onClick={stopAudio}
                                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
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
                                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
                                                            title="Putar Audio"
                                                        >
                                                            <IoPlayCircleOutline className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {isAudioPlaying && playingAyahId === ayah.id ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-medium text-green-700">Sedang diputar...</span>
                                                                    <span className="flex gap-0.5">
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">
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
                    
                    {/* Page Navigation Footer */}
                    <div className="mt-8 flex justify-between">
                        <button 
                            onClick={handlePrevPage} 
                            disabled={parseInt(number) <= 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
                        >
                            <IoArrowBackOutline className="w-5 h-5" />
                            Halaman Sebelumnya
                        </button>
                        <button 
                            onClick={handleNextPage} 
                            disabled={parseInt(number) >= totalPages}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
                        >
                            Halaman Selanjutnya
                            <IoArrowForwardOutline className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default PageDetailPage;
