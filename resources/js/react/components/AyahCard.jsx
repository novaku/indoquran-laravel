import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoBookmarkOutline, IoShareSocialOutline } from 'react-icons/io5';
import { getRoutePath } from '../utils/routes';

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
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 mb-4 border border-green-100">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {ayah.ayah_number}
                    </div>
                    <Link 
                        to={getRoutePath(`/surah/${ayah.surah_number}/${ayah.ayah_number}`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                    >
                        {surah ? `${surah.name_indonesian} (${surah.name_latin})` : `Surah ${ayah.surah_number}`}
                    </Link>
                </div>
                <button 
                    onClick={handlePlayAudio}
                    className={`p-2 rounded-full hover:shadow-md transition-all duration-300 ${isPlaying ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                    {isPlaying ? (
                        <IoPauseCircleOutline className="text-xl" />
                    ) : (
                        <IoPlayCircleOutline className="text-xl" />
                    )}
                </button>
            </div>
            
            {/* Arabic Text */}
            <div className="bg-green-50 rounded-2xl p-6 mb-4 text-center">
                <p 
                    className="font-arabic text-green-800 leading-loose"
                    style={{ 
                        fontSize: '4rem',
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
                <p className="text-gray-700 text-lg leading-relaxed">
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
            
            <div className="mt-4 pt-3 flex justify-between text-sm text-green-600">
                <span>Juz {ayah.juz || '-'} • Halaman {ayah.page || '-'}</span>
                <Link 
                    to={getRoutePath(`/surah/${ayah.surah_number}/${ayah.ayah_number}`)}
                    className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:shadow-sm transition-all duration-300 px-3 py-1.5 rounded bg-green-50 border border-green-100"
                >
                    <span>Detail</span>
                </Link>
            </div>
        </div>
    );
}

export default AyahCard;
