import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AyahCard from '../components/AyahCard';
import QuranHeader from '../components/QuranHeader';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';
import { fetchWithAuth } from '../utils/apiUtils';

function SearchPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    const currentPageFromUrl = parseInt(searchParams.get('page')) || 1;
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(currentPageFromUrl);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pagination, setPagination] = useState(null);
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    
    useEffect(() => {
        if (!query) return;
        
        setLoading(true);
        const page = currentPageFromUrl;
        fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&per_page=10&page=${page}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch search results');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setResults(response.data || []);
                    setPagination(response.pagination);
                    setTotalPages(response.pagination?.last_page || 1);
                    setTotalResults(response.pagination?.total || 0);
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
                setError(err.message);
                setLoading(false);
                setPageLoading(false);
            });
    }, [query, currentPageFromUrl]);
    
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
    
    const handlePageChange = (page) => {
        setPageLoading(true);
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('page', page);
        
        // Navigate to new URL with page parameter
        window.location.href = `/search?${newSearchParams.toString()}`;
    };
    
    const highlightMatches = (text, query) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    };
    
    if (!query) {
        return (
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
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formQuery = e.target.elements.q.value;
                                if (formQuery.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(formQuery)}`;
                                }
                            }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Masukkan kata kunci pencarian..."
                                    className="flex-1 px-6 py-4 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg font-semibold text-lg"
                                >
                                    Cari Ayat
                                </button>
                            </div>
                        </form>
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
        );
    }
    
    if (loading && currentPage === 1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="flex justify-center items-center h-64 pt-24">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 shadow-lg mx-auto mb-4"></div>
                        <p className="text-green-600 font-medium">Mencari ayat...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
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
        );
    }
    
    return (
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
                
                {/* Search Header Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
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
                    
                    {/* Enhanced Search Form */}
                    <form 
                        className="mt-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formQuery = e.target.elements.q.value;
                            if (formQuery.trim()) {
                                window.location.href = `/search?q=${encodeURIComponent(formQuery)}`;
                            }
                        }}
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="Cari ayat atau kata kunci lainnya..."
                                className="flex-1 px-6 py-4 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 text-lg"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md hover:shadow-lg font-semibold"
                            >
                                Cari Ulang
                            </button>
                        </div>
                    </form>
                </div>
            
            {results.length === 0 ? (
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
            )}
            
            {totalPages > 1 && (
                <div className="mt-12 space-y-6">
                    {/* Page Info */}
                    <div className="text-center">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 shadow-sm">
                            <span className="text-sm font-medium text-green-700">
                                Halaman <span className="font-bold text-green-800">{currentPage}</span> dari <span className="font-bold text-green-800">{totalPages}</span>
                            </span>
                        </div>
                    </div>
                    
                    {/* Enhanced Pagination Controls */}
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-2 bg-white rounded-xl shadow-lg border border-green-100 p-2"
                             aria-label="Pagination">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || pageLoading}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === 1 || pageLoading
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
                            }`}
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
                                        disabled={pageLoading}
                                        className={`px-4 py-3 min-w-[44px] text-sm font-medium rounded-lg transition-all duration-200 border ${
                                            currentPage === i
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold'
                                            : pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md hover:scale-105'
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
                                        <span key="ellipsis" className="px-3 py-3 text-green-500 bg-green-50 border border-green-200 rounded-lg">
                                            ...
                                        </span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={pageLoading}
                                        className={`px-4 py-3 min-w-[44px] text-sm font-medium rounded-lg border transition-all duration-200 ${
                                            currentPage === totalPages
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg ring-2 ring-green-200 font-bold'
                                            : pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md hover:scale-105'
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
                            disabled={currentPage === totalPages || pageLoading}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === totalPages || pageLoading
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-green-700 hover:bg-green-50 hover:text-green-800 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md'
                            }`}
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
                    </nav>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

export default SearchPage;
