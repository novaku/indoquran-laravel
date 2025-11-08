import React from 'react';
import VisitorStatsHomepage from '../components/VisitorStatsHomepage';
import SEOHead from '../components/SEOHead';
import AdSenseVertical from '../components/AdSenseVertical';
import { Card, Button, PageHeader, PageContent } from '../components/ui';

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
            <PageContent>
                <PageHeader
                    title="📊 Statistik Komunitas IndoQuran"
                    subtitle="Jelajahi data aktivitas komunitas dan lihat bagaimana umat muslim di seluruh dunia menggunakan IndoQuran untuk memperdalam pemahaman Al-Quran"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
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
                        <a href="/daftar">
                            <Button variant="secondary" size="lg">
                                📝 Daftar Sekarang
                            </Button>
                        </a>
                        <a href="/surah">
                            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-green-600">
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
                    </div>

                    {/* Sidebar dengan Iklan */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-4 space-y-6">
                            {/* Iklan Vertikal */}
                            <Card padding="none">
                                <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                                    Iklan
                                </div>
                                <AdSenseVertical
                                    adSlot="9427110099"
                                    className="min-h-[600px]"
                                />
                            </Card>

                            {/* Info Box */}
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-3">📊 Statistik</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>📈 Data Real-time</p>
                                    <p>🌍 Global Community</p>
                                    <p>📱 Mobile Friendly</p>
                                    <p>🔒 Privacy Protected</p>
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>
            </PageContent>
        </>
    );
};

export default StatistikPage;
