import React, { useState, useEffect } from 'react';
import QuranHeader from '../components/QuranHeader';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';

function HomePage() {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Handle Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showModal]);
    
    useEffect(() => {
        fetch('/api/surahs')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch surahs');
                return response.json();
            })
            .then(response => {
                if (response.status === 'success') {
                    setSurahs(response.data);
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
    
    const handleSurahClick = (e, surah) => {
        e.preventDefault(); // Prevent the Link component from navigating immediately
        setSelectedSurah(surah);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedSurah(null);
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
        <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 pt-24">
            <MetaTags 
                title="Al-Quran Digital Indonesia | Baca Al-Quran Online dengan Terjemahan Indonesia"
                description="Baca Al-Quran digital lengkap dengan terjemahan bahasa Indonesia, tafsir, dan audio. Cari ayat, bookmark, dan pelajari Al-Quran dengan mudah secara online."
                keywords="al quran digital, baca quran online, al quran indonesia, terjemahan quran, quran digital, al quran indonesia"
                canonicalUrl="https://my.indoquran.web.id/"
            />
            
            <StructuredData type="WebSite" data={{}} />
            
            <div className="container mx-auto px-4 py-8">
                <QuranHeader />
                
                <PrayerTimesWidget className="mb-8" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-islamic-green mb-2">Al-Quran Digital</h1>
                <p className="text-lg text-gray-600 mb-6">Baca, dengar, dan pelajari Al-Quran secara online dengan terjemahan bahasa Indonesia</p>
            
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-islamic-green"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {surahs.map(surah => (
                            <a 
                                key={surah.number} 
                                href={`/surah/${surah.number}`}
                                onClick={(e) => handleSurahClick(e, surah)}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer block"
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
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSurahClick(e, surah);
                                            }}
                                            className="flex-1 bg-islamic-green text-black font-semibold text-center py-2.5 px-4 rounded-md hover:bg-islamic-green/90 transition-colors duration-200 text-sm shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Detail
                                        </button>
                                        <a 
                                            href={`/surah/${surah.number}`}
                                            className="flex-1 bg-islamic-green text-black font-semibold text-center py-2.5 px-4 rounded-md hover:bg-islamic-green/90 transition-colors duration-200 text-sm shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Baca
                                        </a>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
            </div>

            {/* Surah Detail Modal */}
            {showModal && selectedSurah && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        {/* Sticky Header */}
                        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg z-10 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-islamic-green mb-1">
                                        {selectedSurah.name_latin}
                                    </h2>
                                    <p className="text-islamic-brown">
                                        {selectedSurah.name_indonesian}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl text-islamic-green font-arabic">
                                        {selectedSurah.name_arabic}
                                    </span>
                                    <button 
                                        onClick={closeModal}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth">
                            <div className="space-y-6">
                                <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Surah ke-</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.number}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jumlah Ayat</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.total_ayahs}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tempat Turun</span>
                                            <span className="ml-2 font-medium text-islamic-green">{selectedSurah.revelation_place}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedSurah.description_short && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-islamic-green mb-2">Ringkasan</h3>
                                        <div 
                                            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-islamic-green"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_short }}
                                        />
                                    </div>
                                )}

                                {selectedSurah.description_long && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-islamic-green mb-2">Penjelasan Detail</h3>
                                        <div 
                                            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-headings:text-islamic-green prose-a:text-islamic-green hover:prose-a:text-islamic-green/80"
                                            dangerouslySetInnerHTML={{ __html: selectedSurah.description_long }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 pt-4 pb-2 bg-white/80 backdrop-blur-sm">
                                <button 
                                    onClick={closeModal}
                                    className="px-4 py-2 text-black bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium inline-flex items-center rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Tutup
                                </button>
                                <a 
                                    href={`/surah/${selectedSurah.number}`}
                                    className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-black rounded-lg hover:bg-gray-50 font-medium inline-flex items-center transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Baca Surah
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;
