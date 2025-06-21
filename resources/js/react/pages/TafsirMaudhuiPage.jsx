import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpenIcon, 
    MagnifyingGlassIcon,
    AcademicCapIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';

function TafsirMaudhuiPage() {
    const [tafsirData, setTafsirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [expandedTopics, setExpandedTopics] = useState(new Set());

    // Fetch tafsir data
    useEffect(() => {
        const fetchTafsirData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tafsir-maudhui');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch tafsir data');
                }
                
                const data = await response.json();
                setTafsirData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching tafsir data:', err);
                setError('Gagal memuat data tafsir maudhui');
            } finally {
                setLoading(false);
            }
        };

        fetchTafsirData();
    }, []);

    // Filter topics based on search keyword
    const filteredTopics = useMemo(() => {
        if (!tafsirData?.topics) return [];
        
        if (!searchKeyword.trim()) {
            return tafsirData.topics;
        }
        
        const keyword = searchKeyword.toLowerCase();
        return tafsirData.topics.filter(topic => 
            topic.topic.toLowerCase().includes(keyword) || 
            topic.description.toLowerCase().includes(keyword)
        );
    }, [tafsirData, searchKeyword]);

    // Toggle expanded state for a topic
    const toggleExpanded = (index) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTopics(newExpanded);
    };

    // SEO Data
    const seoData = {
        title: 'Tafsir Maudhui - Topik-topik dalam Al-Quran | IndoQuran',
        description: 'Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. Temukan ayat-ayat Al-Quran berdasarkan tema seperti akidah, ibadah, akhlak, muamalah, dan banyak lagi.',
        keywords: 'tafsir maudhui, topik quran, tema al quran, tafsir tematik, akidah islam, ibadah islam, akhlak islam, muamalah islam, indoquran',
        canonical: '/tafsir-maudhui'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SEOHead {...seoData} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <LoadingSpinner message="Memuat data tafsir maudhui..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SEOHead {...seoData} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">❌ {error}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead {...seoData} />
            
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tafsir Maudhui
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Jelajahi topik-topik penting dalam Al-Quran melalui pendekatan tafsir maudhui. 
                            Temukan ayat-ayat berdasarkan tema dan pelajari pesan-pesan Al-Quran secara tematik.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Stats */}
                <div className="mb-8 space-y-6">
                    {/* Search Box */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Cari topik..." 
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {filteredTopics.length}
                            </div>
                            <div className="text-gray-600">
                                {searchKeyword ? 'Topik Ditemukan' : 'Total Topik'}
                            </div>
                            {searchKeyword && (
                                <div className="text-sm text-gray-500 mt-2">
                                    dari {tafsirData?.topics?.length || 0} total topik
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Topics Grid */}
                {filteredTopics.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTopics.map((topic, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {topic.topic}
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        {topic.description}
                                    </p>
                                    
                                    <div className="mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                                            <BookOpenIcon className="w-4 h-4 mr-1" />
                                            {topic.verses?.length || 0} ayat
                                        </span>
                                    </div>
                                    
                                    {/* Preview verses */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {topic.verses?.slice(0, 6).map((verse, verseIndex) => (
                                            <Link 
                                                key={verseIndex}
                                                to={`/surah/${verse.surah}/${verse.ayah}`}
                                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                            >
                                                {verse.surah}:{verse.ayah}
                                            </Link>
                                        ))}
                                        {topic.verses?.length > 6 && (
                                            <span className="text-xs text-gray-500 px-2 py-1">
                                                +{topic.verses.length - 6} lainnya
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Toggle button */}
                                    {topic.verses?.length > 0 && (
                                        <button 
                                            onClick={() => toggleExpanded(index)}
                                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                        >
                                            {expandedTopics.has(index) ? (
                                                <>
                                                    <ChevronUpIcon className="w-4 h-4 mr-1" />
                                                    Sembunyikan Ayat
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDownIcon className="w-4 h-4 mr-1" />
                                                    Lihat Semua Ayat
                                                </>
                                            )}
                                        </button>
                                    )}
                                    
                                    {/* Expanded verses */}
                                    {expandedTopics.has(index) && topic.verses?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex flex-wrap gap-2">
                                                {topic.verses.map((verse, verseIndex) => (
                                                    <Link 
                                                        key={verseIndex}
                                                        to={`/surah/${verse.surah}/${verse.ayah}`}
                                                        className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        {verse.surah}:{verse.ayah}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-500">
                            <div className="text-6xl mb-4">🔍</div>
                            <div className="text-xl font-medium mb-2">Tidak ada topik yang ditemukan</div>
                            <div className="text-gray-400">
                                Coba kata kunci lain untuk mencari topik
                            </div>
                            {searchKeyword && (
                                <button 
                                    onClick={() => setSearchKeyword('')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tampilkan Semua Topik
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Back to top button */}
                {filteredTopics.length > 9 && (
                    <div className="mt-12 text-center">
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Kembali ke Atas
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default TafsirMaudhuiPage;
