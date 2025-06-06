import React from 'react';
import { Link } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoBookmarkOutline, IoHeartOutline, IoHeart, IoBookmark, IoShareSocialOutline } from 'react-icons/io5';

/**
 * AyahCard Component
 * Reusable component to display an Ayah with various display options and interactions
 * @param {Object} props
 * @param {Object} props.ayah - The ayah data object
 * @param {Object} props.surah - Optional surah data object
 * @param {Function} props.playAudio - Function to handle audio playback
 * @param {boolean} props.isPlaying - Whether this ayah is currently playing audio
 * @param {number} props.activeAyah - ID of the currently playing ayah
 * @param {string} props.highlightText - Optional text to highlight in the translation
 * @param {boolean} props.showBookmarkControls - Whether to show bookmark and favorite controls
 * @param {boolean} props.isBookmarked - Whether the ayah is bookmarked by the user
 * @param {boolean} props.isFavorite - Whether the ayah is favorited by the user
 * @param {Function} props.onBookmarkToggle - Function to handle bookmark toggle
 * @param {Function} props.onFavoriteToggle - Function to handle favorite toggle
 * @param {boolean} props.showDetailLink - Whether to show the detail link
 * @param {string} props.variant - Display variant ('compact' | 'full')
 */
function AyahCard({ 
    ayah, 
    surah, 
    playAudio, 
    isPlaying, 
    activeAyah,
    highlightText = null,
    showBookmarkControls = false,
    isBookmarked = false,
    isFavorite = false,
    onBookmarkToggle,
    onFavoriteToggle,
    showDetailLink = true,
    variant = 'full' 
}) {
    // Highlight search terms in HTML if provided
    const highlightMatches = (htmlText) => {
        if (!highlightText || !htmlText) return htmlText;
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            
            // Generate related terms based on common Islamic terminology patterns
            const generateRelatedTerms = (term) => {
                const relatedTerms = [term];
                const lowerTerm = term.toLowerCase();
                
                // Map of common surah names to their numbers
                const commonSurahs = {
                    'alfatihah': 1, 'fatihah': 1, 'fatiha': 1, 'pembukaan': 1,
                    'albaqarah': 2, 'baqarah': 2, 'sapi': 2, 'sapibetina': 2,
                    'aliimran': 3, 'imran': 3, 'keluargaimran': 3,
                    'annisa': 4, 'nisa': 4, 'wanita': 4,
                    'almaidah': 5, 'maidah': 5, 'hidangan': 5,
                    'alanam': 6, 'anam': 6, 'binatang': 6,
                    'alaraf': 7, 'araf': 7, 'tempat': 7,
                    'alanfal': 8, 'anfal': 8, 'rampasan': 8,
                    'attaubah': 9, 'taubah': 9, 'pengampunan': 9,
                    'yunus': 10, 'hud': 11, 'yusuf': 12,
                    'arraad': 13, 'raad': 13, 'guruh': 13, 'guntur': 13,
                    'yaseen': 36, 'yasin': 36,
                    'arrahman': 55, 'rahman': 55, 
                    'alwaqiah': 56, 'waqiah': 56,
                    'alhadid': 57, 'hadid': 57, 'besi': 57,
                    'alikhlas': 112, 'ikhlas': 112,
                    'alfalaq': 113, 'falaq': 113, 'waktusubuh': 113,
                    'annas': 114, 'nas': 114, 'manusia': 114
                };
                
                // Check for surah name references
                if (commonSurahs[lowerTerm.replace(/[-\s]/g, '')]) {
                    const surahNum = commonSurahs[lowerTerm.replace(/[-\s]/g, '')];
                    relatedTerms.push(`surah ${surahNum}`);
                }
                
                // Check for surah number references (e.g., "surah 1", "surat 2", etc.)
                const surahNumberMatch = lowerTerm.match(/^surah\s*(\d+)$/) || 
                                         lowerTerm.match(/^surat\s*(\d+)$/);
                if (surahNumberMatch && surahNumberMatch[1]) {
                    const surahNum = parseInt(surahNumberMatch[1]);
                    if (surahNum >= 1 && surahNum <= 114) {
                        // Add both number and spelled out versions
                        relatedTerms.push(`surah ${surahNum}`);
                        relatedTerms.push(`surat ${surahNum}`);
                    }
                }
                
                // Check for just the number (1-114) as a potential direct surah reference
                const directNumberMatch = /^(\d+)$/.exec(lowerTerm);
                if (directNumberMatch) {
                    const surahNum = parseInt(directNumberMatch[1]);
                    if (surahNum >= 1 && surahNum <= 114) {
                        // Add surah reference with the number
                        relatedTerms.push(`surah ${surahNum}`);
                    }
                }
                
                // Only process terms that are at least 3 characters
                if (lowerTerm.length < 3) return relatedTerms;
                
                // Common Islamic terms with variations
                const commonPrefixes = ['al-', 'as-', 'ar-', 'an-', 'ad-'];
                const commonSuffixes = ['ah', 'at', 'in', 'un', 'een', 'oon', 'iyyah', 'iyah'];
                
                // Check if term might be an Islamic term with prefix
                for (const prefix of commonPrefixes) {
                    if (lowerTerm.startsWith(prefix)) {
                        // Add version without prefix
                        relatedTerms.push(lowerTerm.substring(prefix.length));
                    } else if (lowerTerm.length > prefix.length) {
                        // Add version with prefix
                        relatedTerms.push(prefix + lowerTerm);
                    }
                }
                
                // Check for common suffix variations
                for (const suffix of commonSuffixes) {
                    if (lowerTerm.endsWith(suffix) && lowerTerm.length > suffix.length) {
                        // Add version without suffix
                        relatedTerms.push(lowerTerm.substring(0, lowerTerm.length - suffix.length));
                    }
                }
                
                // Add common pluralization patterns for Indonesian
                if (lowerTerm.includes('-')) {
                    // Handle reduplicated words (e.g., "langit-langit")
                    const parts = lowerTerm.split('-');
                    if (parts.length === 2 && parts[0] === parts[1]) {
                        relatedTerms.push(parts[0]); // Add singular form
                    }
                }
                
                // Handle common Indonesian affixes
                const prefixes = ['me', 'pe', 'ber', 'di', 'ter', 'se'];
                const suffixes = ['kan', 'an', 'i', 'nya'];
                
                // Try removing common prefixes
                for (const prefix of prefixes) {
                    if (lowerTerm.startsWith(prefix) && lowerTerm.length > prefix.length + 2) {
                        relatedTerms.push(lowerTerm.substring(prefix.length));
                    }
                }
                
                // Try removing common suffixes
                for (const suffix of suffixes) {
                    if (lowerTerm.endsWith(suffix) && lowerTerm.length > suffix.length + 2) {
                        relatedTerms.push(lowerTerm.substring(0, lowerTerm.length - suffix.length));
                    }
                }
                
                return [...new Set(relatedTerms)]; // Remove duplicates
            };
            
            const processNode = (node) => {
                if (node.nodeType !== Node.TEXT_NODE) {
                    if (node.childNodes.length > 0) {
                        Array.from(node.childNodes).forEach(childNode => {
                            processNode(childNode);
                        });
                    }
                    return;
                }
                
                const text = node.textContent;
                
                // Split search terms by spaces to highlight each word
                const searchTerms = highlightText.split(/\s+/).filter(term => term.length > 1);
                
                // Generate related terms for each search term
                const allTermsToHighlight = [];
                for (const term of searchTerms) {
                    const relatedTerms = generateRelatedTerms(term);
                    allTermsToHighlight.push(...relatedTerms);
                }
                
                // Escape special characters for regex
                const escapeRegExp = (string) => {
                    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                };
                
                // Create regex pattern with all terms
                const escapedTerms = allTermsToHighlight
                    .map(term => escapeRegExp(term))
                    .filter(term => term.length > 1) // Avoid very short terms
                    .join('|');
                
                if (!escapedTerms) return; // Skip if no valid terms to highlight
                
                const regex = new RegExp(`(${escapedTerms})`, 'gi');
                
                if (regex.test(text)) {
                    const highlightedText = text.replace(
                        regex, 
                        '<mark class="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium mx-0.5" title="Kata kunci pencarian">$1</mark>'
                    );
                    
                    const fragment = document.createDocumentFragment();
                    const div = document.createElement('div');
                    div.innerHTML = highlightedText;
                    
                    while (div.firstChild) {
                        fragment.appendChild(div.firstChild);
                    }
                    
                    node.parentNode.replaceChild(fragment, node);
                }
            };
            
            Array.from(tempDiv.childNodes).forEach(node => {
                processNode(node);
            });
            
            return tempDiv.innerHTML;
        } catch (error) {
            console.error("Error highlighting text:", error);
            return htmlText;
        }
    };

    if (!ayah) return null;

    const handlePlayAudio = () => {
        if (playAudio) {
            playAudio(ayah);
        }
    };

    const handleShareWhatsApp = () => {
        // Create a more robust surah name that handles various states of the surah object
        let surahName = `Surah ${ayah.surah_number}`;
        if (surah) {
            if (surah.name_indonesian && surah.name_latin) {
                surahName = `Surah ${ayah.surah_number}. ${surah.name_indonesian} (${surah.name_latin})`;
            } else if (surah.name_latin) {
                surahName = `Surah ${ayah.surah_number}. ${surah.name_latin}`;
            } else if (surah.name_indonesian) {
                surahName = `Surah ${ayah.surah_number}. ${surah.name_indonesian}`;
            }
        }
        
        const ayahText = ayah.text_indonesian.replace(/<[^>]*>/g, ''); // Remove any HTML tags
        const shareText = `"${ayah.text_arabic}"\n\n${ayahText}\n\n- ${surahName}, Ayat ${ayah.ayah_number}`;
        const encodedText = encodeURIComponent(shareText);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 mb-4">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {ayah.ayah_number}
                    </div>
                    <Link 
                        to={`/surah/${ayah.surah_number}/${ayah.ayah_number}`}
                        className="text-green-600 hover:text-green-800 font-medium"
                    >
                        {surah && surah.name_indonesian && surah.name_latin 
                            ? `Surah ${ayah.surah_number}. ${surah.name_indonesian} (${surah.name_latin})` 
                            : surah && surah.name_latin 
                                ? `Surah ${ayah.surah_number}. ${surah.name_latin}` 
                                : `Surah ${ayah.surah_number}`}
                    </Link>
                </div>
                
                {/* Audio Control */}
                <div className="flex gap-2">
                    {showBookmarkControls && (
                        <>
                            <button 
                                onClick={() => onBookmarkToggle?.(ayah.id)}
                                className="p-2 rounded-full hover:shadow-sm transition-all duration-300 text-green-600 hover:text-green-700"
                                title={isBookmarked ? "Hapus dari bookmark" : "Tambah ke bookmark"}
                            >
                                {isBookmarked ? <IoBookmark /> : <IoBookmarkOutline />}
                            </button>
                            <button 
                                onClick={() => onFavoriteToggle?.(ayah.id)}
                                className="p-2 rounded-full hover:shadow-sm transition-all duration-300 text-red-600 hover:text-red-700"
                                title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                            >
                                {isFavorite ? <IoHeart /> : <IoHeartOutline />}
                            </button>
                        </>
                    )}
                    <button 
                        onClick={handlePlayAudio}
                        className={`p-2 rounded-full hover:shadow-sm transition-all duration-300 ${
                            isPlaying && activeAyah === ayah.id 
                                ? 'bg-green-600/90 hover:bg-green-700/90' 
                                : 'bg-green-500/90 hover:bg-green-600/90'
                        } text-white`}
                        title={isPlaying && activeAyah === ayah.id ? "Jeda" : "Putar"}
                    >
                        {isPlaying && activeAyah === ayah.id ? (
                            <IoPauseCircleOutline className="text-xl" />
                        ) : (
                            <IoPlayCircleOutline className="text-xl" />
                        )}
                    </button>
                </div>
            </div>
            
            {/* Arabic Text */}
            <div className="bg-green-50/70 rounded-2xl p-6 mb-4 text-center">
                <p 
                    className="font-arabic text-green-800 leading-loose"
                    style={{ 
                        fontSize: variant === 'compact' ? '3rem' : '4rem',
                        lineHeight: '2'
                    }}
                    dir="rtl"
                >
                    {ayah.text_arabic}
                </p>
            </div>
            
            {/* Transliteration */}
            {ayah.text_latin && (
                <div className="text-center mb-3">
                    <p className="text-gray-600 italic text-sm">
                        {ayah.text_latin}
                    </p>
                </div>
            )}
            
            {/* Indonesian Translation */}
            <div className="text-center mb-4">
                <p className={`text-gray-700 ${variant === 'compact' ? 'text-base' : 'text-lg'} leading-relaxed`}>
                    {highlightText ? (
                        <div className="translation-html" dangerouslySetInnerHTML={{ 
                            __html: highlightMatches(ayah.text_indonesian) 
                        }} />
                    ) : (
                        <div className="translation-html" dangerouslySetInnerHTML={{ 
                            __html: ayah.text_indonesian 
                        }} />
                    )}
                </p>
            </div>
            
            {/* Footer Section */}
            <div className="mt-4 pt-3 flex justify-between text-sm text-green-600">
                <span>Juz {ayah.juz || '-'} • Halaman {ayah.page || '-'}</span>
                <button 
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded bg-green-50/70"
                >
                    <IoShareSocialOutline className="text-lg" />
                    <span>Bagikan</span>
                </button>
            </div>
        </div>
    );
}

export default AyahCard;
