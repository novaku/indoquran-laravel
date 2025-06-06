import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchWidget = () => {
    const navigate = useNavigate();
    
    // Search functionality states
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [surahs, setSurahs] = useState([]);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Load surahs for search autocomplete
    useEffect(() => {
        fetch('/api/surahs')
            .then(response => response.json())
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
                }
            })
            .catch(error => console.error('Error loading surahs:', error));
    }, []);

    const highlightWords = (text, searchWords) => {
        let result = text;
        searchWords.forEach(word => {
            if (word.trim()) {
                const regex = new RegExp(`(${word})`, 'gi');
                result = result.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
            }
        });
        return result;
    };

    // Search functionality
    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            if (data.status === 'success') {
                const ayahResults = Array.isArray(data.data) ? data.data : [];
                
                if (!Array.isArray(ayahResults)) {
                    console.error('Unexpected API response format:', data);
                    setSuggestions([]);
                    return;
                }
                
                const searchWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
                
                const textSuggestions = ayahResults.map(ayah => {
                    if (!ayah || typeof ayah !== 'object') {
                        console.error('Invalid ayah data:', ayah);
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
                    
                    return {
                        type: 'ayah',
                        ayah: ayahData,
                        surahName: surahs.find(s => s.number === ayahData.surah_number)?.name_latin || `Surah ${ayahData.surah_number}`,
                        text: ayahData.text_indonesian,
                        highlightedText: highlightWords(ayahData.text_indonesian, searchWords)
                    };
                })
                .filter(Boolean)
                .slice(0, 5);
                
                setSuggestions(textSuggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
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
        // Only handle form submission if a suggestion is not being clicked
        if (!showSuggestions || highlightedIndex === -1) {
            const query = e.target.elements.search.value.trim();
            if (query) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
                setShowSuggestions(false);
            }
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
            if (suggestion && suggestion.type === 'ayah' && suggestion.ayah) {
                // Call the same handler used for mouse clicks
                handleSuggestionClick(suggestion, e);
            } else if (searchTerm) {
                // If no suggestion is highlighted but there's a search term, submit the search
                handleViewAllResults();
            }
        }
        else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    const handleSuggestionClick = (suggestion, event) => {
        // Ensure event propagation is stopped
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (suggestion.type === 'ayah' && suggestion.ayah) {
            const surah_number = suggestion.ayah.surah_number;
            // Try to get the ayah number from any available property
            const ayah_number = suggestion.ayah.number || suggestion.ayah.ayah_number;
            
            if (surah_number && ayah_number) {
                console.log('Navigating to:', `/surah/${surah_number}/${ayah_number}`);
                
                // First close the suggestions and clear search term
                setShowSuggestions(false);
                setSearchTerm('');
                
                // Force the event loop to complete state updates before navigation
                setTimeout(() => {
                    // Use navigate function directly from react-router-dom
                    navigate(`/surah/${surah_number}/${ayah_number}`, { replace: true });
                }, 10);
            } else {
                console.error('Invalid ayah data for navigation:', suggestion.ayah);
            }
        } else {
            console.error('Invalid suggestion data:', suggestion);
        }
    };

    const handleViewAllResults = () => {
        console.log('View all results clicked with search term:', searchTerm);
        
        // Close suggestions first
        setShowSuggestions(false);
        
        // Use setTimeout with a slightly longer delay to ensure state updates complete before navigation
        setTimeout(() => {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`, { replace: true });
        }, 10);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    };

    return (
        <div className="relative mb-8">
            <div className="bg-white rounded-3xl shadow-xl border-4 border-double border-amber-300">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 relative p-6">
                    {/* Decorative corner elements */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-amber-400 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-amber-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-amber-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-amber-400 rounded-br-lg"></div>
                    
                    {/* Inner decorative border */}
                    <div className="absolute inset-4 border-2 border-dotted border-amber-300 rounded-2xl opacity-60"></div>
                    
                    {/* Content */}
                    <h2 className="text-2xl font-semibold text-islamic-brown flex items-center justify-center relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        Pencarian Al-Quran
                    </h2>
                </div>
                
                <div className="p-6">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative" ref={searchRef}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input 
                                type="text" 
                                name="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                onKeyDown={handleKeyDown}
                                placeholder="Cari ayat Al-Quran berdasarkan terjemahan..." 
                                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 text-gray-700 bg-gradient-to-br from-amber-50 to-orange-50 shadow-inner transition-all duration-300"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-4 text-amber-400 hover:text-amber-600 transition-colors duration-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && searchTerm.length >= 2 && (
                                <div 
                                    className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl max-h-80 overflow-y-auto border-2 border-amber-200 z-50"
                                    ref={suggestionsRef}
                                >
                                    {isLoading ? (
                                        <div className="p-4 text-center text-amber-600">
                                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-500 mr-2"></div>
                                            Mencari...
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <ul className="py-1">
                                            {suggestions.map((suggestion, index) => (
                                                <li 
                                                    key={`${suggestion.type}-${index}`}
                                                    className={`px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-b-0 transition-colors duration-200 ${
                                                        highlightedIndex === index ? 'bg-amber-50' : ''
                                                    } hover:bg-amber-100/50`}
                                                    onMouseEnter={() => setHighlightedIndex(index)}
                                                    onClick={(event) => handleSuggestionClick(suggestion, event)}
                                                >
                                                    {suggestion.ayah ? (
                                                        <div>
                                                            <div className="flex items-center text-islamic-brown text-sm mb-1">
                                                                <span className="font-medium">{suggestion.surahName}</span>
                                                                <span className="mx-1">•</span>
                                                                <span>Ayat {suggestion.ayah.number || suggestion.ayah.ayah_number}</span>
                                                                <span className="ml-auto text-xs text-islamic-green">Lihat ayat →</span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm overflow-hidden text-ellipsis" 
                                                               style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                                                <span className="text-islamic-green font-medium">Terjemahan: </span>
                                                                <span dangerouslySetInnerHTML={{ __html: `"${suggestion.highlightedText}"` }} />
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
                                    ) : (
                                        <div className="p-4 text-center">
                                            <div className="text-gray-500 mb-2">Tidak ada hasil yang cocok</div>
                                            <p className="text-sm text-gray-400">
                                                Coba gunakan kata kunci lain atau cari berdasarkan isi ayat
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* View All Results Button */}
                                    {!isLoading && suggestions.length > 0 && (
                                        <div className="p-3 border-t border-gray-100">
                                            <button
                                                onClick={handleViewAllResults}
                                                className="w-full py-3 px-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 font-medium rounded-xl transition-all duration-300 flex items-center justify-center no-underline border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md"
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
                    
                    <div className="mt-4 text-sm text-amber-600/80 italic flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                        <p>Tips: Ketik minimal 2 karakter untuk melihat saran pencarian otomatis</p>
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchWidget;