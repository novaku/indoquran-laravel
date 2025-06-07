import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

function Navbar({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    
    // Generate breadcrumbs based on current location
    useEffect(() => {
        const generateBreadcrumbs = async () => {
            const pathSegments = location.pathname.split('/').filter(segment => segment);
            let breadcrumbItems = [{ name: 'Beranda', path: '/' }];
            
            if (pathSegments.length > 0) {
                // Handle different routes
                if (pathSegments[0] === 'surah' && pathSegments[1]) {
                    // Fetch surah name for both /surah/{number} and /surah/{number}/{ayahNumber}
                    try {
                        const response = await fetch(getApiUrl(`/api/surahs/${pathSegments[1]}`));
                        const data = await response.json();
                        if (data.status === 'success') {
                            const surahName = data.data.surah.name_latin || `Surah ${pathSegments[1]}`;
                            breadcrumbItems.push({
                                name: surahName,
                                path: `/surah/${pathSegments[1]}`
                            });
                            
                            // If there's an ayah number, add ayah breadcrumb
                            if (pathSegments[2]) {
                                breadcrumbItems.push({
                                    name: `Ayat ${pathSegments[2]}`,
                                    path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                                });
                            }
                        } else {
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
                } else if (pathSegments[0] === 'ayah' && pathSegments[1] && pathSegments[2]) {
                    // Add surah breadcrumb
                    try {
                        const response = await fetch(getApiUrl(`/api/surahs/${pathSegments[1]}`));
                        const data = await response.json();
                        if (data.status === 'success') {
                            const surahName = data.data.surah.name_latin || `Surah ${pathSegments[1]}`;
                            breadcrumbItems.push({
                                name: surahName,
                                path: `/surah/${pathSegments[1]}`
                            });
                        } else {
                            breadcrumbItems.push({
                                name: `Surah ${pathSegments[1]}`,
                                path: `/surah/${pathSegments[1]}`
                            });
                        }
                    } catch (error) {
                        breadcrumbItems.push({
                            name: `Surah ${pathSegments[1]}`,
                            path: `/surah/${pathSegments[1]}`
                        });
                    }
                    
                    // Add ayah breadcrumb
                    breadcrumbItems.push({
                        name: `Ayat ${pathSegments[2]}`,
                        path: `/surah/${pathSegments[1]}/${pathSegments[2]}`
                    });
                } else if (pathSegments[0] === 'search') {
                    breadcrumbItems.push({
                        name: 'Pencarian',
                        path: '/search'
                    });
                } else if (pathSegments[0] === 'bookmarks') {
                    breadcrumbItems.push({
                        name: 'Bookmark',
                        path: '/bookmarks'
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
            
            setBreadcrumbs(breadcrumbItems);
        };
        
        generateBreadcrumbs();
    }, [location.pathname]);

    // Listen for custom urlChange events
    useEffect(() => {
        const handleUrlChange = (event) => {
            if (event.detail && event.detail.path) {
                // Use the provided path from the event
                navigate(event.detail.path, { replace: true });
            } else {
                // Fallback to reading current path
                const currentPath = window.location.pathname;
                navigate(currentPath, { replace: true });
            }
        };
        
        window.addEventListener('urlChange', handleUrlChange);
        return () => {
            window.removeEventListener('urlChange', handleUrlChange);
        };
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(getApiUrl('/api/logout'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            
            // Clear user state and redirect
            if (setUser) setUser(null);
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still redirect even if logout API fails
            if (setUser) setUser(null);
            navigate('/auth/login');
        }
    };
    
    return (
        <>
            <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 py-3 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="flex items-center">
                                <div className="flex items-center justify-center w-8 h-8 bg-islamic-green text-white rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-xl font-semibold text-islamic-green">indoquran.web.id</span>
                            </Link>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link 
                                    to="/bookmarks" 
                                    className="text-islamic-green hover:text-islamic-gold transition-colors"
                                    title="Bookmark & Favorit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </Link>
                            ) : (
                                <button className="text-islamic-green hover:text-islamic-gold transition-colors opacity-50 cursor-not-allowed">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>
                            )}
                            {user ? (
                                <>
                                    <Link to="/profile" className="text-islamic-green hover:text-islamic-gold">
                                        {user.name}
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-islamic-green hover:text-islamic-gold"
                                    >
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/login" className="text-islamic-green hover:text-islamic-gold">
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Floating Breadcrumb Navigation */}
            {breadcrumbs.length > 1 && (
                <div className="fixed top-16 left-0 right-0 z-40 bg-transparent backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-2 max-w-6xl">
                        {/* Desktop Breadcrumbs */}
                        <div className="hidden md:block">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                                    {breadcrumbs.map((breadcrumb, index) => (
                                        <li key={index} className="inline-flex items-center">
                                            {index > 0 && (
                                                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                                </svg>
                                            )}
                                            {index === breadcrumbs.length - 1 ? (
                                                <span className="text-sm font-medium text-primary-600">
                                                    {breadcrumb.name}
                                                </span>
                                            ) : (
                                                <Link
                                                    to={breadcrumb.path}
                                                    className="text-sm font-medium text-gray-500 hover:text-primary-600"
                                                >
                                                    {breadcrumb.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>

                        {/* Mobile Breadcrumbs */}
                        <div className="md:hidden">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="inline-flex items-center space-x-1">
                                    {breadcrumbs.length > 1 && (
                                        <>
                                            <li className="inline-flex items-center">
                                                <Link
                                                    to={breadcrumbs[breadcrumbs.length - 2].path}
                                                    className="text-sm font-medium text-gray-500 hover:text-primary-600"
                                                >
                                                    {breadcrumbs[breadcrumbs.length - 2].name}
                                                </Link>
                                            </li>
                                            <li className="inline-flex items-center">
                                                <svg className="w-4 h-4 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                                </svg>
                                                <span className="text-sm font-medium text-primary-600">
                                                    {breadcrumbs[breadcrumbs.length - 1].name}
                                                </span>
                                            </li>
                                        </>
                                    )}
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
