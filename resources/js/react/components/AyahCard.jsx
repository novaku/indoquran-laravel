import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoBookmarkOutline, IoShareSocialOutline } from 'react-icons/io5';

function AyahCard({ ayah, surah, playAudio, isPlaying, activeAyah, highlightText = null }) {
    
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
        <div className="bg-gradient-to-br from-white to-islamic-cream rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {ayah.ayah_number}
                    </div>
                    <Link 
                        to={`/ayah/${ayah.surah_number}/${ayah.ayah_number}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                        {surah ? `${surah.name_indonesian} (${surah.name_latin})` : `Surah ${ayah.surah_number}`}
                    </Link>
                </div>
                <button 
                    onClick={handlePlayAudio}
                    className={`p-2 rounded-full hover:shadow-md transition-all duration-300 ${isPlaying ? 'bg-accent-500 hover:bg-accent-600' : 'bg-primary-500 hover:bg-primary-600'} text-white`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        {isPlaying ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        )}
                    </svg>
                </button>
            </div>
            
            <div className="text-right text-3xl leading-relaxed font-arabic mb-4 text-primary-800">
                {ayah.text_arabic}
            </div>
            
            <div className="text-primary-700 leading-relaxed mb-2 translation-content">
                {highlightText ? (
                    <div className="translation-html" dangerouslySetInnerHTML={{ 
                        __html: highlightMatches(ayah.text_indonesian) 
                    }} />
                ) : (
                    <div className="translation-html" dangerouslySetInnerHTML={{ 
                        __html: ayah.text_indonesian 
                    }} />
                )}
            </div>
            
            {/* Transliteration */}
            {ayah.text_latin && (
                <div className="mb-3">
                    <p className="text-primary-600 italic text-sm">
                        {ayah.text_latin}
                    </p>
                </div>
            )}
            
            <div className="mt-4 pt-3 flex justify-between text-sm text-primary-600">
                <span>Juz {ayah.juz} • Halaman {ayah.page}</span>
                <Link 
                    to={`/ayah/${ayah.surah_number}/${ayah.ayah_number}`}
                    className="text-primary-500 hover:text-primary-700 hover:shadow-sm transition-all duration-300 px-2 py-1 rounded"
                >
                    Detail
                </Link>
            </div>
        </div>
    );
}

export default AyahCard;
