import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    DocumentDuplicateIcon,
    ShareIcon,
    ArrowLeftIcon,
    BookOpenIcon,
    AdjustmentsHorizontalIcon,
    SparklesIcon,
    ArrowTopRightOnSquareIcon,
    FunnelIcon,
    ChevronDownIcon,
    SpeakerWaveIcon,
    BookmarkIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import {
    PlayIcon as SolidPlayIcon,
    PauseIcon as SolidPauseIcon,
    BookmarkIcon as SolidBookmarkIcon,
    HeartIcon as SolidHeartIcon
} from '@heroicons/react/24/solid';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import { useArabicSpeech } from '../hooks/useArabicSpeech';
import HaditsAudioPlayer from '../components/HaditsAudioPlayer';
import { FaWhatsapp } from 'react-icons/fa';
import {
    getLocalHaditsBookmarks,
    toggleHaditsBookmark,
    toggleHaditsFavorite,
    getUserHaditsBookmarks,
    isUserLoggedIn
} from '../services/HaditsBookmarkService';

export default function HaditsReaderPage() {
    const { kitab: kitabSlug, nomor: singleNomorParam } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Query parameters
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const searchParam = searchParams.get('q') || '';
    const jumpParam = searchParams.get('nomor') || '';

    // States
    const [kitabInfo, setKitabInfo] = useState(null);
    const [allKitabs, setAllKitabs] = useState([]);
    const [haditsList, setHaditsList] = useState([]);
    const [singleHadits, setSingleHadits] = useState(null);
    const [singleNavigation, setSingleNavigation] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: pageParam,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 1,
        to: 20
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Controls
    const [searchInput, setSearchInput] = useState(searchParam);
    const [jumpInput, setJumpInput] = useState(jumpParam);
    const [arabicFontSize, setArabicFontSize] = useState(24); // in px
    const [isKitabMenuOpen, setIsKitabMenuOpen] = useState(false);

    const isSingleMode = Boolean(singleNomorParam);
    const hadithContainerRef = useRef(null);
    const speech = useArabicSpeech();

    // Bookmarked and favorited hadiths tracking
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [totalFavoritesCount, setTotalFavoritesCount] = useState(0);

    const refreshBookmarks = async () => {
        const bookmarks = getLocalHaditsBookmarks();
        const ids = new Set(
            bookmarks
                .filter(b => b.kitab_slug === kitabSlug)
                .map(b => Number(b.number))
        );
        setBookmarkedIds(ids);

        const favIds = new Set(
            bookmarks
                .filter(b => b.kitab_slug === kitabSlug && b.is_favorite)
                .map(b => Number(b.number))
        );
        setFavoriteIds(favIds);
        setTotalFavoritesCount(bookmarks.filter(b => b.is_favorite).length);

        // Background sync if logged in
        if (isUserLoggedIn()) {
            try {
                const serverBookmarks = await getUserHaditsBookmarks(false, kitabSlug);
                const serverIds = new Set(
                    serverBookmarks
                        .filter(b => b.kitab_slug === kitabSlug)
                        .map(b => Number(b.number))
                );
                setBookmarkedIds(serverIds);

                const serverFavIds = new Set(
                    serverBookmarks
                        .filter(b => b.kitab_slug === kitabSlug && b.is_favorite)
                        .map(b => Number(b.number))
                );
                setFavoriteIds(serverFavIds);
                setTotalFavoritesCount(serverBookmarks.filter(b => b.is_favorite).length);
            } catch (e) {
                // Ignore sync errors in background
            }
        }
    };

    useEffect(() => {
        refreshBookmarks();
        const handleUpdate = () => refreshBookmarks();
        window.addEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
        return () => {
            window.removeEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
        };
    }, [kitabSlug]);

    const handleToggleBookmark = async (item) => {
        const res = await toggleHaditsBookmark({
            kitab_slug: kitabSlug,
            kitab_name: kitabInfo?.name,
            kitab_arab: kitabInfo?.arab,
            number: item.id,
            arab: item.arab,
            terjemah: item.terjemah
        });

        if (res.is_bookmarked) {
            toast.success(`Hadits #${item.id} disimpan ke penanda`, {
                icon: '🔖',
                duration: 3000
            });
        } else {
            toast.success(`Hadits #${item.id} dihapus dari penanda`, {
                duration: 2500
            });
        }
        refreshBookmarks();
    };

    const handleToggleFavorite = async (item) => {
        const res = await toggleHaditsFavorite(kitabSlug, item.id, {
            kitab_name: kitabInfo?.name,
            kitab_arab: kitabInfo?.arab,
            arab: item.arab,
            terjemah: item.terjemah
        });

        if (res.is_favorite) {
            toast.success(`Hadits #${item.id} ditambahkan ke favorit ❤️`, {
                icon: '❤️',
                duration: 3000
            });
        } else {
            toast.success(`Hadits #${item.id} dihapus dari favorit`, {
                duration: 2500
            });
        }
        refreshBookmarks();
    };

    // Load list of all kitabs for switcher dropdown
    useEffect(() => {
        fetch('/api/hadits')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setAllKitabs(data.kitabs || []);
                }
            })
            .catch(() => {});
    }, []);

    // Fetch data whenever kitab, page, search, or singleNomorParam changes
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        // Scroll to top of list when page or route changes & stop any speech
        window.scrollTo({ top: 0, behavior: 'smooth' });
        speech.stop();

        if (isSingleMode) {
            // Fetch Single Hadith
            const nomor = parseInt(singleNomorParam, 10);
            fetch(`/api/hadits/${kitabSlug}/${nomor}`)
                .then(res => {
                    if (!res.ok) throw new Error('Hadits tidak ditemukan');
                    return res.json();
                })
                .then(data => {
                    if (isMounted) {
                        if (data.status === 'success') {
                            setKitabInfo(data.kitab);
                            setSingleHadits(data.hadits);
                            setSingleNavigation(data.navigation);
                            setHaditsList([data.hadits]);
                        } else {
                            throw new Error(data.message || 'Gagal memuat hadits');
                        }
                        setLoading(false);
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        setError(err.message);
                        setLoading(false);
                    }
                });
        } else {
            // Fetch Paginated List
            const params = new URLSearchParams();
            if (pageParam > 1) params.set('page', pageParam.toString());
            if (searchParam) params.set('q', searchParam);
            if (jumpParam) params.set('nomor', jumpParam);

            const queryString = params.toString() ? `?${params.toString()}` : '';

            fetch(`/api/hadits/${kitabSlug}${queryString}`)
                .then(res => {
                    if (!res.ok) throw new Error('Kitab tidak ditemukan');
                    return res.json();
                })
                .then(data => {
                    if (isMounted) {
                        if (data.status === 'success') {
                            setKitabInfo(data.kitab);
                            setHaditsList(data.data || []);
                            setPagination(data.pagination);
                            setSingleHadits(null);
                        } else {
                            throw new Error(data.message || 'Gagal memuat hadits');
                        }
                        setLoading(false);
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        setError(err.message);
                        setLoading(false);
                    }
                });
        }

        return () => {
            isMounted = false;
        };
    }, [kitabSlug, singleNomorParam, pageParam, searchParam, jumpParam, isSingleMode]);

    // Update searchInput when searchParam in URL changes
    useEffect(() => {
        setSearchInput(searchParam);
    }, [searchParam]);

    // Handle Search Form Submission
    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim();
        const newParams = new URLSearchParams(searchParams);

        if (trimmed) {
            newParams.set('q', trimmed);
            newParams.delete('page');
            newParams.delete('nomor');
        } else {
            newParams.delete('q');
        }

        if (isSingleMode) {
            navigate(`/hadits/${kitabSlug}?${newParams.toString()}`);
        } else {
            setSearchParams(newParams);
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchInput('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('q');
        newParams.delete('page');
        setSearchParams(newParams);
    };

    // Handle Quick Jump to Number
    const handleJump = (e) => {
        e.preventDefault();
        const numVal = parseInt(jumpInput, 10);
        const max = kitabInfo?.total || 100000;

        if (isNaN(numVal) || numVal < 1 || numVal > max) {
            toast.error(`Nomor hadits harus antara 1 sampai ${max.toLocaleString('id-ID')}`);
            return;
        }

        // Navigate directly to single hadith reader
        navigate(`/hadits/${kitabSlug}/${numVal}`);
        setJumpInput('');
    };

    // Copy Hadith Text
    const handleCopy = (haditsItem) => {
        const textToCopy = `"${stripHtml(haditsItem.terjemah)}"\n\n${haditsItem.arab}\n\n— ${kitabInfo?.name || 'Hadits'} No. ${haditsItem.id} (IndoQuran: https://indoquran.web.id/hadits/${kitabSlug}/${haditsItem.id})`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success(`Hadits No. ${haditsItem.id} berhasil disalin!`);
        }).catch(() => {
            toast.error('Gagal menyalin hadits');
        });
    };

    // Share Hadith directly to WhatsApp only
    const handleShare = (haditsItem) => {
        const cleanTerjemah = stripHtml(haditsItem.terjemah);
        const shareText = `*Hadits ${kitabInfo?.name} No. ${haditsItem.id}*\n\n"${cleanTerjemah}"\n\n[${haditsItem.arab || ''}]\n\nBaca selengkapnya di IndoQuran:\nhttps://indoquran.web.id/hadits/${kitabSlug}/${haditsItem.id}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Helper to strip HTML tags if present (e.g. Riyadhus Shalihin)
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Helper to format transmission rawi brackets [ ... ] nicely
    const formatTranslation = (text) => {
        if (!text) return '';
        // If it already contains HTML tags (like Riyadhus Shalihin chapters), render safely
        if (/<[a-z][\s\S]*>/i.test(text)) {
            return (
                <div
                    className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }

        // Highlight brackets [ Rawi Name ]
        const parts = text.split(/(\[[^\]]+\])/g);
        return (
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                {parts.map((part, idx) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        const inner = part.slice(1, -1);
                        return (
                            <span
                                key={idx}
                                className="inline-block bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.5 rounded text-xs sm:text-sm border border-emerald-100/70 mx-0.5"
                                title="Perawi / Sanad Hadits"
                            >
                                {inner}
                            </span>
                        );
                    }
                    return part;
                })}
            </p>
        );
    };

    // Change page
    const goToPage = (p) => {
        if (p < 1 || p > pagination.last_page) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', p.toString());
        setSearchParams(newParams);
    };

    // Dynamic Title & SEO
    const pageTitle = isSingleMode
        ? `Hadits ${kitabInfo?.name || ''} No. ${singleNomorParam} - Teks Arab & Terjemahan | IndoQuran`
        : `Kitab ${kitabInfo?.name || 'Hadits'} Lengkap Teks Arab & Terjemahan | IndoQuran`;

    const pageDescription = isSingleMode
        ? `Baca Hadits ${kitabInfo?.name || ''} Nomor ${singleNomorParam} lengkap teks Arab berharakat dan terjemahan bahasa Indonesia di IndoQuran.`
        : `Koleksi hadits dari Kitab ${kitabInfo?.name || ''} (${kitabInfo?.arab || ''}) karya ${kitabInfo?.author || ''}. Total ${kitabInfo?.total?.toLocaleString('id-ID') || ''} hadits lengkap teks Arab & arti.`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-gray-50 pb-20">
            <SEOHead
                title={pageTitle}
                description={pageDescription}
                keywords={`hadits ${kitabInfo?.name || ''}, ${kitabInfo?.arab || ''}, hadits shahih, kutubus sittah, terjemah hadits`}
                canonicalUrl={`https://indoquran.web.id/hadits/${kitabSlug}${isSingleMode ? `/${singleNomorParam}` : ''}`}
            />

            {/* Breadcrumb & Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">

                        {/* Left: Breadcrumb & Switcher */}
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                            <Link to="/hadits" className="hover:text-emerald-600 transition-colors font-medium flex items-center">
                                <BookOpenIcon className="w-4 h-4 mr-1 text-emerald-600" />
                                Koleksi Hadits
                            </Link>
                            <span>/</span>

                            {/* Kitab Dropdown Switcher */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsKitabMenuOpen(!isKitabMenuOpen)}
                                    className="flex items-center space-x-1 font-semibold text-gray-900 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                >
                                    <span>{kitabInfo?.name || 'Pilih Kitab'}</span>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                                </button>

                                {isKitabMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsKitabMenuOpen(false)}
                                        />
                                        <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 max-h-80 overflow-y-auto">
                                            <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                                Ganti Kitab Hadits
                                            </div>
                                            {allKitabs.map(k => (
                                                <button
                                                    key={k.slug}
                                                    onClick={() => {
                                                        setIsKitabMenuOpen(false);
                                                        navigate(`/hadits/${k.slug}`);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                                                        k.slug === kitabSlug ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="font-medium">{k.name}</div>
                                                        <div className="text-[10px] text-gray-400">{k.total.toLocaleString('id-ID')} Hadits</div>
                                                    </div>
                                                    <span className="font-arabic text-sm text-emerald-800/80">{k.arab}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {isSingleMode && (
                                <>
                                    <span>/</span>
                                    <span className="font-semibold text-emerald-700">No. {singleNomorParam}</span>
                                </>
                            )}
                        </div>

                        {/* Right: Font Size Adjustment */}
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-400 hidden sm:inline">Ukuran Teks Arab:</span>
                            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                <button
                                    onClick={() => setArabicFontSize(prev => Math.max(18, prev - 2))}
                                    className="px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-white rounded transition-colors"
                                    title="Perkecil Font Arab"
                                >
                                    A-
                                </button>
                                <span className="px-1.5 py-1 text-[11px] text-gray-400 font-mono">
                                    {arabicFontSize}px
                                </span>
                                <button
                                    onClick={() => setArabicFontSize(prev => Math.min(36, prev + 2))}
                                    className="px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-white rounded transition-colors"
                                    title="Perbesar Font Arab"
                                >
                                    A+
                                </button>
                            </div>

                            {/* Hadits Favorit Button (Image 1) */}
                            <Link
                                to="/penanda?type=hadits&tab=favorit"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer select-none"
                                title="Buka Hadits Favorit Anda"
                            >
                                <SolidHeartIcon className="w-3.5 h-3.5 text-white flex-shrink-0" />
                                <span>Hadits Favorit</span>
                                <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
                                    {totalFavoritesCount}
                                </span>
                            </Link>

                            <Link
                                to="/penanda?type=hadits"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-medium transition-colors border border-gray-200/80 bg-white"
                                title="Buka Penanda Hadits"
                            >
                                <SolidBookmarkIcon className="w-3.5 h-3.5 text-amber-500" />
                                <span className="hidden sm:inline">Penanda Hadits</span>
                            </Link>

                            {isSingleMode && (
                                <Link
                                    to={`/hadits/${kitabSlug}`}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                                    <span>Daftar Kitab</span>
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Kitab Banner Header */}
            {kitabInfo && (
                <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-700/60 border border-emerald-500/30 text-emerald-100 mb-2">
                                <span>{kitabInfo.category_label || kitabInfo.category}</span>
                                <span>•</span>
                                <span>Total {kitabInfo.total.toLocaleString('id-ID')} Hadits</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                                {kitabInfo.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                                {kitabInfo.author}
                            </p>
                            <p className="text-xs text-emerald-200/80 mt-2 max-w-xl font-light">
                                {kitabInfo.description}
                            </p>
                        </div>

                        <div className="text-right font-arabic text-3xl sm:text-4xl text-emerald-200/90 dir-rtl select-none md:self-center">
                            {kitabInfo.arab}
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Control Bar: Search & Quick Jump */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">

                        {/* Search Input (7 cols) */}
                        <div className="md:col-span-7">
                            <form onSubmit={handleSearch} className="relative flex items-center">
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder={`Cari terjemahan atau teks Arab dalam ${kitabInfo?.name || 'hadits'}...`}
                                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Quick Jump Input (5 cols) */}
                        <div className="md:col-span-5">
                            <form onSubmit={handleJump} className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="1"
                                        max={kitabInfo?.total || 100000}
                                        value={jumpInput}
                                        onChange={(e) => setJumpInput(e.target.value)}
                                        placeholder={`Lompat No. (1 - ${kitabInfo?.total?.toLocaleString('id-ID') || '...'})`}
                                        className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex-shrink-0"
                                >
                                    Lompat
                                </button>
                            </form>
                        </div>

                    </div>

                    {/* Active filter notification badge */}
                    {searchParam && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                            <span>
                                Menampilkan hasil pencarian kata kunci: <strong className="text-emerald-700">"{searchParam}"</strong>
                                {pagination.total > 0 && ` (${pagination.total.toLocaleString('id-ID')} ditemukan)`}
                            </span>
                            <button
                                onClick={handleClearSearch}
                                className="text-red-600 hover:text-red-700 font-medium inline-flex items-center"
                            >
                                <XMarkIcon className="w-3.5 h-3.5 mr-0.5" />
                                Hapus Pencarian
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" ref={hadithContainerRef}>

                {/* Loading state */}
                {loading && (
                    <div className="py-24 flex flex-col items-center justify-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-sm text-gray-500">Memuat teks hadits...</p>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center my-6">
                        <p className="text-red-700 font-semibold mb-2">{error}</p>
                        <p className="text-xs text-gray-500 mb-4">Pastikan nomor hadits atau kitab yang Anda cari valid.</p>
                        <div className="flex justify-center space-x-3">
                            <Link
                                to={`/hadits/${kitabSlug}`}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                            >
                                Lihat Daftar Hadits
                            </Link>
                            <Link
                                to="/hadits"
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                            >
                                Ke Katalog Hadits
                            </Link>
                        </div>
                    </div>
                )}

                {/* Results count indicator */}
                {!loading && !error && !isSingleMode && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
                        <span>
                            Menampilkan hadits <strong>{pagination.from || 0} - {pagination.to || 0}</strong> dari <strong>{pagination.total.toLocaleString('id-ID')}</strong> hadits
                        </span>
                        <span>
                            Halaman {pagination.current_page} dari {pagination.last_page}
                        </span>
                    </div>
                )}

                {/* Hadith List */}
                {!loading && !error && haditsList.length > 0 && (
                    <div className="space-y-6">
                        {haditsList.map(item => (
                            <div
                                key={item.id}
                                id={`hadits-${item.id}`}
                                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                                    speech.activeId === item.id ? 'border-emerald-400 ring-2 ring-emerald-200/80 shadow-md' : 'border-gray-200/90'
                                }`}
                            >
                                {/* Hadith Item Top Bar */}
                                <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
                                            #{item.id}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {kitabInfo?.name}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-1.5">
                                        {/* Play Audio Button */}
                                        {speech.isSupported && (
                                            <button
                                                onClick={() => {
                                                    if (speech.activeId === item.id) {
                                                        if (speech.isPlaying) speech.pause();
                                                        else speech.resume();
                                                    } else {
                                                        speech.play(item.id, item.arab);
                                                    }
                                                }}
                                                className={`group inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                    speech.activeId === item.id
                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs hover:shadow-xs'
                                                }`}
                                                title="Putar Audio Lafazh Arab (Speech Synthesis)"
                                            >
                                                <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md transition-all ${
                                                    speech.activeId === item.id
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-emerald-600 text-white shadow-2xs group-hover:scale-105'
                                                }`}>
                                                    {speech.activeId === item.id && speech.isPlaying ? (
                                                        <SolidPauseIcon className="w-3 h-3 fill-current" />
                                                    ) : (
                                                        <SolidPlayIcon className="w-3 h-3 ml-0.5 fill-current" />
                                                    )}
                                                </span>
                                                <span>
                                                    {speech.activeId === item.id
                                                        ? (speech.isPlaying ? 'Jeda' : 'Lanjut')
                                                        : 'Putar Audio'}
                                                </span>
                                            </button>
                                        )}

                                        {/* Bookmark Button */}
                                        <button
                                            onClick={() => handleToggleBookmark(item)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                bookmarkedIds.has(Number(item.id))
                                                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300'
                                                    : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                                            }`}
                                            title={bookmarkedIds.has(Number(item.id)) ? 'Hapus dari Penanda Hadits' : 'Tandai Hadits Ini'}
                                        >
                                            {bookmarkedIds.has(Number(item.id)) ? (
                                                <SolidBookmarkIcon className="w-4 h-4 text-amber-500" />
                                            ) : (
                                                <BookmarkIcon className="w-4 h-4" />
                                            )}
                                        </button>

                                        {/* Favorite Button */}
                                        <button
                                            onClick={() => handleToggleFavorite(item)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                favoriteIds.has(Number(item.id))
                                                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-300'
                                                    : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                                            }`}
                                            title={favoriteIds.has(Number(item.id)) ? 'Hapus dari Hadits Favorit' : 'Jadikan Hadits Favorit'}
                                        >
                                            {favoriteIds.has(Number(item.id)) ? (
                                                <SolidHeartIcon className="w-4 h-4 text-rose-500" />
                                            ) : (
                                                <HeartIcon className="w-4 h-4" />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => handleCopy(item)}
                                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Salin Hadits"
                                        >
                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleShare(item)}
                                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                            title="Bagikan ke WhatsApp"
                                        >
                                            <FaWhatsapp className="w-4 h-4 text-green-600" />
                                        </button>
                                        {!isSingleMode && (
                                            <Link
                                                to={`/hadits/${kitabSlug}/${item.id}`}
                                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Buka Halaman Khusus Hadits Ini"
                                            >
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Hadith Body */}
                                <div className="p-6">
                                    {/* Audio Player Bar when this Hadits is active */}
                                    <HaditsAudioPlayer haditsId={item.id} speech={speech} className="mb-4" />

                                    {/* Arabic Text */}
                                    <div
                                        className={`font-arabic text-right text-gray-900 dir-rtl leading-loose mb-6 p-4 rounded-xl border select-text transition-all ${
                                            speech.activeId === item.id
                                                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-200/60 shadow-xs'
                                                : 'bg-emerald-50/20 border-emerald-100/40'
                                        }`}
                                        style={{ fontSize: `${arabicFontSize}px` }}
                                    >
                                        {item.arab}
                                    </div>

                                    {/* Translation */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                            Terjemahan Bahasa Indonesia:
                                        </div>
                                        {formatTranslation(item.terjemah)}
                                    </div>
                                </div>

                                {/* Footer link on list mode */}
                                {!isSingleMode && (
                                    <div className="px-6 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                        <span>Sumber: Kitab {kitabInfo?.name}</span>
                                        <Link
                                            to={`/hadits/${kitabSlug}/${item.id}`}
                                            className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline"
                                        >
                                            Permalink Hadits #{item.id} →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Single Hadith Bottom Prev / Next Navigation */}
                {isSingleMode && singleNavigation && (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200/90 p-4 shadow-sm flex items-center justify-between">
                        {singleNavigation.prev_nomor ? (
                            <Link
                                to={`/hadits/${kitabSlug}/${singleNavigation.prev_nomor}`}
                                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                <span>Hadits Sebelumnya (#{singleNavigation.prev_nomor})</span>
                            </Link>
                        ) : (
                            <div />
                        )}

                        <Link
                            to={`/hadits/${kitabSlug}`}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                        >
                            Semua Hadits {kitabInfo?.name}
                        </Link>

                        {singleNavigation.next_nomor ? (
                            <Link
                                to={`/hadits/${kitabSlug}/${singleNavigation.next_nomor}`}
                                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                                <span>Hadits Berikutnya (#{singleNavigation.next_nomor})</span>
                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && haditsList.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
                        <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-800 font-bold text-base mb-1">Hadits Tidak Ditemukan</h3>
                        <p className="text-gray-500 text-xs max-w-sm mx-auto mb-4">
                            {searchParam
                                ? `Tidak ditemukan hadits yang memuat kata "${searchParam}" di ${kitabInfo?.name}.`
                                : 'Tidak ada hadits dalam kriteria ini.'}
                        </p>
                        {searchParam && (
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-xs"
                            >
                                Bersihkan Pencarian
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination Controls (for List Mode) */}
                {!isSingleMode && !loading && !error && pagination.last_page > 1 && (
                    <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-gray-500">
                            Halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> ({pagination.total.toLocaleString('id-ID')} Hadits)
                        </div>

                        <div className="flex items-center space-x-1">
                            {/* First Page */}
                            <button
                                onClick={() => goToPage(1)}
                                disabled={pagination.current_page === 1}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Awal
                            </button>

                            {/* Prev Page */}
                            <button
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            {/* Dynamic page numbers around current page */}
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                let pageNum;
                                if (pagination.last_page <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page >= pagination.last_page - 2) {
                                    pageNum = pagination.last_page - 4 + i;
                                } else {
                                    pageNum = pagination.current_page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                                            pagination.current_page === pageNum
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {/* Next Page */}
                            <button
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                                title="Halaman Berikutnya"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => goToPage(pagination.last_page)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Akhir
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
