import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';

function Navbar({ onBreadcrumbsChange }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [surahName, setSurahName] = useState('');
    

    
    // Search functionality states
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [surahs, setSurahs] = useState([]);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
     // Generate breadcrumbs based on current location
    useEffect(() => {
        const generateBreadcrumbs = async () => {
            const pathSegments = location.pathname.split('/').filter(segment => segment);
            let breadcrumbItems = [{ name: 'Beranda', path: '/' }];
            
            if (pathSegments.length > 0) {
                // Handle different routes
                if (pathSegments[0] === 'surah' && pathSegments[1]) {
                    // Fetch surah name
                    try {
                        const response = await fetchWithAuth(`/api/surahs/${pathSegments[1]}`);
                        const data = await response.json();
                        if (data.status === 'success') {
                            const surahName = data.data.surah.name_latin || `Surah ${pathSegments[1]}`;
                            setSurahName(surahName);
                            breadcrumbItems.push({
                                name: surahName,
                                path: `/surah/${pathSegments[1]}`
                            });
                            
                            // Add ayah breadcrumb if present in URL
                            if (pathSegments[2]) {
                                breadcrumbItems.push({
                                    name: `Ayat ${pathSegments[2]}`,
                                    path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                                });
                            }
                        }
                    } catch (error) {
                        breadcrumbItems.push({
                            name: `Surah ${pathSegments[1]}`,
                            path: `/surah/${pathSegments[1]}`
                        });
                        if (pathSegments[2]) {
                            breadcrumbItems.push({
                                name: `Ayat ${pathSegments[2]}`,
                                path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                            });
                        }
                    }
                } else if (pathSegments[0] === 'search') {
                    breadcrumbItems.push({
                        name: 'Pencarian',
                        path: '/search'
                    });
                } else if (pathSegments[0] === 'bookmarks') {
                    breadcrumbItems.push({
                        name: 'Bookmark',
                        path: '/bookmarks'
                    });
                } else if (pathSegments[0] === 'profile') {
                    breadcrumbItems.push({
                        name: 'Profil',
                        path: '/profile'
                    });
                } else if (pathSegments[0] === 'auth') {
                    breadcrumbItems.push({
                        name: pathSegments[1] === 'login' ? 'Masuk' : 'Daftar',
                        path: `/auth/${pathSegments[1]}`
                    });
                }
            }
            
            setBreadcrumbs(breadcrumbItems);
            
            // Pass breadcrumb data to parent component
            if (onBreadcrumbsChange) {
                onBreadcrumbsChange(breadcrumbItems);
            }
        };
        
        generateBreadcrumbs();
    }, [location.pathname, onBreadcrumbsChange]);

    // Load surahs for search autocomplete
    useEffect(() => {
        fetchWithAuth('/api/surahs')
            .then(response => response.json())
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
                }
            })
            .catch(error => {
                // Error loading surahs
            });
    }, []);

    // Search functionality
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetchWithAuth(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
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
                        console.warn(`⚠️ Navbar - Invalid ayah object at index ${index}:`, ayah);
                        return null;
                    }
                    
                    const ayahData = {
                        ...ayah,
                        surah_number: ayah.surah_number || null,
                        number: ayah.number || ayah.ayah_number || null,
                        text_indonesian: ayah.text_indonesian || ''
                    };
                    
                    if (!ayahData.surah_number || !ayahData.number) {
                        console.warn(`❌ Navbar - Missing required fields for ayah ${index + 1}:`, {
                            surah_number: ayahData.surah_number,
                            number: ayahData.number
                        });
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
            console.error('❌ Navbar - Error fetching suggestions:', error);
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
            } else {
                console.error('❌ Navbar - Invalid suggestion for keyboard navigation:', suggestion);
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
            } else {
                console.error('❌ Navbar - Missing required navigation data:', {
                    surah_number,
                    ayah_number,
                    suggestion_ayah: suggestion.ayah
                });
            }
        } else {
            console.error('❌ Navbar - Invalid suggestion data structure:', {
                suggestion_type: suggestion?.type,
                has_ayah: !!suggestion?.ayah,
                full_suggestion: suggestion
            });
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            // Still redirect even if logout API fails
            navigate('/auth/login');
        }
    };
    
    return (
        <>
            <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <a href="/" className="flex items-center">
                                <div className="flex items-center justify-center w-8 h-8 bg-islamic-green text-white rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-xl font-semibold text-islamic-green">indoquran.web.id</span>
                            </a>
                        </div>
                        
                        <div className="hidden md:block">
                            <form onSubmit={handleSearchSubmit} className="flex items-center">
                                <div className="relative" ref={searchRef}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        name="search"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        onFocus={handleSearchFocus}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Cari ayat Al-Quran..." 
                                        className="pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-transparent w-80"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Desktop Autocomplete Suggestions */}
                                    {showSuggestions && searchTerm.length >= 2 && (
                                        <div 
                                            className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-80 overflow-y-auto border border-gray-200"
                                            ref={suggestionsRef}
                                        >
                                            {isLoading ? (
                                                <div className="p-3 text-center text-gray-500">
                                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-islamic-green mr-2"></div>
                                                    Mencari...
                                                </div>
                                            ) : suggestions.length > 0 ? (
                                                <ul className="py-1">
                                                    {suggestions.map((suggestion, index) => (
                                                        <li 
                                                            key={`${suggestion.type}-${index}`}
                                                            onClick={() => {
                                                                handleSuggestionClick(suggestion);
                                                            }}
                                                            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                                highlightedIndex === index ? 'bg-gray-100' : ''
                                                            } hover:bg-islamic-green/5`}
                                                            onMouseEnter={() => setHighlightedIndex(index)}
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
                                                                        {typeof suggestion.highlightedText === 'object' ? (
                                                                            <span>
                                                                                "{suggestion.highlightedText.before}
                                                                                <span className="bg-yellow-100 font-medium">{suggestion.highlightedText.match}</span>
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
                                                        className="w-full py-2 px-3 bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green font-medium rounded-md transition-colors flex items-center justify-center"
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
                        
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <a 
                                        href="/bookmarks" 
                                        className="text-islamic-green hover:text-islamic-gold transition-colors"
                                        title="Bookmark & Favorit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </a>
                                    <a href="/profile" className="text-islamic-green hover:text-islamic-gold font-medium">
                                        {user.name}
                                    </a>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-islamic-green hover:text-islamic-gold cursor-pointer transition-colors"
                                    >
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="text-islamic-green hover:text-islamic-gold transition-colors opacity-50 cursor-not-allowed">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                    <a href="/auth/login" className="text-islamic-green hover:text-islamic-gold">
                                        Masuk
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-3 md:hidden">
                        <form onSubmit={handleSearchSubmit} className="flex items-center">
                            <div className="relative w-full" ref={searchRef}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <input 
                                    type="text" 
                                    name="search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={handleSearchFocus}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Cari ayat Al-Quran..." 
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}

                                {/* Mobile Autocomplete Suggestions */}
                                {showSuggestions && searchTerm.length >= 2 && (
                                    <div 
                                        className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-80 overflow-y-auto border border-gray-200"
                                        ref={suggestionsRef}
                                    >
                                        {isLoading ? (
                                            <div className="p-3 text-center text-gray-500">
                                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-islamic-green mr-2"></div>
                                                Mencari...
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            <ul className="py-1">
                                                {suggestions.map((suggestion, index) => (
                                                    <li 
                                                        key={`${suggestion.type}-${index}`}
                                                        onClick={() => {
                                                            handleSuggestionClick(suggestion);
                                                        }}
                                                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                                            highlightedIndex === index ? 'bg-gray-100' : ''
                                                        } hover:bg-islamic-green/5`}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                    >
                                                        {suggestion.ayah ? (
                                                            <div>
                                                                <div className="flex items-center text-islamic-brown text-xs mb-1">
                                                                    <span className="font-medium">{suggestion.surahName}</span>
                                                                    <span className="mx-1">•</span>
                                                                    <span>Ayat {suggestion.ayah.number || suggestion.ayah.ayah_number}</span>
                                                                    <span className="ml-auto text-xs text-islamic-green">Lihat →</span>
                                                                </div>
                                                                <p className="text-gray-700 text-xs overflow-hidden text-ellipsis" 
                                                                   style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                                                                    <span className="text-islamic-green font-medium">Terjemahan: </span>
                                                                    {typeof suggestion.highlightedText === 'object' ? (
                                                                        <span>
                                                                            "{suggestion.highlightedText.before}
                                                                            <span className="bg-yellow-100 font-medium">{suggestion.highlightedText.match}</span>
                                                                            {suggestion.highlightedText.after}"
                                                                        </span>
                                                                    ) : (
                                                                        `"${suggestion.text}"`
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 text-xs text-gray-500">
                                                                Data ayat tidak lengkap
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-4 text-center">
                                                <div className="text-gray-500 mb-2 text-sm">Tidak ada hasil yang cocok</div>
                                                <p className="text-xs text-gray-400">
                                                    Coba gunakan kata kunci lain
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* View All Results Button */}
                                        {!isLoading && suggestions.length > 0 && (
                                            <div className="p-3 border-t border-gray-100">
                                                <button
                                                    onClick={handleViewAllResults}
                                                    className="w-full py-2 px-3 bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green font-medium rounded-md transition-colors flex items-center justify-center text-sm"
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
                </div>
            </nav>


        </>
    );
}

export default Navbar;
