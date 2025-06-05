import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuranHeader from '../components/QuranHeader';
import PrayerTimesWidget from '../components/PrayerTimesWidget';

function HomePage() {
    const [surahs, setSurahs] = useState([]);
    const [filteredSurahs, setFilteredSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);
    
    useEffect(() => {
        fetch('/api/surahs')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch surahs');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
                    setFilteredSurahs(response.data);
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

    // Search functionality
    useEffect(() => {
        if (!searchTerm) {
            setFilteredSurahs(surahs);
        } else {
            const filtered = surahs.filter(surah => 
                surah.name_latin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                surah.name_indonesian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                surah.name_arabic.includes(searchTerm) ||
                surah.number.toString().includes(searchTerm)
            );
            setFilteredSurahs(filtered);
        }
    }, [searchTerm, surahs]);

    // Modal handlers
    const handleSurahClick = (surah, event) => {
        event.preventDefault();
        setSelectedSurah(surah);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSurah(null);
    };
    
    // Handle keyboard navigation for autocomplete suggestions
    const handleKeyDown = (e) => {
        // Only handle keyboard navigation when suggestions are shown
        if (!showSuggestions || suggestions.length === 0) {
            return;
        }

        // Arrow down
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prevIndex => 
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
        } 
        // Arrow up
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prevIndex => 
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
        } 
        // Enter key
        else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            const suggestion = suggestions[highlightedIndex];
            
            // Only ayah suggestions remain, but still validate
            if (suggestion.type === 'ayah' && suggestion.ayah) {
                handleSuggestionClick(suggestion);
            }
        }
        // Escape key
        else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        }
    };

    // Scroll highlighted suggestion into view
    useEffect(() => {
        if (highlightedIndex >= 0 && suggestionsRef.current) {
            const highlightedElement = suggestionsRef.current.querySelector(`li:nth-child(${highlightedIndex + 1})`);
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    // Reset highlighted index when suggestions change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [suggestions]);

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

    // Fetch autocomplete suggestions
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            
            const data = await response.json();
            if (data.status === 'success') {
                // Get unique surah suggestions
                const ayahResults = Array.isArray(data.data) ? data.data : [];
                
                // Validate the API response
                if (!Array.isArray(ayahResults)) {
                    console.error('Unexpected API response format:', data);
                    setSuggestions([]);
                    return;
                }
                
                // We're removing surah suggestions as requested
                // Only add ayah text matches
                const textSuggestions = ayahResults.map(ayah => {
                    // Make sure the ayah object has the required properties
                    if (!ayah || typeof ayah !== 'object') {
                        console.error('Invalid ayah data:', ayah);
                        return null;
                    }
                    
                    // Ensure we have all required properties, using consistent naming
                    const ayahData = {
                        ...ayah,
                        surah_number: ayah.surah_number || null,
                        number: ayah.number || ayah.ayah_number || null,
                        text_indonesian: ayah.text_indonesian || ''
                    };
                    
                    // Skip invalid ayahs
                    if (!ayahData.surah_number || !ayahData.number) {
                        return null;
                    }
                    
                    // Highlight the matching text if possible
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
                    
                    return {
                        type: 'ayah',
                        ayah: ayahData,
                        surahName: surahs.find(s => s.number === ayahData.surah_number)?.name_latin || `Surah ${ayahData.surah_number}`,
                        text: ayahData.text_indonesian,
                        highlightedText: highlightedText
                    };
                })
                .filter(Boolean) // Remove any null entries
                .slice(0, 5); // Allow for more text suggestions since we removed surah suggestions
                
                // Only include text suggestions (ayah matches)
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
    }, [searchTerm]);
    
    const handleSearchFocus = () => {
        if (searchTerm && searchTerm.length >= 2) {
            setShowSuggestions(true);
        }
    };
    
    const navigate = useNavigate(); // Add React Router's navigate hook
    
    const handleSuggestionClick = (suggestion) => {
        // We only have ayah suggestions now
        if (suggestion.type === 'ayah' && suggestion.ayah) {
            // Extract the ayah data with proper checks
            const surah_number = suggestion.ayah.surah_number;
            const ayah_number = suggestion.ayah.number || suggestion.ayah.ayah_number;
            
            // Validate that we have all the necessary data before navigating
            if (surah_number && ayah_number) {
                navigate(`/ayah/${surah_number}/${ayah_number}`);
            } else {
                console.error('Invalid ayah data for navigation:', suggestion.ayah);
            }
        } else {
            console.error('Invalid suggestion data:', suggestion);
        }
        setShowSuggestions(false);
    };
    
    // Function to handle "View All Results" button click
    const handleViewAllResults = () => {
        // Navigate to the search page with the current search term
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setShowSuggestions(false);
    };

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
        <div>
            <QuranHeader className="mb-10" />
            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-islamic-green/40 to-transparent mx-auto mb-8"></div>
            
            {/* Prayer Times Widget and Search */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <PrayerTimesWidget />
                </div>
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
                        <h2 className="text-lg font-semibold text-islamic-green mb-4">Cari Ayat Al-Quran</h2>
                        <div className="relative" ref={searchRef}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Cari berdasarkan isi ayat..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (e.target.value.length >= 2) {
                                        setShowSuggestions(true);
                                    } else {
                                        setShowSuggestions(false);
                                    }
                                }}
                                onFocus={handleSearchFocus}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-transparent"
                            />
                            
                            {/* Autocomplete Suggestions */}
                            {showSuggestions && searchTerm.length >= 2 && (
                                <div 
                                    className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-80 overflow-y-auto border border-gray-200"
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
                                                    onClick={() => handleSuggestionClick(suggestion)}
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
                                    
                                    {/* View All Results Button - shown when there are results */}
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
                        
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Total: {filteredSurahs.length} surah {searchTerm && `(hasil pencarian untuk "${searchTerm}")`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurahs.map(surah => (
                    <div 
                        key={surah.number}
                        onClick={(e) => handleSurahClick(surah, e)}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
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
                            <div className="flex justify-end">
                                <Link 
                                    to={`/surah/${surah.number}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-islamic-green hover:text-islamic-green/80 text-sm font-medium transition-colors"
                                >
                                    Lihat Surah →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && selectedSurah && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 flex items-center justify-center bg-islamic-green rounded-full mr-4">
                                        <span className="text-xl font-bold text-white">{selectedSurah.number}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-islamic-green">{selectedSurah.name_latin}</h2>
                                        <p className="text-islamic-brown">{selectedSurah.name_indonesian || selectedSurah.name_latin}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl text-islamic-green font-arabic">{selectedSurah.name_arabic}</span>
                                    <button 
                                        onClick={handleCloseModal}
                                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className={`px-3 py-1 rounded-md text-sm ${selectedSurah.revelation_place === 'Meccan' ? 'bg-green-50 text-islamic-green' : 'bg-blue-50 text-blue-700'}`}>
                                        {selectedSurah.revelation_place}
                                    </span>
                                    <span className="text-islamic-brown">{selectedSurah.total_ayahs} ayat</span>
                                </div>
                            </div>

                            {selectedSurah.description_short && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Ringkasan</h3>
                                    <div 
                                        className="text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-700 prose-p:my-2 prose-ul:ml-4 prose-li:my-1 prose-a:text-islamic-green"
                                        dangerouslySetInnerHTML={{ __html: selectedSurah.description_short }}
                                    />
                                </div>
                            )}

                            {selectedSurah.description_long && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Deskripsi</h3>
                                    <div 
                                        className="text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-700 prose-p:my-2 prose-ul:ml-4 prose-li:my-1 prose-a:text-islamic-green max-h-60 overflow-y-auto pr-2 scroll-smooth"
                                        dangerouslySetInnerHTML={{ __html: selectedSurah.description_long }}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Tutup
                                </button>
                                <Link 
                                    to={`/surah/${selectedSurah.number}`}
                                    className="px-6 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors"
                                >
                                    Lihat Surah
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prayer Times Widget */}
            <div className="mt-10">
                <PrayerTimesWidget />
            </div>
        </div>
    );
}

export default HomePage;
