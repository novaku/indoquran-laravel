import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    BookOpenIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

// Text highlighting utility function
const highlightText = (text, searchQuery) => {
    if (!text || !searchQuery) return text;
    
    const textStr = String(text); // Ensure text is a string
    const query = String(searchQuery).trim();
    if (!query) return textStr;
    
    // Split search query into individual words and filter out empty strings
    const searchWords = query.split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) return textStr;
    
    // Create a regex that matches any of the search words (case insensitive)
    const escapedWords = searchWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    
    // If no match found, return original text
    if (!regex.test(textStr)) return textStr;
    
    // Reset regex lastIndex for split operation
    regex.lastIndex = 0;
    const parts = textStr.split(regex);
    
    return parts.map((part, index) => {
        if (!part) return part; // Handle empty strings
        
        // Check if this part matches any search word (case insensitive)
        const isMatch = searchWords.some(word => 
            part.toLowerCase().includes(word.toLowerCase()) || 
            word.toLowerCase().includes(part.toLowerCase())
        );
        
        return isMatch && part.trim() ? (
            <mark key={index} className="bg-yellow-300 text-yellow-900 px-1 rounded font-medium transition-colors break-words">
                {part}
            </mark>
        ) : part;
    });
};

// Get highlight context for search results (ayahs only)
const getSearchContext = (result, searchQuery) => {
    if (!result || !searchQuery) return '';
    
    const query = searchQuery.toLowerCase().trim();
    const contexts = [];
    
    // Only handle ayah results now
    if (result.text_indonesian?.toLowerCase().includes(query)) contexts.push('Terjemahan');
    if (result.surah_info?.name_latin?.toLowerCase().includes(query)) contexts.push('Nama Surah');
    if (result.surah_info?.name_indonesian?.toLowerCase().includes(query)) contexts.push('Nama Surah Indonesia');
    
    return contexts.length > 0 ? `Ditemukan di: ${contexts.join(', ')}` : '';
};

function SimpleSearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
    const [surahs, setSurahs] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [surahsLoading, setSurahsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('surah');
    const [revelationType, setRevelationType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [hasInitialSearchRun, setHasInitialSearchRun] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [resultsPerPage] = useState(10);
    const [totalResults, setTotalResults] = useState(0);
    
    // Popular searches state
    const [popularSearches, setPopularSearches] = useState([
        'Al-Fatihah', 'Al-Baqarah', 'Ya-Sin', 'Ar-Rahman', 'Al-Kahf', 'Al-Mulk'
    ]);

    // Function to fetch popular searches from API
    const fetchPopularSearches = useCallback(async () => {
        try {
            const response = await fetchWithAuth('/api/search/popular?limit=6');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && Array.isArray(data.data)) {
                    setPopularSearches(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching popular searches:', error);
            // Keep default popular searches if API fails
        }
    }, []);

    // Function to log search term (tanpa authentication)
    const logSearchTerm = useCallback(async (searchTerm) => {
        try {
            await fetchWithAuth('/api/search/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ term: searchTerm })
            });
        } catch (error) {
            console.error('Error logging search term:', error);
            // Don't block search if logging fails
        }
    }, []);

    // Debounce query changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [query]);

    // Fetch surahs on component mount
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
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
                    setSurahs(result.data);
                }
            } catch (error) {
                console.error('Error fetching surahs:', error);
            } finally {
                setSurahsLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Fetch popular searches on component mount
    useEffect(() => {
        fetchPopularSearches();
    }, [fetchPopularSearches]);

    // Perform search when debounced query changes and surahs are loaded
    useEffect(() => {
        if (debouncedQuery.trim() && !surahsLoading && surahs.length > 0) {
            performSearch(debouncedQuery.trim(), 1); // Always start with page 1 for new searches
            setCurrentPage(1); // Reset current page
            setHasInitialSearchRun(true); // Mark that initial search has run
        } else if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setTotalResults(0);
            setCurrentPage(1);
        }
    }, [debouncedQuery, surahsLoading, surahs.length]);

    // Perform search when page changes (but not on initial load)
    useEffect(() => {
        if (debouncedQuery.trim() && surahs.length > 0 && hasInitialSearchRun) {
            // Only trigger search for page changes after initial search has run
            performSearch(debouncedQuery.trim(), currentPage);
        }
    }, [currentPage, debouncedQuery, surahs.length, hasInitialSearchRun]);

    // Helper function to build API URL with filters
    const buildSearchUrl = (searchQuery, page, perPage) => {
        const params = new URLSearchParams({
            q: searchQuery,
            page: page.toString(),
            per_page: perPage.toString()
        });
        
        // Add revelation_place filter if not "all"
        if (revelationType !== 'all') {
            const revelationPlace = revelationType === 'meccan' ? 'makkah' : 'madinah';
            params.append('revelation_place', revelationPlace);
        }
        
        return `/api/cari?${params.toString()}`;
    };

    const performSearch = async (searchQuery, page = 1) => {
        if (!searchQuery || !searchQuery.trim()) {
            setSearchResults([]);
            setTotalResults(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Log search term (don't wait for it to complete)
            if (page === 1) { // Only log on first page to avoid duplicate logs
                logSearchTerm(searchQuery.trim());
            }
            
            // Hanya mencari ayat dari API (tanpa pencarian surah di frontend)
            const token = authUtils.getAuthToken();
            
            // Simple direct API call with proper pagination
            const response = await fetchWithAuth(buildSearchUrl(searchQuery, page, resultsPerPage), {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'success' && Array.isArray(data.data)) {
                    // Get total results from API pagination
                    const apiTotalResults = data.pagination?.total || 0;
                    
                    // Process ayah results with surah info
                    const ayahResults = data.data.map(ayah => ({
                        ...ayah,
                        type: 'ayah',
                        surah_info: surahs.find(s => s.number === ayah.surah_number) || {
                            name_latin: `Surah ${ayah.surah_number}`,
                            name_indonesian: `Surah ${ayah.surah_number}`
                        }
                    }));
                    
                    console.log('API Search Response:', {
                        searchQuery,
                        page,
                        apiTotalResults,
                        resultsCount: ayahResults.length,
                        paginationInfo: data.pagination
                    });
                    
                    // Update state with the results
                    setSearchResults(ayahResults);
                    setTotalResults(apiTotalResults);
                    
                    // Validate current page to ensure it's within bounds
                    const totalPages = data.pagination?.last_page || Math.ceil(apiTotalResults / resultsPerPage);
                    
                    // If we're on a page that exceeds total pages, reset to last valid page
                    if (page > totalPages && totalPages > 0) {
                        console.log('Page exceeds total pages, resetting to last valid page:', totalPages);
                        setCurrentPage(totalPages);
                        
                        // Re-run search for the correct page if needed
                        if (totalPages !== page) {
                            setTimeout(() => performSearch(searchQuery, totalPages), 100);
                            return;
                        }
                    }
                    
                    // If we got no results but expected some based on total, check page validity
                    if (ayahResults.length === 0 && apiTotalResults > 0 && page > 1) {
                        console.log('No results on current page, but total > 0. Checking page validity...');
                        
                        const expectedStartIndex = (page - 1) * resultsPerPage;
                        if (expectedStartIndex >= apiTotalResults) {
                            // This page is beyond available results, redirect to a valid page
                            const correctPage = Math.max(1, totalPages);
                            console.log('Page is beyond available results, redirecting to page:', correctPage);
                            setCurrentPage(correctPage);
                            setTimeout(() => performSearch(searchQuery, correctPage), 100);
                            return;
                        }
                    }
                    
                    // Refresh popular searches after successful search (only on first page)
                    if (page === 1 && apiTotalResults > 0) {
                        fetchPopularSearches();
                    }
                } else {
                    // API returned success but no data or wrong format
                    setSearchResults([]);
                    setTotalResults(0);
                    console.warn('API returned success but no valid data format:', data);
                }
            } else {
                // API call failed
                setSearchResults([]);
                setTotalResults(0);
                console.error('API request failed:', response.status, response.statusText);
                setError('Gagal mengambil data dari server. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Error performing search:', error);
            setError('Gagal melakukan pencarian. Silakan coba lagi.');
            setSearchResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    // Sort results (only ayahs now)
    const sortedResults = useMemo(() => {
        const results = [...searchResults];
        
        switch (sortBy) {
            case 'surah':
                // Sort by surah number then ayah number
                return results.sort((a, b) => {
                    const surahDiff = a.surah_number - b.surah_number;
                    return surahDiff !== 0 ? surahDiff : a.ayah_number - b.ayah_number;
                });
                
            case 'name':
                // Sort by surah name
                return results.sort((a, b) => {
                    const aName = a.surah_info?.name_latin || `Surah ${a.surah_number}`;
                    const bName = b.surah_info?.name_latin || `Surah ${b.surah_number}`;
                    return aName.localeCompare(bName);
                });
                
            case 'verses':
                // Sort by ayah number within same surah, or by surah number
                return results.sort((a, b) => {
                    if (a.surah_number === b.surah_number) {
                        return a.ayah_number - b.ayah_number;
                    }
                    return a.surah_number - b.surah_number;
                });
                
            case 'revelation':
                // Sort by revelation place
                return results.sort((a, b) => {
                    const aRevelation = a.surah_info?.revelation_place || '';
                    const bRevelation = b.surah_info?.revelation_place || '';
                    
                    if (aRevelation === bRevelation) {
                        // If same revelation place, sort by surah number
                        return a.surah_number - b.surah_number;
                    }
                    
                    return aRevelation.localeCompare(bRevelation);
                });
                
            default:
                return results;
        }
    }, [searchResults, sortBy]);

    // Pagination logic - we're using server-side pagination, so no need to slice
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const paginatedResults = searchResults; // Results are already paginated from the API

    // Pagination handlers
    const goToPage = (page) => {
        if (totalResults === 0) return; // Don't navigate if no results
        
        const maxValidPage = Math.ceil(totalResults / resultsPerPage);
        const newPage = Math.max(1, Math.min(page, maxValidPage));
        
        console.log('Pagination Navigation:', {
            requestedPage: page,
            currentPage,
            totalResults,
            maxValidPage,
            newPage,
            resultsPerPage
        });
        
        if (newPage !== currentPage && newPage <= maxValidPage && newPage >= 1) {
            setCurrentPage(newPage);
        }
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToPrevPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    const featuredSurahs = useMemo(() => {
        if (!surahs.length) return [];
        return [
            surahs.find(s => s.number === 1),  // Al-Fatihah
            surahs.find(s => s.number === 2),  // Al-Baqarah
            surahs.find(s => s.number === 18), // Al-Kahf
            surahs.find(s => s.number === 36), // Ya-Sin
            surahs.find(s => s.number === 55), // Ar-Rahman
            surahs.find(s => s.number === 67), // Al-Mulk
        ].filter(Boolean);
    }, [surahs]);

    const handleSearch = useCallback((searchQuery) => {
        setQuery(searchQuery);
        
        // Update URL immediately when user types
        if (searchQuery !== searchParams.get('q')) {
            if (searchQuery.trim()) {
                navigate(`/cari?q=${encodeURIComponent(searchQuery)}`, { replace: true });
            } else {
                navigate('/cari', { replace: true });
            }
        }
        
        // The debounced query will handle the actual search
    }, [navigate, searchParams]);

    const handleSearchSubmit = useCallback((searchQuery) => {
        setQuery(searchQuery);
        setDebouncedQuery(searchQuery); // Immediate search on submit
        if (searchQuery !== searchParams.get('q')) {
            if (searchQuery.trim()) {
                navigate(`/cari?q=${encodeURIComponent(searchQuery)}`);
            } else {
                navigate('/cari');
            }
        }
    }, [navigate, searchParams]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setTotalResults(0);
        setCurrentPage(1);
        navigate('/cari');
    }, [navigate]);

    // Function to reload search page
    const reloadSearchPage = () => {
        // Clear search query and reset state
        setQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setTotalResults(0);
        setCurrentPage(1);
        setRevelationType('all');
        setSortBy('surah');
        setError(null);
        
        // Navigate to clean search page
        navigate('/cari');
    };

    // Reset pagination and research when sorting or filters change
    useEffect(() => {
        if (debouncedQuery.trim() && !surahsLoading && surahs.length > 0) {
            setCurrentPage(1);
            performSearch(debouncedQuery.trim(), 1);
        }
    }, [sortBy, revelationType, debouncedQuery, surahsLoading, surahs.length]);

    if (surahsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead 
                title="Cari Al-Quran - IndoQuran"
                description="Cari Al-Quran berdasarkan nama surah, nomor, atau konten. Temukan ayat dan surah dengan mudah menggunakan pencarian lanjutan kami."
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 
                        className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center cursor-pointer hover:text-green-600 transition-colors"
                        onClick={reloadSearchPage}
                        title="Klik untuk me-reset halaman pencarian"
                    >
                        Cari Al-Quran
                    </h1>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <SearchField
                            placeholder="Cari berdasarkan nama surah, nomor, atau konten..."
                            className="w-full"
                            surahs={surahs || []}
                            value={query || ''}
                            onChange={handleSearch}
                            disableAutocomplete={true}
                        />
                        {query && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md"
                        >
                            <FunnelIcon className="w-4 h-4" />
                            <span>Filter</span>
                        </button>

                        {totalResults > 0 && (
                            <span className="text-sm text-gray-600">
                                {totalResults} hasil ditemukan • Halaman {currentPage} dari {totalPages}
                            </span>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Urutkan berdasarkan
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="surah">Nomor Surah</option>
                                        <option value="name">Nama (A-Z)</option>
                                        <option value="verses">Jumlah Ayat</option>
                                        <option value="revelation">Urutan Turun</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tempat Turun
                                    </label>
                                    <select
                                        value={revelationType}
                                        onChange={(e) => setRevelationType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="meccan">Makkiyyah</option>
                                        <option value="medinan">Madaniyyah</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => performSearch(query)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : query && searchResults.length === 0 && totalResults === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil ditemukan</h3>
                        <p className="text-gray-600 mb-4">
                            Coba sesuaikan kata kunci atau filter pencarian Anda
                        </p>
                        <button
                            onClick={clearSearch}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Hapus pencarian
                        </button>
                    </div>
                ) : query && searchResults.length === 0 && totalResults > 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Halaman ini kosong</h3>
                        <p className="text-gray-600 mb-4">
                            Halaman ini tidak memiliki hasil, tetapi ada {totalResults} hasil di halaman lain.
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setCurrentPage(1);
                                    if (debouncedQuery.trim()) {
                                        performSearch(debouncedQuery.trim(), 1);
                                    }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Kembali ke Halaman 1
                            </button>
                            <button
                                onClick={clearSearch}
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Hapus pencarian
                            </button>
                        </div>
                    </div>
                ) : searchResults.length > 0 ? (
                    /* Search Results */
                    <div className="space-y-6 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Hasil Pencarian
                            </h2>
                            <span className="text-sm text-gray-500">
                                Menampilkan {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} dari {totalResults} hasil
                            </span>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            {paginatedResults.map((result, index) => (
                                /* Ayah Result */
                                <Link
                                    key={`ayah-${result.surah_number}-${result.ayah_number || result.number}`}
                                    to={`/surah/${result.surah_number}/${result.ayah_number || result.number}`}
                                    className="block bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="font-bold text-blue-700 text-sm">
                                                        {result.surah_number}:{result.ayah_number || result.number}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm">
                                                        {highlightText(result.surah_info?.name_latin, debouncedQuery)} • Ayat {result.ayah_number || result.number}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs">
                                                        {highlightText(result.surah_info?.name_indonesian, debouncedQuery)}
                                                    </p>
                                                    {debouncedQuery && (
                                                        <p className="text-blue-600 text-xs mt-1 font-medium">
                                                            {getSearchContext(result, debouncedQuery)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="text-gray-700 text-sm leading-relaxed">
                                            <div className="overflow-hidden" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                wordBreak: 'break-word'
                                            }}>
                                                <span className="font-medium text-green-600">Terjemahan:</span> "{highlightText(result.text_indonesian, debouncedQuery)}"
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-gray-200">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                                </button>
                                
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                
                                <div className="flex items-center space-x-1">
                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-green-600 text-white'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                
                                <button
                                    onClick={goToLastPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronDoubleRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Default Content - Popular Searches and Featured Surahs */
                    <div className="space-y-8">
                        {/* Popular Searches */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Pencarian Populer
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {popularSearches.map((search) => (
                                    <button
                                        key={search}
                                        onClick={() => handleSearch(search)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Featured Surahs */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Surah Pilihan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featuredSurahs.map((surah) => (
                                    <Link
                                        key={surah.number}
                                        to={`/surah/${surah.number}`}
                                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="font-bold text-green-700 text-sm">
                                                    {surah.number}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">
                                                    {surah.name_latin || surah.name_indonesian}
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    {surah.total_ayahs} ayat
                                                </p>
                                            </div>
                                            <p className="font-arabic text-lg text-gray-700">
                                                {surah.name_arabic}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Browse All */}
                        <section>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Jelajahi Semua Surah
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Jelajahi Al-Quran lengkap dengan semua 114 surah
                                </p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <BookOpenIcon className="w-5 h-5" />
                                    <span>Lihat Semua Surah</span>
                                </Link>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(SimpleSearchPage);
