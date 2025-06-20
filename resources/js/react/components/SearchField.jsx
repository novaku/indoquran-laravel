import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

const SearchField = ({ 
    onSuggestionClick, 
    onViewAllResults, 
    surahs = [], 
    className = '',
    placeholder = 'Cari ayat Al-Quran berdasarkan terjemahan Indonesia...',
    theme = 'islamic', // 'islamic' or 'amber'
    value, // controlled value
    onChange, // controlled onChange
    disableAutocomplete = false // prop to disable autocomplete suggestions
}) => {
    const navigate = useNavigate();
    
    // Search functionality states
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const currentRequestRef = useRef(null);
    const lastSearchTermRef = useRef('');

    // Determine if this is a controlled component
    const isControlled = value !== undefined;
    // Ensure searchTerm is always a string
    const searchTerm = isControlled ? String(value || '') : internalSearchTerm;

    // Search functionality
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchLoading(false);
            return;
        }

        // Don't make API call if the query is the same as the last one
        if (lastSearchTermRef.current === query) {
            return;
        }
        lastSearchTermRef.current = query;

        // Cancel previous request if it exists
        if (currentRequestRef.current) {
            currentRequestRef.current.abort();
        }

        // Create new AbortController for this request
        const abortController = new AbortController();
        currentRequestRef.current = abortController;
        
        const token = authUtils.getAuthToken();
        setIsSearchLoading(true);
        try {
            // First, search through surahs in memory
            const surahResults = surahs
                .filter(surah => 
                    surah.name_latin.toLowerCase().includes(query.toLowerCase()) ||
                    surah.name_indonesian.toLowerCase().includes(query.toLowerCase()) ||
                    surah.number.toString() === query
                )
                .slice(0, 3)
                .map(surah => ({
                    type: 'surah',
                    surah: surah,
                    text: surah.name_latin,
                    highlightedText: {
                        before: '',
                        match: surah.name_latin,
                        after: ` (${surah.name_indonesian})`
                    }
                }));

            // Then, fetch ayah results from API
            const response = await fetchWithAuth(`/api/cari?q=${encodeURIComponent(query)}&limit=5`, {
                signal: abortController.signal,
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
                    setSuggestions(surahResults);
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
                .slice(0, 3);
                
                // Combine surah and ayah results
                setSuggestions([...surahResults, ...textSuggestions]);
            }
        } catch (error) {
            // Don't log errors for aborted requests
            if (error.name !== 'AbortError') {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            }
        } finally {
            // Only update loading state if this request wasn't aborted
            if (!abortController.signal.aborted) {
                setIsSearchLoading(false);
            }
            // Clear the current request reference
            if (currentRequestRef.current === abortController) {
                currentRequestRef.current = null;
            }
        }
    }, [surahs]); // Only depend on surahs, which should be memoized by parent component

    // Debounced search function
    const debouncedFetchSuggestions = useCallback((query) => {
        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Ensure query is a string
        const searchQuery = String(query || '');
        
        // Set new timeout
        searchTimeoutRef.current = setTimeout(() => {
            if (searchQuery && searchQuery.length >= 2) {
                fetchSuggestions(searchQuery);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
                setIsSearchLoading(false);
            }
        }, 500); // Increased debounce delay to 500ms to reduce API calls
    }, [fetchSuggestions]);

    // Handle search term changes
    useEffect(() => {
        // Only fetch suggestions if autocomplete is not disabled
        if (!disableAutocomplete) {
            debouncedFetchSuggestions(searchTerm);
        } else {
            // Clear suggestions if autocomplete is disabled
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearchLoading(false);
        }
        
        // Cleanup timeout and abort request on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (currentRequestRef.current) {
                currentRequestRef.current.abort();
            }
        };
    }, [searchTerm, debouncedFetchSuggestions, disableAutocomplete]);

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
            navigate(`/cari?q=${encodeURIComponent(query)}`);
            setShowSuggestions(false);
            if (onViewAllResults) onViewAllResults(query);
        }
    };

    const handleSearchChange = (e) => {
        // Ensure we have a valid event and value
        if (!e || !e.target) return;
        
        const value = e.target.value || '';
        
        if (isControlled) {
            // In controlled mode, call the parent's onChange with the string value
            if (onChange && typeof onChange === 'function') {
                onChange(value);
            }
        } else {
            // In uncontrolled mode, update internal state
            setInternalSearchTerm(value);
        }
        
        if (value.length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSearchFocus = () => {
        // Only show suggestions if autocomplete is not disabled
        if (!disableAutocomplete && searchTerm && searchTerm.length >= 2) {
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
            } else if (suggestion.type === 'surah' && suggestion.surah) {
                handleSuggestionClick(suggestion);
            }
        }
        else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    const handleSuggestionClick = useCallback((suggestion) => {
        if (suggestion.type === 'ayah' && suggestion.ayah) {
            const surah_number = suggestion.ayah.surah_number;
            const ayah_number = suggestion.ayah.number || suggestion.ayah.ayah_number;
            
            if (surah_number && ayah_number) {
                const navigationUrl = `/surah/${surah_number}/${ayah_number}`;
                navigate(navigationUrl);
            }
        } else if (suggestion.type === 'surah' && suggestion.surah) {
            const navigationUrl = `/surah/${suggestion.surah.number}`;
            navigate(navigationUrl);
        }
        
        setShowSuggestions(false);
        
        // Update the search field with the selected suggestion text
        const suggestionText = suggestion.text || '';
        if (isControlled) {
            if (onChange) onChange(suggestionText);
        } else {
            setInternalSearchTerm(suggestionText);
        }
        
        if (onSuggestionClick) onSuggestionClick(suggestion);
    }, [navigate, onSuggestionClick, isControlled, onChange]);

    const handleViewAllResults = () => {
        navigate(`/cari?q=${encodeURIComponent(searchTerm)}`);
        setShowSuggestions(false);
        if (onViewAllResults) onViewAllResults(searchTerm);
    };

    const handleClearSearch = () => {
        if (isControlled) {
            // In controlled mode, pass empty string to parent
            if (onChange) {
                onChange('');
            }
        } else {
            setInternalSearchTerm('');
        }
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
    };

    // Theme configurations
    const themes = {
        islamic: {
            primary: 'islamic-green',
            primaryBorder: 'islamic-green/20',
            primaryFocus: 'islamic-green/30',
            primaryHover: 'islamic-green/40',
            primaryText: 'islamic-green',
            primaryBg: 'islamic-green/5',
            primaryAccent: 'islamic-green/10'
        },
        amber: {
            primary: 'amber-500',
            primaryBorder: 'amber-200',
            primaryFocus: 'amber-300',
            primaryHover: 'amber-300',
            primaryText: 'amber-600',
            primaryBg: 'amber-50',
            primaryAccent: 'amber-100'
        }
    };

    const currentTheme = themes[theme] || themes.islamic;

    return (
        <div className={`relative w-full ${className}`}>
            <form onSubmit={handleSearchSubmit} method="GET" className="flex items-center">
                <div className="relative w-full" ref={searchRef}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-${currentTheme.primaryText}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input 
                        type="text" 
                        name="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 border-${currentTheme.primaryBorder} focus:outline-none focus:ring-2 focus:ring-${currentTheme.primaryFocus} focus:border-${currentTheme.primaryHover} shadow-md text-base bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow`}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 text-${currentTheme.primaryText}/60 hover:text-${currentTheme.primaryText} transition-colors`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Autocomplete Suggestions */}
                    {!disableAutocomplete && showSuggestions && searchTerm.length >= 2 && (
                        <div 
                            className={`absolute mt-2 w-full bg-white rounded-xl shadow-lg max-h-96 overflow-y-auto border border-${currentTheme.primaryBorder} z-50`}
                            ref={suggestionsRef}
                        >
                            {isSearchLoading ? (
                                <div className={`p-4 text-center text-${currentTheme.primaryText}`}>
                                    <div className={`inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-${currentTheme.primaryText} mr-2`}></div>
                                    Mencari...
                                </div>
                            ) : suggestions.length > 0 ? (
                                <>
                                    <div className={`px-4 py-2 border-b border-${currentTheme.primaryBorder} bg-${currentTheme.primaryBg}`}>
                                        <h3 className={`text-xs font-medium text-${currentTheme.primaryText}`}>
                                            Hasil Pencarian untuk "{searchTerm}"
                                        </h3>
                                    </div>
                                    <ul className="py-2">
                                        {suggestions.map((suggestion, index) => (
                                            <li 
                                                key={`${suggestion.type}-${index}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className={`px-4 py-3 hover:bg-${currentTheme.primaryBg} cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                    highlightedIndex === index ? `bg-${currentTheme.primaryBg}` : ''
                                                } transition-colors duration-150`}
                                                onMouseEnter={() => setHighlightedIndex(index)}
                                            >
                                                {suggestion.type === 'surah' ? (
                                                    <div>
                                                        <div className="flex items-center text-gray-800 text-sm mb-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 text-${currentTheme.primaryText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                            <span className="font-medium">{suggestion.surah.name_latin}</span>
                                                            <span className="mx-1.5">•</span>
                                                            <span>{suggestion.surah.name_indonesian}</span>
                                                            <span className="mx-1.5">•</span>
                                                            <span>{suggestion.surah.total_ayahs} ayat</span>
                                                            <span className={`ml-auto text-xs text-${currentTheme.primaryText} bg-${currentTheme.primaryAccent} px-2 py-0.5 rounded-full`}>
                                                                Baca Surah →
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">
                                                            {suggestion.surah.revelation_place} • Surah ke-{suggestion.surah.number}
                                                        </p>
                                                    </div>
                                                ) : suggestion.ayah ? (
                                                    <div>
                                                        <div className="flex items-center text-gray-800 text-sm mb-1.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 text-${currentTheme.primaryText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                                                            </svg>
                                                            <span className="font-medium">{suggestion.surahName}</span>
                                                            <span className="mx-1.5">•</span>
                                                            <span>Ayat {suggestion.ayah.number || suggestion.ayah.ayah_number}</span>
                                                            <span className={`ml-auto text-xs text-${currentTheme.primaryText} bg-${currentTheme.primaryAccent} px-2 py-0.5 rounded-full`}>
                                                                Lihat ayat →
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm overflow-hidden text-ellipsis" 
                                                           style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                                            <span className={`text-${currentTheme.primaryText} font-medium`}>Terjemahan: </span>
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
                                                        Data tidak lengkap
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className="p-6 text-center">
                                    <div className={`text-${currentTheme.primaryText}/70 mb-3 font-medium`}>Tidak ada hasil yang cocok</div>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                                        Coba gunakan kata kunci lain atau cari berdasarkan isi ayat. Contoh: "rahmat", "kasih sayang", "rezeki"
                                    </p>
                                </div>
                            )}
                            
                            {/* View All Results Button */}
                            {!isSearchLoading && suggestions.length > 0 && (
                                <div className={`p-4 border-t border-${currentTheme.primaryBorder}`}>
                                    <button
                                        onClick={handleViewAllResults}
                                        className={`w-full py-3 px-4 bg-${currentTheme.primaryAccent} hover:bg-${currentTheme.primaryBg} text-${currentTheme.primaryText} font-medium rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow`}
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
        </div>
    );
};

export default SearchField;
