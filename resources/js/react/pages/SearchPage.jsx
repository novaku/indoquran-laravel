import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AyahCard } from '../features/quran';
import QuranHeader from '../components/QuranHeader';
import { useDocumentTitle } from '../hooks';
import { getApiUrl } from '../utils/api';
import { getRoutePath } from '../utils/routes';
import { getAudioUrl } from '../utils/audio';

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAyah, setActiveAyah] = useState(null);
    const [expandedSurahs, setExpandedSurahs] = useState({});
    const [viewMode, setViewMode] = useState('show'); // 'show' or 'hide'
    
    useEffect(() => {
        if (!query) return;
        
        setLoading(true);
        fetch(getApiUrl(`/api/search?q=${encodeURIComponent(query)}`))
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch search results');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setResults(response.data || []);
                    setTotalResults(response.total || 0);
                } else {
                    setError("Gagal memuat hasil pencarian");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [query]);
    
    // Reset expanded surahs when search results change
    useEffect(() => {
        setExpandedSurahs({});
        setViewMode('hide'); // Default to hide when results change
    }, [results]);
    
    // Set document title with query and result count if available
    useDocumentTitle(
        query 
            ? `Hasil Pencarian: ${query} (${results.length} ayat) | IndoQuran`
            : 'Pencarian Al-Quran | IndoQuran'
    );
    
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
        // Handle audio URL from different possible formats
        let audioUrl;
        
        if (ayah.audio_url) {
            // If it's a direct URL
            audioUrl = ayah.audio_url;
        } else if (ayah.audio_urls && Array.isArray(ayah.audio_urls) && ayah.audio_urls.length > 0) {
            // If it's an array of URLs, use the first one
            audioUrl = ayah.audio_urls[0];
        } else if (ayah.audio_urls && typeof ayah.audio_urls === 'object') {
            // If it's an object with numbered keys like in the API response
            // Get the first available URL (e.g., '01', '02', etc.)
            const audioKeys = Object.keys(ayah.audio_urls);
            if (audioKeys.length > 0) {
                audioUrl = ayah.audio_urls[audioKeys[0]];
            }
        }
        
        if (!audioUrl) {
            console.warn('No audio URL available for this ayah');
            // Show user-facing notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-accent-50 border-l-4 border-accent-500 text-accent-700 p-4 rounded-lg shadow-islamic z-50';
            notification.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-accent-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">Audio tidak tersedia untuk ayat ini</p>
                    </div>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
            
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
            const newAudio = new Audio(getAudioUrl(audioUrl));
            newAudio.addEventListener('ended', () => {
                setIsPlaying(false);
                setActiveAyah(null);
                
                // Auto-play next search result if available
                const currentIndex = results.findIndex(result => result.id === ayah.id);
                if (currentIndex !== -1 && currentIndex < results.length - 1) {
                    const nextAyah = results[currentIndex + 1];
                    setTimeout(() => {
                        playAudio(nextAyah);
                    }, 1000); // Slightly longer delay for search results
                }
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
    
    const highlightMatches = (text, query) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    };
    
    // Calculate search summary statistics - placed before the return statement
    const calculateSearchSummary = () => {
        if (!results || results.length === 0) return null;
        
        // Count unique surahs using surah_number which is more reliable
        const uniqueSurahs = new Set();
        results.forEach(ayah => {
            if (ayah.surah_number) {
                uniqueSurahs.add(ayah.surah_number);
            }
        });
        
        return {
            totalAyahs: results.length,
            totalSurahs: uniqueSurahs.size,
            uniqueSurahs: Array.from(uniqueSurahs)
        };
    };
    
    // Group results by surah for organized display
    const groupResultsBySurah = () => {
        if (!results || results.length === 0) return [];
        
        // Group results by surah
        const groupedResults = results.reduce((groups, ayah) => {
            const surahNumber = ayah.surah_number;
            const surahName = ayah.surah?.name_latin || '';
            
            if (!groups[surahNumber]) {
                groups[surahNumber] = {
                    surahNumber,
                    surahName,
                    surahNameIndonesian: ayah.surah?.name_indonesian,
                    ayahs: []
                };
            }
            
            groups[surahNumber].ayahs.push(ayah);
            return groups;
        }, {});
        
        // Convert the grouped object to array and sort by surah number
        return Object.values(groupedResults).sort((a, b) => a.surahNumber - b.surahNumber);
    };
    
    const searchSummary = calculateSearchSummary();
    const surahGroups = groupResultsBySurah();
    
    // Toggle a surah group's expanded state
    const toggleSurahExpand = (surahNumber) => {
        setExpandedSurahs(prev => {
            const newState = {
                ...prev,
                [surahNumber]: !prev[surahNumber]
            };
            
            // Check if all surahs are expanded or all are collapsed
            const allExpanded = surahGroups.every(group => newState[group.surahNumber]);
            const allCollapsed = surahGroups.every(group => !newState[group.surahNumber]);
            
            // Set viewMode based on the state
            if (allExpanded) {
                setViewMode('show');
            } else if (allCollapsed) {
                setViewMode('hide');
            }
            
            return newState;
        });
    };
    
    if (!query) {
        return (
            <div className="max-w-6xl mx-auto">
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
                            navigate(`/search?q=${encodeURIComponent(formQuery)}`);
                        }
                    }}
                >
                    <div className="flex flex-col space-y-3">
                        <div className="flex">
                            <input
                                type="text"
                                name="q"
                                placeholder="Masukkan kata kunci pencarian..."
                                className="w-full px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic border border-primary-100 hover:border-primary-200 transition-colors duration-300"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-primary-600 to-primary-500 text-black px-7 py-3 rounded-r-lg hover:from-primary-700 hover:to-primary-600 hover:text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic-lg hover:shadow-islamic-xl font-bold text-lg flex items-center justify-center min-w-[100px]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
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
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-islamic"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-accent-50 text-accent-700 p-4 rounded-lg shadow-islamic" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto">
            <QuranHeader className="mb-6" />
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Hasil Pencarian: "{query}"</h1>
                <p className="text-gray-600">
                    Ditemukan {totalResults} hasil dalam bahasa Indonesia
                </p>
                
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
                    <div className="flex items-center">
                        <div className="flex flex-1 shadow-islamic rounded-l-lg">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="Cari ayat lain..."
                                className="w-full px-5 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-400 border border-primary-100 hover:border-primary-200 transition-colors duration-300"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-primary-600 to-primary-500 text-black px-7 py-3 rounded-r-lg hover:from-primary-700 hover:to-primary-600 hover:text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-islamic-lg hover:shadow-islamic-xl font-bold text-lg flex items-center justify-center min-w-[100px]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Cari
                        </button>
                    </div>
                </form>
            </div>
            
            {results.length === 0 ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-5 rounded-xl shadow-sm relative mb-6" role="alert">
                    <div className="flex items-center gap-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="font-medium text-lg text-yellow-800">Tidak ditemukan hasil</h3>
                    </div>
                    <p className="text-yellow-700">Tidak ditemukan ayat yang mengandung kata kunci "<span className="font-semibold">{query}</span>".</p>
                    <div className="mt-4 bg-white p-3 rounded-lg text-gray-700 text-sm">
                        <p className="font-medium mb-1">Saran pencarian:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Pastikan ejaan kata kunci sudah benar</li>
                            <li>Coba gunakan kata kunci yang lebih umum</li>
                            <li>Coba cari dengan kata kunci tunggal</li>
                            <li>Hindari penggunaan tanda baca</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Results Summary */}
                    <div className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-medium text-primary-800">Ditemukan {results.length} ayat yang sesuai</h3>
                                <p className="text-sm text-primary-600">Kata kunci: <span className="font-semibold">{query}</span></p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Grouped Results */}
                    <div className="space-y-6">
                        {surahGroups.map((group) => (
                            <div key={group.surahNumber} className="mb-4">
                                {/* Surah Header with Toggle */}
                                <div className="bg-gradient-to-r from-primary-100/90 to-primary-50/90 rounded-xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center justify-between cursor-pointer hover:bg-primary-100/70 transition-all duration-200"
                                        onClick={() => toggleSurahExpand(group.surahNumber)}>
                                        <div className="flex items-center gap-2">
                                            {expandedSurahs[group.surahNumber] ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                            <h3 className="font-semibold text-primary-800">
                                                Surah {group.surahNumber}. {group.surahName} {group.surahNameIndonesian ? `(${group.surahNameIndonesian})` : ''}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                                                {group.surahNumber}
                                            </span>
                                            <span className="text-xs bg-white text-primary-600 px-2 py-1 rounded-full">
                                                {group.ayahs.length} ayat
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Collapsible Ayahs */}
                                {expandedSurahs[group.surahNumber] && (
                                    <div className="bg-white/70 rounded-b-xl mb-4 pb-2">
                                        {group.ayahs.map(ayah => (
                                            <div key={ayah.id} className="px-1 py-1">
                                                <AyahCard 
                                                    key={ayah.id}
                                                    ayah={ayah}
                                                    surah={ayah.surah}
                                                    highlightText={query}
                                                    playAudio={playAudio}
                                                    isPlaying={activeAyah === ayah.id && isPlaying}
                                                    activeAyah={activeAyah}
                                                    showBookmarkControls={true}
                                                    isBookmarked={ayah.pivot?.is_bookmarked}
                                                    isFavorite={ayah.pivot?.is_favorite}
                                                    variant="full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* New summary display */}
            {searchSummary && searchSummary.totalAyahs > 0 && (
                <div className="mt-2 bg-gradient-to-r from-primary-50 to-islamic-cream rounded-lg p-3 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex flex-wrap gap-2 justify-start">
                            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-xs font-medium text-primary-700">
                                    <span className="font-bold text-primary-800">{searchSummary.totalSurahs}</span> Surah
                                </span>
                            </div>
                            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-xs font-medium text-primary-700">
                                    <span className="font-bold text-primary-800">{searchSummary.totalAyahs}</span> Ayat
                                </span>
                            </div>
                        </div>
                        
                        {/* View/Hide All Controls */}
                        <div className="flex space-x-1 bg-primary-50 p-1 rounded-lg mt-2 sm:mt-0">
                            <button 
                                onClick={() => {
                                    const updates = {};
                                    surahGroups.forEach(group => {
                                        updates[group.surahNumber] = true;
                                    });
                                    setExpandedSurahs(updates);
                                    setViewMode('show');
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-all duration-200 ${
                                    viewMode === 'show'
                                        ? 'bg-white text-primary-700 shadow-islamic border border-primary-200'
                                        : 'bg-primary-50 text-primary-800 hover:bg-primary-100 border border-transparent'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Tampilkan Semua</span>
                            </button>
                            <button 
                                onClick={() => {
                                    setExpandedSurahs({});
                                    setViewMode('hide');
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-all duration-200 ${
                                    viewMode === 'hide'
                                        ? 'bg-white text-primary-700 shadow-islamic border border-primary-200'
                                        : 'bg-primary-50 text-primary-800 hover:bg-primary-100 border border-transparent'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                <span>Sembunyikan Semua</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchPage;
