import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AyahCard from '../components/AyahCard';
import QuranHeader from '../components/QuranHeader';

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
                <div className="mt-8 space-y-4">
                    {/* Page Info */}
                    <div className="text-center text-sm text-gray-600">
                        Halaman {currentPage} dari {totalPages}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex justify-center">
                        <nav className="inline-flex rounded-md shadow-islamic">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || pageLoading}
                            className={`px-4 py-2 rounded-l-md border transition-all duration-300 ${
                                currentPage === 1 || pageLoading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-primary-600 hover:bg-primary-50 shadow-islamic hover:shadow-islamic-md'
                            }`}
                        >
                            <span className="flex items-center">
                                {pageLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-1"></div>
                                ) : (
                                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                )}
                                Sebelumnya
                            </span>
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
                            
                            // Show first page and ellipsis if needed
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => handlePageChange(1)}
                                        disabled={pageLoading}
                                        className={`px-4 py-2 border-t border-b transition-all duration-300 ${
                                            pageLoading 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-primary-600 hover:bg-primary-50 shadow-islamic hover:shadow-islamic-md'
                                        }`}
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(
                                        <span key="ellipsis1" className="px-4 py-2 border-t border-b bg-gray-50 text-gray-500">
                                            ...
                                        </span>
                                    );
                                }
                            }
                            
                            // Show page numbers in range
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        disabled={pageLoading}
                                        className={`px-4 py-2 border-t border-b transition-all duration-300 ${
                                            currentPage === i
                                            ? 'bg-primary-600 text-white shadow-islamic'
                                            : pageLoading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-primary-600 hover:bg-primary-50 shadow-islamic hover:shadow-islamic-md'
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
                                        <span key="ellipsis2" className="px-4 py-2 border-t border-b bg-gray-50 text-gray-500">
                                            ...
                                        </span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={pageLoading}
                                        className={`px-4 py-2 border-t border-b transition-all duration-300 ${
                                            pageLoading 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-primary-600 hover:bg-primary-50 shadow-islamic hover:shadow-islamic-md'
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
                            className={`px-4 py-2 rounded-r-md border transition-all duration-300 ${
                                currentPage === totalPages || pageLoading
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-primary-600 hover:bg-primary-50 shadow-islamic hover:shadow-islamic-md'
                            }`}
                        >
                            <span className="flex items-center">
                                Selanjutnya
                                {pageLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current ml-1"></div>
                                ) : (
                                    <svg className="h-5 w-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    </nav>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchPage;
