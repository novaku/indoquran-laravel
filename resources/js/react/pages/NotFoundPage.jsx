import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiBook, FiSearch, FiArrowLeft } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

const NotFoundPage = () => {
    // Set 404 status code for server-side rendering and crawlers
    useEffect(() => {
        // Send 404 signal to server via meta tag for proper HTTP status
        const metaStatus = document.createElement('meta');
        metaStatus.name = 'prerender-status-code';
        metaStatus.content = '404';
        document.head.appendChild(metaStatus);

        // Also update document title for better UX
        document.title = '404 - Halaman Tidak Ditemukan | IndoQuran';

        return () => {
            // Cleanup meta tag
            const existingMeta = document.querySelector('meta[name="prerender-status-code"]');
            if (existingMeta) {
                existingMeta.remove();
            }
        };
    }, []);

    const quickLinks = [
        {
            to: '/',
            icon: <FiHome className="w-6 h-6" />,
            label: 'Beranda',
            description: 'Kembali ke halaman utama'
        },
        {
            to: '/surah',
            icon: <FiBook className="w-6 h-6" />,
            label: 'Daftar Surah',
            description: 'Lihat semua surah Al-Quran'
        },
        {
            to: '/cari',
            icon: <FiSearch className="w-6 h-6" />,
            label: 'Pencarian',
            description: 'Cari ayat dalam Al-Quran'
        }
    ];

    return (
        <>
            <SEOHead 
                title="404 - Halaman Tidak Ditemukan | IndoQuran"
                description="Maaf, halaman yang Anda cari tidak ditemukan. Kembali ke beranda IndoQuran untuk mengakses Al-Quran Digital Indonesia."
                keywords="404, halaman tidak ditemukan, error, indoquran"
                noindex={true}
            />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center px-4 py-16">
                <div className="max-w-2xl w-full">
                    {/* Error Illustration */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-orange-100 mb-6">
                            <span className="text-6xl font-bold text-red-600">404</span>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Halaman Tidak Ditemukan
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-2">
                            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                        </p>
                        
                        <p className="text-base text-gray-500">
                            Silakan gunakan menu navigasi atau tautan di bawah untuk melanjutkan.
                        </p>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {quickLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.to}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border-2 border-gray-100 hover:border-green-500"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-500 transition-colors duration-300 flex items-center justify-center mb-3">
                                        <span className="text-green-600 group-hover:text-white transition-colors duration-300">
                                            {link.icon}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {link.label}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {link.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            Kembali ke Halaman Sebelumnya
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500">
                            Jika Anda yakin halaman ini seharusnya ada, silakan{' '}
                            <Link to="/kontak" className="text-green-600 hover:text-green-700 font-medium underline">
                                hubungi kami
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
