import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function AyahPage() {
    const { surahNumber, ayahNumber } = useParams();
    const navigate = useNavigate();
    const [ayah, setAyah] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [fontSize, setFontSize] = useState(4);
    const [showTafsir, setShowTafsir] = useState(false);
    const [selectedQari, setSelectedQari] = useState('01'); // Default to first qari (numeric ID)
    const [qariOptions, setQariOptions] = useState([]); // Available Qaris
    const [isQariDropdownOpen, setIsQariDropdownOpen] = useState(false); // Dropdown state
    const qariDropdownRef = useRef(null); // Reference for qari dropdown
    
    useEffect(() => {
        setLoading(true);
        fetch(`/api/ayahs/${surahNumber}/${ayahNumber}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch ayah');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setAyah(response.data);
                } else {
                    setError("Gagal memuat data ayat");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [surahNumber, ayahNumber]);
    
    // Extract qari options from the ayah's audio_urls
    useEffect(() => {
        if (ayah && ayah.audio_urls) {
            try {
                const audioUrls = typeof ayah.audio_urls === 'string' 
                    ? JSON.parse(ayah.audio_urls) 
                    : ayah.audio_urls;
                
                // Generate qari names based on the keys (support both named and numeric keys)
                const qaris = Object.keys(audioUrls).map(key => {
                    // If numeric key (like "01", "02"), create a friendly name
                    if (/^\d+$/.test(key)) {
                        // Map numeric IDs to Qari names based on common index positions
                        const qariNames = {
                            "01": "Abdullah Al-Juhany",
                            "02": "Abdul Muhsin Al-Qasim",
                            "03": "Abdurrahman As-Sudais",
                            "04": "Ibrahim Al-Dossari",
                            "05": "Misyary Rasyid Al-Afasi",
                            "husary": "Mahmood Khaleel Al-Husaree",
                            "sudais": "Abdurrahman As-Sudais",
                            "alafasy": "Misyary Rasyid Al-Afasi",
                            "minshawi": "Muhammad Siddeeq Al-Minshaawee",
                            "abdulbasit": "Abdul Baset Abdussamad"
                        };
                        
                        // Use mapping if available, otherwise use "Qari #X" format
                        return {
                            id: key,
                            name: qariNames[key] || `Qari #${parseInt(key, 10)}`
                        };
                    } else {
                        // For named keys (like "husary", "sudais"), use the mapping or capitalize first letter
                        const qariNames = {
                            "husary": "Mahmood Khaleel Al-Husaree",
                            "sudais": "Abdurrahman As-Sudais",
                            "alafasy": "Misyary Rasyid Al-Afasi",
                            "minshawi": "Muhammad Siddeeq Al-Minshaawee",
                            "abdulbasit": "Abdul Baset Abdussamad"
                        };
                        
                        return {
                            id: key,
                            name: qariNames[key] || key.charAt(0).toUpperCase() + key.slice(1)
                        };
                    }
                });
                
                setQariOptions(qaris);
                
                // Set first qari as default if not already set or if current selection is not available
                if (qaris.length > 0) {
                    const currentQariExists = qaris.some(q => q.id === selectedQari);
                    if (!currentQariExists) {
                        setSelectedQari(qaris[0].id);
                    }
                }
            } catch (error) {
                console.error('Error parsing audio_urls:', error);
            }
        }
    }, [ayah, selectedQari]);
    
    // Handle click outside qari dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (qariDropdownRef.current && !qariDropdownRef.current.contains(event.target)) {
                setIsQariDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [qariDropdownRef]);
    
    // Handle qari selection
    const handleQariSelection = (qariId) => {
        setSelectedQari(qariId);
        setIsQariDropdownOpen(false);
        
        // If currently playing audio, restart with new qari
        if (isPlaying) {
            handlePlayAudio();
        }
    };
    
    // Play audio with selected qari
    const handlePlayAudio = () => {
        if (!ayah) return;
        
        // If already playing, pause instead of trying to load a new audio source
        if (isPlaying && audio) {
            pauseAudio();
            return;
        }
        
        try {
            // Check if we need to parse the audio_urls JSON string
            const audioUrls = typeof ayah.audio_urls === 'string' 
                ? JSON.parse(ayah.audio_urls) 
                : ayah.audio_urls;
            
            // Validate that audioUrls is an object    
            if (audioUrls && typeof audioUrls === 'object') {
                // Check if selected qari exists in the audio_urls
                if (audioUrls[selectedQari]) {
                    playAudio(audioUrls[selectedQari]);
                } else {
                    // If selected qari not found, try to play the first available audio
                    const firstQariKey = Object.keys(audioUrls)[0];
                    if (firstQariKey && audioUrls[firstQariKey]) {
                        // Auto-select the first qari
                        setSelectedQari(firstQariKey);
                        playAudio(audioUrls[firstQariKey]);
                    } else {
                        console.warn('No audio available for this ayah');
                    }
                }
            } else if (ayah.audio_url) {
                // Fallback to audio_url if available
                playAudio(ayah.audio_url);
            } else {
                console.warn('No audio available for this ayah');
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };
    
    const playAudio = (audioUrl) => {
        // If we have current audio and it's the same URL, toggle play/pause
        if (audio && audio.src === audioUrl) {
            if (isPlaying) {
                pauseAudio(); // Use dedicated function
                return;
            } else {
                resumeAudio(); // Use dedicated function
                return;
            }
        }
        
        // Stop any existing audio
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
        
        // Check if we have a valid URL
        if (!audioUrl) {
            console.error('URL audio tidak ditemukan');
            return;
        }
        
        createNewAudio();
        
        function createNewAudio() {
            const newAudio = new Audio(audioUrl);
            newAudio.addEventListener('ended', () => setIsPlaying(false));
            newAudio.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
                
                // Show more specific error messages
                const errorMessages = {
                    1: 'Permintaan audio dibatalkan',
                    2: 'Kesalahan jaringan',
                    3: 'Audio tidak dapat diproses',
                    4: 'Format audio tidak didukung'
                };
                
                const errorMessage = errorMessages[e.target?.error?.code] || 'Gagal memutar audio';
                console.warn(`${errorMessage}. Coba pilih Qari lain.`);
            });
            
            // Preload the audio
            newAudio.load();
            
            const playPromise = newAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setAudio(newAudio);
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to play audio:', err);
                        setIsPlaying(false);
                    });
            }
        }
    };
    
    const handleNext = () => {
        // Check if this is the last ayah in the surah
        if (ayah && ayah.surah && ayah.ayah_number < ayah.surah.total_ayahs) {
            navigate(`/ayah/${surahNumber}/${parseInt(ayahNumber) + 1}`);
        } else {
            // Move to the next surah
            navigate(`/surah/${parseInt(surahNumber) + 1}`);
        }
    };
    
    const handlePrevious = () => {
        if (ayah && ayah.ayah_number > 1) {
            navigate(`/ayah/${surahNumber}/${parseInt(ayahNumber) - 1}`);
        } else if (parseInt(surahNumber) > 1) {
            // Need to get the total ayahs of the previous surah
            fetch(`/api/surahs/${parseInt(surahNumber) - 1}`)
                .then(response => response.json())
                .then(data => {
                    navigate(`/ayah/${parseInt(surahNumber) - 1}/${data.total_ayahs}`);
                });
        }
    };
    
    // Keyboard shortcuts for audio control
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Space bar to toggle play/pause
            if (event.code === 'Space' && !event.target.matches('input, textarea, [contenteditable]')) {
                event.preventDefault();
                handlePlayAudio();
            }
            // Arrow keys for navigation
            else if (event.code === 'ArrowLeft') {
                event.preventDefault();
                handlePrevious();
            }
            else if (event.code === 'ArrowRight') {
                event.preventDefault();
                handleNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [ayah]);
    
    // Dedicated pause function
    const pauseAudio = () => {
        if (audio && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
    };

    // Dedicated resume function
    const resumeAudio = () => {
        if (audio && !isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to resume audio:', err);
                    });
            }
        }
    };

    // Cleanup effect for audio
    useEffect(() => {
        return () => {
            if (audio) {
                audio.pause();
                setAudio(null);
                setIsPlaying(false);
            }
        };
    }, [audio]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }
    
    if (error || !ayah) {
        return (
            <div className="bg-accent-50 text-accent-700 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error || 'Ayat tidak ditemukan'}</span>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                
                {/* Main Ayah Display */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-green-100">
                    
                    {/* Navigation links */}
                    <div className="flex items-center mb-4">
                        <Link 
                            to="/"
                            className="flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Daftar Surah
                        </Link>
                        {ayah && ayah.surah && (
                            <>
                                <span className="mx-2 text-gray-400">/</span>
                                <Link 
                                    to={`/surah/${surahNumber}`}
                                    className="flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    {ayah.surah.name_simple || `Surah ${surahNumber}`}
                                </Link>
                                <span className="mx-2 text-gray-400">/</span>
                                <Link 
                                    to={`/surah/${surahNumber}#ayah-${ayahNumber}`}
                                    className="flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    Lihat di Surah
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* Font Size Controls */}
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <button 
                                onClick={() => setFontSize(prev => Math.max(2, prev - 0.5))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                title="Perkecil"
                            >
                                −
                            </button>
                            <span className="text-sm px-2">{fontSize.toFixed(1)}rem</span>
                            <button 
                                onClick={() => setFontSize(prev => Math.min(8, prev + 0.5))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                title="Perbesar"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    {/* Arabic Text */}
                    <div className="bg-green-50 rounded-2xl p-8 mb-6 text-center">
                        <p 
                            className="font-arabic text-green-800 leading-loose"
                            style={{ 
                                fontSize: `${fontSize}rem`,
                                lineHeight: '2'
                            }}
                            dir="rtl"
                        >
                            {ayah.text_arabic}
                        </p>
                    </div>
                    
                    {/* Indonesian Translation */}
                    <div className="text-center mb-6">
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {ayah.text_indonesian ? 
                                ayah.text_indonesian.replace(/<[^>]*>/g, '') : 
                                'Terjemahan tidak tersedia'
                            }
                        </p>
                        {ayah.text_latin && (
                            <p className="text-gray-600 italic text-sm mt-2">
                                {ayah.text_latin}
                            </p>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button 
                            onClick={handlePlayAudio}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            disabled={!ayah.audio_url && !ayah.audio_urls}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                {isPlaying ? (
                                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                ) : (
                                    <path d="M8 5v14l11-7z"/>
                                )}
                            </svg>
                            {isPlaying ? 'Jeda' : 'Putar'}
                        </button>
                        
                        <button 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                            Tandai
                        </button>
                        
                        <button 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            Favoritkan
                        </button>
                    </div>
                    
                    {/* Tafsir Section */}
                    {ayah.tafsir && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowTafsir(!showTafsir)}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <span>Tampilkan Tafsir</span>
                                <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    className={`transform transition-transform ${showTafsir ? 'rotate-180' : ''}`}
                                >
                                    <path d="M6 9l6 6 6-6"/>
                                </svg>
                            </button>
                            
                            {showTafsir && (
                                <div className="mt-4 p-6 bg-gray-50 rounded-xl">
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {ayah.tafsir}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Audio Controls */}
                <div className="flex justify-center items-center">
                    <div className="flex flex-col items-center gap-3">
                        {/* Play Controls */}
                        <button 
                            onClick={handlePlayAudio}
                            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors text-white shadow-md"
                            disabled={!ayah.audio_url && !ayah.audio_urls}
                        >
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>
                        
                        {/* Qari Selection Dropdown */}
                        {qariOptions.length > 0 && (
                            <div className="relative" ref={qariDropdownRef}>
                                <button 
                                    onClick={() => setIsQariDropdownOpen(!isQariDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Pilih Qari"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="max-w-24 truncate">
                                        {qariOptions.find(q => q.id === selectedQari)?.name || 'Pilih Qari'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isQariDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {isQariDropdownOpen && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 max-h-60 overflow-y-auto">
                                        {qariOptions.map((qari) => (
                                            <button
                                                key={qari.id}
                                                onClick={() => handleQariSelection(qari.id)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                    selectedQari === qari.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                                {qari.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Audio Status */}
                        {isPlaying ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                <span>Sedang Diputar</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700">
                                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                                <span>Dijeda</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AyahPage;
