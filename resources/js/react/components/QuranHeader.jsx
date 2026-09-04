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
    ChartBarIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';

function QuranHeader({ isSidebarOpen, setIsSidebarOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const isAdmin = Boolean(user && user.is_admin);
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
        ...(isAdmin ? [
            { 
                name: 'Panel Admin', 
                path: '/admin/dashboard', 
                icon: Squares2X2Icon, 
                description: 'Kelola website & analitik',
                isAdminItem: true
            }
        ] : []),
        { name: 'Profil', path: '/profil', icon: UserIcon, description: 'Pengaturan akun' },
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
                            className="flex items-center space-x-2.5 group"
                        >
                            <img 
                                src="/images/logo-icon.webp" 
                                alt="IndoQuran Logo" 
                                className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-110"
                                width="32"
                                height="32"
                            />
                            <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                IndoQuran
                            </span>
                        </Link>
                    </div>
                    {/* User Menu & Mobile Menu Button */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Quick Penanda Button */}
                        <Link
                            to="/penanda"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                isActivePath('/penanda') 
                                    ? 'text-green-600 bg-green-50' 
                                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                            }`}
                            title="Penanda & Bacaan Saya"
                        >
                            <BookmarkIcon className="w-5 h-5 text-green-600" />
                            <span className="hidden sm:inline text-xs font-semibold">Penanda</span>
                        </Link>

                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="relative user-menu">
                                <button
                                    className={`user-menu-button flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation cursor-pointer ${
                                        userNavItems.some(item => isActivePath(item.path))
                                            ? 'text-green-600 bg-green-50' 
                                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    style={{ minHeight: '44px' }}
                                >
                                    <div className={`w-6 h-6 ${isAdmin ? 'bg-emerald-700 ring-2 ring-emerald-300' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
                                        <span className="text-xs font-semibold text-white">
                                            {user.name?.charAt(0).toUpperCase() || (isAdmin ? 'A' : 'U')}
                                        </span>
                                    </div>
                                    <span className="hidden md:inline font-medium">{user.name}</span>
                                    {isAdmin && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            ADMIN
                                        </span>
                                    )}
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 overflow-hidden">
                                        {/* User Identity Header */}
                                        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-gray-500 truncate max-w-[130px]">{user.email}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    isAdmin ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                    {isAdmin ? 'Administrator' : 'Member'}
                                                </span>
                                            </div>
                                        </div>

                                        {userNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-start space-x-3 px-4 py-3 text-sm transition-colors touch-manipulation ${
                                                    item.isAdminItem
                                                        ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100/80 font-medium border-b border-emerald-100/60'
                                                        : isActivePath(item.path)
                                                            ? 'bg-green-50 text-green-600'
                                                            : 'text-gray-700 hover:bg-gray-50 hover:text-green-600 active:bg-gray-100'
                                                }`}
                                                style={{ minHeight: '52px' }}
                                            >
                                                <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.isAdminItem ? 'text-emerald-700' : 'text-gray-500'}`} />
                                                <div>
                                                    <div className="font-semibold">{item.name}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {item.description}
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
