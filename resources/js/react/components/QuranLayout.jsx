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

            {/* Global Bottom AdSense Banner for all non-admin pages */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                <AdSenseHorizontal 
                    adSlot="1519827772" 
                    className="w-full rounded-xl bg-white shadow-xs border border-gray-100" 
                />
            </div>
            
            <QuranFooter />
        </div>
    );
}

export default QuranLayout;
