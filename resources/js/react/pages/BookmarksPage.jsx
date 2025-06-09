import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBookmark, IoArrowBackOutline, IoSearchOutline, IoCreateOutline, IoSaveOutline, IoCloseOutline, IoChevronDownOutline, IoChevronUpOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline } from 'react-icons/io5';
import { getUserBookmarks, updateBookmarkNotes } from '../services/BookmarkService';
import { useAuth } from '../hooks/useAuth.jsx';

function BookmarksPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNotes, setEditingNotes] = useState(null); // ID of bookmark being edited
    const [notesText, setNotesText] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [collapsedSurahs, setCollapsedSurahs] = useState(new Set());
    const [collapsedAyahs, setCollapsedAyahs] = useState(new Set());
    
    // Arabic text zoom state
    const [arabicFontSize, setArabicFontSize] = useState(2.5); // Default size in rem (2.5rem)

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        loadBookmarks();
    }, [user, navigate]);

    // Arabic text zoom functions
    const handleZoomIn = () => {
        setArabicFontSize(prev => Math.min(prev + 0.5, 6)); // Max 6rem
    };

    const handleZoomOut = () => {
        setArabicFontSize(prev => Math.max(prev - 0.5, 1.5)); // Min 1.5rem
    };

    const resetZoom = () => {
        setArabicFontSize(2.5); // Reset to default 2.5rem
    };

    // Get dynamic font size class
    const getArabicFontSizeStyle = () => {
        return {
            fontSize: `${arabicFontSize}rem`,
            lineHeight: '2',
            textShadow: '0 1px 1px rgba(0,0,0,0.05)'
        };
    };

    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const allBookmarks = await getUserBookmarks(false); // Get all bookmarks
            // Ensure the response is an array
            if (Array.isArray(allBookmarks)) {
                setBookmarks(allBookmarks);
            } else {
                console.error('Invalid bookmarks data received:', allBookmarks);
                setBookmarks([]);
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            setBookmarks([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleEditNotes = (bookmark) => {
        setEditingNotes(bookmark.id);
        setNotesText(bookmark.notes || '');
    };

    const handleSaveNotes = async (ayahId) => {
        setSavingNotes(true);
        try {
            await updateBookmarkNotes(ayahId, notesText);
            await loadBookmarks(); // Reload to get updated data
            setEditingNotes(null);
            setNotesText('');
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingNotes(null);
        setNotesText('');
    };

    const toggleSurahCollapse = (surahNumber) => {
        setCollapsedSurahs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(surahNumber)) {
                newSet.delete(surahNumber);
            } else {
                newSet.add(surahNumber);
            }
            return newSet;
        });
    };

    const toggleAyahCollapse = (ayahId) => {
        setCollapsedAyahs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ayahId)) {
                newSet.delete(ayahId);
            } else {
                newSet.add(ayahId);
            }
            return newSet;
        });
    };

    // Group bookmarks by surah and order them
    const groupedBookmarks = () => {
        // Ensure bookmarks is an array before calling filter
        if (!Array.isArray(bookmarks)) {
            return [];
        }
        
        const filtered = bookmarks.filter(bookmark => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                bookmark.text_indonesian?.toLowerCase().includes(searchLower) ||
                bookmark.surah?.name_indonesian?.toLowerCase().includes(searchLower) ||
                bookmark.ayah_number?.toString().includes(searchLower) ||
                bookmark.surah_number?.toString().includes(searchLower)
            );
        });

        const grouped = {};
        filtered.forEach(bookmark => {
            const surahNumber = bookmark.surah_number;
            if (!grouped[surahNumber]) {
                grouped[surahNumber] = {
                    surah: bookmark.surah,
                    surah_number: surahNumber,
                    ayahs: []
                };
            }
            grouped[surahNumber].ayahs.push(bookmark);
        });

        // Convert to array and sort by surah number
        return Object.values(grouped).sort((a, b) => a.surah_number - b.surah_number);
    };

    const groupedBookmarksData = groupedBookmarks();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24 pb-20">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24 pb-20">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200"
                        >
                            <IoArrowBackOutline className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-bold text-green-800">
                            Bookmark Ayat
                        </h1>
                    </div>
                    
                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
                            <input
                                type="text"
                                placeholder="Cari ayat atau surah..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

            {/* Content */}
            {groupedBookmarksData.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-12 border border-green-100 text-center">
                    <div className="mb-4">
                        <IoBookmark className="text-6xl text-green-300 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                        {searchTerm 
                            ? 'Tidak ada hasil yang ditemukan'
                            : 'Belum ada bookmark'
                        }
                    </h3>
                    <p className="text-green-600">
                        {searchTerm 
                            ? 'Coba kata kunci yang berbeda'
                            : 'Simpan ayat dengan menekan tombol bookmark'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedBookmarksData.map((surahGroup) => (
                        <div key={surahGroup.surah_number} className="bg-white rounded-3xl shadow-xl border border-green-100">
                            {/* Surah Header */}
                            <div 
                                className="p-6 border-b border-green-100 cursor-pointer hover:bg-green-50/50 transition-colors rounded-t-3xl"
                                onClick={() => toggleSurahCollapse(surahGroup.surah_number)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-green-800">
                                            {surahGroup.surah?.name_indonesian || `Surah ${surahGroup.surah_number}`}
                                        </h2>
                                        <span className="text-green-600 font-medium">
                                            ({surahGroup.ayahs.length} ayat)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {collapsedSurahs.has(surahGroup.surah_number) ? (
                                            <IoChevronDownOutline className="text-xl text-green-600" />
                                        ) : (
                                            <IoChevronUpOutline className="text-xl text-green-600" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ayahs */}
                            {!collapsedSurahs.has(surahGroup.surah_number) && (
                                <div className="divide-y divide-green-100">
                                    {surahGroup.ayahs.map((bookmark) => (
                                        <div key={bookmark.id} className="p-6">
                                            {/* Ayah Header */}
                                            <div 
                                                className="flex items-center justify-between mb-4 cursor-pointer p-2 rounded-lg hover:bg-green-50/50 transition-colors"
                                                onClick={() => toggleAyahCollapse(bookmark.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-semibold text-green-800">
                                                        Ayat {bookmark.ayah_number}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <IoBookmark className="text-green-500" title="Bookmark" />
                                                        {bookmark.is_favorite && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200">
                                                                Favorit
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {collapsedAyahs.has(bookmark.id) ? (
                                                        <IoChevronDownOutline className="text-lg text-green-600" />
                                                    ) : (
                                                        <IoChevronUpOutline className="text-lg text-green-600" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ayah Content */}
                                            {!collapsedAyahs.has(bookmark.id) && (
                                                <div className="ml-4">
                                                    {/* Arabic Text */}
                                                    <div className="bg-green-50/70 rounded-2xl p-6 mb-6 text-center relative">
                                                        {/* Arabic Text Zoom Controls */}
                                                        <div className="absolute top-2 left-2 flex gap-1">
                                                            <button 
                                                                onClick={handleZoomOut} 
                                                                disabled={arabicFontSize <= 1.5}
                                                                className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Perkecil teks Arab"
                                                            >
                                                                <IoRemoveOutline className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={resetZoom}
                                                                className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium"
                                                                title="Reset ukuran teks Arab"
                                                            >
                                                                <IoReloadOutline className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={handleZoomIn} 
                                                                disabled={arabicFontSize >= 6}
                                                                className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                title="Perbesar teks Arab"
                                                            >
                                                                <IoAddOutline className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p 
                                                            className="font-arabic text-green-800 leading-loose pt-8"
                                                            style={getArabicFontSizeStyle()}
                                                            dir="rtl"
                                                        >
                                                            {bookmark.text_arabic}
                                                        </p>
                                                    </div>

                                                    {/* Indonesian Translation */}
                                                    <div className="mb-4">
                                                        <p className="text-green-700 leading-relaxed">
                                                            {bookmark.text_indonesian}
                                                        </p>
                                                    </div>

                                                    {/* Transliteration */}
                                                    {bookmark.text_latin && (
                                                        <div className="mb-6">
                                                            <p className="text-green-600 italic text-sm">
                                                                {bookmark.text_latin}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-green-800">Catatan:</h4>
                                                            {editingNotes !== bookmark.id && (
                                                                <button
                                                                    onClick={() => handleEditNotes(bookmark)}
                                                                    className="p-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200"
                                                                    title="Edit catatan"
                                                                >
                                                                    <IoCreateOutline className="text-lg" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {editingNotes === bookmark.id ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={notesText}
                                                                    onChange={(e) => setNotesText(e.target.value)}
                                                                    placeholder="Tambahkan catatan untuk ayat ini..."
                                                                    className="w-full p-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                                    rows="3"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleSaveNotes(bookmark.id)}
                                                                        disabled={savingNotes}
                                                                        className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-sm rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                                                                    >
                                                                        <IoSaveOutline />
                                                                        {savingNotes ? 'Menyimpan...' : 'Simpan'}
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEdit}
                                                                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        <IoCloseOutline />
                                                                        Batal
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-green-700 text-sm">
                                                                {bookmark.notes || 'Klik tombol edit untuk menambahkan catatan...'}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="mt-6 pt-4 border-t border-green-200">
                                                        <a
                                                            href={`/surah/${bookmark.surah_number}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-800 hover:bg-green-100 font-medium transition-all duration-200 border border-green-200"
                                                        >
                                                            Baca Surah
                                                            <IoArrowBackOutline className="rotate-180" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default BookmarksPage;
