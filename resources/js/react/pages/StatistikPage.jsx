import React from 'react';
import VisitorStatsHomepage from '../components/VisitorStatsHomepage';
import SEOHead from '../components/SEOHead';

const StatistikPage = () => {
    const seoData = {
        title: 'Statistik Pengunjung - IndoQuran',
        description: 'Lihat statistik dan aktivitas komunitas IndoQuran. Data pengunjung real-time, halaman populer, dan tren bacaan Al-Quran.',
        keywords: 'statistik, pengunjung, komunitas, IndoQuran, data, analitik, Al-Quran',
        url: '/statistik',
        type: 'website'
    };

    return (
        <>
            <SEOHead {...seoData} />
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        📊 Statistik Komunitas IndoQuran
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl">
                            Jelajahi data aktivitas komunitas dan lihat bagaimana umat muslim di seluruh dunia 
                            menggunakan IndoQuran untuk memperdalam pemahaman Al-Quran
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 rounded-lg p-3 mr-4">
                                    <span className="text-green-600 text-2xl">🌍</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Global Community</h3>
                                    <p className="text-sm text-gray-600">
                                        Komunitas muslim dari berbagai negara
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                                    <span className="text-blue-600 text-2xl">⏰</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Real-time Data</h3>
                                    <p className="text-sm text-gray-600">
                                        Data statistik diperbarui secara langsung
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 rounded-lg p-3 mr-4">
                                    <span className="text-purple-600 text-2xl">📈</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
                                    <p className="text-sm text-gray-600">
                                        Analisis tren bacaan dan aktivitas
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Statistics Component */}
                    <VisitorStatsHomepage />

                    {/* Community Message */}
                    <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            Bergabunglah dengan Komunitas Kami! 🤝
                        </h2>
                        <p className="text-lg mb-6 text-green-100">
                            Jadilah bagian dari komunitas muslim yang aktif dalam mempelajari Al-Quran. 
                            Setiap kunjungan Anda berkontribusi dalam membangun komunitas yang lebih kuat.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a 
                                href="/daftar" 
                                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                📝 Daftar Sekarang
                            </a>
                            <a 
                                href="/semua-surah" 
                                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                            >
                                📖 Mulai Membaca
                            </a>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Tentang Data Ini</h3>
                        <div className="prose text-gray-600 max-w-none">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Data diperbarui secara real-time setiap menit</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Statistik mencakup pengunjung unik dan halaman populer</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Data privasi pengunjung tetap terjaga dan anonim</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Analisis membantu meningkatkan pengalaman pengguna</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
    );
};

export default StatistikPage;
