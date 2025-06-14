import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoBookOutline, IoSearchOutline, IoListOutline, IoGridOutline } from 'react-icons/io5';
import QuranHeader from '../components/QuranHeader';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import MetaTags from '../components/MetaTags';
import StructuredData from '../components/StructuredData';
import { fetchWithAuth } from '../utils/apiUtils';

function PageListPage() {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    
    useEffect(() => {
        setLoading(true);
        fetchWithAuth('/api/pages')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setPages(data.data);
                } else {
                    setError(data.message || 'Failed to load pages');
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);
    
    const handlePageClick = (pageNumber) => {
        navigate(`/pages/${pageNumber}`);
    };
    
    const filteredPages = pages.filter(page => {
        if (!searchTerm) return true;
        return page.toString().includes(searchTerm);
    });
    
    const handleGoToPage = (e) => {
        e.preventDefault();
        const pageNum = parseInt(searchTerm);
        if (pageNum >= 1 && pageNum <= 604) {
            navigate(`/pages/${pageNum}`);
        }
    };
    
    if (loading) {
        return (
            <PageTransition isLoading={true}>
                <LoadingSpinner size="lg" />
            </PageTransition>
        );
    }
    
    if (error) {
        return (
            <PageTransition>
                <div className="text-center py-12">
                    <div className="text-red-500 text-lg mb-4">Error: {error}</div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            </PageTransition>
        );
    }
    
    return (
        <PageTransition>
            <MetaTags 
                title="Daftar Halaman Al-Quran - IndoQuran"
                description="Akses semua halaman Al-Quran Mushaf Standar. 604 halaman Al-Quran tersedia untuk dibaca dan dipelajari dengan terjemahan bahasa Indonesia."
                keywords="daftar halaman al quran, halaman al quran, mushaf standar, al quran digital, quran indonesia"
            />
            
            <StructuredData 
                type="CollectionPage"
                data={{
                    name: "Daftar Halaman Al-Quran",
                    description: "Koleksi lengkap 604 halaman Al-Quran dengan terjemahan bahasa Indonesia",
                    numberOfItems: pages.length,
                    url: "https://my.indoquran.web.id/pages"
                }}
            />
            
            <QuranHeader 
                title="Daftar Halaman Al-Quran"
                subtitle="Mushaf Standar"
                description="Pilih halaman Al-Quran yang ingin Anda baca. Total 604 halaman tersedia."
            />
            
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200"
                        >
                            <IoArrowBackOutline className="text-xl" />
                            <span>Kembali</span>
                        </button>
                        
                        {/* Search and Go to Page */}
                        <div className="flex items-center gap-4">
                            <form onSubmit={handleGoToPage} encType="application/x-www-form-urlencoded" className="flex items-center gap-2">
                                <div className="relative">
                                    <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="604"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Masukkan nomor halaman (1-604)..."
                                        className="pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-60"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!searchTerm || parseInt(searchTerm) < 1 || parseInt(searchTerm) > 604}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Buka
                                </button>
                            </form>
                            
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-white text-green-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    title="Tampilan Grid"
                                >
                                    <IoGridOutline className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-white text-green-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    title="Tampilan Daftar"
                                >
                                    <IoListOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-800">
                                    <span>{pages.length}</span>
                                </div>
                                <div className="text-sm text-green-600">Total Halaman</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Navigation */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigasi Cepat</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        <button
                            onClick={() => navigate('/pages/1')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">1</span>
                            <span className="text-xs">Al-Fatihah</span>
                        </button>
                        <button
                            onClick={() => navigate('/pages/2')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">2</span>
                            <span className="text-xs">Al-Baqarah</span>
                        </button>
                        <button
                            onClick={() => navigate('/pages/302')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">302</span>
                            <span className="text-xs">Juz 16</span>
                        </button>
                        <button
                            onClick={() => navigate('/pages/502')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">502</span>
                            <span className="text-xs">Juz 26</span>
                        </button>
                        <button
                            onClick={() => navigate('/pages/582')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">582</span>
                            <span className="text-xs">Juz 30</span>
                        </button>
                        <button
                            onClick={() => navigate('/pages/604')}
                            className="flex flex-col items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <span className="text-lg font-bold">604</span>
                            <span className="text-xs">An-Nas</span>
                        </button>
                    </div>
                </div>
                
                {/* Pages Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Semua Halaman</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                            {filteredPages.map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageClick(pageNumber)}
                                    className="aspect-square flex items-center justify-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 hover:scale-105 transition-all duration-200 border border-green-200 font-semibold"
                                    title={`Halaman ${pageNumber}`}
                                >
                                    <span className="text-lg">{pageNumber}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                        <div className="p-6 border-b border-green-100">
                            <h3 className="text-lg font-semibold text-gray-800">Semua Halaman</h3>
                        </div>
                        <div className="divide-y divide-green-100">
                            {Array.from({ length: Math.ceil(filteredPages.length / 10) }, (_, groupIndex) => (
                                <div key={groupIndex} className="p-4">
                                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                        {filteredPages
                                            .slice(groupIndex * 10, (groupIndex + 1) * 10)
                                            .map((pageNumber) => (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageClick(pageNumber)}
                                                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-all duration-200 border border-green-200 font-medium"
                                                    title={`Halaman ${pageNumber}`}
                                                >
                                                    <span className="text-base">{pageNumber}</span>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Info Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <IoBookOutline className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Tentang Halaman Al-Quran</h3>
                            <p className="text-green-700 text-sm leading-relaxed mb-3">
                                Al-Quran Mushaf Standar terdiri dari 604 halaman yang berisi 114 surah dan 6,236 ayat. 
                                Setiap halaman dirancang dengan tata letak yang konsisten untuk memudahkan pembacaan dan hafalan.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white rounded-lg p-3 border border-green-200">
                                    <div className="font-semibold text-green-800">Total Halaman</div>
                                    <div className="text-green-600">604 Halaman</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-green-200">
                                    <div className="font-semibold text-green-800">Total Surah</div>
                                    <div className="text-green-600">114 Surah</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-green-200">
                                    <div className="font-semibold text-green-800">Total Ayat</div>
                                    <div className="text-green-600">6,236 Ayat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default PageListPage;
