import React from 'react';
import SimpleHeader from './SimpleHeader';
import SimpleFooter from './SimpleFooter';

function SimpleLayout({ children, className = "" }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <SimpleHeader />
            
            <main className={`flex-grow ${className}`}>
                {children}
            </main>
            
            <SimpleFooter />
        </div>
    );
}

export default SimpleLayout;
