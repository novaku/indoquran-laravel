import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoBookmark, IoHeart, IoArrowBackOutline, IoSearchOutline, IoCreateOutline, IoSaveOutline, IoCloseOutline, IoOpenOutline, IoChevronDown, IoChevronForward, IoEye, IoEyeOff } from 'react-icons/io5';
import { getUserBookmarks, updateBookmarkNotes, toggleBookmark, toggleFavorite } from '../services/BookmarkService';
import { getRoutePath } from '../utils/routes';
import { AyahCard } from '../features/quran';

function BookmarksPage({ user }) {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookmarks'); // 'bookmarks' or 'favorites'
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNotes, setEditingNotes] = useState(null); // ID of bookmark being edited
    const [notesText, setNotesText] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of bookmarks per page
    const [bookmarkLoading, setBookmarkLoading] = useState({}); // Track loading state for bookmark actions
    const [expandedSurahs, setExpandedSurahs] = useState({}); // Track which surah groups are expanded
    const [expandedAyahs, setExpandedAyahs] = useState({}); // Track which ayahs are expanded

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        loadBookmarks();
    }, [user, navigate]);

    // Initialize ayahs as collapsed by default
    useEffect(() => {
        // When bookmarks or favorites change, make sure newly added ones are collapsed
        const allBookmarkIds = [...bookmarks, ...favorites].map(bookmark => bookmark.id);
        const newExpandedAyahs = {};
        
        // Set all ayahs to collapsed (false)
        allBookmarkIds.forEach(id => {
            newExpandedAyahs[id] = false;
        });
        
        setExpandedAyahs(prev => ({
            ...prev,
            ...newExpandedAyahs
        }));
    }, [bookmarks, favorites]);

    const loadBookmarks = async () => {
        setLoading(true);
        try {
            const [allBookmarks, userFavorites] = await Promise.all([
                getUserBookmarks(false),
                getUserBookmarks(true)
            ]);
            
            setBookmarks(allBookmarks);
            setFavorites(userFavorites);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmarkToggle = async (ayahId) => {
        if (!user) {
            return;
        }

        setBookmarkLoading(prev => ({ ...prev, [ayahId]: true }));
        
        try {
            await toggleBookmark(ayahId);
            await loadBookmarks(); // Reload to get updated data
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setBookmarkLoading(prev => ({ ...prev, [ayahId]: false }));
        }
    };

    const handleFavoriteToggle = async (ayahId) => {
        if (!user) {
            return;
        }

        setBookmarkLoading(prev => ({ ...prev, [ayahId]: true }));
        
        try {
            await toggleFavorite(ayahId);
            await loadBookmarks(); // Reload to get updated data
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setBookmarkLoading(prev => ({ ...prev, [ayahId]: false }));
        }
    };

    const handleEditNotes = (bookmark) => {
        setEditingNotes(bookmark.id);
        setNotesText(bookmark.pivot?.notes || '');
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

    // Reset page when changing tabs or search term
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    // Get all filtered bookmarks
    const filteredBookmarks = (activeTab === 'favorites' ? favorites : bookmarks)
        .filter(bookmark => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                bookmark.text_indonesian?.toLowerCase().includes(searchLower) ||
                bookmark.surah?.name_indonesian?.toLowerCase().includes(searchLower) ||
                bookmark.ayah_number?.toString().includes(searchLower) ||
                bookmark.surah_number?.toString().includes(searchLower)
            );
        });
    
    // Group bookmarks by surah
    const groupedBookmarks = filteredBookmarks.reduce((groups, bookmark) => {
        const surahNumber = bookmark.surah_number;
        const surahName = bookmark.surah?.name_latin || bookmark.surah_name_latin || bookmark.surah_name || `Surah ${surahNumber}`;
        
        if (!groups[surahNumber]) {
            groups[surahNumber] = {
                surahNumber,
                surahName,
                ayahs: []
            };
        }
        
        groups[surahNumber].ayahs.push(bookmark);
        return groups;
    }, {});
    
    // Convert the grouped object to array and sort by surah number
    const surahGroups = Object.values(groupedBookmarks).sort((a, b) => a.surahNumber - b.surahNumber);

    // Toggle a surah group's expanded state
    const toggleSurahExpand = (surahNumber) => {
        setExpandedSurahs(prev => ({
            ...prev,
            [surahNumber]: !prev[surahNumber]
        }));
    };
    
    // Toggle an ayah's expanded state
    const toggleAyahExpand = (ayahId) => {
        setExpandedAyahs(prev => ({
            ...prev,
            [ayahId]: !prev[ayahId]
        }));
    };
    
    // Toggle all ayahs in a surah
    const toggleAllAyahsInSurah = (surahNumber, ayahIds, show) => {
        const updates = {};
        ayahIds.forEach(id => {
            updates[id] = show;
        });
        
        setExpandedAyahs(prev => ({
            ...prev,
            ...updates
        }));
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Calculate total ayahs for pagination
    const totalAyahsCount = filteredBookmarks.length;
    
    // Pagination logic for grouped display
    const totalPages = Math.ceil(totalAyahsCount / itemsPerPage);
    
    // Get current bookmarks to display with pagination
    const currentBookmarks = surahGroups;
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top smoothly when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 shadow-islamic"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200"
                    >
                        <IoArrowBackOutline className="text-xl" />
                    </button>
                    <h1 className="text-3xl font-bold text-green-800">
                        {activeTab === 'favorites' ? 'Ayat Favorit' : 'Bookmark Ayat'}
                    </h1>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-green-50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'bookmarks'
                                ? 'bg-white text-green-700 shadow-islamic border border-green-200'
                                : 'bg-green-50 text-green-800 hover:bg-green-100 border border-transparent'
                        }`}
                    >
                        <IoBookmark className="text-lg flex-shrink-0" />
                        <span className="flex-1">
                            <span>Bookmark ({bookmarks.length})</span> 
                            {surahGroups.length > 0 && <span className="ml-1 whitespace-nowrap">• {surahGroups.length} Surah</span>}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'favorites'
                                ? 'bg-white text-red-700 shadow-islamic border border-red-200'
                                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-transparent'
                        }`}
                    >
                        <IoHeart className="text-lg flex-shrink-0" />
                        <span className="flex-1">
                            <span>Favorit ({favorites.length})</span> 
                            {surahGroups.length > 0 && <span className="ml-1 whitespace-nowrap">• {surahGroups.length} Surah</span>}
                        </span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
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

            {/* Content */}
            {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        {activeTab === 'favorites' ? (
                            <IoHeart className="text-6xl text-red-300 mx-auto" />
                        ) : (
                            <IoBookmark className="text-6xl text-green-300 mx-auto" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 mb-2">
                        {searchTerm 
                            ? 'Tidak ada hasil yang ditemukan'
                            : activeTab === 'favorites' 
                                ? 'Belum ada ayat favorit'
                                : 'Belum ada bookmark'
                        }
                    </h3>
                    <p className="text-green-600">
                        {searchTerm 
                            ? 'Coba kata kunci yang berbeda'
                            : activeTab === 'favorites'
                                ? 'Tandai ayat sebagai favorit dengan menekan tombol hati'
                                : 'Simpan ayat dengan menekan tombol bookmark'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pagination Info */}
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full border border-green-200">
                            <span className="text-sm font-medium text-green-700">
                                Menampilkan {filteredBookmarks.length} {activeTab === 'favorites' ? 'favorit' : 'bookmark'} dalam {surahGroups.length} surah
                            </span>
                        </div>
                    </div>
                    
                    {/* Surah Groups */}
                    {currentBookmarks.map((group) => (
                        <div key={group.surahNumber} className="mb-4">
                            {/* Surah Header with Toggle */}
                            <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl px-4 py-3 border border-green-200 shadow-sm">
                                <div className="flex items-center justify-between cursor-pointer hover:from-green-200 hover:to-green-100 transition-all duration-200"
                                     onClick={() => toggleSurahExpand(group.surahNumber)}>
                                    <div className="flex items-center gap-2">
                                        {expandedSurahs[group.surahNumber] ? (
                                            <IoChevronDown className="text-green-600 text-lg" />
                                        ) : (
                                            <IoChevronForward className="text-green-600 text-lg" />
                                        )}
                                        <h3 className="font-semibold text-green-800">
                                            Surah {group.surahName}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                            {group.surahNumber}
                                        </span>
                                        <span className="text-xs bg-white text-green-600 px-2 py-1 rounded-full border border-green-200">
                                            {group.ayahs.length} ayat
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Ayah toggle controls - only show when surah is expanded */}
                                {expandedSurahs[group.surahNumber] && (
                                    <div className="flex justify-end mt-2 pt-2 border-t border-green-200">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleAllAyahsInSurah(group.surahNumber, group.ayahs.map(ayah => ayah.id), true);
                                                }}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-white rounded-md border border-green-200 hover:bg-green-50 transition-colors"
                                            >
                                                <IoEye className="text-sm" />
                                                <span>Tampilkan Semua</span>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleAllAyahsInSurah(group.surahNumber, group.ayahs.map(ayah => ayah.id), false);
                                                }}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-white rounded-md border border-green-200 hover:bg-green-50 transition-colors"
                                            >
                                                <IoEyeOff className="text-sm" />
                                                <span>Sembunyikan Semua</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Collapsible Ayahs */}
                            {expandedSurahs[group.surahNumber] && (
                                <div className="border-x border-b border-green-200 rounded-b-xl mb-4 divide-y divide-green-100">
                                    {group.ayahs.map((bookmark) => (
                                        <div key={bookmark.id} className="relative">
                                            {/* Ayah Header with Toggle */}
                                            <div 
                                                className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-white cursor-pointer hover:bg-green-100 transition-all duration-200"
                                                onClick={() => toggleAyahExpand(bookmark.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {expandedAyahs[bookmark.id] ? (
                                                        <IoChevronDown className="text-green-600 text-sm" />
                                                    ) : (
                                                        <IoChevronForward className="text-green-600 text-sm" />
                                                    )}
                                                    <h4 className="text-sm font-medium text-green-700">
                                                        Ayat {bookmark.ayah_number}
                                                    </h4>
                                                </div>
                                                {/* Removed favorite and bookmark icons */}
                                            </div>

                                            {/* Expanded Ayah Content */}
                                            {expandedAyahs[bookmark.id] && (
                                                <>
                                                    {/* Removed bookmark indicators */}

                                                    {/* Use AyahCard component */}
                                                    <AyahCard 
                                                        ayah={bookmark} 
                                                        surah={{
                                                            name_indonesian: bookmark.surah?.name_indonesian || "Surah", 
                                                            name_latin: bookmark.surah?.name_latin || bookmark.surah_name_latin || bookmark.surah_name || `${bookmark.surah_number}`,
                                                            number: bookmark.surah_number
                                                        }}
                                                        highlightText={searchTerm}
                                                        showBookmarkControls
                                                        isBookmarked={bookmark.pivot?.is_bookmarked}
                                                        isFavorite={bookmark.pivot?.is_favorite}
                                                        onBookmarkToggle={handleBookmarkToggle}
                                                        onFavoriteToggle={handleFavoriteToggle}
                                                        variant="full"
                                                    />

                                                    {/* Notes Section */}
                                                    <div className="bg-green-50 rounded-lg p-4 border border-green-100 -mt-4 rounded-t-none">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-medium text-green-800">Catatan:</h4>
                                                            {!editingNotes && (
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
                                                                {bookmark.pivot?.notes || 'Klik tombol edit untuk menambahkan catatan...'}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Additional Actions */}
                                                    <div className="bg-white rounded-b-2xl px-6 pb-4 -mt-2 border-l border-r border-b border-green-100">
                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <Link
                                                                to={getRoutePath(`/surah/${bookmark.surah_number}/${bookmark.ayah_number}`)}
                                                                className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded bg-green-50 border border-green-100"
                                                            >
                                                                <IoOpenOutline className="text-sm" />
                                                                <span>Buka Ayat</span>
                                                            </Link>
                                                            <Link
                                                                to={getRoutePath(`/surah/${bookmark.surah_number}`)}
                                                                className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded bg-green-50 border border-green-100"
                                                            >
                                                                <IoBookmark className="text-sm" />
                                                                <span>Baca Surah</span>
                                                                <IoArrowBackOutline className="rotate-180" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <nav className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1"
                                aria-label="Pagination">
                                {/* Previous button */}
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        currentPage === 1
                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden sm:inline">Sebelumnya</span>
                                    <span className="sm:hidden">Prev</span>
                                </button>
                                
                                {/* Page numbers */}
                                {(() => {
                                    const pages = [];
                                    const maxVisible = 5;
                                    let startPage, endPage;
                                    
                                    if (totalPages <= maxVisible) {
                                        startPage = 1;
                                        endPage = totalPages;
                                    } else {
                                        if (currentPage <= 3) {
                                            startPage = 1;
                                            endPage = maxVisible;
                                        } else if (currentPage + 2 >= totalPages) {
                                            startPage = totalPages - maxVisible + 1;
                                            endPage = totalPages;
                                        } else {
                                            startPage = currentPage - 2;
                                            endPage = currentPage + 2;
                                        }
                                    }
                                    
                                    // Always show page numbers in the calculated range
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`px-3 py-2 min-w-[40px] text-sm font-medium rounded-md transition-all duration-200 border ${
                                                    currentPage === i
                                                    ? 'bg-green-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold'
                                                    : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md hover:scale-105'
                                                }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }
                                    
                                    // Show ellipsis and last page if needed
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(
                                                <span key="ellipsis" className="px-3 py-2 text-gray-500 bg-gray-50 border border-gray-200">
                                                    ...
                                                </span>
                                            );
                                        }
                                        pages.push(
                                            <button
                                                key={totalPages}
                                                onClick={() => handlePageChange(totalPages)}
                                                className={`px-3 py-2 min-w-[40px] text-sm font-medium rounded-md border transition-all duration-200 ${
                                                    currentPage === totalPages
                                                    ? 'bg-green-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold'
                                                    : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-600 border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md hover:scale-105'
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        );
                                    }
                                    
                                    return pages;
                                })()}
                                
                                {/* Next button */}
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        currentPage === totalPages
                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md'
                                    }`}
                                >
                                    <span className="hidden sm:inline">Selanjutnya</span>
                                    <span className="sm:hidden">Next</span>
                                    <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default BookmarksPage;
