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
    DocumentIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

function QuranHeader({ isSidebarOpen, setIsSidebarOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Close user menu when route changes
    useEffect(() => {
        setIsUserMenuOpen(false);
        setIsSidebarOpen(false);
    }, [location]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-button')) {
                setIsUserMenuOpen(false);
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

    return (
        <header className="sticky top-0 z-[70] bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Sidebar Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors touch-manipulation"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>

                    {/* Logo */}
                    <div className="flex items-center flex-1 justify-center md:justify-start md:ml-4">
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
                    {/* User Menu & Mobile Menu Button */}
                    <div className="flex items-center space-x-4">
                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="relative user-menu">
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
                                    <span className="hidden md:inline">{user.name}</span>
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
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default QuranHeader;
