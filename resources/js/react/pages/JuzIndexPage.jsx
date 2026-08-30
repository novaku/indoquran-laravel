import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseInFeed from '../components/AdSenseInFeed';
import AdSenseHorizontal from '../components/AdSenseHorizontal';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { scrollToTop } from '../utils/scrollUtils';

function JuzIndexPage() {
    const navigate = useNavigate();
    const [juzNumbers, setJuzNumbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        scrollToTop();
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
                title="Daftar Juz Al Quran (1-30) - Arab Saja & Terjemahan | IndoQuran"
                description="Jelajahi 30 Juz Al-Quran dengan navigasi cepat. Tersedia mode baca teks Arab, audio murottal, dan referensi terjemahan untuk belajar harian."
                keywords="daftar juz al quran, juz arab saja, para al quran, juz 15 arab saja, juz lengkap, quran indonesia"
                canonicalUrl="https://indoquran.web.id/juz"
            />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                        Jelajahi Al-Quran berdasarkan Juz (Para)
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                        Al-Quran dibagi menjadi 30 Juz (Para) terstruktur untuk memudahkan target tilawah harian dan tadarus khatam Al-Quran.
                    </p>
                </div>
            </div>

            {/* Top Billboard Ad (Detik.com Pattern) */}
            <AdSenseLeaderboard maxWidth="max-w-7xl" labelText="IKLAN" className="my-4 sm:my-6" />

            {/* Juz List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                {/* Juz Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {juzNumbers.map((juz, index) => {
                        const showInFeedAd = index === 6 || index === 18;

                        return (
                            <React.Fragment key={juz.number}>
                                {showInFeedAd && (
                                    <AdSenseInFeed 
                                        adSlot="1519827772"
                                        labelText="IKLAN REKOMENDASI"
                                        className="h-full"
                                    />
                                )}
                                <button
                                    onClick={() => handleJuzClick(juz.number)}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/90 hover:shadow-md hover:border-green-400 transition-all text-left group cursor-pointer flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                            <BookOpenIcon className="w-6 h-6 text-green-700 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-green-600 font-medium transition-colors">
                                            <span>Buka</span>
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-baseline justify-between mb-1">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                Juz {juz.number}
                                            </h3>
                                            <p className="font-arabic text-xl font-bold text-gray-700 group-hover:text-green-800">
                                                {juz.name_arabic}
                                            </p>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Dimulai dari <span className="font-semibold text-gray-700">{juz.starting_surah}</span>
                                        </p>
                                    </div>
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Bottom Break Ad before Info Section */}
                <div className="my-8">
                    <AdSenseHorizontal 
                        adSlot="1519827772"
                        showLabel={true}
                        labelText="IKLAN"
                        minHeight="90px"
                    />
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang 30 Juz Al-Quran</h2>
                    <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>
                            Juz (juga dikenal sebagai Para) adalah salah satu dari tiga puluh bagian Al-Quran yang sama panjangnya. 
                            Pembagian ini dibuat untuk membantu umat Muslim membaca seluruh Al-Quran dalam waktu satu bulan (khatam), 
                            dengan membaca satu Juz per hari secara konsisten.
                        </p>
                        <p>
                            Setiap Juz berisi sekitar 20 halaman dalam Mushaf Standar Indonesia / Madinah, 
                            sehingga sangat cocok untuk jadwal tilawah harian selama bulan suci Ramadan maupun hari-hari biasa.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                    <span>📊</span> Fakta Singkat
                                </h3>
                                <ul className="text-xs text-gray-600 space-y-1.5">
                                    <li>• Total 30 Juz (114 Surah, 6.236 Ayat)</li>
                                    <li>• Rata-rata 20 halaman per Juz (604 halaman mushaf)</li>
                                    <li>• Ideal untuk program tilawah 1 bulan khatam</li>
                                    <li>• Dilengkapi teks Arab, transliterasi Latin, dan terjemahan resmi</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                                    <span>💡</span> Tips Tadarus Harian
                                </h3>
                                <ul className="text-xs text-gray-600 space-y-1.5">
                                    <li>• Alokasikan waktu tetap 20-30 menit setiap hari</li>
                                    <li>• Dengarkan audio murottal untuk membetulkan makhraj & tajwid</li>
                                    <li>• Baca dan renungkan makna terjemahan bahasa Indonesia</li>
                                    <li>• Gunakan fitur bookmark/penanda untuk mencatat progres bacaan</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/surah"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-2xs text-sm"
                    >
                        <BookOpenIcon className="w-5 h-5 text-green-600" />
                        <span>Jelajahi berdasarkan Surah</span>
                    </Link>
                    <Link
                        to="/halaman"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-xs text-sm"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Jelajahi berdasarkan Halaman Mushaf</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default JuzIndexPage;
