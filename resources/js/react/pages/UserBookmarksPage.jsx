import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    IoBookmark, 
    IoBookmarkOutline,
    IoHeart, 
    IoHeartOutline, 
    IoSearchOutline, 
    IoTrashOutline, 
    IoChevronDown, 
    IoChevronUp, 
    IoPencilOutline, 
    IoCheckmarkOutline, 
    IoCloseOutline,
    IoPlayCircle,
    IoPauseCircle,
    IoCopyOutline,
    IoShareSocialOutline,
    IoBookOutline,
    IoSparkles,
    IoTimeOutline,
    IoDocumentTextOutline,
    IoArrowForward,
    IoCheckmarkCircle,
    IoVolumeMediumOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { 
    getUserBookmarks, 
    toggleBookmarkByNumbers,
    toggleFavorite,
    toggleLocalFavorite,
    updateBookmarkNotesByNumbers, 
    removeLocalBookmark,
    getLocalLastRead
} from '../services/BookmarkService';
import { getReadingProgress } from '../services/ReadingProgressService';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { scrollToTop } from '../utils/scrollUtils';

import AdSenseLeaderboard from '../components/AdSenseLeaderboard';

function UserBookmarksPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data states
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRead, setLastRead] = useState(null);
    const [loadingLastRead, setLoadingLastRead] = useState(true);

    // Filter & Search states
    const [activeTab, setActiveTab] = useState('semua'); // 'semua', 'favorit', 'catatan', 'terakhir'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSurahFilter, setSelectedSurahFilter] = useState('all');
    const [sortBy, setSortBy] = useState('mushaf'); // 'mushaf' (1->114), 'recent' (newest first)

    // UI Interactive states
    const [expandedSurahs, setExpandedSurahs] = useState({});
    const [editingNotes, setEditingNotes] = useState({});
    const [tempNotes, setTempNotes] = useState({});
    const [updatingNotes, setUpdatingNotes] = useState({});
    
    // Audio Player states
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null); // 'surah-ayah' key
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const audioRef = useRef(null);

    // Initial data loading
    useEffect(() => {
        scrollToTop();
        loadBookmarks();
        loadLastRead();


        // Listen for storage events (e.g., if bookmark is added in another tab/component)
        const handleStorageUpdate = () => {
            loadBookmarks();
            loadLastRead();
        };
        window.addEventListener('indoquran_bookmarks_updated', handleStorageUpdate);

        return () => {
            window.removeEventListener('indoquran_bookmarks_updated', handleStorageUpdate);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [user]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const data = await getUserBookmarks();
            setBookmarks(data || []);
            
            // Default: hide all surahs (collapsed)
            setExpandedSurahs({});
        } catch (err) {
            console.error('Error loading bookmarks:', err);
            toast.error('Gagal memuat daftar penanda.');
        } finally {
            setLoading(false);
        }
    };

    const loadLastRead = async () => {
        try {
            setLoadingLastRead(true);
            if (user) {
                const res = await getReadingProgress();
                if (res && res.status === 'success' && res.data) {
                    setLastRead(res.data);
                    return;
                }
            }
            // Fallback to local
            const localLR = getLocalLastRead();
            if (localLR) {
                setLastRead(localLR);
            }
        } catch (err) {
            console.warn('Error loading last read:', err);
            const localLR = getLocalLastRead();
            if (localLR) setLastRead(localLR);
        } finally {
            setLoadingLastRead(false);
        }
    };

    // Audio Murottal Player
    const playAyahAudio = (surahNumber, ayahNumber) => {
        const key = `${surahNumber}-${ayahNumber}`;

        if (currentPlayingAyah === key && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setCurrentPlayingAyah(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        setIsAudioLoading(true);
        const formattedSurah = String(surahNumber).padStart(3, '0');
        const formattedAyah = String(ayahNumber).padStart(3, '0');
        const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${formattedSurah}${formattedAyah}.mp3`;

        const newAudio = new Audio(audioUrl);
        audioRef.current = newAudio;

        newAudio.oncanplay = () => {
            setIsAudioLoading(false);
            newAudio.play().catch(() => {
                toast.error('Gagal memutar audio murottal');
                setCurrentPlayingAyah(null);
                setIsAudioLoading(false);
            });
            setCurrentPlayingAyah(key);
        };

        newAudio.onended = () => {
            setCurrentPlayingAyah(null);
        };

        newAudio.onerror = () => {
            setIsAudioLoading(false);
            setCurrentPlayingAyah(null);
            toast.error('Audio tidak tersedia untuk ayat ini');
        };
    };

    // Toggle Favorite
    const handleToggleFavorite = async (bookmark) => {
        const isCurrentlyFav = bookmark.pivot?.is_favorite || false;
        const newFavState = !isCurrentlyFav;

        // Optimistic UI update
        setBookmarks(prev => prev.map(b => 
            (b.surah_number === bookmark.surah_number && b.ayah_number === bookmark.ayah_number)
                ? { ...b, pivot: { ...(b.pivot || {}), is_favorite: newFavState } }
                : b
        ));

        if (user && bookmark.id && typeof bookmark.id === 'number') {
            try {
                await toggleFavorite(bookmark.id);
                toast.success(newFavState ? 'Ditambahkan ke favorit ❤️' : 'Dihapus dari favorit');
            } catch (error) {
                console.error('Error toggling favorite:', error);
                // Revert
                setBookmarks(prev => prev.map(b => 
                    (b.surah_number === bookmark.surah_number && b.ayah_number === bookmark.ayah_number)
                        ? { ...b, pivot: { ...(b.pivot || {}), is_favorite: isCurrentlyFav } }
                        : b
                ));
                toast.error('Gagal memperbarui status favorit');
            }
        } else {
            toggleLocalFavorite(bookmark.surah_number, bookmark.ayah_number);
            toast.success(newFavState ? 'Ditambahkan ke favorit ❤️' : 'Dihapus dari favorit');
        }
    };

    // Delete Bookmark
    const handleDeleteBookmark = async (bookmark) => {
        const surahNum = bookmark.surah_number;
        const ayahNum = bookmark.ayah_number;

        // Optimistic update
        setBookmarks(prev => prev.filter(
            b => !(b.surah_number === surahNum && b.ayah_number === ayahNum)
        ));

        if (user) {
            try {
                await toggleBookmarkByNumbers(surahNum, ayahNum);
                toast.success(`Penanda Surah ${surahNum}:${ayahNum} dihapus`);
            } catch (err) {
                console.error('Error removing bookmark:', err);
                toast.error('Gagal menghapus penanda');
                loadBookmarks(); // reload
            }
        } else {
            removeLocalBookmark(surahNum, ayahNum);
            toast.success(`Penanda Surah ${surahNum}:${ayahNum} dihapus`);
        }
    };

    // Notes Handlers
    const startEditingNotes = (bookmarkKey, currentNotes) => {
        setEditingNotes(prev => ({ ...prev, [bookmarkKey]: true }));
        setTempNotes(prev => ({ ...prev, [bookmarkKey]: currentNotes || '' }));
    };

    const cancelEditingNotes = (bookmarkKey) => {
        setEditingNotes(prev => ({ ...prev, [bookmarkKey]: false }));
        setTempNotes(prev => ({ ...prev, [bookmarkKey]: '' }));
    };

    const saveNotes = async (bookmark) => {
        const bookmarkKey = `${bookmark.surah_number}-${bookmark.ayah_number}`;
        const notes = tempNotes[bookmarkKey] || '';
        
        try {
            setUpdatingNotes(prev => ({ ...prev, [bookmarkKey]: true }));
            
            await updateBookmarkNotesByNumbers(
                bookmark.surah_number,
                bookmark.ayah_number,
                notes
            );
            
            // Update the bookmark in local state
            setBookmarks(prev => prev.map(b => 
                (b.surah_number === bookmark.surah_number && b.ayah_number === bookmark.ayah_number)
                    ? { ...b, pivot: { ...(b.pivot || {}), notes: notes } }
                    : b
            ));
            
            setEditingNotes(prev => ({ ...prev, [bookmarkKey]: false }));
            toast.success('Catatan berhasil disimpan! 📝');
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Gagal menyimpan catatan');
        } finally {
            setUpdatingNotes(prev => ({ ...prev, [bookmarkKey]: false }));
        }
    };

    // Copy Verse Text
    const handleCopyVerse = (bookmark) => {
        const surahName = bookmark.surah?.name_indonesian || bookmark.surah?.name_latin || `Surah ${bookmark.surah_number}`;
        const text = `${bookmark.text_arabic || ''}\n\n"${bookmark.text_indonesian || ''}"\n\n(QS. ${surahName} [${bookmark.surah_number}]: ${bookmark.ayah_number})\nhttps://indoquran.web.id/surah/${bookmark.surah_number}/${bookmark.ayah_number}`;
        
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Teks ayat berhasil disalin!');
        }).catch(() => {
            toast.error('Gagal menyalin teks');
        });
    };

    // Share Verse
    const handleShareVerse = (bookmark) => {
        const surahName = bookmark.surah?.name_indonesian || bookmark.surah?.name_latin || `Surah ${bookmark.surah_number}`;
        const shareData = {
            title: `QS. ${surahName} Ayat ${bookmark.ayah_number} - IndoQuran`,
            text: `${bookmark.text_arabic || ''}\n\n"${bookmark.text_indonesian || ''}"\n(QS. ${surahName}: ${bookmark.ayah_number})`,
            url: `https://indoquran.web.id/surah/${bookmark.surah_number}/${bookmark.ayah_number}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {});
        } else {
            handleCopyVerse(bookmark);
        }
    };

    const toggleSurahExpanded = (surahNumber) => {
        setExpandedSurahs(prev => ({
            ...prev,
            [surahNumber]: !prev[surahNumber]
        }));
    };

    // Derived Statistics
    const totalCount = bookmarks.length;
    const favoritesCount = useMemo(() => bookmarks.filter(b => b.pivot?.is_favorite).length, [bookmarks]);
    const notesCount = useMemo(() => bookmarks.filter(b => b.pivot?.notes && b.pivot.notes.trim().length > 0).length, [bookmarks]);

    // Unique Surahs list for dropdown filter
    const availableSurahs = useMemo(() => {
        const map = new Map();
        bookmarks.forEach(b => {
            if (!map.has(b.surah_number)) {
                map.set(b.surah_number, {
                    number: b.surah_number,
                    name: b.surah?.name_indonesian || b.surah?.name_latin || `Surah ${b.surah_number}`
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.number - b.number);
    }, [bookmarks]);

    // Filtered and Sorted Bookmarks
    const filteredBookmarks = useMemo(() => {
        return bookmarks.filter(bookmark => {
            // Tab filter
            if (activeTab === 'favorit' && !bookmark.pivot?.is_favorite) return false;
            if (activeTab === 'catatan' && (!bookmark.pivot?.notes || bookmark.pivot.notes.trim() === '')) return false;

            // Surah dropdown filter
            if (selectedSurahFilter !== 'all' && bookmark.surah_number !== parseInt(selectedSurahFilter)) {
                return false;
            }

            // Search term filter
            if (searchTerm.trim() !== '') {
                const q = searchTerm.toLowerCase();
                const surahName = (bookmark.surah?.name_indonesian || bookmark.surah?.name_latin || '').toLowerCase();
                const arabic = (bookmark.text_arabic || '').toLowerCase();
                const indo = (bookmark.text_indonesian || '').toLowerCase();
                const notes = (bookmark.pivot?.notes || '').toLowerCase();
                return surahName.includes(q) || arabic.includes(q) || indo.includes(q) || notes.includes(q);
            }

            return true;
        });
    }, [bookmarks, activeTab, selectedSurahFilter, searchTerm]);

    // Grouping by Surah
    const groupedBookmarks = useMemo(() => {
        const grouped = filteredBookmarks.reduce((acc, bookmark) => {
            const surahNumber = bookmark.surah_number;
            const surahName = bookmark.surah?.name_indonesian || bookmark.surah?.name_latin || `Surah ${surahNumber}`;
            const surahArabic = bookmark.surah?.name_arabic || '';
            const revelationPlace = bookmark.surah?.revelation_place || '';
            const key = `surah-${surahNumber}`;

            if (!acc[key]) {
                acc[key] = {
                    surah_number: surahNumber,
                    surah_name: surahName,
                    surah_arabic: surahArabic,
                    revelation_place: revelationPlace,
                    ayahs: []
                };
            }
            acc[key].ayahs.push(bookmark);
            return acc;
        }, {});

        let surahList = Object.values(grouped);

        if (sortBy === 'mushaf') {
            surahList.sort((a, b) => a.surah_number - b.surah_number);
            surahList.forEach(s => s.ayahs.sort((a, b) => a.ayah_number - b.ayah_number));
        } else {
            // Sort by most recently added
            surahList.forEach(s => {
                s.ayahs.sort((a, b) => {
                    const dateA = new Date(a.pivot?.created_at || 0).getTime();
                    const dateB = new Date(b.pivot?.created_at || 0).getTime();
                    return dateB - dateA;
                });
            });
        }

        return surahList;
    }, [filteredBookmarks, sortBy]);

    const isAllExpanded = useMemo(() => {
        if (groupedBookmarks.length === 0) return false;
        return groupedBookmarks.every(g => expandedSurahs[g.surah_number]);
    }, [groupedBookmarks, expandedSurahs]);

    const toggleAllSurahs = () => {
        if (isAllExpanded) {
            setExpandedSurahs({});
        } else {
            const allExp = {};
            groupedBookmarks.forEach(g => {
                allExp[g.surah_number] = true;
            });
            setExpandedSurahs(allExp);
        }
    };

    return (
        <>
            <SEOHead 
                title="Penanda & Bacaan Saya - IndoQuran"
                description="Kelola dan akses ayat-ayat Al-Quran yang telah Anda tandai, favorit, catatan tadabbur pribadi, serta riwayat bacaan terakhir di IndoQuran."
                keywords="penanda quran, ayat favorit, simpan ayat al quran, bookmark quran, catatan tadabbur, indoquran penanda, bacaan terakhir"
                canonicalUrl="https://indoquran.web.id/penanda"
            />
            
            <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-gray-50 to-gray-100/60 pb-20">
                {/* Hero Header Section */}
                <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-green-800 text-white shadow-lg relative overflow-hidden">
                    {/* Islamic geometric pattern backdrop */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm mb-3">
                                    <IoBookmark className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>Fitur Penanda & Bacaan</span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                                    Penanda & Ayat Favorit
                                </h1>
                                <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                                    Simpan ayat-ayat pilihan, buat catatan tadabbur, dan lanjutkan bacaan Al-Quran Anda kapan pun dengan mudah.
                                </p>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/surah"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold text-sm hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    <IoBookOutline className="w-4 h-4 text-emerald-600" />
                                    <span>Jelajahi Al-Quran</span>
                                </Link>
                                {!user && (
                                    <Link
                                        to="/masuk"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 border border-emerald-400/40 text-white font-semibold text-sm hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                    >
                                        <IoSparkles className="w-4 h-4 text-yellow-300" />
                                        <span>Masuk untuk Sinkron</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8">
                            <div 
                                onClick={() => setActiveTab('semua')}
                                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                                    activeTab === 'semua' 
                                        ? 'bg-white text-gray-900 shadow-lg ring-2 ring-emerald-300' 
                                        : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-80">Total Penanda</span>
                                    <IoBookmark className={`w-5 h-5 ${activeTab === 'semua' ? 'text-emerald-600' : 'text-emerald-200'}`} />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold mt-2">{totalCount}</p>
                                <span className="text-[11px] opacity-75">Ayat ditandai</span>
                            </div>

                            <div 
                                onClick={() => setActiveTab('favorit')}
                                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                                    activeTab === 'favorit' 
                                        ? 'bg-white text-gray-900 shadow-lg ring-2 ring-rose-300' 
                                        : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-80">Ayat Favorit</span>
                                    <IoHeart className={`w-5 h-5 ${activeTab === 'favorit' ? 'text-rose-600' : 'text-rose-300'}`} />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold mt-2">{favoritesCount}</p>
                                <span className="text-[11px] opacity-75">Sering dibaca</span>
                            </div>

                            <div 
                                onClick={() => setActiveTab('catatan')}
                                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                                    activeTab === 'catatan' 
                                        ? 'bg-white text-gray-900 shadow-lg ring-2 ring-amber-300' 
                                        : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-80">Catatan Ayat</span>
                                    <IoPencilOutline className={`w-5 h-5 ${activeTab === 'catatan' ? 'text-amber-600' : 'text-amber-300'}`} />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold mt-2">{notesCount}</p>
                                <span className="text-[11px] opacity-75">Tadabbur & Refleksi</span>
                            </div>

                            <div 
                                onClick={() => setActiveTab('terakhir')}
                                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                                    activeTab === 'terakhir' 
                                        ? 'bg-white text-gray-900 shadow-lg ring-2 ring-blue-300' 
                                        : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-80">Terakhir Baca</span>
                                    <IoTimeOutline className={`w-5 h-5 ${activeTab === 'terakhir' ? 'text-blue-600' : 'text-blue-200'}`} />
                                </div>
                                <p className="text-lg sm:text-xl font-bold mt-2 truncate">
                                    {lastRead?.surah?.name_latin || lastRead?.surah?.name_indonesian || (lastRead ? `Surah ${lastRead.surah_number}` : 'Belum Ada')}
                                </p>
                                <span className="text-[11px] opacity-75">
                                    {lastRead ? `Ayat ke-${lastRead.ayah_number || 1}` : 'Mulai baca sekarang'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-6xl" labelText="IKLAN" className="mt-4" />

                {/* Main Content Area */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-20">
                    {/* Guest Sync Banner */}
                    {!user && (
                        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                                    <IoSparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Penanda tersimpan di perangkat ini (Lokal)
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                        Masuk atau daftar akun gratis agar ayat yang ditandai tersinkronisasi otomatis di ponsel, tablet, dan laptop Anda.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                                <Link
                                    to="/masuk"
                                    className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                                >
                                    Masuk Akun
                                </Link>
                                <Link
                                    to="/daftar"
                                    className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                                >
                                    Daftar Gratis
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Navigation Tabs Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-3 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Tab Buttons */}
                            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                                <button
                                    onClick={() => setActiveTab('semua')}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'semua'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <IoBookmark className="w-4 h-4" />
                                    <span>Semua Penanda</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        activeTab === 'semua' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {totalCount}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('favorit')}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'favorit'
                                            ? 'bg-rose-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <IoHeart className="w-4 h-4" />
                                    <span>Ayat Favorit</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        activeTab === 'favorit' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {favoritesCount}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('catatan')}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'catatan'
                                            ? 'bg-amber-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <IoDocumentTextOutline className="w-4 h-4" />
                                    <span>Catatan Tadabbur</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        activeTab === 'catatan' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {notesCount}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('terakhir')}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === 'terakhir'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <IoTimeOutline className="w-4 h-4" />
                                    <span>Terakhir Dibaca</span>
                                </button>
                            </div>

                            {/* Sort Option (when not in last-read tab) */}
                            {activeTab !== 'terakhir' && (
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <span className="text-xs text-gray-500 hidden md:inline">Urutan:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                    >
                                        <option value="mushaf">Urutan Mushaf (Surah 1 - 114)</option>
                                        <option value="recent">Terbaru Ditandai</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Search & Surah Filter Bar (when not in last-read tab) */}
                        {activeTab !== 'terakhir' && (
                            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="relative sm:col-span-8">
                                    <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari ayat, arti terjemahan, atau catatan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-gray-50/50"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <IoCloseOutline className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="sm:col-span-4">
                                    <select
                                        value={selectedSurahFilter}
                                        onChange={(e) => setSelectedSurahFilter(e.target.value)}
                                        className="w-full py-2 px-3 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-gray-50/50 text-gray-700"
                                    >
                                        <option value="all">Semua Surah ({availableSurahs.length})</option>
                                        {availableSurahs.map(s => (
                                            <option key={`opt-${s.number}`} value={s.number}>
                                                Surah {s.number}. {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-sm text-gray-500">Memuat penanda bacaan Anda...</p>
                        </div>
                    ) : activeTab === 'terakhir' ? (
                        /* Terakhir Dibaca (Last Read) Tab View */
                        <div className="space-y-6">
                            {lastRead ? (
                                <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                                                <IoTimeOutline className="w-4 h-4" />
                                                <span>Riwayat Bacaan Terakhir</span>
                                            </div>
                                            {lastRead.last_read_at && (
                                                <span className="text-xs text-blue-100">
                                                    {new Date(lastRead.last_read_at).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-bold">
                                                    {lastRead.surah?.name_latin || lastRead.surah?.name_indonesian || `Surah ${lastRead.surah_number}`}
                                                </h3>
                                                <p className="text-blue-100 text-sm mt-1">
                                                    {lastRead.surah?.name_arabic} • Ayat {lastRead.ayah_number || 1} {lastRead.surah?.total_ayahs ? `dari ${lastRead.surah.total_ayahs} ayat` : ''}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/surah/${lastRead.surah_number || 1}/${lastRead.ayah_number || 1}`)}
                                                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-md active:scale-95 flex-shrink-0"
                                            >
                                                <span>Lanjutkan Membaca</span>
                                                <IoArrowForward className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-blue-50/40">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                <span className="text-xs text-gray-500">Nomor Surah</span>
                                                <p className="text-xl font-bold text-gray-800 mt-1">{lastRead.surah_number || 1}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                <span className="text-xs text-gray-500">Posisi Terakhir</span>
                                                <p className="text-xl font-bold text-blue-600 mt-1">Ayat {lastRead.ayah_number || 1}</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                                <span className="text-xs text-gray-500">Tempat Turun</span>
                                                <p className="text-xl font-bold text-gray-800 mt-1">
                                                    {lastRead.surah?.revelation_place === 'Madinah' ? 'Madaniyah' : 'Makkiyah'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                                            <span>💡 Progres membaca otomatis diperbarui saat Anda membaca surah di IndoQuran.</span>
                                            <Link to={`/surah/${lastRead.surah_number || 1}`} className="text-blue-600 hover:underline font-medium">
                                                Buka Surah Penuh →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                                        <IoTimeOutline className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Riwayat Bacaan</h3>
                                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                                        Mulai membaca surah Al-Quran sekarang, dan posisi ayat terakhir Anda akan otomatis tersimpan di sini.
                                    </p>
                                    <button
                                        onClick={() => navigate('/surah/1')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <IoBookOutline className="w-4 h-4" />
                                        <span>Mulai dari Surah Al-Fatihah</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : filteredBookmarks.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'favorit' ? (
                                    <IoHeartOutline className="w-8 h-8 text-rose-500" />
                                ) : activeTab === 'catatan' ? (
                                    <IoDocumentTextOutline className="w-8 h-8 text-amber-500" />
                                ) : (
                                    <IoBookmarkOutline className="w-8 h-8 text-emerald-600" />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {searchTerm ? 'Tidak ada hasil pencarian' :
                                 activeTab === 'favorit' ? 'Belum Ada Ayat Favorit' :
                                 activeTab === 'catatan' ? 'Belum Ada Catatan Tadabbur' :
                                 'Belum Ada Penanda Tersimpan'}
                            </h3>

                            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                                {searchTerm ? `Tidak ditemukan penanda yang cocok dengan kata kunci "${searchTerm}".` :
                                 activeTab === 'favorit' ? 'Tandai ayat sebagai favorit dengan menekan ikon hati pada ayat di Al-Quran.' :
                                 activeTab === 'catatan' ? 'Tambahkan catatan atau refleksi tadabbur pada setiap ayat yang Anda tandai.' :
                                 'Mulai membaca Al-Quran dan tandai ayat-ayat penting untuk dibaca kembali.'}
                            </p>

                            {searchTerm ? (
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedSurahFilter('all'); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                                >
                                    <span>Reset Filter & Pencarian</span>
                                </button>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={() => navigate('/surah')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <IoBookOutline className="w-4 h-4" />
                                        <span>Buka Daftar Surah</span>
                                    </button>
                                    <button
                                        onClick={() => navigate('/cari')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        <IoSearchOutline className="w-4 h-4" />
                                        <span>Cari Ayat Al-Quran</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Grouped Bookmarks by Surah List */
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 px-1">
                                <div className="flex items-center gap-2">
                                    <span>Menampilkan <strong>{filteredBookmarks.length}</strong> ayat ditandai dari <strong>{groupedBookmarks.length}</strong> surah</span>
                                    {searchTerm && <span className="font-medium text-emerald-700">(Pencarian: "{searchTerm}")</span>}
                                </div>
                                {groupedBookmarks.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAllSurahs}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-2xs font-medium text-xs cursor-pointer"
                                    >
                                        {isAllExpanded ? (
                                            <>
                                                <IoChevronUp className="w-3.5 h-3.5 text-gray-500" />
                                                <span>Tutup Semua Surah</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Buka Semua Surah</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {groupedBookmarks.map((group) => {
                                const isExpanded = Boolean(expandedSurahs[group.surah_number]);
                                
                                return (
                                    <div 
                                        key={`group-${group.surah_number}`}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200"
                                    >
                                        {/* Surah Group Header */}
                                        <div 
                                            onClick={() => toggleSurahExpanded(group.surah_number)}
                                            className={`px-5 py-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white cursor-pointer flex items-center justify-between hover:bg-emerald-100/50 transition-colors select-none ${
                                                isExpanded ? 'border-b border-emerald-100' : ''
                                            }`}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggleSurahExpanded(group.surah_number);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                                                    {group.surah_number}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="font-bold text-gray-900 text-base sm:text-lg">
                                                            Surah {group.surah_name}
                                                        </h2>
                                                        {group.surah_arabic && (
                                                            <span className="font-arabic text-emerald-700 text-lg hidden sm:inline">
                                                                {group.surah_arabic}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span className="font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                                            {group.ayahs.length} ayat ditandai
                                                        </span>
                                                        {group.revelation_place && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{group.revelation_place === 'Madinah' ? 'Madaniyah' : 'Makkiyah'}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Link
                                                    to={`/surah/${group.surah_number}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
                                                >
                                                    <span>Buka Surah</span>
                                                    <IoArrowForward className="w-3.5 h-3.5" />
                                                </Link>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                    isExpanded 
                                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                                }`}>
                                                    <span>{isExpanded ? `Sembunyikan (${group.ayahs.length} Ayat)` : `Tampilkan (${group.ayahs.length} Ayat)`}</span>
                                                    {isExpanded ? (
                                                        <IoChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <IoChevronDown className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ayahs in Surah */}
                                        {isExpanded && (
                                            <div className="divide-y divide-gray-100">
                                                {group.ayahs.map((bookmark) => {
                                                    const bookmarkKey = `${bookmark.surah_number}-${bookmark.ayah_number}`;
                                                    const isPlayingThis = currentPlayingAyah === bookmarkKey;
                                                    const isFav = bookmark.pivot?.is_favorite || false;
                                                    const isEditingThisNote = editingNotes[bookmarkKey];
                                                    const hasNotes = Boolean(bookmark.pivot?.notes && bookmark.pivot.notes.trim().length > 0);

                                                    return (
                                                        <div 
                                                            key={`bm-${bookmark.id || bookmarkKey}`}
                                                            className="p-5 sm:p-6 hover:bg-gray-50/80 transition-colors"
                                                        >
                                                            {/* Top Ayah Badge & Actions */}
                                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold text-xs border border-emerald-200">
                                                                        <IoBookmark className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span>Ayat {bookmark.ayah_number}</span>
                                                                    </span>
                                                                    {isFav && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-medium text-xs">
                                                                            <IoHeart className="w-3 h-3 text-rose-500" />
                                                                            <span>Favorit</span>
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Ayah Action Buttons Bar */}
                                                                <div className="flex items-center gap-1 sm:gap-2">
                                                                    {/* Audio Play Button */}
                                                                    <button
                                                                        onClick={() => playAyahAudio(bookmark.surah_number, bookmark.ayah_number)}
                                                                        className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                                                                            isPlayingThis 
                                                                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' 
                                                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                        }`}
                                                                        title="Dengarkan Murottal"
                                                                    >
                                                                        {isPlayingThis ? (
                                                                            <IoPauseCircle className="w-5 h-5 text-white" />
                                                                        ) : (
                                                                            <IoPlayCircle className="w-5 h-5 text-emerald-600" />
                                                                        )}
                                                                        <span className="hidden md:inline">
                                                                            {isPlayingThis ? 'Jeda Audio' : 'Murottal'}
                                                                        </span>
                                                                    </button>

                                                                    {/* Open Verse in Surah */}
                                                                    <button
                                                                        onClick={() => navigate(`/surah/${bookmark.surah_number}/${bookmark.ayah_number}`)}
                                                                        className="p-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                                                        title="Buka ayat di halaman Surah"
                                                                    >
                                                                        <IoBookOutline className="w-4 h-4 text-gray-600" />
                                                                        <span className="hidden md:inline">Buka Ayat</span>
                                                                    </button>

                                                                    {/* Toggle Favorite */}
                                                                    <button
                                                                        onClick={() => handleToggleFavorite(bookmark)}
                                                                        className={`p-2 rounded-xl transition-colors ${
                                                                            isFav 
                                                                                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' 
                                                                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                                                                        }`}
                                                                        title={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                                                                    >
                                                                        {isFav ? (
                                                                            <IoHeart className="w-5 h-5" />
                                                                        ) : (
                                                                            <IoHeartOutline className="w-5 h-5" />
                                                                        )}
                                                                    </button>

                                                                    {/* Copy Verse */}
                                                                    <button
                                                                        onClick={() => handleCopyVerse(bookmark)}
                                                                        className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                                        title="Salin teks ayat"
                                                                    >
                                                                        <IoCopyOutline className="w-4 h-4" />
                                                                    </button>

                                                                    {/* Share Verse */}
                                                                    <button
                                                                        onClick={() => handleShareVerse(bookmark)}
                                                                        className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                                        title="Bagikan ayat"
                                                                    >
                                                                        <IoShareSocialOutline className="w-4 h-4" />
                                                                    </button>

                                                                    {/* Delete Bookmark */}
                                                                    <button
                                                                        onClick={() => handleDeleteBookmark(bookmark)}
                                                                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                        title="Hapus penanda"
                                                                    >
                                                                        <IoTrashOutline className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Arabic Text Display */}
                                                            {bookmark.text_arabic && (
                                                                <div className="mb-4 p-4 sm:p-5 bg-gradient-to-r from-gray-50/90 to-emerald-50/30 rounded-2xl border border-gray-100">
                                                                    <p 
                                                                        className="text-right text-2xl sm:text-3xl leading-loose font-arabic text-gray-900 select-text"
                                                                        dir="rtl"
                                                                    >
                                                                        {bookmark.text_arabic}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Indonesian Translation */}
                                                            {bookmark.text_indonesian && (
                                                                <div className="mb-4">
                                                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed select-text">
                                                                        {bookmark.text_indonesian}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Notes Tadabbur Section */}
                                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                                        <IoPencilOutline className="w-3.5 h-3.5 text-amber-600" />
                                                                        <span>Catatan Tadabbur:</span>
                                                                    </div>

                                                                    {!isEditingThisNote && (
                                                                        <button
                                                                            onClick={() => startEditingNotes(bookmarkKey, bookmark.pivot?.notes)}
                                                                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                                                                        >
                                                                            <IoPencilOutline className="w-3.5 h-3.5" />
                                                                            <span>{hasNotes ? 'Edit Catatan' : '+ Tambah Catatan'}</span>
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {isEditingThisNote ? (
                                                                    <div className="space-y-2.5 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200/80">
                                                                        <textarea
                                                                            value={tempNotes[bookmarkKey] || ''}
                                                                            onChange={(e) => setTempNotes(prev => ({ ...prev, [bookmarkKey]: e.target.value }))}
                                                                            placeholder="Tuliskan catatan tadabbur, pelajaran berharga, atau doa terkait ayat ini..."
                                                                            className="w-full p-3 text-xs sm:text-sm border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none bg-white"
                                                                            rows={3}
                                                                            maxLength={1000}
                                                                        />
                                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                                            <span>{(tempNotes[bookmarkKey] || '').length} / 1000 karakter</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => cancelEditingNotes(bookmarkKey)}
                                                                                    disabled={updatingNotes[bookmarkKey]}
                                                                                    className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-xs font-medium transition-colors"
                                                                                >
                                                                                    Batal
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => saveNotes(bookmark)}
                                                                                    disabled={updatingNotes[bookmarkKey]}
                                                                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                                                                                >
                                                                                    {updatingNotes[bookmarkKey] ? (
                                                                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                                    ) : (
                                                                                        <IoCheckmarkOutline className="w-3.5 h-3.5" />
                                                                                    )}
                                                                                    <span>Simpan</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : hasNotes ? (
                                                                    <div className="p-3.5 bg-gradient-to-r from-amber-50/80 to-yellow-50/40 border-l-4 border-amber-400 rounded-xl text-xs sm:text-sm text-gray-800">
                                                                        <p className="whitespace-pre-wrap">{bookmark.pivot.notes}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-400 italic">
                                                                        Belum ada catatan untuk ayat ini. Klik "+ Tambah Catatan" untuk menulis tadabbur Anda.
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Bookmark Added Timestamp */}
                                                            {bookmark.pivot?.created_at && (
                                                                <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
                                                                    <IoTimeOutline className="w-3 h-3" />
                                                                    <span>
                                                                        Ditandai pada: {new Date(bookmark.pivot.created_at).toLocaleDateString('id-ID', {
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default UserBookmarksPage;
