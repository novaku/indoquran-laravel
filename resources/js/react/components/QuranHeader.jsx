import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
    Bars3Icon, 
    XMarkIcon, 
    MagnifyingGlassIcon,
    UserIcon,
    BookOpenIcon,
    HeartIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    ChevronDownIcon,
    DocumentTextIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    AcademicCapIcon,
    Squares2X2Icon,
    DocumentIcon
} from '@heroicons/react/24/outline';

function QuranHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isQuranDropdownOpen, setIsQuranDropdownOpen] = useState(false);
    const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
    const [isMainNavDropdownOpen, setIsMainNavDropdownOpen] = useState(false);
    const [isQuranMobileDropdownOpen, setIsQuranMobileDropdownOpen] = useState(false);
    const [isCommunityMobileDropdownOpen, setIsCommunityMobileDropdownOpen] = useState(false);
    const [isUserMobileDropdownOpen, setIsUserMobileDropdownOpen] = useState(false);
    const [isMainNavMobileDropdownOpen, setIsMainNavMobileDropdownOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMainNavDropdownOpen(false);
        setIsQuranDropdownOpen(false);
        setIsCommunityDropdownOpen(false);
        setIsQuranMobileDropdownOpen(false);
        setIsCommunityMobileDropdownOpen(false);
        setIsUserMobileDropdownOpen(false);
        setIsMainNavMobileDropdownOpen(false);
    }, [location]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
            if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-button')) {
                setIsUserMenuOpen(false);
            }
            if (!event.target.closest('.main-nav-dropdown') && !event.target.closest('.main-nav-dropdown-button')) {
                setIsMainNavDropdownOpen(false);
            }
            if (!event.target.closest('.quran-dropdown') && !event.target.closest('.quran-dropdown-button')) {
                setIsQuranDropdownOpen(false);
            }
            if (!event.target.closest('.community-dropdown') && !event.target.closest('.community-dropdown-button')) {
                setIsCommunityDropdownOpen(false);
            }
        };

        // Add both mouse and touch events for better mobile support
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    // Handle search menu click to reload search page
    const handleSearchClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/cari') {
            // If already on search page, reload it by navigating to clean search page
            navigate('/cari', { replace: true });
            // Force page reload to reset all states
            window.location.reload();
        } else {
            // If not on search page, navigate to it normally
            navigate('/cari');
        }
    };

    const mainNavItems = [
        { name: 'Beranda', path: '/', icon: BookOpenIcon, description: 'Halaman utama IndoQuran' },
        { name: 'Pencarian', path: '/cari', icon: MagnifyingGlassIcon, description: 'Cari ayat dan surah' },
        { name: 'Riwayat Versi', path: '/riwayat-versi', icon: ClockIcon, description: 'Catatan perubahan aplikasi' },
    ];

    const quranDropdownItems = [
        { name: 'Daftar Surah', path: '/surah', icon: BookOpenIcon, description: 'Jelajahi 114 surah Al-Quran' },
        { name: 'Juz', path: '/juz', icon: Squares2X2Icon, description: 'Baca berdasarkan juz (para)' },
        { name: 'Halaman', path: '/halaman', icon: DocumentIcon, description: 'Baca berdasarkan halaman mushaf' },
        { name: 'Asmaul Husna', path: '/asmaul-husna', icon: StarIcon, description: '99 nama indah Allah SWT' },
        { name: 'Tafsir Maudhui', path: '/tafsir-maudhui', icon: AcademicCapIcon, description: 'Topik-topik tematik dalam Al-Quran' },
    ];

    const communityDropdownItems = [
        { name: 'Doa Bersama', path: '/doa-bersama', icon: HeartIcon, description: 'Berbagi dan berdoa bersama' },
        { name: 'Donasi', path: '/donasi', icon: SparklesIcon, description: 'Dukung pengembangan IndoQuran' },
    ];

    const userNavItems = user ? [
        { name: 'Penanda', path: '/penanda', icon: HeartIcon },
        { name: 'Profil', path: '/profil', icon: UserIcon },
    ] : [];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    // Check if any dropdown items are active
    const isMainNavDropdownActive = mainNavItems.some(item => isActivePath(item.path));
    const isQuranDropdownActive = quranDropdownItems.some(item => isActivePath(item.path));
    const isCommunityDropdownActive = communityDropdownItems.some(item => isActivePath(item.path));

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 group"
                        >
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <BookOpenIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                IndoQuran
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {/* Main Navigation Dropdown */}
                        <div className="relative main-nav-dropdown">
                            <button
                                className={`main-nav-dropdown-button flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                                    isMainNavDropdownActive 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setIsMainNavDropdownOpen(!isMainNavDropdownOpen)}
                                style={{ minHeight: '44px', minWidth: '120px' }}
                            >
                                <BookOpenIcon className="w-4 h-4" />
                                <span>Navigasi</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMainNavDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isMainNavDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {mainNavItems.map((item) => (
                                        item.name === 'Pencarian' ? (
                                            <button
                                                key={item.path}
                                                onClick={handleSearchClick}
                                                className={`flex items-start space-x-3 px-4 py-4 text-sm transition-colors touch-manipulation w-full text-left border-none bg-transparent ${
                                                    isActivePath(item.path)
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '56px' }}
                                            >
                                                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                </div>
                                            </button>
                                        ) : (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-start space-x-3 px-4 py-4 text-sm transition-colors touch-manipulation ${
                                                    isActivePath(item.path)
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '56px' }}
                                            >
                                                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                </div>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Al-Quran Dropdown */}
                        <div className="relative quran-dropdown">
                            <button
                                className={`quran-dropdown-button flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                                    isQuranDropdownActive 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setIsQuranDropdownOpen(!isQuranDropdownOpen)}
                                style={{ minHeight: '44px', minWidth: '120px' }}
                            >
                                <BookOpenIcon className="w-4 h-4" />
                                <span>Al-Quran</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isQuranDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isQuranDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {quranDropdownItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-start space-x-3 px-4 py-4 text-sm transition-colors touch-manipulation ${
                                                isActivePath(item.path)
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                            }`}
                                            style={{ minHeight: '56px' }}
                                        >
                                            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Community Dropdown */}
                        <div className="relative community-dropdown">
                            <button
                                className={`community-dropdown-button flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                                    isCommunityDropdownActive 
                                        ? 'text-green-600 bg-green-50' 
                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                }`}
                                onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
                                style={{ minHeight: '44px', minWidth: '120px' }}
                            >
                                <HeartIcon className="w-4 h-4" />
                                <span>Komunitas</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCommunityDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCommunityDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {communityDropdownItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-start space-x-3 px-4 py-4 text-sm transition-colors touch-manipulation ${
                                                isActivePath(item.path)
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                            }`}
                                            style={{ minHeight: '56px' }}
                                        >
                                            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* User Menu & Mobile Menu Button */}
                    <div className="flex items-center space-x-4">
                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="hidden md:block relative user-menu">
                                <button
                                    className={`user-menu-button flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${
                                        userNavItems.some(item => isActivePath(item.path))
                                            ? 'text-green-600 bg-green-50' 
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    style={{ minHeight: '44px', minWidth: '120px' }}
                                >
                                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span>{user.name}</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        {userNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-start space-x-3 px-4 py-4 text-sm transition-colors touch-manipulation ${
                                                    isActivePath(item.path)
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '56px' }}
                                            >
                                                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.name === 'Penanda' ? 'Ayat yang telah ditandai' : 'Pengaturan akun'}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        <hr className="my-2 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-start space-x-3 px-4 py-4 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 active:bg-gray-100 transition-colors touch-manipulation w-full text-left border-none bg-transparent"
                                            style={{ minHeight: '56px' }}
                                        >
                                            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">Keluar</div>
                                                <div className="text-xs text-gray-500 mt-1">Logout dari akun</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/masuk"
                                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Masuk
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="mobile-menu-button md:hidden p-3 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors touch-manipulation"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ minHeight: '44px', minWidth: '44px' }} // iOS recommended touch target size
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="mobile-menu md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-1">
                            {/* Main Navigation Section */}
                            <div className="pt-4">
                                <button
                                    onClick={() => setIsMainNavMobileDropdownOpen(!isMainNavMobileDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors touch-manipulation"
                                    style={{ minHeight: '44px' }}
                                >
                                    <span>Navigasi</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMainNavMobileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isMainNavMobileDropdownOpen && (
                                    <div className="space-y-1">
                                        {mainNavItems.map((item) => (
                                            item.name === 'Pencarian' ? (
                                                <button
                                                    key={item.path}
                                                    onClick={handleSearchClick}
                                                    className={`w-full text-left flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium transition-colors touch-manipulation border-none bg-transparent ${
                                                        isActivePath(item.path)
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                    style={{ minHeight: '56px' }}
                                                >
                                                    <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                    </div>
                                                </button>
                                            ) : (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className={`flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium transition-colors touch-manipulation ${
                                                        isActivePath(item.path)
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                    style={{ minHeight: '56px' }}
                                                >
                                                    <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                    </div>
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Al-Quran Section */}
                            <div className="pt-4">
                                <button
                                    onClick={() => setIsQuranMobileDropdownOpen(!isQuranMobileDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors touch-manipulation"
                                    style={{ minHeight: '44px' }}
                                >
                                    <span>Al-Quran</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isQuranMobileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isQuranMobileDropdownOpen && (
                                    <div className="space-y-1">
                                        {quranDropdownItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium transition-colors touch-manipulation ${
                                                    isActivePath(item.path)
                                                        ? 'text-green-600 bg-green-50'
                                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '56px' }}
                                            >
                                                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Community Section */}
                            <div className="pt-4">
                                <button
                                    onClick={() => setIsCommunityMobileDropdownOpen(!isCommunityMobileDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors touch-manipulation"
                                    style={{ minHeight: '44px' }}
                                >
                                    <span>Komunitas</span>
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isCommunityMobileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isCommunityMobileDropdownOpen && (
                                    <div className="space-y-1">
                                        {communityDropdownItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium transition-colors touch-manipulation ${
                                                    isActivePath(item.path)
                                                        ? 'text-green-600 bg-green-50'
                                                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '56px' }}
                                            >
                                                <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <>
                                    <hr className="my-4 border-gray-200" />
                                    
                                    {/* User Section */}
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setIsUserMobileDropdownOpen(!isUserMobileDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors touch-manipulation"
                                            style={{ minHeight: '44px' }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span>{user.name}</span>
                                            </div>
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserMobileDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {isUserMobileDropdownOpen && (
                                            <div className="space-y-1">
                                                {userNavItems.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className={`flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium transition-colors touch-manipulation ${
                                                            isActivePath(item.path)
                                                                ? 'text-green-600 bg-green-50'
                                                                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                                                        }`}
                                                        style={{ minHeight: '56px' }}
                                                    >
                                                        <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.name === 'Penanda' ? 'Ayat yang telah ditandai' : 'Pengaturan akun'}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                                
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-start space-x-3 px-6 py-4 ml-4 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation w-full text-left border-none bg-transparent"
                                                    style={{ minHeight: '56px' }}
                                                >
                                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium">Keluar</div>
                                                        <div className="text-xs text-gray-500 mt-1">Logout dari akun</div>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <hr className="my-4 border-gray-200" />
                                    <Link
                                        to="/masuk"
                                        className="block px-4 py-4 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors text-center touch-manipulation"
                                        style={{ minHeight: '48px' }}
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default QuranHeader;
