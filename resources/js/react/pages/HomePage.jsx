import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QuranHeader from '../components/QuranHeader';
import PrayerTimesWidget from '../components/PrayerTimesWidget';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';

function HomePage() {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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
            <MetaTags 
                title="Al-Quran Digital Indonesia | Baca Al-Quran Online dengan Terjemahan Indonesia"
                description="Baca Al-Quran digital lengkap dengan terjemahan bahasa Indonesia, tafsir, dan audio. Cari ayat, bookmark, dan pelajari Al-Quran dengan mudah secara online."
                keywords="al quran digital, baca quran online, al quran indonesia, terjemahan quran, quran digital, al quran indonesia"
                canonicalUrl="https://my.indoquran.web.id/"
            />
            
            <StructuredData type="WebSite" data={{}} />
            
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
                )}
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

            {/* Remove duplicate Prayer Times Widget from here */}
        </div>
    );
}

export default HomePage;
