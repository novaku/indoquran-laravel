import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { getPageSEOData, generateSurahSEOKeywords } from '../utils/seoUtils';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298.347.446.52.149.174.198.298.298.497.099.198.05.371-.025.52-.075.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
    </svg>
);

// Convert English numerals to Arabic-Indic numerals
const convertToArabicNumerals = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const result = num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
    console.log(`🔢 Converting ${num} to Arabic numerals: ${result}`);
    return result;
};

function SurahDetailPage() {
    console.log('🚀 SurahDetailPage component loading...');
    // Add visible indicator that React is working
    useEffect(() => {
        document.title = 'IndoQuran - Loading...';
        console.log('🔄 SurahDetailPage useEffect triggered');
    }, []);
    
    const { user } = useAuth();
    const { number, ayahNumber } = useParams();
    const navigate = useNavigate();
    
    console.log('📋 URL Params:', { number, ayahNumber });
    console.log('🔧 User:', user ? 'Logged in' : 'Not logged in');
    
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
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [fontSize, setFontSize] = useState(24);
    const [showDescriptionShort, setShowDescriptionShort] = useState(true);
    const [showDescriptionLong, setShowDescriptionLong] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [showFloatingShare, setShowFloatingShare] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [showTafsir, setShowTafsir] = useState(false);
    const [expandedTafsirs, setExpandedTafsirs] = useState(new Set());

    // Full Surah Audio Player State
    const [isSurahPlaying, setIsSurahPlaying] = useState(false);
    const [isSurahAudioLoading, setIsSurahAudioLoading] = useState(false);
    const [surahAudioElement, setSurahAudioElement] = useState(null);
    const [currentPlayingAyahIndex, setCurrentPlayingAyahIndex] = useState(0);
    const [isAutoPlayingSequence, setIsAutoPlayingSequence] = useState(false);
    const [selectedQari, setSelectedQari] = useState('03'); // Default to Sudais

    const ayahRefs = useRef({});
    const currentAyahRef = useRef(null);
    const isNavigatingRef = useRef(false); // Track navigation state to prevent race conditions
    const isAutoPlayingRef = useRef(false); // Track auto-playing state with ref for closures

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

    // Get current ayah - simplified and reliable approach with type-safe comparison and fallback
    const currentAyah = ayahs.find(ayah => parseInt(ayah.ayah_number) === parseInt(currentAyahNumber)) || 
                        (ayahs.length > 0 ? ayahs[0] : null); // Fallback to first ayah if current not found
    
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
            } : 'No ayahs available',
            usingFallback: ayahs.length > 0 && !ayahs.find(ayah => parseInt(ayah.ayah_number) === parseInt(currentAyahNumber))
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
                console.log(`🌐 Full API URL: ${window.location.origin}/api/surahs/${number}`);
                console.log(`🔑 Token available: ${token ? 'Yes' : 'No'}`);
                
                // REQUIREMENT 1: Fetch complete surah details and ayahs in one call from API
                const surahResponse = await fetchWithAuth(`/api/surahs/${number}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                console.log(`📡 API Response:`, {
                    status: surahResponse.status,
                    statusText: surahResponse.statusText,
                    ok: surahResponse.ok,
                    url: surahResponse.url
                });
                
                if (!surahResponse.ok) {
                    const errorText = await surahResponse.text();
                    console.error(`📡 API Error Response:`, errorText);
                    throw new Error(`Failed to fetch surah: ${surahResponse.status} ${surahResponse.statusText}`);
                }
                const surahResult = await surahResponse.json();
                
                console.log(`📊 API Response Data:`, {
                    status: surahResult.status,
                    hasData: !!surahResult.data,
                    hasSurah: !!(surahResult.data && surahResult.data.surah),
                    hasAyahs: !!(surahResult.data && surahResult.data.ayahs),
                    ayahsCount: surahResult.data && surahResult.data.ayahs ? surahResult.data.ayahs.length : 0
                });
                
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
                console.error('❌ Error fetching surah data:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    stack: error.stack,
                    surahNumber: number,
                    url: `/api/surahs/${number}`
                });
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
        console.log(`🔗 URL Change Detected - Surah: ${number}, Ayah: ${ayahNumber || 'undefined'}, isAutoPlayingSequence: ${isAutoPlayingSequence}`);
        
        if (ayahNumber) {
            const ayahNum = parseInt(ayahNumber);
            
            // Update state when URL changes (this is the primary way state gets updated)
            if (ayahNum !== currentAyahNumber) {
                console.log(`🔄 REQUIREMENT 2: URL ayah changed from ${currentAyahNumber} to ${ayahNum}`);
                console.log(`✅ URL Pattern: /surah/${number}/${ayahNum}`);
                setCurrentAyahNumber(ayahNum);
                
                // Auto-scroll to ayat when coming from external link (like Tafsir Maudhui)
                // Only scroll if not auto-playing (to avoid interference with sequential playback scrolling)
                if (!isAutoPlayingSequence) {
                    setTimeout(() => {
                        scrollToCurrentAyah(ayahNum);
                    }, 100);
                }
                
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
    }, [ayahNumber, user, number, currentAyahNumber, isAutoPlayingSequence]);

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
            setIsAudioLoading(true);
            
            // Stop any currently playing audio (including full surah audio)
            if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
            }

            // Stop full surah audio if playing
            if (surahAudioElement || isAutoPlayingSequence) {
                stopFullSurah();
            }

            const ayah = ayahs.find(a => 
                parseInt(a.ayah_number) === parseInt(ayahNum) || 
                parseInt(a.number) === parseInt(ayahNum) ||
                parseInt(a.verse_number) === parseInt(ayahNum)
            );
            
            if (!ayah) {
                console.error(`❌ Ayah ${ayahNum} not found in data`);
                setIsAudioLoading(false);
                return;
            }

            let audioUrl = null;
            
            // Handle different audio URL formats - Use selected Qari from full surah player
            if (ayah.audio_url) {
                audioUrl = ayah.audio_url;
            } else if (ayah.audio_urls) {
                const audioUrls = typeof ayah.audio_urls === 'string' 
                    ? JSON.parse(ayah.audio_urls) 
                    : ayah.audio_urls;
                
                if (Array.isArray(audioUrls) && audioUrls.length > 0) {
                    audioUrl = audioUrls[0];
                } else if (typeof audioUrls === 'object' && audioUrls !== null) {
                    // Use selected Qari first, then fallback to other options
                    if (audioUrls[selectedQari]) {
                        audioUrl = audioUrls[selectedQari];
                    } else {
                        // Fallback to other qaris if selected one is not available
                        const fallbackQaris = ['03', '05', '01', '02', '04', 'alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit'];
                        
                        for (const qari of fallbackQaris) {
                            if (qari !== selectedQari && audioUrls[qari]) {
                                audioUrl = audioUrls[qari];
                                break;
                            }
                        }
                        
                        // If still no URL found, get first available
                        if (!audioUrl) {
                            const firstKey = Object.keys(audioUrls)[0];
                            if (firstKey) {
                                audioUrl = audioUrls[firstKey];
                            }
                        }
                    }
                }
            }
            
            if (!audioUrl) {
                console.error('❌ No audio URL found for ayah', ayahNum);
                setIsAudioLoading(false);
                alert('Audio tidak tersedia untuk ayat ini');
                return;
            }
            
            const audio = new Audio(audioUrl);
            
            // Set up event listeners
            audio.onloadstart = () => {
                setIsAudioLoading(true);
            };
            
            audio.oncanplay = () => {
                setIsAudioLoading(false);
            };
            
            audio.onplay = () => {
                setIsPlaying(true);
                setCurrentPlayingAyah(ayahNum);
                setIsAudioLoading(false);
            };
            
            audio.onpause = () => {
                setIsPlaying(false);
                setCurrentPlayingAyah(null);
                setIsAudioLoading(false);
            };
            
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentPlayingAyah(null);
                setAudioElement(null);
                setIsAudioLoading(false);
            };
            
            audio.onerror = (e) => {
                console.error('❌ Audio error:', {
                    error: e,
                    code: audio.error?.code,
                    message: audio.error?.message,
                    url: audioUrl
                });
                setIsPlaying(false);
                setCurrentPlayingAyah(null);
                setAudioElement(null);
                setIsAudioLoading(false);
                
                // Show user-friendly error message
                let errorMessage = 'Gagal memutar audio. ';
                if (audio.error?.code === 4) {
                    errorMessage += 'Format audio tidak didukung.';
                } else if (audio.error?.code === 3) {
                    errorMessage += 'Audio rusak atau tidak dapat dimuat.';
                } else if (audio.error?.code === 2) {
                    errorMessage += 'Koneksi terputus saat memuat audio.';
                } else {
                    errorMessage += 'Silakan coba lagi.';
                }
                alert(errorMessage);
            };
            
            // Store audio element reference
            setAudioElement(audio);
            
            // Attempt to play
            try {
                await audio.play();
            } catch (playError) {
                console.error('❌ Audio play() failed:', playError);
                setIsPlaying(false);
                setCurrentPlayingAyah(null);
                setAudioElement(null);
                setIsAudioLoading(false);
                
                if (playError.name === 'NotAllowedError') {
                    alert('Browser menghalangi autoplay audio. Silakan klik tombol play untuk memutar audio.');
                } else if (playError.name === 'NotSupportedError') {
                    alert('Format audio tidak didukung di browser ini.');
                } else {
                    alert('Gagal memutar audio. Periksa koneksi internet Anda.');
                }
            }
        } catch (error) {
            console.error('❌ Error in playAyah function:', error);
            setIsPlaying(false);
            setCurrentPlayingAyah(null);
            setAudioElement(null);
            setIsAudioLoading(false);
            alert('Terjadi kesalahan saat memutar audio.');
        }
    };

    const pauseAudio = () => {
        if (audioElement) {
            try {
                audioElement.pause();
                setIsAudioLoading(false);
            } catch (error) {
                console.error('❌ Error pausing audio:', error);
                setIsAudioLoading(false);
            }
        } else {
            setIsAudioLoading(false);
        }
    };

    // Full Surah Audio Player Functions
    const playFullSurah = async () => {
        try {
            // Stop any individual ayah audio
            if (audioElement) {
                audioElement.pause();
                setAudioElement(null);
                setIsPlaying(false);
                setCurrentPlayingAyah(null);
            }

            setIsSurahAudioLoading(true);
            setIsAutoPlayingSequence(true);
            isAutoPlayingRef.current = true; // Set ref for closure access
            
            // Always start from the first ayah (index 0) when playing full surah
            setCurrentPlayingAyahIndex(0);
            
            // Reset the URL and ayah card to the first ayah for full synchronization
            if (ayahs.length > 0) {
                const firstAyahNumber = ayahs[0].ayah_number;
                console.log(`🔄 Resetting to first ayah: ${firstAyahNumber}`);
                
                // Update the current ayah number state
                setCurrentAyahNumber(firstAyahNumber);
                
                // Navigate to the first ayah URL to keep everything in sync
                navigate(`/surah/${number}/${firstAyahNumber}`, { replace: true });
            }
            
            // Start playing from the first ayah
            await playAyahInSequence(0);
        } catch (error) {
            console.error('❌ Error starting full surah playback:', error);
            setIsSurahAudioLoading(false);
            setIsAutoPlayingSequence(false);
            isAutoPlayingRef.current = false;
            alert('Gagal memutar surah lengkap. Silakan coba lagi.');
        }
    };

    const playAyahInSequence = async (ayahIndex) => {
        console.log(`🎵 playAyahInSequence called with index: ${ayahIndex}/${ayahs.length}, isAutoPlayingSequence: ${isAutoPlayingSequence}`);
        
        // Check if we should continue playing
        if (ayahIndex >= ayahs.length) {
            // End of surah reached
            console.log('✅ Full surah playback completed');
            setIsSurahPlaying(false);
            setIsAutoPlayingSequence(false);
            isAutoPlayingRef.current = false;
            setCurrentPlayingAyahIndex(0);
            setSurahAudioElement(null);
            setIsSurahAudioLoading(false);
            return;
        }

        const ayah = ayahs[ayahIndex];
        if (!ayah) {
            console.error(`❌ Ayah at index ${ayahIndex} not found`);
            // Skip to next ayah
            const nextIndex = ayahIndex + 1;
            if (nextIndex < ayahs.length) {
                setTimeout(() => playAyahInSequence(nextIndex), 500);
            }
            return;
        }

        console.log(`🎵 Playing ayah ${ayah.ayah_number} in sequence (${ayahIndex + 1}/${ayahs.length})`);

        try {
            // Clean up any previous surah audio element, but only if it's not the current one
            if (surahAudioElement && surahAudioElement.src !== '') {
                try {
                    if (!surahAudioElement.paused) {
                        surahAudioElement.pause();
                    }
                    surahAudioElement.currentTime = 0;
                } catch (cleanupError) {
                    console.log('Audio cleanup error (non-critical):', cleanupError);
                }
            }
            
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
                } else if (typeof audioUrls === 'object' && audioUrls !== null) {
                    // Use selected Qari first, then fallback to other options
                    if (audioUrls[selectedQari]) {
                        audioUrl = audioUrls[selectedQari];
                    } else {
                        // Fallback to other qaris if selected one is not available
                        const fallbackQaris = ['03', '05', '01', '02', '04', 'alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit'];
                        
                        for (const qari of fallbackQaris) {
                            if (qari !== selectedQari && audioUrls[qari]) {
                                audioUrl = audioUrls[qari];
                                break;
                            }
                        }
                        
                        // If still no URL found, get first available
                        if (!audioUrl) {
                            const firstKey = Object.keys(audioUrls)[0];
                            if (firstKey) {
                                audioUrl = audioUrls[firstKey];
                            }
                        }
                    }
                }
            }
            
            if (!audioUrl) {
                console.log(`⚠️ No audio URL found for ayah ${ayah.ayah_number}, skipping...`);
                // Skip to next ayah after a short delay
                const nextIndex = ayahIndex + 1;
                if (nextIndex < ayahs.length) {
                    setTimeout(() => playAyahInSequence(nextIndex), 500);
                } else {
                    console.log('✅ Reached end of surah - no more ayahs to play');
                    setIsSurahPlaying(false);
                    setIsAutoPlayingSequence(false);
                    isAutoPlayingRef.current = false;
                    setCurrentPlayingAyahIndex(0);
                    setIsSurahAudioLoading(false);
                }
                return;
            }

            const audio = new Audio(audioUrl);
            
            // Set up event listeners for sequence playback
            audio.onloadstart = () => {
                setIsSurahAudioLoading(true);
            };
            
            audio.oncanplay = () => {
                setIsSurahAudioLoading(false);
            };
            
            audio.onplay = () => {
                console.log(`▶️ Audio started playing: ayah ${ayah.ayah_number}, sequence active: ${isAutoPlayingSequence}`);
                setIsSurahPlaying(true);
                setCurrentPlayingAyahIndex(ayahIndex);
                setIsSurahAudioLoading(false);
                
                // Update the current ayah number to activate the ayah card
                const ayahNum = parseInt(ayah.ayah_number);
                console.log(`🔄 Updating currentAyahNumber from ${currentAyahNumber} to ${ayahNum} during surah playback`);
                
                // Set navigation flag to prevent interference from validation effects
                isNavigatingRef.current = true;
                
                // Update both state and URL with immediate state update
                setCurrentAyahNumber(ayahNum);
                console.log(`🔗 Navigating to /surah/${number}/${ayahNum} during surah playback`);
                navigate(`/surah/${number}/${ayahNum}`, { replace: true });
                
                // Force a second state update to ensure it takes effect (React batching workaround)
                setTimeout(() => {
                    console.log(`🔄 Force updating currentAyahNumber to ${ayahNum} (backup)`);
                    setCurrentAyahNumber(ayahNum);
                    isNavigatingRef.current = false;
                }, 50);
                
                // Scroll to current ayah being played (after a small delay to ensure state is updated)
                setTimeout(() => {
                    scrollToCurrentAyah(ayahNum);
                }, 150);
            };
            
            audio.onended = () => {
                console.log(`✅ Ayah ${ayah.ayah_number} finished playing (index ${ayahIndex}). isAutoPlayingRef: ${isAutoPlayingRef.current}`);
                
                // Clear current audio element before moving to next
                setSurahAudioElement(null);
                
                // Use ref to check if auto-playing should continue (more reliable than state in closure)
                const nextIndex = ayahIndex + 1;
                if (isAutoPlayingRef.current && nextIndex < ayahs.length) {
                    console.log(`🔄 Auto-playing next ayah: ${nextIndex} (${ayahs[nextIndex]?.ayah_number})`);
                    setTimeout(() => {
                        console.log(`🔍 Double-checking before next ayah: isAutoPlayingRef=${isAutoPlayingRef.current}, nextIndex=${nextIndex}`);
                        if (isAutoPlayingRef.current) {
                            playAyahInSequence(nextIndex);
                        } else {
                            console.log('⚠️ Auto-playing was stopped, not continuing');
                        }
                    }, 300);
                } else if (nextIndex >= ayahs.length) {
                    console.log('✅ Full surah playback completed - no more ayahs');
                    setIsSurahPlaying(false);
                    setIsAutoPlayingSequence(false);
                    isAutoPlayingRef.current = false;
                    setCurrentPlayingAyahIndex(0);
                    setIsSurahAudioLoading(false);
                } else {
                    console.log('⚠️ Auto-playing was stopped during playback');
                }
            };
            
            audio.onerror = (e) => {
                console.error(`❌ Audio error for ayah ${ayah.ayah_number}:`, e);
                // Clear current audio element on error
                setSurahAudioElement(null);
                
                // Skip to next ayah on error
                const nextIndex = ayahIndex + 1;
                if (nextIndex < ayahs.length) {
                    console.log(`🔄 Skipping to next ayah due to audio error: ${nextIndex}`);
                    setTimeout(() => playAyahInSequence(nextIndex), 300);
                } else {
                    console.log('✅ Reached end of surah after audio error');
                    setIsSurahPlaying(false);
                    setIsAutoPlayingSequence(false);
                    isAutoPlayingRef.current = false;
                    setCurrentPlayingAyahIndex(0);
                    setIsSurahAudioLoading(false);
                }
            };
            
            // Store current audio element
            setSurahAudioElement(audio);
            
            // Start playback
            try {
                console.log(`🔄 Attempting to play ayah ${ayah.ayah_number} with URL: ${audioUrl.substring(0, 50)}...`);
                await audio.play();
                console.log(`✅ Successfully started playing ayah ${ayah.ayah_number}`);
            } catch (playError) {
                console.error(`❌ Failed to play ayah ${ayah.ayah_number}:`, playError);
                // Clear audio element and continue to next
                setSurahAudioElement(null);
                // Continue to next ayah on playback error
                const nextIndex = ayahIndex + 1;
                if (nextIndex < ayahs.length) {
                    console.log(`🔄 Skipping to next ayah due to playback error: ${nextIndex}`);
                    setTimeout(() => playAyahInSequence(nextIndex), 300);
                } else {
                    console.log('✅ Reached end of surah after playback error');
                    setIsSurahPlaying(false);
                    setIsAutoPlayingSequence(false);
                    isAutoPlayingRef.current = false;
                    setCurrentPlayingAyahIndex(0);
                    setIsSurahAudioLoading(false);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error playing ayah ${ayah.ayah_number} in sequence:`, error);
            // Skip to next ayah on error
            const nextIndex = ayahIndex + 1;
            if (nextIndex < ayahs.length) {
                console.log(`🔄 Skipping to next ayah due to general error: ${nextIndex}`);
                setTimeout(() => playAyahInSequence(nextIndex), 500);
            } else {
                console.log('✅ Reached end of surah after general error');
                setIsSurahPlaying(false);
                setIsAutoPlayingSequence(false);
                isAutoPlayingRef.current = false;
                setCurrentPlayingAyahIndex(0);
                setIsSurahAudioLoading(false);
            }
        }
    };

    const pauseFullSurah = () => {
        console.log('⏸️ Pausing full surah audio...');
        setIsAutoPlayingSequence(false);
        isAutoPlayingRef.current = false; // Update ref
        
        if (surahAudioElement) {
            try {
                surahAudioElement.pause();
                setIsSurahPlaying(false);
                setIsSurahAudioLoading(false);
                console.log('✅ Full surah audio paused successfully');
            } catch (error) {
                console.error('❌ Error pausing full surah audio:', error);
                setIsSurahAudioLoading(false);
            }
        } else {
            console.log('⚠️ No surah audio element to pause');
            setIsSurahPlaying(false);
            setIsSurahAudioLoading(false);
        }
    };

    const stopFullSurah = () => {
        console.log('⏹️ Stopping full surah audio...');
        setIsAutoPlayingSequence(false);
        isAutoPlayingRef.current = false; // Update ref
        setIsSurahPlaying(false);
        setCurrentPlayingAyahIndex(0);
        setIsSurahAudioLoading(false);
        
        if (surahAudioElement) {
            try {
                surahAudioElement.pause();
                surahAudioElement.currentTime = 0;
                setSurahAudioElement(null);
                console.log('✅ Full surah audio stopped successfully');
            } catch (error) {
                console.error('❌ Error stopping full surah audio:', error);
            }
        }
    };

    const skipToNextAyah = () => {
        if (isAutoPlayingSequence && currentPlayingAyahIndex < ayahs.length - 1) {
            console.log(`⏭️ Skipping to next ayah (${currentPlayingAyahIndex + 1})`);
            
            // Stop current audio
            if (surahAudioElement) {
                surahAudioElement.pause();
            }
            
            // Play next ayah
            playAyahInSequence(currentPlayingAyahIndex + 1);
        }
    };

    const skipToPreviousAyah = () => {
        if (isAutoPlayingSequence && currentPlayingAyahIndex > 0) {
            console.log(`⏮️ Skipping to previous ayah (${currentPlayingAyahIndex - 1})`);
            
            // Stop current audio
            if (surahAudioElement) {
                surahAudioElement.pause();
            }
            
            // Play previous ayah
            playAyahInSequence(currentPlayingAyahIndex - 1);
        }
    };

    const shareAyah = async (ayahNum) => {
        // Validate input parameters
        if (!ayahNum || isNaN(ayahNum)) {
            console.error('❌ ShareAyah: Invalid ayah number provided:', ayahNum);
            alert('Nomor ayat tidak valid. Silakan coba lagi.');
            return;
        }
        
        if (!surah || ayahs.length === 0) {
            console.error('❌ ShareAyah: Data surah atau ayat belum dimuat');
            alert('Data Al-Qur\'an sedang dimuat. Silakan tunggu sebentar dan coba lagi.');
            return;
        }
        
        console.log('🔄 ShareAyah called with:', {
            ayahNum,
            currentAyahNumber,
            ayahsLength: ayahs.length,
            firstFewAyahs: ayahs.slice(0, 3).map(a => ({
                ayah_number: a.ayah_number,
                number: a.number,
                verse_number: a.verse_number
            }))
        });
        
        const ayah = ayahs.find(a => 
            parseInt(a.ayah_number) === parseInt(ayahNum) || 
            parseInt(a.number) === parseInt(ayahNum) ||
            parseInt(a.verse_number) === parseInt(ayahNum)
        );
        
        console.log('🎯 ShareAyah found ayah:', {
            found: !!ayah,
            ayah: ayah ? {
                ayah_number: ayah.ayah_number,
                number: ayah.number,
                text_arabic: ayah.text_arabic?.substring(0, 50) + '...',
                text_indonesian: ayah.text_indonesian?.substring(0, 50) + '...'
            } : null
        });
        
        if (ayah && surah) {
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
            
            shareText += `📍 Surah ${surah.name_latin} (${surah.name_arabic}) - Ayat ${ayahNum}\n`;
            shareText += `🔗 Baca selengkapnya: ${window.location.origin}/surah/${number}/${ayahNum}\n\n`;
            shareText += `📱 IndoQuran - Baca Al-Qur'an dengan mudah`;

            // Share via WhatsApp only
            const encodedText = encodeURIComponent(shareText);
            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
            
            console.log('📤 Opening WhatsApp share:', {
                ayahNumber: ayahNum,
                surahName: surah.name_latin,
                shareTextLength: shareText.length,
                encodedTextLength: encodedText.length,
                whatsappUrl: whatsappUrl.substring(0, 100) + '...',
                shareTextPreview: shareText.substring(0, 200) + '...'
            });
            
            try {
                // Check if device supports WhatsApp app
                const userAgent = navigator.userAgent;
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
                
                if (isMobile) {
                    // Try WhatsApp app first on mobile
                    const appUrl = `whatsapp://send?text=${encodedText}`;
                    window.location.href = appUrl;
                    
                    // Fallback to web WhatsApp after a delay
                    setTimeout(() => {
                        window.open(whatsappUrl, '_blank');
                    }, 2000);
                } else {
                    // Use web WhatsApp on desktop
                    window.open(whatsappUrl, '_blank');
                }
                
                console.log('✅ WhatsApp share initiated successfully');
                
                // Show success message
                const alertDiv = document.createElement('div');
                alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all text-sm';
                alertDiv.textContent = '✅ WhatsApp terbuka untuk berbagi ayat!';
                document.body.appendChild(alertDiv);
                
                setTimeout(() => {
                    alertDiv.style.opacity = '0';
                    setTimeout(() => document.body.removeChild(alertDiv), 500);
                }, 3000);
                
            } catch (error) {
                console.error('❌ Error opening WhatsApp:', error);
                
                // Show error message with fallback option
                const confirmCopy = confirm('Gagal membuka WhatsApp. Ingin menyalin teks untuk dibagikan secara manual?');
                if (confirmCopy) {
                    try {
                        await navigator.clipboard.writeText(shareText);
                        alert('✅ Teks berhasil disalin! Silakan paste di aplikasi chat Anda.');
                    } catch (copyError) {
                        console.error('❌ Error copying text:', copyError);
                        alert('Gagal menyalin teks. Silakan coba lagi atau bagikan secara manual.');
                    }
                }
            }
        } else {
            console.error('❌ ShareAyah: Ayah not found for number:', ayahNum);
            console.error('📊 Available ayah numbers:', ayahs.map(a => a.ayah_number));
            console.error('🔍 Surah data available:', !!surah);
            
            const errorMessage = !surah 
                ? 'Data surah belum dimuat. Silakan tunggu sebentar dan coba lagi.'
                : `Ayat ${ayahNum} tidak ditemukan. Ayat tersedia: 1-${ayahs.length}`;
                
            alert(errorMessage);
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
        const ayah = ayahs.find(a => 
            parseInt(a.ayah_number) === parseInt(ayahNum) || 
            parseInt(a.number) === parseInt(ayahNum) ||
            parseInt(a.verse_number) === parseInt(ayahNum)
        );
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
            // Spacebar to play/pause full surah audio
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                if (isSurahPlaying || isAutoPlayingSequence) {
                    pauseFullSurah();
                } else {
                    playFullSurah();
                }
            }
            // Ctrl+Shift+P or Cmd+Shift+P to play/pause full surah
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                if (isSurahPlaying || isAutoPlayingSequence) {
                    pauseFullSurah();
                } else {
                    playFullSurah();
                }
            }
            // Ctrl+Shift+Left or Cmd+Shift+Left to skip to previous ayah (when playing full surah)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (isAutoPlayingSequence) {
                    skipToPreviousAyah();
                }
            }
            // Ctrl+Shift+Right or Cmd+Shift+Right to skip to next ayah (when playing full surah)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'ArrowRight') {
                e.preventDefault();
                if (isAutoPlayingSequence) {
                    skipToNextAyah();
                }
            }
            // Escape to close dropdown or stop full surah
            if (e.key === 'Escape') {
                if (showFloatingShare) {
                    setShowFloatingShare(false);
                } else if (isSurahPlaying || isAutoPlayingSequence) {
                    stopFullSurah();
                }
            }
        };

        const handleClickOutside = (e) => {
            // Close floating share if clicking outside
            if (showFloatingShare && !e.target.closest('.floating-share-container')) {
                setShowFloatingShare(false);
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
    }, [currentAyahNumber, showDescriptionShort, showDescriptionLong, showFloatingShare, isSurahPlaying, isAutoPlayingSequence]);

    // Audio cleanup effect
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up audio on component unmount...');
            if (audioElement) {
                try {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    console.log('✅ Audio cleaned up successfully');
                } catch (error) {
                    console.error('❌ Error cleaning up audio:', error);
                }
            }
            
            // Clean up surah audio
            if (surahAudioElement) {
                try {
                    surahAudioElement.pause();
                    surahAudioElement.currentTime = 0;
                    console.log('✅ Surah audio cleaned up successfully');
                } catch (error) {
                    console.error('❌ Error cleaning up surah audio:', error);
                }
            }
        };
    }, [audioElement, surahAudioElement]);

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
    if (loading || !surah || ayahs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">
                        {!surah ? 'Memuat data surah...' : 
                         ayahs.length === 0 ? 'Memuat ayat-ayat...' : 'Memuat...'}
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
        <>
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
                
                /* Enhanced Arabic text styling for better readability */
                .font-arabic {
                    font-feature-settings: "liga" 1, "dlig" 1, "kern" 1;
                    font-variant-ligatures: contextual;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* Custom grid columns for responsive navigation */
                @media (min-width: 1024px) {
                    .grid-cols-15 {
                        grid-template-columns: repeat(15, minmax(0, 1fr));
                    }
                }
            `}</style>

            <SEOHead 
                {...getPageSEOData('surah', surah)}
                additionalMeta={[
                    { name: 'author', content: 'IndoQuran' },
                    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
                    { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
                    { property: 'article:section', content: 'Al-Quran' },
                    { property: 'article:tag', content: generateSurahSEOKeywords(surah) },
                    { property: 'article:published_time', content: '2025-01-01T00:00:00Z' },
                    { property: 'article:modified_time', content: new Date().toISOString() },
                    { name: 'twitter:label1', content: 'Ayat' },
                    { name: 'twitter:data1', content: `${maxAyahNumber} ayat` },
                    { name: 'twitter:label2', content: 'Juz' },
                    { name: 'twitter:data2', content: surah.juz ? `Juz ${surah.juz}` : 'Berbagai Juz' },
                    // Enhanced search engine hints
                    { name: 'application-name', content: 'IndoQuran' },
                    { name: 'apple-mobile-web-app-title', content: `Surah ${surah.name_latin}` },
                    { name: 'msapplication-tooltip', content: `Baca Surah ${surah.name_latin} dengan terjemahan` },
                    // Rich snippets data
                    { name: 'book:author', content: 'Allah SWT' },
                    { name: 'book:isbn', content: `978-indoquran-${surah.number}` },
                    { name: 'book:release_date', content: `${surah.revelation_place === 'Mecca' ? '610' : '622'}-01-01` },
                    // Geo-targeting for Indonesian users
                    { name: 'geo.region', content: 'ID' },
                    { name: 'geo.country', content: 'Indonesia' },
                    { name: 'language', content: 'id,ar' },
                    // Content classification
                    { name: 'rating', content: 'General' },
                    { name: 'audience', content: 'all' },
                    { name: 'subject', content: 'Religion, Islam, Al-Quran, Surah' },
                    // Mobile optimization
                    { name: 'format-detection', content: 'telephone=no' },
                    { name: 'apple-mobile-web-app-capable', content: 'yes' },
                    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
                    // Security
                    { httpEquiv: 'Content-Security-Policy', content: "default-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; media-src 'self' https:;" }
                ]}
                structuredData={[
                    // Article structured data
                    {
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": `Surah ${surah.name_latin} (${surah.name_arabic}) - Terjemahan & Audio Murottal`,
                        "description": `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${maxAyahNumber} ayat.`,
                        "author": {
                            "@type": "Organization",
                            "name": "IndoQuran",
                            "url": "https://indoquran.web.id"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "IndoQuran",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://indoquran.web.id/android-chrome-512x512.png"
                            }
                        },
                        "datePublished": "2025-01-01T00:00:00Z",
                        "dateModified": new Date().toISOString(),
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://indoquran.web.id/surah/${surah.number}`
                        },
                        "image": `https://indoquran.web.id/images/surah-${surah.number}-social.png`,
                        "inLanguage": ["id", "ar"],
                        "about": {
                            "@type": "Thing",
                            "name": `Surah ${surah.name_latin}`,
                            "description": surah.description_short || `Surah ke-${surah.number} dalam Al-Quran`
                        },
                        "keywords": generateSurahSEOKeywords(surah)
                    },
                    // Book structured data
                    {
                        "@context": "https://schema.org",
                        "@type": "Book",
                        "name": `Surah ${surah.name_latin}`,
                        "alternateName": [surah.name_arabic, `Surat ${surah.name_latin}`, `Surah ke-${surah.number}`],
                        "author": {
                            "@type": "Person",
                            "name": "Allah SWT"
                        },
                        "inLanguage": ["ar", "id"],
                        "numberOfPages": Math.ceil(maxAyahNumber / 15), // Approximate pages
                        "bookFormat": "EBook",
                        "genre": "Religious Text",
                        "publisher": {
                            "@type": "Organization",
                            "name": "IndoQuran"
                        },
                        "url": `https://indoquran.web.id/surah/${surah.number}`,
                        "description": surah.description_short || `Surah ke-${surah.number} dalam Al-Quran dengan ${maxAyahNumber} ayat`
                    },
                    // Audio object for murottal
                    {
                        "@context": "https://schema.org",
                        "@type": "AudioObject",
                        "name": `Murottal Surah ${surah.name_latin}`,
                        "description": `Audio tilawah Surah ${surah.name_latin} dengan bacaan merdu`,
                        "url": `https://indoquran.web.id/audio/surah/${surah.number}/full.mp3`,
                        "encodingFormat": "audio/mpeg",
                        "inLanguage": "ar",
                        "duration": "PT5M", // Approximate duration
                        "creator": {
                            "@type": "Organization",
                            "name": "IndoQuran"
                        }
                    },
                    // Breadcrumb for navigation
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Beranda",
                                "item": "https://indoquran.web.id"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Daftar Surah",
                                "item": "https://indoquran.web.id/surah"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": `Surah ${surah.name_latin}`,
                                "item": `https://indoquran.web.id/surah/${surah.number}`
                            }
                        ]
                    }
                ]}
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
                        <div className="text-center flex-1 mx-4">
                            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                                {surah.name_latin || surah.name_english}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                <span className="hidden sm:inline">Ayat {currentAyahNumber} dari {maxAyahNumber} • </span>
                                <span className="sm:hidden">{currentAyahNumber}/{maxAyahNumber} • </span>
                                {completionPercentage}%
                                {(isSurahPlaying || isAutoPlayingSequence) && (
                                    <span className="ml-2 text-orange-600 font-medium">
                                        🎵 Memutar Surah
                                    </span>
                                )}
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
                            <div className="flex justify-center items-center mb-2">
                                <p className="font-arabic text-gray-800 leading-loose" 
                                   dir="rtl"
                                   style={{ 
                                       fontSize: `${fontSize + 20}px`
                                   }}>
                                    {surah.name_arabic}
                                </p>
                            </div>
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

                {/* Full Surah Audio Player */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center space-x-2">
                            <SpeakerWaveIcon className="w-5 h-5 text-green-600" />
                            <span>Putar Surah Lengkap</span>
                        </h3>
                        
                        {/* Qari Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Qari:
                            </label>
                            <select
                                value={selectedQari}
                                onChange={(e) => setSelectedQari(e.target.value)}
                                className="mx-auto block bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="03">Abdul Rahman As-Sudais</option>
                                <option value="05">Mishary Rashid Alafasy</option>
                                <option value="01">Abdullah Basfar</option>
                                <option value="02">Abdul Muhsin Al-Qasim</option>
                                <option value="04">Ibrahim Al-Dossari</option>
                                <option value="husary">Mahmoud Khalil Al-Husary</option>
                                <option value="minshawi">Mohamed Siddiq El-Minshawi</option>
                                <option value="abdulbasit">Abdul Basit</option>
                            </select>
                        </div>

                        {/* Current Playing Info */}
                        {(isSurahPlaying || isAutoPlayingSequence) && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800 font-medium">
                                    Sedang memutar: Ayat {currentPlayingAyahIndex + 1} dari {ayahs.length}
                                </p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentPlayingAyahIndex + 1) / ayahs.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Audio Controls */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                            {/* Main Play/Pause Button - Always visible */}
                            <button
                                onClick={() => {
                                    console.log('🎵 Full Surah button clicked!', {
                                        isSurahPlaying,
                                        isAutoPlayingSequence,
                                        isSurahAudioLoading
                                    });
                                    
                                    if (isSurahPlaying || isAutoPlayingSequence) {
                                        pauseFullSurah();
                                    } else {
                                        playFullSurah();
                                    }
                                }}
                                disabled={isSurahAudioLoading}
                                className={`flex items-center justify-center space-x-2 px-6 py-3 text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                    (isSurahPlaying || isAutoPlayingSequence)
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                }`}
                            >
                                {isSurahAudioLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Memuat...</span>
                                    </>
                                ) : (isSurahPlaying || isAutoPlayingSequence) ? (
                                    <>
                                        <PauseIcon className="w-5 h-5" />
                                        <span>Jeda</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon className="w-5 h-5" />
                                        <span>Putar Surah Lengkap</span>
                                    </>
                                )}
                            </button>

                            {/* Skip Controls (only show when playing) */}
                            {(isSurahPlaying || isAutoPlayingSequence) && (
                                <>
                                    <button
                                        onClick={skipToPreviousAyah}
                                        disabled={currentPlayingAyahIndex === 0}
                                        className="flex items-center justify-center p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Ayat Sebelumnya"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    
                                    <button
                                        onClick={skipToNextAyah}
                                        disabled={currentPlayingAyahIndex >= ayahs.length - 1}
                                        className="flex items-center justify-center p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Ayat Berikutnya"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Stop Button (only show when playing) */}
                            {(isSurahPlaying || isAutoPlayingSequence) && (
                                <button
                                    onClick={stopFullSurah}
                                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                                    title="Berhenti"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                    <span>Berhenti</span>
                                </button>
                            )}
                        </div>

                        {/* Instructions */}
                        <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto">
                            Audio akan diputar secara berurutan mulai dari ayat pertama. 
                            Halaman akan otomatis scroll mengikuti ayat yang sedang diputar.
                        </p>
                        <p className="text-xs text-gray-400 mt-2 max-w-lg mx-auto">
                            💡 Shortcuts: <strong>Spacebar</strong> atau <strong>⌘⇧P</strong> = Play/Pause, 
                            <strong>⌘⇧←</strong> = Ayat Sebelumnya, <strong>⌘⇧→</strong> = Ayat Berikutnya, 
                            <strong>Escape</strong> = Berhenti
                        </p>
                    </div>
                </div>

                {/* Main Content - Single Ayah Display */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-6" id="ayah-content">
                    {currentAyah ? (
                        <>
                            {/* Bismillah or Ayah Content */}
                            <div className="text-center mb-8">
                                <div className="mb-6" id={`ayah-${currentAyahNumber}-arabic`}>
                                    <div className="text-center" dir="rtl">
                                        <p 
                                            ref={currentAyahRef}
                                            className="font-arabic text-gray-800 leading-loose inline"
                                            style={{ 
                                                fontSize: `${fontSize + 20}px`
                                            }}
                                        >
                                            <span 
                                                className="font-bold text-white select-none inline-flex items-center justify-center ml-3"
                                                style={{ 
                                                    fontSize: `${Math.max(fontSize + 8, 28)}px`,
                                                    fontFamily: 'Arial, sans-serif',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                                    minWidth: '50px',
                                                    minHeight: '50px',
                                                    borderRadius: '50%',
                                                    border: '3px solid white',
                                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15), 0 0 0 3px rgba(34, 197, 94, 0.2)',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {convertToArabicNumerals(currentAyahNumber) || currentAyahNumber}
                                            </span>
                                            {currentAyah.text_arabic}
                                        </p>
                                    </div>
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

                                {/* Tafsir Toggle Button */}
                                <button
                                    onClick={toggleTafsir}
                                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                                        showTafsir
                                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    title="Tampilkan/sembunyikan tafsir ayat (Ctrl+T)"
                                >
                                    <BookOpenIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{showTafsir ? 'Sembunyikan' : 'Tampilkan'} Tafsir</span>
                                    <span className="sm:hidden">{showTafsir ? 'Sembunyikan' : 'Tafsir'}</span>
                                    <span className="hidden lg:group-hover:inline-block text-xs opacity-75 ml-1">
                                        (⌘T)
                                    </span>
                                </button>

                            </div>

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
                                    disabled={isAudioLoading || isSurahAudioLoading}
                                    className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-colors shadow-lg relative ${
                                        isAudioLoading || isSurahAudioLoading
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : (isAutoPlayingSequence && currentPlayingAyahIndex === availableAyahNumbers.indexOf(currentAyahNumber))
                                                ? 'bg-orange-600 text-white hover:bg-orange-700 ring-2 ring-orange-300'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                    title={
                                        isAudioLoading || isSurahAudioLoading ? 'Memuat audio...' :
                                        (isAutoPlayingSequence && currentPlayingAyahIndex === availableAyahNumbers.indexOf(currentAyahNumber)) ? 'Sedang diputar dalam mode surah lengkap' :
                                        isPlaying && currentPlayingAyah === currentAyahNumber ? 'Pause audio' : 'Putar audio'
                                    }
                                >
                                    {/* Full Surah Playing Indicator */}
                                    {isAutoPlayingSequence && currentPlayingAyahIndex === availableAyahNumbers.indexOf(currentAyahNumber) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                                    )}
                                    
                                    {isAudioLoading || isSurahAudioLoading ? (
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (isAutoPlayingSequence && currentPlayingAyahIndex === availableAyahNumbers.indexOf(currentAyahNumber)) ? (
                                        <SpeakerWaveIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                                    ) : isPlaying && currentPlayingAyah === currentAyahNumber ? (
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
        </>
    );
}

export default SurahDetailPage;
