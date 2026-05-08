import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    PlayIcon, 
    PauseIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    BookmarkIcon as BookmarkSolidIcon,
    SpeakerWaveIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/solid';
import { 
    BookmarkIcon as BookmarkOutlineIcon
} from '@heroicons/react/24/outline';
import {
    ShareIcon,
    ClipboardDocumentIcon,
    SpeakerXMarkIcon,
    PlusIcon,
    MinusIcon,
    BookOpenIcon,
    DocumentTextIcon
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

const looksLikeEnglishTranslation = (text) => {
    const normalizedText = (text || '').trim().toLowerCase();

    if (!normalizedText) {
        return false;
    }

    const englishMarkers = [
        ' the ',
        ' and ',
        ' that ',
        ' is ',
        ' are ',
        ' by ',
        ' of ',
        ' for ',
        ' with ',
        ' wisdom',
        ' never ',
        ' equal ',
        ' qur',
    ];

    return englishMarkers.some((marker) => normalizedText.includes(marker));
};

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseFootnotes = (footnoteText) => {
    const result = {};
    if (!footnoteText) return result;
    // Split on newline followed by a number and closing paren
    const parts = footnoteText.split(/\n(?=\d+\))/);
    parts.forEach(part => {
        const match = part.match(/^(\d+)\)\s*([\s\S]*)/);
        if (match) {
            result[match[1]] = match[2].trim();
        }
    });
    return result;
};

const FootnoteMarker = ({ resolvedMarker, cleanFootnote }) => {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <span ref={tooltipRef} className="relative inline-flex align-super mx-0.5">
            <span
                className="cursor-pointer rounded border border-amber-300 bg-amber-100 px-1 text-[0.72em] font-semibold leading-none text-amber-700 select-none"
                onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
            >
                {resolvedMarker}
            </span>
            {isOpen && (
                <span className="absolute left-1/2 top-full z-40 mt-2 w-64 max-w-[80vw] max-h-56 -translate-x-1/2 overflow-y-auto rounded-lg border border-amber-200 bg-white p-3 text-left text-xs leading-relaxed text-gray-700 shadow-xl">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Catatan {resolvedMarker}
                    </span>
                    {cleanFootnote}
                </span>
            )}
        </span>
    );
};

