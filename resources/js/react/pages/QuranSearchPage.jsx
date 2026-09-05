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
import {
    IoSearchOutline,
    IoBookOutline,
    IoSparklesOutline,
    IoTrendingUpOutline,
    IoLibraryOutline,
    IoEyeOutline,
    IoTimeOutline,
    IoStarOutline
} from 'react-icons/io5';
import SearchField from '../components/SearchField';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { Card, Button, Input, Select, Badge, PageContent } from '../components/ui';
import AdSenseInFeed from '../components/AdSenseInFeed';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { scrollToTop } from '../utils/scrollUtils';


// Exact phrase matching utility function
const matchesExactPhrase = (text, searchQuery) => {
    if (!text || !searchQuery) return false;
    const textStr = String(text);
    const searchWords = String(searchQuery).trim().split(/\s+/).filter(word => word.length > 0);
    if (searchWords.length === 0) return false;

    const escapedWords = searchWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(^|[^a-z0-9])(${escapedWords.join('\\s+')})([^a-z0-9]|$)`, 'i');
    return pattern.test(textStr);
};

// Text highlighting utility function
const highlightText = (text, searchQuery, exact = false) => {
    if (!text || !searchQuery) return text;
    
    const textStr = String(text); // Ensure text is a string
    const query = String(searchQuery).trim();
    if (!query) return textStr;
    
    const searchWords = query.split(/\s+/).filter(word => word.length > 0);
    if (searchWords.length === 0) return textStr;

    if (exact) {
        const escapedWords = searchWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const exactRegex = new RegExp(`(${escapedWords.join('\\s+')})`, 'gi');
        
        if (!exactRegex.test(textStr)) return textStr;
        exactRegex.lastIndex = 0;
        const parts = textStr.split(exactRegex);
        
        return parts.map((part, index) => {
            if (!part) return part;
            const isMatch = exactRegex.test(part);
            exactRegex.lastIndex = 0;
            return isMatch ? (
                <mark key={index} className="bg-yellow-300 text-yellow-900 px-1 rounded font-medium transition-colors break-words">
                    {part}
                </mark>
            ) : part;
        });
    }
    
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

function QuranSearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || '');
    const [exactSearch, setExactSearch] = useState(searchParams.get('exact') === '1');
    const [surahs, setSurahs] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [surahMatches, setSurahMatches] = useState([]);
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
    const [allExactResults, setAllExactResults] = useState([]);
    const [andTotalCount, setAndTotalCount] = useState(0);
    
    // Popular searches state
    const [popularSearches, setPopularSearches] = useState([
        'Al-Fatihah', 'Al-Baqarah', 'Ya-Sin', 'Ar-Rahman', 'Al-Kahf', 'Al-Mulk'
    ]);

    // Search categories untuk quick access
    const searchCategories = [
        {
            icon: IoStarOutline,
            title: "Surah Populer",
            description: "Al-Fatihah, Ya-Sin, Ar-Rahman, Al-Kahf",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            searches: ["Al-Fatihah", "Ya-Sin", "Ar-Rahman", "Al-Kahf"]
        },
        {
            icon: IoTrendingUpOutline,
            title: "Pencarian Trending",
            description: "Ayat-ayat yang sering dicari minggu ini",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
            searches: ["Al-Baqarah", "Al-Mulk", "Al-Waqiah", "At-Taubah"]
        },
        {
            icon: IoTimeOutline,
            title: "Surah Pendek",
            description: "Surah-surah pendek untuk hafalan",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            searches: ["Al-Ikhlas", "Al-Falaq", "An-Nas", "Al-Lahab"]
        },
        {
            icon: IoEyeOutline,
            title: "Surah Pilihan",
            description: "Rekomendasi surah untuk dibaca",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
            searches: ["Al-Fajr", "Ad-Duha", "Ash-Sharh", "At-Tin"]
        }
    ];

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
        }, 1000); // 1000ms (1 second) debounce delay before sending to backend

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const nextQuery = searchParams.get('q') || '';
        const nextExact = searchParams.get('exact') === '1';

        setQuery(nextQuery);
        setDebouncedQuery(nextQuery);
        setExactSearch(nextExact);
    }, [searchParams]);

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

        scrollToTop();
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
            setAllExactResults([]);
            setTotalResults(0);
            setAndTotalCount(0);
            setCurrentPage(1);
        }
    }, [debouncedQuery, exactSearch, surahsLoading, surahs.length]);

    // Perform search when page changes (but not on initial load)
    useEffect(() => {
        if (debouncedQuery.trim() && surahs.length > 0 && hasInitialSearchRun) {
            // Only trigger search for page changes after initial search has run
            if (!exactSearch) {
                performSearch(debouncedQuery.trim(), currentPage);
            }
        }
    }, [currentPage, debouncedQuery, exactSearch, surahs.length, hasInitialSearchRun]);

    // Helper function to build API URL with filters
    const buildSearchUrl = (searchQuery, page, perPage) => {
        const params = new URLSearchParams({
            q: searchQuery,
            page: page.toString(),
            per_page: perPage.toString()
        });

        if (exactSearch) {
            params.append('exact', '1');
        }
        
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
            setAllExactResults([]);
            setTotalResults(0);
            setAndTotalCount(0);
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
            
            const token = authUtils.getAuthToken();
            const authHeaders = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            if (exactSearch) {
                // Pencarian persis dilakukan di frontend:
                // Ambil kandidat ayat dari API (per_page maksimum 50), lalu filter phrase persis di frontend
                const firstBatchUrl = buildSearchUrl(searchQuery, 1, 50);
                const response = await fetchWithAuth(firstBatchUrl, { headers: authHeaders });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        const apiTotalResults = data.pagination?.total || 0;
                        setAndTotalCount(apiTotalResults);

                        if (Array.isArray(data.surah_matches)) {
                            setSurahMatches(data.surah_matches);
                        } else {
                            setSurahMatches([]);
                        }

                        let allItems = [...data.data];
                        const lastPage = Math.min(data.pagination?.last_page || Math.ceil(apiTotalResults / 50), 10);

                        if (lastPage > 1) {
                            const additionalPromises = [];
                            for (let p = 2; p <= lastPage; p++) {
                                additionalPromises.push(
                                    fetchWithAuth(buildSearchUrl(searchQuery, p, 50), { headers: authHeaders })
                                        .then(res => res.ok ? res.json() : null)
                                        .then(d => (d && d.status === 'success' && Array.isArray(d.data)) ? d.data : [])
                                        .catch(() => [])
                                );
                            }
                            const resultsArrays = await Promise.all(additionalPromises);
                            resultsArrays.forEach(arr => {
                                allItems = allItems.concat(arr);
                            });
                        }

                        const ayahResults = allItems.map(ayah => ({
                            ...ayah,
                            type: 'ayah',
                            surah_info: surahs.find(s => s.number === ayah.surah_number) || {
                                name_latin: `Surah ${ayah.surah_number}`,
                                name_indonesian: `Surah ${ayah.surah_number}`
                            }
                        }));

                        const exactMatches = ayahResults.filter(ayah =>
                            matchesExactPhrase(ayah.text_indonesian, searchQuery) ||
                            matchesExactPhrase(ayah.surah_info?.name_latin, searchQuery) ||
                            matchesExactPhrase(ayah.surah_info?.name_indonesian, searchQuery)
                        );

                        setAllExactResults(exactMatches);
                        setTotalResults(exactMatches.length);
                        setSearchResults(exactMatches);

                        const totalPages = Math.ceil(exactMatches.length / resultsPerPage);
                        if (page > totalPages && totalPages > 0) {
                            setCurrentPage(totalPages);
                        } else {
                            setCurrentPage(page);
                        }

                        if (page === 1 && exactMatches.length > 0) {
                            fetchPopularSearches();
                        }
                    } else {
                        setSearchResults([]);
                        setAllExactResults([]);
                        setTotalResults(0);
                        setAndTotalCount(0);
                    }
                } else {
                    setSearchResults([]);
                    setAllExactResults([]);
                    setSurahMatches([]);
                    setTotalResults(0);
                    setAndTotalCount(0);
                    setError('Gagal mengambil data dari server. Silakan coba lagi.');
                }
            } else {
                // Simple direct API call with proper pagination
                const response = await fetchWithAuth(buildSearchUrl(searchQuery, page, resultsPerPage), {
                    headers: authHeaders
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        // Get total results from API pagination
                        const apiTotalResults = data.pagination?.total || 0;
                        
                        // Process surah matches from API
                        if (page === 1 && Array.isArray(data.surah_matches)) {
                            setSurahMatches(data.surah_matches);
                        } else if (page === 1) {
                            setSurahMatches([]);
                        }

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
                        setAllExactResults([]);
                        setTotalResults(apiTotalResults);
                        setAndTotalCount(0);
                        
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
                        setAllExactResults([]);
                        setSurahMatches([]);
                        setTotalResults(0);
                        setAndTotalCount(0);
                        console.warn('API returned success but no valid data format:', data);
                    }
                } else {
                    // API call failed
                    setSearchResults([]);
                    setAllExactResults([]);
                    setSurahMatches([]);
                    setTotalResults(0);
                    setAndTotalCount(0);
                    console.error('API request failed:', response.status, response.statusText);
                    setError('Gagal mengambil data dari server. Silakan coba lagi.');
                }
            }
        } catch (error) {
            console.error('Error performing search:', error);
            setError('Gagal melakukan pencarian. Silakan coba lagi.');
            setSearchResults([]);
            setAllExactResults([]);
            setSurahMatches([]);
            setTotalResults(0);
            setAndTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort results
    const displayedResults = useMemo(() => {
        let results = exactSearch ? [...allExactResults] : [...searchResults];

        switch (sortBy) {
            case 'surah':
                // Sort by surah number then ayah number
                results.sort((a, b) => {
                    const surahDiff = a.surah_number - b.surah_number;
                    return surahDiff !== 0 ? surahDiff : a.ayah_number - b.ayah_number;
                });
                break;
                
            case 'name':
                // Sort by surah name
                results.sort((a, b) => {
                    const aName = a.surah_info?.name_latin || `Surah ${a.surah_number}`;
                    const bName = b.surah_info?.name_latin || `Surah ${b.surah_number}`;
                    return aName.localeCompare(bName);
                });
                break;
                
            case 'verses':
                // Sort by ayah number within same surah, or by surah number
                results.sort((a, b) => {
                    if (a.surah_number === b.surah_number) {
                        return a.ayah_number - b.ayah_number;
                    }
                    return a.surah_number - b.surah_number;
                });
                break;
                
            case 'revelation':
                // Sort by revelation place
                results.sort((a, b) => {
                    const aRevelation = a.surah_info?.revelation_place || '';
                    const bRevelation = b.surah_info?.revelation_place || '';
                    
                    if (aRevelation === bRevelation) {
                        return a.surah_number - b.surah_number;
                    }
                    
                    return aRevelation.localeCompare(bRevelation);
                });
                break;
                
            default:
                break;
        }

        if (exactSearch) {
            const startIndex = (currentPage - 1) * resultsPerPage;
            return results.slice(startIndex, startIndex + resultsPerPage);
        }

        return results;
    }, [searchResults, allExactResults, exactSearch, sortBy, currentPage, resultsPerPage]);

    const displayedSurahMatches = useMemo(() => {
        if (!exactSearch || !debouncedQuery.trim()) {
            return surahMatches;
        }
        return surahMatches.filter(surah => 
            matchesExactPhrase(surah.name_latin, debouncedQuery) ||
            matchesExactPhrase(surah.name_indonesian, debouncedQuery) ||
            matchesExactPhrase(surah.name_arabic, debouncedQuery)
        );
    }, [surahMatches, exactSearch, debouncedQuery]);

    // Pagination logic
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const paginatedResults = displayedResults;

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
            scrollToTop();
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

    const hasActiveSearchQuery = Boolean(query?.trim());

    const handleSearch = useCallback((searchQuery) => {
        setQuery(searchQuery);
        
        // Update URL immediately when user types
        if (searchQuery !== searchParams.get('q')) {
            if (searchQuery.trim()) {
                const qParam = `q=${encodeURIComponent(searchQuery)}`;
                const extraParam = exactSearch ? '&exact=1' : '';
                navigate(`/cari?${qParam}${extraParam}`, { replace: true });
            } else {
                navigate('/cari', { replace: true });
            }
        }
        
        // The debounced query will handle the actual search
    }, [navigate, searchParams, exactSearch]);

    const handleExactMatchChange = useCallback((checked) => {
        setExactSearch(checked);
        if (query && query.trim()) {
            const qParam = `q=${encodeURIComponent(query)}`;
            const extraParam = checked ? '&exact=1' : '';
            navigate(`/cari?${qParam}${extraParam}`, { replace: true });
        }
    }, [navigate, query]);

    const handleSearchSubmit = useCallback((searchQuery) => {
        setQuery(searchQuery);
        setDebouncedQuery(searchQuery); // Immediate search on submit
        if (searchQuery !== searchParams.get('q')) {
            if (searchQuery.trim()) {
                const qParam = `q=${encodeURIComponent(searchQuery)}`;
                const extraParam = exactSearch ? '&exact=1' : '';
                navigate(`/cari?${qParam}${extraParam}`);
            } else {
                navigate('/cari');
            }
        }
    }, [navigate, searchParams, exactSearch]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setAllExactResults([]);
        setSurahMatches([]);
        setTotalResults(0);
        setAndTotalCount(0);
        setCurrentPage(1);
        setExactSearch(false);
        navigate('/cari');
    }, [navigate]);

    // Function to reload search page
    const reloadSearchPage = () => {
        // Clear search query and reset state
        setQuery('');
        setDebouncedQuery('');
        setSearchResults([]);
        setAllExactResults([]);
        setSurahMatches([]);
        setTotalResults(0);
        setAndTotalCount(0);
        setCurrentPage(1);
        setRevelationType('all');
        setSortBy('surah');
        setError(null);
        setExactSearch(false);
        
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
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <SEOHead 
                title="Cari Al-Quran - IndoQuran"
                description="Cari Al-Quran berdasarkan nama surah, nomor, atau konten. Temukan ayat dan surah dengan mudah menggunakan pencarian lanjutan kami."
                keywords="cari al-quran, pencarian ayat, surah, al-quran digital, pencarian quran indonesia"
                canonicalUrl="https://indoquran.web.id/cari"
                noindex={hasActiveSearchQuery}
                robots={hasActiveSearchQuery ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}
            />

            {/* Hero Header - Bright Theme */}
            <div className="relative bg-gradient-to-b from-emerald-50/70 via-white to-gray-50/50 border-b border-gray-200/80 overflow-hidden">
                {/* Subtle decorative background circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100/80 border border-emerald-200/80 rounded-2xl mb-5 shadow-xs">
                        <IoSearchOutline className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight cursor-pointer hover:text-emerald-700 transition-colors"
                        onClick={reloadSearchPage}
                        title="Klik untuk me-reset halaman pencarian"
                    >
                        Cari <span className="text-emerald-600">Al-Quran</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        Temukan ayat, surah, dan hikmah Al-Quran dengan mudah. Pencarian cerdas dengan 
                        teknologi terdepan dan terjemahan bahasa Indonesia lengkap.
                    </p>
                    
                    {/* Search Bar dalam Hero */}
                    <div className="max-w-2xl mx-auto relative">
                        <div className="relative">
                            <SearchField
                                placeholder="Cari berdasarkan nama surah, nomor, atau konten..."
                                className="w-full"
                                theme="islamic"
                                surahs={surahs || []}
                                value={query || ''}
                                onChange={handleSearch}
                                onClear={clearSearch}
                                exactMatch={exactSearch}
                                onExactMatchChange={handleExactMatchChange}
                                showExactSearchToggle={true}
                                disableAutocomplete={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                {/* Filters - hanya tampil jika ada query */}
                {query && (
                    <Card padding="lg" className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="ghost"
                                leftIcon={<FunnelIcon className="w-5 h-5" />}
                            >
                                Filter & Urutkan
                            </Button>

                            {totalResults > 0 && (
                                <Badge variant="default">
                                    {totalResults} hasil{exactSearch ? ' (persis)' : ''} • Halaman {currentPage}/{totalPages}
                                </Badge>
                            )}
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Urutkan berdasarkan"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="surah">Nomor Surah</option>
                                        <option value="name">Nama (A-Z)</option>
                                        <option value="verses">Jumlah Ayat</option>
                                        <option value="revelation">Urutan Turun</option>
                                    </Select>

                                    <Select
                                        label="Tempat Turun"
                                        value={revelationType}
                                        onChange={(e) => setRevelationType(e.target.value)}
                                    >
                                        <option value="all">Semua</option>
                                        <option value="meccan">Makkiyyah</option>
                                        <option value="medinan">Madaniyyah</option>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                ) : error ? (
                    <Card padding="lg" className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XMarkIcon className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button 
                            onClick={() => performSearch(query)}
                            variant="primary"
                        >
                            Coba Lagi
                        </Button>
                    </Card>
                ) : query && searchResults.length === 0 && totalResults === 0 ? (
                    surahMatches.length > 0 ? (
                        /* Surah-only matches (no ayah results) */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Hasil Pencarian</h2>
                                <Badge variant="default">{surahMatches.length} surah ditemukan</Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <BookOpenIcon className="w-5 h-5 text-emerald-600" />
                                Surah Ditemukan
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {surahMatches.map((surah) => (
                                    <Link key={surah.number} to={surah.url}>
                                        <Card hoverable padding="md" className="border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
                                                        <span className="font-bold text-white text-sm">{surah.number}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {highlightText(surah.name_latin, debouncedQuery)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {highlightText(surah.name_indonesian, debouncedQuery)} • {surah.total_ayahs} ayat
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-arabic text-gray-700">{surah.name_arabic}</span>
                                                    <ChevronRightIcon className="w-5 h-5 text-emerald-500" />
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                    <Card padding="lg" className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Tidak ada hasil ditemukan</h3>
                        <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                            Coba sesuaikan kata kunci atau gunakan filter pencarian yang berbeda
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={clearSearch}
                                variant="primary"
                            >
                                Hapus Pencarian
                            </Button>
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="ghost"
                            >
                                Ubah Filter
                            </Button>
                        </div>
                    </Card>
                    )
                ) : query && searchResults.length === 0 && totalResults > 0 ? (
                    <Card padding="lg" className="text-center">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MagnifyingGlassIcon className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Halaman ini kosong</h3>
                        <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                            Halaman ini tidak memiliki hasil, tetapi ada {totalResults} hasil di halaman lain.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => {
                                    setCurrentPage(1);
                                    if (debouncedQuery.trim()) {
                                        performSearch(debouncedQuery.trim(), 1);
                                    }
                                }}
                                variant="primary"
                            >
                                Kembali ke Halaman 1
                            </Button>
                            <Button
                                onClick={clearSearch}
                                variant="ghost"
                            >
                                Hapus Pencarian
                            </Button>
                        </div>
                    </Card>
                ) : query && exactSearch && totalResults === 0 && andTotalCount > 0 ? (
                    <Card padding="lg" className="text-center py-12">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Tidak Ada Hasil yang Sama Persis
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm sm:text-base">
                            Ditemukan {andTotalCount} ayat yang memuat kata kunci Anda, tetapi tidak ada ayat yang memuat frasa berurutan persis &ldquo;<strong>{debouncedQuery}</strong>&rdquo;.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => handleExactMatchChange(false)}
                                variant="primary"
                            >
                                Tampilkan Semua ({andTotalCount} Hasil)
                            </Button>
                            <Button
                                onClick={clearSearch}
                                variant="ghost"
                            >
                                Hapus Pencarian
                            </Button>
                        </div>
                    </Card>
                ) : displayedResults.length > 0 ? (
                    /* Search Results */
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Hasil Pencarian
                            </h2>
                            <Badge variant="default">
                                {totalPages > 1 
                                    ? `${((currentPage - 1) * resultsPerPage) + 1}-${Math.min(currentPage * resultsPerPage, totalResults)} dari ${totalResults} hasil${exactSearch ? ' persis' : ''}`
                                    : `${totalResults} hasil${exactSearch ? ' persis' : ''}`}
                            </Badge>
                        </div>

                        {/* Surah Matches Section */}
                        {displayedSurahMatches.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-emerald-600" />
                                    Surah Ditemukan
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {displayedSurahMatches.map((surah) => (
                                        <Link key={surah.number} to={surah.url}>
                                            <Card hoverable padding="md" className="border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
                                                            <span className="font-bold text-white text-sm">{surah.number}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">
                                                                {highlightText(surah.name_latin, debouncedQuery, exactSearch)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {highlightText(surah.name_indonesian, debouncedQuery, exactSearch)} • {surah.total_ayahs} ayat
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-arabic text-gray-700">{surah.name_arabic}</span>
                                                        <ChevronRightIcon className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid gap-6">
                            {paginatedResults.map((result, index) => {
                                const showInFeedAd = index === 5;

                                return (
                                    <React.Fragment key={`ayah-${result.surah_number}-${result.ayah_number || result.number}`}>
                                        {showInFeedAd && (
                                            <AdSenseInFeed 
                                                adSlot="1519827772"
                                                labelText="IKLAN REKOMENDASI"
                                            />
                                        )}
                                        {/* Enhanced Ayah Result */}
                                        <Link
                                            to={`/surah/${result.surah_number}/${result.ayah_number || result.number}`}
                                        >
                                    <Card hoverable padding="lg" className="border-gray-200/80 hover:border-emerald-300">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
                                                        <span className="font-bold text-white text-sm">
                                                            {result.surah_number}:{result.ayah_number || result.number}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {highlightText(result.surah_info?.name_latin, debouncedQuery, exactSearch)} • Ayat {result.ayah_number || result.number}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">
                                                            {highlightText(result.surah_info?.name_indonesian, debouncedQuery, exactSearch)}
                                                        </p>
                                                        {debouncedQuery && (
                                                            <Badge variant="primary" size="xs" className="mt-1">
                                                                {getSearchContext(result, debouncedQuery)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-xl p-4">
                                                <div className="text-gray-700 leading-relaxed">
                                                    <span className="font-semibold text-emerald-700 text-xs uppercase tracking-wider">Terjemahan:</span>
                                                    <p className="mt-1.5 text-gray-800 leading-relaxed text-base">
                                                        "{highlightText(result.text_indonesian, debouncedQuery, exactSearch)}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </React.Fragment>
                        );
                    })}
                        </div>
                        
                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                            <Card padding="lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalResults)} dari {totalResults} hasil
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Halaman {currentPage} dari {totalPages}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronDoubleLeftIcon className="w-5 h-5" />
                                    </Button>
                                    
                                    <Button
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </Button>
                                    
                                    <div className="flex items-center space-x-1">
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
                                                <Button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                                                    size="sm"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    
                                    <Button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </Button>
                                    
                                    <Button
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <ChevronDoubleRightIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Default Content - Popular Searches and Featured Surahs */
                    <div className="space-y-12">
                        {/* Search Categories */}
                        <section>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Pencarian</h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Temukan Al-Quran berdasarkan kategori yang Anda minati
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {searchCategories.map((category, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-300 transform hover:scale-[1.02]">
                                        <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                            <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{category.title}</h3>
                                        <p className="text-gray-600 text-sm text-center mb-4">{category.description}</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {category.searches.slice(0, 2).map((search) => (
                                                <button
                                                    key={search}
                                                    onClick={() => handleSearch(search)}
                                                    className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                                >
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Popular Searches */}
                        <section>
                            <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Pencarian Populer
                                    </h2>
                                    <p className="text-gray-600">
                                        Surah dan ayat yang paling sering dicari pengguna
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {popularSearches.map((search) => (
                                        <button
                                            key={search}
                                            onClick={() => handleSearch(search)}
                                            className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-200 font-medium text-sm shadow-xs hover:shadow-sm"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Featured Surahs */}
                        <section>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Surah Pilihan
                                </h2>
                                <p className="text-gray-600">
                                    Surah-surah yang direkomendasikan untuk dibaca dan dipelajari
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredSurahs.map((surah) => (
                                    <Link
                                        key={surah.number}
                                        to={`/surah/${surah.number}`}
                                        className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
                                                <span className="font-bold text-white">
                                                    {surah.number}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {surah.name_latin || surah.name_indonesian}
                                                </h3>
                                                <p className="text-gray-500">
                                                    {surah.total_ayahs} ayat
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-arabic text-xl text-gray-700">
                                                    {surah.name_arabic}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Browse All Surahs */}
                        <section>
                            <div className="text-center bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white rounded-2xl p-8 sm:p-10 border border-emerald-200/80 shadow-xs">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100/80 text-emerald-600 border border-emerald-200/80 rounded-2xl mb-6 shadow-xs">
                                    <BookOpenIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                    Jelajahi Semua Surah
                                </h3>
                                <p className="text-gray-600 mb-6 text-base max-w-2xl mx-auto leading-relaxed">
                                    Jelajahi Al-Quran lengkap dengan semua 114 surah. Baca, pelajari, dan renungkan 
                                    firman Allah SWT dengan fitur lengkap kami.
                                </p>
                                <Link
                                    to="/surah"
                                    className="inline-flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                    <BookOpenIcon className="w-5 h-5" />
                                    <span>Lihat Semua Surah</span>
                                </Link>
                            </div>
                        </section>
                    </div>
                )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-4 space-y-6">
                            {/* Quick Tips Box */}
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-3">💡 Tips Pencarian</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>🔍 Gunakan kata kunci spesifik</p>
                                    <p>📖 Cari berdasarkan nama surah</p>
                                    <p>🎯 Filter berdasarkan tempat turun</p>
                                    <p>📊 Urutkan hasil pencarian</p>
                                </div>
                            </Card>

                            {/* Popular Shortcuts */}
                            {!query && (
                                <Card>
                                    <h3 className="font-semibold text-gray-900 mb-3">⭐ Surah Populer</h3>
                                    <div className="space-y-2">
                                        {['Al-Fatihah', 'Ya-Sin', 'Ar-Rahman', 'Al-Kahf'].map((surah) => (
                                            <button
                                                key={surah}
                                                onClick={() => handleSearch(surah)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                {surah}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default React.memo(QuranSearchPage);
