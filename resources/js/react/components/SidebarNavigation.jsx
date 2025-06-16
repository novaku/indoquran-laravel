import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

function SidebarNavigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Auto-hide functionality based on scroll (desktop only)
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth >= 768) { // Only on desktop
                const currentScrollY = window.scrollY;
                
                // Hide sidebar when scrolling down significantly
                if (currentScrollY > lastScrollY && currentScrollY > 150) {
                    setIsVisible(false);
                }
                
                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            navigate('/auth/login');
        }
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            setIsVisible(false);
        }
    };

    const navigationItems = [
        {
            name: 'Beranda',
            path: '/',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Cari',
            path: '/search',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: 'Juz Al-Quran',
            path: '/juz',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                </svg>
            )
        },
        {
            name: 'Halaman Al-Quran',
            path: '/pages',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: 'Doa Bersama',
            path: '/doa-bersama',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

    const userItems = user ? [
        {
            name: 'Bookmark',
            path: '/bookmarks',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            )
        },
        {
            name: 'Profil',
            path: '/profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ] : [
        {
            name: 'Masuk',
            path: '/auth/login',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            )
        }
    ];

    const bottomItems = [
        {
            name: 'Donasi',
            path: '/donation',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            name: 'Tentang',
            path: '/about',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: 'Privasi',
            path: '/privacy',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            name: 'Kontak',
            path: '/contact',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Riwayat Versi',
            path: '/version-history',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    const handleNavItemClick = () => {
        // Close sidebar on mobile when navigation item is clicked
        if (window.innerWidth < 768) {
            setIsVisible(false);
        }
    };

    const isCurrentPath = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Desktop hover trigger area */}
            <div 
                className="fixed left-0 top-0 w-4 h-full z-30 hidden md:block hover:bg-islamic-green/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setIsVisible(true)}
                title="Hover to show menu"
            >
                {/* Subtle visual indicator */}
                <div className="absolute top-1/2 left-1 transform -translate-y-1/2 w-2 h-8 bg-islamic-green/30 rounded-r opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
            </div>

            {/* Mobile Menu Trigger */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="fixed top-4 left-4 z-50 p-2 bg-islamic-green text-black rounded-lg shadow-lg md:hidden"
                aria-label="Toggle menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isVisible ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile overlay - only show when sidebar is visible on mobile */}
            {isVisible && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
                    onClick={() => setIsVisible(false)}
                ></div>
            )}
            
            <div
                className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ease-in-out group ${
                    isVisible ? 'translate-x-0 w-60' : 'md:translate-x-0 md:w-16 -translate-x-full w-60'
                } md:hover:w-60`}
                onMouseLeave={() => {
                    if (window.innerWidth >= 768) {
                        setIsVisible(false);
                    }
                }}
            >
            {/* Sidebar Content */}
            <div className="flex flex-col h-full">
                {/* Logo/Header */}
                <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-islamic-green text-white rounded-md flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                            </svg>
                        </div>
                        <div className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden">
                            <span className="text-lg font-semibold text-black">IndoQuran</span>
                        </div>
                    </div>
                    
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 text-gray-500 hover:text-gray-700 md:hidden ml-auto"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    {/* Primary Navigation */}
                    <nav className="space-y-1 px-2">
                        {navigationItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                onClick={handleNavItemClick}
                                className={`flex items-center justify-start px-3 py-3 rounded-lg transition-all duration-200 relative ${
                                    isCurrentPath(item.path)
                                        ? 'bg-islamic-green text-white shadow-md'
                                        : 'text-black hover:bg-islamic-green/10 hover:text-islamic-green'
                                }`}
                                title={item.name}
                            >
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-left">
                                    {item.name}
                                </span>
                            </a>
                        ))}
                    </nav>

                    {/* User Section */}
                    {userItems.length > 0 && (
                        <div className="mt-6">
                            <div className="px-3 mb-2 overflow-hidden">
                                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300">
                                    <h3 className="text-xs font-semibold text-black uppercase tracking-wider whitespace-nowrap text-left">
                                        {user ? 'Akun' : 'Autentikasi'}
                                    </h3>
                                </div>
                            </div>
                            <nav className="space-y-1 px-2">
                                {userItems.map((item) => (
                                    <a
                                        key={item.path}
                                        href={item.path}
                                        onClick={handleNavItemClick}
                                        className={`flex items-center justify-start px-3 py-3 rounded-lg transition-all duration-200 relative ${
                                            isCurrentPath(item.path)
                                                ? 'bg-islamic-green text-white shadow-md'
                                                : 'text-black hover:bg-islamic-green/10 hover:text-islamic-green'
                                        }`}
                                        title={item.name}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-left">
                                            {item.name}
                                        </span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-gray-200 p-2">
                    <nav className="space-y-1">
                        {bottomItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                onClick={handleNavItemClick}
                                className={`flex items-center justify-start px-3 py-3 rounded-lg transition-all duration-200 relative ${
                                    isCurrentPath(item.path)
                                        ? 'bg-islamic-green text-white shadow-md'
                                        : 'text-black hover:bg-islamic-green/10 hover:text-islamic-green'
                                }`}
                                title={item.name}
                            >
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-left">
                                    {item.name}
                                </span>
                            </a>
                        ))}
                        
                        {/* Logout Button (if user is logged in) */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-start w-full px-3 py-3 rounded-lg transition-all duration-200 relative text-black hover:bg-red-50 hover:text-red-600"
                                title="Keluar"
                            >
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <span className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 whitespace-nowrap overflow-hidden text-left">
                                    Keluar
                                </span>
                            </button>
                        )}
                    </nav>
                </div>

                {/* User Info (if logged in) */}
                {user && (
                    <div className="border-t border-gray-200 p-3 overflow-hidden">
                        <div className="flex items-center justify-start">
                            <div className="flex items-center justify-center w-8 h-8 bg-islamic-gold text-white rounded-full flex-shrink-0">
                                <span className="text-sm font-medium">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>
                            <div className="ml-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:max-w-xs md:group-hover:max-w-xs max-w-xs transition-all duration-300 overflow-hidden">
                                <p className="text-sm font-medium text-black truncate whitespace-nowrap text-left">{user.name}</p>
                                <p className="text-xs text-gray-600 truncate whitespace-nowrap text-left">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default SidebarNavigation;
