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
    const [currentAyahNumber, setCurrentAyahNumber] = useState(parseInt(ayahNumber) || 1);
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

    // Get current ayah - try multiple possible field names with fallback
    let currentAyah = ayahs.find(ayah => 
        ayah.ayah_number === currentAyahNumber || 
        ayah.number === currentAyahNumber ||
        ayah.verse_number === currentAyahNumber ||
        ayah.id === currentAyahNumber
    );
    
    // If no ayah found for the requested number and ayahs are available, use the first ayah
    if (!currentAyah && ayahs.length > 0 && currentAyahNumber === 1) {
        currentAyah = ayahs[0];
        console.log('🔄 Using first ayah as fallback:', currentAyah);
    }
    
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
    const totalAyahs = surah?.total_ayahs || ayahs.length || 0;
    const completionPercentage = totalAyahs > 0 ? Math.round((currentAyahNumber / totalAyahs) * 100) : 0;
    
    // Debug total ayahs calculation
    useEffect(() => {
        if (surah) {
            console.log('📊 Total Ayahs Debug:', {
                surah_total_ayahs: surah.total_ayahs,
                surah_verses_count: surah.verses_count,
                surah_number_of_ayahs: surah.number_of_ayahs,
                ayahs_length: ayahs.length,
                calculated_totalAyahs: totalAyahs,
                surahFields: Object.keys(surah)
            });
        }
    }, [surah, ayahs, totalAyahs]);

    // Fetch surah data
    useEffect(() => {
        const fetchSurahData = async () => {
            try {
                setLoading(true);
                const token = authUtils.getAuthToken();
                
                // Fetch surah details and ayahs in one call
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
                    
                    console.log('🚀 API Response Debug:', {
                        surahDataKeys: surahData ? Object.keys(surahData) : 'No surah data',
                        ayahsDataLength: ayahsData.length,
                        ayahsIsArray: Array.isArray(ayahsData),
                        firstThreeAyahs: ayahsData.slice(0, 3).map(ayah => ({
                            id: ayah.id,
                            ayah_number: ayah.ayah_number,
                            surah_number: ayah.surah_number,
                            text_arabic_preview: ayah.text_arabic ? ayah.text_arabic.substring(0, 30) + '...' : 'No Arabic text'
                        }))
                    });
                    
                    setSurah(surahData);
                    setAyahs(Array.isArray(ayahsData) ? ayahsData : []);
                    
                    // Ensure currentAyahNumber is valid when ayahs are loaded
                    if (Array.isArray(ayahsData) && ayahsData.length > 0) {
                        const maxAyahNumber = Math.max(...ayahsData.map(ayah => 
                            ayah.ayah_number || ayah.number || ayah.verse_number || ayah.id || 1
                        ));
                        
                        const requestedAyah = ayahsData.find(ayah => 
                            ayah.ayah_number === currentAyahNumber || 
                            ayah.number === currentAyahNumber ||
                            ayah.verse_number === currentAyahNumber ||
                            ayah.id === currentAyahNumber
                        );
                        
                        // If the requested ayah number exceeds available ayahs, set to the last ayah
                        if (currentAyahNumber > maxAyahNumber) {
                            console.log(`🚨 Requested ayah ${currentAyahNumber} exceeds max ayah ${maxAyahNumber}, adjusting to last ayah`);
                            setCurrentAyahNumber(maxAyahNumber);
                        }
                        // If the requested ayah is not found and it's ayah 1, use the first ayah
                        else if (!requestedAyah && currentAyahNumber === 1) {
                            const firstAyah = ayahsData[0];
                            const firstAyahNum = firstAyah.ayah_number || firstAyah.number || firstAyah.verse_number || 1;
                            console.log('🔄 Adjusting currentAyahNumber to first available ayah:', firstAyahNum);
                            setCurrentAyahNumber(firstAyahNum);
                        }
                        // If the requested ayah is not found for any other number, set to first ayah
                        else if (!requestedAyah) {
                            const firstAyah = ayahsData[0];
                            const firstAyahNum = firstAyah.ayah_number || firstAyah.number || firstAyah.verse_number || 1;
                            console.log(`🔄 Requested ayah ${currentAyahNumber} not found, adjusting to first available ayah:`, firstAyahNum);
                            setCurrentAyahNumber(firstAyahNum);
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
            fetchSurahData();
        }
    }, [number, user]);

    // Update current ayah when URL changes and track reading progress
    useEffect(() => {
        if (ayahNumber) {
            const ayahNum = parseInt(ayahNumber);
            setCurrentAyahNumber(ayahNum);
            
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
    }, [ayahNumber, user, number]);

    // Handle URL validation and redirect when ayahs are loaded
    useEffect(() => {
        if (ayahs.length > 0 && !loading) {
            const maxAyahNumber = Math.max(...ayahs.map(ayah => 
                ayah.ayah_number || ayah.number || ayah.verse_number || ayah.id || 1
            ));
            
            // If current ayah number exceeds max available ayahs, redirect to last ayah
            if (currentAyahNumber > maxAyahNumber) {
                console.log(`🚨 URL contains invalid ayah ${currentAyahNumber}, redirecting to ayah ${maxAyahNumber}`);
                navigate(`/surah/${number}/${maxAyahNumber}`, { replace: true });
                return;
            }
            
            // Check if current ayah exists in the data
            const currentAyahExists = ayahs.find(ayah => 
                ayah.ayah_number === currentAyahNumber || 
                ayah.number === currentAyahNumber ||
                ayah.verse_number === currentAyahNumber ||
                ayah.id === currentAyahNumber
            );
            
            // If current ayah doesn't exist, redirect to first ayah
            if (!currentAyahExists) {
                const firstAyah = ayahs[0];
                const firstAyahNum = firstAyah.ayah_number || firstAyah.number || firstAyah.verse_number || 1;
                console.log(`🚨 URL contains non-existent ayah ${currentAyahNumber}, redirecting to ayah ${firstAyahNum}`);
                navigate(`/surah/${number}/${firstAyahNum}`, { replace: true });
            }
        }
    }, [ayahs, currentAyahNumber, loading, number, navigate]);

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

    const navigateToAyah = async (ayahNum) => {
        if (ayahNum >= 1 && ayahNum <= totalAyahs) {
            setCurrentAyahNumber(ayahNum);
            navigate(`/surah/${number}/${ayahNum}`);
            
            // Update reading progress if user is logged in
            if (user) {
                try {
                    await updateReadingProgress(parseInt(number), ayahNum);
                    console.log('📖 Reading progress updated:', { surah: number, ayah: ayahNum });
                } catch (error) {
                    console.error('❌ Error updating reading progress:', error);
                    // Don't block navigation for progress update errors
                }
            }
            
            // Auto scroll to ayah content after a short delay to allow state update
            setTimeout(() => {
                if (currentAyahRef.current) {
                    // Scroll to the Arabic text of the ayah (not surah)
                    currentAyahRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                } else {
                    // Fallback: scroll to ayah content container
                    const ayahContent = document.getElementById('ayah-content');
                    if (ayahContent) {
                        ayahContent.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }
            }, 150);
        }
    };

    const goToPreviousAyah = () => {
        if (currentAyahNumber > 1) {
            navigateToAyah(currentAyahNumber - 1);
        }
    };

    const goToNextAyah = () => {
        if (currentAyahNumber < totalAyahs) {
            navigateToAyah(currentAyahNumber + 1);
        }
    };

    const navigateToSurah = (surahNum) => {
        if (surahNum >= 1 && surahNum <= 114) {
            navigate(`/surah/${surahNum}`);
        }
    };

    // Show loading state until API response is complete and data is processed
    if (loading || !surah || ayahs.length === 0 || !currentAyah) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
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
            `}</style>

            <SEOHead 
                title={`${surah.name_latin || surah.name_english} (${surah.name_arabic}) - IndoQuran`}
                description={
                    surah.description_short || 
                    `Baca dan dengarkan Surah ${surah.name_latin || surah.name_english} dengan teks Arab, terjemahan, dan bacaan audio. Surah ke-${surah.number} dengan ${totalAyahs} ayat.`
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
                            className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center">
                            <h1 className="text-lg font-semibold text-gray-800">
                                {surah.name_latin || surah.name_english}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Ayat {currentAyahNumber} dari {totalAyahs} • {completionPercentage}% selesai
                            </p>
                        </div>

                        <div className="w-8"></div>
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
                                <span>{totalAyahs} ayat</span>
                            </div>
                            {surah.revelation_place && (
                                <div className="flex items-center space-x-2">
                                    <span>{surah.revelation_place}</span>
                                </div>
                            )}
                        </div>

                        {/* Description Controls */}
                        {(surah.description_short || surah.description_long || surah.description) && (
                            <div className="flex justify-center items-center space-x-3 mb-4">
                                {/* Toggle Description Short */}
                                {(surah.description_short || surah.description) && (
                                    <button
                                        onClick={() => setShowDescriptionShort(!showDescriptionShort)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm border group ${
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
                                        <span className="hidden group-hover:inline-block text-xs opacity-75 ml-1">
                                            (⌘⇧R)
                                        </span>
                                    </button>
                                )}

                                {/* Toggle Description Long */}
                                {surah.description_long && (
                                    <button
                                        onClick={() => setShowDescriptionLong(!showDescriptionLong)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm border group ${
                                            showDescriptionLong 
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-blue-200' 
                                                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-indigo-200'
                                        }`}
                                        title="Toggle penjelasan lengkap surah (Ctrl+Shift+D)"
                                    >
                                        <InformationCircleIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {showDescriptionLong ? 'Sembunyikan' : 'Tampilkan'} Penjelasan Lengkap
                                        </span>
                                        {showDescriptionLong ? (
                                            <ChevronUpIcon className="w-4 h-4" />
                                        ) : (
                                            <ChevronDownIcon className="w-4 h-4" />
                                        )}
                                        <span className="hidden group-hover:inline-block text-xs opacity-75 ml-1">
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
                    <div className="flex justify-center items-center space-x-4">
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

                        {/* Tafsir Toggle Button */}
                        <button
                            onClick={toggleTafsir}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors group ${
                                showTafsir
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Tampilkan/sembunyikan tafsir ayat (Ctrl+T)"
                        >
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{showTafsir ? 'Sembunyikan' : 'Tampilkan'} Tafsir</span>
                            <span className="hidden group-hover:inline-block text-xs opacity-75 ml-1">
                                (⌘T)
                            </span>
                        </button>

                        {/* Share Surah Button */}
                        <button
                            onClick={shareSurah}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors group"
                            title="Bagikan informasi surah ini (Ctrl+Shift+U)"
                        >
                            <WhatsAppIcon className="w-4 h-4" />
                            <span>Bagikan Surah</span>
                            <span className="hidden group-hover:inline-block text-xs opacity-75 ml-1">
                                (⌘⇧U)
                            </span>
                        </button>
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
                            <div className="flex items-center justify-center space-x-3 mb-6">
                                {/* Share Ayah Button */}
                                <button
                                    onClick={() => shareAyah(currentAyahNumber)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors group"
                                    title="Bagikan ayat ini ke WhatsApp (Ctrl+Shift+S)"
                                >
                                    <WhatsAppIcon className="w-4 h-4" />
                                    <span>Bagikan Ayat</span>
                                    <span className="hidden group-hover:inline-block text-xs opacity-75 ml-1">
                                        (⌘⇧S)
                                    </span>
                                </button>

                                {/* Bookmark Ayah Button */}
                                {user && (
                                    <button
                                        onClick={() => toggleBookmark(currentAyahNumber)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Salin teks ayat"
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                        <span>Salin</span>
                                        <ChevronDownIcon className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Portal-based Dropdown */}
                                {showCopyDropdown && createPortal(
                                    <div 
                                        className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] copy-dropdown-portal"
                                        style={{
                                            top: `${dropdownPosition.top}px`,
                                            left: `${dropdownPosition.left}px`
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
                                                    🔤 Salin Transliterasi
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

                                {/* Bookmark Button */}
                                {user && (
                                    <button
                                        onClick={() => toggleBookmark(currentAyahNumber)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                            bookmarkedAyahs.has(currentAyahNumber)
                                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        title={bookmarkedAyahs.has(currentAyahNumber) ? 'Hapus bookmark' : 'Tambah bookmark'}
                                    >
                                        {bookmarkedAyahs.has(currentAyahNumber) ? (
                                            <BookmarkSolidIcon className="w-4 h-4" />
                                        ) : (
                                            <BookmarkOutlineIcon className="w-4 h-4" />
                                        )}
                                        <span>Bookmark</span>
                                    </button>
                                )}

                                {/* Audio Toggle Button */}
                                <button
                                    onClick={() => 
                                        isPlaying && currentPlayingAyah === currentAyahNumber 
                                            ? pauseAudio() 
                                            : playAyah(currentAyahNumber)
                                    }
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    title={isPlaying && currentPlayingAyah === currentAyahNumber ? 'Pause audio' : 'Putar audio'}
                                >
                                    {isPlaying && currentPlayingAyah === currentAyahNumber ? (
                                        <>
                                            <SpeakerXMarkIcon className="w-4 h-4" />
                                            <span>Pause</span>
                                        </>
                                    ) : (
                                        <>
                                            <SpeakerWaveIcon className="w-4 h-4" />
                                            <span>Dengar</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Navigation Controls */}
                            <div className="flex items-center justify-center space-x-4 mb-8">
                                <button
                                    onClick={goToPreviousAyah}
                                    disabled={currentAyahNumber <= 1}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                    <span>Sebelumnya</span>
                                </button>

                                {/* Play Button */}
                                <button
                                    onClick={() => 
                                        isPlaying && currentPlayingAyah === currentAyahNumber 
                                            ? pauseAudio() 
                                            : playAyah(currentAyahNumber)
                                    }
                                    className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
                                >
                                    {isPlaying && currentPlayingAyah === currentAyahNumber ? (
                                        <PauseIcon className="w-8 h-8" />
                                    ) : (
                                        <PlayIcon className="w-8 h-8 ml-1" />
                                    )}
                                </button>

                                <button
                                    onClick={goToNextAyah}
                                    disabled={currentAyahNumber >= totalAyahs}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span>Selanjutnya</span>
                                    <ChevronRightIcon className="w-5 h-5" />
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
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Navigasi Ayat</h3>
                    </div>
                    <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                        {Array.from({ length: totalAyahs }, (_, index) => {
                            const ayahNum = index + 1;
                            const isCurrentAyah = ayahNum === currentAyahNumber;
                            return (
                                <div key={ayahNum} className="relative">
                                    <button
                                        onClick={() => navigateToAyah(ayahNum)}
                                        className={`
                                            w-12 h-12 rounded-lg text-sm font-medium transition-all
                                            ${isCurrentAyah 
                                                ? 'bg-green-600 text-white shadow-lg' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
