import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    HeartIcon,
    EnvelopeIcon,
    InformationCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';
import authUtils from '../utils/auth';
import { getCachedSurahs } from '../services/SurahDataService';

const FEATURED_SURAHS_DEFAULT = [
    { number: 1, name_latin: 'Al-Fatihah', name_arabic: 'الفاتحة', revelation_place: 'Mekah', total_ayahs: 7 },
    { number: 36, name_latin: 'Yasin', name_arabic: 'يس', revelation_place: 'Mekah', total_ayahs: 83 },
    { number: 18, name_latin: 'Al-Kahfi', name_arabic: 'الكهف', revelation_place: 'Mekah', total_ayahs: 110 },
    { number: 67, name_latin: 'Al-Mulk', name_arabic: 'الملك', revelation_place: 'Mekah', total_ayahs: 30 },
    { number: 55, name_latin: 'Ar-Rahman', name_arabic: 'الرحمن', revelation_place: 'Madinah', total_ayahs: 78 },
    { number: 56, name_latin: 'Al-Waqi\'ah', name_arabic: 'الواقعة', revelation_place: 'Mekah', total_ayahs: 96 },
    { number: 112, name_latin: 'Al-Ikhlas', name_arabic: 'الإخلاص', revelation_place: 'Mekah', total_ayahs: 4 }
];

