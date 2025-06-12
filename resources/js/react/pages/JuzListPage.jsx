import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import SEOHead from '../components/SEOHead';
import { IoBookOutline, IoArrowForwardOutline } from 'react-icons/io5';

function JuzListPage() {
    const navigate = useNavigate();
    const [juzNumbers, setJuzNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadJuzList();
    }, []);

    const loadJuzList = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchWithAuth('/api/juz');
            const data = await response.json();
            
            if (data.status === 'success') {
                setJuzNumbers(data.data);
            } else {
                setError(data.message || 'Failed to load Juz list');
            }
        } catch (err) {
            console.error('Error loading Juz list:', err);
            setError('Failed to load Juz list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJuzClick = (juzNumber) => {
        navigate(`/juz/${juzNumber}`);
    };

    const juzSEO = {
        title: 'Daftar Juz Al-Quran - Teks Arab - IndoQuran',
        description: 'Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap. 30 Juz Al-Quran tersedia untuk dibaca dan dipelajari. Platform Al-Quran digital terlengkap di Indonesia.',
        keywords: 'juz al quran, para al quran, daftar juz, teks arab al quran, al quran digital, quran indonesia, juz lengkap'
    };

    if (loading) {
        return (
            <PageTransition isLoading={true}>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner size="lg" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
                            <div className="text-center">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={loadJuzList}
                                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <SEOHead {...juzSEO} />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                <div className="max-w-6xl mx-auto px-4 py-8 pt-24 pb-20">
                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl mx-auto mb-4">
                                <IoBookOutline className="text-3xl" />
                            </div>
                            <h1 className="text-3xl font-bold text-green-800 mb-2">
                                Daftar Juz Al-Quran
                            </h1>
                            <p className="text-green-600 text-lg">
                                Akses semua Juz (Para) Al-Quran dengan teks Arab lengkap
                            </p>
                            <div className="mt-4 text-sm text-gray-600">
                                Total {juzNumbers.length} Juz tersedia
                            </div>
                        </div>
                    </div>

                    {/* Juz Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {juzNumbers.map((juzNumber) => (
                            <div
                                key={juzNumber}
                                onClick={() => handleJuzClick(juzNumber)}
                                className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                            >
                                <div className="text-center">
                                    {/* Juz Number */}
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-2xl font-bold">{juzNumber}</span>
                                    </div>
                                    
                                    {/* Juz Info */}
                                    <h3 className="text-xl font-bold text-green-800 mb-2 group-hover:text-green-600 transition-colors">
                                        Juz {juzNumber}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 mb-4">
                                        Para {juzNumber}
                                    </p>
                                    
                                    {/* Action Button */}
                                    <div className="flex items-center justify-center text-green-600 group-hover:text-green-800 transition-colors">
                                        <span className="text-sm font-medium mr-2">Baca Teks Arab</span>
                                        <IoArrowForwardOutline className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border border-green-100">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-800 mb-4">
                                Tentang Juz Al-Quran
                            </h2>
                            <div className="max-w-4xl mx-auto">
                                <p className="text-gray-700 mb-4">
                                    Al-Quran dibagi menjadi 30 Juz (Para) untuk memudahkan pembacaan dan hafalan. 
                                    Setiap Juz berisi sekitar 20 halaman dengan jumlah ayat yang bervariasi.
                                </p>
                                <p className="text-gray-700">
                                    Halaman ini menampilkan teks Arab lengkap dari setiap Juz, diorganisir berdasarkan 
                                    surah dan ayat untuk memudahkan pembacaan dan pembelajaran.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default JuzListPage;