const renderTranslationWithFootnote = (translationText, markerStr, footnoteText) => {
    const cleanTranslation = (translationText || '').trim();
    if (!cleanTranslation) return '';

    const cleanFootnoteText = (footnoteText || '').trim();
    const markers = (markerStr || '').split(/[,\s]+/).map(m => m.trim()).filter(Boolean);

    if (!markers.length || !cleanFootnoteText) {
        return cleanTranslation;
    }

    const footnoteMap = parseFootnotes(cleanFootnoteText);

    // Iteratively split the text by each marker pattern (e.g. "9)")
    let segments = [cleanTranslation];

    markers.forEach(marker => {
        const footnoteContent = footnoteMap[marker];
        if (!footnoteContent) return;

        const markerPattern = `${marker})`;
        const regex = new RegExp(`(${escapeRegExp(markerPattern)})`, 'g');

        segments = segments.flatMap((seg, segIndex) => {
            if (typeof seg !== 'string') return [seg];
            const subParts = seg.split(regex);
            if (subParts.length <= 1) return [seg];
            return subParts.map((subPart, j) => {
                if (subPart !== markerPattern) return subPart;
                return (
                    <FootnoteMarker
                        key={`fn-${marker}-${segIndex}-${j}`}
                        resolvedMarker={markerPattern}
                        cleanFootnote={footnoteContent}
                    />
                );
            });
        });
    });

    return segments.map((seg, i) =>
        typeof seg === 'string'
            ? <React.Fragment key={`text-${i}`}>{seg}</React.Fragment>
            : seg
    );
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
    const [audioElement, setAudioElement] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [showFloatingShare, setShowFloatingShare] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
    const [showAyahTafsirDetail, setShowAyahTafsirDetail] = useState(false);
    const [showSurahTafsirDetail, setShowSurahTafsirDetail] = useState(false);

    // Full Surah Audio Player State
    const [isSurahPlaying, setIsSurahPlaying] = useState(false);
    const [isSurahAudioLoading, setIsSurahAudioLoading] = useState(false);
    const [surahAudioElement, setSurahAudioElement] = useState(null);
    const [currentPlayingAyahIndex, setCurrentPlayingAyahIndex] = useState(0);
    const [isAutoPlayingSequence, setIsAutoPlayingSequence] = useState(false);
    const [selectedQari, setSelectedQari] = useState('2'); // Default to Abdul Basit 192kbps
    const [availableReciters, setAvailableReciters] = useState([]);
    const [recitersLoading, setRecitersLoading] = useState(true);
    const [nextSurahInfo, setNextSurahInfo] = useState(null);

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
    const currentLatinText = currentAyah?.text_latin?.trim() || '';
    const currentEnglishText = currentAyah?.text_english?.trim() || '';
    const englishFallbackFromLatin = !currentEnglishText && looksLikeEnglishTranslation(currentLatinText);
    const displayedLatinText = englishFallbackFromLatin ? '' : currentLatinText;
    const displayedEnglishText = currentEnglishText || (englishFallbackFromLatin ? currentLatinText : '');
    const selectedReciter = availableReciters.find((reciter) => String(reciter.id) === String(selectedQari));
    const activeSurahAyahNumber = ayahs[currentPlayingAyahIndex]?.ayah_number
        ? parseInt(ayahs[currentPlayingAyahIndex].ayah_number)
        : null;
    
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
    
    // Update document title with surah name and ayah number
    useEffect(() => {
        if (surah && currentAyahNumber) {
            const surahName = surah.name_latin || surah.name_english || surah.name_arabic;
            document.title = `${surahName} - Ayat ${currentAyahNumber} | IndoQuran`;
            console.log(`📄 Document title updated: ${document.title}`);
        } else if (surah) {
            const surahName = surah.name_latin || surah.name_english || surah.name_arabic;
            document.title = `${surahName} | IndoQuran`;
            console.log(`📄 Document title updated: ${document.title}`);
        } else {
            document.title = 'IndoQuran - Al-Qur\'an Digital Indonesia';
            console.log(`📄 Document title updated to default: ${document.title}`);
        }
    }, [surah, currentAyahNumber]);
    
    // Calculate total ayahs and available ayah numbers from actual data
    const availableAyahNumbers = ayahs.map(ayah => parseInt(ayah.ayah_number)).filter(num => num && !isNaN(num)).sort((a, b) => a - b);
    const totalAyahs = availableAyahNumbers.length;
    const minAyahNumber = availableAyahNumbers[0] || 1;
    const maxAyahNumber = availableAyahNumbers[availableAyahNumbers.length - 1] || 1;
    const completionPercentage = totalAyahs > 0 ? Math.round(((availableAyahNumbers.indexOf(parseInt(currentAyahNumber)) + 1) / totalAyahs) * 100) : 0;
    const surahPlaybackProgress = totalAyahs > 0
        ? Math.min(100, Math.max(0, Math.round(((currentPlayingAyahIndex + 1) / totalAyahs) * 100)))
        : 0;
    
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

    // Fetch next surah info for navigation button
    useEffect(() => {
        const fetchNextSurah = async () => {
            const nextNum = parseInt(number) + 1;
            if (nextNum > 114) {
                setNextSurahInfo(null);
                return;
            }
            try {
                const response = await fetch(`/api/surahs/${nextNum}`);
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    const s = result.data.surah || result.data;
                    const ayahsData = result.data.ayahs || [];
                    setNextSurahInfo({
                        number: s.number,
                        name_latin: s.name_latin || s.name_english,
                        name_arabic: s.name_arabic,
                        total_ayahs: ayahsData.length || s.total_ayahs || s.verses_count,
                    });
                }
            } catch (e) {
                // silently ignore
            }
        };
        if (number) fetchNextSurah();
    }, [number]);

    // Fetch available reciters from API
    useEffect(() => {
        const fetchReciters = async () => {
            try {
                setRecitersLoading(true);
                console.log('🎙️ Fetching available reciters from API...');
                
                const response = await fetch('/api/reciters/recommended');
                const result = await response.json();
                
                if (result.status === 'success') {
                    console.log('✅ Reciters loaded:', result.data.length);
                    setAvailableReciters(result.data);
                } else {
                    console.error('❌ Failed to load reciters:', result.message);
                    // Set default reciters if API fails
                    setAvailableReciters([
                        { id: '2', name: 'Abdul Basit Murattal', bitrate: '192kbps' },
                        { id: '8', name: 'Abdurrahmaan As-Sudais', bitrate: '192kbps' },
                        { id: '15', name: 'Alafasy', bitrate: '128kbps' },
                    ]);
                }
            } catch (error) {
                console.error('❌ Error fetching reciters:', error);
                // Set default reciters if API fails
                setAvailableReciters([
                    { id: '2', name: 'Abdul Basit Murattal', bitrate: '192kbps' },
                    { id: '8', name: 'Abdurrahmaan As-Sudais', bitrate: '192kbps' },
                    { id: '15', name: 'Alafasy', bitrate: '128kbps' },
                ]);
            } finally {
                setRecitersLoading(false);
            }
        };

        fetchReciters();
    }, []);

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

    // Helper function to get audio URL from EveryAyah API
    const getEveryAyahAudioUrl = (surahNumber, ayahNumber, reciterId) => {
        const reciter = availableReciters.find(r => r.id === reciterId);
        
        if (!reciter) {
            console.warn('⚠️ Reciter not found, using default');
            // Default to Abdul Basit 192kbps
            const defaultReciter = availableReciters.find(r => r.id === '2') || availableReciters[0];
            if (!defaultReciter) return null;
            
            const surahStr = String(surahNumber).padStart(3, '0');
            const ayahStr = String(ayahNumber).padStart(3, '0');
            return `https://everyayah.com/data/${defaultReciter.subfolder}/${surahStr}${ayahStr}.mp3`;
        }
        
        const surahStr = String(surahNumber).padStart(3, '0');
        const ayahStr = String(ayahNumber).padStart(3, '0');
        return `https://everyayah.com/data/${reciter.subfolder}/${surahStr}${ayahStr}.mp3`;
    };

    const getAyahImageCdnUrl = (surahNumber, ayahNum) => {
        if (!surahNumber || !ayahNum) return '';
        return `https://cdn.myquran.com/img/ayah/${surahNumber}_${ayahNum}.png`;
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

            // Get audio URL from EveryAyah API based on selected qari
            const audioUrl = getEveryAyahAudioUrl(surah.number, ayah.ayah_number, selectedQari);
            
            if (!audioUrl) {
                console.error('❌ No audio URL generated for ayah', ayahNum);
                setIsAudioLoading(false);
                alert('Audio tidak tersedia untuk ayat ini');
                return;
            }
            
            console.log(`🎵 Playing individual ayah ${ayah.ayah_number} with URL:`, audioUrl);
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
            
            // Get audio URL from EveryAyah API based on selected qari
            const audioUrl = getEveryAyahAudioUrl(surah.number, ayah.ayah_number, selectedQari);
            
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

            console.log(`🎵 Playing ayah ${ayah.ayah_number} with URL:`, audioUrl);
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
            let shareText = `*${(surah.name_latin || surah.name_english).toUpperCase()} : AYAT ${ayahNum}*\n`;
            shareText += `${surah.name_arabic} - Ayat ${ayahNum}\n\n`;
            shareText += `${ayah.text_arabic}\n\n`;
            
            // Add Latin transliteration if available
            if (ayah.text_latin) {
                shareText += `_${ayah.text_latin}_\n\n`;
            }
            
            if (indonesianText) {
                shareText += `_${indonesianText}_\n\n`;
            }
            
            shareText += `[ BACA SELENGKAPNYA ]\n${window.location.origin}/surah/${number}/${ayahNum}\n\n`;
            shareText += `INDOQURAN - Baca Al-Qur'an dengan mudah`;

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
            let shareText = `*AL-QUR'AN: ${(surah.name_latin || surah.name_english).toUpperCase()}*\n\n`;
            shareText += `TOTAL AYAT: ${totalAyahs}\n`;
            shareText += `TEMPAT TURUN: ${surah.revelation_place || 'Makkiyah/Madaniyah'}\n`;
            
            if (surah.name_arabic) {
                shareText += `NAMA ARAB: ${surah.name_arabic}\n`;
            }
            
            if (surah.meaning || surah.name_indonesian) {
                shareText += `ARTI: ${surah.meaning || surah.name_indonesian}\n`;
            }
            
            shareText += `\n[ BACA SELENGKAPNYA ]\n${window.location.origin}/surah/${number}\n\n`;
            shareText += `INDOQURAN - Baca Al-Qur'an dengan mudah`;

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
                case 'english':
                    textToCopy = ayah.text_english || 'English translation not available';
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
                    if (ayah.text_english) {
                        textToCopy += `English:\n${ayah.text_english}\n\n`;
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
                } else if (showActionsMenu) {
                    setShowActionsMenu(false);
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

            if (showActionsMenu && !e.target.closest('.actions-menu-container')) {
                setShowActionsMenu(false);
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
    }, [currentAyahNumber, showFloatingShare, showActionsMenu, isSurahPlaying, isAutoPlayingSequence]);

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
                ampHtmlUrl={`https://indoquran.web.id/amp/surah/${number}`}
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
                    className="fixed z-50 transform -translate-x-1/2 -translate-y-full floating-share-container"
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
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-[6.75rem] md:top-[6.75rem] z-30 shadow-sm">
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

                        <div className="relative actions-menu-container">
                            <button
                                onClick={() => setShowActionsMenu((prev) => !prev)}
                                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                title="Aksi halaman"
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            {showActionsMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <button
                                        onClick={async () => {
                                            await copyAyahText(currentAyahNumber, 'arabic');
                                            setShowActionsMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <ClipboardDocumentIcon className="w-4 h-4 text-indigo-600" />
                                        Salin teks Arab ayat
                                    </button>
                                    {user && (
                                        <button
                                            onClick={async () => {
                                                await toggleBookmark(currentAyahNumber);
                                                setShowActionsMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            {bookmarkedAyahs.has(currentAyahNumber) ? (
                                                <BookmarkSolidIcon className="w-4 h-4 text-yellow-600" />
                                            ) : (
                                                <BookmarkOutlineIcon className="w-4 h-4 text-yellow-600" />
                                            )}
                                            {bookmarkedAyahs.has(currentAyahNumber) ? 'Hapus bookmark ayat' : 'Bookmark ayat'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Main Content - Single Ayah Display */}
                <div className="bg-white rounded-3xl border border-amber-100 p-4 sm:p-6 lg:p-8 shadow-sm mb-6" id="ayah-content">
                    {currentAyah ? (
                        <>
                            {/* Bismillah or Ayah Content */}
                            <div className="mb-8">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Ayat {currentAyahNumber} dari {maxAyahNumber}
                                    </div>
                                    {/* Font Size Controls */}
                                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                        <button
                                            onClick={() => changeFontSize(-2)}
                                            disabled={fontSize <= 12}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            title="Perkecil font Arab"
                                        >
                                            <MinusIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-xs font-medium text-gray-600">{fontSize}</span>
                                        <button
                                            onClick={() => changeFontSize(2)}
                                            disabled={fontSize >= 32}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            title="Perbesar font Arab"
                                        >
                                            <PlusIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 rounded-2xl bg-gradient-to-b from-white to-amber-50/35 p-4 sm:p-6" id={`ayah-${currentAyahNumber}-arabic`}>
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
                                                    fontSize: `${Math.max(fontSize + 6, 26)}px`,
                                                    fontFamily: 'Arial, sans-serif',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                                    minWidth: '44px',
                                                    minHeight: '44px',
                                                    borderRadius: '50%',
                                                    border: '3px solid white',
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.14), 0 0 0 2px rgba(34, 197, 94, 0.2)',
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
                                {displayedLatinText && (
                                    <div className="mb-4 max-w-3xl mx-auto">
                                        <p className="text-sm text-gray-500 italic leading-relaxed text-center">
                                            {displayedLatinText}
                                        </p>
                                    </div>
                                )}

                                {/* Indonesian Translation */}
                                {currentAyah.text_indonesian && (
                                    <div className="mb-4 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Terjemahan Indonesia</p>
                                        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                                            {renderTranslationWithFootnote(
                                                currentAyah.text_indonesian,
                                                currentAyah.no_footnote,
                                                currentAyah.footnotes
                                            )}
                                        </p>
                                        {currentAyah.no_footnote && currentAyah.footnotes && (
                                            <p className="mt-2 text-[11px] text-amber-700">
                                                Ketuk / klik angka <span className="inline-flex items-center rounded border border-amber-300 bg-amber-100 px-1 font-semibold text-amber-700">{currentAyah.no_footnote}</span> untuk membaca catatan.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* English Translation */}
                                {displayedEnglishText && (
                                    <div className="mb-6 max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">English Translation</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowEnglishTranslation((prev) => !prev)}
                                                className="rounded-md border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                            >
                                                {showEnglishTranslation ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        {showEnglishTranslation && (
                                            <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                                                {displayedEnglishText}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="mb-8 max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5 text-left">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Pengaturan Audio</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                Putar semua ayat surah ini secara berurutan.
                                            </p>
                                            <p className="mt-1 text-xs text-gray-600">
                                                Qari: {selectedReciter?.name || 'Default'}
                                            </p>
                                        </div>
                                        <div className="w-full md:ml-auto md:max-w-sm">
                                            <label
                                                htmlFor="ayah-audio-reciter"
                                                className="mb-2 block text-xs font-medium text-gray-700"
                                            >
                                                Pilihan audio ayat
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="ayah-audio-reciter"
                                                    value={selectedQari}
                                                    onChange={(event) => setSelectedQari(event.target.value)}
                                                    disabled={recitersLoading || availableReciters.length === 0}
                                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-gray-800 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                                                >
                                                    {recitersLoading ? (
                                                        <option value="">Memuat pilihan audio...</option>
                                                    ) : availableReciters.length > 0 ? (
                                                        availableReciters.map((reciter) => (
                                                            <option key={reciter.id} value={reciter.id}>
                                                                {reciter.name}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="">Pilihan audio tidak tersedia</option>
                                                    )}
                                                </select>
                                                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Audio Surah Lengkap</p>
                                                <p className="mt-1 text-sm text-green-900 font-medium">
                                                    Putar otomatis ayat 1 hingga {maxAyahNumber}
                                                </p>
                                            </div>
                                            <div className="text-xs text-green-700 sm:text-right">
                                            {(isSurahPlaying || isAutoPlayingSequence) ? (
                                                <>
                                                    <p className="font-semibold text-green-800">Sedang diputar</p>
                                                    <p>Ayat {activeSurahAyahNumber || currentAyahNumber} dari {maxAyahNumber}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-green-800">Belum diputar</p>
                                                    <p>Siap memutar {maxAyahNumber} ayat</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {(isSurahPlaying || isAutoPlayingSequence || isSurahAudioLoading) && (
                                        <div className="mt-4">
                                            <div className="h-2 w-full rounded-full bg-green-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                                                    style={{ width: `${surahPlaybackProgress}%` }}
                                                />
                                            </div>
                                            <p className="mt-1 text-[11px] text-green-700">
                                                Progress pemutaran: {surahPlaybackProgress}%
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                if (isSurahPlaying || isAutoPlayingSequence) {
                                                    pauseFullSurah();
                                                } else {
                                                    playFullSurah();
                                                }
                                            }}
                                            disabled={isSurahAudioLoading || ayahs.length === 0 || availableReciters.length === 0}
                                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                                        >
                                            {isSurahAudioLoading ? (
                                                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (isSurahPlaying || isAutoPlayingSequence) ? (
                                                <PauseIcon className="h-4 w-4" />
                                            ) : (
                                                <PlayIcon className="h-4 w-4" />
                                            )}
                                            <span>
                                                {isSurahAudioLoading
                                                    ? 'Memuat audio surah...'
                                                    : (isSurahPlaying || isAutoPlayingSequence)
                                                        ? 'Jeda Surah Lengkap'
                                                        : 'Putar Surah Lengkap'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={stopFullSurah}
                                            disabled={(!isSurahPlaying && !isAutoPlayingSequence && !surahAudioElement) || isSurahAudioLoading}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <SpeakerXMarkIcon className="h-4 w-4" />
                                            Stop
                                        </button>

                                        <button
                                            onClick={skipToPreviousAyah}
                                            disabled={!isAutoPlayingSequence || currentPlayingAyahIndex <= 0 || isSurahAudioLoading}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                            Ayat Sebelumnya
                                        </button>

                                        <button
                                            onClick={skipToNextAyah}
                                            disabled={!isAutoPlayingSequence || currentPlayingAyahIndex >= ayahs.length - 1 || isSurahAudioLoading}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Ayat Berikutnya
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    </div>
                                </div>

                                <div className="mb-8 max-w-4xl mx-auto">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                                        <p className="mb-2 text-xs sm:text-sm font-medium text-gray-700">CDN URL Gambar Ayat</p>
                                        <a
                                            href={getAyahImageCdnUrl(surah.number, currentAyahNumber)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all text-xs sm:text-sm text-blue-700 underline hover:text-blue-900"
                                        >
                                            {getAyahImageCdnUrl(surah.number, currentAyahNumber)}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
                            <div className="flex items-center justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={goToPreviousAyah}
                                    disabled={availableAyahNumbers.indexOf(currentAyahNumber) <= 0}
                                    className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
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
                                    className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">Next</span>
                                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            </div>

                            {/* Next Surah / Next Ayah prominent button */}
                            {availableAyahNumbers.indexOf(currentAyahNumber) >= availableAyahNumbers.length - 1 ? (
                                nextSurahInfo && (
                                    <div className="flex justify-center mt-2">
                                        <button
                                            onClick={() => navigateToSurah(nextSurahInfo.number)}
                                            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all group w-full max-w-sm"
                                        >
                                            <div className="flex-1 text-left">
                                                <p className="text-xs text-green-200 mb-0.5">Surah Berikutnya</p>
                                                <p className="font-bold text-base leading-tight">{nextSurahInfo.name_latin}</p>
                                                <p className="font-arabic text-sm text-green-100 leading-tight">{nextSurahInfo.name_arabic}</p>
                                                <p className="text-xs text-green-200 mt-0.5">{nextSurahInfo.total_ayahs} ayat • Surah {nextSurahInfo.number}</p>
                                            </div>
                                            <ChevronRightIcon className="w-6 h-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )
                            ) : null}
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

                {/* Surah Details Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mt-6">
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

                        <p className="text-sm text-gray-500 mt-3">
                            Gunakan tombol panel detail untuk berbagi, dan menu aksi di pojok kanan atas untuk salin teks atau bookmark ayat.
                        </p>

                        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => shareAyah(currentAyahNumber)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Bagikan Ayat Ini
                            </button>

                            <button
                                onClick={shareSurah}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Bagikan Surah
                            </button>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => setShowAyahTafsirDetail((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium"
                            >
                                <BookOpenIcon className="w-4 h-4" />
                                {showAyahTafsirDetail ? 'Sembunyikan Detail Tafsir Ayat' : 'Tampilkan Detail Tafsir Ayat'}
                            </button>

                            <button
                                onClick={() => setShowSurahTafsirDetail((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                {showSurahTafsirDetail ? 'Sembunyikan Detail Tafsir Surah' : 'Tampilkan Detail Tafsir Surah'}
                            </button>
                        </div>

                        {showAyahTafsirDetail && (
                            <div className="mt-4 text-left bg-green-50 border border-green-100 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-green-800 mb-2">
                                    Tafsir Ayat {currentAyahNumber}
                                </h4>
                                {currentAyah?.tafsir ? (
                                    <p className="text-sm text-green-900 leading-relaxed whitespace-pre-line">
                                        {currentAyah.tafsir}
                                    </p>
                                ) : (
                                    <p className="text-sm text-green-700">
                                        Tafsir ayat ini belum tersedia.
                                    </p>
                                )}
                            </div>
                        )}

                        {showSurahTafsirDetail && (
                            <div className="mt-4 text-left bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                                    Tafsir Surah {surah.name_latin || surah.name_english}
                                </h4>
                                {(surah.description_long || surah.description_short || surah.description) ? (
                                    <div
                                        className="text-sm text-blue-900 leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: surah.description_long || surah.description_short || surah.description
                                        }}
                                    />
                                ) : (
                                    <p className="text-sm text-blue-700">
                                        Tafsir atau penjelasan surah belum tersedia.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default SurahDetailPage;
