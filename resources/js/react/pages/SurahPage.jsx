// filepath: /Users/novaherdi/Documents/GitHub/indoquran-laravel/resources/js/react/pages/SurahPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoArrowBackOutline, IoArrowForwardOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline, IoChevronDownOutline, IoChevronUpOutline, IoInformationCircleOutline, IoBookmarkOutline, IoBookmark, IoHeartOutline, IoHeart, IoChevronDownSharp, IoCloseOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import { AyahCard } from '../features/quran';
import { fetchFootnote } from '../services/FootnoteService';
import { toggleBookmark, toggleFavorite, getBookmarkStatus } from '../services/BookmarkService';
import { getApiUrl } from '../utils/api';
import { getRoutePath } from '../utils/routes';
import { getAudioUrl } from '../utils/audio';

function SurahPage({ user }) {
    const { number, ayahNumber } = useParams();
    const navigate = useNavigate();
    const [surah, setSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(() => {
        // First check if ayahNumber is provided in URL
        if (ayahNumber) {
            const ayahIndex = parseInt(ayahNumber, 10);
            if (ayahIndex > 0) {
                return ayahIndex;
            }
        }
        // Try to restore from localStorage, fallback to 1
        const saved = localStorage.getItem(`surah-${number}-verse`);
        return saved ? parseInt(saved, 10) : 1;
    });
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
        fetch(getApiUrl(`/api/surahs/${number}`))
            .then(res => res.json())
            .then((response) => {
                if (response.status === 'success') {
                    setSurah(response.data.surah);
                    setAyahs(response.data.ayahs);
                    
                    // Validate current verse index against actual ayah count
                    let indexToSet;
                    if (ayahNumber) {
                        // If ayahNumber is provided in URL, use it
                        const urlAyahIndex = parseInt(ayahNumber, 10);
                        if (urlAyahIndex > 0 && urlAyahIndex <= response.data.ayahs.length) {
                            indexToSet = urlAyahIndex;
                        } else {
                            // Invalid ayah number in URL, default to first ayah
                            indexToSet = 1;
                        }
                    } else {
                        // Use saved index from localStorage
                        const savedIndex = parseInt(localStorage.getItem(`surah-${number}-verse`) || '1', 10);
                        const maxIndex = response.data.ayahs.length;
                        
                        if (savedIndex > maxIndex) {
                            // If saved index is beyond available ayahs, set to last ayah
                            indexToSet = maxIndex;
                        } else if (savedIndex < 1) {
                            // If saved index is invalid, set to first ayah
                            indexToSet = 1;
                        } else {
                            // Use saved index
                            indexToSet = savedIndex;
                        }
                    }
                    
                    setCurrentVerseIndex(indexToSet);
                    localStorage.setItem(`surah-${number}-verse`, indexToSet.toString());
                } else {
                    setError("Gagal memuat data surah");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [number, ayahNumber]);

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
    
    // Save current verse index to localStorage whenever it changes
    useEffect(() => {
        if (currentVerseIndex && number) {
            localStorage.setItem(`surah-${number}-verse`, currentVerseIndex.toString());
        }
    }, [currentVerseIndex, number]);
    
    // Cleanup localStorage for other surahs (optional - keeps storage clean)
    useEffect(() => {
        // Clean up old surah positions (keep only current and a few recent ones)
        const currentKey = `surah-${number}-verse`;
        const allKeys = Object.keys(localStorage);
        const surahKeys = allKeys.filter(key => key.startsWith('surah-') && key.endsWith('-verse'));
        
        // Keep only the 5 most recent surah positions to avoid localStorage bloat
        if (surahKeys.length > 5) {
            const otherKeys = surahKeys.filter(key => key !== currentKey);
            // Remove oldest entries (simple cleanup - in a real app you might want more sophisticated logic)
            otherKeys.slice(0, -4).forEach(key => localStorage.removeItem(key));
        }
    }, [number]);
    
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
                currentAudio.onloadedmetadata = null;
                currentAudio.ontimeupdate = null;
                
                // Then pause and clean up the audio
                try {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                } catch (err) {
                    console.warn('Could not clean up audio properly', err);
                }
                
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
                
                try {
                    surahAudio.pause();
                    surahAudio.currentTime = 0;
                } catch (err) {
                    console.warn('Could not clean up surah audio properly', err);
                }
                
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
            
            // First set state to null to prevent any state updates from affecting a disposed audio object
            setCurrentAudio(null);
            setIsPlaying(false);
            setActiveAyah(null);
            
            // Now remove all event listeners to prevent memory leaks and unintended callbacks
            oldAudio.onended = null;
            oldAudio.onerror = null;
            oldAudio.onstalled = null;
            oldAudio.onloadedmetadata = null;
            oldAudio.ontimeupdate = null;
            
            // Now pause and reset the audio
            oldAudio.pause();
            try {
                oldAudio.currentTime = 0;
            } catch (err) {
                console.warn('Could not reset audio currentTime', err);
            }
            
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
            
            // Use getAudioUrl utility to handle production prefixing
            const processedAudioUrl = getAudioUrl(audioUrl);
            const audio = new Audio(processedAudioUrl);
            
            // Add event listeners
            audio.onended = function onAudioEnded() {
                console.log('Audio ended');
                // Update state to indicate current audio has finished
                setIsPlaying(false);
                setActiveAyah(null);
                
                // No auto-play next ayah - just end the current audio
                console.log('Playback completed');
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
            if (!audioUrl) {
                showToast('URL audio surah tidak ditemukan', 'error');
                return;
            }

            // Use getAudioUrl utility to handle production prefixing
            const processedAudioUrl = getAudioUrl(audioUrl);
            const audio = new Audio(processedAudioUrl);
            
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
                    // Use getAudioUrl utility for production URL handling
                    playSurahAudio(getAudioUrl(audioUrls[selectedQari]));
                } else {
                    // Try first available qari
                    const firstQariKey = Object.keys(audioUrls)[0];
                    if (firstQariKey && audioUrls[firstQariKey]) {
                        setSelectedQari(firstQariKey);
                        // Use getAudioUrl utility for production URL handling
                        playSurahAudio(getAudioUrl(audioUrls[firstQariKey]));
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

    // Function to fetch a specific ayah via AJAX
    const fetchAyah = async (surahId, ayahId) => {
        try {
            // Show loading indicator
            const loadingIndicator = document.getElementById('ayah-loading-indicator');
            if (loadingIndicator) loadingIndicator.style.display = 'flex';
            
            const response = await fetch(getApiUrl(`/api/surahs/${surahId}/ayahs/${ayahId}`));
            if (!response.ok) {
                throw new Error('Failed to fetch ayah');
            }
            const data = await response.json();
            
            if (data.status === 'success') {
                // Get the ayah from the response
                const fetchedAyah = data.data.ayah;
                
                // Update the current verse index
                const ayahIndex = parseInt(ayahId, 10);
                setCurrentVerseIndex(ayahIndex);
                
                // Reset audio and footnote states
                if (currentAudio) {
                    stopAudio();
                }
                setActiveFootnote(null);
                setFootnoteContent('');
                setShowTooltip(null);
                
                // Update URL without page refresh using replaceState
                window.history.replaceState(null, '', `/surah/${surahId}/${ayahId}`);
                // Dispatch a custom event to notify other components about URL change
                window.dispatchEvent(new CustomEvent('urlChange', { detail: { path: `/surah/${surahId}/${ayahId}` } }));
                
                // Save to localStorage
                localStorage.setItem(`surah-${surahId}-verse`, ayahId.toString());
                
                // Update bookmark status if available
                if (data.data.bookmark) {
                    setBookmarkStatuses(prev => ({
                        ...prev,
                        [fetchedAyah.id]: {
                            isBookmarked: true,
                            isFavorite: data.data.bookmark.is_favorite
                        }
                    }));
                }
                
                // Hide loading indicator
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                
                // Scroll to Arabic text after a short delay to ensure DOM updates
                setTimeout(() => scrollToArabicText(), 100);
                
                // Return the ayah data
                return fetchedAyah;
            } else {
                throw new Error(data.message || 'Failed to fetch ayah');
            }
        } catch (error) {
            console.error('Error fetching ayah:', error);
            setError('Failed to load ayah. Please try again later.');
            
            // Hide loading indicator on error
            const loadingIndicator = document.getElementById('ayah-loading-indicator');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            return null;
        }
    };

    const handleVerseChange = (index) => {
        fetchAyah(number, index);
        
        // Auto-play the selected ayah after a short delay
        setTimeout(() => {
            const selectedAyah = ayahs[index - 1];
            if (selectedAyah) {
                try {
                    // Parse audio URLs for the selected ayah
                    const audioUrls = typeof selectedAyah.audio_urls === 'string' 
                        ? JSON.parse(selectedAyah.audio_urls) 
                        : selectedAyah.audio_urls;
                    
                    // Play audio with selected qari using getAudioUrl utility
                    if (audioUrls && typeof audioUrls === 'object' && audioUrls[selectedQari]) {
                        playAudio(getAudioUrl(audioUrls[selectedQari]), selectedAyah.id);
                    } else if (selectedAyah.audio_url) {
                        playAudio(getAudioUrl(selectedAyah.audio_url), selectedAyah.id);
                    } else {
                        showToast('Audio tidak tersedia untuk ayat ini', 'warning');
                    }
                } catch (error) {
                    console.error('Error playing selected ayah:', error);
                    showToast('Gagal memutar ayat', 'error');
                }
            }
        }, 200);
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
                    // Use getAudioUrl utility for production URL handling
                    playAudio(getAudioUrl(audioUrls[selectedQari]), currentAyah.id);
                } else {
                    // If selected qari not found, try to play the first available audio
                    const firstQariKey = Object.keys(audioUrls)[0];
                    if (firstQariKey && audioUrls[firstQariKey]) {
                        // Auto-select the first qari
                        setSelectedQari(firstQariKey);
                        // Use getAudioUrl utility for production URL handling
                        playAudio(getAudioUrl(audioUrls[firstQariKey]), currentAyah.id);
                    } else {
                        showToast('Audio untuk qari ini tidak tersedia', 'warning');
                    }
                }
            } else if (currentAyah.audio_url) {
                // Fallback to audio_url if available
                // Use getAudioUrl utility for production URL handling
                playAudio(getAudioUrl(currentAyah.audio_url), currentAyah.id);
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
                
                // Add a subtle highlight effect
                arabicTextElement.classList.add('highlight-animation');
                setTimeout(() => {
                    arabicTextElement.classList.remove('highlight-animation');
                }, 1000);
            }
        }, 100);
    };
    
    const handlePrevious = () => {
        if (currentVerseIndex > 1) {
            const previousIndex = currentVerseIndex - 1;
            setCurrentVerseIndex(previousIndex);
            // Reset audio and state
            if (currentAudio) {
                stopAudio();
            }
            // Reset footnote state
            setActiveFootnote(null);
            setFootnoteContent('');
            setShowTooltip(null);
            scrollToArabicText();
            
            // Update URL without page refresh using replaceState
            window.history.replaceState(null, '', `/surah/${number}/${previousIndex}`);
            // Dispatch a custom event to notify other components about URL change
            window.dispatchEvent(new CustomEvent('urlChange', { detail: { path: `/surah/${number}/${previousIndex}` } }));
        }
    };
    
    const handleNext = () => {
        if (currentVerseIndex < ayahs.length) {
            const nextIndex = currentVerseIndex + 1;
            setCurrentVerseIndex(nextIndex);
            // Reset audio and state
            if (currentAudio) {
                stopAudio();
            }
            // Reset footnote state
            setActiveFootnote(null);
            setFootnoteContent('');
            setShowTooltip(null);
            scrollToArabicText();
            
            // Update URL without page refresh using replaceState
            window.history.replaceState(null, '', `/surah/${number}/${nextIndex}`);
            // Dispatch a custom event to notify other components about URL change
            window.dispatchEvent(new CustomEvent('urlChange', { detail: { path: `/surah/${number}/${nextIndex}` } }));
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
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 z-[9997]">
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
    
    // Share ayah to WhatsApp
    const handleShare = (ayah) => {
        if (!ayah) {
            console.error('Invalid ayah data for sharing');
            showToast('Tidak dapat membagikan ayat, data tidak lengkap', 'error');
            return;
        }
        
        try {
            // Create a complete ayah object with surah information if it's missing
            const completeAyah = {
                ...ayah,
                // If ayah doesn't have surah info, add it from the surah state variable
                surah: ayah.surah || surah,
                surah_number: ayah.surah_number || surah.number,
                ayah_number: ayah.ayah_number || currentVerseIndex
            };
            
            // Get the current URL for sharing
            const shareUrl = `${window.location.origin}/surah/${completeAyah.surah_number}/${completeAyah.ayah_number}`;
            
            // Create share text with proper formatting
            // Use the Indonesian text if available, otherwise fall back to the transliteration
            const translationText = completeAyah.text_indonesia || completeAyah.text_indonesian || ''; 
            
            // Clean up any HTML tags that might be in the translation
            const cleanTranslation = translationText.replace(/<\/?[^>]+(>|$)/g, '');
            
            // Create share text with proper error handling for undefined values
            const surahNameLatin = completeAyah.surah?.name_latin || surah?.name_latin || '';
            const surahNameArabic = completeAyah.surah?.name_arabic || surah?.name_arabic || '';
            const ayahNumber = completeAyah.ayah_number || currentVerseIndex;
            const arabicText = completeAyah.text_arabic || '';
            
            const shareText = `Surah ${surahNameLatin} (${surahNameArabic}) - Ayat ${ayahNumber}\n\n${arabicText}\n\n${cleanTranslation}\n\nBaca di IndoQuran: ${shareUrl}`;
            
            // Create the WhatsApp URL with proper encoding
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
            
            // Open in a new window with specific features to ensure it works on mobile and desktop
            const shareWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Fallback if window.open is blocked
            if (!shareWindow) {
                // Create a temporary link and click it
                const tempLink = document.createElement('a');
                tempLink.target = '_blank';
                tempLink.href = whatsappUrl;
                tempLink.rel = 'noopener noreferrer';
                tempLink.click();
            }
            
            showToast('Membuka WhatsApp untuk berbagi ayat', 'success');
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            showToast('Gagal membagikan ke WhatsApp', 'error');
        }
    };
    
    // Handle browser back/forward navigation
    useEffect(() => {
        const handlePopState = (event) => {
            // Extract ayah number from current URL
            const path = window.location.pathname;
            const pathSegments = path.split('/');
            const urlAyahNumber = pathSegments[pathSegments.length - 1];
            
            if (urlAyahNumber && !isNaN(urlAyahNumber)) {
                const ayahIndex = parseInt(urlAyahNumber, 10);
                if (ayahIndex > 0 && ayahIndex <= ayahs.length) {
                    setCurrentVerseIndex(ayahIndex);
                    // Reset footnote state
                    setActiveFootnote(null);
                    setFootnoteContent('');
                    setShowTooltip(null);
                    scrollToArabicText();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [ayahs.length]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }
    
    if (error || !ayahs.length) {
        return (
            <div className="bg-accent-50 border-l-4 border-accent-500 text-accent-700 p-4 rounded-lg shadow-islamic" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error || 'Surah tidak ditemukan'}</span>
            </div>
        );
    }
    
    const currentAyah = ayahs[currentVerseIndex - 1];
    const progressPercentage = (currentVerseIndex / ayahs.length) * 100;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Main Container */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                
                {/* Surah bismillah removed */}

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
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9998] min-w-48 max-h-60 overflow-y-auto">
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
                            {/* Loading indicator - hidden by default */}
                            <div id="ayah-loading-indicator" className="flex justify-center mt-4" style={{ display: 'none' }}>
                                <div className="animate-pulse w-8 h-8 rounded-full bg-green-200"></div>
                            </div>
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
                    <div className="flex justify-center gap-3 mb-6">
                        {user && (
                            <>
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
                            </>
                        )}
                        
                        {/* WhatsApp Share Button */}
                        <button
                            onClick={() => handleShare(currentAyah)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md transition-all duration-300"
                            title="Bagikan ke WhatsApp"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M13.507 21.508h-.014c-2.083 0-4.144-.534-5.949-1.546l-.426-.26-4.422 1.16 1.182-4.319-.29-.466a11.89 11.89 0 01-1.819-6.38c0-6.582 5.361-11.942 11.943-11.942 3.189 0 6.188 1.243 8.441 3.499 2.255 2.256 3.495 5.253 3.494 8.442 0 6.58-5.36 11.942-11.94 11.942a11.815 11.815 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill-rule="nonzero"/>
                            </svg>
                            <span className="text-sm">Bagikan ke WhatsApp</span>
                        </button>
                    </div>
                    
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
                    
                    {/* Tafsir Content */}
                    {showTafsir && currentAyah.tafsir && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
                            <h4 className="font-medium text-gray-800 mb-2">Tafsir</h4>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {currentAyah.tafsir || '(Tafsir tidak tersedia)'}
                            </p>
                            {activeFootnote && (
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
                    onClick={() => {
                        if (currentVerseIndex > 1) {
                            const previousIndex = currentVerseIndex - 1;
                            fetchAyah(number, previousIndex);
                        }
                    }}
                    disabled={currentVerseIndex <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <IoArrowBackOutline className="text-lg" />
                    <span>Sebelumnya</span>
                </button>
                
                <div className="flex items-center gap-4">
                    {/* Audio Control */}
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


                    {/* Share Button */}
                    {/* Share Button */}
                    <button
                        onClick={() => handleShare(currentAyah)}
                        className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors text-white shadow-md"
                        title="Bagikan ke WhatsApp"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill-rule="nonzero"/>
                        </svg>
                    </button>

                    {/* Stop Button - Only show when audio is playing */}
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

                <button 
                    onClick={() => {
                        if (currentVerseIndex < ayahs.length) {
                            const nextIndex = currentVerseIndex + 1;
                            fetchAyah(number, nextIndex);
                        }
                    }}
                    disabled={currentVerseIndex >= ayahs.length}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Selanjutnya</span>
                    <IoArrowForwardOutline className="text-lg" />
                </button>
            </div>
            
            {/* Ayah Navigation Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-sm text-gray-600 mb-4 text-center">
                    <h3 className="font-medium text-gray-800">Pilih Ayat</h3>
                    <p className="text-xs text-gray-500 mt-1">Klik nomor ayat untuk langsung menuju ke ayat tersebut</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {ayahs.map((ayah, index) => {
                        const isFavorite = bookmarkStatuses[ayah.id]?.is_favorite;
                        return (
                            <button
                                key={ayah.id}
                                onClick={() => {
                                    const newVerseIndex = index + 1;
                                    fetchAyah(number, newVerseIndex);
                                }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${
                                    currentVerseIndex === index + 1
                                        ? 'bg-green-600 text-white shadow-md'
                                        : isFavorite
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                                }`}
                                title={`Ayat ${index + 1}${isFavorite ? ' (Favorit)' : ''}`}
                            >
                                {index + 1}
                                {isFavorite && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
        </div>
    );
}

export default SurahPage;
