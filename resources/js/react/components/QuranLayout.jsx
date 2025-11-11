import React, { useState } from 'react';
import QuranHeader from './QuranHeader';
import QuranFooter from './QuranFooter';
import Breadcrumb from './Breadcrumb';
import Sidebar from './Sidebar';

function QuranLayout({ children, className = "" }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <QuranHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Breadcrumb />
            
            <main className={`flex-grow ${className}`}>
                {children}
            </main>
            
            <QuranFooter />
        </div>
    );
}

export default QuranLayout;
