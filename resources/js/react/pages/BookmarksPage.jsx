import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoBookmark, IoHeart, IoArrowBackOutline, IoSearchOutline, IoCreateOutline, IoSaveOutline, IoCloseOutline } from 'react-icons/io5';
import { getUserBookmarks, updateBookmarkNotes } from '../services/BookmarkService';

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

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }

        loadBookmarks();
    }, [user, navigate]);

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800 transition-all duration-200 border border-primary-200"
                    >
                        <IoArrowBackOutline className="text-xl" />
                    </button>
                    <h1 className="text-3xl font-bold text-primary-800">
                        {activeTab === 'favorites' ? 'Ayat Favorit' : 'Bookmark Ayat'}
                    </h1>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-primary-50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bookmarks')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'bookmarks'
                                ? 'bg-white text-primary-700 shadow-islamic border border-primary-200'
                                : 'bg-primary-50 text-primary-800 hover:bg-primary-100 border border-transparent'
                        }`}
                    >
                        <IoBookmark className="text-lg" />
                        Bookmark ({bookmarks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                            activeTab === 'favorites'
                                ? 'bg-white text-red-700 shadow-islamic border border-red-200'
                                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-transparent'
                        }`}
                    >
                        <IoHeart className="text-lg" />
                        Favorit ({favorites.length})
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
                    <input
                        type="text"
                        placeholder="Cari ayat atau surah..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                            <IoBookmark className="text-6xl text-primary-300 mx-auto" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-primary-700 mb-2">
                        {searchTerm 
                            ? 'Tidak ada hasil yang ditemukan'
                            : activeTab === 'favorites' 
                                ? 'Belum ada ayat favorit'
                                : 'Belum ada bookmark'
                        }
                    </h3>
                    <p className="text-primary-600">
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
                    {filteredBookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="bg-gradient-to-br from-white to-islamic-cream border border-primary-200 rounded-lg p-6 shadow-islamic hover:shadow-islamic-md transition-all duration-300"
                        >
                            {/* Surah and Ayah Info */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Link
                                        to={`/surah/${bookmark.surah_number}`}
                                        className="text-lg font-semibold text-primary-800 hover:text-primary-600 transition-colors"
                                    >
                                        {bookmark.surah?.name_indonesian || `Surah ${bookmark.surah_number}`}
                                    </Link>
                                    <span className="text-primary-600">•</span>
                                    <span className="text-primary-600">Ayat {bookmark.ayah_number}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {bookmark.pivot?.is_favorite && (
                                        <IoHeart className="text-red-500" title="Favorit" />
                                    )}
                                    <IoBookmark className="text-primary-500" title="Bookmark" />
                                </div>
                            </div>

                            {/* Arabic Text */}
                            <div className="text-right mb-4">
                                <p 
                                    className="font-arabic text-2xl leading-loose text-primary-800"
                                    style={{ 
                                        textShadow: '0 1px 1px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {bookmark.text_arabic}
                                </p>
                            </div>

                            {/* Indonesian Translation */}
                            <div className="mb-3">
                                <p className="text-primary-700 leading-relaxed">
                                    {bookmark.text_indonesian}
                                </p>
                            </div>

                            {/* Transliteration */}
                            {bookmark.text_latin && (
                                <div className="mb-4">
                                    <p className="text-primary-600 italic text-sm">
                                        {bookmark.text_latin}
                                    </p>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-primary-800">Catatan:</h4>
                                    {!editingNotes && (
                                        <button
                                            onClick={() => handleEditNotes(bookmark)}
                                            className="p-1 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800 transition-all duration-200 border border-primary-200"
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
                                            className="w-full p-2 text-sm border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            rows="3"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSaveNotes(bookmark.id)}
                                                disabled={savingNotes}
                                                className="flex items-center gap-1 px-3 py-1 bg-primary-100 border border-primary-300 text-primary-800 text-sm rounded hover:bg-primary-200 disabled:opacity-50 transition-colors"
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
                                    <p className="text-primary-700 text-sm">
                                        {bookmark.pivot?.notes || 'Klik tombol edit untuk menambahkan catatan...'}
                                    </p>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 pt-4 border-t border-primary-200">
                                <Link
                                    to={`/surah/${bookmark.surah_number}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-800 hover:bg-primary-100 font-medium transition-all duration-200 border border-primary-200"
                                >
                                    Baca Surah
                                    <IoArrowBackOutline className="rotate-180" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookmarksPage;
