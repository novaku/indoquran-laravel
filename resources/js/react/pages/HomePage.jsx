import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QuranHeader from '../components/QuranHeader';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';
import { fetchWithAuth, getAuthToken } from '../utils/apiUtils';

function HomePage() {
    const navigate = useNavigate();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Search functionality states
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Handle Escape key press for modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showModal]);
    
    // Load surahs data
    useEffect(() => {
        const token = getAuthToken();
        
        fetchWithAuth('/api/surahs', {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch surahs');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
                } else {
                    setError("Gagal memuat data surah");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Helper function to truncate description
    const truncateDescription = (htmlText, maxLength = 80) => {
        if (!htmlText) return '';
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        
        // Get the text content
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Truncate the text content
        return textContent.length > maxLength 
            ? textContent.substring(0, maxLength) + '...' 
            : textContent;
    };
    
    // Search functionality
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        
        const token = getAuthToken();
        setIsSearchLoading(true);
        try {
            const response = await fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&limit=5`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            if (data.status === 'success') {
                const ayahResults = Array.isArray(data.data) ? data.data : [];
                
                if (!Array.isArray(ayahResults)) {
                    setSuggestions([]);
                    return;
                }
                
                const textSuggestions = ayahResults.map((ayah, index) => {
                    if (!ayah || typeof ayah !== 'object') {
                        return null;
                    }
                    
                    const ayahData = {
                        ...ayah,
                        surah_number: ayah.surah_number || null,
                        number: ayah.number || ayah.ayah_number || null,
                        text_indonesian: ayah.text_indonesian || ''
                    };
                    
                    if (!ayahData.surah_number || !ayahData.number) {
                        return null;
                    }
                    
                    let highlightedText = ayahData.text_indonesian;
                    const lowerText = ayahData.text_indonesian.toLowerCase();
                    const lowerQuery = query.toLowerCase();
                    
                    if (lowerText.includes(lowerQuery)) {
                        const startIndex = lowerText.indexOf(lowerQuery);
                        highlightedText = {
                            before: ayahData.text_indonesian.substring(0, startIndex),
                            match: ayahData.text_indonesian.substring(startIndex, startIndex + query.length),
                            after: ayahData.text_indonesian.substring(startIndex + query.length)
                        };
                    }
                    
                    const suggestion = {
                        type: 'ayah',
                        ayah: ayahData,
                        surahName: surahs.find(s => s.number === ayahData.surah_number)?.name_latin || `Surah ${ayahData.surah_number}`,
                        text: ayahData.text_indonesian,
                        highlightedText: highlightedText
                    };
                    
                    return suggestion;
                })
                .filter(Boolean)
                .slice(0, 5);
                
                setSuggestions(textSuggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsSearchLoading(false);
        }
    };

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                fetchSuggestions(searchTerm);
            } else {
                setSuggestions([]);
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTerm, surahs]);

    // Handle clicks outside of the search component
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchRef]);

    // Reset highlighted index when suggestions change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [suggestions]);

    // Scroll highlighted suggestion into view
    useEffect(() => {
        if (highlightedIndex >= 0 && suggestionsRef.current) {
            const highlightedElement = suggestionsRef.current.querySelector(`li:nth-child(${highlightedIndex + 1})`);
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = e.target.elements.search.value.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowSuggestions(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSearchFocus = () => {
        if (searchTerm && searchTerm.length >= 2) {
            setShowSuggestions(true);
        }
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prevIndex => 
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prevIndex => 
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
        } 
        else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            const suggestion = suggestions[highlightedIndex];
            
            if (suggestion.type === 'ayah' && suggestion.ayah) {
                handleSuggestionClick(suggestion);
            }
        }
        else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'ayah' && suggestion.ayah) {
            const surah_number = suggestion.ayah.surah_number;
            const ayah_number = suggestion.ayah.number || suggestion.ayah.ayah_number;
            
            if (surah_number && ayah_number) {
                const navigationUrl = `/surah/${surah_number}/${ayah_number}`;
                navigate(navigationUrl);
            }
        }
        
        setShowSuggestions(false);
        setSearchTerm('');
    };

    const handleViewAllResults = () => {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSuggestions(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedSurah(null);
    };

    const handleSurahClick = (e, surah) => {
        e.preventDefault(); // Prevent the Link component from navigating immediately
        setSelectedSurah(surah);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green shadow-islamic"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-islamic" role="alert">
                <strong className="font-bold">Kesalahan! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 pt-24 pb-20">
            <MetaTags 
                title="Al-Quran Digital Indonesia | Baca Al-Quran Online dengan Terjemahan Indonesia"
                description="Baca Al-Quran digital lengkap dengan terjemahan bahasa Indonesia, tafsir, dan audio. Cari ayat, bookmark, dan pelajari Al-Quran dengan mudah secara online."
                keywords="al quran digital, baca quran online, al quran indonesia, terjemahan quran, quran digital, al quran indonesia"
                canonicalUrl="https://my.indoquran.web.id/"
            />
            
            <StructuredData type="WebSite" data={{}} />
            
            <div className="container mx-auto px-4 py-8">
                <QuranHeader />
                
                {/* Search Widget */}
                <div className="mb-8 max-w-3xl mx-auto">
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                        <div className="relative w-full" ref={searchRef}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-islamic-green" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input 
                                type="text" 
                                name="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                onKeyDown={handleKeyDown}
                                placeholder="Cari ayat Al-Quran berdasarkan terjemahan Indonesia..." 
                                className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-islamic-green/20 focus:outline-none focus:ring-2 focus:ring-islamic-green/30 focus:border-islamic-green/40 shadow-md text-base bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-islamic-green/60 hover:text-islamic-green transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && searchTerm.length >= 2 && (
                                <div 
                                    className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg max-h-96 overflow-y-auto border border-islamic-green/20"
                                    ref={suggestionsRef}
                                >
                                    {isSearchLoading ? (
                                        <div className="p-4 text-center text-islamic-green">
                                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-islamic-green mr-2"></div>
                                            Mencari...
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-islamic-green/10 bg-islamic-green/5">
                                                <h3 className="text-xs font-medium text-islamic-green">Hasil Pencarian untuk "{searchTerm}"</h3>
                                            </div>
                                            <ul className="py-2">
                                                {suggestions.map((suggestion, index) => (
                                                <li 
                                                    key={`${suggestion.type}-${index}`}
                                                    onClick={() => {
                                                        handleSuggestionClick(suggestion);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-islamic-green/5 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                        highlightedIndex === index ? 'bg-islamic-green/5' : ''
                                                    } transition-colors duration-150`}
                                                    onMouseEnter={() => setHighlightedIndex(index)}
                                                >
                                                    {suggestion.ayah ? (
                                                        <div>
                                                            <div className="flex items-center text-islamic-brown text-sm mb-1.5">
                                                                <span className="font-medium">{suggestion.surahName}</span>
                                                                <span className="mx-1.5">•</span>
                                                                <span>Ayat {suggestion.ayah.number || suggestion.ayah.ayah_number}</span>
                                                                <span className="ml-auto text-xs text-islamic-green bg-islamic-green/10 px-2 py-0.5 rounded-full">Lihat ayat →</span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm overflow-hidden text-ellipsis" 
                                                               style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                                                <span className="text-islamic-green font-medium">Terjemahan: </span>
                                                                {typeof suggestion.highlightedText === 'object' ? (
                                                                    <span>
                                                                        "{suggestion.highlightedText.before}
                                                                        <span className="bg-yellow-100 font-medium px-0.5 rounded-sm">{suggestion.highlightedText.match}</span>
                                                                        {suggestion.highlightedText.after}"
                                                                    </span>
                                                                ) : (
                                                                    `"${suggestion.text}"`
                                                                )}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 text-sm text-gray-500">
                                                            Data ayat tidak lengkap
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        </>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <div className="text-islamic-green/70 mb-3 font-medium">Tidak ada hasil yang cocok</div>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                                Coba gunakan kata kunci lain atau cari berdasarkan isi ayat. Contoh: "rahmat", "kasih sayang", "rezeki"
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* View All Results Button */}
                                    {!isSearchLoading && suggestions.length > 0 && (
                                        <div className="p-4 border-t border-islamic-green/10">
                                            <button
                                                onClick={handleViewAllResults}
                                                className="w-full py-3 px-4 bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green font-medium rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow"
                                                type="button"
                                            >
                                                <span>Lihat Semua Hasil</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>
                    <p className="text-center text-sm text-islamic-green/70 mt-3 px-2 flex items-center justify-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Cari berdasarkan kata kunci, nama surah, atau terjemahan bahasa Indonesia</span>
                    </p>
                </div>
                
                <PrayerTimesWidget className="mb-8" />
            
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-islamic-green mb-2">Al-Quran Digital</h1>
                    <p className="text-lg text-gray-600 mb-6">Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia</p>
                </div>
            
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {surahs.map(surah => (
                            <a 
                                key={surah.number} 
                                href={`/surah/${surah.number}`}
                                onClick={(e) => handleSurahClick(e, surah)}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer block"
                            >
                                <div className="flex items-center p-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-islamic-green rounded-full mr-4">
                                        <span className="text-lg font-bold text-white">{surah.number}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-islamic-green">{surah.name_latin}</h3>
                                        <p className="text-islamic-brown text-sm">{surah.name_indonesian || "The " + surah.name_latin}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="text-2xl text-islamic-green font-arabic">{surah.name_arabic}</span>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    {surah.description_short && (
                                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                            {truncateDescription(surah.description_short)}
                                        </p>
                                    )}
                                    <div className="flex justify-between text-sm items-center mb-3">
                                        <span className={`px-2 py-0.5 rounded-md text-xs ${surah.revelation_place === 'Meccan' ? 'bg-green-50 text-islamic-green' : 'bg-blue-50 text-blue-700'}`}>
                                            {surah.revelation_place}
                                        </span>
                                        <span className="text-islamic-brown">{surah.total_ayahs} ayat</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSurahClick(e, surah);
                                            }}
                                            className="flex-1 bg-islamic-green text-black font-semibold text-center py-2.5 px-4 rounded-md hover:bg-islamic-green/90 transition-colors duration-200 text-sm shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Detail
                                        </button>
                                        <a 
                                            href={`/surah/${surah.number}`}
                                            className="flex-1 bg-islamic-green text-black font-semibold text-center py-2.5 px-4 rounded-md hover:bg-islamic-green/90 transition-colors duration-200 text-sm shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Baca
                                        </a>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Surah Detail Modal */}
            {showModal && selectedSurah && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        {/* Sticky Header */}
                        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg z-10 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-islamic-green mb-1">
                                        {selectedSurah.name_latin}
                                    </h2>
                                    <p className="text-islamic-brown">
                                        {selectedSurah.name_indonesian}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl text-islamic-green font-arabic">
                                        {selectedSurah.name_arabic}
                                    </span>
                                    <button 
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
                            <div className="space-y-6">
                                <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Surah ke-</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.number}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jumlah Ayat</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.total_ayahs}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tempat Turun</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.revelation_place}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedSurah.description_short && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-islamic-green mb-2">Ringkasan</h3>
                                        <div 
                                            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-islamic-green"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_short }}
                                        />
                                    </div>
                                )}

                                {selectedSurah.description_long && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-islamic-green mb-2">Penjelasan Detail</h3>
                                        <div 
                                            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-islamic-green prose-a:text-islamic-green hover:prose-a:text-islamic-green/80"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_long }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 pt-4 pb-2 bg-white/80 backdrop-blur-sm">
                                <button 
                                    onClick={closeModal}
                                    className="px-4 py-2 text-black bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium inline-flex items-center rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Tutup
                                </button>
                                <a 
                                    href={`/surah/${selectedSurah.number}`}
                                    className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-black rounded-lg hover:bg-gray-50 font-medium inline-flex items-center transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Baca Surah
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;
