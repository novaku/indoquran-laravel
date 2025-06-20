import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    ChevronRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

function SimpleJuzListPage() {
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
            
            // Generate default Juz list (1-30) if API doesn't provide specific data
            const defaultJuzList = Array.from({ length: 30 }, (_, index) => ({
                number: index + 1,
                name: `Juz ${index + 1}`,
                name_arabic: `الجزء ${index + 1}`,
                starting_surah: getStartingSurah(index + 1),
                starting_verse: getStartingVerse(index + 1)
            }));
            
            setJuzNumbers(defaultJuzList);
        } catch (err) {
            console.error('Error loading Juz list:', err);
            setError('Gagal memuat daftar Juz. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get starting surah for each Juz
    const getStartingSurah = (juzNumber) => {
        const juzStartingSurahs = {
            1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Al-Baqarah', 4: 'Ali \'Imran',
            5: 'Ali \'Imran', 6: 'An-Nisa', 7: 'Al-Ma\'idah', 8: 'Al-An\'am',
            9: 'Al-A\'raf', 10: 'Al-Anfal', 11: 'At-Tawbah', 12: 'Hud',
            13: 'Yusuf', 14: 'Al-Hijr', 15: 'Al-Isra', 16: 'Al-Kahf',
            17: 'Al-Anbya', 18: 'Al-Mu\'minun', 19: 'Al-Furqan', 20: 'An-Naml',
            21: 'Al-Ankabut', 22: 'As-Sajdah', 23: 'Ya-Sin', 24: 'Az-Zumar',
            25: 'Fussilat', 26: 'Al-Ahqaf', 27: 'Adh-Dhariyat', 28: 'Al-Mujadila',
            29: 'Al-Mulk', 30: 'An-Naba'
        };
        return juzStartingSurahs[juzNumber] || `Juz ${juzNumber}`;
    };

    // Helper function to get starting verse for each Juz
    const getStartingVerse = (juzNumber) => {
        // This is a simplified mapping - in a real app, this would come from the API
        return 1;
    };

    const handleJuzClick = (juzNumber) => {
        navigate(`/juz/${juzNumber}`);
    };

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
                        onClick={loadJuzList}
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
                title="Jelajahi berdasarkan Juz (Para) - IndoQuran"
                description="Jelajahi dan baca Al-Quran yang disusun berdasarkan Juz (Para). Semua 30 Juz Al-Quran dengan teks Arab dan terjemahan."
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
                            Jelajahi berdasarkan Juz (Para)
                        </h1>
                        <p className="text-gray-600">
                            Al-Quran dibagi menjadi 30 Juz (juga disebut Para) untuk memudahkan pembacaan
                        </p>
                    </div>
                </div>
            </div>

            {/* Juz List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {juzNumbers.map((juz) => (
                        <button
                            key={juz.number}
                            onClick={() => handleJuzClick(juz.number)}
                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <BookOpenIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 mb-1">
                                    Juz {juz.number}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Dimulai dengan {juz.starting_surah}
                                </p>
                                <p className="font-arabic text-right text-gray-700">
                                    {juz.name_arabic}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Info Section */}
                <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tentang Juz (Para)</h2>
                    <div className="space-y-4 text-gray-700">
                        <p>
                            Juz (juga dikenal sebagai Para di beberapa daerah) adalah salah satu dari tiga puluh bagian Al-Quran. 
                            Pembagian ini dibuat untuk membantu umat Muslim membaca seluruh Al-Quran dalam waktu satu bulan, 
                            dengan membaca satu Juz per hari.
                        </p>
                        <p>
                            Setiap Juz berisi sekitar 20 halaman dalam Mushaf standar (teks Al-Quran), 
                            sehingga mudah untuk dibaca setiap hari selama Ramadan atau studi rutin.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Fakta Singkat</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Total 30 Juz</li>
                                    <li>• ~20 halaman setiap Juz</li>
                                    <li>• Sempurna untuk bacaan bulanan</li>
                                    <li>• Digunakan selama Ramadan</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Tips Membaca</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Baca satu Juz setiap hari</li>
                                    <li>• Luangkan waktu untuk pelafalan</li>
                                    <li>• Renungkan maknanya</li>
                                    <li>• Gunakan audio untuk bacaan yang benar</li>
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
                        <span>Jelajahi berdasarkan Surah</span>
                    </Link>
                    <Link
                        to="/halaman"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Jelajahi berdasarkan Halaman</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SimpleJuzListPage;
