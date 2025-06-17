import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AyahCard from '../components/AyahCard';
import QuranHeader from '../components/QuranHeader';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchField from '../components/SearchField';
import { fetchWithAuth } from '../utils/apiUtils';

// Memoized AyahCard for better performance
const MemoizedAyahCard = memo(AyahCard);

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const currentPageFromUrl = parseInt(searchParams.get('page')) || 1;
    const perPageFromUrl = parseInt(searchParams.get('per_page')) || 10;
    
    // Add a controller ref to handle API request cancellation
    const abortControllerRef = useRef(null);
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(currentPageFromUrl);
    const [perPage, setPerPage] = useState(perPageFromUrl);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pagination, setPagination] = useState(null);
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    const [surahs, setSurahs] = useState([]);
    
    // Listen for URL parameter changes (particularly the page parameter)
    useEffect(() => {
        // Update the state when URL parameters change
        setCurrentPage(currentPageFromUrl);
        setPerPage(perPageFromUrl);
        
        // Force a re-fetch of data when URL changes, particularly the page parameter
        if (query) {
            setPageLoading(true);
            
            // Cancel previous requests when URL parameters change
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        }
    }, [currentPageFromUrl, perPageFromUrl, location.search, query]);
    
    // Fetch search results when query, page, or perPage changes
    useEffect(() => {
        if (!query) return;
        
        setLoading(true);
        const page = currentPageFromUrl;
        
        // Ensure we pass at least 10 items per page to encourage pagination
        const itemsPerPage = perPageFromUrl || 10;
        
        // Log the fetch operation for debugging purposes
        
        // Clear existing results first to show loading state correctly
        setResults([]);
        
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create a new AbortController for the fetch request
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&per_page=${itemsPerPage}&page=${page}`, { signal: controller.signal })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch search results');
                return response.json();
            })
            .then(response => {
                // Process response
                if (response.status === 'success') {
                    // Process search results
                    const results = response.data || [];
                    setResults(results);
                    setPagination(response.pagination);
                    
                    // Calculate totalPages if pagination doesn't provide it
                    const total = response.pagination?.total || results.length;
                    const perPage = response.pagination?.per_page || perPageFromUrl || 10;
                    const lastPage = response.pagination?.last_page || Math.max(1, Math.ceil(total / perPage));
                    
                    setTotalPages(lastPage);
                    setTotalResults(total);
                    setCurrentPage(response.pagination?.current_page || 1);
                    
                    // Scroll to top smoothly when page changes
                    if (page > 1) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    setError("Gagal memuat hasil pencarian");
                }
                setLoading(false);
                setPageLoading(false);
            })
            .catch(err => {
                // Ignore abort errors
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
                setLoading(false);
                setPageLoading(false);
            });
        
        // Cleanup function to abort the request on unmount or when dependencies change
        return () => {
            controller.abort();
        };
    }, [query, currentPageFromUrl, perPageFromUrl]);
    
    // Add CSS to hide scrollbars but maintain scrolling functionality
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    // Load surahs for SearchField component
    useEffect(() => {
        fetchWithAuth('/api/surahs')
            .then(response => response.json())
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
                }
            })
            .catch(error => console.error('Error loading surahs:', error));
    }, []);
    
    // Audio cleanup effect
    useEffect(() => {
        return () => {
            if (audio) {
                audio.pause();
                setAudio(null);
                setIsPlaying(false);
                setActiveAyah(null);
            }
        };
    }, [audio]);
    
    // Audio playback function
    const playAudio = (ayah) => {
        // Handle audio_urls object (multiple qaris) instead of single audio_url
        let audioUrl = null;
        
        if (ayah.audio_urls) {
            const audioUrls = typeof ayah.audio_urls === 'string' 
                ? JSON.parse(ayah.audio_urls) 
                : ayah.audio_urls;
            
            // Get the first available audio URL from the object
            if (typeof audioUrls === 'object' && !Array.isArray(audioUrls)) {
                // Object format: {qari: url, ...}
                audioUrl = Object.values(audioUrls)[0];
            } else if (Array.isArray(audioUrls)) {
                // Array format: [url1, url2, ...]
                audioUrl = audioUrls[0];
            }
        } else if (ayah.audio_url) {
            // Fallback to single audio_url if available
            audioUrl = ayah.audio_url;
        }
        
        if (!audioUrl) {
            console.warn('No audio URL found for ayah:', ayah);
            return;
        }
        
        // If we have current audio and it's the same ayah, toggle play/pause
        if (audio && activeAyah === ayah.id) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
                return;
            } else {
                // Resume playback
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch(err => {
                            console.error('Failed to resume audio:', err);
                            createNewAudio();
                        });
                }
                return;
            }
        }
        
        // Stop any existing audio
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
        
        createNewAudio();
        
        function createNewAudio() {
            const newAudio = new Audio(audioUrl);
            newAudio.addEventListener('ended', () => {
                setIsPlaying(false);
                setActiveAyah(null);
            });
            newAudio.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                setIsPlaying(false);
                setActiveAyah(null);
            });
            
            const playPromise = newAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setAudio(newAudio);
                        setActiveAyah(ayah.id);
                        setIsPlaying(true);
                    })
                    .catch(err => {
                        console.error('Failed to play audio:', err);
                        setIsPlaying(false);
                        setActiveAyah(null);
                    });
            }
        }
    };
    
    const handlePageChange = useCallback((page) => {
        // Prevent actions on same page or invalid pages
        if (page === currentPage || page < 1 || (totalPages > 0 && page > totalPages)) return;
        
        // Changing page from current to new page number
        
        // Show loading state immediately
        setPageLoading(true);
        
        // Cancel any ongoing requests before changing pages
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear results to show loading state more clearly
        if (Math.abs(page - currentPage) > 1) {
            setResults([]);
        }
        
        // Update URL with new page
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('page', page);
        
        // Use React Router navigation - using replace:true to avoid building up history stack for page navigation
        navigate(`/search?${newSearchParams.toString()}`, { replace: true });
        
        // Scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.search, navigate, currentPage, totalPages]);
    
    const handlePerPageChange = useCallback((newPerPage) => {
        if (newPerPage === perPage) return;
        
        setPageLoading(true);
        
        // Cancel any ongoing requests before changing per_page
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('per_page', newPerPage);
        newSearchParams.set('page', 1); // Reset to first page when changing perPage
        
        navigate(`/search?${newSearchParams.toString()}`, { replace: false });
        
        // Also scroll to top for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.search, navigate, perPage]);
    
    const highlightMatches = (text, query) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    };
    
    if (!query) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                    <MetaTags 
                        title="Pencarian Al-Quran | Cari Ayat dalam Al-Quran"
                        description="Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia dengan mudah dan cepat."
                        keywords="cari ayat quran, pencarian al quran, search al quran, al quran digital, cari terjemahan quran"
                        canonicalUrl="https://my.indoquran.web.id/search"
                    />
                    <QuranHeader className="mb-12" />
                    
                    {/* Welcome Section */}
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-green-100 text-center mb-10">
                        <div className="text-6xl mb-6">🔍</div>
                        <h1 className="text-4xl font-bold text-green-800 mb-4">Pencarian Al-Quran</h1>
                        <p className="text-green-600 text-xl mb-8">Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia</p>
                    </div>
                    
                    {/* Search Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-green-100 mb-10">
                        <SearchField 
                            surahs={surahs}
                            placeholder="Masukkan kata kunci pencarian..."
                            theme="islamic"
                            className="w-full"
                        />
                    </div>
                    
                    {/* Tips Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-100">
                        <h2 className="text-2xl font-semibold text-green-800 mb-6 flex items-center gap-3">
                            <div className="text-3xl">💡</div>
                            Tips Pencarian
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4 text-green-700">
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 mt-1">•</div>
                                    <span>Gunakan kata kunci spesifik untuk hasil yang lebih akurat</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 mt-1">•</div>
                                    <span>Cari berdasarkan kata atau frasa dalam terjemahan Bahasa Indonesia</span>
                                </div>
                            </div>
                            <div className="space-y-4 text-green-700">
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 mt-1">•</div>
                                    <span>Untuk pencarian lebih dari satu kata, sistem akan mencari ayat yang mengandung semua kata tersebut</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 mt-1">•</div>
                                    <span>Pencarian tidak case sensitive (huruf besar dan kecil dianggap sama)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
        );
    }
    
    if (loading) {
        return (
            <PageTransition isLoading={true}>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="flex justify-center items-center h-64 pt-24">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <p className="text-green-600 font-medium mt-4">
                                {currentPage > 1 ? `Memuat halaman ${currentPage}...` : 'Mencari ayat...'}
                            </p>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }
    
    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-lg" role="alert">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <strong className="font-bold">Kesalahan! </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </PageTransition>
        );
    }
    
    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                <MetaTags 
                    title={`Hasil Pencarian: ${query} | Al-Quran Digital Indonesia`}
                    description={`Hasil pencarian untuk "${query}" dalam Al-Quran. Menemukan ${totalResults} ayat yang sesuai dengan kata kunci Anda.`}
                    keywords={`cari ayat quran ${query}, pencarian al quran, ${query} dalam quran, al quran digital`}
                    canonicalUrl={`https://my.indoquran.web.id/search?q=${encodeURIComponent(query)}`}
                />
                
                {results.length > 0 && (
                    <StructuredData 
                        type="SearchResults" 
                        data={{
                            query: query,
                            results: results
                        }} 
                    />
                )}
                
                <QuranHeader className="mb-8" />
                
                {/* Search Header Section */}                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-green-800 mb-3">Hasil Pencarian: "{query}"</h1>
                        <p className="text-green-600 text-lg">
                            {pagination ? (
                                <>
                                    Menampilkan {pagination.from}-{pagination.to} dari {pagination.total} hasil 
                                    dalam bahasa Indonesia
                                    {totalPages > 1 && ` (Halaman ${currentPage} dari ${totalPages})`}
                                </>
                            ) : (
                                `Ditemukan ${results.length} hasil dalam bahasa Indonesia`
                            )}
                        </p>
                    </div>
                    
                    {/* Enhanced Search Form and Pagination Controls */}
                    <div className="mt-6 space-y-4">
                        <SearchField 
                            surahs={surahs}
                            placeholder="Cari ayat atau kata kunci lainnya..."
                            theme="islamic"
                            className="w-full"
                        />
                        
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <div className="text-sm text-green-700">
                                    <span className="font-medium">Tampilkan:</span>
                                    <div className="inline-flex ml-2 bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                                        {[10, 20, 50].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => handlePerPageChange(num)}
                                                className={`px-3 py-1.5 text-sm transition-all duration-200 ${
                                                    perPage === num 
                                                    ? 'bg-green-600 text-white font-medium' 
                                                    : 'text-green-700 hover:bg-green-100'
                                                }`}
                                                aria-label={`Show ${num} results per page`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Simple page navigation for top section */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1 || pageLoading}
                                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                                            currentPage === 1 || pageLoading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                        aria-label="Previous page"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span>Prev</span>
                                    </button>
                                    
                                    <div className="px-3 py-1.5 bg-white rounded border border-green-200">
                                        <span className="font-medium text-green-800">{currentPage}</span>
                                        <span className="text-green-600"> / {totalPages}</span>
                                    </div>
                                    
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || pageLoading}
                                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                                            currentPage === totalPages || pageLoading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                        aria-label="Next page"
                                    >
                                        <span>Next</span>
                                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            
            {loading || pageLoading ? (
                <div className="flex flex-col items-center justify-center my-12 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-green-600 font-medium">
                        {loading ? `Mencari "${query}"...` : `Mengambil halaman ${currentPage}...`}
                    </p>
                </div>
            ) : results.length === 0 ? (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl shadow-sm" role="alert">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🔍</div>
                        <div>
                            <p className="font-semibold">Tidak ditemukan hasil</p>
                            <p className="text-sm">Tidak ditemukan hasil untuk kata kunci "{query}". Coba gunakan kata kunci lain.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Top Pagination for Desktop */}
                    {totalPages > 1 && (
                        <div className="hidden md:block mb-6">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-green-700">
                                        Menampilkan <span className="font-bold">{pagination?.from || 0}-{pagination?.to || 0}</span> dari <span className="font-bold">{totalResults}</span> hasil
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-green-700">Halaman:</span>
                                        <div className="flex space-x-1">
                                            {currentPage > 1 && (
                                                <button 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    ‹
                                                </button>
                                            )}
                                            
                                            {currentPage > 2 && (
                                                <button 
                                                    onClick={() => handlePageChange(1)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    1
                                                </button>
                                            )}
                                            
                                            {currentPage > 3 && (
                                                <span className="px-2 py-1 text-green-700">...</span>
                                            )}
                                            
                                            {currentPage > 1 && (
                                                <button 
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    {currentPage - 1}
                                                </button>
                                            )}
                                            
                                            <button 
                                                className="px-3 py-1 bg-green-600 text-white rounded border border-green-600 font-bold"
                                            >
                                                {currentPage}
                                            </button>
                                            
                                            {currentPage < totalPages && (
                                                <button 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    {currentPage + 1}
                                                </button>
                                            )}
                                            
                                            {currentPage < totalPages - 2 && (
                                                <span className="px-2 py-1 text-green-700">...</span>
                                            )}
                                            
                                            {currentPage < totalPages - 1 && (
                                                <button 
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    {totalPages}
                                                </button>
                                            )}
                                            
                                            {currentPage < totalPages && (
                                                <button 
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200"
                                                >
                                                    ›
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        {results.map(result => (
                            <AyahCard 
                                key={result.id}
                                ayah={result}
                                surah={result.surah}
                                highlightText={query}
                                playAudio={playAudio}
                                isPlaying={activeAyah === result.id && isPlaying}
                                activeAyah={activeAyah}
                            />
                        ))}
                    </div>
                </>
            )}
            
            {/* Always show pagination if there are results */}
            {results.length > 0 && (
                <div className="mt-12 space-y-6">
                    {/* Pagination information */}
                    
                    {/* Page Info */}
                    <div className="text-center">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
                            <span className="text-sm font-medium text-green-700">
                                Menampilkan <span className="font-bold text-green-800">{pagination?.from || 0}-{pagination?.to || 0}</span> dari <span className="font-bold text-green-800">{totalResults}</span> hasil
                            </span>
                        </div>
                    </div>
                    
                    {/* Enhanced Pagination Controls */}
                    <div className="flex justify-center">
                        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-4 w-full max-w-2xl">
                            <div className="flex flex-col space-y-4">
                                {/* Navigation buttons */}
                                <div className="flex justify-center items-center space-x-2">
                                    {/* First page */}
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1 || pageLoading}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPage === 1 || pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 border border-green-200 hover:shadow-md'
                                        }`}
                                        aria-label="First page"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1 || pageLoading}
                                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPage === 1 || pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
                                        }`}
                                        aria-label="Previous page"
                                    >
                                        {pageLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                                        ) : (
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        )}
                                        <span className="hidden sm:inline">Sebelumnya</span>
                                        <span className="sm:hidden">Prev</span>
                                    </button>
                                    
                                    {/* Page numbers */}
                                    <div className="flex items-center space-x-1 mx-2 overflow-x-auto hide-scrollbar py-1" style={{ maxWidth: '300px' }}>
                                        {(() => {
                                            const pages = [];
                                            // Use client-side calculation if window is defined (browser environment)
                                            const maxVisible = typeof window !== 'undefined' ? 
                                                (window.innerWidth < 640 ? 3 : 5) : 5;
                                            
                                            // Ensure totalPages is at least 1
                                            const safeTotalPages = Math.max(1, totalPages || 1);
                                            let startPage, endPage;
                                            
                                            if (safeTotalPages <= maxVisible) {
                                                startPage = 1;
                                                endPage = safeTotalPages;
                                            } else {
                                                if (currentPage <= Math.ceil(maxVisible / 2)) {
                                                    startPage = 1;
                                                    endPage = maxVisible;
                                                } else if (currentPage + Math.floor(maxVisible / 2) >= safeTotalPages) {
                                                    startPage = safeTotalPages - maxVisible + 1;
                                                    endPage = safeTotalPages;
                                                } else {
                                                    startPage = currentPage - Math.floor(maxVisible / 2);
                                                    endPage = currentPage + Math.floor(maxVisible / 2);
                                                }
                                            }
                                            
                                            // Ensure valid page range
                                            startPage = Math.max(1, startPage);
                                            endPage = Math.max(startPage, Math.min(safeTotalPages, endPage));
                                            
                                            // Always show at least one page button
                                            if (startPage === endPage) {
                                                pages.push(
                                                    <button
                                                        key={startPage}
                                                        onClick={() => handlePageChange(startPage)}
                                                        disabled={pageLoading}
                                                        className="flex justify-center items-center min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200 border bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold"
                                                        aria-label={`Page ${startPage}`}
                                                        aria-current="page"
                                                    >
                                                        {startPage}
                                                    </button>
                                                );
                                            } else {
                                                // Multiple pages
                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            disabled={pageLoading}
                                                            className={`flex justify-center items-center min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200 border ${
                                                                currentPage === i
                                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold'
                                                                : pageLoading
                                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                                                : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
                                                            }`}
                                                            aria-label={`Page ${i}`}
                                                            aria-current={currentPage === i ? 'page' : undefined}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }
                                            }
                                            
                                            return pages;
                                        })()}
                                    </div>
                                    
                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || pageLoading}
                                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPage === totalPages || pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
                                        }`}
                                        aria-label="Next page"
                                    >
                                        <span className="hidden sm:inline">Selanjutnya</span>
                                        <span className="sm:hidden">Next</span>
                                        {pageLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ml-2"></div>
                                        ) : (
                                            <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </button>
                                    
                                    {/* Last page */}
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages || pageLoading}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            currentPage === totalPages || pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 border border-green-200 hover:shadow-md'
                                        }`}
                                        aria-label="Last page"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Page selector for mobile */}
                                <div className="sm:hidden flex justify-center items-center">
                                    <label htmlFor="page-jump" className="text-sm text-green-700 mr-2">Go to:</label>
                                    <input
                                        id="page-jump"
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value && value >= 1 && value <= totalPages) {
                                                handlePageChange(value);
                                            }
                                        }}
                                        className="w-16 px-2 py-1 text-center border border-green-200 rounded-md text-green-800 focus:ring-2 focus:ring-green-300 focus:border-green-500 focus:outline-none"
                                    />
                                    <span className="text-sm text-green-700 ml-1">/ {totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Per Page Selector */}
                    <div className="flex justify-center mt-4">
                        <div className="bg-white rounded-xl shadow p-4 border border-green-100">
                            <div className="text-center mb-2">
                                <span className="text-sm font-medium text-green-700">Hasil per halaman:</span>
                            </div>
                            <div className="flex justify-center gap-2">
                                {[10, 20, 50, 100].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handlePerPageChange(num)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            perPage === num
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-md'
                                            : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
                                        }`}
                                        aria-label={`Show ${num} results per page`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
        </PageTransition>
    );
}

export default SearchPage;