function QuranFooter() {
    const currentYear = new Date().getFullYear();
    const [surahs, setSurahs] = useState(() => {
        const cached = getCachedSurahs();
        return cached?.data || [];
    });
    const [popularSurahs, setPopularSurahs] = useState(() => {
        const cached = getCachedSurahs();
        if (cached?.data && cached.data.length > 0) {
            return [1, 36, 18, 67, 55, 56, 112]
                .map(num => cached.data.find(s => s.number === num))
                .filter(Boolean);
        }
        return FEATURED_SURAHS_DEFAULT;
    });
    const [loadingPopular, setLoadingPopular] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Fetch popular/random surahs on-demand
    const fetchPopularSurahs = useCallback(async () => {
        setLoadingPopular(true);
        try {
            const token = authUtils.getAuthToken();
            const timestamp = Date.now();
            const response = await fetchWithAuth(`/api/surahs/random?count=7&_t=${timestamp}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch popular surahs');
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                setPopularSurahs(result.data);
            }
        } catch (error) {
            console.warn('Using fallback popular surahs in footer:', error);
        } finally {
            setLoadingPopular(false);
        }
    }, []);

    // Defer fetching surahs if cache is empty so initial page load is never blocked
    useEffect(() => {
        if (surahs.length > 0) return;

        const timer = setTimeout(async () => {
            try {
                const token = authUtils.getAuthToken();
                const response = await fetchWithAuth('/api/surahs', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        setSurahs(result.data);
                    }
                }
            } catch (error) {
                // Silently handle footer data fetch error
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [surahs.length]);

    const handleRefreshPopular = () => {
        fetchPopularSurahs();
    };

    const isUserAuthenticated = authUtils.isAuthenticated();
    
    const footerLinks = {
        'Al-Quran & Ibadah': [
            { name: 'Beranda', path: '/' },
            { name: 'Daftar Surah', path: '/surah' },
            { name: 'Jelajahi Juz', path: '/juz' },
            { name: 'Jelajahi Halaman', path: '/halaman' },
            { name: 'Pencarian Ayat', path: '/cari' },
            { name: 'Tafsir Maudhui', path: '/tafsir-maudhui' },
            { name: 'Asmaul Husna', path: '/asmaul-husna' },
            { name: 'Doa Bersama', path: '/doa-bersama' },
        ],
        'Fitur & Komunitas': [
            { name: 'Artikel Islami', path: '/artikel' },
            { name: 'Penanda & Favorit', path: '/penanda' },
            { name: 'Keuntungan Member', path: '/member' },
            { name: 'Statistik Komunitas', path: '/statistik' },
            { name: 'Donasi & Dukungan', path: '/donasi' },
        ],
        'Informasi & Akun': [
            { name: 'Tentang Kami', path: '/tentang' },
            { name: 'Kontak & Bantuan', path: '/kontak' },
            { name: 'Kebijakan Privasi', path: '/kebijakan' },
            { name: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
            { name: 'Riwayat Versi', path: '/riwayat-versi' },
            ...(isUserAuthenticated ? [
                { name: 'Profil Saya', path: '/profil' },
            ] : [
                { name: 'Masuk', path: '/masuk' },
                { name: 'Buat Akun', path: '/daftar' },
            ]),
        ]
    };

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-1">
                            <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
                                <img 
                                    src="/images/logo-icon.webp" 
                                    alt="IndoQuran Logo" 
                                    className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                                    width="32"
                                    height="32"
                                />
                                <span className="text-xl font-bold group-hover:text-emerald-400 transition-colors">IndoQuran</span>
                            </Link>
                            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                                Baca, Dengarkan, Cari, dan Renungkan Al-Quran. 
                                IndoQuran didedikasikan untuk membantu umat dalam mendalami 
                                Al-Quran melalui tilawah yang indah, terjemahan yang akurat, 
                                dan alat pembelajaran yang komprehensif.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Dibuat dengan <HeartIcon className="w-4 h-4 inline text-red-500" /> untuk umat Islam
                            </p>
                        </div>

                        {/* Navigation Links */}
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h3 className="text-white font-semibold mb-4">{category}</h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.path}>
                                            {link.external ? (
                                                <a
                                                    href={link.path}
                                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                                >
                                                    {link.name}
                                                </a>
                                            ) : (
                                                <Link
                                                    to={link.path}
                                                    onClick={scrollToTop}
                                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                                >
                                                    {link.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Surahs */}
                <div className="border-t border-gray-800 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Surah Populer</h3>
                        <button
                            onClick={handleRefreshPopular}
                            disabled={loadingPopular}
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Dapatkan surah acak"
                        >
                            <ArrowPathIcon className={`w-3 h-3 ${loadingPopular ? 'animate-spin' : ''}`} />
                            <span>Acak</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                        {loadingPopular ? (
                            // Loading skeleton
                            Array.from({ length: 7 }).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                                </div>
                            ))
                        ) : popularSurahs.length > 0 ? (
                            popularSurahs.map((surah) => (
                                <Link 
                                    key={surah.number}
                                    to={`/surah/${surah.number}`} 
                                    onClick={scrollToTop} 
                                    className="text-gray-300 hover:text-white transition-colors"
                                    title={`${surah.name_english} (${surah.name_arabic})`}
                                >
                                    {surah.name_latin}
                                </Link>
                            ))
                        ) : (
                            // Fallback static links
                            <>
                                <Link to="/surah/1" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Al-Fatihah
                                </Link>
                                <Link to="/surah/2" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Al-Baqarah
                                </Link>
                                <Link to="/surah/18" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Al-Kahf
                                </Link>
                                <Link to="/surah/36" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Ya-Sin
                                </Link>
                                <Link to="/surah/55" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Ar-Rahman
                                </Link>
                                <Link to="/surah/67" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Al-Mulk
                                </Link>
                                <Link to="/surah/112" onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
                                    Al-Ikhlas
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-800 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-gray-400 text-sm">
                            © {currentYear} IndoQuran. Hak Cipta Dilindungi
                        </div>
                        
                        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm">
                            <Link 
                                to="/tentang"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Tentang Kami
                            </Link>
                            <Link 
                                to="/kebijakan"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Kebijakan Privasi
                            </Link>
                            <Link 
                                to="/syarat-ketentuan"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Syarat & Ketentuan
                            </Link>
                            <Link 
                                to="/riwayat-versi"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Riwayat Versi
                            </Link>
                            <Link 
                                to="/kontak"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                            >
                                <EnvelopeIcon className="w-4 h-4" />
                                <span>Kontak</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default QuranFooter;
