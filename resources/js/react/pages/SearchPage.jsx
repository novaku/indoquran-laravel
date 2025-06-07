import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AyahCard from '../components/AyahCard';
import QuranHeader from '../components/QuranHeader';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';

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
        fetch(`/api/search?q=${encodeURIComponent(query)}&per_page=10&page=${page}`)
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
        const audioUrl = ayah.audio_url;
        
        if (!audioUrl) {
            console.warn('No audio URL available for this ayah');
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
            <div className="max-w-2xl mx-auto">
                <MetaTags 
                    title="Pencarian Al-Quran | Cari Ayat dalam Al-Quran"
                    description="Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia dengan mudah dan cepat."
                    keywords="cari ayat quran, pencarian al quran, search al quran, al quran digital, cari terjemahan quran"
                    canonicalUrl="https://my.indoquran.web.id/search"
                />
                <QuranHeader className="mb-8" />
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-800 mb-4">Pencarian Al-Quran</h1>
                    <p className="text-primary-600">Cari ayat dalam Al-Quran berdasarkan terjemahan Bahasa Indonesia</p>
                </div>
                
                <form 
                    className="mb-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formQuery = e.target.elements.q.value;
                        if (formQuery.trim()) {
                            window.location.href = `/search?q=${encodeURIComponent(formQuery)}`;
                        }
                    }}
                >
                    <div className="flex flex-col space-y-3">
                        <div className="flex">
                            <input
                                type="text"
                                name="q"
                                placeholder="Masukkan kata kunci pencarian..."
                                className="w-full px-4 py-3 rounded-l-lg border border-islamic-cream focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic"
                            />
                            <button
                                type="submit"
                                className="bg-primary-600 text-white px-6 py-3 rounded-r-lg hover:bg-primary-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic hover:shadow-islamic-md"
                            >
                                Cari
                            </button>
                        </div>
                    </div>
                </form>
                
                <div className="bg-gradient-to-br from-white to-islamic-cream rounded-lg p-6 shadow-islamic">
                    <h2 className="text-xl font-semibold text-primary-800 mb-4">Tips Pencarian</h2>
                    <ul className="space-y-2 text-primary-700">
                        <li>• Gunakan kata kunci spesifik untuk hasil yang lebih akurat</li>
                        <li>• Cari berdasarkan kata atau frasa dalam terjemahan Bahasa Indonesia</li>
                        <li>• Untuk pencarian lebih dari satu kata, sistem akan mencari ayat yang mengandung semua kata tersebut</li>
                        <li>• Pencarian tidak case sensitive (huruf besar dan kecil dianggap sama)</li>
                    </ul>
                </div>
            </div>
        );
    }
    
    if (loading && currentPage === 1) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-accent-50 border-l-4 border-accent-500 text-accent-700 p-4 rounded-lg shadow-islamic" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }
    
    return (
        <div>
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
            
            <QuranHeader className="mb-6" />
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Hasil Pencarian: "{query}"</h1>
                <p className="text-gray-600">
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
                
                <form 
                    className="mt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formQuery = e.target.elements.q.value;
                        if (formQuery.trim()) {
                            window.location.href = `/search?q=${encodeURIComponent(formQuery)}`;
                        }
                    }}
                >
                    <div className="flex flex-col space-y-3">
                        <div className="flex">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="Cari lagi..."
                                className="w-full px-4 py-2 rounded-l-lg border border-islamic-cream focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic"
                            />
                            <button
                                type="submit"
                                className="bg-primary-500 text-white px-4 py-2 rounded-r-lg hover:bg-primary-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic hover:shadow-islamic-md"
                            >
                                Cari
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            {results.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
                    <p>Tidak ditemukan hasil untuk kata kunci "{query}". Coba gunakan kata kunci lain.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {results.map(result => (
                        <AyahCard 
                            key={result.id}
                            ayah={result}
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
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-full border border-primary-200">
                            <span className="text-sm font-medium text-primary-700">
                                Halaman <span className="font-bold text-primary-800">{currentPage}</span> dari <span className="font-bold text-primary-800">{totalPages}</span>
                            </span>
                        </div>
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1"
                             aria-label="Pagination">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || pageLoading}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                currentPage === 1 || pageLoading
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
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
                                        className={`px-3 py-2 min-w-[40px] text-sm font-medium rounded-md transition-all duration-200 border ${
                                            currentPage === i
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200 font-bold'
                                            : pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md hover:scale-105'
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
                                        <span key="ellipsis" className="px-3 py-2 text-gray-500 bg-gray-50 border border-gray-200">
                                            ...
                                        </span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={pageLoading}
                                        className={`px-3 py-2 min-w-[40px] text-sm font-medium rounded-md border transition-all duration-200 ${
                                            currentPage === totalPages
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-200 font-bold'
                                            : pageLoading
                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md hover:scale-105'
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
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                currentPage === totalPages || pageLoading
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
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
    );
}

export default SearchPage;
