import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { getPageSEOData, ALL_SURAH_NAMES, HIGH_TRAFFIC_SEARCH_TERMS, USER_REQUESTED_TERMS } from '../utils/seoUtils';
import { scrollToTop } from '../utils/scrollUtils';

/**
 * SEO Landing Page Component
 * This page helps improve SEO by providing internal links to all major search terms
 * and helps search engines discover and index all important content
 */
function SEOLandingPage() {
    const [surahs, setSurahs] = useState([]);
    
    useEffect(() => {
        scrollToTop();
        // Load all surahs for comprehensive linking
        fetch('/api/surahs')

            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSurahs(data.data);
                }
            })
            .catch(error => console.error('Error loading surahs:', error));
    }, []);

    // Group search terms by category for better organization
    const searchCategories = {
        'Surah Names': ALL_SURAH_NAMES,
        'Popular Searches': HIGH_TRAFFIC_SEARCH_TERMS,
        'Specific Terms': USER_REQUESTED_TERMS.slice(0, 50), // Limit for page performance
    };

    const seoData = getPageSEOData('search', { 
        query: 'al quran indonesia surah lengkap',
        results: surahs 
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <SEOHead 
                {...seoData}
                title="Daftar Lengkap Al-Quran Indonesia - Semua Surah, Ayat & Pencarian | IndoQuran"
                description="Temukan semua surah Al-Quran dengan terjemahan Indonesia. Daftar lengkap 114 surah, pencarian ayat, audio murottal, dan fitur pembelajaran Al-Quran digital terlengkap di Indonesia."
                keywords="al quran indonesia, daftar surah lengkap, semua surah al quran, 114 surah, surah al quran terjemahan, quran digital indonesia, al quran online lengkap, murottal semua surah, ayat al quran indonesia, pencarian al quran, indoquran lengkap"
                structuredData={[
                    {
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "name": "Daftar Lengkap Surah Al-Quran",
                        "description": "Daftar lengkap 114 surah dalam Al-Quran dengan terjemahan bahasa Indonesia",
                        "numberOfItems": 114,
                        "itemListElement": surahs.slice(0, 10).map((surah, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": `Surah ${surah.name_latin}`,
                            "description": `Surah ke-${surah.number} dalam Al-Quran dengan ${surah.total_ayahs} ayat`,
                            "url": `https://indoquran.web.id/surah/${surah.number}`
                        }))
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Apa itu IndoQuran?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "IndoQuran adalah platform Al-Quran digital terlengkap di Indonesia yang menyediakan 114 surah Al-Quran dengan terjemahan bahasa Indonesia, audio murottal dari berbagai qari, dan fitur pembelajaran interaktif."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Berapa jumlah surah dalam Al-Quran?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Al-Quran terdiri dari 114 surah yang dimulai dari Surah Al-Fatihah dan berakhir dengan Surah An-Nas. Setiap surah memiliki jumlah ayat yang berbeda-beda."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Apakah IndoQuran menyediakan audio murottal?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Ya, IndoQuran menyediakan audio murottal berkualitas tinggi dari berbagai qari terbaik dunia untuk setiap surah dan ayat dalam Al-Quran."
                                }
                            }
                        ]
                    }
                ]}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Daftar Lengkap Al-Quran Indonesia
                    </h1>
                    <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                        Temukan semua surah Al-Quran dengan terjemahan bahasa Indonesia, audio murottal, 
                        dan fitur pembelajaran yang lengkap. Platform Al-Quran digital terpercaya untuk 
                        umat Muslim Indonesia.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">114</div>
                        <div className="text-gray-600">Surah Lengkap</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">6,236</div>
                        <div className="text-gray-600">Total Ayat</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600">30</div>
                        <div className="text-gray-600">Juz (Para)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-red-600">604</div>
                        <div className="text-gray-600">Halaman Mushaf</div>
                    </div>
                </div>

                {/* All Surahs Grid - SEO optimized with internal links */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        Daftar 114 Surah Al-Quran
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {surahs.map((surah, index) => (
                            <Link
                                key={surah.number}
                                to={`/surah/${surah.number}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-600">
                                        Surah {surah.number}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {surah.total_ayahs} ayat
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">
                                    {surah.name_latin}
                                </h3>
                                <div className="text-xl font-arabic text-green-600 mb-2">
                                    {surah.name_arabic}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {surah.revelation_place === 'Mecca' ? 'Makkiyah' : 'Madaniyah'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Search Terms for SEO - Hidden from users but visible to search engines */}
                <div className="sr-only">
                    {Object.entries(searchCategories).map(([category, terms]) => (
                        <div key={category}>
                            <h2>{category}</h2>
                            <ul>
                                {terms.map((term, index) => (
                                    <li key={index}>
                                        <Link to={`/cari?q=${encodeURIComponent(term)}`}>
                                            {term}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Popular Features Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Fitur Pencarian</h3>
                        <p className="text-gray-600 mb-4">
                            Cari ayat Al-Quran berdasarkan kata kunci, nomor surah, atau tema tertentu.
                        </p>
                        <Link
                            to="/cari"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Mulai Pencarian
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Audio Murottal</h3>
                        <p className="text-gray-600 mb-4">
                            Dengarkan tilawah Al-Quran dari qari-qari terbaik dunia dengan kualitas audio tinggi.
                        </p>
                        <Link
                            to="/surah/1"
                            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                            Dengar Murottal
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Tafsir Maudhui</h3>
                        <p className="text-gray-600 mb-4">
                            Pelajari Al-Quran berdasarkan tema-tema tertentu dengan tafsir yang mendalam.
                        </p>
                        <Link
                            to="/tafsir-maudhui"
                            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                        >
                            Belajar Tafsir
                        </Link>
                    </div>
                </div>

                {/* FAQ Section for SEO */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Pertanyaan Umum</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Bagaimana cara mencari ayat Al-Quran di IndoQuran?
                            </h3>
                            <p className="text-gray-600">
                                Anda dapat menggunakan fitur pencarian dengan mengetik kata kunci, nomor surah, 
                                atau tema tertentu. Sistem akan menampilkan ayat-ayat yang relevan dengan 
                                terjemahan bahasa Indonesia.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Apakah IndoQuran gratis untuk digunakan?
                            </h3>
                            <p className="text-gray-600">
                                Ya, IndoQuran sepenuhnya gratis untuk digunakan. Semua fitur termasuk membaca 
                                Al-Quran, mendengar murottal, dan mengakses terjemahan dapat digunakan tanpa biaya.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Bagaimana cara menggunakan fitur bookmark di IndoQuran?
                            </h3>
                            <p className="text-gray-600">
                                Daftar terlebih dahulu atau masuk ke akun Anda, kemudian klik ikon bookmark 
                                pada ayat yang ingin disimpan. Ayat tersebut akan tersimpan di halaman penanda Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SEOLandingPage;
