import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import SEOHead from '../components/SEOHead';
import { IoArrowBackOutline, IoBookOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoPlayCircleOutline, IoPauseCircleOutline } from 'react-icons/io5';

function JuzPage() {
    const { number } = useParams();
    const navigate = useNavigate();
    const [juzData, setJuzData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [arabicFontSize, setArabicFontSize] = useState(2.5); // Default size in rem
    
    // Audio state
    const [selectedQari, setSelectedQari] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [playingAyahId, setPlayingAyahId] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (number) {
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
            } else {
                setError(data.message || 'Failed to load Juz data');
            }
        } catch (err) {
            console.error('Error loading Juz data:', err);
            setError('Failed to load Juz data. Please try again.');
        } finally {
            setLoading(false);
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
    
    // Auto-select first available qari when juz data changes
    useEffect(() => {
        if (juzData?.surahs?.length > 0) {
            const firstSurah = juzData.surahs[0];
            if (firstSurah.ayahs.length > 0) {
                const firstAyah = firstSurah.ayahs[0];
                if (firstAyah?.audio_urls) {
                    const audioUrls = typeof firstAyah.audio_urls === 'string' 
                        ? JSON.parse(firstAyah.audio_urls) 
                        : firstAyah.audio_urls;
                    
                    let availableQaris;
                    if (Array.isArray(audioUrls)) {
                        const defaultQaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit', 'maher', 'ghamdi', 'shuraim', 'ajmy', 'walk'];
                        availableQaris = audioUrls.map((_, index) => defaultQaris[index] || `qari_${index + 1}`);
                    } else {
                        availableQaris = Object.keys(audioUrls);
                    }
                    
                    if (availableQaris.length > 0 && !selectedQari) {
                        setSelectedQari(availableQaris[0]);
                    }
                }
            }
        }
    }, [juzData, selectedQari]);
    
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
    const playAudio = (audioUrl, ayahId) => {
        if (audioElement) {
            audioElement.pause();
            setIsAudioPlaying(false);
            setPlayingAyahId(null);
        }
        
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
                };
            })
            .catch(err => {
                console.error('Audio playback error:', err);
            });
    };
    
    const stopAudio = () => {
        if (audioElement) {
            audioElement.pause();
            setIsAudioPlaying(false);
            setAudioElement(null);
            setPlayingAyahId(null);
        }
    };
    
    const getAudioUrl = (ayah) => {
        if (!ayah.audio_urls) return null;
        
        const audioUrls = typeof ayah.audio_urls === 'string' 
            ? JSON.parse(ayah.audio_urls) 
            : ayah.audio_urls;
        
        if (Array.isArray(audioUrls)) {
            return audioUrls[0];
        } else if (typeof audioUrls === 'object') {
            return audioUrls[selectedQari] || Object.values(audioUrls)[0];
        }
        
        return null;
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
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Kembali
                                </button>
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
        title: `Juz ${juzData.juz_number} - Al-Quran Digital - IndoQuran`,
        description: `Baca Juz ${juzData.juz_number} Al-Quran dengan teks Arab lengkap. Total ${juzData.total_ayahs} ayat dari ${juzData.surahs.length} surah. Platform Al-Quran digital terlengkap di Indonesia.`,
        keywords: `juz ${juzData.juz_number}, para ${juzData.juz_number}, al quran juz ${juzData.juz_number}, quran digital, teks arab, al quran indonesia`
    };

    return (
        <PageTransition>
            <SEOHead {...juzSEO} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200"
                            >
                                <IoArrowBackOutline className="text-xl" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl">
                                    <IoBookOutline className="text-2xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-green-800">
                                        Juz {juzData.juz_number}
                                    </h1>
                                    <p className="text-green-600">
                                        {juzData.total_ayahs} ayat dari {juzData.surahs.length} surah
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Arabic Text Zoom Controls */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Menampilkan teks Arab dari Juz {juzData.juz_number}
                            </div>
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

                    {/* Juz Content */}
                    <div className="space-y-8">
                        {juzData.surahs.map((surahData, surahIndex) => (
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
                                        {surahData.ayahs.map((ayah) => (
                                            <div key={`${ayah.surah_number}-${ayah.ayah_number}`} className="group">
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
                                                            lineHeight: arabicFontSize > 3 ? '1.8' : '1.6'
                                                        }}
                                                        dir="rtl"
                                                    >
                                                        {ayah.text_arabic}
                                                    </p>
                                                </div>
                                                
                                                {/* Action Buttons - Only shown on hover */}
                                                <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Audio Controls */}
                                                    {ayah.audio_urls && (
                                                        <>
                                                            {isAudioPlaying && playingAyahId === ayah.id ? (
                                                                <button
                                                                    onClick={stopAudio}
                                                                    className="p-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                                                                    title="Jeda Audio"
                                                                >
                                                                    <IoPauseCircleOutline className="w-5 h-5" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        const audioUrl = getAudioUrl(ayah);
                                                                        if (audioUrl) {
                                                                            playAudio(audioUrl, ayah.id);
                                                                        }
                                                                    }}
                                                                    className="p-2 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                                                                    title="Putar Audio"
                                                                >
                                                                    <IoPlayCircleOutline className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default JuzPage;
