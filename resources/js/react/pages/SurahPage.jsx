// filepath: /Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/SurahPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoChevronDownOutline, IoChevronUpOutline, IoInformationCircleOutline, IoBookmarkOutline, IoBookmark, IoChevronDownSharp, IoLinkOutline, IoCloseOutline, IoShareSocialOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import { fetchFootnote } from '../services/FootnoteService';
import { toggleBookmark, getBookmarkStatus } from '../services/BookmarkService';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';

// Debug flag - set to true to enable enhanced logging
const DEBUG = true;

// Debug utility
const debug = (...args) => {
    if (DEBUG) {
        console.log(`[SurahPage]`, ...args);
    }
};

// Render counter to track component render cycles
let renderCount = 0;

// Initialize global cache to prevent refetching between component mounts
if (!window.indoquranCache) {
    window.indoquranCache = {
        surahs: {},
        ayahs: {}
    };
    debug('🏗️ Created global cache for IndoQuran');
}

function SurahPage({ user }) {
    renderCount++;
    debug(`🔄 Component rendering #${renderCount}`);
    
    // Add component lifecycle debugging
    useEffect(() => {
        const instanceId = Math.random().toString(36).substring(2, 9);
        debug(`🟢 [${instanceId}] Component mounted`);
        
        return () => {
            debug(`🔴 [${instanceId}] Component unmounting`);
            renderCount = 0; // Reset render count on unmount
        };
    }, []);

    const { number, ayahNumber } = useParams();
    const navigate = useNavigate();
    const [surah, setSurah] = useState(null);
    const [ayah, setAyah] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ayahLoading, setAyahLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAyahNumber, setSelectedAyahNumber] = useState(1);
    const [totalAyahs, setTotalAyahs] = useState(0);
    
    // New state for enhanced features
    const [showTafsir, setShowTafsir] = useState(false);
    const [selectedQari, setSelectedQari] = useState(''); // Will be set to first available qari
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);

    // Initialize a cache for surah metadata
    const surahCacheRef = useRef({});
    
    // On mount or when surah number changes, fetch surah metadata and first ayah
    useEffect(() => {
        if (!number) return;
        
        // Initialize necessary states
        setLoading(true);
        setError(null);
        
        // Set initial ayah number from URL parameter or default to 1
        const initialAyahNumber = ayahNumber ? parseInt(ayahNumber) : 1;
        setSelectedAyahNumber(initialAyahNumber);
        
        // Check if we already have the surah data in the cache
        if (surahCacheRef.current[number]) {
            debug(`Using cached data for surah ${number}`);
            setSurah(surahCacheRef.current[number]);
            setTotalAyahs(surahCacheRef.current[number].total_ayahs);
            setLoading(false);
            return;
        }
        
        // Otherwise fetch from API
        debug(`Fetching metadata for surah ${number}`);
        fetch(`/api/surahs/${number}/metadata`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Store in cache for future use
                    surahCacheRef.current[number] = data.data;
                    
                    // Update state
                    setSurah(data.data);
                    setTotalAyahs(data.data.total_ayahs);
                } else {
                    throw new Error(data.message || 'Gagal memuat metadata surah');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [number]); // Remove ayahNumber from dependencies to prevent excess refetching

    // Cache for loaded ayahs
    const ayahCacheRef = useRef({});
    
    // Fetch ayah when selectedAyahNumber changes
    useEffect(() => {
        if (!number || !selectedAyahNumber) return;
        
        const ayahKey = `${number}-${selectedAyahNumber}`;
        
        // Check if we have this ayah cached
        if (window.indoquranCache.ayahs && window.indoquranCache.ayahs[ayahKey]) {
            debug(`Using cached ayah data for ${ayahKey}`);
            setAyah(window.indoquranCache.ayahs[ayahKey]);
            return;
        }
        
        setAyahLoading(true);
        setError(null);
        
        debug(`Fetching ayah ${ayahKey}`);
        fetch(`/api/ayahs/${number}/${selectedAyahNumber}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Cache the ayah data
                    if (!window.indoquranCache.ayahs) window.indoquranCache.ayahs = {};
                    window.indoquranCache.ayahs[ayahKey] = data.data;
                    
                    setAyah(data.data);
                } else {
                    throw new Error(data.message || 'Gagal memuat ayat');
                }
            })
            .catch(err => {
                debug(`Error loading ayah ${ayahKey}: ${err.message}`);
                setError(err.message);
            })
            .finally(() => setAyahLoading(false));
    }, [number, selectedAyahNumber]);

    // Update URL when selectedAyahNumber changes
    useEffect(() => {
        if (!number || !surah) return;
        // Only update URL if the ayahNumber in URL is different from selectedAyahNumber
        const currentAyahNum = parseInt(ayahNumber);
        if (!isNaN(currentAyahNum) && currentAyahNum !== selectedAyahNumber) {
            navigate(`/surah/${number}/${selectedAyahNumber}`, { replace: true });
        }
    }, [selectedAyahNumber, number, surah, ayahNumber, navigate]);

    // Handler for ayah button click
    const handleAyahClick = (ayahNum) => {
        if (ayahNum !== selectedAyahNumber) {
            setSelectedAyahNumber(ayahNum);
        }
    };

    // Handler for prev/next buttons
    const handlePrevAyah = () => {
        if (selectedAyahNumber > 1) {
            setSelectedAyahNumber(selectedAyahNumber - 1);
        }
    };
    const handleNextAyah = () => {
        if (selectedAyahNumber < totalAyahs) {
            setSelectedAyahNumber(selectedAyahNumber + 1);
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

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
    }
    if (error || !surah) {
        return <div className="bg-accent-50 text-accent-700 p-4 rounded-lg shadow-lg" role="alert"><strong className="font-bold">Kesalahan! </strong><span className="block sm:inline">{error || 'Surah tidak ditemukan'}</span></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-green-800 mb-2">{surah.name_latin} <span className="text-gray-500 font-normal">({surah.name_arabic})</span></h2>
                        <div className="text-gray-600 text-sm mb-1">{surah.name_indonesian} • {surah.revelation_place} • {surah.total_ayahs} ayat</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center mb-8">
                    {ayahLoading ? (
                        <div className="flex justify-center items-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            <span className="ml-2 text-gray-600">Memuat ayat...</span>
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
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    Ayat {selectedAyahNumber}
                                </span>
                            </div>

                            {/* Arabic Text */}
                            <div id="arabic-text" className="text-3xl md:text-4xl font-arabic text-right leading-loose mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                {ayah.text_arabic}
                            </div>

                            {/* Transliteration (Latin) */}
                            {ayah.text_latin && (
                                <div className="text-lg italic text-gray-700 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-sm font-medium text-blue-800 mb-1">Transliterasi:</div>
                                    {ayah.text_latin}
                                </div>
                            )}

                            {/* Indonesian Translation */}
                            <div className="text-lg text-gray-800 mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <div className="text-sm font-medium text-yellow-800 mb-1">Terjemahan Indonesia:</div>
                                {ayah.text_indonesian || ayah.translation_id}
                            </div>

                            {/* English Translation */}
                            {ayah.translation_en && (
                                <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-sm font-medium text-gray-700 mb-1">English Translation:</div>
                                    {ayah.translation_en}
                                </div>
                            )}

                            {/* Audio Player with Qari Selection */}
                            {ayah.audio_urls && getAvailableQaris().length > 0 && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-indigo-800">Qari:</label>
                                            <select 
                                                value={selectedQari || ''} 
                                                onChange={(e) => handleQariChange(e.target.value)}
                                                className="px-3 py-1 text-sm rounded-md border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                                <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                                    <button 
                                        onClick={() => setShowTafsir(!showTafsir)}
                                        className="flex items-center justify-between w-full text-left"
                                    >
                                        <span className="text-sm font-medium text-orange-800">Tafsir</span>
                                        {showTafsir ? (
                                            <IoChevronUpOutline className="w-4 h-4 text-orange-600" />
                                        ) : (
                                            <IoChevronDownOutline className="w-4 h-4 text-orange-600" />
                                        )}
                                    </button>
                                    {showTafsir && (
                                        <div className="mt-3 text-sm text-gray-700 leading-relaxed">
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
                        {Array.from({ length: totalAyahs }, (_, idx) => (
                            <button
                                key={idx+1}
                                onClick={() => handleAyahClick(idx+1)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium border ${selectedAyahNumber === idx+1 ? 'bg-green-600 text-white border-green-700' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
                            >
                                {idx+1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SurahPage;
