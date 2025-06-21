import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
    PlayIcon, 
    PauseIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    BookmarkIcon as BookmarkSolidIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentDuplicateIcon,
    EllipsisVerticalIcon,
    BookOpenIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import { 
    BookmarkIcon as BookmarkOutlineIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { updateReadingProgress } from '../services/ReadingProgressService';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
    </svg>
);

function SimpleSurahPage() {
    const { user } = useAuth();
    const { number, ayahNumber } = useParams();
    const navigate = useNavigate();
    
    const [surah, setSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentAyahNumber, setCurrentAyahNumber] = useState(() => {
        // Initialize with URL parameter if available, otherwise default to 1
        const initialAyah = parseInt(ayahNumber) || 1;
        console.log('🎯 Initial ayah number:', initialAyah);
        return initialAyah;
    });
    const [bookmarkedAyahs, setBookmarkedAyahs] = useState(new Set());
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null);
    const [fontSize, setFontSize] = useState(24);
    const [showDescriptionShort, setShowDescriptionShort] = useState(true);
    const [showDescriptionLong, setShowDescriptionLong] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [showFloatingShare, setShowFloatingShare] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [showCopyDropdown, setShowCopyDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [showTafsir, setShowTafsir] = useState(false);
    const [expandedTafsirs, setExpandedTafsirs] = useState(new Set());

    const ayahRefs = useRef({});
    const currentAyahRef = useRef(null);
    const copyButtonRef = useRef(null);
    const isNavigatingRef = useRef(false); // Track navigation state to prevent race conditions

    // Improved scroll function for better ayah targeting
    const scrollToCurrentAyah = useCallback((ayahNum = currentAyahNumber) => {
        console.log(`🎯 Scrolling to ayah ${ayahNum}...`);
        
        // Try multiple scroll strategies for best reliability
        const scrollStrategies = [
            // Strategy 1: Use currentAyahRef if available
            () => {
                if (currentAyahRef.current) {
                    console.log('📍 Using currentAyahRef for scroll');
                    currentAyahRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                    return true;
                }
                return false;
            },
            
            // Strategy 2: Use specific ayah ID
            () => {
                const ayahElement = document.getElementById(`ayah-${ayahNum}-arabic`);
                if (ayahElement) {
                    console.log(`📍 Using ayah ID #ayah-${ayahNum}-arabic for scroll`);
                    ayahElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                    return true;
                }
                return false;
            },
            
            // Strategy 3: Use ayah content container
            () => {
                const ayahContent = document.getElementById('ayah-content');
                if (ayahContent) {
                    console.log('📍 Using ayah-content container for scroll');
                    ayahContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                    return true;
                }
                return false;
            }
        ];
        
        // Try each strategy until one works
        for (const strategy of scrollStrategies) {
            if (strategy()) {
                break;
            }
        }
        
        // Add visual highlight effect for better UX
        setTimeout(() => {
            const arabicElement = document.getElementById(`ayah-${ayahNum}-arabic`);
            if (arabicElement) {
                // Add temporary highlight
                arabicElement.style.background = 'linear-gradient(90deg, #fef3c7, #fde68a)';
                arabicElement.style.borderRadius = '8px';
                arabicElement.style.padding = '8px';
                arabicElement.style.transition = 'all 0.3s ease';
                
                // Remove highlight after 2 seconds
                setTimeout(() => {
                    arabicElement.style.background = 'transparent';
                    arabicElement.style.padding = '0';
                }, 2000);
            }
        }, 500);
    }, [currentAyahNumber]);

    // Get current ayah - simplified and reliable approach with type-safe comparison
    const currentAyah = ayahs.find(ayah => parseInt(ayah.ayah_number) === parseInt(currentAyahNumber)) || null;
    
    // Debug: Log current ayah finding result
    useEffect(() => {
        console.log('🎯 Current Ayah Finding Result:', {
            currentAyahNumber,
            ayahsLength: ayahs.length,
            found: !!currentAyah,
            currentAyah: currentAyah ? {
                ayah_number: currentAyah.ayah_number,
                number: currentAyah.number,
                verse_number: currentAyah.verse_number,
                id: currentAyah.id,
                text_arabic: currentAyah.text_arabic ? currentAyah.text_arabic.substring(0, 50) + '...' : 'No Arabic text'
            } : null,
            totalAyahs: ayahs.length,
            firstAyahInArray: ayahs.length > 0 ? {
                ayah_number: ayahs[0].ayah_number,
                number: ayahs[0].number,
                verse_number: ayahs[0].verse_number,
                id: ayahs[0].id
            } : 'No ayahs available'
        });
    }, [currentAyahNumber, ayahs, currentAyah]);
    // Calculate total ayahs and available ayah numbers from actual data
    const availableAyahNumbers = ayahs.map(ayah => parseInt(ayah.ayah_number)).filter(num => num && !isNaN(num)).sort((a, b) => a - b);
    const totalAyahs = availableAyahNumbers.length;
    const minAyahNumber = availableAyahNumbers[0] || 1;
    const maxAyahNumber = availableAyahNumbers[availableAyahNumbers.length - 1] || 1;
    const completionPercentage = totalAyahs > 0 ? Math.round(((availableAyahNumbers.indexOf(parseInt(currentAyahNumber)) + 1) / totalAyahs) * 100) : 0;
    
    // Debug total ayahs calculation
    useEffect(() => {
        if (surah && ayahs.length > 0) {
            console.log('📊 Total Ayahs Debug:', {
                surah_total_ayahs: surah.total_ayahs,
                surah_verses_count: surah.verses_count,
                surah_number_of_ayahs: surah.number_of_ayahs,
                ayahs_length: ayahs.length,
                calculated_totalAyahs: totalAyahs,
                availableAyahNumbers,
                minAyahNumber,
                maxAyahNumber,
                currentAyahNumber,
                completionPercentage,
                ayah_numbers_in_data: ayahs.map(ayah => ayah.ayah_number),
                first_five_ayahs: ayahs.slice(0, 5).map(ayah => ({
                    ayah_number: ayah.ayah_number,
                    text_preview: ayah.text_arabic?.substring(0, 30) + '...'
                })),
                surahFields: Object.keys(surah)
            });
        }
    }, [surah, ayahs, totalAyahs, availableAyahNumbers, minAyahNumber, maxAyahNumber, currentAyahNumber, completionPercentage]);

    // Fetch surah data - REQUIREMENT 1: Load whole surah API first before rendering any content
    useEffect(() => {
        const fetchSurahData = async () => {
            try {
                setLoading(true);
                setError(null); // Reset error state
                const token = authUtils.getAuthToken();
                
                console.log(`🚀 Loading complete surah ${number} from API before rendering...`);
                
                // REQUIREMENT 1: Fetch complete surah details and ayahs in one call from API
                const surahResponse = await fetchWithAuth(`/api/surahs/${number}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                if (!surahResponse.ok) throw new Error('Failed to fetch surah');
                const surahResult = await surahResponse.json();
                
                if (surahResult.status === 'success' && surahResult.data) {
                    const surahData = surahResult.data.surah || surahResult.data;
                    const ayahsData = surahResult.data.ayahs || [];
                    
                    console.log('✅ Complete surah data loaded from API:', {
                        surahNumber: number,
                        surahName: surahData.name_arabic || surahData.name,
                        totalAyahsInAPI: ayahsData.length,
                        apiEndpoint: `/api/surahs/${number}`,
                        dataStructure: {
                            surahKeys: surahData ? Object.keys(surahData) : 'No surah data',
                            ayahsCount: ayahsData.length,
                            isAyahsArray: Array.isArray(ayahsData),
                            firstAyahSample: ayahsData[0] ? {
                                id: ayahsData[0].id,
                                ayah_number: ayahsData[0].ayah_number,
                                surah_number: ayahsData[0].surah_number,
                                text_preview: ayahsData[0].text_arabic ? ayahsData[0].text_arabic.substring(0, 30) + '...' : 'No Arabic text'
                            } : 'No ayahs available'
                        }
                    });
                    
                    // Set surah and ayahs data loaded from API
                    setSurah(surahData);
                    setAyahs(Array.isArray(ayahsData) ? ayahsData : []);
                    
                    // Ensure currentAyahNumber is valid when ayahs are loaded
                    if (Array.isArray(ayahsData) && ayahsData.length > 0) {
                        const ayahNumbers = ayahsData.map(ayah => ayah.ayah_number).filter(num => num).sort((a, b) => a - b);
                        
                        // If the requested ayah doesn't exist in the data, set to the closest one
                        if (!ayahNumbers.includes(currentAyahNumber)) {
                            const closestAyah = ayahNumbers.reduce((prev, curr) => {
                                return Math.abs(curr - currentAyahNumber) < Math.abs(prev - currentAyahNumber) ? curr : prev;
                            });
                            
                            console.log(`🔄 Requested ayah ${currentAyahNumber} not found, adjusting to closest available ayah: ${closestAyah}`);
                            setCurrentAyahNumber(closestAyah);
                        }
                    }
                    
                    // Debug: Log tafsir availability
                    console.log('📖 Tafsir Debug:', {
                        totalAyahs: ayahsData.length,
                        ayahsWithTafsir: ayahsData.filter(ayah => ayah.tafsir).length,
                        firstAyahTafsir: ayahsData[0]?.tafsir ? ayahsData[0].tafsir.substring(0, 100) + '...' : 'No tafsir'
                    });

                    // Debug: Log ayah structure for bookmark functionality
                    console.log('🔖 Ayah Structure Debug:', {
                        firstAyah: ayahsData[0],
                        hasId: !!ayahsData[0]?.id,
                        ayahFields: ayahsData[0] ? Object.keys(ayahsData[0]) : [],
                        totalAyahsReceived: ayahsData.length
                    });

                    // Debug: Log current ayah finding logic
                    console.log('🔍 Current Ayah Debug:', {
                        currentAyahNumber,
                        ayahsData: ayahsData.slice(0, 3).map(ayah => ({
                            ayah_number: ayah.ayah_number,
                            number: ayah.number,
                            verse_number: ayah.verse_number,
                            id: ayah.id
                        }))
                    });
                    
                    // Fetch bookmarks if user is logged in
                    if (user) {
                        try {
                            const bookmarksResponse = await fetchWithAuth('/api/penanda', {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                }
                            });
                            
                            if (bookmarksResponse.ok) {
                                const bookmarksResult = await bookmarksResponse.json();
                                if (bookmarksResult.status === 'success') {
                                    const bookmarkedSet = new Set();
                                    bookmarksResult.data.forEach(bookmark => {
                                        if (bookmark.surah_number == number) {
                                            bookmarkedSet.add(bookmark.ayah_number);
                                        }
                                    });
                                    setBookmarkedAyahs(bookmarkedSet);
                                }
                            }
                        } catch (error) {
                            console.log('Error fetching bookmarks:', error);
                        }
                    }
                } else {
                    throw new Error(surahResult.message || 'Failed to load surah');
                }
            } catch (error) {
                console.error('Error fetching surah data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (number) {
            console.log(`🔄 REQUIREMENT 1: Fetching complete surah data for surah ${number}...`);
            fetchSurahData();
        }
    }, [number, user]);

    // REQUIREMENT 2: Ensure URL is properly initialized when page loads
    useEffect(() => {
        // If we have ayahs loaded but no ayah number in URL, redirect to first ayah
        if (ayahs.length > 0 && !ayahNumber && availableAyahNumbers.length > 0) {
            const firstAyah = availableAyahNumbers[0];
            console.log(`🔗 REQUIREMENT 2: No ayah in URL, redirecting to first ayah: /surah/${number}/${firstAyah}`);
            navigate(`/surah/${number}/${firstAyah}`, { replace: true });
        }
    }, [ayahs, ayahNumber, number, navigate, availableAyahNumbers]);

    // REQUIREMENT 2: Update current ayah when URL changes and track reading progress
    useEffect(() => {
        console.log(`🔗 URL Change Detected - Surah: ${number}, Ayah: ${ayahNumber || 'undefined'}`);
        
        if (ayahNumber) {
            const ayahNum = parseInt(ayahNumber);
            
            // Update state when URL changes (this is the primary way state gets updated)
            if (ayahNum !== currentAyahNumber) {
                console.log(`🔄 REQUIREMENT 2: URL ayah changed from ${currentAyahNumber} to ${ayahNum}`);
                console.log(`✅ URL Pattern: /surah/${number}/${ayahNum}`);
                setCurrentAyahNumber(ayahNum);
                
                // Auto-scroll to ayat when coming from external link (like Tafsir Maudhui)
                // Wait for the component to update and then scroll
                setTimeout(() => {
                    scrollToCurrentAyah(ayahNum);
                }, 100);
                
                // Update reading progress if user is logged in and surah number is available
                if (user && number) {
                    updateReadingProgress(parseInt(number), ayahNum)
                        .then(() => {
                            console.log('📖 Reading progress updated on URL change:', { surah: number, ayah: ayahNum });
                        })
                        .catch(error => {
                            console.error('❌ Error updating reading progress on URL change:', error);
                        });
                }
            }
        } else if (!ayahNumber && currentAyahNumber !== 1) {
            // If no ayah number in URL, default to ayah 1
            console.log('🔄 No ayah in URL, defaulting to ayah 1');
            setCurrentAyahNumber(1);
        }
    }, [ayahNumber, user, number, currentAyahNumber]);

    // Handle URL validation only for invalid ayah numbers (not for navigation interference)
    useEffect(() => {
        // Don't interfere with ongoing navigation
        if (isNavigatingRef.current) {
            return;
        }
        
        if (ayahs.length > 0 && !loading && availableAyahNumbers.length > 0) {
            const urlAyahParam = parseInt(ayahNumber);
            
            // Debug the comparison
            console.log('🔍 URL Validation Debug:', {
                urlAyahParam,
                urlAyahParamType: typeof urlAyahParam,
                availableAyahNumbers,
                availableAyahNumbersTypes: availableAyahNumbers.map(n => typeof n),
                includes: availableAyahNumbers.includes(urlAyahParam),
                isValidNumber: !isNaN(urlAyahParam) && urlAyahParam > 0
            });
            
            // Only redirect if the URL contains an ayah number that doesn't exist in our data
            if (urlAyahParam && !isNaN(urlAyahParam) && !availableAyahNumbers.includes(urlAyahParam)) {
                // Find the closest available ayah
                const closestAyah = availableAyahNumbers.reduce((prev, curr) => {
                    return Math.abs(curr - urlAyahParam) < Math.abs(prev - urlAyahParam) ? curr : prev;
                });
                
                console.log(`🚨 URL contains invalid ayah ${urlAyahParam}, redirecting to closest ayah ${closestAyah}`);
                isNavigatingRef.current = true;
                navigate(`/surah/${number}/${closestAyah}`, { replace: true });
                // Reset navigation flag after a delay
                setTimeout(() => {
                    isNavigatingRef.current = false;
                }, 1000);
                return;
            }
        }
    }, [ayahs, loading, number, navigate, ayahNumber, availableAyahNumbers]);

    // Auto-scroll when component is fully loaded (especially for direct links from Tafsir Maudhui)
    useEffect(() => {
        // Only scroll if we have data loaded and a specific ayah in URL
        if (!loading && ayahs.length > 0 && ayahNumber && currentAyah) {
            const ayahNum = parseInt(ayahNumber);
            console.log(`🎯 Component loaded with ayah ${ayahNum}, performing auto-scroll...`);
            
            // Add a delay to ensure DOM is fully rendered
            setTimeout(() => {
                scrollToCurrentAyah(ayahNum);
            }, 200);
        }
    }, [loading, ayahs.length, ayahNumber, currentAyah, scrollToCurrentAyah]);

    const toggleBookmark = async (ayahNum) => {
        if (!user) {
            navigate('/masuk');
            return;
        }

        try {
            const token = authUtils.getAuthToken();
            const isCurrentlyBookmarked = bookmarkedAyahs.has(ayahNum);
            
            // Debug: Log what we're sending
            console.log('🔖 Bookmark Debug:', {
                surahNumber: number,
                ayahNumber: ayahNum,
                isCurrentlyBookmarked,
                token: token ? 'Present' : 'Missing'
            });

            // Use the new endpoint that accepts surah and ayah numbers
            const response = await fetchWithAuth(`/api/penanda/surah/${number}/ayah/${ayahNum}/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            console.log('🔖 Bookmark API Response:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('🔖 Bookmark Response Data:', responseData);
                
                const newBookmarkedAyahs = new Set(bookmarkedAyahs);
                if (isCurrentlyBookmarked) {
                    newBookmarkedAyahs.delete(ayahNum);
                } else {
                    newBookmarkedAyahs.add(ayahNum);
                }
                setBookmarkedAyahs(newBookmarkedAyahs);
                
                // Show success message
                const alertDiv = document.createElement('div');
                alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all text-sm';
                alertDiv.textContent = `✅ ${isCurrentlyBookmarked ? 'Bookmark dihapus' : 'Bookmark ditambah'}!`;
                document.body.appendChild(alertDiv);
                
                setTimeout(() => {
                    alertDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (document.body.contains(alertDiv)) {
                            document.body.removeChild(alertDiv);
                        }
                    }, 300);
                }, 2000);
            } else {
                const errorText = await response.text();
                console.error('❌ Bookmark API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });
                alert(`Error toggling bookmark: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error toggling bookmark:', error);
            alert('Network error while toggling bookmark. Please try again.');
        }
    };

    const playAyah = async (ayahNum) => {
        try {
            if (audioElement) {
                audioElement.pause();
            }

            const ayah = ayahs.find(a => a.ayah_number === ayahNum || a.number === ayahNum);
            if (ayah) {
                let audioUrl = null;
                
                // Handle different audio URL formats
                if (ayah.audio_url) {
                    audioUrl = ayah.audio_url;
                } else if (ayah.audio_urls) {
                    const audioUrls = typeof ayah.audio_urls === 'string' 
                        ? JSON.parse(ayah.audio_urls) 
                        : ayah.audio_urls;
                    
                    if (Array.isArray(audioUrls) && audioUrls.length > 0) {
                        audioUrl = audioUrls[0];
                    } else if (typeof audioUrls === 'object') {
                        // Get first available audio URL
                        const qaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit'];
                        for (const qari of qaris) {
                            if (audioUrls[qari]) {
                                audioUrl = audioUrls[qari];
                                break;
                            }
                        }
                        // If no preferred qari found, get first available
                        if (!audioUrl) {
                            audioUrl = Object.values(audioUrls)[0];
                        }
                    }
                }
                
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.onplay = () => {
                        setIsPlaying(true);
                        setCurrentPlayingAyah(ayahNum);
                    };
                    audio.onpause = () => {
                        setIsPlaying(false);
                        setCurrentPlayingAyah(null);
                    };
                    audio.onended = () => {
                        setIsPlaying(false);
                        setCurrentPlayingAyah(null);
                    };
                    audio.onerror = (e) => {
                        console.error('Audio error:', e);
                        setIsPlaying(false);
                        setCurrentPlayingAyah(null);
                    };
                    
                    setAudioElement(audio);
                    await audio.play();
                }
            }
        } catch (error) {
            console.error('❌ Error playing audio:', error);
            setIsPlaying(false);
            setCurrentPlayingAyah(null);
        }
    };

    const pauseAudio = () => {
        if (audioElement) {
            audioElement.pause();
        }
    };

    const shareAyah = async (ayahNum) => {
        const ayah = ayahs.find(a => a.ayah_number === ayahNum || a.number === ayahNum);
        if (ayah) {
            // Get Indonesian translation
            const indonesianText = ayah.text_indonesian || ayah.translation_id || '';
            
            // Construct share content with both Arabic and Indonesian
            let shareText = `🕌 Al-Qur'an: ${surah.name_latin || surah.name_english} - Ayat ${ayahNum}\n\n`;
            shareText += `📖 Arab:\n${ayah.text_arabic}\n\n`;
            
            // Add Latin transliteration if available
            if (ayah.text_latin) {
                shareText += `🔤 Latin:\n${ayah.text_latin}\n\n`;
            }
            
            if (indonesianText) {
                shareText += `🇮🇩 Terjemahan:\n${indonesianText}\n\n`;
            }

            // Add tafsir if available
            if (ayah.tafsir) {
                shareText += `📚 Tafsir:\n${ayah.tafsir}\n\n`;
            }
            
            shareText += `� Surah ${surah.name_latin} (${surah.name_arabic}) - Ayat ${ayahNum}\n`;
            shareText += `�🔗 Baca selengkapnya: ${window.location.origin}/surah/${number}/${ayahNum}\n\n`;
            shareText += `📱 IndoQuran - Baca Al-Qur'an dengan mudah`;

            // Share via WhatsApp only
            const encodedText = encodeURIComponent(shareText);
            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const shareSurah = async () => {
        if (surah) {
            // Construct share content for entire surah
            let shareText = `🕌 Al-Qur'an: ${surah.name_latin || surah.name_english}\n\n`;
            shareText += `📊 Total Ayat: ${totalAyahs}\n`;
            shareText += `📍 Tempat Turun: ${surah.revelation_place || 'Makkiyah/Madaniyah'}\n`;
            
            if (surah.name_arabic) {
                shareText += `🔤 Nama Arab: ${surah.name_arabic}\n`;
            }
            
            if (surah.meaning || surah.name_indonesian) {
                shareText += `💡 Arti: ${surah.meaning || surah.name_indonesian}\n`;
            }

            // Add short description if available
            if (surah.description_short) {
                // Strip HTML tags for WhatsApp sharing
                const plainDescription = surah.description_short.replace(/<[^>]*>/g, '');
                shareText += `\n📚 Ringkasan:\n${plainDescription}\n`;
            }
            
            shareText += `\n🔗 Baca selengkapnya: ${window.location.origin}/surah/${number}\n\n`;
            shareText += `📱 IndoQuran - Baca Al-Qur'an dengan mudah`;

            // Share via WhatsApp only
            const encodedText = encodeURIComponent(shareText);
            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const copyAyahText = async (ayahNum, type = 'arabic') => {
        const ayah = ayahs.find(a => a.ayah_number === ayahNum || a.number === ayahNum);
        if (ayah) {
            let textToCopy = '';
            
            switch (type) {
                case 'arabic':
                    textToCopy = ayah.text_arabic;
                    break;
                case 'latin':
                    textToCopy = ayah.text_latin || 'Transliterasi tidak tersedia';
                    break;
                case 'indonesian':
                    textToCopy = ayah.text_indonesian || ayah.translation_id || 'Terjemahan tidak tersedia';
                    break;
                case 'tafsir':
                    textToCopy = ayah.tafsir || 'Tafsir tidak tersedia';
                    break;
                case 'all':
                    textToCopy = `${surah.name_latin} - Ayat ${ayahNum}\n\n`;
                    textToCopy += `Arab:\n${ayah.text_arabic}\n\n`;
                    if (ayah.text_latin) textToCopy += `Latin:\n${ayah.text_latin}\n\n`;
                    if (ayah.text_indonesian || ayah.translation_id) {
                        textToCopy += `Terjemahan:\n${ayah.text_indonesian || ayah.translation_id}\n\n`;
                    }
                    if (ayah.tafsir) {
                        textToCopy += `Tafsir:\n${ayah.tafsir}`;
                    }
                    break;
                default:
                    textToCopy = ayah.text_arabic;
            }
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Show success message
                const alertDiv = document.createElement('div');
                alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all text-sm';
                alertDiv.textContent = `✅ ${type === 'arabic' ? 'Teks Arab' : type === 'latin' ? 'Transliterasi' : type === 'indonesian' ? 'Terjemahan' : type === 'tafsir' ? 'Tafsir' : 'Semua teks'} berhasil disalin!`;
                document.body.appendChild(alertDiv);
                
                setTimeout(() => {
                    alertDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (document.body.contains(alertDiv)) {
                            document.body.removeChild(alertDiv);
                        }
                    }, 300);
                }, 2000);
            } catch (error) {
                console.log('Error copying text:', error);
            }
        }
    };

    const changeFontSize = (delta) => {
        setFontSize(prev => Math.max(12, Math.min(32, prev + delta)));
    };

    const toggleTafsir = () => {
        setShowTafsir(!showTafsir);
    };

    const toggleTafsirExpanded = (ayahNum) => {
        const newExpanded = new Set(expandedTafsirs);
        if (newExpanded.has(ayahNum)) {
            newExpanded.delete(ayahNum);
        } else {
            newExpanded.add(ayahNum);
        }
        setExpandedTafsirs(newExpanded);
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelectedText(selectedText);
            setSelectionPosition({
                x: rect.left + (rect.width / 2),
                y: rect.top - 10
            });
            setShowFloatingShare(true);
        } else {
            setShowFloatingShare(false);
            setSelectedText('');
        }
    };

    const shareSelectedText = async () => {
        if (selectedText) {
            const shareText = `📖 Kutipan dari ${surah.name_latin} - Ayat ${currentAyahNumber}:\n\n"${selectedText}"\n\n🔗 ${window.location.origin}/surah/${number}/${currentAyahNumber}\n\n📱 IndoQuran - Baca Al-Qur'an dengan mudah`;
            
            // Share via WhatsApp only
            const encodedText = encodeURIComponent(shareText);
            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
            window.open(whatsappUrl, '_blank');
            
            setShowFloatingShare(false);
            setSelectedText('');
            window.getSelection().removeAllRanges();
        }
    };

    // Add event listener for text selection, keyboard shortcuts, and click outside
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Shift+S or Cmd+Shift+S to share current ayah
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                shareAyah(currentAyahNumber);
            }
            // Ctrl+Shift+U or Cmd+Shift+U to share surah
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
                e.preventDefault();
                shareSurah();
            }
            // Ctrl+T or Cmd+T to toggle tafsir
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                toggleTafsir();
            }
            // Ctrl+Shift+R or Cmd+Shift+R to toggle description short (Ringkasan)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                setShowDescriptionShort(!showDescriptionShort);
            }
            // Ctrl+Shift+D or Cmd+Shift+D to toggle description long (Detail)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setShowDescriptionLong(!showDescriptionLong);
            }
            // Escape to close dropdown
            if (e.key === 'Escape') {
                setShowCopyDropdown(false);
                setShowFloatingShare(false);
            }
        };

        const handleClickOutside = (e) => {
            // Close copy dropdown if clicking outside
            if (showCopyDropdown && !e.target.closest('.copy-dropdown-container')) {
                setShowCopyDropdown(false);
            }
        };

        document.addEventListener('mouseup', handleTextSelection);
        document.addEventListener('selectionchange', handleTextSelection);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('mouseup', handleTextSelection);
            document.removeEventListener('selectionchange', handleTextSelection);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [currentAyahNumber, showCopyDropdown, showDescriptionShort, showDescriptionLong]);

    // Close dropdown when clicking outside and handle positioning
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCopyDropdown) {
                const isDropdownContainer = event.target.closest('.copy-dropdown-container');
                const isDropdownPortal = event.target.closest('.copy-dropdown-portal');
                if (!isDropdownContainer && !isDropdownPortal) {
                    setShowCopyDropdown(false);
                }
            }
        };

        const updateDropdownPosition = () => {
            if (copyButtonRef.current && showCopyDropdown) {
                const rect = copyButtonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX
                });
            }
        };

        if (showCopyDropdown) {
            updateDropdownPosition();
            window.addEventListener('scroll', updateDropdownPosition);
            window.addEventListener('resize', updateDropdownPosition);
        }

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updateDropdownPosition);
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }, [showCopyDropdown]);

    const navigateToAyah = useCallback(async (ayahNum) => {
        // Check if navigation is already in progress
        if (isNavigatingRef.current) {
            console.log('⏳ Navigation already in progress, skipping');
            return;
        }

        // Validate that the ayah number exists in our data
        if (!availableAyahNumbers.includes(ayahNum)) {
            console.warn(`🚨 Ayah ${ayahNum} not found in available ayahs`);
            return;
        }

        // Set navigation flag to prevent race conditions
        isNavigatingRef.current = true;
        console.log(`🚀 REQUIREMENT 2: Updating URL to /surah/${number}/${ayahNum}`);

        try {
            // REQUIREMENT 2: Navigate to the new URL based on surah and ayah number
            navigate(`/surah/${number}/${ayahNum}`);
            console.log(`✅ URL successfully updated to: /surah/${number}/${ayahNum}`);
            
            // Update reading progress if user is logged in
            if (user) {
                try {
                    await updateReadingProgress(parseInt(number), ayahNum);
                    console.log(`📖 Reading progress updated for surah ${number}, ayah ${ayahNum}`);
                } catch (error) {
                    console.error('❌ Error updating reading progress:', error);
                }
            }
            
            // Use improved scroll function
            setTimeout(() => {
                scrollToCurrentAyah(ayahNum);
            }, 300);
            
            // Reset navigation flag after a reasonable delay
            setTimeout(() => {
                isNavigatingRef.current = false;
                console.log(`✅ Navigation to ayah ${ayahNum} completed`);
            }, 800); // Increased from 500ms to 800ms for better reliability
            
        } catch (error) {
            console.error('❌ Navigation error:', error);
            isNavigatingRef.current = false; // Reset flag immediately on error
        }
    }, [availableAyahNumbers, number, navigate, user, scrollToCurrentAyah]);

    const goToPreviousAyah = useCallback(() => {
        const currentIndex = availableAyahNumbers.indexOf(currentAyahNumber);
        
        // Check if we're already navigating
        if (isNavigatingRef.current) {
            console.log('⏳ Previous navigation already in progress, skipping');
            return;
        }
        
        if (currentIndex > 0) {
            const previousAyahNumber = availableAyahNumbers[currentIndex - 1];
            console.log(`⬅️ REQUIREMENT 2: Going to previous ayah: ${currentAyahNumber} → ${previousAyahNumber}`);
            console.log(`📍 Previous URL will be: /surah/${number}/${previousAyahNumber}`);
            navigateToAyah(previousAyahNumber);
        } else {
            console.log('⏹️ Already at first ayah, cannot go previous');
        }
    }, [currentAyahNumber, availableAyahNumbers, navigateToAyah, number]);

    const goToNextAyah = useCallback(() => {
        const currentIndex = availableAyahNumbers.indexOf(currentAyahNumber);
        
        // Check if we're already navigating
        if (isNavigatingRef.current) {
            console.log('⏳ Next navigation already in progress, skipping');
            return;
        }
        
        if (currentIndex >= 0 && currentIndex < availableAyahNumbers.length - 1) {
            const nextAyahNumber = availableAyahNumbers[currentIndex + 1];
            console.log(`➡️ REQUIREMENT 2: Going to next ayah: ${currentAyahNumber} → ${nextAyahNumber}`);
            console.log(`📍 Next URL will be: /surah/${number}/${nextAyahNumber}`);
            navigateToAyah(nextAyahNumber);
        } else {
            console.log('⏹️ Already at last ayah, cannot go next');
        }
    }, [currentAyahNumber, availableAyahNumbers, navigateToAyah, number]);

    const navigateToSurah = (surahNum) => {
        if (surahNum >= 1 && surahNum <= 114) {
            navigate(`/surah/${surahNum}`);
        }
    };

    // REQUIREMENT 1: Show loading state until complete surah API data is loaded
    // Only render content after surah and all ayahs are loaded from API
    if (loading || !surah || ayahs.length === 0 || !currentAyah) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">
                        {!surah ? 'Memuat data surah...' : 
                         ayahs.length === 0 ? 'Memuat ayat-ayat...' :
                         !currentAyah ? 'Menyiapkan ayat...' : 'Memuat...'}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Mengambil data lengkap dari API: /api/surahs/{number}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state only if there's an actual error and not just loading
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Terjadi kesalahan memuat surah</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            {/* Add custom styles for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -100%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -100%) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                /* Custom grid columns for responsive navigation */
                @media (min-width: 1024px) {
                    .grid-cols-15 {
                        grid-template-columns: repeat(15, minmax(0, 1fr));
                    }
                }
            `}</style>

            <SEOHead 
                title={`${surah.name_latin || surah.name_english} (${surah.name_arabic}) - IndoQuran`}
                description={
                    surah.description_short || 
                    `Baca dan dengarkan Surah ${surah.name_latin || surah.name_english} dengan teks Arab, terjemahan, dan bacaan audio. Surah ke-${surah.number} dengan ${maxAyahNumber} ayat.`
                }
            />

            {/* Floating Share Button for Selected Text */}
            {showFloatingShare && (
                <div 
                    className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: `${selectionPosition.x}px`,
                        top: `${selectionPosition.y}px`
                    }}
                >
                    <button
                        onClick={shareSelectedText}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all animate-fadeIn"
                    >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>Bagikan ke WhatsApp</span>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Kembali ke beranda"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm">Beranda</span>
                        </button>
                        
                        <div className="text-center flex-1 mx-4">
                            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                                {surah.name_latin || surah.name_english}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                <span className="hidden sm:inline">Ayat {currentAyahNumber} dari {maxAyahNumber} • </span>
                                <span className="sm:hidden">{currentAyahNumber}/{maxAyahNumber} • </span>
                                {completionPercentage}%
                            </p>
                        </div>

                        <div className="w-16 sm:w-8"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Surah Details Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
                    <div className="text-center mb-6">
                        {/* Surah Title */}
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {surah.name_latin || surah.name_english}
                            </h1>
                            <p className="text-6xl font-arabic text-green-700 mb-2 text-center" dir="rtl">
                                {surah.name_arabic}
                            </p>
                            <p className="text-lg text-gray-600">
                                {surah.name_indonesian}
                            </p>
                        </div>

                        {/* Surah Info */}
                        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Surah ke-{surah.number}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>{maxAyahNumber} ayat</span>
                            </div>
                            {surah.revelation_place && (
                                <div className="flex items-center space-x-2">
                                    <span>{surah.revelation_place}</span>
                                </div>
                            )}
                        </div>

                        {/* Description Controls */}
                        {(surah.description_short || surah.description_long || surah.description) && (
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-4">
                                {/* Toggle Description Short */}
                                {(surah.description_short || surah.description) && (
                                    <button
                                        onClick={() => setShowDescriptionShort(!showDescriptionShort)}
                                        className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm border group w-full sm:w-auto ${
                                            showDescriptionShort 
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-green-200' 
                                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 hover:from-green-200 hover:to-emerald-200'
                                        }`}
                                        title="Toggle ringkasan surah (Ctrl+Shift+R)"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">
                                            {showDescriptionShort ? 'Sembunyikan' : 'Tampilkan'} Ringkasan
                                        </span>
                                        {showDescriptionShort ? (
                                            <ChevronUpIcon className="w-4 h-4" />
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4" />
                                        )}
                                        <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                            (⌘⇧R)
                                        </span>
                                    </button>
                                )}

                                {/* Toggle Description Long */}
                                {surah.description_long && (
                                    <button
                                        onClick={() => setShowDescriptionLong(!showDescriptionLong)}
                                        className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm border group w-full sm:w-auto ${
                                            showDescriptionLong 
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-blue-200' 
                                                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-indigo-200'
                                        }`}
                                        title="Toggle penjelasan lengkap surah (Ctrl+Shift+D)"
                                    >
                                        <InformationCircleIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            <span className="hidden sm:inline">{showDescriptionLong ? 'Sembunyikan' : 'Tampilkan'} Penjelasan Lengkap</span>
                                            <span className="sm:hidden">{showDescriptionLong ? 'Sembunyikan' : 'Tampilkan'} Detail</span>
                                        </span>
                                        {showDescriptionLong ? (
                                            <ChevronUpIcon className="w-4 h-4" />
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4" />
                                        )}
                                        <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                            (⌘⇧D)
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Description Short */}
                        {(surah.description_short || surah.description) && showDescriptionShort && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-4 text-left border border-green-100 shadow-sm animate-fadeIn">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mt-1">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-green-800 font-medium mb-2 text-sm">Ringkasan Surah</h4>
                                        <div 
                                            className="text-green-800 text-sm leading-relaxed prose prose-sm max-w-none prose-green"
                                            dangerouslySetInnerHTML={{ 
                                                __html: surah.description_short || 
                                                        surah.description || 
                                                        `Surah ${surah.name_latin} adalah surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${surah.total_ayahs} ayat dan diturunkan di ${surah.revelation_place}.`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description Long */}
                        {surah.description_long && showDescriptionLong && (
                            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 text-left shadow-sm animate-fadeIn">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-blue-800 font-medium mb-3 text-sm">Penjelasan Lengkap Surah</h4>
                                        <div 
                                            className="text-blue-800 text-sm leading-relaxed prose prose-sm max-w-none prose-blue"
                                            dangerouslySetInnerHTML={{ __html: surah.description_long }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                        {/* Font Size Controls */}
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                            <button
                                onClick={() => changeFontSize(-2)}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50 border"
                            >
                                A-
                            </button>
                            <span className="text-sm text-gray-600 px-2">Font</span>
                            <button
                                onClick={() => changeFontSize(2)}
                                className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-50 border"
                            >
                                A+
                            </button>
                        </div>

                        {/* Mobile: Group secondary buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            {/* Tafsir Toggle Button */}
                            <button
                                onClick={toggleTafsir}
                                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors group w-full sm:w-auto ${
                                    showTafsir
                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                title="Tampilkan/sembunyikan tafsir ayat (Ctrl+T)"
                            >
                                <BookOpenIcon className="w-4 h-4" />
                                <span className="text-sm sm:text-base">{showTafsir ? 'Sembunyikan' : 'Tampilkan'} Tafsir</span>
                                <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                    (⌘T)
                                </span>
                            </button>

                            {/* Share Surah Button */}
                            <button
                                onClick={shareSurah}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors group w-full sm:w-auto"
                                title="Bagikan informasi surah ini (Ctrl+Shift+U)"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                                <span className="text-sm sm:text-base">Bagikan Surah</span>
                                <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                    (⌘⇧U)
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Single Ayah Display */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6" id="ayah-content">
                    {currentAyah ? (
                        <>
                            {/* Bismillah or Ayah Content */}
                            <div className="text-center mb-8">
                                <div className="mb-6" id={`ayah-${currentAyahNumber}-arabic`}>
                                    <p 
                                        ref={currentAyahRef}
                                        className="font-arabic text-gray-800 leading-loose"
                                        style={{ 
                                            fontSize: `${fontSize + 20}px`
                                        }}
                                        dir="rtl"
                                    >
                                        {currentAyah.text_arabic}
                                    </p>
                                </div>
                                
                                {/* Latin Transliteration */}
                                {currentAyah.text_latin && (
                                    <div className="mb-6">
                                        <p className="text-gray-600 text-base italic leading-relaxed max-w-4xl mx-auto">
                                            {currentAyah.text_latin}
                                        </p>
                                    </div>
                                )}
                                
                                {(currentAyah.text_indonesian || currentAyah.translation_id) && (
                                    <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
                                        {currentAyah.text_indonesian || currentAyah.translation_id}
                                    </p>
                                )}

                                {/* Tafsir Section */}
                                {showTafsir && (
                                    <div className="mt-6 max-w-4xl mx-auto">
                                        {currentAyah.tafsir ? (
                                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <BookOpenIcon className="w-5 h-5 text-purple-600" />
                                                        <h3 className="text-lg font-semibold text-purple-800">
                                                            Tafsir Ayat {currentAyahNumber}
                                                        </h3>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleTafsirExpanded(currentAyahNumber)}
                                                        className="text-purple-600 hover:text-purple-800 transition-colors"
                                                        title={expandedTafsirs.has(currentAyahNumber) ? 'Ringkas tafsir' : 'Perluas tafsir'}
                                                    >
                                                        {expandedTafsirs.has(currentAyahNumber) ? (
                                                            <ChevronUpIcon className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDownIcon className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className={`prose prose-purple max-w-none ${
                                                    expandedTafsirs.has(currentAyahNumber) ? '' : 'line-clamp-3'
                                                }`}>
                                                    <p className="text-purple-700 leading-relaxed text-justify">
                                                        {currentAyah.tafsir}
                                                    </p>
                                                </div>
                                                {!expandedTafsirs.has(currentAyahNumber) && currentAyah.tafsir.length > 200 && (
                                                    <button
                                                        onClick={() => toggleTafsirExpanded(currentAyahNumber)}
                                                        className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
                                                    >
                                                        Baca selengkapnya...
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <div className="flex items-center space-x-2 text-gray-500">
                                                    <BookOpenIcon className="w-5 h-5" />
                                                    <p className="text-sm">
                                                        Tafsir untuk ayat {currentAyahNumber} belum tersedia.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Ayah Action Buttons */}
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
                                {/* Share Ayah Button */}
                                <button
                                    onClick={() => shareAyah(currentAyahNumber)}
                                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors group text-sm sm:text-base"
                                    title="Bagikan ayat ini ke WhatsApp (Ctrl+Shift+S)"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Bagikan Ayat</span>
                                    <span className="sm:hidden">Bagikan</span>
                                    <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                        (⌘⇧S)
                                    </span>
                                </button>

                                {/* Bookmark Ayah Button */}
                                {user && (
                                    <button
                                        onClick={() => toggleBookmark(currentAyahNumber)}
                                        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                                            bookmarkedAyahs.has(currentAyahNumber)
                                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        title="Bookmark ayat ini"
                                    >
                                        {bookmarkedAyahs.has(currentAyahNumber) ? (
                                            <BookmarkSolidIcon className="w-4 h-4" />
                                        ) : (
                                            <BookmarkOutlineIcon className="w-4 h-4" />
                                        )}
                                        <span>Bookmark</span>
                                    </button>
                                )}

                                {/* Copy Options Dropdown */}
                                <div className="relative copy-dropdown-container">
                                    <button
                                        ref={copyButtonRef}
                                        onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                                        className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                                        title="Salin teks ayat"
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                        <span>Salin</span>
                                        <ChevronDownIcon className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Audio Toggle Button */}
                                <button
                                    onClick={() => 
                                        isPlaying && currentPlayingAyah === currentAyahNumber 
                                            ? pauseAudio() 
                                            : playAyah(currentAyahNumber)
                                    }
                                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm sm:text-base"
                                    title={isPlaying && currentPlayingAyah === currentAyahNumber ? 'Pause audio' : 'Putar audio'}
                                >
                                    {isPlaying && currentPlayingAyah === currentAyahNumber ? (
                                        <>
                                            <SpeakerXMarkIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Pause</span>
                                            <span className="sm:hidden">⏸</span>
                                        </>
                                    ) : (
                                        <>
                                            <SpeakerWaveIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Dengar</span>
                                            <span className="sm:hidden">▶</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Portal-based Dropdown - Enhanced mobile positioning */}
                            {showCopyDropdown && createPortal(
                                <div 
                                    className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] copy-dropdown-portal"
                                    style={{
                                        top: `${dropdownPosition.top}px`,
                                        left: `${Math.max(8, Math.min(window.innerWidth - 200, dropdownPosition.left))}px` // Keep within viewport
                                    }}
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                copyAyahText(currentAyahNumber, 'arabic');
                                                setShowCopyDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            📖 Salin Teks Arab
                                        </button>
                                        {currentAyah?.text_latin && (
                                            <button
                                                onClick={() => {
                                                    copyAyahText(currentAyahNumber, 'latin');
                                                    setShowCopyDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                � Salin Transliterasi
                                            </button>
                                        )}
                                        {(currentAyah?.text_indonesian || currentAyah?.translation_id) && (
                                            <button
                                                onClick={() => {
                                                    copyAyahText(currentAyahNumber, 'indonesian');
                                                    setShowCopyDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                🇮🇩 Salin Terjemahan
                                            </button>
                                        )}
                                        {currentAyah?.tafsir && (
                                            <button
                                                onClick={() => {
                                                    copyAyahText(currentAyahNumber, 'tafsir');
                                                    setShowCopyDropdown(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                📖 Salin Tafsir
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                copyAyahText(currentAyahNumber, 'all');
                                                setShowCopyDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                                        >
                                            📄 Salin Semua Teks
                                        </button>
                                    </div>
                                </div>,
                                document.body
                            )}

                            {/* Navigation Controls */}
                            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
                                <button
                                    onClick={goToPreviousAyah}
                                    disabled={availableAyahNumbers.indexOf(currentAyahNumber) <= 0}
                                    className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                                >
                                    <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">Prev</span>
                                </button>

                                {/* Play Button */}
                                <button
                                    onClick={() => 
                                        isPlaying && currentPlayingAyah === currentAyahNumber 
                                            ? pauseAudio() 
                                            : playAyah(currentAyahNumber)
                                    }
                                    className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
                                    title={isPlaying && currentPlayingAyah === currentAyahNumber ? 'Pause audio' : 'Putar audio'}
                                >
                                    {isPlaying && currentPlayingAyah === currentAyahNumber ? (
                                        <PauseIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                                    ) : (
                                        <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
                                    )}
                                </button>

                                <button
                                    onClick={goToNextAyah}
                                    disabled={availableAyahNumbers.indexOf(currentAyahNumber) >= availableAyahNumbers.length - 1}
                                    className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">Next</span>
                                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Ayat tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Ayah Grid Navigation */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Navigasi Ayat</h3>
                        <div className="text-xs sm:text-sm text-gray-500">
                            Ayat {currentAyahNumber} dari {maxAyahNumber}
                        </div>
                    </div>
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-80 sm:max-h-96 overflow-y-auto">
                        {availableAyahNumbers.map((ayahNum) => {
                            const isCurrentAyah = ayahNum === currentAyahNumber;
                            return (
                                <div key={ayahNum} className="relative">
                                    <button
                                        onClick={() => navigateToAyah(ayahNum)}
                                        className={`
                                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs sm:text-sm font-medium transition-all
                                            ${isCurrentAyah 
                                                ? 'bg-green-600 text-white shadow-lg scale-105' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                            }
                                        `}
                                        title={`Pergi ke ayat ${ayahNum}`}
                                    >
                                        {ayahNum}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimpleSurahPage;
