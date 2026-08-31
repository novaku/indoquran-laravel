import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { 
    IoBookmark, 
    IoBookmarkOutline, 
    IoHeart, 
    IoHeartOutline, 
    IoPencilOutline, 
    IoCheckmarkOutline, 
    IoCloseOutline,
    IoTrashOutline,
    IoSparkles,
    IoDocumentTextOutline,
    IoCompassOutline
} from 'react-icons/io5';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseInline from '../components/AdSenseInline';
import AdSenseHorizontal from '../components/AdSenseHorizontal';
import TafsirSurahSection from '../components/TafsirSurahSection';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { updateReadingProgress } from '../services/ReadingProgressService';
import { scrollToTop } from '../utils/scrollUtils';

import { 
    getLocalBookmarks, 
    toggleLocalBookmark, 
    saveLocalLastRead,
    updateBookmarkNotesByNumbers,
    toggleLocalFavorite,
    toggleFavorite
} from '../services/BookmarkService';
import { getPageSEOData, generateSurahSEOKeywords } from '../utils/seoUtils';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298.347.446.52.149.174.198.298.298.497.099.198.05.371-.025.52-.075.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
    </svg>
);

// Islamic Mushaf Corner Ornament for 3D Paper Effect
const QuranCornerOrnament = ({ className = "" }) => (
    <svg className={className} width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 37V14C3 7.92487 7.92487 3 14 3H37" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45" />
        <path d="M7 37V16C7 11.0294 11.0294 7 16 7H37" stroke="#d97706" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.35" />
        <circle cx="15" cy="15" r="3" fill="#d97706" fillOpacity="0.35" />
        <path d="M15 8V22M8 15H22" stroke="#b45309" strokeWidth="0.75" strokeOpacity="0.35" strokeLinecap="round" />
        <circle cx="6" cy="6" r="1.5" fill="#f59e0b" fillOpacity="0.6" />
    </svg>
);

const QuranCenterFlourish = () => (
    <div className="flex items-center justify-center gap-2 select-none pointer-events-none opacity-50 py-1">
        <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent via-amber-400/50 to-amber-600/70" />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-700">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" fillOpacity="0.6" />
            <circle cx="12" cy="12" r="2" fill="#d97706" />
        </svg>
        <span className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent via-amber-400/50 to-amber-600/70" />
    </div>
);

