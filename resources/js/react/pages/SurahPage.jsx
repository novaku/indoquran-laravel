// filepath: /Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/SurahPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoChevronDownOutline, IoChevronUpOutline, IoInformationCircleOutline, IoBookmarkOutline, IoBookmark, IoHeartOutline, IoHeart, IoChevronDownSharp, IoLinkOutline, IoCloseOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import { fetchFootnote } from '../services/FootnoteService';
import { toggleBookmark, toggleFavorite, getBookmarkStatus } from '../services/BookmarkService';

function SurahPage({ user }) {
    const { number } = useParams();
    const [surah, setSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(1);
    const [fontSize, setFontSize] = useState(4); // Font size for Arabic text (in rem)
    const [showTafsir, setShowTafsir] = useState(false); // State to control tafsir visibility
    const [activeFootnote, setActiveFootnote] = useState(null); // Track active footnote
    const [footnoteContent, setFootnoteContent] = useState(''); // Store footnote content
    const [isLoadingFootnote, setIsLoadingFootnote] = useState(false); // Track loading state for footnotes
    const [tooltipContent, setTooltipContent] = useState({}); // Store tooltip content for footnotes
    const [showTooltip, setShowTooltip] = useState(null); // Track which footnote tooltip is shown
    const [bookmarkStatuses, setBookmarkStatuses] = useState({}); // Store bookmark statuses for ayahs
    const [bookmarkLoading, setBookmarkLoading] = useState({}); // Track bookmark loading states
    const [toast, setToast] = useState(null); // Toast notification state
    const [selectedQari, setSelectedQari] = useState('01'); // Default to first qari (numeric ID)
    const [qariOptions, setQariOptions] = useState([]); // Available Qaris
    const [isQariDropdownOpen, setIsQariDropdownOpen] = useState(false); // Dropdown state
    const [surahAudio, setSurahAudio] = useState(null); // Surah audio player
    const [isSurahPlaying, setIsSurahPlaying] = useState(false); // Surah audio playing state
    const [surahCurrentTime, setSurahCurrentTime] = useState(0); // Current time of surah audio
    const [surahDuration, setSurahDuration] = useState(0); // Duration of surah audio
    const tafsirRef = useRef(null); // Reference to tafsir section for scrolling
    const qariDropdownRef = useRef(null); // Reference for qari dropdown
    
    useEffect(() => {
        setLoading(true);
        fetch(`/api/surahs/${number}`)
            .then(res => res.json())
            .then((response) => {
                if (response.status === 'success') {
                    setSurah(response.data.surah);
                    setAyahs(response.data.ayahs);
                } else {
                    setError("Gagal memuat data surah");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [number]);

    // Load bookmark statuses for all ayahs when user is logged in and ayahs are loaded
    useEffect(() => {
        if (user && ayahs.length > 0) {
            const ayahIds = ayahs.map(ayah => ayah.id);
            getBookmarkStatus(ayahIds)
                .then(statuses => {
                    setBookmarkStatuses(statuses);
                })
                .catch(error => {
                    console.error('Failed to load bookmark statuses:', error);
                });
        }
    }, [user, ayahs]);
    
    // Extract qari options from the first ayah's audio_urls
    useEffect(() => {
        if (ayahs.length > 0 && ayahs[0].audio_urls) {
            try {
                const audioUrls = typeof ayahs[0].audio_urls === 'string' 
                    ? JSON.parse(ayahs[0].audio_urls) 
                    : ayahs[0].audio_urls;
                
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
                            "05": "Misyari Rasyid Al-Afasi",
                            // Add more mappings as needed
                        };
                        
                        // Use mapping if available, otherwise use "Qari #X" format
                        return {
                            id: key,
                            name: qariNames[key] || `Qari #${parseInt(key, 10)}`
                        };
                    } else {
                        // For named keys (like "husary", "sudais"), capitalize first letter
                        return {
                            id: key,
                            name: key.charAt(0).toUpperCase() + key.slice(1)
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
    }, [ayahs, selectedQari]);
    
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
    
    // Keyboard shortcuts for audio control
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Space bar to toggle play/pause
            if (event.code === 'Space' && !event.target.matches('input, textarea, [contenteditable]')) {
                event.preventDefault();
                handlePlayClick();
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
    }, [currentVerseIndex, ayahs.length]); // Dependencies for navigation
    
    // Cleanup effect for audio
    useEffect(() => {
        return () => {
            if (currentAudio) {
                // First remove event listeners to prevent memory leaks
                currentAudio.onended = null;
                currentAudio.onerror = null;
                currentAudio.onstalled = null;
                
                // Then pause the audio
                currentAudio.pause();
                
                // Finally reset states
                setCurrentAudio(null);
                setIsPlaying(false);
                setActiveAyah(null);
            }
            
            // Cleanup surah audio as well
            if (surahAudio) {
                surahAudio.onended = null;
                surahAudio.onerror = null;
                surahAudio.ontimeupdate = null;
                surahAudio.onloadedmetadata = null;
                surahAudio.pause();
                setSurahAudio(null);
                setIsSurahPlaying(false);
            }
        };
    }, [currentAudio, surahAudio]);
    
    const playAudio = (audioUrl, ayahId) => {
        // Handle case where we're trying to toggle play/pause for the same ayah
        if (currentAudio && activeAyah === ayahId) {
            if (isPlaying) {
                // Pause current audio if it's playing
                currentAudio.pause();
                setIsPlaying(false);
                // Keep activeAyah to remember which ayah was paused
                return;
            }
            
            // If it's paused and we want to resume the same audio
            try {
                // Try to resume playback
                const playPromise = currentAudio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch(err => {
                            console.error('Failed to resume audio:', err);
                            // If resuming fails, create a new audio instance
                            createAndPlayNewAudio();
                        });
                }
                return;
            } catch (err) {
                console.error('Error resuming audio:', err);
                // Fall through to create a new audio instance
            }
        }
        
        // Clean up any existing audio before creating a new one
        if (currentAudio) {
            const oldAudio = currentAudio;
            // First remove event listeners to prevent them from firing during cleanup
            oldAudio.onended = null;
            oldAudio.onerror = null;
            oldAudio.onstalled = null;
            
            // Reset states before pausing to avoid race conditions
            setCurrentAudio(null);
            setIsPlaying(false);
            setActiveAyah(null);
            
            // Now pause the audio
            oldAudio.pause();
            
            // Small delay before creating a new audio instance to ensure clean separation
            setTimeout(createAndPlayNewAudio, 50);
        } else {
            createAndPlayNewAudio();
        }
        
        function createAndPlayNewAudio() {
            if (!audioUrl) {
                showToast('Audio tidak tersedia', 'error');
                return;
            }
            
            const audio = new Audio(audioUrl);
            
            // Add event listeners
            audio.onended = () => {
                setIsPlaying(false);
                setActiveAyah(null);
            };
            
            // Enhanced error handling
            audio.onerror = (e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
                setActiveAyah(null);
                
                // Show more specific error messages based on error code
                const errorMessages = {
                    1: 'Permintaan audio dibatalkan',
                    2: 'Kesalahan jaringan',
                    3: 'Audio tidak dapat diproses',
                    4: 'Format audio tidak didukung'
                };
                
                const errorMessage = errorMessages[e.target.error?.code] || 'Gagal memutar audio';
                showToast(`${errorMessage}. Coba pilih Qari lain.`, 'error');
            };
            
            // Handle other errors during playback
            audio.onstalled = () => {
                console.warn('Audio playback stalled');
                showToast('Pemutaran audio terhenti. Mencoba lagi...', 'warning');
            };
            
            // First set the audio object in state
            setCurrentAudio(audio);
            setActiveAyah(ayahId);
            
            // Then start playing with better error handling
            // Using the load method before play can help with some browser issues
            audio.load();
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to play audio:', err);
                        setIsPlaying(false);
                        setActiveAyah(null);
                        setCurrentAudio(null);
                        showToast('Gagal memutar audio. Silakan coba lagi atau pilih Qari lain.', 'error');
                    });
            }
        }
    };

    // Dedicated pause function
    const pauseAudio = () => {
        if (currentAudio && isPlaying) {
            currentAudio.pause();
            setIsPlaying(false);
        }
    };

    // Dedicated resume function
    const resumeAudio = () => {
        if (currentAudio && !isPlaying) {
            const playPromise = currentAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to resume audio:', err);
                        showToast('Gagal melanjutkan audio', 'error');
                    });
            }
        }
    };

    // Stop audio completely
    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setIsPlaying(false);
            setActiveAyah(null);
        }
    };

    // Surah audio functions
    const playSurahAudio = (audioUrl) => {
        if (!audioUrl) {
            showToast('URL audio surah tidak ditemukan', 'error');
            return;
        }

        // If we have current surah audio and it's the same URL, toggle play/pause
        if (surahAudio && surahAudio.src === audioUrl) {
            if (isSurahPlaying) {
                surahAudio.pause();
                setIsSurahPlaying(false);
                return;
            } else {
                // Resume playback
                const playPromise = surahAudio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsSurahPlaying(true);
                        })
                        .catch(err => {
                            console.error('Failed to resume surah audio:', err);
                            createNewSurahAudio();
                        });
                }
                return;
            }
        }

        // Stop any existing audio (both ayah and surah audio)
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
            setIsPlaying(false);
            setActiveAyah(null);
        }
        
        if (surahAudio) {
            surahAudio.pause();
            setSurahAudio(null);
            setIsSurahPlaying(false);
        }

        createNewSurahAudio();

        function createNewSurahAudio() {
            const audio = new Audio(audioUrl);
            
            // Add event listeners
            audio.onended = () => {
                setIsSurahPlaying(false);
            };
            
            audio.onerror = (e) => {
                console.error('Surah audio playback error:', e);
                setIsSurahPlaying(false);
                
                const errorMessages = {
                    1: 'Permintaan audio dibatalkan',
                    2: 'Kesalahan jaringan',
                    3: 'Audio tidak dapat diproses',
                    4: 'Format audio tidak didukung'
                };
                
                const errorMessage = errorMessages[e.target.error?.code] || 'Gagal memutar audio surah';
                showToast(`${errorMessage}. Coba pilih Qari lain.`, 'error');
            };

            // Update time and duration
            audio.ontimeupdate = () => {
                setSurahCurrentTime(audio.currentTime);
            };

            audio.onloadedmetadata = () => {
                setSurahDuration(audio.duration);
            };
            
            // Set the audio object in state
            setSurahAudio(audio);
            
            // Start playing
            audio.load();
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsSurahPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to play surah audio:', err);
                        setIsSurahPlaying(false);
                        setSurahAudio(null);
                        showToast('Gagal memutar audio surah. Silakan coba lagi atau pilih Qari lain.', 'error');
                    });
            }
        }
    };

    const stopSurahAudio = () => {
        if (surahAudio) {
            surahAudio.pause();
            surahAudio.currentTime = 0;
            setIsSurahPlaying(false);
            setSurahCurrentTime(0);
        }
    };

    const handleSurahPlayClick = () => {
        if (!surah || !surah.audio_urls) {
            showToast('Audio surah tidak tersedia', 'warning');
            return;
        }

        try {
            // Parse audio URLs
            const audioUrls = typeof surah.audio_urls === 'string' 
                ? JSON.parse(surah.audio_urls) 
                : surah.audio_urls;
            
            if (audioUrls && typeof audioUrls === 'object') {
                // Check if selected qari exists
                if (audioUrls[selectedQari]) {
                    playSurahAudio(audioUrls[selectedQari]);
                } else {
                    // Try first available qari
                    const firstQariKey = Object.keys(audioUrls)[0];
                    if (firstQariKey && audioUrls[firstQariKey]) {
                        setSelectedQari(firstQariKey);
                        playSurahAudio(audioUrls[firstQariKey]);
                    } else {
                        showToast('Audio surah untuk qari ini tidak tersedia', 'warning');
                    }
                }
            } else {
                showToast('Audio surah tidak tersedia', 'warning');
            }
        } catch (error) {
            console.error('Error playing surah audio:', error);
            showToast('Gagal memutar audio surah', 'error');
        }
    };

    // Format time helper
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerseChange = (index) => {
        setCurrentVerseIndex(index);
        // Reset footnote state when changing verses
        setActiveFootnote(null);
        setFootnoteContent('');
        setShowTooltip(null);
        scrollToArabicText();
    };
    
    const handlePlayClick = () => {
        const currentAyah = ayahs[currentVerseIndex - 1];
        if (!currentAyah) return;
        
        // If already playing this ayah, just pause it instead of calling playAudio
        if (isPlaying && activeAyah === currentAyah.id && currentAudio) {
            pauseAudio(); // Direct pause to avoid URL check
            return;
        }
        
        try {
            // Check if we need to parse the audio_urls JSON string
            const audioUrls = typeof currentAyah.audio_urls === 'string' 
                ? JSON.parse(currentAyah.audio_urls) 
                : currentAyah.audio_urls;
            
            // Validate that audioUrls is an object    
            if (audioUrls && typeof audioUrls === 'object') {
                // Check if selected qari exists in the audio_urls
                if (audioUrls[selectedQari]) {
                    playAudio(audioUrls[selectedQari], currentAyah.id);
                } else {
                    // If selected qari not found, try to play the first available audio
                    const firstQariKey = Object.keys(audioUrls)[0];
                    if (firstQariKey && audioUrls[firstQariKey]) {
                        // Auto-select the first qari
                        setSelectedQari(firstQariKey);
                        playAudio(audioUrls[firstQariKey], currentAyah.id);
                    } else {
                        showToast('Audio untuk qari ini tidak tersedia', 'warning');
                    }
                }
            } else if (currentAyah.audio_url) {
                // Fallback to audio_url if available
                playAudio(currentAyah.audio_url, currentAyah.id);
            } else {
                showToast('Audio tidak tersedia untuk ayat ini', 'warning');
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            showToast('Gagal memutar audio', 'error');
        }
    };
    
    const scrollToArabicText = () => {
        // Add delay to ensure the DOM has updated with the new verse
        setTimeout(() => {
            const arabicTextElement = document.getElementById('ayah-arabic-text');
            if (arabicTextElement) {
                arabicTextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };
    
    const handlePrevious = () => {
        if (currentVerseIndex > 1) {
            setCurrentVerseIndex(currentVerseIndex - 1);
            // Reset footnote state
            setActiveFootnote(null);
            setFootnoteContent('');
            setShowTooltip(null);
            scrollToArabicText();
        }
    };
    
    const handleNext = () => {
        if (currentVerseIndex < ayahs.length) {
            setCurrentVerseIndex(currentVerseIndex + 1);
            // Reset footnote state
            setActiveFootnote(null);
            setFootnoteContent('');
            setShowTooltip(null);
            scrollToArabicText();
        }
    };
    
    // Handle qari selection
    const handleQariSelection = (qariId) => {
        setSelectedQari(qariId);
        setIsQariDropdownOpen(false);
        
        // If currently playing ayah audio, restart with new qari
        if (isPlaying) {
            handlePlayClick();
        }
        
        // If currently playing surah audio, restart with new qari
        if (isSurahPlaying) {
            handleSurahPlayClick();
        }
    };
    
    // Font size adjustment functions
    const increaseFontSize = () => {
        if (fontSize < 8) { // Maximum font size limit
            setFontSize(prevSize => prevSize + 0.5);
        }
    };
    
    const decreaseFontSize = () => {
        if (fontSize > 2) { // Minimum font size limit
            setFontSize(prevSize => prevSize - 0.5);
        }
    };
    
    const resetFontSize = () => {
        setFontSize(4); // Reset to default font size
    };
    
    // Toggle tafsir visibility
    const toggleTafsir = () => {
        setShowTafsir(!showTafsir);
        // Reset active footnote when hiding tafsir
        if (showTafsir) {
            setActiveFootnote(null);
            setFootnoteContent('');
            setShowTooltip(null);
        }
    };
    
    // Function to handle footnote click
    const handleFootnoteClick = async (footnoteId) => {
        setActiveFootnote(footnoteId);
        setShowTafsir(true); // Show tafsir when footnote is clicked
        
        // Start loading footnote
        setIsLoadingFootnote(true);
        
        try {
            // Fetch footnote content using the service
            const content = await fetchFootnote(footnoteId);
            setFootnoteContent(content);
        } catch (error) {
            console.error('Error fetching footnote:', error);
            setFootnoteContent(`Tidak dapat memuat catatan kaki #${footnoteId}`);
        } finally {
            setIsLoadingFootnote(false);
        }
        
        // Scroll to tafsir section after a short delay to ensure it's visible
        setTimeout(() => {
            if (tafsirRef.current) {
                tafsirRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };
    
    // Function to handle tooltip hover
    const handleFootnoteHover = async (footnoteId) => {
        setShowTooltip(footnoteId);
        
        // Check if we already have the tooltip content
        if (!tooltipContent[footnoteId]) {
            try {
                // Fetch footnote content using the service
                const content = await fetchFootnote(footnoteId);
                setTooltipContent(prev => ({
                    ...prev,
                    [footnoteId]: content
                }));
            } catch (error) {
                console.error('Error fetching footnote for tooltip:', error);
                setTooltipContent(prev => ({
                    ...prev,
                    [footnoteId]: `Tidak dapat memuat catatan kaki #${footnoteId}`
                }));
            }
        }
    };
    
    // Parse text with footnotes and return with clickable links
    const renderTextWithFootnotes = (text) => {
        if (!text) return '';
        
        // Split the text by the footnote tags
        const parts = text.split(/(<sup\s+foot_note=\d+>\d+<\/sup>)/g);
        
        return parts.map((part, index) => {
            // Check if this part is a footnote
            const footnoteMatch = part.match(/<sup\s+foot_note=(\d+)>(\d+)<\/sup>/);
            if (footnoteMatch) {
                const footnoteId = footnoteMatch[1];
                const footnoteNumber = footnoteMatch[2];
                
                return (
                    <sup 
                        key={index} 
                        className="cursor-pointer text-primary-600 ml-0.5 relative"
                        onMouseEnter={() => handleFootnoteHover(footnoteId)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <button
                            onClick={() => handleFootnoteClick(footnoteId)}
                            className={`px-1 py-0.5 rounded-md text-xs ${
                                activeFootnote === footnoteId 
                                ? 'bg-primary-500 text-white font-bold shadow-sm' 
                                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                            }`}
                            aria-label={`Catatan Kaki ${footnoteNumber}, klik untuk melihat tafsir`}
                            title={`Catatan Kaki #${footnoteId}`}
                        >
                            {footnoteNumber}
                        </button>
                        
                        {/* Tooltip */}
                        {showTooltip === footnoteId && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 z-50">
                                <div className="text-primary-800 font-medium mb-1 text-xs">
                                    Catatan Kaki #{footnoteId}:
                                </div>
                                <div className="text-primary-700 text-xs leading-relaxed">
                                    {tooltipContent[footnoteId] || 
                                    <span className="flex items-center">
                                        <span className="w-3 h-3 border-t border-r border-primary-500 rounded-full animate-spin mr-1"></span>
                                        Memuat...
                                    </span>}
                                </div>
                                <div className="text-center mt-1 text-xs text-primary-500">
                                    Klik untuk melihat di tafsir
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -ml-1.5 -bottom-1.5"></div>
                            </div>
                        )}
                    </sup>
                );
            }
            return part;
        });
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    // Handle go to ayah button - generates URL and copies to clipboard
    const handleGoToAyah = () => {
        if (!currentAyah) return;
        
        const ayahUrl = `${window.location.origin}/ayah/${number}/${currentVerseIndex}`;
        
        // Open the URL in a new tab
        window.open(ayahUrl, '_blank');
        showToast('Link ayat dibuka di tab baru', 'info');
    };

    // Handle bookmark toggle
    const handleBookmarkToggle = async (ayahId) => {
        if (!user) {
            showToast('Silakan login untuk menyimpan bookmark', 'warning');
            return;
        }

        setBookmarkLoading(prev => ({ ...prev, [ayahId]: true }));
        
        try {
            const response = await toggleBookmark(ayahId);
            if (response.status === 'success') {
                setBookmarkStatuses(prev => ({
                    ...prev,
                    [ayahId]: {
                        ...prev[ayahId],
                        is_bookmarked: response.data.is_bookmarked,
                        is_favorite: response.data.is_favorite
                    }
                }));
                
                const message = response.data.is_bookmarked 
                    ? 'Ayat berhasil ditambahkan ke bookmark' 
                    : 'Ayat berhasil dihapus dari bookmark';
                showToast(message, 'success');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            showToast('Gagal menyimpan bookmark', 'error');
        } finally {
            setBookmarkLoading(prev => ({ ...prev, [ayahId]: false }));
        }
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (ayahId) => {
        if (!user) {
            showToast('Silakan login untuk menyimpan favorit', 'warning');
            return;
        }

        setBookmarkLoading(prev => ({ ...prev, [ayahId]: true }));
        
        try {
            const response = await toggleFavorite(ayahId);
            if (response.status === 'success') {
                setBookmarkStatuses(prev => ({
                    ...prev,
                    [ayahId]: {
                        ...prev[ayahId],
                        is_bookmarked: response.data.is_bookmarked,
                        is_favorite: response.data.is_favorite
                    }
                }));
                
                const message = response.data.is_favorite 
                    ? 'Ayat berhasil ditambahkan ke favorit' 
                    : 'Ayat berhasil dihapus dari favorit';
                showToast(message, 'success');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Gagal menyimpan favorit', 'error');
        } finally {
            setBookmarkLoading(prev => ({ ...prev, [ayahId]: false }));
        }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }
    
    if (error || !surah) {
        return (
            <div className="bg-accent-50 border-l-4 border-accent-500 text-accent-700 p-4 rounded-lg shadow-islamic" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error || 'Surah tidak ditemukan'}</span>
            </div>
        );
    }
    
    const currentAyah = ayahs.length > 0 ? ayahs[currentVerseIndex - 1] : null;
    const progressPercentage = (currentVerseIndex / ayahs.length) * 100;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            {/* Main Container */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                
                {/* Bismillah Header */}
                <div className="text-center mb-6">
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-8 border-4 border-double border-amber-300 overflow-hidden">
                        {/* Decorative corner elements */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-amber-400 rounded-tl-lg"></div>
                        <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-amber-400 rounded-tr-lg"></div>
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-amber-400 rounded-bl-lg"></div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-amber-400 rounded-br-lg"></div>
                        
                        {/* Inner decorative border */}
                        <div className="absolute inset-4 border-2 border-dotted border-amber-300 rounded-2xl opacity-60"></div>
                        
                        {/* Top and bottom decorative elements */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-b from-amber-400 to-transparent rounded-b-full opacity-70"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-t from-amber-400 to-transparent rounded-t-full opacity-70"></div>
                        
                        <div className="relative z-10">
                            <p className="font-arabic text-4xl text-amber-800 mb-3 drop-shadow-sm" dir="rtl">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                            </p>
                            <p className="text-sm text-amber-700 font-medium">
                                Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Surah Information - Compact */}
                <div className="text-center mb-6">
                    <h1 className="text-lg font-semibold text-gray-700 mb-1">
                        {surah.name_indonesian} • {surah.name_latin}
                    </h1>
                    <div className="text-sm text-gray-500 mb-2">
                        Surah {surah.number} • {ayahs.length} Ayat • {surah.revelation_place}
                    </div>
                    <div className="text-xs text-gray-400">
                        <span>⌨️ Pintasan: </span>
                        <span className="bg-gray-100 px-1 rounded">Spasi</span> untuk play/pause • 
                        <span className="bg-gray-100 px-1 rounded ml-1">←</span> sebelumnya • 
                        <span className="bg-gray-100 px-1 rounded ml-1">→</span> selanjutnya
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span>Ayat {currentVerseIndex} dari {ayahs.length}</span>
                        <span>{Math.round(progressPercentage)}% selesai</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-600 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Surah Audio Player */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                Audio Surah Lengkap
                            </h3>
                            
                            {/* Qari Dropdown for Surah */}
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
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 max-h-60 overflow-y-auto">
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
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatTime(surahCurrentTime)} / {formatTime(surahDuration)}
                        </div>
                    </div>
                    
                    {/* Audio Progress Bar */}
                    <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                             onClick={(e) => {
                                 if (surahAudio && surahDuration > 0) {
                                     const rect = e.currentTarget.getBoundingClientRect();
                                     const clickX = e.clientX - rect.left;
                                     const percentage = clickX / rect.width;
                                     const newTime = percentage * surahDuration;
                                     surahAudio.currentTime = newTime;
                                     setSurahCurrentTime(newTime);
                                 }
                             }}>
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                                style={{ width: `${surahDuration > 0 ? (surahCurrentTime / surahDuration) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <button 
                            onClick={handleSurahPlayClick}
                            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors text-white shadow-lg"
                            title={isSurahPlaying ? 'Jeda Audio Surah' : 'Putar Audio Surah'}
                        >
                            {isSurahPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>
                        
                        {/* Stop Button - Only show when surah audio is active */}
                        {surahAudio && (
                            <button 
                                onClick={stopSurahAudio}
                                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors text-white shadow-md"
                                title="Hentikan Audio Surah"
                            >
                                <div className="w-4 h-4 bg-white rounded-sm"></div>
                            </button>
                        )}
                    </div>
                    
                    {/* Audio Status */}
                    {surahAudio && (
                        <div className="text-center mt-4">
                            {isSurahPlaying ? (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-lg text-sm text-blue-700">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                    <span>Memutar Surah Lengkap</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                                    <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                                    <span>Audio Surah Dijeda</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            
            {/* Current Verse Display */}
            {currentAyah && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 hover:shadow-xl transition-shadow duration-300">
                    
                    {/* Arabic Text */}
                    <div className="text-center mb-6">
                        <div className="flex justify-end mb-4">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1">
                                <button 
                                    onClick={decreaseFontSize}
                                    className="w-8 h-8 rounded bg-white hover:shadow-md transition-shadow duration-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    title="Perkecil Ukuran"
                                >
                                    <IoRemoveOutline className="text-sm" />
                                </button>
                                <span className="text-xs px-2">{fontSize.toFixed(1)}rem</span>
                                <button 
                                    onClick={increaseFontSize}
                                    className="w-8 h-8 rounded bg-white hover:shadow-md transition-shadow duration-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    title="Perbesar Ukuran"
                                >
                                    <IoAddOutline className="text-sm" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-6 mb-6">
                            {/* Ayah Number */}
                            <div className="flex justify-center mb-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <span>Ayat {currentVerseIndex}</span>
                                </div>
                            </div>
                            
                            <p 
                                id="ayah-arabic-text"
                                className="font-arabic text-green-800 leading-loose text-right"
                                style={{ 
                                    fontSize: `${fontSize}rem`,
                                    lineHeight: '2'
                                }}
                                dir="rtl"
                            >
                                {currentAyah.text_arabic}
                            </p>
                        </div>
                    </div>
                    
                    {/* Translation */}
                    <div className="text-center mb-6">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {currentAyah.text_indonesian ? renderTextWithFootnotes(currentAyah.text_indonesian) : ''}
                        </p>
                    </div>
                    
                    {/* Transliteration */}
                    <div className="text-center mb-6">
                        <p className="text-gray-600 italic">
                            {currentAyah.text_latin || '(Transliterasi tidak tersedia)'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {user && (
                        <div className="flex justify-center gap-3 mb-6">
                            <button
                                onClick={() => handleBookmarkToggle(currentAyah.id)}
                                disabled={bookmarkLoading[currentAyah.id]}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300 ${
                                    bookmarkStatuses[currentAyah.id]?.is_bookmarked
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {bookmarkLoading[currentAyah.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : bookmarkStatuses[currentAyah.id]?.is_bookmarked ? (
                                    <IoBookmark className="text-lg" />
                                ) : (
                                    <IoBookmarkOutline className="text-lg" />
                                )}
                                <span className="text-sm">
                                    {bookmarkStatuses[currentAyah.id]?.is_bookmarked ? 'Ditandai' : 'Tandai'}
                                </span>
                            </button>
                            
                            <button
                                onClick={() => handleFavoriteToggle(currentAyah.id)}
                                disabled={bookmarkLoading[currentAyah.id]}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300 ${
                                    bookmarkStatuses[currentAyah.id]?.is_favorite
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {bookmarkLoading[currentAyah.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : bookmarkStatuses[currentAyah.id]?.is_favorite ? (
                                    <IoHeart className="text-lg" />
                                ) : (
                                    <IoHeartOutline className="text-lg" />
                                )}
                                <span className="text-sm">
                                    {bookmarkStatuses[currentAyah.id]?.is_favorite ? 'Difavoritkan' : 'Favoritkan'}
                                </span>
                            </button>
                        </div>
                    )}
                    
                    {/* Tafsir Toggle */}
                    <div className="text-center mb-4">
                        <button
                            onClick={toggleTafsir}
                            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 mx-auto"
                        >
                            {showTafsir ? (
                                <>
                                    <span>Sembunyikan Tafsir</span>
                                    <IoChevronUpOutline />
                                </>
                            ) : (
                                <>
                                    <span>Tampilkan Tafsir</span>
                                    <IoChevronDownOutline />
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Tafsir Content */}                        {showTafsir && currentAyah.tafsir && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                                <h4 className="font-medium text-gray-800 mb-2">Tafsir</h4>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {currentAyah.tafsir || '(Tafsir tidak tersedia)'}
                            </p>                                {activeFootnote && (
                                    <div className="mt-4 p-3 bg-yellow-50 rounded hover:shadow-md transition-shadow duration-300">
                                        <h5 className="font-medium text-yellow-800 mb-1">Catatan Kaki #{activeFootnote}</h5>
                                    {isLoadingFootnote ? (
                                        <div className="flex items-center gap-2 py-2">
                                            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-yellow-700 text-sm">Memuat catatan kaki...</span>
                                        </div>
                                    ) : (
                                        <p className="text-yellow-700 text-sm">
                                            {footnoteContent}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            )}
            
            {/* Navigation Controls */}
            <div className="flex justify-between items-center mb-6 bg-white rounded-xl shadow-sm p-4 hover:shadow-lg transition-shadow duration-300">
                <button 
                    onClick={handlePrevious}
                    disabled={currentVerseIndex <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IoArrowBackOutline className="text-lg" /> 
                    <span>Sebelumnya</span>
                </button>
                
                <div className="flex flex-col items-center gap-3">
                    {/* Play Button */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePlayClick}
                            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors text-white shadow-md"
                            title={isPlaying && activeAyah === currentAyah?.id ? 'Jeda Audio' : 'Putar Audio'}
                        >
                            {isPlaying && activeAyah === currentAyah?.id ? (
                                <IoPauseCircleOutline className="text-2xl" />
                            ) : (
                                <IoPlayCircleOutline className="text-2xl" />
                            )}
                        </button>
                        
                        {/* Go to Ayah Button */}
                        <button 
                            onClick={handleGoToAyah}
                            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors text-white shadow-md"
                            title="Buka ayat di tab baru"
                        >
                            <IoLinkOutline className="text-xl" />
                        </button>
                        
                        {/* Stop Button - Only show when audio is active */}
                        {(isPlaying || activeAyah) && (
                            <button 
                                onClick={stopAudio}
                                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors text-white shadow-md"
                                title="Hentikan Audio"
                            >
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                            </button>
                        )}
                    </div>
                    
                    {/* Audio Status */}
                    {activeAyah === currentAyah?.id && (
                        <div className="text-center">
                            {isPlaying ? (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700 hover:shadow-md transition-shadow duration-300">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                    <span>Sedang Diputar</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-700 hover:shadow-md transition-shadow duration-300">
                                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                                    <span>Dijeda</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleNext}
                    disabled={currentVerseIndex >= ayahs.length}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Selanjutnya</span>
                    <IoArrowForwardOutline className="text-lg" />
                </button>
            </div>
            
            {/* Verse Selector Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="grid grid-cols-10 gap-2">
                    {ayahs.map((ayah, index) => {
                        const verseNumber = index + 1;
                        const bookmarkStatus = bookmarkStatuses[ayah.id];
                        const isBookmarked = bookmarkStatus?.is_bookmarked;
                        const isFavorite = bookmarkStatus?.is_favorite;
                        const isCurrent = currentVerseIndex === verseNumber;
                        
                        return (
                            <button 
                                key={verseNumber}
                                onClick={() => handleVerseChange(verseNumber)}
                                className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium hover:shadow-md transition-all duration-300 ${
                                    isCurrent 
                                        ? 'bg-green-600 text-white shadow-md' 
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                                title={`Ayat ${verseNumber}${isBookmarked ? ' (Ditandai)' : ''}${isFavorite ? ' (Difavoritkan)' : ''}`}
                            >
                                <span>{verseNumber}</span>
                                
                                {/* Bookmark indicator */}
                                {isBookmarked && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                        <IoBookmark className="text-white text-xs" />
                                    </div>
                                )}
                                
                                {/* Favorite indicator */}
                                {isFavorite && (
                                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                        <IoHeart className="text-white text-xs" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                
                {/* Legend */}
                <div className="flex justify-center items-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <IoBookmark className="text-white text-xs" />
                        </div>
                        <span>Bookmark</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <IoHeart className="text-white text-xs" />
                        </div>
                        <span>Favorit</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-600 rounded"></div>
                        <span>Saat Ini</span>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`flex items-center p-4 rounded-md shadow-lg ${
                        toast.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
                        toast.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
                        toast.type === 'info' ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' :
                        'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
                    }`}>
                        <div className="mr-3">{toast.message}</div>
                        <button 
                            onClick={() => setToast(null)}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                        >
                            <IoCloseOutline size={20} />
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

export default SurahPage;
