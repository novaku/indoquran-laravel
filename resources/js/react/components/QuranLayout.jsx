import React from 'react';
import QuranHeader from './QuranHeader';
import QuranFooter from './QuranFooter';
import Breadcrumb from './Breadcrumb';

function QuranLayout({ children, className = "" }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <QuranHeader />
            <Breadcrumb />
            
            <main className={`flex-grow ${className}`}>
                {children}
            </main>
            
            <QuranFooter />
        </div>
    );
}

export default QuranLayout;
