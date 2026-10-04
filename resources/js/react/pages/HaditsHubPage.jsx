import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    BookOpenIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    ShareIcon,
    DocumentDuplicateIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    BookmarkSquareIcon,
    FunnelIcon,
    ArrowTopRightOnSquareIcon,
    AcademicCapIcon,
    SpeakerWaveIcon,
    HeartIcon,
    BookmarkIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowPathIcon,
    ClockIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
    PlayIcon as SolidPlayIcon,
    PauseIcon as SolidPauseIcon,
    HeartIcon as SolidHeartIcon,
    BookmarkIcon as SolidBookmarkIcon
} from '@heroicons/react/24/solid';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import { useArabicSpeech } from '../hooks/useArabicSpeech';
import HaditsAudioPlayer from '../components/HaditsAudioPlayer';
import { FaWhatsapp } from 'react-icons/fa';
import {
    getLocalHaditsBookmarks,
    toggleHaditsBookmark,
    toggleHaditsFavorite
} from '../services/HaditsBookmarkService';

export default function HaditsHubPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchSectionRef = useRef(null);

    // Catalog state
    const [kitabs, setKitabs] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cardJumpNumbers, setCardJumpNumbers] = useState({});

    // Indonesian Hadith Search State - initial values from GET URL parameters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [searchKitab, setSearchKitab] = useState(searchParams.get('kitab') || 'all');
    const [isSearching, setIsSearching] = useState(Boolean((searchParams.get('q') || '').trim().length >= 2));
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchPagination, setSearchPagination] = useState(null);
    const [lastExecutedQuery, setLastExecutedQuery] = useState('');
    const [lastExecutedKitab, setLastExecutedKitab] = useState('all');

    // Scope confirmation modal state
    const [showScopeModal, setShowScopeModal] = useState(false);
    const [modalSelectedKitab, setModalSelectedKitab] = useState('shahih_bukhari');
    const [rememberScopePreference, setRememberScopePreference] = useState(false);
    const [pendingSearchQuery, setPendingSearchQuery] = useState('');

    // Hadith Search Groups Breakdown
    const [searchGroups, setSearchGroups] = useState([]);
    const [allBooksGroups, setAllBooksGroups] = useState([]);

    // Scope dropdown data from dedicated API (/api/hadits/dropdown)
    const [dropdownData, setDropdownData] = useState(null);
    const [isKitabDropdownOpen, setIsKitabDropdownOpen] = useState(false);
    const kitabDropdownRef = useRef(null);

    // Local Bookmarks & Favorites tracking
    const [localBookmarks, setLocalBookmarks] = useState(getLocalHaditsBookmarks());

    // Show/hide explanation state for search results (default is hidden)
    const [expandedPenjelasan, setExpandedPenjelasan] = useState({});

    const togglePenjelasan = (itemKey) => {
        setExpandedPenjelasan(prev => ({
            ...prev,
            [itemKey]: !prev[itemKey]
        }));
    };

    const speech = useArabicSpeech();

    const dropdownKitabs = dropdownData?.kitabs || kitabs;

    const selectedKitabInfo = useMemo(() => {
        if (searchKitab === 'all') {
            return {
                icon: '📚',
                name: dropdownData?.all_option?.name || 'Seluruh Hadits',
                badge: dropdownData?.all_option?.badge || `${dropdownKitabs.length || 7} Kitab`
            };
        }
        const found = dropdownKitabs.find(k => k.slug === searchKitab);
        if (found) {
            return {
                icon: '📖',
                name: found.name,
                badge: found.total_formatted || found.total?.toLocaleString('id-ID')
            };
        }
        return {
            icon: '📚',
            name: 'Pilih Kitab',
            badge: ''
        };
    }, [searchKitab, dropdownKitabs, dropdownData]);

    // Click outside to close custom kitab dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (kitabDropdownRef.current && !kitabDropdownRef.current.contains(e.target)) {
                setIsKitabDropdownOpen(false);
            }
        };
        if (isKitabDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isKitabDropdownOpen]);

    // Listen to bookmarks updates
    useEffect(() => {
        const handleUpdate = () => {
            setLocalBookmarks(getLocalHaditsBookmarks());
        };
        window.addEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
        return () => {
            window.removeEventListener('indoquran_hadits_bookmarks_updated', handleUpdate);
        };
    }, []);

    // Check if item is bookmarked or favorited
    const isBookmarked = (kitabSlug, number) => {
        return localBookmarks.some(b => b.kitab_slug === kitabSlug && Number(b.number) === Number(number));
    };

    const isFavorited = (kitabSlug, number) => {
        return localBookmarks.some(b => b.kitab_slug === kitabSlug && Number(b.number) === Number(number) && b.is_favorite);
    };

    // Fetch catalogue and featured hadith
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        fetch('/api/hadits')
            .then(res => {
                if (!res.ok) throw new Error('Gagal memuat katalog hadits');
                return res.json();
            })
            .then(data => {
                if (isMounted) {
                    if (data.status === 'success') {
                        setKitabs(data.kitabs || []);
                        setFeatured(data.featured || null);
                    } else {
                        throw new Error(data.message || 'Terjadi kesalahan');
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

        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch dropdown data from new dedicated API matching database tables exactly
    useEffect(() => {
        let isMounted = true;
        fetch('/api/hadits/dropdown')
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.status === 'success') {
                    setDropdownData(data);
                }
            })
            .catch(err => {
                console.warn('Failed to load hadits dropdown data:', err);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Filter categories for the catalog grid
    const categories = [
        { id: 'all', name: 'Semua Kitab', count: kitabs.length },
        { id: 'Shahihain', name: 'Shahihain', count: kitabs.filter(k => k.category === 'Shahihain').length },
        { id: 'Sunan', name: 'Kutubus Sittah (Sunan)', count: kitabs.filter(k => k.category === 'Sunan').length },
        { id: 'Musnad', name: 'Musnad Ahmad', count: kitabs.filter(k => k.category === 'Musnad').length },
    ].filter(cat => cat.count > 0 || cat.id === 'all');

    // Filtered kitabs by category (or catalog search)
    const filteredKitabs = useMemo(() => {
        return kitabs.filter(kitab => {
            const matchCategory = selectedCategory === 'all' || kitab.category === selectedCategory;
            return matchCategory;
        });
    }, [kitabs, selectedCategory]);

    // Popular recommendation search keywords
    const popularSearchKeywords = [
        { label: '✨ Niat Ikhlas', query: 'niat' },
        { label: 'Sedekah', query: 'sedekah' },
        { label: 'Sabar & Syukur', query: 'sabar' },
        { label: 'Berbakti Orang Tua', query: 'orang tua' },
        { label: 'Shalat Berjamaah', query: 'shalat berjamaah' },
        { label: 'Menuntut Ilmu', query: 'menuntut ilmu' },
        { label: 'Senyum itu Sedekah', query: 'senyum' },
        { label: 'Kasih Sayang', query: 'kasih sayang' },
    ];

    // Execute Indonesian Hadith Search
    const executeHaditsSearch = async (queryText, kitabScope = 'all', page = 1, shouldScroll = true) => {
        const cleanQuery = (queryText || '').trim();
        if (!cleanQuery || cleanQuery.length < 2) {
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setIsSearching(true);
        setLastExecutedQuery(cleanQuery);
        setLastExecutedKitab(kitabScope);

        try {
            const params = new URLSearchParams({
                q: cleanQuery,
                kitab: kitabScope,
                page: String(page),
                per_page: '15'
            });

            const res = await fetch(`/api/hadits/search?${params.toString()}`);
            if (!res.ok) throw new Error('Gagal melakukan pencarian hadits');
            const data = await res.json();

            if (data.status === 'success') {
                setSearchResults(data.data || []);
                setSearchPagination(data.pagination || null);
                setSearchGroups(data.groups || []);
                if (kitabScope === 'all') {
                    setAllBooksGroups(data.groups || []);
                }

                // Scroll smoothly to search results with offset for sticky navbar
                if (shouldScroll) {
                    setTimeout(() => {
                        if (searchSectionRef.current) {
                            const headerOffset = 90;
                            const elementPosition = searchSectionRef.current.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({
                                top: Math.max(0, offsetPosition),
                                behavior: 'smooth'
                            });
                        }
                    }, 120);
                }
            } else {
                throw new Error(data.message || 'Pencarian tidak mengembalikan hasil');
            }
        } catch (err) {
            setSearchError(err.message || 'Terjadi kesalahan saat mencari hadits');
        } finally {
            setSearchLoading(false);
        }
    };

    // Synchronize and execute search whenever URL GET parameters change (?q=...&kitab=...&page=...)
    useEffect(() => {
        const urlQ = (searchParams.get('q') || '').trim();
        const urlKitab = (searchParams.get('kitab') || 'all').trim();
        const rawPage = parseInt(searchParams.get('page') || '1', 10);
        const urlPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

        setSearchQuery(urlQ);
        setSearchKitab(urlKitab);

        if (urlQ.length >= 2) {
            executeHaditsSearch(urlQ, urlKitab, urlPage, true);
        } else if (!urlQ && isSearching) {
            // URL cleared, return to catalog view
            setIsSearching(false);
            setSearchResults([]);
            setSearchPagination(null);
            setSearchGroups([]);
            setAllBooksGroups([]);
            setSearchError(null);
            setLastExecutedQuery('');
            setLastExecutedKitab('all');
        }
    }, [searchParams]);

    // Update GET URL parameters so results can be bookmarked and shared
    const updateSearchUrl = (queryText, kitabScope = 'all', page = 1) => {
        const cleanQuery = (queryText || '').trim();
        const nextParams = new URLSearchParams();
        if (cleanQuery) {
            nextParams.set('q', cleanQuery);
        }
        if (kitabScope && kitabScope !== 'all') {
            nextParams.set('kitab', kitabScope);
        }
        if (page > 1) {
            nextParams.set('page', String(page));
        }

        const targetSearch = nextParams.toString() ? `?${nextParams.toString()}` : '';
        if (window.location.search === targetSearch) {
            if (cleanQuery.length >= 2) {
                executeHaditsSearch(cleanQuery, kitabScope, page, true);
            }
        } else {
            navigate(`/hadits${targetSearch}`);
        }
    };

    // Handle Search Form Submit (GET method)
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const cleanQuery = (searchQuery || '').trim();
        if (!cleanQuery || cleanQuery.length < 2) {
            toast.error('Ketik minimal 2 karakter untuk mencari hadits');
            return;
        }

        // Check if searching all books and user has not chosen to skip scope recommendation
        const skipModal = localStorage.getItem('indoquran_hadits_skip_scope_modal') === 'true';
        if (searchKitab === 'all' && !skipModal) {
            setPendingSearchQuery(cleanQuery);
            setShowScopeModal(true);
            return;
        }

        updateSearchUrl(cleanQuery, searchKitab, 1);
    };

    // Handle Quick Keyword Click
    const handleQuickKeywordClick = (keyword) => {
        setSearchQuery(keyword);
        updateSearchUrl(keyword, searchKitab, 1);
    };

    // Modal Action: Choose specific book
    const handleConfirmSpecificKitab = () => {
        if (rememberScopePreference) {
            localStorage.setItem('indoquran_hadits_skip_scope_modal', 'true');
        }
        setShowScopeModal(false);
        const queryToUse = pendingSearchQuery || searchQuery;
        setSearchKitab(modalSelectedKitab);
        updateSearchUrl(queryToUse, modalSelectedKitab, 1);
    };

    // Modal Action: Proceed with all 11 books
    const handleConfirmAllKitabs = () => {
        if (rememberScopePreference) {
            localStorage.setItem('indoquran_hadits_skip_scope_modal', 'true');
        }
        setShowScopeModal(false);
        const queryToUse = pendingSearchQuery || searchQuery;
        setSearchKitab('all');
        updateSearchUrl(queryToUse, 'all', 1);
    };

    // Clear Search and return to clean /hadits catalog
    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchKitab('all');
        setIsSearching(false);
        setSearchResults([]);
        setSearchPagination(null);
        setSearchGroups([]);
        setAllBooksGroups([]);
        setSearchError(null);
        setLastExecutedQuery('');
        setLastExecutedKitab('all');
        navigate('/hadits');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle Page Change with GET URL parameter update
    const handlePageChange = (newPage) => {
        if (!searchPagination || newPage < 1 || newPage > searchPagination.last_page) return;
        updateSearchUrl(lastExecutedQuery, lastExecutedKitab, newPage);
    };

    // Copy Search URL for sharing
    const handleCopySearchUrl = () => {
        const fullUrl = window.location.href;
        navigator.clipboard.writeText(fullUrl).then(() => {
            toast.success('Link hasil pencarian berhasil disalin! Siap dibagikan.', { icon: '🔗' });
        }).catch(() => {
            toast.error('Gagal menyalin link');
        });
    };

    // Share Search directly to WhatsApp
    const handleShareSearchWhatsApp = () => {
        const total = searchPagination?.total ? searchPagination.total.toLocaleString('id-ID') : '';
        const shareText = `*Hasil Pencarian Hadits IndoQuran*\nKata Kunci: "${lastExecutedQuery}"\nLingkup: ${activeScopeLabel}${total ? `\nJumlah Ditemukan: ${total} hadits` : ''}\n\nBuka hasil pencarian hadits:\n${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Helper to strip HTML tags for clean copy & share text
    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Helper: highlight query match in Indonesian translation
    const highlightMatch = (text, query) => {
        if (!text || !query) return text;
        const words = query
            .trim()
            .split(/\s+/)
            .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .filter(w => w.length >= 2);

        if (words.length === 0) return text;

        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (regex.test(part)) {
                return (
                    <mark
                        key={index}
                        className="bg-amber-200/90 text-amber-950 font-semibold px-1 py-0.5 rounded shadow-2xs mx-0.5"
                    >
                        {part}
                    </mark>
                );
            }
            return part;
        });
    };

    // Helper: render translation properly, handling embedded HTML (like Riyadhus Shalihin) and highlighting search keywords
    const renderTranslation = (text, query = '') => {
        if (!text) return null;

        // If it contains HTML tags (e.g. <h1>, <p>, etc.)
        if (/<[a-z][\s\S]*>/i.test(text)) {
            // Clean redundant empty paragraphs like <p>&nbsp;</p>
            let cleanHtml = text.replace(/<p[^>]*>\s*(&nbsp;|\s)*<\/p>/gi, '');

            const terms = (query || '')
                .trim()
                .split(/\s+/)
                .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .filter(w => w.length >= 2);

            if (terms.length > 0) {
                const regex = new RegExp(`(${terms.join('|')})`, 'gi');
                const parts = cleanHtml.split(/(<[^>]+>)/g);
                cleanHtml = parts.map(part => {
                    if (part.startsWith('<') && part.endsWith('>')) return part;
                    return part.replace(regex, (m) => `<mark class="bg-amber-200 text-amber-950 font-semibold px-1 py-0.5 rounded shadow-2xs mx-0.5">${m}</mark>`);
                }).join('');
            }

            return (
                <div
                    className="prose prose-sm sm:prose max-w-none text-gray-800 leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-emerald-900 [&_h1]:mt-1 [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-emerald-900 [&_p]:mb-2.5 [&_p]:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
            );
        }

        // Plain text: format rawi brackets [ ... ] and highlight query
        const parts = text.split(/(\[[^\]]+\])/g);
        return (
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                "{parts.map((part, idx) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        const inner = part.slice(1, -1);
                        return (
                            <span
                                key={idx}
                                className="inline-block bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.5 rounded text-xs sm:text-sm border border-emerald-100/70 mx-0.5"
                                title="Perawi / Sanad Hadits"
                            >
                                {query ? highlightMatch(inner, query) : inner}
                            </span>
                        );
                    }
                    return query ? highlightMatch(part, query) : part;
                })}"
            </p>
        );
    };

    // Toggle Bookmark on a hadith item
    const handleToggleBookmark = async (item) => {
        const res = await toggleHaditsBookmark({
            kitab_slug: item.kitab_slug,
            kitab_name: item.kitab_name,
            kitab_arab: item.kitab_arab || '',
            number: item.id,
            arab: item.arab,
            indonesia: item.indonesia,
            penjelasan: item.penjelasan,
            kategori: item.kategori
        });
        setLocalBookmarks(getLocalHaditsBookmarks());
        if (res.is_bookmarked) {
            toast.success(`Hadits ${item.kitab_name} #${item.id} disimpan ke penanda`, { icon: '🔖' });
        } else {
            toast.success(`Hadits #${item.id} dihapus dari penanda`);
        }
    };

    // Toggle Favorite on a hadith item
    const handleToggleFavorite = async (item) => {
        const res = await toggleHaditsFavorite(item.kitab_slug, item.id, {
            kitab_name: item.kitab_name,
            kitab_arab: item.kitab_arab || '',
            arab: item.arab,
            indonesia: item.indonesia,
            penjelasan: item.penjelasan,
            kategori: item.kategori
        });
        setLocalBookmarks(getLocalHaditsBookmarks());
        if (res.is_favorite) {
            toast.success(`Hadits ${item.kitab_name} #${item.id} ditambahkan ke favorit ❤️`);
        } else {
            toast.success(`Hadits #${item.id} dihapus dari favorit`);
        }
    };

    // Copy Hadith
    const handleCopyHadits = (item) => {
        const cleanIndonesia = stripHtml(item.indonesia || '');
        const textToCopy = `"${cleanIndonesia}"\n\n[${item.arab}]\n\n— ${item.kitab_name} No. ${item.id} (IndoQuran: https://indoquran.web.id/hadits/${item.kitab_slug}/${item.id})`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success('Hadits berhasil disalin!');
        }).catch(() => {
            toast.error('Gagal menyalin hadits');
        });
    };

    // Share Hadith directly to WhatsApp only
    const handleShareHadits = (item) => {
        const cleanIndonesia = stripHtml(item.indonesia || '');
        const shareText = `*Hadits ${item.kitab_name} No. ${item.id}*\n\n"${cleanIndonesia}"\n\n[${item.arab || ''}]\n\nBaca hadits selengkapnya di IndoQuran:\nhttps://indoquran.web.id/hadits/${item.kitab_slug}/${item.id}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Handle Quick Jump from Card
    const handleCardJump = (kitabSlug, total) => {
        const numVal = cardJumpNumbers[kitabSlug];
        if (!numVal) {
            toast.error('Silakan masukkan nomor hadits');
            return;
        }
        const num = parseInt(numVal, 10);
        if (isNaN(num) || num < 1 || num > total) {
            toast.error(`Nomor hadits harus antara 1 sampai ${total.toLocaleString('id-ID')}`);
            return;
        }
        navigate(`/hadits/${kitabSlug}/${num}`);
    };

    // Copy Featured Hadith
    const handleCopyFeatured = () => {
        if (!featured) return;
        const cleanIndonesia = stripHtml(featured.indonesia || '');
        const textToCopy = `"${cleanIndonesia}"\n\n[${featured.arab}]\n\n— ${featured.kitab_name} No. ${featured.id} (IndoQuran: https://indoquran.web.id/hadits/${featured.kitab}/${featured.id})`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success('Hadits berhasil disalin!');
        }).catch(() => {
            toast.error('Gagal menyalin hadits');
        });
    };

    // Share Featured Hadith directly to WhatsApp only
    const handleShareFeatured = () => {
        if (!featured) return;
        const cleanIndonesia = stripHtml(featured.indonesia || '');
        const shareText = `*Hadits ${featured.kitab_name} No. ${featured.id}*\n\n"${cleanIndonesia}"\n\n[${featured.arab || ''}]\n\nBaca hadits selengkapnya di IndoQuran:\nhttps://indoquran.web.id/hadits/${featured.kitab}/${featured.id}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Get active scope label
    const activeScopeLabel = useMemo(() => {
        if (lastExecutedKitab === 'all') return `Seluruh ${dropdownData?.total_kitab || kitabs.length || 7} Kitab Hadits`;
        const found = (dropdownData?.kitabs || kitabs).find(k => k.slug === lastExecutedKitab);
        return found ? found.name : lastExecutedKitab;
    }, [lastExecutedKitab, kitabs, dropdownData]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <SEOHead
                title={isSearching && lastExecutedQuery
                    ? `Pencarian Hadits "${lastExecutedQuery}" (${activeScopeLabel}) | IndoQuran`
                    : "Pencarian & Koleksi 7 Kitab Hadits Lengkap (Kutubus Sittah & Musnad Ahmad) | IndoQuran"}
                description={isSearching && lastExecutedQuery
                    ? `Hasil pencarian hadits "${lastExecutedQuery}" pada ${activeScopeLabel}. Menemukan ${searchPagination?.total ? searchPagination.total.toLocaleString('id-ID') : 0} hadits otentik lengkap teks Arab dan terjemahan Indonesia.`
                    : "Cari teks hadits bahasa Indonesia di seluruh kumpulan hadits atau salah satu kitab hadits: Shahih Bukhari, Muslim, Abu Daud, Tirmidzi, dll. Lengkap dengan teks Arab, terjemahan Indonesia & audio."}
                keywords={`cari hadits ${lastExecutedQuery || ''}, pencarian hadits, hadits shahih, kutubus sittah, musnad ahmad, shahih bukhari, shahih muslim, sunan abu daud, hadits terjemahan indonesia`}
                canonicalUrl="https://indoquran.web.id/hadits"
                noindex={Boolean(isSearching && lastExecutedQuery)}
                robots={isSearching && lastExecutedQuery ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}
            />

            {/* Clean Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 mb-3.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pencarian Cepat • 31.000+ Hadits Otentik • 7 Kitab Mu'tamad</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-2.5">
                        Koleksi & Pencarian Hadits Nabawi
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                        Cari petunjuk dan sabda Rasulullah ﷺ dalam <strong>Bahasa Indonesia</strong> di seluruh kumpulan hadits atau pilih kitab hadits rujukan tertentu.
                    </p>

                    {/* Indonesian Hadith Search Box - Vertical Stack with GET Form */}
                    <div className="max-w-3xl mx-auto bg-gray-50/90 p-2.5 sm:p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs">
                        <form
                            method="GET"
                            action="/hadits"
                            onSubmit={handleSearchSubmit}
                            className="flex flex-col gap-2.5"
                        >
                            {/* Hidden input for GET parameters */}
                            <input type="hidden" name="kitab" value={searchKitab} />
                            {/* Baris 1 (Atas): Dropdown Kitab Hadits */}
                            <div
                                ref={kitabDropdownRef}
                                className="w-full relative"
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsKitabDropdownOpen(!isKitabDropdownOpen)}
                                    className="w-full h-11 px-3.5 text-xs sm:text-sm font-medium bg-white text-gray-800 rounded-xl border border-gray-300 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all flex items-center justify-between gap-2 cursor-pointer"
                                    aria-haspopup="listbox"
                                    aria-expanded={isKitabDropdownOpen}
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <span className="text-base flex-shrink-0">{selectedKitabInfo.icon}</span>
                                        <span className="font-semibold text-gray-900 truncate">{selectedKitabInfo.name}</span>
                                        {selectedKitabInfo.badge && (
                                            <span className="text-xs text-gray-500 font-normal flex-shrink-0">
                                                ({selectedKitabInfo.badge})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 hidden sm:inline-block">
                                            Pilih Kitab
                                        </span>
                                        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isKitabDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                                    </div>
                                </button>

                                {/* Custom Dropdown Menu List (Optimized for Mobile & Desktop) */}
                                {isKitabDropdownOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsKitabDropdownOpen(false)}
                                        />

                                        <div
                                            role="listbox"
                                            className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-gray-200/90 py-1.5 z-50 max-h-80 overflow-y-auto divide-y divide-gray-100"
                                        >
                                            <div className="px-3.5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                                                Pilih Lingkup Kitab Hadits
                                            </div>

                                            {/* Option: Seluruh Hadits */}
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={searchKitab === 'all'}
                                                onClick={() => {
                                                    setSearchKitab('all');
                                                    setIsKitabDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                                    searchKitab === 'all'
                                                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2.5">
                                                    <span className="text-base">📚</span>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">
                                                            {dropdownData?.all_option?.name || 'Seluruh Hadits'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-normal">
                                                            {dropdownData?.all_option?.description || `${dropdownKitabs.length || 7} Kitab Hadits (${(dropdownData?.total_hadits || 31363).toLocaleString('id-ID')} hadits)`}
                                                        </div>
                                                    </div>
                                                </div>
                                                {searchKitab === 'all' && (
                                                    <CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                )}
                                            </button>

                                            {/* Kitab Options List */}
                                            <div className="py-1">
                                                {dropdownKitabs.map((k) => {
                                                    const isSelected = searchKitab === k.slug;
                                                    return (
                                                        <button
                                                            key={k.slug}
                                                            type="button"
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            onClick={() => {
                                                                setSearchKitab(k.slug);
                                                                setIsKitabDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-emerald-50 text-emerald-950 font-bold'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                                                <span className="text-base flex-shrink-0">📖</span>
                                                                <div className="truncate">
                                                                    <div className="font-semibold text-gray-900 text-sm truncate">{k.name}</div>
                                                                    <div className="text-xs text-gray-500 font-normal">
                                                                        {k.total_formatted || `${k.total?.toLocaleString('id-ID')} Hadits`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                                <span className="font-arabic text-sm text-emerald-800/80 dir-rtl hidden sm:inline">
                                                                    {k.arab}
                                                                </span>
                                                                {isSelected ? (
                                                                    <CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                                ) : (
                                                                    <span className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Baris 2 (Bawahnya): Kolom Pencarian & Tombol Pencarian */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                {/* Indonesian Keyword Input */}
                                <div className="relative flex-1 flex items-center">
                                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                                    <input
                                        type="text"
                                        name="q"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari teks bahasa Indonesia (misal: niat, sedekah, sabar)..."
                                        className="w-full h-11 pl-10 pr-9 rounded-xl bg-white text-gray-900 placeholder-gray-400 border border-gray-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                            title="Hapus kata kunci"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Action Buttons: Cari & Reset */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        disabled={searchLoading}
                                        className="h-11 px-5 sm:px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center space-x-1.5 text-xs sm:text-sm flex-1 sm:flex-initial disabled:opacity-75 cursor-pointer active:scale-95"
                                    >
                                        {searchLoading ? (
                                            <>
                                                <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                                                <span>Mencari...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MagnifyingGlassIcon className="w-4 h-4 text-white" />
                                                <span>Cari Hadits</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Tombol Reset ke Halaman Utama */}
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className={`h-11 px-4 rounded-xl font-semibold transition-all shadow-2xs flex items-center justify-center space-x-1.5 text-xs sm:text-sm cursor-pointer active:scale-95 ${
                                            isSearching || searchQuery || searchKitab !== 'all'
                                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200'
                                        }`}
                                        title="Reset pencarian dan kembali ke halaman hadits utama"
                                    >
                                        <ArrowPathIcon className="w-4 h-4 text-current" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Popular Recommendation Chips */}
                        <div className="mt-2.5 pt-2.5 border-t border-gray-200/80 flex flex-wrap items-center gap-1.5 justify-center sm:justify-start px-1 text-left">
                            <span className="text-[11px] text-gray-500 font-medium mr-1 flex items-center">
                                Rekomendasi:
                            </span>
                            {popularSearchKeywords.map((item) => (
                                <button
                                    key={item.query}
                                    type="button"
                                    onClick={() => handleQuickKeywordClick(item.query)}
                                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-all font-medium border border-gray-200/80 hover:border-emerald-300 shadow-2xs cursor-pointer"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-6 text-center">
                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 shadow-2xs">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                {dropdownData?.total_kitab || kitabs.length || 7}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Kitab Hadits</div>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 shadow-2xs">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                {(dropdownData?.total_hadits || 31363).toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Total Hadits</div>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 shadow-2xs">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">100%</div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Teks Arab & Arti ID</div>
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 shadow-2xs">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">Cepat</div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">Pencarian & Penanda</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">

                {/* SEARCH RESULTS SECTION */}
                {isSearching && (
                    <div ref={searchSectionRef} id="search-results-section" className="mb-12 scroll-mt-24 sm:scroll-mt-28">
                        <div className="bg-white rounded-2xl shadow-xl border border-emerald-200/90 overflow-hidden">
                            {/* Results Header Banner */}
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                                            <MagnifyingGlassIcon className="w-3.5 h-3.5 mr-1" />
                                            Hasil Pencarian Hadits
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                                            Lingkup: {activeScopeLabel}
                                        </span>
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                                        Kata kunci: <span className="text-emerald-700">"{lastExecutedQuery}"</span>
                                    </h2>
                                    {searchPagination && !searchLoading && (
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Ditemukan <strong>{searchPagination.total.toLocaleString('id-ID')}</strong> hadits
                                            {searchPagination.total > 0 && ` (menampilkan nomor ${searchPagination.from} - ${searchPagination.to})`}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Copy Search URL Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopySearchUrl}
                                        className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
                                        title="Salin tautan URL pencarian hadits ini untuk dibagikan"
                                    >
                                        <ShareIcon className="w-4 h-4 mr-1.5 text-emerald-600" />
                                        <span>Salin URL</span>
                                    </button>

                                    {/* Share via WhatsApp */}
                                    <button
                                        type="button"
                                        onClick={handleShareSearchWhatsApp}
                                        className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-2xs transition-colors cursor-pointer"
                                        title="Bagikan hasil pencarian hadits ke WhatsApp"
                                    >
                                        <FaWhatsapp className="w-4 h-4 mr-1.5 text-green-600" />
                                        <span>WhatsApp</span>
                                    </button>

                                    {/* Reset Button */}
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
                                        title="Kembali ke katalog hadits utama"
                                    >
                                        <ArrowPathIcon className="w-4 h-4 mr-1 text-gray-500" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            </div>

                            {/* GROUPING BREAKDOWN SECTION - Muncul Pertama jika Pencarian Seluruh Hadits */}
                            {!searchLoading && !searchError && searchResults.length > 0 && (allBooksGroups.length > 1 || searchGroups.length > 1) && (
                                <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border-b border-emerald-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                                                    <BookOpenIcon className="w-3.5 h-3.5 mr-1" />
                                                    Pengelompokan Hasil per Kitab
                                                </span>
                                                <span className="text-xs text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                                    {(allBooksGroups.length || searchGroups.length)} Kitab Ditemukan
                                                </span>
                                            </div>
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1.5">
                                                Distribusi Hadits Berdasarkan Kitab
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Pilih salah satu kitab di bawah untuk memfilter hadits secara spesifik:
                                            </p>
                                        </div>

                                        {/* Reset to All Button if currently focused on one kitab */}
                                        {lastExecutedKitab !== 'all' && (
                                            <button
                                                onClick={() => {
                                                    setSearchKitab('all');
                                                    updateSearchUrl(lastExecutedQuery, 'all', 1);
                                                }}
                                                className="self-start sm:self-auto inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors shadow-2xs cursor-pointer"
                                            >
                                                <span>Tampilkan Seluruh {dropdownData?.total_kitab || kitabs.length || 7} Kitab</span>
                                                <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Group Cards Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                                        {/* "Semua Kitab" summary card */}
                                        <button
                                            onClick={() => {
                                                setSearchKitab('all');
                                                updateSearchUrl(lastExecutedQuery, 'all', 1);
                                            }}
                                            className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                                                lastExecutedKitab === 'all'
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                                                    : 'bg-white hover:bg-emerald-50/70 border-emerald-100 text-gray-900 shadow-2xs hover:shadow-xs'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        lastExecutedKitab === 'all' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                                                    }`}>
                                                        Semua
                                                    </span>
                                                    <span className={`text-xs ${lastExecutedKitab === 'all' ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                        {kitabs.length || 7} Kitab
                                                    </span>
                                                </div>
                                                <div className={`text-xs sm:text-sm font-bold ${lastExecutedKitab === 'all' ? 'text-white' : 'text-gray-900'}`}>
                                                    Seluruh Kitab
                                                </div>
                                            </div>
                                            <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                                                <span className={`font-extrabold ${lastExecutedKitab === 'all' ? 'text-white' : 'text-emerald-700'}`}>
                                                    {((allBooksGroups.reduce((acc, g) => acc + g.match_count, 0)) || searchPagination?.total || 0).toLocaleString('id-ID')} hadits
                                                </span>
                                                <span className={`text-[11px] font-medium ${lastExecutedKitab === 'all' ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                    {lastExecutedKitab === 'all' ? 'Aktif' : 'Pilih'}
                                                </span>
                                            </div>
                                        </button>

                                        {/* Individual Kitab Group Cards */}
                                        {(allBooksGroups.length > 0 ? allBooksGroups : searchGroups).map((group) => {
                                            const isActive = lastExecutedKitab === group.kitab_slug;

                                            return (
                                                <button
                                                    key={group.kitab_slug}
                                                    onClick={() => {
                                                        setSearchKitab(group.kitab_slug);
                                                        updateSearchUrl(lastExecutedQuery, group.kitab_slug, 1);
                                                    }}
                                                    className={`group text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                                                        isActive
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                                                            : 'bg-white hover:bg-emerald-50/70 border-emerald-100 text-gray-900 shadow-2xs hover:shadow-xs'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between gap-1 mb-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                                isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
                                                            }`}>
                                                                {group.category}
                                                            </span>
                                                            <span className={`font-arabic text-xs dir-rtl ${
                                                                isActive ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-700'
                                                            }`}>
                                                                {group.kitab_arab}
                                                            </span>
                                                        </div>
                                                        <div className={`text-xs sm:text-sm font-bold line-clamp-1 ${
                                                            isActive ? 'text-white' : 'text-gray-900 group-hover:text-emerald-700'
                                                        }`}>
                                                            {group.kitab_name}
                                                        </div>
                                                    </div>

                                                    <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-xs ${
                                                        isActive ? 'border-white/20' : 'border-gray-100'
                                                    }`}>
                                                        <span className={`font-extrabold px-1.5 py-0.5 rounded ${
                                                            isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {group.match_count.toLocaleString('id-ID')} hadits
                                                        </span>
                                                        <span className={`text-[11px] font-medium flex items-center ${
                                                            isActive ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-600'
                                                        }`}>
                                                            {isActive ? 'Aktif' : 'Lihat'}
                                                            {!isActive && <ArrowRightIcon className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Search Loading Skeleton */}
                            {searchLoading && (
                                <div className="p-8 sm:p-12 text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="mt-4 text-sm font-medium text-emerald-800">
                                        Mencari teks hadits "{lastExecutedQuery}" pada {activeScopeLabel}...
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Menelusuri puluhan ribu hadits otentik
                                    </p>
                                </div>
                            )}

                            {/* Search Error State */}
                            {searchError && !searchLoading && (
                                <div className="p-8 text-center bg-red-50/50">
                                    <p className="text-sm font-medium text-red-600 mb-3">{searchError}</p>
                                    <button
                                        onClick={() => executeHaditsSearch(lastExecutedQuery, lastExecutedKitab, 1)}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
                                    >
                                        Ulangi Pencarian
                                    </button>
                                </div>
                            )}

                            {/* Empty Search Results */}
                            {!searchLoading && !searchError && searchResults.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                                        <MagnifyingGlassIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">
                                        Tidak ada hadits yang cocok
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
                                        Tidak ditemukan hadits dengan kata kunci "{lastExecutedQuery}" pada {activeScopeLabel}.
                                        Coba gunakan kata kunci sinonim atau ubah lingkup pencarian ke <strong>Seluruh Kitab</strong>.
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {lastExecutedKitab !== 'all' && (
                                            <button
                                                onClick={() => {
                                                    setSearchKitab('all');
                                                    updateSearchUrl(lastExecutedQuery, 'all', 1);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                                            >
                                                Cari di Seluruh Kitab
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClearSearch}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                                        >
                                            Kembali ke Katalog
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Search Results List */}
                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                <div className="p-4 sm:p-6 space-y-6">
                                    {searchResults.map((item) => {
                                        const speechId = `search_${item.kitab_slug}_${item.id}`;
                                        const bookmarked = isBookmarked(item.kitab_slug, item.id);
                                        const favorited = isFavorited(item.kitab_slug, item.id);

                                        return (
                                            <div
                                                key={`${item.kitab_slug}_${item.id}`}
                                                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 hover:border-emerald-300"
                                            >
                                                {/* Card Header */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/hadits/${item.kitab_slug}/${item.id}`}
                                                            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <BookOpenIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                                            {item.kitab_name} • No. {item.id}
                                                        </Link>
                                                        {item.category && (
                                                            <span className="hidden sm:inline-flex text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center space-x-1.5">
                                                        {/* Audio Listen */}
                                                        {speech.isSupported && (
                                                            <button
                                                                onClick={() => {
                                                                    if (speech.activeId === speechId) {
                                                                        if (speech.isPlaying) speech.pause();
                                                                        else speech.resume();
                                                                    } else {
                                                                        speech.play(speechId, item.arab);
                                                                    }
                                                                }}
                                                                className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                                                                    speech.activeId === speechId
                                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                                        : 'text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200'
                                                                }`}
                                                                title="Putar Audio Hadits"
                                                            >
                                                                {speech.activeId === speechId && speech.isPlaying ? (
                                                                    <SolidPauseIcon className="w-4 h-4 fill-current" />
                                                                ) : (
                                                                    <SolidPlayIcon className="w-4 h-4 fill-current" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Bookmark */}
                                                        <button
                                                            onClick={() => handleToggleBookmark(item)}
                                                            className={`p-2 rounded-xl text-xs transition-colors border ${
                                                                bookmarked
                                                                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                                                                    : 'bg-gray-50 text-gray-500 hover:text-amber-600 border-gray-200 hover:bg-amber-50/50'
                                                            }`}
                                                            title={bookmarked ? 'Hapus dari penanda' : 'Simpan ke penanda'}
                                                        >
                                                            {bookmarked ? (
                                                                <SolidBookmarkIcon className="w-4 h-4 text-amber-500" />
                                                            ) : (
                                                                <BookmarkIcon className="w-4 h-4" />
                                                            )}
                                                        </button>

                                                        {/* Favorite */}
                                                        <button
                                                            onClick={() => handleToggleFavorite(item)}
                                                            className={`p-2 rounded-xl text-xs transition-colors border ${
                                                                favorited
                                                                    ? 'bg-rose-50 text-rose-600 border-rose-300'
                                                                    : 'bg-gray-50 text-gray-500 hover:text-rose-600 border-gray-200 hover:bg-rose-50/50'
                                                            }`}
                                                            title={favorited ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
                                                        >
                                                            {favorited ? (
                                                                <SolidHeartIcon className="w-4 h-4 text-rose-500" />
                                                            ) : (
                                                                <HeartIcon className="w-4 h-4" />
                                                            )}
                                                        </button>

                                                        {/* Copy */}
                                                        <button
                                                            onClick={() => handleCopyHadits(item)}
                                                            className="p-2 rounded-xl text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                                            title="Salin Hadits"
                                                        >
                                                            <DocumentDuplicateIcon className="w-4 h-4" />
                                                        </button>

                                                        {/* Share to WhatsApp */}
                                                        <button
                                                            onClick={() => handleShareHadits(item)}
                                                            className="p-2 rounded-xl text-xs text-green-600 hover:text-green-700 bg-green-50/70 hover:bg-green-100 border border-green-200 transition-colors cursor-pointer"
                                                            title="Bagikan ke WhatsApp"
                                                        >
                                                            <FaWhatsapp className="w-4 h-4 text-green-600" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Audio Player bar if active */}
                                                <HaditsAudioPlayer haditsId={speechId} speech={speech} className="my-3" />

                                                {/* Arabic Text */}
                                                <div className={`my-4 p-4 rounded-xl border text-right font-arabic text-xl sm:text-2xl leading-loose dir-rtl transition-all ${
                                                    speech.activeId === speechId
                                                        ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200/50'
                                                        : 'bg-emerald-50/20 border-emerald-100/60 text-gray-900'
                                                }`}>
                                                    {item.arab}
                                                </div>

                                                {/* Indonesian Translation with Proper HTML & Highlights */}
                                                <div className="mt-3 mb-4">
                                                    <span className="font-semibold text-emerald-800 text-xs sm:text-sm uppercase tracking-wide block mb-1.5">
                                                        Artinya:
                                                    </span>
                                                    <div className="bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100">
                                                        {renderTranslation(item.indonesia, lastExecutedQuery)}
                                                    </div>
                                                </div>

                                                {/* Hadith Explanation / Penjelasan (Show / Hide, default hidden - only shown if penjelasan is not empty) */}
                                                {Boolean(item.penjelasan && stripHtml(item.penjelasan).trim().length > 0) && (
                                                    <div className="mt-3 mb-4 pt-3 border-t border-gray-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePenjelasan(`${item.kitab_slug}_${item.id}`)}
                                                            className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer"
                                                            aria-expanded={Boolean(expandedPenjelasan[`${item.kitab_slug}_${item.id}`])}
                                                        >
                                                            <BookOpenIcon className="w-4 h-4 text-emerald-600" />
                                                            <span>
                                                                {expandedPenjelasan[`${item.kitab_slug}_${item.id}`] ? 'Sembunyikan Penjelasan' : 'Lihat Penjelasan / Syarah Hadits'}
                                                            </span>
                                                            <ChevronDownIcon
                                                                className={`w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 ${
                                                                    expandedPenjelasan[`${item.kitab_slug}_${item.id}`] ? 'rotate-180' : ''
                                                                }`}
                                                            />
                                                        </button>

                                                        {expandedPenjelasan[`${item.kitab_slug}_${item.id}`] && (
                                                            <div className="mt-3 p-4 sm:p-5 rounded-xl bg-emerald-50/20 border border-emerald-100/80 text-gray-800 text-sm leading-relaxed shadow-2xs transition-all">
                                                                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 pb-2 border-b border-emerald-100">
                                                                    <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                                                    <span>Penjelasan &amp; Pelajaran Hadits</span>
                                                                </div>
                                                                <div
                                                                    className="hadits-penjelasan-content text-gray-700 leading-relaxed"
                                                                    dangerouslySetInnerHTML={{ __html: item.penjelasan }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Card Footer Link */}
                                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                                    <Link
                                                        to={`/hadits/${item.kitab_slug}`}
                                                        className="text-gray-500 hover:text-emerald-700 font-medium"
                                                    >
                                                        Kitab: {item.kitab_name}
                                                    </Link>

                                                    <Link
                                                        to={`/hadits/${item.kitab_slug}/${item.id}`}
                                                        className="inline-flex items-center font-bold text-emerald-600 hover:text-emerald-800 group"
                                                    >
                                                        <span>Baca Halaman Lengkap #{item.id}</span>
                                                        <ArrowRightIcon className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Pagination Controls */}
                                    {searchPagination && searchPagination.last_page > 1 && (
                                        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                            <button
                                                onClick={() => handlePageChange(searchPagination.current_page - 1)}
                                                disabled={searchPagination.current_page <= 1}
                                                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                            >
                                                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                                Sebelumnya
                                            </button>

                                            <div className="text-xs font-semibold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
                                                Halaman <span className="text-emerald-700">{searchPagination.current_page}</span> dari {searchPagination.last_page}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(searchPagination.current_page + 1)}
                                                disabled={searchPagination.current_page >= searchPagination.last_page}
                                                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                            >
                                                Selanjutnya
                                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Featured Hadith Card (shown if not actively viewing search results or alongside it) */}
                {featured && !isSearching && (
                    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 sm:p-8 mb-10 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-emerald-50 rounded-full pointer-events-none opacity-60"></div>

                        <div className="relative">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        <SparklesIcon className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                        Hadits Pilihan Hari Ini
                                    </span>
                                    {featured.theme && (
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                            {featured.theme}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Play Audio Button */}
                                    {speech.isSupported && (
                                        <button
                                            onClick={() => {
                                                if (speech.activeId === 'featured') {
                                                    if (speech.isPlaying) speech.pause();
                                                    else speech.resume();
                                                } else {
                                                    speech.play('featured', featured.arab);
                                                }
                                            }}
                                            className={`group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                speech.activeId === 'featured'
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs hover:shadow-xs'
                                            }`}
                                            title="Putar Audio Lafazh Arab (Speech Synthesis)"
                                        >
                                            <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md transition-all ${
                                                speech.activeId === 'featured'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-emerald-600 text-white shadow-2xs group-hover:scale-105'
                                            }`}>
                                                {speech.activeId === 'featured' && speech.isPlaying ? (
                                                    <SolidPauseIcon className="w-3 h-3 fill-current" />
                                                ) : (
                                                    <SolidPlayIcon className="w-3 h-3 ml-0.5 fill-current" />
                                                )}
                                            </span>
                                            <span>
                                                {speech.activeId === 'featured'
                                                    ? (speech.isPlaying ? 'Jeda' : 'Lanjut')
                                                    : 'Putar Audio'}
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleCopyFeatured}
                                        className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                        title="Salin Hadits"
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4 mr-1 text-gray-500" />
                                        Salin
                                    </button>
                                    <button
                                        onClick={handleShareFeatured}
                                        className="inline-flex items-center text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <FaWhatsapp className="w-3.5 h-3.5 mr-1 text-green-600" />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>

                            {/* Audio Player Bar when Featured Hadits is active */}
                            <HaditsAudioPlayer haditsId="featured" speech={speech} className="my-3" />

                            {/* Arabic Text */}
                            <div className={`my-5 text-right font-arabic text-xl sm:text-2xl leading-relaxed text-gray-900 dir-rtl p-3 rounded-xl border transition-all ${
                                speech.activeId === 'featured'
                                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200/60 shadow-xs'
                                    : 'bg-emerald-50/30 border-emerald-100/50'
                            }`}>
                                {featured.arab}
                            </div>

                            {/* Translation */}
                            <div className="mb-6 font-normal">
                                {renderTranslation(featured.indonesia)}
                            </div>

                            {/* Source Info & Direct Action */}
                            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                <div className="text-xs sm:text-sm text-gray-500">
                                    Sumber: <strong className="text-gray-800 font-semibold">{featured.kitab_name}</strong> (No. {featured.id})
                                </div>

                                <Link
                                    to={`/hadits/${featured.kitab}/${featured.id}`}
                                    className="inline-flex items-center text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:underline group"
                                >
                                    <span>Buka Hadits Ini Lengkap</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Catalogue of 7 Kitabs - Hanya ditampilkan jika tidak sedang melihat hasil pencarian */}
                {!isSearching && (
                    <>
                        {/* Section Header: 7 Kitab Hadits */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <BookOpenIcon className="w-6 h-6 text-emerald-600 mr-2" />
                                    Katalog {kitabs.length || 7} Kitab Hadits Lengkap
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Pilih kitab untuk membaca berurutan dari nomor awal atau lompat langsung ke nomor hadits
                                </p>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                            selectedCategory === cat.id
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        {cat.name} ({cat.count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <LoadingSpinner size="lg" />
                                <p className="mt-4 text-sm text-gray-500">Memuat koleksi kitab hadits...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
                                <p className="text-red-700 font-medium mb-3">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}

                        {/* Grid of Kitabs */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredKitabs.map(kitab => (
                                    <div
                                        key={kitab.slug}
                                        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
                                    >
                                        <div className="p-6">
                                            {/* Top badges */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    {kitab.category_label || kitab.category}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                    {kitab.total.toLocaleString('id-ID')} Hadits
                                                </span>
                                            </div>

                                            {/* Kitab Names */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                        <Link to={`/hadits/${kitab.slug}`}>
                                                            {kitab.name}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {kitab.author}
                                                    </p>
                                                </div>
                                                <div className="font-arabic text-xl text-emerald-800/80 text-right dir-rtl ml-2 flex-shrink-0 select-none">
                                                    {kitab.arab}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4 mt-2">
                                                {kitab.description}
                                            </p>

                                            {/* Quick Jump Input */}
                                            <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 mb-2">
                                                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                                                    Lompat ke Nomor Hadits (1 - {kitab.total.toLocaleString('id-ID')}):
                                                </label>
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        handleCardJump(kitab.slug, kitab.total);
                                                    }}
                                                    className="flex items-center space-x-1.5"
                                                >
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={kitab.total}
                                                        placeholder="Contoh: 10"
                                                        value={cardJumpNumbers[kitab.slug] || ''}
                                                        onChange={(e) => setCardJumpNumbers({
                                                            ...cardJumpNumbers,
                                                            [kitab.slug]: e.target.value
                                                        })}
                                                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                                                    >
                                                        Buka
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Card Footer action */}
                                        <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-[11px] text-gray-400">
                                                No. 1 s/d {kitab.total.toLocaleString('id-ID')}
                                            </span>
                                            <Link
                                                to={`/hadits/${kitab.slug}`}
                                                className="inline-flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-800 transition-colors"
                                            >
                                                <span>Mulai Baca</span>
                                                <ArrowRightIcon className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Information Callout Banner */}
                        <div className="mt-16 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100/80">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start space-x-3.5">
                                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl flex-shrink-0 mt-0.5">
                                        <AcademicCapIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            Mengenal Kutubus Sittah & Kutubut Tis'ah
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                                            Kutubus Sittah (Enam Kitab Induk Hadits) meliputi Shahih Bukhari, Shahih Muslim, Sunan Abu Daud, Sunan At-Tirmidzi, Sunan An-Nasa'i, dan Sunan Ibnu Majah. Kutubut Tis'ah menambahkannya dengan Musnad Ahmad, Muwatha' Malik, dan Sunan Ad-Darimi.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/artikel"
                                    className="inline-flex items-center text-xs font-semibold px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex-shrink-0 shadow-sm"
                                >
                                    <span>Jelajahi Artikel Hadits</span>
                                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* Scope Optimization Recommendation Modal */}
            {showScopeModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setShowScopeModal(false)}
                >
                    <div
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100/80 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top decorative gradient bar */}
                        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowScopeModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Tutup dialog"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="p-6 sm:p-7">
                            {/* Header Icon & Title */}
                            <div className="flex items-start space-x-3.5 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div className="pr-6">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-1">
                                        💡 Tips Pencarian Hadits
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                                        Rekomendasi Lingkup Pencarian
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Kata kunci: <span className="font-semibold text-emerald-700">"{pendingSearchQuery || searchQuery}"</span>
                                    </p>
                                </div>
                            </div>

                            {/* Informative text */}
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                                Anda memilih <strong>Seluruh Hadits ({dropdownData?.total_kitab || kitabs.length || 7} Kitab)</strong> yang mencakup <strong>{(dropdownData?.total_hadits || 31363).toLocaleString('id-ID')} hadits</strong>. Memilih salah satu kitab hadits rujukan akan memberikan hasil yang <strong>jauh lebih cepat, spesifik, dan terfokus</strong>.
                            </p>

                            {/* Option 1: Choose specific book (Recommended) */}
                            <div className="mb-3.5 p-4 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/50 shadow-2xs">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="inline-flex items-center text-xs font-bold text-emerald-950">
                                        <CheckCircleIcon className="w-4 h-4 mr-1 text-emerald-600 flex-shrink-0" />
                                        Pilih Salah Satu Kitab (Direkomendasikan)
                                    </span>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                                        ⚡ Lebih Cepat & Fokus
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-3">
                                    Pencarian instan pada matan dan sanad kitab pilihan:
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={modalSelectedKitab}
                                        onChange={(e) => setModalSelectedKitab(e.target.value)}
                                        className="flex-1 h-10 pl-3 pr-8 text-sm font-medium bg-white text-gray-800 rounded-xl border border-emerald-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                                    >
                                        {(dropdownData?.kitabs || kitabs).map((k) => (
                                            <option key={k.slug} value={k.slug}>
                                                📖 {k.name} ({k.total_formatted || `${k.total?.toLocaleString('id-ID') || 0} Hadits`})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleConfirmSpecificKitab}
                                        className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
                                    >
                                        <span>Cari di Kitab Ini</span>
                                        <ArrowRightIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Option 2: Search All Books */}
                            <div className="mb-4 p-3.5 rounded-2xl border border-gray-200/90 bg-gray-50/70 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-800 flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0" />
                                        Tetap Cari di Seluruh {dropdownData?.total_kitab || kitabs.length || 7} Kitab
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded-full">
                                        🌐 Komprehensif
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2.5">
                                    Menelusuri seluruh {dropdownData?.total_kitab || kitabs.length || 7} kitab hadits (membutuhkan waktu proses sedikit lebih lama).
                                </p>
                                <button
                                    onClick={handleConfirmAllKitabs}
                                    className="w-full py-2 px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
                                >
                                    Lanjutkan Cari di Seluruh {dropdownData?.total_kitab || kitabs.length || 7} Kitab
                                </button>
                            </div>

                            {/* Footer preference */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberScopePreference}
                                        onChange={(e) => setRememberScopePreference(e.target.checked)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-gray-300"
                                    />
                                    <span>Jangan ingatkan lagi</span>
                                </label>

                                <button
                                    onClick={() => setShowScopeModal(false)}
                                    className="text-gray-400 hover:text-gray-600 font-medium cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