// Custom Ayah Jump Dropdown to avoid OS-level popup misplacement
const AyahJumpDropdown = ({ currentAyahNumber, availableAyahNumbers, onSelectAyah }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const activeItemRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

    useEffect(() => {
        if (isOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="w-full sm:w-52 relative">
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs outline-none transition hover:bg-gray-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                title="Lompat ke ayat tertentu"
            >
                <span>Lompat ke Ayat {currentAyahNumber}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl animate-fadeIn">
                    {availableAyahNumbers.map((num) => {
                        const isSelected = parseInt(num, 10) === parseInt(currentAyahNumber, 10);
                        return (
                            <button
                                key={num}
                                ref={isSelected ? activeItemRef : null}
                                type="button"
                                onClick={() => {
                                    onSelectAyah(num);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer text-left ${
                                    isSelected 
                                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                                }`}
                            >
                                <span>Ayat {num}</span>
                                {isSelected && (
                                    <IoCheckmarkOutline className="w-4 h-4 text-emerald-600 font-bold" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Custom Qari Selector Dropdown to avoid OS-level popup misplacement
const QariSelectorDropdown = ({ selectedQari, availableReciters, recitersLoading, onSelectQari }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const activeItemRef = useRef(null);

    const selectedReciter = availableReciters.find((reciter) => String(reciter.id) === String(selectedQari));

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

    useEffect(() => {
        if (isOpen && activeItemRef.current) {
            activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative w-full sm:w-56">
            <button
                type="button"
                id="ayah-top-audio-reciter"
                disabled={recitersLoading || availableReciters.length === 0}
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between rounded-xl border border-emerald-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs outline-none transition hover:bg-emerald-50/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100 cursor-pointer"
                title="Pilih Qari Murottal"
            >
                <span className="truncate mr-1.5 text-left">
                    {recitersLoading ? 'Memuat qari...' : (selectedReciter?.name || 'Pilih Qari')}
                </span>
                <ChevronDownIcon className={`h-3.5 w-3.5 flex-shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 left-0 sm:left-auto sm:w-64 top-full mt-1.5 z-40 max-h-60 overflow-y-auto rounded-xl border border-emerald-200 bg-white p-1 shadow-xl animate-fadeIn">
                    {availableReciters.length > 0 ? (
                        availableReciters.map((reciter) => {
                            const isSelected = String(reciter.id) === String(selectedQari);
                            return (
                                <button
                                    key={reciter.id}
                                    ref={isSelected ? activeItemRef : null}
                                    type="button"
                                    onClick={() => {
                                        onSelectQari(reciter.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                                        isSelected 
                                            ? 'bg-emerald-50 text-emerald-900 font-bold' 
                                            : 'text-gray-700 hover:bg-gray-100 font-medium'
                                    }`}
                                >
                                    <div className="flex flex-col pr-2">
                                        <span className="truncate">{reciter.name}</span>
                                        {reciter.bitrate && (
                                            <span className="text-[10px] text-gray-400 font-normal">{reciter.bitrate}</span>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <IoCheckmarkOutline className="w-4 h-4 flex-shrink-0 text-emerald-600 font-bold" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-3 text-xs text-gray-500 text-center">Qari tidak tersedia</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Convert English numerals to Arabic-Indic numerals
const convertToArabicNumerals = (num) => {
    if (num === null || num === undefined) return '';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit, 10)]);
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
    const [favoriteAyahs, setFavoriteAyahs] = useState(new Set());
    const [ayahNotesMap, setAyahNotesMap] = useState({});
    const [isNotesEditorOpen, setIsNotesEditorOpen] = useState(false);
    const [currentEditingNote, setCurrentEditingNote] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [fontSize, setFontSize] = useState(28);
    const [audioElement, setAudioElement] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [showFloatingShare, setShowFloatingShare] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showEnglishTranslation, setShowEnglishTranslation] = useState(false);
    const [showInAyahTafsir, setShowInAyahTafsir] = useState(false);
    const [showAyahTafsirDetail, setShowAyahTafsirDetail] = useState(true);
    const [showSurahTafsirDetail, setShowSurahTafsirDetail] = useState(true);

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
    const ayahNavGridRef = useRef(null);
    const ayahButtonRefs = useRef({});
    const isNavigatingRef = useRef(false); // Track navigation state to prevent race conditions
    const isAutoPlayingRef = useRef(false); // Track auto-playing state with ref for closures

    // Auto-scroll Ayah Grid Navigation to active ayah button
    const scrollAyahNavGrid = useCallback((ayahNum = currentAyahNumber) => {
        try {
            const gridContainer = ayahNavGridRef.current;
            const activeButton = ayahButtonRefs.current?.[ayahNum];
            if (gridContainer && activeButton) {
                const containerRect = gridContainer.getBoundingClientRect();
                const buttonRect = activeButton.getBoundingClientRect();
                const relativeTop = buttonRect.top - containerRect.top + gridContainer.scrollTop;
                const targetScrollTop = relativeTop - (gridContainer.clientHeight / 2) + (buttonRect.height / 2);
                
                if (typeof gridContainer.scrollTo === 'function') {
                    gridContainer.scrollTo({
                        top: Math.max(0, targetScrollTop),
                        behavior: 'smooth'
                    });
                } else {
                    gridContainer.scrollTop = Math.max(0, targetScrollTop);
                }
            }
        } catch (err) {
            console.warn('Could not auto-scroll ayah nav grid:', err);
        }
    }, [currentAyahNumber]);

    // Improved scroll function for better ayah targeting
    const scrollToCurrentAyah = useCallback((ayahNum = currentAyahNumber) => {
        console.log(`🎯 Scrolling to ayah ${ayahNum}...`);
        
        // Auto scroll ayah navigation grid as well
        scrollAyahNavGrid(ayahNum);

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
    }, [currentAyahNumber, scrollAyahNavGrid]);

    // Get current ayah - simplified and reliable approach with type-safe comparison and fallback
    const currentAyah = ayahs.find(ayah => parseInt(ayah.ayah_number) === parseInt(currentAyahNumber)) || 
                        (ayahs.length > 0 ? ayahs[0] : null); // Fallback to first ayah if current not found
    const isAyahRoute = Boolean(ayahNumber && currentAyah && surah);
    const effectiveCanonicalPath = `https://indoquran.web.id/surah/${number}`;
    const seoPayload = surah
        ? (isAyahRoute
            ? getPageSEOData('ayah', {
                surah,
                ayah_number: parseInt(currentAyahNumber, 10),
                translation: currentAyah?.translation_id || currentAyah?.translation || ''
            })
            : getPageSEOData('surah', surah))
        : getPageSEOData('home');
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

    // Auto-scroll Ayah Grid Navigation when currentAyahNumber or availableAyahNumbers change
    useEffect(() => {
        if (currentAyahNumber && availableAyahNumbers.length > 0) {
            const timer = setTimeout(() => {
                scrollAyahNavGrid(currentAyahNumber);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [currentAyahNumber, availableAyahNumbers, scrollAyahNavGrid]);
    
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
                    
                    // Fetch bookmarks for this surah
                    if (user && token) {
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
                                    const favSet = new Set();
                                    const notesMap = {};
                                    bookmarksResult.data.forEach(bookmark => {
                                        if (bookmark.surah_number == number) {
                                            const aNum = parseInt(bookmark.ayah_number, 10);
                                            bookmarkedSet.add(aNum);
                                            if (bookmark.pivot?.is_favorite) {
                                                favSet.add(aNum);
                                            }
                                            if (bookmark.pivot?.notes) {
                                                notesMap[aNum] = bookmark.pivot.notes;
                                            }
                                        }
                                    });
                                    setBookmarkedAyahs(bookmarkedSet);
                                    setFavoriteAyahs(favSet);
                                    setAyahNotesMap(notesMap);
                                }
                            }
                        } catch (error) {
                            console.log('Error fetching bookmarks:', error);
                        }
                    } else {
                        // Load local bookmarks for guests
                        const local = getLocalBookmarks();
                        const bookmarkedSet = new Set();
                        const favSet = new Set();
                        const notesMap = {};
                        local.forEach(bookmark => {
                            if (bookmark.surah_number == number) {
                                const aNum = parseInt(bookmark.ayah_number, 10);
                                bookmarkedSet.add(aNum);
                                if (bookmark.pivot?.is_favorite) {
                                    favSet.add(aNum);
                                }
                                if (bookmark.pivot?.notes) {
                                    notesMap[aNum] = bookmark.pivot.notes;
                                }
                            }
                        });
                        setBookmarkedAyahs(bookmarkedSet);
                        setFavoriteAyahs(favSet);
                        setAyahNotesMap(notesMap);
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
                scrollAyahNavGrid(ayahNum);
                
                // Auto-scroll to top so user can read from the top of the surah
                scrollToTop();
                
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
        } else if (!ayahNumber) {
            // If no ayah number in URL, default to ayah 1 and scroll to top
            if (currentAyahNumber !== 1) {
                console.log('🔄 No ayah in URL, defaulting to ayah 1');
                setCurrentAyahNumber(1);
            }
            scrollToTop();
        }
    }, [ayahNumber, user, number, currentAyahNumber, isAutoPlayingSequence, scrollAyahNavGrid]);

    // Auto-scroll to top when surah or ayah URL param changes
    useEffect(() => {
        scrollToTop();
    }, [number, ayahNumber]);

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

    // Auto-scroll to top when component is fully loaded
    useEffect(() => {
        if (!loading && ayahs.length > 0) {
            if (!ayahNumber || parseInt(ayahNumber) === 1) {
                scrollToTop();
            }
            if (ayahNumber) {
                scrollAyahNavGrid(parseInt(ayahNumber));
            }
        }
    }, [loading, ayahs.length, ayahNumber, scrollAyahNavGrid]);


    const toggleBookmark = async (ayahNum) => {
        const parsedAyahNum = parseInt(ayahNum, 10);
        const isCurrentlyBookmarked = bookmarkedAyahs.has(parsedAyahNum) || bookmarkedAyahs.has(ayahNum);
        const ayahObj = ayahs.find(a => parseInt(a.ayah_number, 10) === parsedAyahNum || a.ayah_number === ayahNum);

        // Find surah info
        const surahData = {
            id: ayahObj?.id,
            surah_number: parseInt(number),
            ayah_number: parsedAyahNum,
            text_arabic: ayahObj?.arabic || ayahObj?.text_arabic || '',
            text_indonesian: ayahObj?.translation || ayahObj?.text_indonesian || '',
            surah_name: surah?.name_indonesian || surah?.name_latin || `Surah ${number}`,
            surah_latin: surah?.name_latin || `Surah ${number}`,
            surah_arabic: surah?.name_arabic || '',
            total_ayahs: maxAyahNumber,
            revelation_place: surah?.revelation_place || ''
        };

        if (user) {
            try {
                const token = authUtils.getAuthToken();
                const response = await fetchWithAuth(`/api/penanda/surah/${number}/ayah/${parsedAyahNum}/toggle`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const newBookmarkedAyahs = new Set(bookmarkedAyahs);
                    if (isCurrentlyBookmarked) {
                        newBookmarkedAyahs.delete(parsedAyahNum);
                        newBookmarkedAyahs.delete(ayahNum);
                    } else {
                        newBookmarkedAyahs.add(parsedAyahNum);
                    }
                    setBookmarkedAyahs(newBookmarkedAyahs);
                    
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 transition-all text-sm font-medium';
                    alertDiv.textContent = `✅ ${isCurrentlyBookmarked ? 'Penanda dihapus' : 'Ayat berhasil ditandai'}!`;
                    document.body.appendChild(alertDiv);
                    
                    setTimeout(() => {
                        alertDiv.style.opacity = '0';
                        setTimeout(() => {
                            if (document.body.contains(alertDiv)) {
                                document.body.removeChild(alertDiv);
                            }
                        }, 300);
                    }, 2000);
                }
            } catch (error) {
                console.error('❌ Error toggling bookmark:', error);
            }
        } else {
            // Guest local bookmark
            toggleLocalBookmark(surahData);
            const newBookmarkedAyahs = new Set(bookmarkedAyahs);
            if (isCurrentlyBookmarked) {
                newBookmarkedAyahs.delete(parsedAyahNum);
                newBookmarkedAyahs.delete(ayahNum);
            } else {
                newBookmarkedAyahs.add(parsedAyahNum);
            }
            setBookmarkedAyahs(newBookmarkedAyahs);

            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all text-sm font-medium';
            alertDiv.textContent = `✅ ${isCurrentlyBookmarked ? 'Penanda lokal dihapus' : 'Ayat ditandai di perangkat ini'}!`;
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) {
                        document.body.removeChild(alertDiv);
                    }
                }, 300);
            }, 2500);
        }
    };

    // Keep currentEditingNote in sync with currentAyahNumber
    useEffect(() => {
        setCurrentEditingNote(ayahNotesMap[currentAyahNumber] || '');
        setIsNotesEditorOpen(false);
    }, [currentAyahNumber, ayahNotesMap]);

    // Save Ayah Note
    const handleSaveAyahNote = async () => {
        const ayahNum = currentAyahNumber;
        const noteText = currentEditingNote.trim();
        
        try {
            setIsSavingNote(true);
            await updateBookmarkNotesByNumbers(parseInt(number), ayahNum, noteText);
            
            setAyahNotesMap(prev => ({
                ...prev,
                [ayahNum]: noteText
            }));
            
            // Automatically mark as bookmarked
            setBookmarkedAyahs(prev => new Set(prev).add(ayahNum));
            setIsNotesEditorOpen(false);
            
            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all text-sm font-medium';
            alertDiv.textContent = '✅ Catatan tadabbur berhasil disimpan!';
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) document.body.removeChild(alertDiv);
                }, 300);
            }, 2000);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSavingNote(false);
        }
    };

    // Delete Ayah Note
    const handleDeleteAyahNote = async () => {
        const ayahNum = currentAyahNumber;
        try {
            setIsSavingNote(true);
            await updateBookmarkNotesByNumbers(parseInt(number), ayahNum, '');
            setAyahNotesMap(prev => {
                const next = { ...prev };
                delete next[ayahNum];
                return next;
            });
            setCurrentEditingNote('');
            setIsNotesEditorOpen(false);
            
            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-4 right-4 bg-gray-700 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all text-sm font-medium';
            alertDiv.textContent = '🗑️ Catatan telah dihapus';
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) document.body.removeChild(alertDiv);
                }, 300);
            }, 2000);
        } catch (error) {
            console.error('Error deleting note:', error);
        } finally {
            setIsSavingNote(false);
        }
    };

    // Toggle Favorite for Ayah
    const handleToggleAyahFavorite = async (ayahNum = currentAyahNumber) => {
        const isFav = favoriteAyahs.has(ayahNum);
        const newFavState = !isFav;
        
        setFavoriteAyahs(prev => {
            const next = new Set(prev);
            if (isFav) next.delete(ayahNum);
            else next.add(ayahNum);
            return next;
        });

        // Ensure bookmarked
        setBookmarkedAyahs(prev => new Set(prev).add(ayahNum));

        const ayahObj = ayahs.find(a => a.ayah_number === ayahNum);
        const surahData = {
            id: ayahObj?.id,
            surah_number: parseInt(number),
            ayah_number: ayahNum,
            text_arabic: ayahObj?.arabic || ayahObj?.text_arabic || '',
            text_indonesian: ayahObj?.translation || ayahObj?.text_indonesian || '',
            surah_name: surah?.name_indonesian || surah?.name_latin || `Surah ${number}`,
            surah_latin: surah?.name_latin || `Surah ${number}`,
            surah_arabic: surah?.name_arabic || '',
            total_ayahs: maxAyahNumber,
            revelation_place: surah?.revelation_place || ''
        };

        if (user && ayahObj?.id) {
            try {
                const token = authUtils.getAuthToken();
                await fetchWithAuth(`/api/penanda/surah/ayah/${ayahObj.id}/favorite`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            } catch (err) {
                console.error('Error toggling favorite:', err);
            }
        } else {
            toggleLocalBookmark(surahData);
            toggleLocalFavorite(parseInt(number), ayahNum);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = 'fixed top-4 right-4 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 transition-all text-sm font-medium';
        alertDiv.textContent = newFavState ? '❤️ Ditambahkan ke ayat favorit!' : 'Dihapus dari ayat favorit';
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(alertDiv)) document.body.removeChild(alertDiv);
            }, 300);
        }, 2000);
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
        setFontSize(prev => Math.max(18, Math.min(44, prev + delta)));
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
                
                /* Enhanced Arabic text styling for crystal clear Quran readability */
                .font-arabic {
                    font-family: 'AlQuran-IndoPak', 'Scheherazade New', 'Scheherazade', 'Amiri', 'Traditional Arabic', serif;
                    font-feature-settings: "liga" 1, "dlig" 1, "kern" 1;
                    font-variant-ligatures: contextual;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    line-height: 2.35;
                    word-spacing: 0.15em;
                }
                
                /* Custom grid columns for responsive navigation */
                @media (min-width: 1024px) {
                    .grid-cols-15 {
                        grid-template-columns: repeat(15, minmax(0, 1fr));
                    }
                }
            `}</style>

            <SEOHead 
                {...seoPayload}
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
                    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
                ]}
                structuredData={[
                    // Article structured data
                    {
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": isAyahRoute
                            ? `${surah.name_latin} Ayat ${currentAyahNumber} - Terjemahan & Audio Murottal`
                            : `Surah ${surah.name_latin} (${surah.name_arabic}) - Terjemahan & Audio Murottal`,
                        "description": isAyahRoute
                            ? `Baca ${surah.name_latin} ayat ${currentAyahNumber} dengan terjemahan bahasa Indonesia, audio murottal, dan tafsir lengkap di IndoQuran.`
                            : `Baca dan dengarkan Surah ${surah.name_latin} lengkap dengan terjemahan bahasa Indonesia dan tafsir. Surah ke-${surah.number} dalam Al-Quran yang terdiri dari ${maxAyahNumber} ayat.`,
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
                            "@id": effectiveCanonicalPath
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
                            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                {surah.name_latin || surah.name_english} — Ayat {currentAyahNumber}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                <span className="hidden sm:inline font-medium text-emerald-700">Ayat {currentAyahNumber} dari {maxAyahNumber} • </span>
                                <span className="sm:hidden font-medium text-emerald-700">{currentAyahNumber}/{maxAyahNumber} • </span>
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
                                    <button
                                        onClick={async () => {
                                            await toggleBookmark(currentAyahNumber);
                                            setShowActionsMenu(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        {bookmarkedAyahs.has(currentAyahNumber) ? (
                                             <BookmarkSolidIcon className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <BookmarkOutlineIcon className="w-4 h-4 text-emerald-600" />
                                        )}
                                        {bookmarkedAyahs.has(currentAyahNumber) ? 'Hapus penanda ayat' : 'Tandai / Bookmark ayat'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Billboard Ad (Detik.com Pattern) */}
            <AdSenseLeaderboard 
                maxWidth="max-w-6xl"
                labelText="IKLAN"
            />

            <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
                {/* Main Content - Single Ayah Display */}
                <div className="bg-white rounded-3xl border border-amber-100 p-4 sm:p-6 lg:p-8 shadow-sm mb-6" id="ayah-content">
                    {currentAyah ? (
                        <>
                            {/* Bismillah or Ayah Content */}
                            <div className="mb-8">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/90 px-3.5 py-1.5 shadow-xs">
                                            <span className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xs">
                                                {currentAyahNumber}
                                            </span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xs sm:text-sm font-bold text-emerald-900">
                                                    Ayat {currentAyahNumber}
                                                </span>
                                                <span className="text-xs font-medium text-emerald-700/80">
                                                    dari {maxAyahNumber}
                                                </span>
                                                <span className="hidden sm:inline text-xs text-emerald-600/70 font-medium">
                                                    (QS. {surah.number}:{currentAyahNumber})
                                                </span>
                                            </div>
                                        </div>
                                        {(bookmarkedAyahs.has(currentAyahNumber) || bookmarkedAyahs.has(parseInt(currentAyahNumber, 10)) || bookmarkedAyahs.has(String(currentAyahNumber))) && (
                                            <div className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-xs animate-fadeIn">
                                                <IoBookmark className="w-3.5 h-3.5 text-amber-600" />
                                                <span>Ditandai</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Font Size Controls */}
                                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 shadow-2xs">
                                        <button
                                            onClick={() => changeFontSize(-2)}
                                            disabled={fontSize <= 18}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
                                            title="Perkecil ukuran font Arab"
                                        >
                                            <MinusIcon className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-xs font-semibold text-gray-700">{fontSize}</span>
                                        <button
                                            onClick={() => changeFontSize(2)}
                                            disabled={fontSize >= 44}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
                                            title="Perbesar ukuran font Arab"
                                        >
                                            <PlusIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div 
                                    className="mb-6 w-full rounded-2xl border border-gray-200/90 bg-white px-6 sm:px-10 md:px-12 py-8 sm:py-10 shadow-xs hover:shadow-sm transition-all duration-200" 
                                    id={`ayah-${currentAyahNumber}-arabic`}
                                >
                                    <div className="w-full text-center flex flex-col items-center justify-center py-2 sm:py-4 px-2 sm:px-6" dir="rtl">
                                        <p 
                                            ref={currentAyahRef}
                                            className="font-arabic ayah-arabic-ink font-normal block text-center select-text tracking-wide w-full"
                                            style={{ 
                                                fontSize: `${fontSize + 16}px`,
                                                lineHeight: '2.6',
                                                wordSpacing: '0.18em',
                                                fontFamily: "'AlQuran-IndoPak', 'Scheherazade New', 'Scheherazade', 'Amiri', 'Traditional Arabic', serif"
                                            }}
                                        >
                                            {currentAyah.text_arabic}
                                            <span 
                                                className="ayah-number-seal-3d font-bold text-white select-none inline-flex items-center justify-center mr-4 ml-2 align-middle cursor-default"
                                                dir="ltr"
                                                style={{ 
                                                    fontSize: `${Math.max(fontSize - 4, 18)}px`,
                                                    fontFamily: "'Scheherazade New', 'Scheherazade', 'Amiri', 'Traditional Arabic', serif",
                                                    minWidth: `${Math.max(fontSize + 16, 44)}px`,
                                                    minHeight: `${Math.max(fontSize + 16, 44)}px`,
                                                    padding: '0 8px',
                                                    borderRadius: '9999px',
                                                    direction: 'ltr',
                                                    unicodeBidi: 'isolate'
                                                }}
                                                title={`Ayat ${currentAyahNumber} (${convertToArabicNumerals(currentAyahNumber)})`}
                                            >
                                                {convertToArabicNumerals(currentAyahNumber)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Transliterasi Latin - Langsung di bawah Teks Arab */}
                                    {displayedLatinText && (
                                        <div className="w-full text-center pt-5 pb-1 border-t border-gray-100 mt-6 sm:mt-8" dir="ltr">
                                            <p className="text-[11px] sm:text-xs font-bold text-emerald-800/80 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5 select-none">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                                                <span>Transliterasi Latin</span>
                                            </p>
                                            <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium italic leading-relaxed select-text max-w-4xl mx-auto px-4">
                                                {displayedLatinText}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 1: Audio Murottal */}
                                {(() => {
                                    const isThisAyahPlaying = (isPlaying && parseInt(currentPlayingAyah, 10) === parseInt(currentAyahNumber, 10)) || 
                                        (isAutoPlayingSequence && (parseInt(activeSurahAyahNumber, 10) === parseInt(currentAyahNumber, 10) || currentPlayingAyahIndex === availableAyahNumbers.indexOf(parseInt(currentAyahNumber, 10))));
                                    const isThisAyahLoading = isAudioLoading || (isSurahAudioLoading && isAutoPlayingSequence && parseInt(activeSurahAyahNumber, 10) === parseInt(currentAyahNumber, 10));

                                    return (
                                        <div className="mb-4 w-full mx-auto rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white/95 to-teal-50/90 p-4 sm:p-5 shadow-xs shadow-emerald-900/5 transition-all duration-300 hover:shadow-md hover:border-emerald-300 text-left">
                                            <div className="flex flex-col gap-3.5">
                                                {/* Header Row: Title, Equalizer/Status, & Qari Dropdown */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100/90">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${
                                                            isThisAyahPlaying 
                                                                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-300 animate-pulse'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {isThisAyahPlaying ? (
                                                                <SpeakerWaveIcon className="w-4 h-4" />
                                                            ) : (
                                                                <PlayIcon className="w-4 h-4 ml-0.5" />
                                                            )}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                                    <span>Audio Murottal</span>
                                                                    <span className="text-emerald-400">•</span>
                                                                    <span className="font-extrabold text-emerald-950">Ayat {currentAyahNumber}</span>
                                                                </p>
                                                                {isThisAyahPlaying && (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200 shadow-2xs animate-fadeIn">
                                                                        <span className="flex items-end gap-0.5 h-2.5">
                                                                            <span className="w-0.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                                                                            <span className="w-0.5 h-2.5 bg-emerald-600 rounded-full animate-bounce" />
                                                                            <span className="w-0.5 h-2 bg-teal-600 rounded-full animate-pulse" />
                                                                        </span>
                                                                        <span>Sedang Berputar</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1">
                                                                Qari: <span className="font-semibold text-emerald-800">{selectedReciter?.name || 'Abdul Basit Murattal'}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Qari Selector */}
                                                    <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                                                        <QariSelectorDropdown
                                                            selectedQari={selectedQari}
                                                            availableReciters={availableReciters}
                                                            recitersLoading={recitersLoading}
                                                            onSelectQari={(qariId) => setSelectedQari(qariId)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Player Controls Bar */}
                                                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {/* Main Play/Pause Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isThisAyahPlaying) {
                                                                    if (isAutoPlayingSequence) {
                                                                        pauseFullSurah();
                                                                    } else {
                                                                        pauseAudio();
                                                                    }
                                                                } else {
                                                                    playAyah(currentAyahNumber);
                                                                }
                                                            }}
                                                            disabled={isThisAyahLoading}
                                                            className={`group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-md ${
                                                                isThisAyahPlaying
                                                                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-white shadow-amber-500/25 ring-2 ring-amber-300'
                                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5'
                                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                                            title={isThisAyahPlaying ? 'Jeda murottal ayat ini' : `Putar murottal ayat ${currentAyahNumber}`}
                                                        >
                                                            {isThisAyahLoading ? (
                                                                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : isThisAyahPlaying ? (
                                                                <PauseIcon className="w-4 h-4 text-white" />
                                                            ) : (
                                                                <PlayIcon className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200 ml-0.5" />
                                                            )}
                                                            <span>
                                                                {isThisAyahLoading
                                                                    ? 'Memuat Audio...'
                                                                    : isThisAyahPlaying
                                                                        ? 'Jeda Audio'
                                                                        : `Putar Ayat ${currentAyahNumber}`}
                                                            </span>
                                                        </button>

                                                        {/* Stop Audio Button (shown when any audio is active) */}
                                                        {(isPlaying || isSurahPlaying || isAutoPlayingSequence || audioElement || surahAudioElement) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (audioElement) pauseAudio();
                                                                    if (surahAudioElement || isSurahPlaying || isAutoPlayingSequence) stopFullSurah();
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer"
                                                                title="Hentikan pemutaran audio"
                                                            >
                                                                <SpeakerXMarkIcon className="w-3.5 h-3.5" />
                                                                <span>Stop</span>
                                                            </button>
                                                        )}

                                                        {/* Putar Surah Lengkap Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSurahPlaying || isAutoPlayingSequence) {
                                                                    pauseFullSurah();
                                                                } else {
                                                                    playFullSurah();
                                                                }
                                                            }}
                                                            disabled={isSurahAudioLoading || ayahs.length === 0 || availableReciters.length === 0}
                                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer border shadow-2xs ${
                                                                isSurahPlaying || isAutoPlayingSequence
                                                                    ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-bold'
                                                                    : 'bg-white text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 border-gray-200/90 hover:border-emerald-200'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                            title="Putar seluruh surah secara otomatis dari ayat 1"
                                                        >
                                                            {isSurahAudioLoading ? (
                                                                <span className="inline-block h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                            ) : (isSurahPlaying || isAutoPlayingSequence) ? (
                                                                <PauseIcon className="w-3.5 h-3.5 text-emerald-700" />
                                                            ) : (
                                                                <PlayIcon className="w-3.5 h-3.5 text-emerald-600" />
                                                            )}
                                                            <span>
                                                                {(isSurahPlaying || isAutoPlayingSequence)
                                                                    ? `Surah Lengkap (Ayat ${activeSurahAyahNumber || currentAyahNumber})`
                                                                    : 'Putar Surah Lengkap'}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    {/* Quick Step Buttons for Prev / Next Ayah */}
                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        <button
                                                            type="button"
                                                            onClick={goToPreviousAyah}
                                                            disabled={availableAyahNumbers.indexOf(parseInt(currentAyahNumber, 10)) <= 0}
                                                            className="p-2 rounded-xl text-gray-600 hover:text-emerald-700 bg-white hover:bg-emerald-50/80 border border-gray-200/90 hover:border-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                                                            title="Ayat Sebelumnya"
                                                        >
                                                            <ChevronLeftIcon className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-[11px] font-bold text-gray-600 px-1.5">
                                                            {currentAyahNumber} / {maxAyahNumber}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={goToNextAyah}
                                                            disabled={availableAyahNumbers.indexOf(parseInt(currentAyahNumber, 10)) >= availableAyahNumbers.length - 1}
                                                            className="p-2 rounded-xl text-gray-600 hover:text-emerald-700 bg-white hover:bg-emerald-50/80 border border-gray-200/90 hover:border-emerald-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                                                            title="Ayat Berikutnya"
                                                        >
                                                            <ChevronRightIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Full Surah Progress Bar when active */}
                                                {(isSurahPlaying || isAutoPlayingSequence || isSurahAudioLoading) && (
                                                    <div className="pt-2 border-t border-emerald-100/90 mt-1">
                                                        <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium mb-1">
                                                            <span>Memutar Surah: Ayat {activeSurahAyahNumber || currentAyahNumber} dari {maxAyahNumber}</span>
                                                            <span>{surahPlaybackProgress}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-emerald-100/80 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                                                                style={{ width: `${surahPlaybackProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* SECTION 2: Terjemahan Indonesia */}
                                {currentAyah.text_indonesian && (
                                    <div className="mb-4 w-full bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 text-left shadow-2xs">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span>Terjemahan Indonesia</span>
                                                <span className="text-amber-400">•</span>
                                                <span className="text-amber-900 font-extrabold">Ayat {currentAyahNumber}</span>
                                            </p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200/90 text-amber-900 shadow-2xs">
                                                QS. {surah.number}:{currentAyahNumber}
                                            </span>
                                        </div>
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

                                {/* SECTION 4: Terjemahan Inggris (English Translation) */}
                                {displayedEnglishText && (
                                    <div className="mb-4 w-full bg-blue-50/90 border border-blue-200/90 rounded-xl p-4 text-left shadow-2xs">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span>English Translation</span>
                                                <span className="text-blue-400">•</span>
                                                <span className="text-blue-900 font-extrabold">Ayah {currentAyahNumber}</span>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowEnglishTranslation((prev) => !prev)}
                                                className="rounded-md border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 cursor-pointer"
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

                                {/* SECTION 4.5: Tafsir Ringkas Ayat Aktif */}
                                {currentAyah.tafsir && (
                                    <div className="mb-4 w-full bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-left shadow-2xs transition-all">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                                                    📖
                                                </span>
                                                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                                                    <span>Tafsir Ayat</span>
                                                    <span className="text-emerald-400">•</span>
                                                    <span className="font-extrabold text-emerald-950">QS. {surah.number}:{currentAyahNumber}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowInAyahTafsir((prev) => !prev)}
                                                    className="rounded-xl border border-emerald-300 bg-white px-3 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100/80 cursor-pointer shadow-2xs"
                                                >
                                                    {showInAyahTafsir ? 'Sembunyikan Tafsir' : 'Buka Tafsir Ayat'}
                                                </button>
                                            </div>
                                        </div>
                                        {showInAyahTafsir && (
                                            <div className="mt-3 pt-3 border-t border-emerald-200/70 animate-fadeIn">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-semibold text-emerald-700">
                                                        Sumber: Tafsir Ringkas Kemenag RI
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(currentAyah.tafsir);
                                                                const alertDiv = document.createElement('div');
                                                                alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all text-sm font-medium';
                                                                alertDiv.textContent = '✅ Tafsir berhasil disalin!';
                                                                document.body.appendChild(alertDiv);
                                                                setTimeout(() => {
                                                                    alertDiv.style.opacity = '0';
                                                                    setTimeout(() => {
                                                                        if (document.body.contains(alertDiv)) {
                                                                            document.body.removeChild(alertDiv);
                                                                        }
                                                                    }, 300);
                                                                }, 2000);
                                                            } catch (e) {}
                                                        }}
                                                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                                                    >
                                                        Salin Teks
                                                    </button>
                                                </div>
                                                <p className="text-sm sm:text-base text-emerald-950 leading-relaxed whitespace-pre-line">
                                                    {currentAyah.tafsir}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 5: Penanda & Catatan Ayat */}
                                <div className="mb-4 w-full relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-white/95 to-teal-50/90 p-4 sm:p-5 shadow-xs shadow-emerald-900/5 transition-all duration-300 hover:shadow-md hover:border-emerald-400 text-left">
                                    {/* Decorative background ambient glow */}
                                    <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-transparent blur-2xl pointer-events-none" />
                                    <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-gradient-to-tr from-teal-400/15 via-emerald-400/10 to-transparent blur-2xl pointer-events-none" />

                                    {/* Section Header with Context & Direct Link */}
                                    <div className="relative flex items-center justify-between gap-3 pb-3 mb-3.5 border-b border-emerald-100/90">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs shadow-emerald-600/30">
                                                <IoSparkles className="w-3.5 h-3.5 animate-pulse" />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                                        <span>Penanda & Catatan Ayat</span>
                                                        <span className="text-emerald-400">•</span>
                                                        <span className="font-extrabold text-emerald-950">Ayat {currentAyahNumber}</span>
                                                    </p>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1">
                                                    Tandai bacaan terakhir, favoritkan, atau simpan catatan tadabbur Anda.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Link to /penanda */}
                                        <Link
                                            to="/penanda"
                                            className="flex-shrink-0 group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/90 border border-emerald-200/80 shadow-2xs transition-all duration-200"
                                            title="Buka halaman semua penanda dan catatan tersimpan"
                                        >
                                            <span>Semua Penanda</span>
                                            <ChevronRightIcon className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform duration-200" />
                                        </Link>
                                    </div>

                                    {/* Main Action Buttons */}
                                    <div className="relative flex flex-wrap items-center gap-2.5">
                                        {/* Tandai / Bookmark Button (Hero Action) */}
                                        {(() => {
                                            const isBookmarked = bookmarkedAyahs.has(currentAyahNumber) || 
                                                bookmarkedAyahs.has(parseInt(currentAyahNumber, 10)) || 
                                                bookmarkedAyahs.has(String(currentAyahNumber));
                                            
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleBookmark(currentAyahNumber)}
                                                    className={`group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                                                        isBookmarked
                                                            ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5'
                                                    }`}
                                                    title={isBookmarked ? 'Hapus penanda dari ayat ini' : 'Tandai sebagai penanda bacaan terakhir'}
                                                >
                                                    {isBookmarked ? (
                                                        <IoBookmark className="w-4 h-4 text-yellow-200 drop-shadow-xs" />
                                                    ) : (
                                                        <IoBookmarkOutline className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                                                    )}
                                                    <span>
                                                        {isBookmarked ? 'Tersimpan di Penanda ✓' : 'Tandai Ayat Ini'}
                                                    </span>
                                                </button>
                                            );
                                        })()}

                                        {/* Favorit Button */}
                                        {(() => {
                                            const isFavorite = favoriteAyahs.has(currentAyahNumber) || 
                                                favoriteAyahs.has(parseInt(currentAyahNumber, 10)) || 
                                                favoriteAyahs.has(String(currentAyahNumber));

                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAyahFavorite(currentAyahNumber)}
                                                    className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                                                        isFavorite
                                                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-300'
                                                            : 'bg-white/95 text-gray-700 hover:text-rose-600 hover:bg-rose-50/90 border border-gray-200/90 hover:border-rose-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                                                    }`}
                                                    title={isFavorite ? 'Hapus dari ayat favorit' : 'Jadikan ayat favorit'}
                                                >
                                                    {isFavorite ? (
                                                        <IoHeart className="w-4 h-4 text-white animate-pulse" />
                                                    ) : (
                                                        <IoHeartOutline className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform duration-200" />
                                                    )}
                                                    <span>
                                                        {isFavorite ? 'Ayat Favorit ❤️' : 'Jadikan Favorit'}
                                                    </span>
                                                </button>
                                            );
                                        })()}

                                        {/* Catatan Button */}
                                        {(() => {
                                            const hasNote = Boolean(
                                                ayahNotesMap[currentAyahNumber] || 
                                                ayahNotesMap[parseInt(currentAyahNumber, 10)] || 
                                                ayahNotesMap[String(currentAyahNumber)]
                                            );

                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsNotesEditorOpen(prev => !prev)}
                                                    className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                                                        hasNote
                                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                                                            : 'bg-white/95 text-gray-700 hover:text-amber-700 hover:bg-amber-50/90 border border-gray-200/90 hover:border-amber-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                                                    }`}
                                                    title="Tulis catatan tadabbur atau refleksi ayat"
                                                >
                                                    {hasNote ? (
                                                        <IoDocumentTextOutline className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <IoPencilOutline className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform duration-200" />
                                                    )}
                                                    <span>
                                                        {hasNote ? 'Catatan Tersimpan 📝' : '+ Catatan Tadabbur'}
                                                    </span>
                                                </button>
                                            );
                                        })()}
                                    </div>

                                    {/* Notes Section for Current Ayah */}
                                    {(isNotesEditorOpen || ayahNotesMap[currentAyahNumber] || ayahNotesMap[parseInt(currentAyahNumber, 10)]) && (
                                        <div className="relative mt-4 pt-4 border-t border-emerald-200/80">
                                            {isNotesEditorOpen ? (
                                                <div className="space-y-3 bg-white p-4 rounded-2xl border border-emerald-300/80 shadow-md shadow-emerald-950/5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                                                <IoPencilOutline className="w-3.5 h-3.5" />
                                                            </span>
                                                            Catatan Tadabbur Ayat {currentAyahNumber}:
                                                        </span>
                                                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                            {currentEditingNote.length}/1000 karakter
                                                        </span>
                                                    </div>

                                                    <textarea
                                                        value={currentEditingNote}
                                                        onChange={(e) => setCurrentEditingNote(e.target.value)}
                                                        placeholder="Tuliskan refleksi tadabbur, mutiara hikmah, pelajaran, atau doa terkait ayat ini..."
                                                        className="w-full p-3.5 text-xs sm:text-sm text-gray-800 bg-emerald-50/30 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none placeholder:text-gray-400 transition-all"
                                                        rows={3}
                                                        maxLength={1000}
                                                        autoFocus
                                                    />

                                                    <div className="flex items-center justify-end gap-2.5 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCurrentEditingNote(ayahNotesMap[currentAyahNumber] || ayahNotesMap[parseInt(currentAyahNumber, 10)] || '');
                                                                setIsNotesEditorOpen(false);
                                                            }}
                                                            disabled={isSavingNote}
                                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveAyahNote}
                                                            disabled={isSavingNote}
                                                            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 disabled:opacity-50 inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            {isSavingNote ? (
                                                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <IoCheckmarkOutline className="w-4 h-4" />
                                                            )}
                                                            <span>Simpan Catatan</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (ayahNotesMap[currentAyahNumber] || ayahNotesMap[parseInt(currentAyahNumber, 10)]) ? (
                                                <div className="bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/60 border border-amber-300/80 p-4 rounded-2xl shadow-xs">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-md bg-amber-200/80 flex items-center justify-center text-amber-800">
                                                                <IoDocumentTextOutline className="w-3.5 h-3.5" />
                                                            </span>
                                                            Catatan Tadabbur Anda:
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsNotesEditorOpen(true)}
                                                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <IoPencilOutline className="w-3 h-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleDeleteAyahNote}
                                                                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <IoTrashOutline className="w-3 h-3" />
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/60 shadow-2xs font-normal">
                                                        {ayahNotesMap[currentAyahNumber] || ayahNotesMap[parseInt(currentAyahNumber, 10)]}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 6: Navigasi Ayat & Surah */}
                                <div className="mb-6 w-full rounded-2xl border border-gray-200/90 bg-gradient-to-br from-gray-50/90 via-white to-gray-50/90 p-4 sm:p-5 shadow-xs text-left">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-gray-200/80">
                                        <div className="flex items-center gap-2">
                                            <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-gray-100 text-gray-700">
                                                <IoCompassOutline className="w-4 h-4" />
                                            </span>
                                            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                                <span>Navigasi Ayat</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="font-extrabold text-gray-900">QS. {surah.number}:{currentAyahNumber}</span>
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200/90 text-gray-800">
                                            Ayat {currentAyahNumber} dari {maxAyahNumber}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        {/* Tombol Ayat Sebelumnya */}
                                        <button
                                            type="button"
                                            onClick={goToPreviousAyah}
                                            disabled={availableAyahNumbers.indexOf(parseInt(currentAyahNumber, 10)) <= 0}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                            <span>Ayat Sebelumnya</span>
                                        </button>

                                        {/* Dropdown Lompat Ayat */}
                                        <AyahJumpDropdown 
                                            currentAyahNumber={currentAyahNumber}
                                            availableAyahNumbers={availableAyahNumbers}
                                            onSelectAyah={navigateToAyah}
                                        />

                                        {/* Tombol Ayat Selanjutnya */}
                                        <button
                                            type="button"
                                            onClick={goToNextAyah}
                                            disabled={availableAyahNumbers.indexOf(parseInt(currentAyahNumber, 10)) >= availableAyahNumbers.length - 1}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        >
                                            <span>Ayat Selanjutnya</span>
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
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

                {/* In-Content Inline Ad (Detik.com Pattern) */}
                <AdSenseInline labelText="IKLAN" />

                {/* Ayah Grid Navigation */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <h3 className="text-lg font-semibold text-gray-800">Navigasi Ayat</h3>
                            {bookmarkedAyahs.size > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                                    <IoBookmark className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{bookmarkedAyahs.size} ditandai</span>
                                </span>
                            )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                            Ayat {currentAyahNumber} dari {maxAyahNumber}
                        </div>
                    </div>
                    <div 
                        ref={ayahNavGridRef}
                        className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-80 sm:max-h-96 overflow-y-auto p-1 scroll-smooth"
                    >
                        {availableAyahNumbers.map((ayahNum) => {
                            const isCurrentAyah = ayahNum === currentAyahNumber;
                            const isBookmarked = bookmarkedAyahs.has(ayahNum) || bookmarkedAyahs.has(parseInt(ayahNum, 10)) || bookmarkedAyahs.has(String(ayahNum));
                            return (
                                <div 
                                    key={ayahNum} 
                                    ref={(el) => { ayahButtonRefs.current[ayahNum] = el; }}
                                    className="relative"
                                >
                                    <button
                                        onClick={() => navigateToAyah(ayahNum)}
                                        className={`
                                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs sm:text-sm font-medium transition-all relative flex items-center justify-center
                                            ${isCurrentAyah 
                                                ? 'bg-green-600 text-white shadow-lg scale-105 ring-2 ring-emerald-400 font-bold' 
                                                : isBookmarked
                                                    ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 hover:scale-105 shadow-sm font-semibold'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                            }
                                        `}
                                        title={`Pergi ke ayat ${ayahNum}${isBookmarked ? ' (Ditandai / Bookmark)' : ''}`}
                                    >
                                        {isBookmarked && (
                                            <span 
                                                className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full shadow-sm ring-1 ring-white z-10 ${
                                                    isCurrentAyah ? 'bg-amber-400 text-emerald-950' : 'bg-amber-500 text-white'
                                                }`}
                                                title="Ayat ditandai (Bookmark)"
                                            >
                                                <IoBookmark className="h-2.5 w-2.5" />
                                            </span>
                                        )}
                                        <span>{ayahNum}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Middle Break Leaderboard Ad (Detik.com Pattern) */}
                <div className="w-full my-6">
                    <AdSenseHorizontal 
                        adSlot="1519827772"
                        showLabel={true}
                        labelText="IKLAN REKOMENDASI"
                        minHeight="90px"
                    />
                </div>

                {/* Kandungan & Intisari Surah Section */}
                <TafsirSurahSection 
                    surah={surah}
                    maxAyahNumber={maxAyahNumber}
                    onShareSurah={shareSurah}
                />
            </div>
        </div>
        </>
    );
}

export default SurahDetailPage;
