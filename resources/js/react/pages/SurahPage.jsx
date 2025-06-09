// filepath: /Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/SurahPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoChevronDownOutline, IoChevronUpOutline, IoInformationCircleOutline, IoBookmarkOutline, IoBookmark, IoChevronDownSharp, IoLinkOutline, IoCloseOutline, IoShareSocialOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import { fetchFootnote } from '../services/FootnoteService';
import { toggleBookmark, getBookmarkStatus } from '../services/BookmarkService';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';

function SurahPage() {
    const { user } = useAuth();

    const { number, ayahNumber } = useParams();
    

    const navigate = useNavigate();
    const [surah, setSurah] = useState(null);
    const [ayah, setAyah] = useState(null);
    const [allAyahs, setAllAyahs] = useState({}); // Store all ayahs for the surah
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAyahNumber, setSelectedAyahNumber] = useState(1);
    const [totalAyahs, setTotalAyahs] = useState(0);
    
    // New state for enhanced features
    const [showTafsir, setShowTafsir] = useState(false);
    const [selectedQari, setSelectedQari] = useState(''); // Will be set to first available qari
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    
    // Description toggle state (default to hidden)
    const [showDescription, setShowDescription] = useState(false);
    
    // Arabic text zoom state
    const [arabicFontSize, setArabicFontSize] = useState(3); // Default size in rem (3xl = 3rem)
    
    // Bookmark state management
    const [bookmarkStatuses, setBookmarkStatuses] = useState({}); // {ayahId: {is_bookmarked, is_favorite}}
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [bookmarkingAyah, setBookmarkingAyah] = useState(null); // Track which ayah is being bookmarked

    // Initialize a cache for complete surah data (including all ayahs)
    const surahCacheRef = useRef({});
    
    // Reference for Arabic text element for auto-scrolling
    const arabicTextRef = useRef(null);
    
    // On mount or when surah number changes, fetch complete surah data with all ayahs
    useEffect(() => {
        if (!number) return;
        
        // Initialize necessary states
        setLoading(true);
        setError(null);
        
        // Set initial ayah number from URL parameter or default to 1
        const initialAyahNumber = ayahNumber ? parseInt(ayahNumber) : 1;
        setSelectedAyahNumber(initialAyahNumber);
        
        // Check if we already have the complete surah data in the cache
        if (surahCacheRef.current[number]) {
            const cachedData = surahCacheRef.current[number];
            setSurah(cachedData.surah);
            setAllAyahs(cachedData.ayahs);
            setTotalAyahs(cachedData.surah.total_ayahs);
            setLoading(false);
            return;
        }
        
        // Otherwise fetch complete data from API
        fetchWithAuth(`/api/surahs/${number}`)
            .then(res => res.json())
            .then(data => {
                
                // Handle different response formats
                let surahData, ayahsArray;
                
                if (data.status === 'success' && data.data) {
                    // QuranController format: {status, data: {surah, ayahs}}
                    surahData = data.data.surah || data.data;
                    ayahsArray = data.data.ayahs || [];
                } else if (data.ayahs) {
                    // SurahController format: direct surah object with ayahs relationship
                    surahData = data;
                    ayahsArray = data.ayahs || [];
                } else {
                    throw new Error('Unexpected API response format');
                }
                
                // Organize ayahs by number for easy access
                const ayahsMap = {};
                if (Array.isArray(ayahsArray) && ayahsArray.length > 0) {
                    ayahsArray.forEach((ayah, index) => {
                        // Priority: ayah_number field (the correct field), then number, then index
                        const ayahNumber = ayah.ayah_number || ayah.number || (index + 1);
                        ayahsMap[ayahNumber] = ayah;
                    });
                }
                
                // Store complete data in cache for future use
                surahCacheRef.current[number] = {
                    surah: surahData,
                    ayahs: ayahsMap
                };
                
                // Update state
                setSurah(surahData);
                setAllAyahs(ayahsMap);
                setTotalAyahs(surahData.total_ayahs);
                
                // Load bookmark statuses for all ayahs if user is authenticated
                if (user && Object.keys(ayahsMap).length > 0) {
                    loadBookmarkStatuses(Object.values(ayahsMap));
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [number]); // Remove ayahNumber from dependencies to prevent excess refetching

    // Select ayah from already loaded data when selectedAyahNumber changes
    useEffect(() => {
        if (!selectedAyahNumber || !allAyahs || Object.keys(allAyahs).length === 0) {
            return;
        }
        
        // Get the selected ayah from the loaded data
        const selectedAyah = allAyahs[selectedAyahNumber];
        
        if (selectedAyah) {
            setAyah(selectedAyah);
            setError(null); // Clear any previous errors
        } else {
            // Try to find the first available ayah as fallback
            const availableKeys = Object.keys(allAyahs).map(k => parseInt(k)).sort((a, b) => a - b);
            
            if (availableKeys.length > 0) {
                const firstAvailableAyah = availableKeys[0];
                setSelectedAyahNumber(firstAvailableAyah);
                return; // This will trigger the effect again
            }
            
            console.error('❌ SurahPage - No ayah found:', selectedAyahNumber);
            setError(`Ayat ${selectedAyahNumber} tidak ditemukan`);
        }
    }, [selectedAyahNumber, allAyahs]);

    // Handler for ayah button click
    const handleAyahClick = (ayahNum) => {
        if (ayahNum !== selectedAyahNumber) {
            setSelectedAyahNumber(ayahNum);
            // Update URL immediately when ayah button is clicked
            navigate(`/surah/${number}/${ayahNum}`, { replace: true });
            
            // Auto-scroll to Arabic text after a short delay to ensure content is updated
            setTimeout(() => {
                if (arabicTextRef.current) {
                    arabicTextRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 100);
        }
    };

    // Handler for prev/next buttons
    const handlePrevAyah = () => {
        if (selectedAyahNumber > 1) {
            const newAyahNumber = selectedAyahNumber - 1;
            setSelectedAyahNumber(newAyahNumber);
            navigate(`/surah/${number}/${newAyahNumber}`, { replace: true });
            
            // Auto-scroll to Arabic text
            setTimeout(() => {
                if (arabicTextRef.current) {
                    arabicTextRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 100);
        }
    };
    const handleNextAyah = () => {
        if (selectedAyahNumber < totalAyahs) {
            const newAyahNumber = selectedAyahNumber + 1;
            setSelectedAyahNumber(newAyahNumber);
            navigate(`/surah/${number}/${newAyahNumber}`, { replace: true });
            
            // Auto-scroll to Arabic text
            setTimeout(() => {
                if (arabicTextRef.current) {
                    arabicTextRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 100);
        }
    };

    // Cleanup audio when component unmounts or ayah changes
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                setIsAudioPlaying(false);
                setAudioElement(null);
            }
        };
    }, [selectedAyahNumber]);

    // Also cleanup on component unmount
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, []);

    // Auto-select first available qari when ayah changes
    useEffect(() => {
        if (ayah?.audio_urls) {
            const audioUrls = typeof ayah.audio_urls === 'string' 
                ? JSON.parse(ayah.audio_urls) 
                : ayah.audio_urls;
            
            let availableQaris;
            if (Array.isArray(audioUrls)) {
                const defaultQaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit', 'maher', 'ghamdi', 'shuraim', 'ajmy', 'walk'];
                availableQaris = audioUrls.map((_, index) => defaultQaris[index] || `qari_${index + 1}`);
            } else {
                availableQaris = Object.keys(audioUrls);
            }
            
            if (availableQaris.length > 0 && (!selectedQari || !availableQaris.includes(selectedQari))) {
                setSelectedQari(availableQaris[0]);
            }
        }
    }, [ayah]);

    // Audio playback functions
    const playAudio = (audioUrl) => {
        if (audioElement) {
            audioElement.pause();
        }
        
        const audio = new Audio(audioUrl);
        audio.play()
            .then(() => {
                setIsAudioPlaying(true);
                setAudioElement(audio);
                
                audio.onended = () => {
                    setIsAudioPlaying(false);
                    setAudioElement(null);
                };
            })
            .catch(err => {
                console.error('Error playing audio:', err);
                setIsAudioPlaying(false);
            });
    };

    const stopAudio = () => {
        if (audioElement) {
            audioElement.pause();
            setIsAudioPlaying(false);
            setAudioElement(null);
        }
    };

    // Handle qari selection change
    const handleQariChange = (qari) => {
        setSelectedQari(qari);
        if (isAudioPlaying) {
            stopAudio();
        }
    };

    // Get available qaris from audio_urls
    const getAvailableQaris = () => {
        if (!ayah?.audio_urls) return [];
        
        const audioUrls = typeof ayah.audio_urls === 'string' 
            ? JSON.parse(ayah.audio_urls) 
            : ayah.audio_urls;
        
        // Handle both object format {qari: url} and array format [url1, url2, ...]
        if (Array.isArray(audioUrls)) {
            // If it's an array, create qari keys based on common order
            const defaultQaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit', 'maher', 'ghamdi', 'shuraim', 'ajmy', 'walk'];
            return audioUrls.map((_, index) => defaultQaris[index] || `qari_${index + 1}`);
        } else {
            // If it's an object, return the keys (handles both numbered and named keys)
            return Object.keys(audioUrls);
        }
    };

    // Get audio URL for selected qari
    const getAudioUrl = () => {
        if (!ayah?.audio_urls) return null;
        
        const audioUrls = typeof ayah.audio_urls === 'string' 
            ? JSON.parse(ayah.audio_urls) 
            : ayah.audio_urls;
        
        // Handle both object format {qari: url} and array format [url1, url2, ...]
        if (Array.isArray(audioUrls)) {
            const defaultQaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit', 'maher', 'ghamdi', 'shuraim', 'ajmy', 'walk'];
            const qariIndex = defaultQaris.indexOf(selectedQari);
            return qariIndex !== -1 ? audioUrls[qariIndex] : audioUrls[0];
        } else {
            // For object format, directly access the URL using the selectedQari key
            return audioUrls[selectedQari] || Object.values(audioUrls)[0];
        }
    };

    // Get display name for qari
    const getQariDisplayName = (qariKey) => {
        const qariNames = {
            // Handle numbered keys from API
            '01': 'Abdullah Al-Juhany',
            '02': 'Abdul Muhsin Al-Qasim',
            '03': 'Abdurrahman As-Sudais',
            '04': 'Ibrahim Al-Dossari',
            '05': 'Mishary Rashid Alafasy',
            '06': 'Maher Al Mueaqly',
            '07': 'Ahmed ibn Ali al-Ajamy',
            '08': 'Hani Ar-Rifai',
            '09': 'Mahmoud Khalil Al-Husary',
            '10': 'Mohamed Siddiq El-Minshawi',
            // Handle named keys (fallback)
            'husary': 'Mahmoud Khalil Al-Husary',
            'sudais': 'Abdurrahman As-Sudais',
            'alafasy': 'Mishary Rashid Alafasy',
            'minshawi': 'Mohamed Siddiq El-Minshawi',
            'abdulbasit': 'Abdul Basit Abdul Samad',
            'maher': 'Maher Al Mueaqly',
            'ghamdi': 'Saad Al Ghamdi',
            'shuraim': 'Saud Ash-Shuraim',
            'ajmy': 'Ahmed ibn Ali al-Ajamy',
            'walk': 'Hani Ar-Rifai'
        };
        
        return qariNames[qariKey] || `Qari ${qariKey}`;
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
            // Redirect to login or show login prompt
            alert('Silakan login untuk menggunakan fitur bookmark');
            return;
        }

        if (!ayah.id) {
            console.error('Ayah ID not found');
            return;
        }

        // Prevent multiple simultaneous bookmark operations on the same ayah
        if (bookmarkingAyah === ayah.id) {
            return;
        }

        setBookmarkingAyah(ayah.id);
        try {
            const response = await toggleBookmark(ayah.id);
            
            if (response.status === 'success') {
                // Update bookmark status in state
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

    // WhatsApp share function
    const shareToWhatsApp = () => {
        if (!ayah || !surah) return;
        
        // Construct the share message
        let message = `🕌 *${surah.name_latin}* (${surah.name_arabic})\n`;
        message += `📖 Ayat ${selectedAyahNumber}\n\n`;
        
        // Add Arabic text
        message += `🔤 *Arab:*\n${ayah.text_arabic}\n\n`;
        
        // Add transliteration if available
        if (ayah.text_latin) {
            message += `🔤 *Transliterasi:*\n${ayah.text_latin}\n\n`;
        }
        
        // Add Indonesian translation
        const indonesianText = ayah.text_indonesian || ayah.translation_id;
        if (indonesianText) {
            message += `🇮🇩 *Terjemahan Indonesia:*\n${indonesianText}\n\n`;
        }
        
        // Add English translation if available
        if (ayah.translation_en) {
            message += `🇺🇸 *English Translation:*\n${ayah.translation_en}\n\n`;
        }
        
        // Add current page URL
        const currentUrl = window.location.href;
        message += `🔗 Baca selengkapnya: ${currentUrl}\n\n`;
        message += `📱 Dibagikan dari IndoQuran`;
        
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
    };

    // Arabic text zoom functions
    const handleZoomIn = () => {
        setArabicFontSize(prev => Math.min(prev + 0.5, 6)); // Max 6rem
    };

    const handleZoomOut = () => {
        setArabicFontSize(prev => Math.max(prev - 0.5, 1.5)); // Min 1.5rem
    };

    const resetZoom = () => {
        setArabicFontSize(3); // Reset to default 3rem
    };

    // Get dynamic font size class
    const getArabicFontSizeStyle = () => {
        return {
            fontSize: `${arabicFontSize}rem`
        };
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
    }
    if (error || !surah) {
        return <div className="bg-accent-50 text-accent-700 p-4 rounded-lg shadow-lg" role="alert"><strong className="font-bold">Kesalahan! </strong><span className="block sm:inline">{error || 'Surah tidak ditemukan'}</span></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                    <div className="mb-4">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                            <h2 className="text-2xl font-bold text-green-800">{surah.name_latin} <span className="text-gray-500 font-normal">({surah.name_arabic})</span></h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Sedang membaca:</span>
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-600 shadow-lg">
                                    <span className="mr-1">📖</span> Ayat {selectedAyahNumber}
                                </span>
                            </div>
                        </div>
                        <div className="text-gray-600 text-sm mb-1">{surah.name_indonesian} • {surah.revelation_place} • {surah.total_ayahs} ayat</div>
                    </div>
                </div>
                
                {/* Description Section with Toggle */}
                {(surah.description_short || surah.description_long) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                <IoInformationCircleOutline className="text-green-600" />
                                Tentang Surah {surah.name_latin}
                            </h3>
                            <button
                                onClick={() => setShowDescription(!showDescription)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 hover:text-green-800 transition-colors"
                            >
                                <span className="text-sm font-medium">
                                    {showDescription ? 'Sembunyikan' : 'Tampilkan'}
                                </span>
                                {showDescription ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                            </button>
                        </div>
                        
                        {showDescription && (
                            <div className="space-y-4">
                                {surah.description_short && (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <h4 className="text-sm font-medium text-green-800 mb-2">Ringkasan:</h4>
                                        <div 
                                            className="text-green-700 text-sm leading-relaxed prose prose-sm max-w-none prose-green"
                                            dangerouslySetInnerHTML={{ __html: surah.description_short }}
                                        />
                                    </div>
                                )}
                                
                                {surah.description_long && (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <h4 className="text-sm font-medium text-green-800 mb-2">Penjelasan Lengkap:</h4>
                                        <div 
                                            className="text-green-700 text-sm leading-relaxed prose prose-sm max-w-none prose-green"
                                            dangerouslySetInnerHTML={{ __html: surah.description_long }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center mb-8">
                    {loading ? (
                        <div className="flex justify-center items-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-gray-600">Memuat surah dan ayat...</span>
                        </div>
                    ) : ayah ? (
                        <div>
                            {/* Juz and Page Info */}
                            <div className="flex justify-center gap-3 mb-4">
                                {ayah.juz && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                        Juz {ayah.juz}
                                    </span>
                                )}
                                {ayah.page && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                        Halaman {ayah.page}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-700 shadow-lg ring-2 ring-green-200 ring-opacity-50">
                                    <span className="mr-1">📖</span> Ayat {selectedAyahNumber}
                                </span>
                            </div>

                            {/* Arabic Text */}
                            <div className="mb-4 p-6 bg-green-50/70 rounded-2xl border border-green-100 relative text-center">
                                {/* Arabic Text Zoom Controls */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    <button 
                                        onClick={handleZoomOut} 
                                        disabled={arabicFontSize <= 1.5}
                                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Perkecil teks Arab"
                                    >
                                        <IoRemoveOutline className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={resetZoom}
                                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium"
                                        title="Reset ukuran teks Arab"
                                    >
                                        <IoReloadOutline className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={handleZoomIn} 
                                        disabled={arabicFontSize >= 6}
                                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Perbesar teks Arab"
                                    >
                                        <IoAddOutline className="w-4 h-4" />
                                    </button>
                                </div>
                                <div 
                                    ref={arabicTextRef} 
                                    id="arabic-text" 
                                    className="font-arabic text-green-800 text-right leading-loose pt-8" 
                                    style={getArabicFontSizeStyle()}
                                    dir="rtl"
                                >
                                    {ayah.text_arabic}
                                </div>
                            </div>

                            {/* Transliteration (Latin) */}
                            {ayah.text_latin && (
                                <div className="text-lg italic text-green-600 mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="text-sm font-medium text-green-800 mb-1">Transliterasi:</div>
                                    {ayah.text_latin}
                                </div>
                            )}

                            {/* Indonesian Translation */}
                            <div className="text-lg text-green-700 mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="text-sm font-medium text-green-800 mb-1">Terjemahan Indonesia:</div>
                                {ayah.text_indonesian || ayah.translation_id}
                            </div>

                            {/* English Translation */}
                            {ayah.translation_en && (
                                <div className="text-sm text-green-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="text-sm font-medium text-green-700 mb-1">English Translation:</div>
                                    {ayah.translation_en}
                                </div>
                            )}

                            {/* Audio Player with Qari Selection */}
                            {ayah.audio_urls && getAvailableQaris().length > 0 && (
                                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-green-800">Qari:</label>
                                            <select 
                                                value={selectedQari || ''} 
                                                onChange={(e) => handleQariChange(e.target.value)}
                                                className="px-3 py-1 text-sm rounded-md border border-green-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            >
                                                {getAvailableQaris().map(qari => (
                                                    <option key={qari} value={qari}>
                                                        {getQariDisplayName(qari)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isAudioPlaying ? (
                                                <button 
                                                    onClick={() => playAudio(getAudioUrl())}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    disabled={!getAudioUrl()}
                                                >
                                                    <IoPlayCircleOutline className="w-5 h-5" />
                                                    Putar
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={stopAudio}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <IoPauseCircleOutline className="w-5 h-5" />
                                                    Berhenti
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tafsir Section */}
                            {ayah.tafsir && (
                                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                    <button 
                                        onClick={() => setShowTafsir(!showTafsir)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <span className="text-sm font-medium text-green-800">Tafsir</span>
                                        {showTafsir ? (
                                            <IoChevronUpOutline className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <IoChevronDownOutline className="w-4 h-4 text-green-600" />
                                        )}
                                    </button>
                                    {showTafsir && (
                                        <div className="mt-3 text-sm text-green-700 leading-relaxed text-left">
                                            {ayah.tafsir}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                <button 
                                    onClick={handlePrevAyah} 
                                    disabled={selectedAyahNumber <= 1} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium disabled:opacity-50 hover:bg-green-200 transition-colors"
                                >
                                    <IoArrowBackOutline className="w-4 h-4" />
                                    Sebelumnya
                                </button>
                                <button 
                                    onClick={handleNextAyah} 
                                    disabled={selectedAyahNumber >= totalAyahs} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium disabled:opacity-50 hover:bg-green-200 transition-colors"
                                >
                                    Selanjutnya
                                    <IoArrowForwardOutline className="w-4 h-4" />
                                </button>
                                {user && ayah && (
                                    <button 
                                        onClick={() => handleBookmarkToggle(ayah)}
                                        disabled={bookmarkingAyah === ayah.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                                            getBookmarkStatus(ayah.id).is_bookmarked 
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        title={getBookmarkStatus(ayah.id).is_bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
                                    >
                                        {bookmarkingAyah === ayah.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                                        ) : getBookmarkStatus(ayah.id).is_bookmarked ? (
                                            <IoBookmark className="w-4 h-4" />
                                        ) : (
                                            <IoBookmarkOutline className="w-4 h-4" />
                                        )}
                                        {bookmarkingAyah === ayah.id ? 'Loading...' : getBookmarkStatus(ayah.id).is_bookmarked ? 'Bookmarked' : 'Bookmark'}
                                    </button>
                                )}
                                <button 
                                    onClick={shareToWhatsApp}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                                >
                                    <IoShareSocialOutline className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500">Pilih ayat untuk ditampilkan</div>
                    )}
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Daftar Ayat</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Array.from({ length: totalAyahs }, (_, idx) => {
                            const ayahNum = idx + 1;
                            const ayahData = allAyahs[ayahNum];
                            const isBookmarked = ayahData && user ? getBookmarkStatus(ayahData.id).is_bookmarked : false;
                            
                            return (
                                <div key={ayahNum} className="relative">
                                    <button
                                        onClick={() => handleAyahClick(ayahNum)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${selectedAyahNumber === ayahNum ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                                    >
                                        {ayahNum}
                                    </button>
                                    {isBookmarked && (
                                        <IoBookmark 
                                            className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" 
                                            title="Ayat ini telah dibookmark"
                                        />
                                    )}
                                    {user && ayahData && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookmarkToggle(ayahData);
                                            }}
                                            disabled={bookmarkingAyah === ayahData.id}
                                            className={`absolute -bottom-1 -right-1 p-1 rounded-full text-xs transition-colors disabled:opacity-50 ${
                                                isBookmarked 
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                            title={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
                                        >
                                            {bookmarkingAyah === ayahData.id ? (
                                                <div className="animate-spin rounded-full h-2 w-2 border-t border-b border-current"></div>
                                            ) : isBookmarked ? (
                                                <IoBookmark className="w-2 h-2" />
                                            ) : (
                                                <IoBookmarkOutline className="w-2 h-2" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {user && bookmarkLoading && (
                        <div className="flex justify-center items-center mt-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-sm text-gray-600">Memuat status bookmark...</span>
                        </div>
                    )}
                    {!user && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 text-center">
                                <span className="font-medium">💡 Tips:</span> Login untuk menggunakan fitur bookmark dan menyimpan ayat favorit Anda!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SurahPage;
