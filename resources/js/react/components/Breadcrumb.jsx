import React, { useEffect } from 'react';
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
        'artikel': 'Artikel',
        'keuntungan-member': 'Keuntungan Member',
        'kebijakan': 'Kebijakan Privasi',
        'kebijakan-privasi': 'Kebijakan Privasi',
        'riwayat-versi': 'Riwayat Versi',
        'tafsir-maudhui': 'Tafsir Maudhui',
        'doa-bersama': 'Doa Bersama',
        'asmaul-husna': '99 Asmaul Husna',
        'masuk': 'Masuk',
        'daftar': 'Daftar',
        'admin': 'Admin',
        'statistik': 'Statistik'
    };

    // Don't show breadcrumb on home page only
    if (location.pathname === '/') {
        return null;
    }

    // Build breadcrumb items
    const breadcrumbItems = [
        { name: 'Beranda', path: '/', isHome: true }
    ];

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
        currentPath += `/${pathname}`;
        
        // Get display name
        let displayName = pathNameMap[pathname] || pathname;
        
        // Handle dynamic routes (like surah numbers, page numbers, etc.)
        if (!pathNameMap[pathname]) {
            const prevPath = pathnames[index - 1];
            if (prevPath === 'surah' && /^\d+$/.test(pathname)) {
                displayName = `Surah ${pathname}`;
            } else if (prevPath === 'juz' && /^\d+$/.test(pathname)) {
                displayName = `Juz ${pathname}`;
            } else if (prevPath === 'halaman' && /^\d+$/.test(pathname)) {
                displayName = `Halaman ${pathname}`;
            } else if (prevPath === 'admin' && pathname === 'dashboard') {
                displayName = 'Dashboard';
            } else if (prevPath === 'admin' && pathname === 'login') {
                displayName = 'Login';
            } else {
                // Capitalize first letter for unknown paths
                displayName = pathname.charAt(0).toUpperCase() + pathname.slice(1);
            }
        }

        breadcrumbItems.push({
            name: displayName,
            path: currentPath,
            isHome: false
        });
    });

    // Generate structured data for SEO
    useEffect(() => {
        const baseUrl = window.location.origin;
        const breadcrumbData = breadcrumbItems.map(item => ({
            name: item.name,
            url: `${baseUrl}${item.path}`
        }));

        const structuredData = generateBreadcrumbStructuredData(breadcrumbData);
        
        if (structuredData) {
            // Remove existing breadcrumb structured data
            const existingScript = document.querySelector('script[data-breadcrumb-ld]');
            if (existingScript) {
                existingScript.remove();
            }

            // Add new structured data
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-breadcrumb-ld', 'true');
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }

        return () => {
            // Cleanup on unmount
            const script = document.querySelector('script[data-breadcrumb-ld]');
            if (script) {
                script.remove();
            }
        };
    }, [location.pathname]);

    return (
        <div className="breadcrumb-transparent sticky top-16 z-40 border-b border-white/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-start py-3">
                    <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
                        {breadcrumbItems.map((item, index) => (
                            <React.Fragment key={item.path}>
                                {index > 0 && (
                                    <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400/70 flex-shrink-0 mx-1" />
                                )}
                                {index === breadcrumbItems.length - 1 ? (
                                    // Current page - not a link
                                    <span className="flex items-center text-gray-800 font-medium px-2 py-1 rounded-md bg-white/10 whitespace-nowrap">
                                        {item.isHome && <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />}
                                        <span className="truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                                    </span>
                                ) : (
                                    // Previous pages - links
                                    <Link
                                        to={item.path}
                                        className="flex items-center text-gray-600 hover:text-green-700 transition-colors px-2 py-1 rounded-md hover:bg-white/10 whitespace-nowrap"
                                    >
                                        {item.isHome && <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />}
                                        <span className="truncate max-w-[100px] sm:max-w-none">{item.name}</span>
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
