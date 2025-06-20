import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon,
    BookOpenIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { fetchWithAuth } from '../utils/apiUtils';

function PageListPage() {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Generate page numbers 1-604
            const pageNumbers = Array.from({ length: 604 }, (_, index) => index + 1);
            setPages(pageNumbers);
        } catch (err) {
            console.error('Error loading pages:', err);
            setError('Gagal memuat halaman. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePageClick = useCallback((pageNumber) => {
        try {
            navigate(`/halaman/${pageNumber}`);
        } catch (err) {
            console.error('Navigation error:', err);
            setError('Gagal membuka halaman. Silakan coba lagi.');
        }
    }, [navigate]);
    
    const handleGoToPage = useCallback((e) => {
        e.preventDefault();
        try {
            const pageNum = parseInt(searchTerm);
            if (pageNum >= 1 && pageNum <= 604) {
                navigate(`/halaman/${pageNum}`);
            }
        } catch (err) {
            console.error('Navigation error:', err);
            setError('Gagal membuka halaman. Silakan coba lagi.');
        }
    }, [searchTerm, navigate]);

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        // Only allow numbers and empty string, prevent invalid input
        if (value === '') {
            setSearchTerm('');
        } else if (/^\d+$/.test(value)) {
            const num = parseInt(value);
            if (num <= 604) {
                setSearchTerm(value);
            }
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadPages}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SEOHead 
                title="Telusuri berdasarkan Halaman - IndoQuran"
                description="Telusuri dan baca Al-Quran yang diatur berdasarkan halaman. Semua 604 halaman Al-Quran suci dengan teks Arab dan terjemahan."
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link
                            to="/"
                            className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="ml-2 hidden sm:inline">Kembali ke Beranda</span>
                        </Link>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Telusuri berdasarkan Halaman
                        </h1>
                        <p className="text-gray-600">
                            Al-Quran diatur dalam 604 halaman untuk pembacaan yang sistematis
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                    <form onSubmit={handleGoToPage} className="flex items-center gap-4 justify-center">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                min="1"
                                max="604"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => {
                                    // Prevent 'e', '+', '-', '.' from being entered
                                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder="Masukkan nomor halaman (1-604)..."
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!searchTerm || parseInt(searchTerm) < 1 || parseInt(searchTerm) > 604}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Buka Halaman
                        </button>
                    </form>
                    
                    <div className="text-center mt-4 text-sm text-gray-600">
                        Total: {pages.length} halaman tersedia
                    </div>
                </div>

                {/* Pages Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-3">
                    {pages && pages.length > 0 ? pages.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageClick(pageNumber)}
                            className="aspect-square flex items-center justify-center p-2 rounded-lg bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all border border-gray-200 font-medium"
                            title={`Halaman ${pageNumber}`}
                        >
                            <span className="text-sm">{pageNumber}</span>
                        </button>
                    )) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            Tidak ada halaman untuk ditampilkan
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tentang Halaman Al-Quran</h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Al-Quran terdiri dari 604 halaman dalam tata letak Mushaf standar. 
                            Setiap halaman berisi ayat-ayat yang disusun dengan cermat untuk pembacaan dan hafalan yang optimal.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Fakta Singkat</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• 604 halaman total</li>
                                    <li>• 114 surah</li>
                                    <li>• 6.236 ayat</li>
                                    <li>• Tata letak Mushaf standar</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Tips Membaca</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Baca sesuai kecepatan Anda</li>
                                    <li>• Gunakan bookmark untuk menyimpan progres</li>
                                    <li>• Dengarkan audio bacaan</li>
                                    <li>• Renungkan terjemahan</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Telusuri berdasarkan Surah</span>
                    </Link>
                    <Link
                        to="/juz"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Telusuri berdasarkan Juz</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default React.memo(PageListPage);
