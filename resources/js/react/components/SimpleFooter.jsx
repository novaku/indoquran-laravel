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

function SimpleFooter() {
    const currentYear = new Date().getFullYear();
    const [surahs, setSurahs] = useState([]);
    const [popularSurahs, setPopularSurahs] = useState([]);
    const [loadingPopular, setLoadingPopular] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Fetch popular/random surahs
    const fetchPopularSurahs = useCallback(async () => {
        setLoadingPopular(true);
        try {
            const token = authUtils.getAuthToken();
            const response = await fetchWithAuth('/api/surahs/random?count=7', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch popular surahs');
            const result = await response.json();
            
            if (result.status === 'success') {
                setPopularSurahs(result.data);
            } else {
                throw new Error("Failed to load popular surahs");
            }
        } catch (error) {
            console.error('Error fetching popular surahs:', error);
            // Fallback to featured surahs if API fails
            if (surahs.length > 0) {
                const featured = [
                    surahs.find(s => s.number === 1), // Al-Fatihah
                    surahs.find(s => s.number === 2), // Al-Baqarah
                    surahs.find(s => s.number === 18), // Al-Kahf
                    surahs.find(s => s.number === 36), // Ya-Sin
                    surahs.find(s => s.number === 55), // Ar-Rahman
                    surahs.find(s => s.number === 67), // Al-Mulk
                    surahs.find(s => s.number === 112), // Al-Ikhlas
                ].filter(Boolean);
                setPopularSurahs(featured);
            }
        } finally {
            setLoadingPopular(false);
        }
    }, [surahs]);

    // Fetch surahs data
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
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
                    setSurahs(result.data);
                } else {
                    throw new Error("Failed to load surahs");
                }
            } catch (error) {
                console.error('Error fetching surahs:', error);
            }
        };

        fetchSurahs();
    }, []);

    // Fetch popular surahs when surahs are loaded
    useEffect(() => {
        if (surahs.length > 0) {
            fetchPopularSurahs();
        }
    }, [surahs, fetchPopularSurahs]);

    const handleRefreshPopular = () => {
        fetchPopularSurahs();
    };

    const footerLinks = {
        'Navigasi': [
            { name: 'Beranda', path: '/' },
            { name: 'Cari', path: '/cari' },
            { name: 'Jelajahi Juz', path: '/juz' },
            { name: 'Jelajahi Halaman', path: '/halaman' },
            { name: 'Doa Bersama', path: '/doa-bersama' },
        ],
        'Pelajari': [
            { name: 'Tentang Al-Quran', path: '/tentang' },
            { name: 'Tentang Kami', path: '/tentang' },
            { name: 'Donasi', path: '/donasi' },
            { name: 'Kontak', path: '/kontak' },
            { name: 'Kebijakan Privasi', path: '/kebijakan' },
        ],
        'Akun': [
            { name: 'Masuk', path: '/masuk' },
            { name: 'Buat Akun', path: '/daftar' },
            { name: 'Penanda Saya', path: '/penanda' },
            { name: 'Profil Saya', path: '/profil' },
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
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                    <BookOpenIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">IndoQuran</span>
                            </div>
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
                                            <Link
                                                to={link.path}
                                                onClick={scrollToTop}
                                                className="text-gray-300 hover:text-white transition-colors text-sm"
                                            >
                                                {link.name}
                                            </Link>
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
                        
                        <div className="flex items-center space-x-6 text-sm">
                            <Link 
                                to="/kebijakan"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Privasi
                            </Link>
                            <Link 
                                to="/tentang"
                                onClick={scrollToTop}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Ketentuan
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

export default SimpleFooter;
