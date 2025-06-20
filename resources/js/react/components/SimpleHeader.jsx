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
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function SimpleHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
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
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
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
        { name: 'Beranda', path: '/', icon: BookOpenIcon },
        { name: 'Pencarian', path: '/cari', icon: MagnifyingGlassIcon },
        { name: 'Juz', path: '/juz', icon: BookOpenIcon },
        { name: 'Halaman', path: '/halaman', icon: BookOpenIcon },
        { name: 'Doa Bersama', path: '/doa-bersama', icon: HeartIcon },
        { name: 'Donasi', path: '/donasi', icon: HeartIcon },
    ];

    const userNavItems = user ? [
        { name: 'Bookmark', path: '/bookmarks', icon: HeartIcon },
        { name: 'Profil', path: '/profile', icon: UserIcon },
    ] : [];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

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
                        {mainNavItems.map((item) => (
                            item.name === 'Pencarian' ? (
                                <button
                                    key={item.path}
                                    onClick={handleSearchClick}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActivePath(item.path)
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </button>
                            ) : (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActivePath(item.path)
                                            ? 'text-green-600 bg-green-50'
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        ))}
                    </nav>

                    {/* User Menu & Mobile Menu Button */}
                    <div className="flex items-center space-x-4">
                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="hidden md:block relative user-menu">
                                <button
                                    className="user-menu-button flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-white">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                        {userNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600"
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                        >
                                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/auth/login"
                                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Masuk
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="mobile-menu-button md:hidden p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                            {mainNavItems.map((item) => (
                                item.name === 'Pencarian' ? (
                                    <button
                                        key={item.path}
                                        onClick={handleSearchClick}
                                        className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActivePath(item.path)
                                                ? 'text-green-600 bg-green-50'
                                                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </button>
                                ) : (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActivePath(item.path)
                                                ? 'text-green-600 bg-green-50'
                                                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            ))}

                            {user ? (
                                <>
                                    <hr className="my-4 border-gray-200" />
                                    <div className="px-3 py-2">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-white">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {userNavItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    ))}
                                    
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        <span>Keluar</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <hr className="my-4 border-gray-200" />
                                    <Link
                                        to="/auth/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors text-center"
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

export default SimpleHeader;
