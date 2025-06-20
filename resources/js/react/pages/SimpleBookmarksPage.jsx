import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBookmark, IoArrowBackOutline, IoSearchOutline, IoTrashOutline, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { getUserBookmarks } from '../services/BookmarkService';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';

function SimpleBookmarksPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [expandedSurahs, setExpandedSurahs] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        loadBookmarks();
    }, [user]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const data = await getUserBookmarks();
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

    const filteredBookmarks = bookmarks.filter(bookmark => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            bookmark.surah_name?.toLowerCase().includes(searchLower) ||
            bookmark.ayah_text?.toLowerCase().includes(searchLower) ||
            bookmark.ayah_translation?.toLowerCase().includes(searchLower)
        );
    });

    // Group bookmarks by surah and sort
    const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
        const surahKey = `${bookmark.surah_number}-${bookmark.surah_name}`;
        if (!acc[surahKey]) {
            acc[surahKey] = {
                surah_number: bookmark.surah_number,
                surah_name: bookmark.surah_name,
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
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <IoArrowBackOutline className="w-5 h-5" />
                                <span>Kembali</span>
                            </button>
                        </div>
                        
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
                                                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {surahGroup.surah_number}
                                                </div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    {surahGroup.surah_name || `Surah ${surahGroup.surah_number}`}
                                                </h2>
                                                <span className="text-sm text-gray-600">
                                                    ({surahGroup.ayahs.length} ayat ditandai)
                                                </span>
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
                                                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => handleGoToAyah(bookmark.surah_number, bookmark.ayah_number)}
                                                >
                                                    {/* Ayah Number */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                Ayat {bookmark.ayah_number}
                                                            </div>
                                                        </div>
                                                        <IoBookmark className="w-5 h-5 text-green-600" />
                                                    </div>

                                                    {/* Arabic Text */}
                                                    {bookmark.ayah_text && (
                                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                            <p className="text-right text-2xl leading-loose font-arabic text-gray-900">
                                                                {bookmark.ayah_text}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Translation */}
                                                    {bookmark.ayah_translation && (
                                                        <div className="mb-4">
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {bookmark.ayah_translation}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    {bookmark.notes && (
                                                        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                                                            <p className="text-sm text-gray-700">
                                                                <span className="font-medium">Catatan: </span>
                                                                {bookmark.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Created Date */}
                                                    {bookmark.created_at && (
                                                        <div className="mt-4 text-xs text-gray-500">
                                                            Ditandai pada: {new Date(bookmark.created_at).toLocaleDateString('id-ID', {
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

export default SimpleBookmarksPage;
