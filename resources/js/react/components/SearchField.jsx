import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildExactWordRegex = (query) => {
    const terms = String(query || '').trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return /$^/;
    const pattern = terms.map(escapeRegExp).join('\\s+');
    return new RegExp(`(^|[^a-z0-9])(${pattern})([^a-z0-9]|$)`, 'i');
};

const matchesSearchText = (text, query, exactMatch) => {
    const textValue = String(text || '').toLowerCase();
    const searchValue = String(query || '').trim().toLowerCase();

    if (!textValue || !searchValue) {
        return false;
    }

    if (exactMatch) {
        return buildExactWordRegex(searchValue).test(textValue);
    }

    return textValue.includes(searchValue);
};

const buildHighlightedParts = (text, query, exactMatch) => {
    const textValue = String(text || '');
    const searchValue = String(query || '').trim();

    if (!textValue || !searchValue) {
        return textValue;
    }

    if (exactMatch) {
        const regex = buildExactWordRegex(searchValue);
        const match = textValue.match(regex);

        if (!match || match.index === undefined) {
            return textValue;
        }

        const startIndex = match.index + (match[1] || '').length;
        const matchedText = match[2] || '';
        return {
            before: textValue.substring(0, startIndex),
            match: matchedText,
            after: textValue.substring(startIndex + matchedText.length)
        };
    }

    const lowerText = textValue.toLowerCase();
    const lowerQuery = searchValue.toLowerCase();

    if (!lowerText.includes(lowerQuery)) {
        return textValue;
    }

    const startIndex = lowerText.indexOf(lowerQuery);
    return {
        before: textValue.substring(0, startIndex),
        match: textValue.substring(startIndex, startIndex + searchValue.length),
        after: textValue.substring(startIndex + searchValue.length)
    };
};

const SearchField = ({ 
    onSuggestionClick, 
    onViewAllResults, 
    onClear,
    surahs = [], 
    className = '',
    placeholder = 'Cari ayat Al-Quran berdasarkan terjemahan Indonesia...',
    theme = 'islamic', // 'islamic' or 'amber'
    value, // controlled value
    onChange, // controlled onChange
    disableAutocomplete = false, // prop to disable autocomplete suggestions
    exactMatch,
    onExactMatchChange,
    showExactSearchToggle = false
}) => {
    const navigate = useNavigate();
    
    // Search functionality states
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const [internalExactMatch, setInternalExactMatch] = useState(false);
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
    const isExactMatchControlled = exactMatch !== undefined;
    const exactSearch = isExactMatchControlled ? Boolean(exactMatch) : internalExactMatch;

    // Search functionality
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsSearchLoading(false);
            return;
        }

        // Don't make API call if the query is the same as the last one
        const searchKey = `${query}::${exactSearch ? 'exact' : 'contains'}`;
        if (lastSearchTermRef.current === searchKey) {
            return;
        }
        lastSearchTermRef.current = searchKey;

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
                    matchesSearchText(surah.name_latin, query, exactSearch) ||
                    matchesSearchText(surah.name_indonesian, query, exactSearch) ||
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

            // Map common aliases for API search (e.g. Ayat Kursi, Jodoh, Taubat, Sholat)
            let apiQuery = query;
            const normalized = query.toLowerCase().trim();
            if (/^ayat\s+kursi$/i.test(normalized)) {
                apiQuery = 'kursi';
            } else if (/^jodoh$/i.test(normalized)) {
                apiQuery = 'pasangan';
            } else if (/^taubat$/i.test(normalized)) {
                apiQuery = 'tobat';
            } else if (/^sholat$/i.test(normalized)) {
                apiQuery = 'salat';
            }

            // Then, fetch ayah results from API
            const searchParams = new URLSearchParams({
                q: apiQuery,
                limit: '5'
            });

            if (exactSearch) {
                searchParams.append('exact', '1');
            }

            const response = await fetchWithAuth(`/api/cari?${searchParams.toString()}`, {
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
                const rawAyahResults = Array.isArray(data.data) ? data.data : [];
                const ayahResults = exactSearch
                    ? rawAyahResults.filter(ayah => matchesSearchText(ayah.text_indonesian, query, true))
                    : rawAyahResults;
                
                if (!Array.isArray(ayahResults) || ayahResults.length === 0) {
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
                    
                    const highlightedText = buildHighlightedParts(ayahData.text_indonesian, query, exactSearch);
                    
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
    }, [surahs, exactSearch]); // Depend on surahs and exact mode, which should be stable from parent component

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
        }, 1000); // 1-second debounce delay for on-type search before sending to backend
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
            const qParam = `q=${encodeURIComponent(query)}`;
            const extraParam = exactSearch ? '&exact=1' : '';
            navigate(`/cari?${qParam}${extraParam}`);
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

    const handleExactMatchChange = (event) => {
        const checked = Boolean(event.target.checked);

        if (isExactMatchControlled) {
            if (onExactMatchChange && typeof onExactMatchChange === 'function') {
                onExactMatchChange(checked);
            }
        } else {
            setInternalExactMatch(checked);
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
        const qParam = `q=${encodeURIComponent(searchTerm)}`;
        const extraParam = exactSearch ? '&exact=1' : '';
        navigate(`/cari?${qParam}${extraParam}`);
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
        if (onClear && typeof onClear === 'function') {
            onClear();
        }
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
        <div className={`relative w-full ${className} ${showSuggestions && searchTerm.length >= 2 ? 'z-40' : ''}`}>
            <form onSubmit={handleSearchSubmit} method="GET" className="flex flex-col">
                {showExactSearchToggle && (
                    <div className="mb-2.5 flex items-center relative z-20">
                        <div className="relative group/exact inline-flex items-center">
                            <label 
                                className={`inline-flex items-center gap-1.5 rounded-full border border-${currentTheme.primaryBorder} bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50 transition-colors select-none`}
                            >
                                <input
                                    type="checkbox"
                                    checked={exactSearch}
                                    onChange={handleExactMatchChange}
                                    className={`h-3.5 w-3.5 rounded border-${currentTheme.primaryBorder} text-emerald-600 focus:ring-emerald-500 cursor-pointer`}
                                />
                                <span>Pencarian persis</span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-3.5 w-3.5 text-gray-400 group-hover/exact:text-emerald-600 transition-colors" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </label>

                            {/* Floating hover message / tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900/95 text-white text-xs rounded-xl shadow-xl backdrop-blur-xs border border-gray-800/80 opacity-0 pointer-events-none group-hover/exact:opacity-100 group-focus-within/exact:opacity-100 transition-all duration-200 z-50 transform origin-top -translate-y-1 group-hover/exact:translate-y-0">
                                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Mode Pencarian Persis
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    Hanya menampilkan ayat dengan <strong className="text-white">urutan kata yang sama persis</strong>.
                                </p>
                                <div className="mt-1.5 pt-1.5 border-t border-gray-800 text-[11px] text-gray-400">
                                    Misal: <span className="text-emerald-300 font-mono">"maha sempurna"</span> hanya cocok dengan frasa utuh berurutan, bukan kata terpisah.
                                </div>
                                {/* Tooltip Arrow */}
                                <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-800" />
                            </div>
                        </div>
                    </div>
                )}

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
                            className="absolute left-0 right-0 mt-2 w-full bg-white rounded-xl shadow-2xl max-h-[30rem] overflow-y-auto border border-emerald-200/90 z-50"
                            ref={suggestionsRef}
                            style={{ zIndex: 9999 }}
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
