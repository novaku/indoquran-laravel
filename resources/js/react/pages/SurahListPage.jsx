import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    MapPinIcon,
    PlayIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';

function SurahListPage() {
    const navigate = useNavigate();
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlace, setFilterPlace] = useState('all'); // all, makkah, madinah

    useEffect(() => {
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = authUtils.getAuthToken();
            const response = await fetchWithAuth('/api/surahs', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch surahs');
            const result = await response.json();
            
            if (result.status === 'success') {
                setSurahs(result.data || []);
            } else {
                throw new Error(result.message || 'Failed to load surahs');
            }
        } catch (err) {
            console.error('Error loading surahs:', err);
            setError('Gagal memuat daftar surah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleSurahClick = (surahNumber) => {
        navigate(`/surah/${surahNumber}`);
    };

    // Filter surahs based on search and place
    const filteredSurahs = surahs.filter(surah => {
        const matchesSearch = !searchTerm || 
            surah.name_latin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.name_indonesian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.name_arabic?.includes(searchTerm) ||
            surah.number.toString().includes(searchTerm);
        
        const matchesPlace = filterPlace === 'all' || 
            surah.revelation_place?.toLowerCase() === filterPlace.toLowerCase();
        
        return matchesSearch && matchesPlace;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Memuat daftar surah...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadSurahs}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEOHead 
                title="Daftar Surah Al-Quran - IndoQuran"
                description="Jelajahi dan baca semua 114 surah Al-Quran lengkap dengan terjemahan bahasa Indonesia. Pilih surah berdasarkan tempat turunnya di Makkah atau Madinah."
                keywords="daftar surah, al quran indonesia, 114 surah, surah makkiyah madaniyah, quran indonesia, surah al quran lengkap"
            />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <Link
                                to="/"
                                className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span className="ml-2 hidden sm:inline">Kembali ke Beranda</span>
                            </Link>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-6">
                            <BookOpenIcon className="w-8 h-8 text-green-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Daftar Surah Al-Quran</h1>
                                <p className="text-gray-600">114 Surah dalam Al-Quran Karim</p>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari surah (nama, nomor, atau tempat turun)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Filter by revelation place */}
                            <select
                                value={filterPlace}
                                onChange={(e) => setFilterPlace(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            >
                                <option value="all">Semua Tempat</option>
                                <option value="makkah">Makkiyah</option>
                                <option value="madinah">Madaniyah</option>
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>Total: {filteredSurahs.length} surah</span>
                            <span>•</span>
                            <span>Makkiyah: {surahs.filter(s => s.revelation_place?.toLowerCase() === 'makkah').length}</span>
                            <span>•</span>
                            <span>Madaniyah: {surahs.filter(s => s.revelation_place?.toLowerCase() === 'madinah').length}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {filteredSurahs.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada surah ditemukan</h3>
                            <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter yang digunakan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSurahs.map((surah) => (
                                <div
                                    key={surah.number}
                                    onClick={() => handleSurahClick(surah.number)}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group"
                                >
                                    {/* Surah Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-green-700 transition-colors">
                                                {surah.number}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                                    {surah.name_latin}
                                                </h3>
                                                <p className="text-sm text-gray-500">{surah.name_indonesian}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Revelation place badge */}
                                        <div className="flex items-center space-x-1">
                                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                surah.revelation_place?.toLowerCase() === 'makkah' 
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {surah.revelation_place === 'makkah' ? 'Makkiyah' : 'Madaniyah'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arabic Name */}
                                    <div className="text-center mb-4">
                                        <p className="text-2xl font-arabic text-gray-800 leading-loose" dir="rtl">
                                            {surah.name_arabic}
                                        </p>
                                    </div>

                                    {/* Surah Info */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <span>{surah.total_ayahs} ayat</span>
                                        <div className="flex items-center space-x-2">
                                            {/* Popular surah indicator */}
                                            {[1, 2, 18, 36, 55, 67, 112, 113, 114].includes(surah.number) && (
                                                <div className="flex items-center space-x-1">
                                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-xs text-yellow-600">Populer</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {surah.description_short && (
                                        <div className="text-sm text-gray-600 mb-4">
                                            <p 
                                                className="line-clamp-3"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: surah.description_short.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
                                            <BookOpenIcon className="w-4 h-4" />
                                            <span className="text-sm font-medium">Baca</span>
                                        </button>
                                        
                                        {surah.audio_urls && (
                                            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                                                <PlayIcon className="w-4 h-4" />
                                                <span className="text-sm">Audio</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Navigation */}
                <div className="bg-white border-t border-gray-200 py-8">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigasi Cepat</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/juz"
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                <span>Jelajahi berdasarkan Juz</span>
                            </Link>
                            <Link
                                to="/halaman"
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                <span>Jelajahi berdasarkan Halaman</span>
                            </Link>
                            <Link
                                to="/cari"
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5" />
                                <span>Pencarian Ayat</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SurahListPage;
