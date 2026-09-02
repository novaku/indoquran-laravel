import React, { useEffect } from 'react';
import VisitorStatsHomepage from '../components/VisitorStatsHomepage';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseHorizontal from '../components/AdSenseHorizontal';
import { Card, Button, PageHeader, PageContent } from '../components/ui';
import { scrollToTop } from '../utils/scrollUtils';

const StatistikPage = () => {
    useEffect(() => {
        scrollToTop();
    }, []);

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
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                            Statistik Komunitas IndoQuran
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                            Jelajahi data aktivitas komunitas dan lihat bagaimana umat muslim di seluruh dunia menggunakan IndoQuran untuk memperdalam pemahaman Al-Quran.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-7xl" labelText="IKLAN" className="my-4 sm:my-6" />

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card padding="lg">
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
                    </Card>

                    <Card padding="lg">
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
                    </Card>

                    <Card padding="lg">
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
                    </Card>
                </div>

                {/* Main Statistics Component */}
                <VisitorStatsHomepage />

                {/* Break Banner Ad (Detik.com Pattern) */}
                <div className="w-full my-8">
                    <AdSenseHorizontal 
                        adSlot="1519827772"
                        showLabel={true}
                        labelText="IKLAN"
                        minHeight="90px"
                    />
                </div>

                {/* Community Message */}
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xs">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Bergabunglah dengan Komunitas Kami! 🤝
                    </h2>
                    <p className="text-base text-gray-600 mb-6 max-w-2xl mx-auto">
                        Jadilah bagian dari komunitas muslim yang aktif dalam mempelajari Al-Quran. 
                        Setiap kunjungan Anda berkontribusi dalam membangun komunitas yang lebih kuat.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="/daftar">
                            <Button variant="primary" size="md" className="bg-green-600 hover:bg-green-700 text-white shadow-xs">
                                📝 Daftar Sekarang
                            </Button>
                        </a>
                        <a href="/surah">
                            <Button variant="outline" size="md" className="border border-gray-300 text-gray-700 hover:bg-gray-50">
                                📖 Mulai Membaca
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Additional Info */}
                <Card padding="lg" className="mt-8">
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
                </Card>

                {/* Bottom Break Ad (Detik.com Pattern) */}
                <div className="w-full my-8">
                    <AdSenseHorizontal 
                        adSlot="1519827772"
                        showLabel={true}
                        labelText="IKLAN REKOMENDASI"
                        minHeight="90px"
                    />
                </div>
            </div>
        </div>
        </>
    );
};

export default StatistikPage;
