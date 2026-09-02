import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PlayIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { 
    IoBookmark, 
    IoDocumentTextOutline, 
    IoListOutline,
    IoSparkles
} from 'react-icons/io5';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { Card, Button, Badge, PageHeader, PageContent } from '../components/ui';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseInFeed from '../components/AdSenseInFeed';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { getUserBookmarks } from '../services/BookmarkService';
import { scrollToTop } from '../utils/scrollUtils';

function SurahListPage() {
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const [surahs, setSurahs] = useState([]);
    const [bookmarksBySurah, setBookmarksBySurah] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlace, setFilterPlace] = useState('all'); // all, makkah, madinah, bookmarked
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

    useEffect(() => {
        scrollToTop();
        loadSurahs();
        loadBookmarks();

        const handleBookmarksUpdate = () => {
            loadBookmarks();
        };
        window.addEventListener('indoquran_bookmarks_updated', handleBookmarksUpdate);
        return () => {
            window.removeEventListener('indoquran_bookmarks_updated', handleBookmarksUpdate);
        };
    }, []);


    // Handle clicks outside search component
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setSelectedSuggestion(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadBookmarks = async () => {
        try {
            const bookmarks = await getUserBookmarks();
            const map = {};
            if (Array.isArray(bookmarks)) {
                bookmarks.forEach(b => {
                    const sNum = parseInt(b.surah_number, 10);
                    const aNum = parseInt(b.ayah_number, 10);
                    if (sNum && aNum) {
                        if (!map[sNum]) map[sNum] = [];
                        if (!map[sNum].includes(aNum)) map[sNum].push(aNum);
                    }
                });
            }
            setBookmarksBySurah(map);
        } catch (e) {
            console.error('Error loading bookmarks in SurahListPage:', e);
        }
    };

    const loadSurahs = async () => {
        try {
            setLoading(true);
            scrollToTop();
            setError(null);

            
            const token = authUtils.getAuthToken();
            const response = await fetchWithAuth('/api/surahs', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch surahs');
            const result = await response.json();
            
            if (result.status === 'success') {
                setSurahs(result.data || []);
            } else {
                throw new Error(result.message || 'Failed to load surahs');
            }
        } catch (err) {
            console.error('Error loading surahs:', err);
            setError('Gagal memuat daftar surah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleSurahClick = (surahNumber) => {
        navigate(`/surah/${surahNumber}`);
    };

    // Get autocomplete suggestions based on search term
    const getSuggestions = () => {
        if (!searchTerm || searchTerm.length < 1) return [];
        
        return surahs.filter(surah => {
            const matchesSearch = 
                surah.name_latin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                surah.name_indonesian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                surah.name_arabic?.includes(searchTerm) ||
                surah.number.toString().includes(searchTerm);
            
            let matchesPlace = true;
            if (filterPlace === 'makkah' || filterPlace === 'madinah') {
                matchesPlace = surah.revelation_place?.toLowerCase() === filterPlace.toLowerCase();
            } else if (filterPlace === 'bookmarked') {
                matchesPlace = (bookmarksBySurah[surah.number] || []).length > 0;
            }
            
            return matchesSearch && matchesPlace;
        }).slice(0, 8); // Limit to 8 suggestions
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowSuggestions(value.length > 0);
        setSelectedSuggestion(-1);
    };

    const handleSuggestionClick = (surah) => {
        setSearchTerm(surah.name_latin);
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        // Optionally navigate directly to the surah
        navigate(`/surah/${surah.number}`);
    };

    const handleKeyDown = (e) => {
        const suggestions = getSuggestions();
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestion(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
            e.preventDefault();
            const selectedSurah = suggestions[selectedSuggestion];
            handleSuggestionClick(selectedSurah);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestion(-1);
        }
    };

    const handleSearchBlur = () => {
        // We'll handle this with the click outside effect instead
    };

    const handleSearchFocus = () => {
        if (searchTerm.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Filter surahs based on search and place/bookmarks
    const filteredSurahs = surahs.filter(surah => {
        const matchesSearch = !searchTerm || 
            surah.name_latin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.name_indonesian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.name_arabic?.includes(searchTerm) ||
            surah.number.toString().includes(searchTerm);
        
        let matchesPlace = true;
        if (filterPlace === 'makkah' || filterPlace === 'madinah') {
            matchesPlace = surah.revelation_place?.toLowerCase() === filterPlace.toLowerCase();
        } else if (filterPlace === 'bookmarked') {
            matchesPlace = (bookmarksBySurah[surah.number] || []).length > 0;
        }
        
        return matchesSearch && matchesPlace;
    });

    const bookmarkedSurahsCount = Object.keys(bookmarksBySurah).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Memuat daftar surah...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="text-center max-w-md bg-red-50 border-red-200">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button
                        variant="danger"
                        onClick={loadSurahs}
                    >
                        Coba Lagi
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Daftar Surah Al-Quran - IndoQuran"
                description="Jelajahi dan baca semua 114 surah Al-Quran lengkap dengan terjemahan bahasa Indonesia. Pilih surah berdasarkan tempat turunnya di Makkah atau Madinah."
                keywords="daftar surah, al quran indonesia, 114 surah, surah makkiyah madaniyah, quran indonesia, surah al quran lengkap"
            />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                            Daftar Surah Al-Quran
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                            114 Surah dalam Al-Quran Karim lengkap dengan terjemahan bahasa Indonesia, teks Arab, dan audio murottal.
                        </p>
                    </div>
                </div>

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-7xl" labelText="IKLAN" />

                <PageContent size="xl">
                    <Card className="mb-6">
                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div ref={searchRef} className="relative flex-1">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                                <input
                                    type="text"
                                    placeholder="Cari surah (nama, nomor, atau tempat turun)..."
                                    value={searchTerm}
                                    onChange={handleSearchInputChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    autoComplete="off"
                                />
                                
                                {/* Autocomplete Suggestions */}
                                {showSuggestions && getSuggestions().length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                        {getSuggestions().map((surah, index) => {
                                            const surahBookmarks = bookmarksBySurah[surah.number] || [];
                                            return (
                                                <div
                                                    key={surah.number}
                                                    onClick={() => handleSuggestionClick(surah)}
                                                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                        index === selectedSuggestion ? 'bg-green-50 border-green-200' : ''
                                                    }`}
                                                >
                                                    <div className="relative">
                                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                                            {surah.number}
                                                        </div>
                                                        {surahBookmarks.length > 0 && (
                                                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                                                                <IoBookmark className="w-2 h-2" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {surah.name_latin}
                                                            </p>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                                surah.revelation_place?.toLowerCase() === 'makkah' 
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {surah.revelation_place === 'makkah' ? 'Makkiyah' : 'Madaniyah'}
                                                            </span>
                                                            {surahBookmarks.length > 0 && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
                                                                    <IoBookmark className="w-2.5 h-2.5 text-amber-600" />
                                                                    {surahBookmarks.length} ditandai
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">{surah.name_indonesian}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-arabic text-gray-800" dir="rtl">
                                                            {surah.name_arabic}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{surah.total_ayahs} ayat</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            {/* Filter by revelation place or bookmark */}
                            <select
                                value={filterPlace}
                                onChange={(e) => setFilterPlace(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white font-medium text-gray-700"
                            >
                                <option value="all">Semua Tempat</option>
                                <option value="makkah">Makkiyah</option>
                                <option value="madinah">Madaniyah</option>
                                <option value="bookmarked">
                                    🔖 Ditandai ({bookmarkedSurahsCount} Surah)
                                </option>
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span>Total: {filteredSurahs.length} surah</span>
                            <span>•</span>
                            <span>Makkiyah: {surahs.filter(s => s.revelation_place?.toLowerCase() === 'makkah').length}</span>
                            <span>•</span>
                            <span>Madaniyah: {surahs.filter(s => s.revelation_place?.toLowerCase() === 'madinah').length}</span>
                            {bookmarkedSurahsCount > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <IoBookmark className="w-3.5 h-3.5 text-amber-600" />
                                        {bookmarkedSurahsCount} surah ada penanda
                                    </span>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Content */}
                    {filteredSurahs.length === 0 ? (
                        <Card className="text-center py-12">
                            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada surah ditemukan</h3>
                            <p className="text-gray-500">
                                {filterPlace === 'bookmarked'
                                    ? 'Belum ada ayat yang ditandai (bookmark) pada surah apapun.'
                                    : 'Coba ubah kata kunci pencarian atau filter yang digunakan.'}
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSurahs.map((surah, index) => {
                                const surahBookmarks = bookmarksBySurah[surah.number] || [];
                                const hasBookmarks = surahBookmarks.length > 0;
                                const showInFeedAd = index === 7 || (index > 7 && (index + 1) % 24 === 0);

                                return (
                                    <React.Fragment key={surah.number}>
                                        {showInFeedAd && (
                                            <AdSenseInFeed 
                                                adSlot="1519827772"
                                                labelText="IKLAN REKOMENDASI"
                                            />
                                        )}
                                        <div
                                            onClick={() => handleSurahClick(surah.number)}
                                            className={`bg-white rounded-xl border p-5 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                                                hasBookmarks 
                                                    ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white' 
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}
                                        >
                                        {/* Surah Header */}
                                        <div className="flex items-start justify-between mb-4 gap-2">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                <div className="relative shrink-0">
                                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-white font-bold transition-colors ${
                                                        hasBookmarks
                                                            ? 'bg-emerald-600 group-hover:bg-emerald-700 ring-2 ring-amber-300'
                                                            : 'bg-green-600 group-hover:bg-green-700'
                                                    }`}>
                                                        {surah.number}
                                                    </div>
                                                    {hasBookmarks && (
                                                        <span 
                                                            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-white"
                                                            title={`${surahBookmarks.length} ayat ditandai di surah ini`}
                                                        >
                                                            <IoBookmark className="w-2.5 h-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                                                        {surah.name_latin}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 truncate">{surah.name_indonesian}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Badges: Place & Bookmark */}
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    surah.revelation_place?.toLowerCase() === 'makkah' 
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    <MapPinIcon className="w-3 h-3 shrink-0" />
                                                    <span>{surah.revelation_place?.toLowerCase() === 'makkah' ? 'Makkiyah' : 'Madaniyah'}</span>
                                                </span>
                                                {hasBookmarks && (
                                                    <span 
                                                        className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs"
                                                        title={`Ayat ditandai: ${surahBookmarks.sort((a, b) => a - b).join(', ')}`}
                                                    >
                                                        <IoBookmark className="w-3 h-3 text-amber-600" />
                                                        <span>{surahBookmarks.length} ayat</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arabic Name */}
                                        <div className="text-center mb-4">
                                            <p className="text-2xl font-arabic text-gray-800 leading-loose" dir="rtl">
                                                {surah.name_arabic}
                                            </p>
                                        </div>

                                        {/* Surah Info */}
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                            <span>{surah.total_ayahs} ayat</span>
                                            <div className="flex items-center space-x-2">
                                                {/* Popular surah indicator */}
                                                {[1, 2, 18, 36, 55, 67, 112, 113, 114].includes(surah.number) && (
                                                    <div className="flex items-center space-x-1">
                                                        <StarIcon className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-xs text-yellow-600">Populer</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {surah.description_short && (
                                            <div className="text-sm text-gray-600 mb-4">
                                                <p 
                                                    className="line-clamp-3"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: surah.description_short.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Action Buttons: 2 Links Only (Baca Surah & Kandungan Surah) */}
                                        <div className="pt-3.5 border-t border-gray-100 mt-auto grid grid-cols-2 gap-2">
                                            {/* Button 1: Baca Surah (Pergi langsung ke /surah/:number) */}
                                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 transition-all shadow-xs group-hover:shadow-sm text-center">
                                                <BookOpenIcon className="w-4 h-4 shrink-0" />
                                                <span>Baca Surah</span>
                                                <span>→</span>
                                            </span>

                                            {/* Button 2: Kandungan Surah (Pergi ke /surah/:number?tab=kandungan) */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/surah/${surah.number}?tab=kandungan`);
                                                }}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 text-center"
                                                title={`Lihat info latar belakang & kandungan Surah ${surah.name_latin}`}
                                            >
                                                <IoDocumentTextOutline className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>Kandungan Surah</span>
                                            </button>
                                        </div>
                                    </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick Navigation */}
                    <Card className="mt-8 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigasi Cepat</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/juz"
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                <span>Jelajahi berdasarkan Juz</span>
                            </Link>
                            <Link
                                to="/halaman"
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                <span>Jelajahi berdasarkan Halaman</span>
                            </Link>
                            <Link
                                to="/cari"
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5" />
                                <span>Pencarian Ayat</span>
                            </Link>
                        </div>
                    </Card>
                </PageContent>
            </div>
        </>
    );
}

export default SurahListPage;
