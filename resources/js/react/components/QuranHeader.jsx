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
    ClockIcon
} from '@heroicons/react/24/outline';

function QuranHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    // State for menu visibility with debug logging
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isQuranDropdownOpen, setIsQuranDropdownOpen] = useState(false);
    const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
    const [isMainNavDropdownOpen, setIsMainNavDropdownOpen] = useState(false);
    
    // Debug the mobile menu state when it changes
    useEffect(() => {
        console.log('Mobile menu state:', isMobileMenuOpen);
    }, [isMobileMenuOpen]);
    
    // Handler for mobile menu toggle
    const handleMobileMenuToggle = () => {
        console.log('Mobile menu toggle clicked, current state:', isMobileMenuOpen);
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMainNavDropdownOpen(false);
        setIsQuranDropdownOpen(false);
        setIsCommunityDropdownOpen(false);
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
        { name: 'Juz', path: '/juz', icon: DocumentTextIcon, description: 'Baca berdasarkan juz (para)' },
        { name: 'Halaman', path: '/halaman', icon: DocumentTextIcon, description: 'Baca berdasarkan halaman mushaf' },
        { name: 'Tafsir Maudhui', path: '/tafsir-maudhui', icon: SparklesIcon, description: 'Topik-topik tematik dalam Al-Quran' },
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
            <div className="header-container max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="mobile-header-row flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 group"
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                IndoQuran
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - COMPLETELY HIDDEN on mobile devices */}
                    <nav className="desktop-only-nav hidden md:flex items-center space-x-8">
                        {/* Main Navigation Dropdown - HIDDEN on mobile */}
                        <div className="relative main-nav-dropdown hidden md:block">
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
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
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

                        {/* Al-Quran Dropdown - HIDDEN on mobile */}
                        <div className="relative quran-dropdown hidden md:block">
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
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
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

                        {/* Community Dropdown - HIDDEN on mobile */}
                        <div className="relative community-dropdown hidden md:block">
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
                                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
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
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
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
                            className="mobile-menu-button md:hidden p-2 sm:p-3 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors touch-manipulation"
                            onClick={handleMobileMenuToggle}
                            style={{ minHeight: '44px', minWidth: '44px' }} // iOS recommended touch target size
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation - Simplified for reliability */}
                <div id="mobile-menu" 
                    className={`mobile-menu md:hidden border-t border-gray-200 py-4 bg-white ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                    style={{ display: isMobileMenuOpen ? 'block' : 'none' }}
                >
                    <div className="space-y-2 max-h-[80vh] overflow-y-auto">
                            {/* Main Navigation Items - Direct Links */}
                            <div className="space-y-1">
                                {mainNavItems.map((item) => (
                                    item.name === 'Pencarian' ? (
                                        <button
                                            key={item.path}
                                            onClick={handleSearchClick}
                                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 active:bg-green-100 transition-colors touch-manipulation"
                                            style={{ minHeight: '48px' }}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-base font-medium">{item.name}</span>
                                        </button>
                                    ) : (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center space-x-3 px-4 py-3 transition-colors touch-manipulation ${
                                                isActivePath(item.path)
                                                    ? 'text-green-600 bg-green-50 border-r-2 border-green-600'
                                                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600 active:bg-green-100'
                                            }`}
                                            style={{ minHeight: '48px' }}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-base font-medium">{item.name}</span>
                                        </Link>
                                    )
                                ))}
                            </div>

                            {/* Divider */}
                            <hr className="my-3 border-gray-200" />

                            {/* Al-Quran Section - Direct Links */}
                            <div className="space-y-1">
                                <div className="px-4 py-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Al-Quran</h3>
                                </div>
                                {quranDropdownItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-4 py-3 transition-colors touch-manipulation ${
                                            isActivePath(item.path)
                                                ? 'text-green-600 bg-green-50 border-r-2 border-green-600'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600 active:bg-green-100'
                                        }`}
                                        style={{ minHeight: '48px' }}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-base font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Divider */}
                            <hr className="my-3 border-gray-200" />

                            {/* Community Section - Direct Links */}
                            <div className="space-y-1">
                                <div className="px-4 py-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Komunitas</h3>
                                </div>
                                {communityDropdownItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-4 py-3 transition-colors touch-manipulation ${
                                            isActivePath(item.path)
                                                ? 'text-green-600 bg-green-50 border-r-2 border-green-600'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600 active:bg-green-100'
                                        }`}
                                        style={{ minHeight: '48px' }}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-base font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* User Section */}
                            {user ? (
                                <>
                                    <hr className="my-3 border-gray-200" />
                                    <div className="space-y-1">
                                        <div className="px-4 py-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{user.name}</h3>
                                            </div>
                                        </div>
                                        {userNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center space-x-3 px-4 py-3 transition-colors touch-manipulation ${
                                                    isActivePath(item.path)
                                                        ? 'text-green-600 bg-green-50 border-r-2 border-green-600'
                                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600 active:bg-green-100'
                                                }`}
                                                style={{ minHeight: '48px' }}
                                            >
                                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-base font-medium">{item.name}</span>
                                            </Link>
                                        ))}
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-colors touch-manipulation"
                                            style={{ minHeight: '48px' }}
                                        >
                                            <ArrowRightStartOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-base font-medium">Keluar</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <hr className="my-3 border-gray-200" />
                                    <div className="px-4 pb-2">
                                        <Link
                                            to="/masuk"
                                            className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation"
                                            style={{ minHeight: '48px' }}
                                        >
                                            Masuk
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
            </div>
        </header>
    );
}

export default QuranHeader;
