import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import {
    XMarkIcon,
    MagnifyingGlassIcon,
    UserIcon,
    BookOpenIcon,
    HeartIcon,
    ArrowRightStartOnRectangleIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    AcademicCapIcon,
    Squares2X2Icon,
    DocumentIcon,
    ChartBarIcon,
    HomeIcon,
    BookmarkIcon,
    InformationCircleIcon,
    EnvelopeIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [isMainNavOpen, setIsMainNavOpen] = useState(true);
    const [isQuranOpen, setIsQuranOpen] = useState(true);
    const [isCommunityOpen, setIsCommunityOpen] = useState(true);
    const [isInfoOpen, setIsInfoOpen] = useState(true);

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location, setIsOpen]);

    // Close sidebar when clicking overlay
    const handleOverlayClick = () => {
        setIsOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/cari') {
            navigate('/cari', { replace: true });
            window.location.reload();
        } else {
            navigate('/cari');
        }
    };

    const mainNavItems = [
        { name: 'Beranda', path: '/', icon: HomeIcon, description: 'Halaman utama IndoQuran' },
        { name: 'Pencarian', path: '/cari', icon: MagnifyingGlassIcon, description: 'Cari ayat dan surah', onClick: handleSearchClick },
        { name: 'Statistik', path: '/statistik', icon: ChartBarIcon, description: 'Statistik komunitas dan aktivitas' },
        { name: 'Riwayat Versi', path: '/riwayat-versi', icon: ClockIcon, description: 'Catatan perubahan aplikasi' },
    ];

    const quranDropdownItems = [
        { name: 'Daftar Surah', path: '/surah', icon: BookOpenIcon, description: 'Jelajahi 114 surah Al-Quran' },
        { name: 'Juz', path: '/juz', icon: Squares2X2Icon, description: 'Baca berdasarkan juz (para)' },
        { name: 'Halaman', path: '/halaman', icon: DocumentIcon, description: 'Baca berdasarkan halaman mushaf' },
        { name: 'Penanda & Favorit', path: '/penanda', icon: BookmarkIcon, description: 'Ayat yang telah Anda tandai' },
        { name: 'Asmaul Husna', path: '/asmaul-husna', icon: StarIcon, description: '99 nama indah Allah SWT' },
        { name: 'Tafsir Maudhui', path: '/tafsir-maudhui', icon: AcademicCapIcon, description: 'Topik-topik tematik dalam Al-Quran' },
        { name: 'Artikel', path: '/artikel', icon: DocumentTextIcon, description: 'Artikel islami dan kajian Al-Quran' },
    ];

    const communityDropdownItems = [
        { name: 'Doa Bersama', path: '/doa-bersama', icon: HeartIcon, description: 'Berbagi dan berdoa bersama' },
        { name: 'Keuntungan Member', path: '/member', icon: UserIcon, description: 'Fitur eksklusif untuk member' },
        { name: 'Donasi', path: '/donasi', icon: SparklesIcon, description: 'Dukung pengembangan IndoQuran' },
    ];

    const infoDropdownItems = [
        { name: 'Tentang Kami', path: '/tentang', icon: InformationCircleIcon, description: 'Kenali visi dan misi IndoQuran' },
        { name: 'Kontak & Bantuan', path: '/kontak', icon: EnvelopeIcon, description: 'Hubungi tim dan sampaikan masukan' },
        { name: 'Kebijakan Privasi', path: '/kebijakan', icon: ShieldCheckIcon, description: 'Kebijakan privasi dan ketentuan' },
    ];

    const userNavItems = user ? [
        ...(user.is_admin ? [
            { name: 'Panel Admin', path: '/admin/dashboard', icon: Squares2X2Icon, description: 'Kelola website & statistik', isAdminItem: true }
        ] : []),
        { name: 'Penanda', path: '/penanda', icon: HeartIcon, description: 'Ayat yang telah ditandai' },
        { name: 'Profil', path: '/profil', icon: UserIcon, description: 'Pengaturan akun' },
    ] : [];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Overlay with Blur Effect */}
            {isOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40 transition-all duration-300"
                    onClick={handleOverlayClick}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            IndoQuran
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="px-2 py-4 space-y-2">
                    {/* Main Navigation Section */}
                    <div>
                        <button
                            onClick={() => setIsMainNavOpen(!isMainNavOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors"
                        >
                            <span>Navigasi</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMainNavOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isMainNavOpen && (
                            <div className="mt-1 space-y-1">
                                {mainNavItems.map((item) => (
                                    item.onClick ? (
                                        <button
                                            key={item.path}
                                            onClick={item.onClick}
                                            className={`w-full flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                                isActivePath(item.path)
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div className="text-left">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                            </div>
                                        </button>
                                    ) : (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                                isActivePath(item.path)
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                            </div>
                                        </Link>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Al-Quran Section */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsQuranOpen(!isQuranOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors"
                        >
                            <span>Al-Quran</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isQuranOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isQuranOpen && (
                            <div className="mt-1 space-y-1">
                                {quranDropdownItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                            isActivePath(item.path)
                                                ? 'bg-green-50 text-green-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Community Section */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors"
                        >
                            <span>Komunitas</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCommunityOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCommunityOpen && (
                            <div className="mt-1 space-y-1">
                                {communityDropdownItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                            isActivePath(item.path)
                                                ? 'bg-green-50 text-green-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information Section */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors"
                        >
                            <span>Informasi</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isInfoOpen && (
                            <div className="mt-1 space-y-1">
                                {infoDropdownItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                            isActivePath(item.path)
                                                ? 'bg-green-50 text-green-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Section */}
                    {user && (
                        <div className="pt-4 border-t border-gray-200 mt-4">
                            <div className="px-3 py-2 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {user.is_admin ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                Administrator
                                            </span>
                                        ) : (
                                            <span>Member</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                {userNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                                            item.isAdminItem
                                                ? 'bg-emerald-50 text-emerald-900 font-semibold hover:bg-emerald-100/80 border border-emerald-100'
                                                : isActivePath(item.path)
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                    >
                                        <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.isAdminItem ? 'text-emerald-700' : ''}`} />
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-start space-x-3 px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                                >
                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="text-left">
                                        <div className="font-medium">Keluar</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Logout dari akun</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Login Button for Guest */}
                    {!user && (
                        <div className="pt-4 border-t border-gray-200 mt-4 px-3">
                            <Link
                                to="/masuk"
                                className="block w-full px-4 py-3 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors text-center"
                            >
                                Masuk
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
