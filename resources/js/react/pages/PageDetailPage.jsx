import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoBookmarkOutline, IoBookmark, IoBookOutline } from 'react-icons/io5';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { toggleBookmark, getBookmarkStatus } from '../services/BookmarkService';
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
    const [selectedQari, setSelectedQari] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [playingAyahId, setPlayingAyahId] = useState(null);
    
    // Arabic text zoom state
    const [arabicFontSize, setArabicFontSize] = useState(2.5);
    
    // Bookmark state
    const [bookmarkStatuses, setBookmarkStatuses] = useState({});
    const [bookmarkingAyah, setBookmarkingAyah] = useState(null);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    
    const audioRef = useRef(null);
    
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
            
            const response = await fetchWithAuth(`/api/pages/${pageNumber}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setPageData(data.data);
                
                // Load bookmark statuses for all ayahs if user is authenticated
                if (user && data.data.surahs) {
                    const allAyahs = data.data.surahs.flatMap(surah => surah.ayahs);
                    loadBookmarkStatuses(allAyahs);
                }
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
    
    // Auto-select first available qari when page changes
    useEffect(() => {
        if (pageData?.surahs?.length > 0) {
            const firstAyah = pageData.surahs[0].ayahs[0];
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
    }, [pageData, selectedQari]);
    
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
    
    // Bookmark functions
    const loadBookmarkStatuses = async (ayahs) => {
        if (!user || !Array.isArray(ayahs) || ayahs.length === 0) return;
        
        setBookmarkLoading(true);
        try {
            const ayahIds = ayahs.map(ayah => ayah.id).filter(id => id);
            
            if (ayahIds.length > 0) {
                const statuses = await getBookmarkStatus(ayahIds);
                setBookmarkStatuses(statuses);
            }
        } catch (error) {
            console.error('Error loading bookmark statuses:', error);
        } finally {
            setBookmarkLoading(false);
        }
    };
    
    const handleBookmarkToggle = async (ayah) => {
        if (!user) {
            alert('Silakan login untuk menggunakan fitur bookmark');
            return;
        }
        
        if (!ayah.id) {
            console.error('Ayah ID not found');
            return;
        }
        
        if (bookmarkingAyah === ayah.id) {
            return;
        }
        
        setBookmarkingAyah(ayah.id);
        try {
            const response = await toggleBookmark(ayah.id);
            
            if (response.status === 'success') {
                setBookmarkStatuses(prev => ({
                    ...prev,
                    [ayah.id]: {
                        is_bookmarked: response.data.is_bookmarked,
                        is_favorite: response.data.is_favorite
                    }
                }));
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('Gagal mengubah status bookmark. Silakan coba lagi.');
        } finally {
            setBookmarkingAyah(null);
        }
    };
    
    const getBookmarkStatus = (ayahId) => {
        return bookmarkStatuses[ayahId] || { is_bookmarked: false, is_favorite: false };
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
    
    if (!pageData) {
        return null;
    }

    const pageSEO = {
        title: `Halaman ${number} Al-Quran - IndoQuran`,
        description: `Baca Halaman ${number} Al-Quran lengkap dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir. ${pageData.total_ayahs} ayat tersedia untuk dipelajari.`,
        keywords: `halaman ${number}, al quran halaman ${number}, terjemahan halaman ${number}, quran digital, al quran indonesia`
    };
    
    return (
        <PageTransition>
            <SEOHead {...pageSEO} />
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
                                        Halaman {number}
                                    </h1>
                                    <p className="text-green-600">
                                        {pageData.total_ayahs} ayat dari {pageData.surahs.length} surah
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Arabic Text Zoom Controls */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Menampilkan teks Arab dari Halaman {number}
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
                                                                    title="Pause Audio"
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
                                                                    title="Play Audio"
                                                                >
                                                                    <IoPlayCircleOutline className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    
                                                    {/* Bookmark Button */}
                                                    {user && (
                                                        <button 
                                                            onClick={() => handleBookmarkToggle(ayah)}
                                                            disabled={bookmarkingAyah === ayah.id}
                                                            className={`p-2 rounded-md border transition-colors disabled:opacity-50 ${
                                                                getBookmarkStatus(ayah.id).is_bookmarked 
                                                                    ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600' 
                                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                            }`}
                                                            title={getBookmarkStatus(ayah.id).is_bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
                                                        >
                                                            {bookmarkingAyah === ayah.id ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-current"></div>
                                                            ) : getBookmarkStatus(ayah.id).is_bookmarked ? (
                                                                <IoBookmark className="w-4 h-4" />
                                                            ) : (
                                                                <IoBookmarkOutline className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
