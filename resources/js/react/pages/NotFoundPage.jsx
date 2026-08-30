import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiSearch, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import { scrollToTop } from '../utils/scrollUtils';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    // Set 404 status code for server-side rendering and crawlers
    useEffect(() => {
        scrollToTop();

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

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

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

                    {/* Search Alternative - Google Best Practice: Provide search on 404 pages */}
                    <div className="mt-8">
                        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Coba Cari yang Anda Butuhkan
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Gunakan pencarian untuk menemukan ayat atau surah yang Anda cari
                                    </p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari ayat, surah, atau kata kunci..."
                                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Common Reasons - Google Best Practice: Explain why the error occurred */}
                    <div className="mt-8">
                        <div className="bg-blue-50 rounded-xl border-2 border-blue-100 p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">
                                Mengapa halaman ini tidak ditemukan?
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>URL yang Anda masukkan mungkin salah atau tidak lengkap</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Halaman mungkin telah dipindahkan atau dihapus</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Link dari sumber external mungkin sudah tidak valid</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>Nomor surah/juz/halaman mungkin di luar jangkauan (Surah: 1-114, Juz: 1-30, Halaman: 1-604)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Current URL Info - Helpful for debugging */}
                    {location.pathname !== '/' && (
                        <div className="mt-6">
                            <details className="bg-gray-50 rounded-lg border border-gray-200">
                                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Informasi Teknis
                                </summary>
                                <div className="px-4 pb-3 pt-1">
                                    <p className="text-xs text-gray-600 mb-1">URL yang diminta:</p>
                                    <code className="block bg-gray-100 px-3 py-2 rounded text-xs text-gray-800 break-all font-mono">
                                        {window.location.href}
                                    </code>
                                    <p className="text-xs text-gray-500 mt-2">
                                        HTTP Status: 404 Not Found
                                    </p>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Jika Anda yakin halaman ini seharusnya ada, silakan{' '}
                            <Link to="/kontak" className="text-green-600 hover:text-green-700 font-medium underline">
                                hubungi kami
                            </Link>
                            {' '}dan kami akan membantu Anda.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
