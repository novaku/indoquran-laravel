import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { fetchWithAuth } from '../utils/apiUtils';
import { useAutoHide, useDropdownMenu } from '../hooks/useNavigation';

function Navbar({ onBreadcrumbsChange }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [surahName, setSurahName] = useState('');
    
    // Auto-hide functionality
    const isVisible = useAutoHide();
    const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, close: closeMobileMenu } = useDropdownMenu();
    const { isOpen: isDesktopMenuOpen, toggle: toggleDesktopMenu, close: closeDesktopMenu } = useDropdownMenu();
    const mobileMenuRef = useRef(null);
    const desktopMenuRef = useRef(null);
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideMobileMenu = mobileMenuRef.current && mobileMenuRef.current.contains(event.target);
            const clickedInsideDesktopMenu = desktopMenuRef.current && desktopMenuRef.current.contains(event.target);
            
            if (!clickedInsideMobileMenu) {
                closeMobileMenu();
            }
            
            if (!clickedInsideDesktopMenu) {
                closeDesktopMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeMobileMenu, closeDesktopMenu]);

     // Generate breadcrumbs based on current location
    useEffect(() => {
        const generateBreadcrumbs = async () => {
            const pathSegments = location.pathname.split('/').filter(segment => segment);
            let breadcrumbItems = [{ name: 'Beranda', path: '/' }];
            
            if (pathSegments.length > 0) {
                // Handle different routes
                if (pathSegments[0] === 'surah' && pathSegments[1]) {
                    // Fetch surah name
                    try {
                        const response = await fetchWithAuth(`/api/surahs/${pathSegments[1]}`);
                        const data = await response.json();
                        if (data.status === 'success') {
                            const surahName = data.data.surah.name_latin || `Surah ${pathSegments[1]}`;
                            setSurahName(surahName);
                            breadcrumbItems.push({
                                name: surahName,
                                path: `/surah/${pathSegments[1]}`
                            });
                            
                            // Add ayah breadcrumb if present in URL
                            if (pathSegments[2]) {
                                breadcrumbItems.push({
                                    name: `Ayat ${pathSegments[2]}`,
                                    path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                                });
                            }
                        }
                    } catch (error) {
                        breadcrumbItems.push({
                            name: `Surah ${pathSegments[1]}`,
                            path: `/surah/${pathSegments[1]}`
                        });
                        if (pathSegments[2]) {
                            breadcrumbItems.push({
                                name: `Ayat ${pathSegments[2]}`,
                                path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                            });
                        }
                    }
                } else if (pathSegments[0] === 'search') {
                    breadcrumbItems.push({
                        name: 'Pencarian',
                        path: '/search'
                    });
                } else if (pathSegments[0] === 'juz') {
                    if (pathSegments[1]) {
                        breadcrumbItems.push({
                            name: 'Juz Al-Quran',
                            path: '/juz'
                        });
                        breadcrumbItems.push({
                            name: `Juz ${pathSegments[1]}`,
                            path: `/juz/${pathSegments[1]}`
                        });
                    } else {
                        breadcrumbItems.push({
                            name: 'Juz Al-Quran',
                            path: '/juz'
                        });
                    }
                } else if (pathSegments[0] === 'pages') {
                    if (pathSegments[1]) {
                        breadcrumbItems.push({
                            name: 'Halaman Al-Quran',
                            path: '/pages'
                        });
                        breadcrumbItems.push({
                            name: `Halaman ${pathSegments[1]}`,
                            path: `/pages/${pathSegments[1]}`
                        });
                    } else {
                        breadcrumbItems.push({
                            name: 'Halaman Al-Quran',
                            path: '/pages'
                        });
                    }
                } else if (pathSegments[0] === 'bookmarks') {
                    breadcrumbItems.push({
                        name: 'Bookmark',
                        path: '/bookmarks'
                    });
                } else if (pathSegments[0] === 'doa-bersama') {
                    breadcrumbItems.push({
                        name: 'Doa Bersama',
                        path: '/doa-bersama'
                    });
                } else if (pathSegments[0] === 'donation') {
                    breadcrumbItems.push({
                        name: 'Donasi',
                        path: '/donation'
                    });
                } else if (pathSegments[0] === 'about') {
                    breadcrumbItems.push({
                        name: 'Tentang',
                        path: '/about'
                    });
                } else if (pathSegments[0] === 'privacy') {
                    breadcrumbItems.push({
                        name: 'Privasi',
                        path: '/privacy'
                    });
                } else if (pathSegments[0] === 'contact') {
                    breadcrumbItems.push({
                        name: 'Kontak',
                        path: '/contact'
                    });
                } else if (pathSegments[0] === 'tajwid') {
                    breadcrumbItems.push({
                        name: 'Ilmu Tajwid',
                        path: '/tajwid'
                    });
                } else if (pathSegments[0] === 'tutorial') {
                    breadcrumbItems.push({
                        name: 'Tutorial',
                        path: '/tutorial'
                    });
                    
                    if (pathSegments[1] === 'membaca') {
                        breadcrumbItems.push({
                            name: 'Belajar Membaca',
                            path: '/tutorial/membaca'
                        });
                    } else if (pathSegments[1] === 'menulis') {
                        breadcrumbItems.push({
                            name: 'Belajar Menulis',
                            path: '/tutorial/menulis'
                        });
                    } else if (pathSegments[1] === 'hafalan') {
                        breadcrumbItems.push({
                            name: 'Teknik Menghafal',
                            path: '/tutorial/hafalan'
                        });
                    }
                } else if (pathSegments[0] === 'kamus') {
                    breadcrumbItems.push({
                        name: 'Kamus Arab',
                        path: '/kamus'
                    });
                } else if (pathSegments[0] === 'konverter') {
                    breadcrumbItems.push({
                        name: 'Konverter Tanggal',
                        path: '/konverter'
                    });
                } else if (pathSegments[0] === 'profile') {
                    breadcrumbItems.push({
                        name: 'Profil',
                        path: '/profile'
                    });
                } else if (pathSegments[0] === 'auth') {
                    breadcrumbItems.push({
                        name: pathSegments[1] === 'login' ? 'Masuk' : 'Daftar',
                        path: `/auth/${pathSegments[1]}`
                    });
                }
            }
            
            setBreadcrumbs(breadcrumbs);
            
            // Pass breadcrumb data to parent component
            if (onBreadcrumbsChange) {
                onBreadcrumbsChange(breadcrumbs);
            }
        };
        
        generateBreadcrumbs();
    }, [location.pathname, onBreadcrumbsChange]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            // Still redirect even if logout API fails
            navigate('/auth/login');
        }
        closeMobileMenu();
        closeDesktopMenu();
    };
    
    return (
        <>
            <nav className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100 nav-auto-hide ${
                isVisible ? '' : 'hidden'
            }`}>
                <div className="container mx-auto px-4 py-3 max-w-6xl navbar-mobile">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <a href="/" className="flex items-center nav-link">
                                <div className="flex items-center justify-center w-8 h-8 bg-islamic-green text-white rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                                    </svg>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-islamic-gold mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 1L9 9l-8 0 6.5 4.7L5 22l7-5.1L19 22l-2.5-8.3L23 9l-8 0L12 1z"/>
                                    </svg>
                                    <span className="text-xl font-semibold text-islamic-green hidden sm:inline">indoquran.web.id</span>
                                    <span className="text-lg font-semibold text-islamic-green sm:hidden">indoquran.web.id</span>
                                </div>
                            </a>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            
                            {/* Desktop User Dropdown Menu */}
                            <div className="relative" ref={desktopMenuRef}>
                                <button
                                    onClick={toggleDesktopMenu}
                                    className="flex items-center text-islamic-green hover:text-islamic-gold transition-colors nav-link"
                                    aria-label="User menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{user ? user.name : 'Menu'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform duration-200 ${isDesktopMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isDesktopMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 dropdown-backdrop rounded-lg shadow-lg border border-gray-200 py-2 z-50 bg-white">
                                        {user ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-islamic-green truncate">{user.name}</p>
                                                </div>
                                                <a 
                                                    href="/juz" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 0 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                                                    </svg>
                                                    Juz Al-Quran
                                                </a>
                                                <a 
                                                    href="/pages" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    Halaman Al-Quran
                                                </a>
                                                <a 
                                                    href="/bookmarks" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                    Bookmark
                                                </a>
                                                <a 
                                                    href="/doa-bersama" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                    </svg>
                                                    Doa Bersama
                                                </a>
                                                <a 
                                                    href="/donation" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Donasi
                                                </a>
                                                <a 
                                                    href="/profile" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profil
                                                </a>
                                                <button 
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Keluar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <a 
                                                    href="/juz" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 0 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                                                    </svg>
                                                    Juz Al-Quran
                                                </a>
                                                <a 
                                                    href="/pages" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    Halaman Al-Quran
                                                </a>
                                                <a 
                                                    href="/doa-bersama" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                    </svg>
                                                    Doa Bersama
                                                </a>
                                                <a 
                                                    href="/donation" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Donasi
                                                </a>
                                                <a 
                                                    href="/auth/login" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                    </svg>
                                                    Masuk
                                                </a>
                                                <a 
                                                    href="/auth/register" 
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                    onClick={() => closeDesktopMenu()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                    Daftar
                                                </a>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden relative" ref={mobileMenuRef}>
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 text-islamic-green hover:text-islamic-gold transition-colors mobile-touch-target"
                                aria-label="Toggle menu"
                            >
                                <svg 
                                    className={`h-6 w-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {isMobileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 dropdown-backdrop rounded-lg shadow-lg border border-gray-200 py-2 z-50 mobile-dropdown">
                                    {user ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-islamic-green truncate">{user.name}</p>
                                            </div>
                                            <a 
                                                href="/juz" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                                                </svg>
                                                Juz Al-Quran
                                            </a>
                                            <a 
                                                href="/pages" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                Halaman Al-Quran
                                            </a>
                                            <a 
                                                href="/bookmarks" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                Bookmark
                                            </a>
                                            <a 
                                                href="/doa-bersama" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                Doa Bersama
                                            </a>
                                            <a 
                                                href="/donation" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Donasi
                                            </a>
                                            <a 
                                                href="/profile" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profil
                                            </a>
                                            
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <a 
                                                href="/about" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Tentang
                                            </a>
                                            <a 
                                                href="/privacy" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Privasi
                                            </a>
                                            <a 
                                                href="/contact" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Kontak
                                            </a>
                                            <button 
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left mobile-touch-target"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Keluar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <a 
                                                href="/juz" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0 0 5.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0 0 14.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0 0 14.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 1 1-2 0V4.804z" />
                                                </svg>
                                                Juz Al-Quran
                                            </a>
                                            <a 
                                                href="/pages" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                Halaman Al-Quran
                                            </a>
                                            <a 
                                                href="/doa-bersama" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                Doa Bersama
                                            </a>
                                            <a 
                                                href="/donation" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                Donasi
                                            </a>
                                            
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <a 
                                                href="/about" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Tentang
                                            </a>
                                            <a 
                                                href="/privacy" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Privasi
                                            </a>
                                            <a 
                                                href="/contact" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Kontak
                                            </a>
                                            <a 
                                                href="/auth/login" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                Masuk
                                            </a>
                                            <a 
                                                href="/auth/register" 
                                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                                onClick={() => closeMobileMenu()}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                Daftar
                                            </a>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
