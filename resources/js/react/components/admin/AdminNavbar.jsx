import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowTopRightOnSquareIcon,
    ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('admin_user');
            if (stored) {
                setAdminUser(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error reading admin user:', e);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_user');
        toast.success('Logout berhasil');
        navigate('/admin/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Left: Brand / Logo */}
                    <Link 
                        to="/admin/dashboard" 
                        className="flex items-center space-x-2.5 group focus:outline-none"
                    >
                        <img 
                            src="/images/logo-icon.webp" 
                            alt="IndoQuran Logo" 
                            className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105"
                            width="32"
                            height="32"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                IndoQuran
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ADMIN
                            </span>
                        </div>
                    </Link>

                    {/* Right: Actions (Lihat Web, Admin Profile, Logout) */}
                    <div className="flex items-center space-x-3">
                        {/* View Public Website */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Buka website utama IndoQuran di tab baru"
                        >
                            <span>Lihat Web</span>
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-gray-500" />
                        </a>

                        {/* Admin Profile Info */}
                        {adminUser && (
                            <div className="flex items-center space-x-2 border-l border-gray-200 pl-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                    {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="hidden sm:block text-left leading-tight max-w-[140px] md:max-w-[180px] truncate">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                        {adminUser.name || 'Admin'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {adminUser.email || 'admin@indoquran.web.id'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none cursor-pointer"
                            title="Keluar dari sesi admin"
                        >
                            <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-1 text-red-600" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
