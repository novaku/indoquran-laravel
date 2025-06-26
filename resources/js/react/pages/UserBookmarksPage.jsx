import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBookmark, IoSearchOutline, IoTrashOutline, IoChevronDown, IoChevronUp, IoPencilOutline, IoCheckmarkOutline, IoCloseOutline } from 'react-icons/io5';
import { getUserBookmarks, updateBookmarkNotesByNumbers } from '../services/BookmarkService';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';

function UserBookmarksPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [expandedSurahs, setExpandedSurahs] = useState({});
    const [editingNotes, setEditingNotes] = useState({}); // Track which bookmark is being edited
    const [tempNotes, setTempNotes] = useState({}); // Temporary notes while editing
    const [updatingNotes, setUpdatingNotes] = useState({}); // Track loading state for notes update

    useEffect(() => {
        if (!user) {
            navigate('/masuk');
            return;
        }
        loadBookmarks();
    }, [user]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const data = await getUserBookmarks();
            console.log('Bookmark data:', data); // Debug log
            setBookmarks(data || []);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            setError('Gagal memuat penanda. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToAyah = (surahNumber, ayahNumber) => {
        navigate(`/surah/${surahNumber}/${ayahNumber}`);
    };

    const toggleSurahExpanded = (surahNumber) => {
        setExpandedSurahs(prev => ({
            ...prev,
            [surahNumber]: !prev[surahNumber]
        }));
    };

    const startEditingNotes = (bookmarkId, currentNotes) => {
        setEditingNotes(prev => ({ ...prev, [bookmarkId]: true }));
        setTempNotes(prev => ({ ...prev, [bookmarkId]: currentNotes || '' }));
    };

    const cancelEditingNotes = (bookmarkId) => {
        setEditingNotes(prev => ({ ...prev, [bookmarkId]: false }));
        setTempNotes(prev => ({ ...prev, [bookmarkId]: '' }));
    };

    const saveNotes = async (bookmark) => {
        const bookmarkId = bookmark.id;
        const notes = tempNotes[bookmarkId];
        
        try {
            setUpdatingNotes(prev => ({ ...prev, [bookmarkId]: true }));
            
            await updateBookmarkNotesByNumbers(
                bookmark.surah_number,
                bookmark.ayah_number,
                notes
            );
            
            // Update the bookmark in the local state
            setBookmarks(prev => prev.map(b => 
                b.id === bookmarkId 
                    ? { ...b, pivot: { ...b.pivot, notes: notes } }
                    : b
            ));
            
            // Clear editing state
            setEditingNotes(prev => ({ ...prev, [bookmarkId]: false }));
            setTempNotes(prev => ({ ...prev, [bookmarkId]: '' }));
            
            // Show success message
            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all text-sm';
            alertDiv.style.opacity = '1';
            alertDiv.textContent = '✅ Catatan berhasil disimpan!';
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
            console.error('Error saving notes:', error);
            setError('Gagal menyimpan catatan. Silakan coba lagi.');
        } finally {
            setUpdatingNotes(prev => ({ ...prev, [bookmarkId]: false }));
        }
    };

    const filteredBookmarks = bookmarks.filter(bookmark => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const surahName = bookmark.surah?.name_indonesian || '';
        return (
            surahName.toLowerCase().includes(searchLower) ||
            bookmark.text_arabic?.toLowerCase().includes(searchLower) ||
            bookmark.text_indonesian?.toLowerCase().includes(searchLower)
        );
    });

    // Group bookmarks by surah and sort
    const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
        const surahNumber = bookmark.surah_number;
        const surahName = bookmark.surah?.name_indonesian || `Surah ${surahNumber}`;
        const surahKey = `${surahNumber}-${surahName}`;
        if (!acc[surahKey]) {
            acc[surahKey] = {
                surah_number: surahNumber,
                surah_name: surahName,
                ayahs: []
            };
        }
        acc[surahKey].ayahs.push(bookmark);
        return acc;
    }, {});

    // Sort surahs by number and ayahs by number
    const sortedGroupedBookmarks = Object.values(groupedBookmarks)
        .sort((a, b) => a.surah_number - b.surah_number)
        .map(surah => ({
            ...surah,
            ayahs: surah.ayahs.sort((a, b) => a.ayah_number - b.ayah_number)
        }));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Penanda Saya - IndoQuran"
                description="Kelola ayat-ayat Al-Quran yang telah Anda tandai"
            />
            
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-3 mb-4">
                            <IoBookmark className="w-6 h-6 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Penanda Saya</h1>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari ayat yang ditandai..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {filteredBookmarks.length === 0 ? (
                        <div className="text-center py-12">
                            <IoBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'Tidak ada hasil' : 'Belum ada penanda'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm 
                                    ? 'Coba gunakan kata kunci yang berbeda' 
                                    : 'Mulai menandai ayat-ayat favorit Anda'
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Jelajahi Al-Quran
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 mb-4">
                                {filteredBookmarks.length} ayat ditandai
                                {searchTerm && ` dari "${searchTerm}"`}
                            </p>
                            
                            {sortedGroupedBookmarks.map((surahGroup) => (
                                <div key={`surah-${surahGroup.surah_number}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Surah Header */}
                                    <div 
                                        className="bg-green-50 border-b border-green-100 px-6 py-4 cursor-pointer hover:bg-green-100 transition-colors"
                                        onClick={() => toggleSurahExpanded(surahGroup.surah_number)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    [{surahGroup.surah_number}] Surah : {surahGroup.surah_name} ({surahGroup.ayahs.length} ayat ditandai)
                                                </h2>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expandedSurahs[surahGroup.surah_number] ? (
                                                    <IoChevronUp className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <IoChevronDown className="w-5 h-5 text-gray-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ayahs - Collapsible */}
                                    {expandedSurahs[surahGroup.surah_number] && (
                                        <div className="divide-y divide-gray-100">
                                            {surahGroup.ayahs.map((bookmark) => (
                                                <div
                                                    key={bookmark.id}
                                                    className="p-6 hover:bg-gray-50 transition-colors"
                                                >
                                                    {/* Ayah Number */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                Ayat {bookmark.ayah_number}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleGoToAyah(bookmark.surah_number, bookmark.ayah_number)}
                                                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                            >
                                                                Buka Ayat
                                                            </button>
                                                            <IoBookmark className="w-5 h-5 text-green-600" />
                                                        </div>
                                                    </div>

                                                    {/* Arabic Text */}
                                                    {bookmark.text_arabic && (
                                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                            <p className="text-right text-2xl leading-loose font-arabic text-gray-900">
                                                                {bookmark.text_arabic}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Translation */}
                                                    {bookmark.text_indonesian && (
                                                        <div className="mb-4">
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {bookmark.text_indonesian}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Notes Section */}
                                                    <div className="mt-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">Catatan:</span>
                                                            {!editingNotes[bookmark.id] && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditingNotes(bookmark.id, bookmark.pivot?.notes);
                                                                    }}
                                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                                                                >
                                                                    <IoPencilOutline className="w-4 h-4" />
                                                                    {bookmark.pivot?.notes ? 'Edit' : 'Tambah'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {editingNotes[bookmark.id] ? (
                                                            <div className="space-y-2">
                                                                <textarea
                                                                    value={tempNotes[bookmark.id] || ''}
                                                                    onChange={(e) => setTempNotes(prev => ({ ...prev, [bookmark.id]: e.target.value }))}
                                                                    placeholder="Tambahkan catatan untuk ayat ini..."
                                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                                                    rows={3}
                                                                    maxLength={1000}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-500">
                                                                        {(tempNotes[bookmark.id] || '').length}/1000 karakter
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                cancelEditingNotes(bookmark.id);
                                                                            }}
                                                                            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                                                                            disabled={updatingNotes[bookmark.id]}
                                                                        >
                                                                            <IoCloseOutline className="w-4 h-4" />
                                                                            Batal
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                saveNotes(bookmark);
                                                                            }}
                                                                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                                                            disabled={updatingNotes[bookmark.id]}
                                                                        >
                                                                            {updatingNotes[bookmark.id] ? (
                                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                            ) : (
                                                                                <IoCheckmarkOutline className="w-4 h-4" />
                                                                            )}
                                                                            Simpan
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                                {bookmark.pivot?.notes ? (
                                                                    <p className="text-sm text-gray-700">
                                                                        {bookmark.pivot.notes}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 italic">
                                                                        Belum ada catatan untuk ayat ini
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Created Date */}
                                                    {bookmark.pivot?.created_at && (
                                                        <div className="mt-4 text-xs text-gray-500">
                                                            Ditandai pada: {new Date(bookmark.pivot.created_at).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
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
        </>
    );
}

export default UserBookmarksPage;
