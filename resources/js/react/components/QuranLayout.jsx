import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import QuranHeader from './QuranHeader';
import QuranFooter from './QuranFooter';
import Breadcrumb from './Breadcrumb';
import Sidebar from './Sidebar';
import AdSenseHorizontal from './AdSenseHorizontal';

function QuranLayout({ children, className = "" }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <QuranHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Breadcrumb />
            
            <main className={`flex-grow ${className}`}>
                {children}
            </main>

            {/* Global Bottom AdSense Banner for all non-admin pages (Desktop & Mobile) */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 w-full">
                <div className="w-full bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="text-[10px] text-center text-gray-400 py-1 border-b border-gray-100 bg-gray-50/60 font-medium">
                        Iklan
                    </div>
                    <AdSenseHorizontal 
                        adSlot="1519827772" 
                        className="w-full" 
                    />
                </div>
            </div>
            
            <QuranFooter />
        </div>
    );
}

export default QuranLayout;
