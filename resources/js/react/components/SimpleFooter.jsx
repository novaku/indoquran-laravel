import React from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpenIcon,
    HeartIcon,
    EnvelopeIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

function SimpleFooter() {
    const currentYear = new Date().getFullYear();

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
                    <h3 className="text-white font-semibold mb-4">Surah Populer</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                        <Link to="/surah/1" className="text-gray-300 hover:text-white transition-colors">
                            Al-Fatihah
                        </Link>
                        <Link to="/surah/2" className="text-gray-300 hover:text-white transition-colors">
                            Al-Baqarah
                        </Link>
                        <Link to="/surah/18" className="text-gray-300 hover:text-white transition-colors">
                            Al-Kahf
                        </Link>
                        <Link to="/surah/36" className="text-gray-300 hover:text-white transition-colors">
                            Ya-Sin
                        </Link>
                        <Link to="/surah/55" className="text-gray-300 hover:text-white transition-colors">
                            Ar-Rahman
                        </Link>
                        <Link to="/surah/67" className="text-gray-300 hover:text-white transition-colors">
                            Al-Mulk
                        </Link>
                        <Link to="/surah/112" className="text-gray-300 hover:text-white transition-colors">
                            Al-Ikhlas
                        </Link>
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
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Privasi
                            </Link>
                            <Link 
                                to="/tentang" 
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Ketentuan
                            </Link>
                            <Link 
                                to="/kontak" 
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
