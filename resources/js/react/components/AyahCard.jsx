import React, { useEffect, useState } from 'react';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoBookmarkOutline, IoShareSocialOutline, IoAddOutline, IoRemoveOutline, IoReloadOutline } from 'react-icons/io5';

function AyahCard({ ayah, surah, playAudio, isPlaying, activeAyah, highlightText = null }) {
    
    // Arabic text zoom state
    const [arabicFontSize, setArabicFontSize] = useState(3); // Default size in rem (3xl = 3rem)
    
    // Arabic text zoom functions
    const handleZoomIn = () => {
        setArabicFontSize(prev => Math.min(prev + 0.5, 6)); // Max 6rem
    };

    const handleZoomOut = () => {
        setArabicFontSize(prev => Math.max(prev - 0.5, 1.5)); // Min 1.5rem
    };

    const resetZoom = () => {
        setArabicFontSize(3); // Reset to default 3rem
    };

    // Get dynamic font size class
    const getArabicFontSizeStyle = () => {
        return {
            fontSize: `${arabicFontSize}rem`
        };
    };
    
    // Highlight search terms in HTML if provided
    const highlightMatches = (htmlText) => {
        if (!highlightText || !htmlText) return htmlText;
        
        try {
            // Create a temporary DOM element to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            
            // Function to process a node and its children
            const processNode = (node) => {
                // Skip if not a text node
                if (node.nodeType !== Node.TEXT_NODE) {
                    // Process children of non-text nodes
                    if (node.childNodes.length > 0) {
                        Array.from(node.childNodes).forEach(childNode => {
                            processNode(childNode);
                        });
                    }
                    return;
                }
                
                // Process text node
                const text = node.textContent;
                const regex = new RegExp(`(${highlightText})`, 'gi');
                
                if (regex.test(text)) {
                    const highlightedText = text.replace(regex, '<mark class="bg-accent-100 text-accent-800 px-1 rounded">$1</mark>');
                    
                    // Create a temporary element to hold the highlighted HTML
                    const fragment = document.createDocumentFragment();
                    const div = document.createElement('div');
                    div.innerHTML = highlightedText;
                    
                    while (div.firstChild) {
                        fragment.appendChild(div.firstChild);
                    }
                    
                    // Replace the original text node with the highlighted fragment
                    node.parentNode.replaceChild(fragment, node);
                }
            };
            
            // Process all nodes in the temporary div
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

    // Define the handlePlayAudio function
    const handlePlayAudio = () => {
        if (playAudio) {
            playAudio(ayah);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 mb-6 border border-green-100">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                        {ayah.ayah_number}
                    </div>
                    <a 
                        href={`/surah/${ayah.surah_number}/${ayah.ayah_number}`}
                        className="text-green-700 hover:text-green-800 font-semibold text-lg transition-colors duration-200"
                    >
                        {(surah || ayah.surah) ? (
                            `Surah ${(surah || ayah.surah).name_latin} (${ayah.surah_number}):${ayah.ayah_number}`
                        ) : (
                            `Surah ${ayah.surah_number}:${ayah.ayah_number}`
                        )}
                    </a>
                </div>
                <button 
                    onClick={handlePlayAudio}
                    className={`p-3 rounded-full hover:shadow-lg transition-all duration-300 ${
                        isPlaying 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    } text-white shadow-md`}
                    title={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        {isPlaying ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        )}
                    </svg>
                </button>
            </div>
            
            {/* Arabic Text Section */}
            <div className="text-right leading-relaxed font-arabic mb-6 text-green-800 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6 relative">
                {/* Arabic Text Zoom Controls */}
                <div className="absolute top-3 left-3 flex gap-1">
                    <button 
                        onClick={handleZoomOut} 
                        disabled={arabicFontSize <= 1.5}
                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title="Perkecil teks Arab"
                    >
                        <IoRemoveOutline className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={resetZoom}
                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium shadow-sm"
                        title="Reset ukuran teks Arab"
                    >
                        <IoReloadOutline className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleZoomIn} 
                        disabled={arabicFontSize >= 6}
                        className="p-1.5 rounded-md bg-white/80 border border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title="Perbesar teks Arab"
                    >
                        <IoAddOutline className="w-4 h-4" />
                    </button>
                </div>
                <div 
                    className="font-arabic text-right leading-loose pt-8" 
                    style={getArabicFontSizeStyle()}
                    dir="rtl"
                >
                    {ayah.text_arabic}
                </div>
            </div>
            
            {/* Indonesian Translation */}
            <div className="text-green-700 leading-relaxed mb-4 p-4 bg-green-50/70 rounded-xl border border-green-100">
                <div className="text-sm font-medium text-green-800 mb-2">Terjemahan Indonesia:</div>
                {highlightText ? (
                    <div className="text-lg" dangerouslySetInnerHTML={{ 
                        __html: highlightMatches(ayah.text_indonesian) 
                    }} />
                ) : (
                    <div className="text-lg" dangerouslySetInnerHTML={{ 
                        __html: ayah.text_indonesian 
                    }} />
                )}
            </div>
            
            {/* Transliteration */}
            {ayah.text_latin && (
                <div className="mb-4 p-4 bg-green-50/70 rounded-xl border border-green-100">
                    <div className="text-sm font-medium text-green-800 mb-2">Transliterasi:</div>
                    <p className="text-green-700 italic text-lg">
                        {ayah.text_latin}
                    </p>
                </div>
            )}
            
            {/* Footer Section */}
            <div className="mt-6 pt-4 flex justify-between items-center text-sm text-green-600 border-t border-green-100">
                <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        Juz {ayah.juz || '-'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        Halaman {ayah.page || '-'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            const message = `🕌 *${surah ? surah.name_indonesian : `Surah ${ayah.surah_number}`}* - Ayat ${ayah.ayah_number}\n\n🔤 *Arab:*\n${ayah.text_arabic}\n\n🇮🇩 *Terjemahan Indonesia:*\n${ayah.text_indonesian || ayah.translation_id}\n\n🔗 Baca selengkapnya: ${window.location.origin}/surah/${ayah.surah_number}/${ayah.ayah_number}\n\n📱 Dibagikan dari IndoQuran`;
                            const encodedMessage = encodeURIComponent(message);
                            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
                            window.open(whatsappUrl, '_blank');
                        }}
                        className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded-lg bg-green-50/70 hover:bg-green-100 border border-green-200"
                        title="Bagikan ke WhatsApp"
                    >
                        <IoShareSocialOutline className="text-lg" />
                        <span>Bagikan</span>
                    </button>
                    <a 
                        href={`/surah/${ayah.surah_number}/${ayah.ayah_number}`}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded-lg bg-green-50/70 hover:bg-green-100 border border-green-200 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lihat Detail
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AyahCard;
