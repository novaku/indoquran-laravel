import React from 'react';
import { Link } from 'react-router-dom';

const AdminFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">IndoQuran Admin</span>
                    <span>&copy; {new Date().getFullYear()}</span>
                    <span>&bull;</span>
                    <span>Panel Pengelolaan Konten &amp; Statistik</span>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/admin/dashboard" className="hover:text-emerald-600 transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/admin/artikel" className="hover:text-emerald-600 transition-colors">
                        Artikel
                    </Link>
                    <a 
                        href="/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-emerald-600 transition-colors"
                    >
                        Lihat Web Utama &rarr;
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;
