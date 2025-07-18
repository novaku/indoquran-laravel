import React, { useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { generateBreadcrumbStructuredData } from '../utils/seoUtils';

function Breadcrumb() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Mapping of paths to breadcrumb names
    const pathNameMap = {
        '': 'Beranda',
        'surah': 'Daftar Surah',
        'juz': 'Juz',
        'halaman': 'Halaman',
        'cari': 'Pencarian',
        'penanda': 'Penanda',
        'profil': 'Profil',
        'tentang': 'Tentang',
        'kontak': 'Kontak',
        'donasi': 'Donasi',
        'kebijakan': 'Kebijakan Privasi',
        'riwayat-versi': 'Riwayat Versi',
        'tafsir-maudhui': 'Tafsir Maudhui',
        'doa-bersama': 'Doa Bersama',
        'masuk': 'Masuk',
        'daftar': 'Daftar',
        'admin': 'Admin',
        'dashboard': 'Dashboard',
        'login': 'Login',
        'logout': 'Logout'
    };

    // Don't show breadcrumb on home page
    if (location.pathname === '/') {
        return null;
    }

    // Memoize breadcrumb items calculation to prevent unnecessary re-renders
    const breadcrumbItems = useMemo(() => {
        const items = [
            { name: 'Beranda', path: '/', isHome: true }
        ];

        let currentPath = '';
        pathnames.forEach((pathname, index) => {
            currentPath += `/${pathname}`;
            
            // Get display name with improved error handling
            let displayName = pathNameMap[pathname] || pathname;
            
            // Handle dynamic routes (like surah numbers, page numbers, etc.)
            if (!pathNameMap[pathname]) {
                const prevPath = pathnames[index - 1];
                if (prevPath === 'surah' && /^\d+$/.test(pathname)) {
                    const surahNumber = parseInt(pathname, 10);
                    if (surahNumber >= 1 && surahNumber <= 114) {
                        displayName = `Surah ${pathname}`;
                    } else {
                        displayName = `Surah ${pathname}`;
                    }
                } else if (prevPath === 'juz' && /^\d+$/.test(pathname)) {
                    const juzNumber = parseInt(pathname, 10);
                    if (juzNumber >= 1 && juzNumber <= 30) {
                        displayName = `Juz ${pathname}`;
                    } else {
                        displayName = `Juz ${pathname}`;
                    }
                } else if (prevPath === 'halaman' && /^\d+$/.test(pathname)) {
                    const pageNumber = parseInt(pathname, 10);
                    if (pageNumber >= 1 && pageNumber <= 604) {
                        displayName = `Halaman ${pathname}`;
                    } else {
                        displayName = `Halaman ${pathname}`;
                    }
                } else if (prevPath === 'admin' && pathname === 'dashboard') {
                    displayName = 'Dashboard';
                } else if (prevPath === 'admin' && pathname === 'login') {
                    displayName = 'Login';
                } else {
                    // Capitalize first letter for unknown paths and decode URI components
                    try {
                        const decodedPath = decodeURIComponent(pathname);
                        displayName = decodedPath.charAt(0).toUpperCase() + decodedPath.slice(1);
                    } catch (error) {
                        displayName = pathname.charAt(0).toUpperCase() + pathname.slice(1);
                    }
                }
            }

            items.push({
                name: displayName,
                path: currentPath,
                isHome: false
            });
        });

        return items;
    }, [pathnames, pathNameMap]);

    // Memoize structured data cleanup function
    const cleanupStructuredData = useCallback(() => {
        try {
            const script = document.querySelector('script[data-breadcrumb-ld]');
            if (script) {
                script.remove();
            }
        } catch (error) {
            console.warn('Error cleaning up breadcrumb structured data:', error);
        }
    }, []);

    // Generate structured data for SEO with improved error handling
    useEffect(() => {
        try {
            const baseUrl = window.location.origin;
            const breadcrumbData = breadcrumbItems.map(item => ({
                name: item.name,
                url: `${baseUrl}${item.path}`
            }));

            const structuredData = generateBreadcrumbStructuredData(breadcrumbData);
            
            if (structuredData) {
                // Remove existing breadcrumb structured data
                cleanupStructuredData();

                // Add new structured data
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-breadcrumb-ld', 'true');
                script.textContent = JSON.stringify(structuredData);
                document.head.appendChild(script);
            }
        } catch (error) {
            console.warn('Error generating breadcrumb structured data:', error);
        }

        return cleanupStructuredData;
    }, [breadcrumbItems, cleanupStructuredData]);

    return (
        <div 
            className="breadcrumb-transparent breadcrumb-auto-hide sticky top-[4.5rem] z-40 border-b border-white/20 backdrop-blur-md"
            style={{ 
                top: '72px',
                zIndex: 40,
                position: 'sticky'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-3">
                    <nav 
                        className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide" 
                        aria-label="Breadcrumb"
                        role="navigation"
                    >
                        {breadcrumbItems.map((item, index) => (
                            <React.Fragment key={`${item.path}-${index}`}>
                                {index > 0 && (
                                    <ChevronRightIcon 
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400/70 flex-shrink-0 mx-1" 
                                        aria-hidden="true"
                                    />
                                )}
                                {index === breadcrumbItems.length - 1 ? (
                                    // Current page - not a link
                                    <span 
                                        className="flex items-center text-gray-800 font-medium px-2 py-1 rounded-md bg-white/10 whitespace-nowrap"
                                        aria-current="page"
                                    >
                                        {item.isHome && (
                                            <HomeIcon 
                                                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" 
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="truncate max-w-[120px] sm:max-w-none">
                                            {item.name}
                                        </span>
                                    </span>
                                ) : (
                                    // Previous pages - links
                                    <Link
                                        to={item.path}
                                        className="flex items-center text-gray-600 hover:text-green-700 transition-colors px-2 py-1 rounded-md hover:bg-white/10 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        aria-label={`Go to ${item.name}`}
                                    >
                                        {item.isHome && (
                                            <HomeIcon 
                                                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" 
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="truncate max-w-[100px] sm:max-w-none">
                                            {item.name}
                                        </span>
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Breadcrumb;
