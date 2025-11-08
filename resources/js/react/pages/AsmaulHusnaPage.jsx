import React, { useState, useEffect } from 'react';
import { 
    PlayIcon, 
    PauseIcon,
    HeartIcon,
    ShareIcon,
    SpeakerWaveIcon,
    DocumentDuplicateIcon,
    BookOpenIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead, { getAsmaulHusnaSEO } from '../components/SEOHead';
import AdSenseVertical from '../components/AdSenseVertical';

// Add custom styles for Arabic calligraphy
const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    
    .arabic-calligraphy {
        font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', serif;
        font-feature-settings: 'liga' on, 'dlig' on, 'calt' on;
        text-rendering: optimizeLegibility;
        direction: rtl;
    }
    
    .arabic-calligraphy-large {
        font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', serif;
        font-feature-settings: 'liga' on, 'dlig' on, 'calt' on;
        text-rendering: optimizeLegibility;
        direction: rtl;
        font-weight: 700;
    }
`;

function AsmaulHusnaPage() {
    const [asmaulHusnaData, setAsmaulHusnaData] = useState([]);
    const [favoriteNames, setFavoriteNames] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedVerses, setExpandedVerses] = useState(new Set());

    // Fetch asmaul husna data
    useEffect(() => {
        // Inject custom styles for Arabic calligraphy
        const styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
        
        // Add structured data for SEO
        const addStructuredData = () => {
            // Add Open Graph image meta tag
            const ogImageMeta = document.createElement('meta');
            ogImageMeta.setAttribute('property', 'og:image');
            ogImageMeta.setAttribute('content', 'https://indoquran.web.id/images/asmaul-husna-cover.jpg');
            document.head.appendChild(ogImageMeta);

            const ogImageWidthMeta = document.createElement('meta');
            ogImageWidthMeta.setAttribute('property', 'og:image:width');
            ogImageWidthMeta.setAttribute('content', '1200');
            document.head.appendChild(ogImageWidthMeta);

            const ogImageHeightMeta = document.createElement('meta');
            ogImageHeightMeta.setAttribute('property', 'og:image:height');
            ogImageHeightMeta.setAttribute('content', '630');
            document.head.appendChild(ogImageHeightMeta);

            const ogImageAltMeta = document.createElement('meta');
            ogImageAltMeta.setAttribute('property', 'og:image:alt');
            ogImageAltMeta.setAttribute('content', '99 Asmaul Husna - Kaligrafi Arab Nama-nama Allah SWT');
            document.head.appendChild(ogImageAltMeta);

            // Add Twitter Card meta tags
            const twitterCardMeta = document.createElement('meta');
            twitterCardMeta.setAttribute('name', 'twitter:card');
            twitterCardMeta.setAttribute('content', 'summary_large_image');
            document.head.appendChild(twitterCardMeta);

            const twitterImageMeta = document.createElement('meta');
            twitterImageMeta.setAttribute('name', 'twitter:image');
            twitterImageMeta.setAttribute('content', 'https://indoquran.web.id/images/asmaul-husna-cover.jpg');
            document.head.appendChild(twitterImageMeta);

            // Add language and regional meta tags
            const langMeta = document.createElement('meta');
            langMeta.setAttribute('http-equiv', 'Content-Language');
            langMeta.setAttribute('content', 'id-ID');
            document.head.appendChild(langMeta);

            const regionMeta = document.createElement('meta');
            regionMeta.setAttribute('name', 'geo.region');
            regionMeta.setAttribute('content', 'ID');
            document.head.appendChild(regionMeta);

            const countryMeta = document.createElement('meta');
            countryMeta.setAttribute('name', 'geo.country');
            countryMeta.setAttribute('content', 'Indonesia');
            document.head.appendChild(countryMeta);
            
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "99 Asmaul Husna - Nama-nama Indah Allah SWT",
                "description": "Koleksi lengkap 99 Asmaul Husna dengan makna, penjelasan, audio pronunciation, dan ayat Al-Quran terkait",
                "author": {
                    "@type": "Organization",
                    "name": "IndoQuran",
                    "url": "https://indoquran.web.id"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "IndoQuran",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://indoquran.web.id/android-chrome-512x512.png",
                        "width": 512,
                        "height": 512
                    }
                },
                "datePublished": "2025-01-01T00:00:00Z",
                "dateModified": new Date().toISOString(),
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": "https://indoquran.web.id/asmaul-husna"
                },
                "image": {
                    "@type": "ImageObject",
                    "url": "https://indoquran.web.id/images/asmaul-husna-cover.jpg",
                    "width": 1200,
                    "height": 630
                },
                "articleSection": "Islamic Education",
                "keywords": "99 asmaul husna, nama allah, sifat allah, islam, spiritual",
                "about": [
                    {
                        "@type": "Thing",
                        "name": "Asmaul Husna",
                        "description": "99 nama indah Allah SWT dalam Islam"
                    },
                    {
                        "@type": "Thing", 
                        "name": "Islamic Spirituality",
                        "description": "Spiritual practices and knowledge in Islam"
                    }
                ],
                "isPartOf": {
                    "@type": "WebSite",
                    "name": "IndoQuran",
                    "url": "https://indoquran.web.id"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://indoquran.web.id/asmaul-husna?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
            
            return script;
        };

        const structuredDataScript = addStructuredData();
        
        const fetchAsmaulHusnaData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/asmaul-husna');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch asmaul husna data');
                }
                
                const data = await response.json();
                setAsmaulHusnaData(data);
                setError(null);
                
                // Update structured data with actual data
                if (data && data.length > 0) {
                    const updatedStructuredData = {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "99 Asmaul Husna - Nama-nama Indah Allah SWT",
                        "description": "Koleksi lengkap 99 Asmaul Husna dengan makna dan penjelasan",
                        "url": "https://indoquran.web.id/asmaul-husna",
                        "numberOfItems": data.length,
                        "mainEntity": {
                            "@type": "ItemList",
                            "numberOfItems": data.length,
                            "itemListElement": data.slice(0, 10).map((name, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "item": {
                                    "@type": "Thing",
                                    "name": name.latin,
                                    "description": name.meaning,
                                    "alternateName": name.arabic,
                                    "additionalProperty": {
                                        "@type": "PropertyValue",
                                        "name": "meaning",
                                        "value": name.meaning
                                    }
                                }
                            }))
                        },
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Beranda",
                                    "item": "https://indoquran.web.id"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "99 Asmaul Husna",
                                    "item": "https://indoquran.web.id/asmaul-husna"
                                }
                            ]
                        }
                    };
                    
                    // Remove previous structured data
                    if (structuredDataScript.parentNode) {
                        structuredDataScript.parentNode.removeChild(structuredDataScript);
                    }
                    
                    // Add updated structured data
                    const updatedScript = document.createElement('script');
                    updatedScript.type = 'application/ld+json';
                    updatedScript.textContent = JSON.stringify(updatedStructuredData);
                    document.head.appendChild(updatedScript);
                }
                
            } catch (err) {
                console.error('Error fetching asmaul husna data:', err);
                setError('Gagal memuat data asmaul husna');
            } finally {
                setLoading(false);
            }
        };

        fetchAsmaulHusnaData();
        
        // Cleanup function to remove styles and structured data when component unmounts
        return () => {
            if (styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            if (structuredDataScript.parentNode) {
                structuredDataScript.parentNode.removeChild(structuredDataScript);
            }
        };
    }, []);

    // Filter data berdasarkan pencarian
    const filteredNames = asmaulHusnaData.filter(name =>
        name.latin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.arabic?.includes(searchTerm)
    );

    // Toggle expand verses
    const toggleVerses = (id) => {
        const newExpanded = new Set(expandedVerses);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedVerses(newExpanded);
    };

    // Load favorit dari localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('asmaul-husna-favorites');
        if (savedFavorites) {
            setFavoriteNames(new Set(JSON.parse(savedFavorites)));
        }
    }, []);

    // Toggle favorit
    const toggleFavorite = (id) => {
        const newFavorites = new Set(favoriteNames);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavoriteNames(newFavorites);
        localStorage.setItem('asmaul-husna-favorites', JSON.stringify([...newFavorites]));
    };

    // Play audio pronunciation
    const playAudio = async (name) => {
        try {
            // Stop current audio if playing
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            setPlayingId(name.id);
            
            // Create audio using Web Speech API for Arabic pronunciation
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(name.arabic);
                utterance.lang = 'ar-SA'; // Arabic
                utterance.rate = 0.7;
                utterance.pitch = 1;
                
                utterance.onend = () => {
                    setPlayingId(null);
                };
                
                utterance.onerror = () => {
                    setPlayingId(null);
                };
                
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setPlayingId(null);
        }
    };

    // Stop audio
    const stopAudio = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        if (currentAudio) {
            currentAudio.pause();
        }
        setPlayingId(null);
    };

    // Copy to clipboard
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Share functionality
    const shareAsmaulHusna = () => {
        const text = "🤲 99 Asmaul Husna - Nama-nama Indah Allah SWT\n\n✨ Pelajari dan renungkan keagungan Allah melalui nama-nama-Nya yang indah dengan makna mendalam, audio pronunciation, dan ayat Al-Quran terkait\n\n🕌 Platform Al-Quran Digital Terlengkap di Indonesia";
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: '99 Asmaul Husna - Nama-nama Indah Allah SWT | IndoQuran',
                text: text,
                url: url
            });
        } else {
            // Fallback to WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n🔗 ' + url)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // Display loading spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // Display error message
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                {...getAsmaulHusnaSEO(asmaulHusnaData.length, filteredNames.length)}
            />

            {/* Page Title Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        {/* Main Title with Enhanced Calligraphy */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 mb-6">
                                <div className="relative">
                                    {/* Decorative Background Pattern */}
                                    <div className="absolute inset-0 opacity-5">
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl transform rotate-1"></div>
                                    </div>
                                    
                                    {/* Main Arabic Title */}
                                    <div className="relative z-10">
                                        <h1 className="text-6xl md:text-7xl lg:text-8xl arabic-calligraphy-large text-gray-900 mb-4 leading-relaxed"
                                            dir="rtl"
                                            itemProp="name"
                                            style={{ 
                                                textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                lineHeight: '1.1'
                                            }}>
                                            أَسْمَاءُ الْحُسْنَى
                                        </h1>
                                        
                                        {/* Decorative Elements */}
                                        <div className="flex items-center justify-center space-x-4 mb-4">
                                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="w-16 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4" itemProp="headline">
                                99 Asmaul Husna
                            </h2>
                        </div>
                        
                        <div className="mb-8">
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6" itemProp="description">
                                Nama-nama indah Allah SWT yang mengandung sifat-sifat mulia dan sempurna. 
                                Merenungkan Asmaul Husna dapat mendekatkan diri kepada Allah dan memperdalam iman.
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                                <button
                                    onClick={shareAsmaulHusna}
                                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    aria-label="Bagikan 99 Asmaul Husna"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                    <span>Bagikan</span>
                                </button>
                            </div>

                            {/* Search */}
                            <div className="max-w-md mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari nama Allah..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        aria-label="Cari dalam 99 Asmaul Husna"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats */}
                <section className="text-center mb-12">
                    <p className="text-gray-600" itemProp="description">
                        Menampilkan {filteredNames.length} dari {asmaulHusnaData.length} nama Allah
                    </p>
                </section>

                {/* Asmaul Husna Grid */}
                <section itemScope itemType="https://schema.org/ItemList">
                    <h2 className="sr-only">Daftar 99 Asmaul Husna</h2>
                    <meta itemProp="numberOfItems" content={filteredNames.length} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNames.map((name, index) => (
                            <article
                                key={name.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                itemScope 
                                itemType="https://schema.org/Thing"
                                itemProp="itemListElement"
                            >
                                <meta itemProp="position" content={index + 1} />
                                
                                {/* Header with number and favorite */}
                                <header className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-green-700 text-sm" itemProp="identifier">
                                            {name.id}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(name.id)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label={favoriteNames.has(name.id) ? "Hapus dari favorit" : "Tambah ke favorit"}
                                    >
                                        {favoriteNames.has(name.id) ? (
                                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <HeartIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </header>

                                {/* Arabic Calligraphy */}
                                <div className="text-center mb-6">
                                    {/* Main Calligraphy Display */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-4 border border-green-100">
                                        <div className="relative">
                                            {/* Decorative Border */}
                                            <div className="absolute inset-0 border-2 border-green-200 rounded-lg opacity-30 transform rotate-1"></div>
                                            <div className="absolute inset-0 border border-green-300 rounded-lg opacity-20 transform -rotate-1"></div>
                                            
                                            {/* Arabic Calligraphy */}
                                            <div className="relative z-10 py-4">
                                                <h3 className="text-5xl md:text-6xl arabic-calligraphy-large text-gray-900 mb-3 leading-relaxed tracking-wide" 
                                                    dir="rtl"
                                                    itemProp="alternateName"
                                                    lang="ar"
                                                    style={{ 
                                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        lineHeight: '1.2'
                                                    }}>
                                                    {name.arabic}
                                                </h3>
                                                
                                                {/* Decorative Elements */}
                                                <div className="flex items-center justify-center space-x-2 mb-2">
                                                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Name Details */}
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold text-green-600 mb-1" itemProp="name">
                                            {name.latin}
                                        </h4>
                                        <p className="text-lg font-semibold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg inline-block" itemProp="description">
                                            {name.meaning}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm leading-relaxed mb-4" itemProp="disambiguatingDescription">
                                    {name.description}
                                </p>

                                {/* Verses Section */}
                                {name.verses && name.verses.length > 0 && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => toggleVerses(name.id)}
                                            className="flex items-center justify-between w-full px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium text-green-700"
                                            aria-expanded={expandedVerses.has(name.id)}
                                            aria-controls={`verses-${name.id}`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <BookOpenIcon className="w-4 h-4" />
                                                <span>Ayat Al-Quran ({name.verses.length})</span>
                                            </div>
                                            {expandedVerses.has(name.id) ? (
                                                <ChevronUpIcon className="w-4 h-4" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4" />
                                            )}
                                        </button>
                                        
                                        {expandedVerses.has(name.id) && (
                                            <div id={`verses-${name.id}`} className="mt-3 space-y-3" role="region" aria-label="Ayat Al-Quran terkait">
                                                {name.verses.map((verse, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-semibold text-green-600">
                                                                QS. {verse.surah}:{verse.ayah}
                                                            </span>
                                                            <a
                                                                href={`/surah/${verse.surah}/${verse.ayah}`}
                                                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`Baca QS. ${verse.surah}:${verse.ayah}`}
                                                            >
                                                                Baca →
                                                            </a>
                                                        </div>
                                                        <p className="text-sm font-arabic text-gray-900 leading-relaxed" dir="rtl" lang="ar">
                                                            {verse.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <footer className="flex items-center justify-between">
                                    <button
                                        onClick={() => playingId === name.id ? stopAudio() : playAudio(name)}
                                        className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        aria-label={playingId === name.id ? `Stop audio ${name.latin}` : `Putar audio ${name.latin}`}
                                    >
                                        {playingId === name.id ? (
                                            <PauseIcon className="w-4 h-4" />
                                        ) : (
                                            <PlayIcon className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">
                                            {playingId === name.id ? 'Stop' : 'Dengar'}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => copyToClipboard(`${name.arabic} - ${name.latin} (${name.meaning})`)}
                                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Salin nama Allah"
                                        aria-label={`Salin ${name.latin}`}
                                    >
                                        <DocumentDuplicateIcon className="w-4 h-4" />
                                    </button>
                                </footer>
                            </article>
                        ))}
                    </div>
                </section>

                {/* No Results */}
                {filteredNames.length === 0 && (
                    <section className="text-center py-12">
                        <p className="text-gray-500">
                            Tidak ditemukan nama Allah yang sesuai dengan pencarian "{searchTerm}"
                        </p>
                    </section>
                )}

                {/* Favorite Section */}
                {favoriteNames.size > 0 && (
                    <section className="mt-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Nama Allah Favorit Anda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {asmaulHusnaData
                                .filter(name => favoriteNames.has(name.id))
                                .map((name) => (
                                    <article
                                        key={`fav-${name.id}`}
                                        className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                        itemScope
                                        itemType="https://schema.org/Thing"
                                    >
                                        {/* Mini Calligraphy */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-3 border border-green-100">
                                            <p className="text-2xl arabic-calligraphy text-gray-900 mb-2 leading-relaxed" 
                                               dir="rtl"
                                               lang="ar"
                                               itemProp="alternateName"
                                               style={{ 
                                                   textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                               }}>
                                                {name.arabic}
                                            </p>
                                            {/* Small decorative line */}
                                            <div className="w-8 h-px bg-green-300 mx-auto"></div>
                                        </div>
                                        <p className="text-sm font-semibold text-green-600 mb-1" itemProp="name">
                                            {name.latin}
                                        </p>
                                        <p className="text-xs text-gray-600" itemProp="description">
                                            {name.meaning}
                                        </p>
                                    </article>
                                ))
                            }
                        </div>
                    </section>
                )}

                {/* Doa Section */}
                <section className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                    <header>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Doa Asmaul Husna
                        </h3>
                    </header>
                    <div className="text-center space-y-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                            <div className="relative">
                                {/* Decorative Background */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl"></div>
                                </div>
                                
                                {/* Enhanced Arabic Prayer */}
                                <div className="relative z-10">
                                    <p className="text-3xl md:text-4xl arabic-calligraphy text-gray-900 mb-6 leading-relaxed"
                                       dir="rtl"
                                       lang="ar"
                                       style={{ 
                                           textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                           lineHeight: '1.6'
                                       }}>
                                        اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لاَ إِلَهَ إِلاَّ أَنْتَ الْمَنَّانُ بَدِيعُ السَّمَوَاتِ وَالأَرْضِ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ يَا حَىُّ يَا قَيُّومُ
                                    </p>
                                    
                                    {/* Decorative Separator */}
                                    <div className="flex items-center justify-center space-x-4 mb-6">
                                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        </div>
                                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 italic leading-relaxed text-lg">
                                "Ya Allah, sesungguhnya aku memohon kepada-Mu dengan meyakini bahwa bagi-Mu segala puji, 
                                tidak ada tuhan selain Engkau, Yang Maha Pemberi, Pencipta langit dan bumi, 
                                Ya Dzat Yang Memiliki keagungan dan kemuliaan, Ya Yang Maha Hidup lagi Maha Berdiri Sendiri."
                            </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                            - HR. Abu Dawud, At-Tirmidzi, An-Nasa'i, dan Ibnu Majah
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}

export default AsmaulHusnaPage;
