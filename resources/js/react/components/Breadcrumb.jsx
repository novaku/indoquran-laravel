import React from 'react';
import { useLocation } from 'react-router-dom';

function Breadcrumb({ breadcrumbs }) {
    const location = useLocation();

    // Don't show breadcrumb on home page 
    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <div className="fixed left-0 right-0 top-16 z-30 flex items-center justify-center pointer-events-none">
            <div className="flex items-center bg-white/70 backdrop-blur-md rounded-lg px-4 py-2 shadow border border-white/30 pointer-events-auto">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={index} className="inline-flex items-center">
                                {index > 0 && (
                                    <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-500 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-xs md:text-sm font-semibold text-green-700">
                                        {breadcrumb.name}
                                    </span>
                                ) : (
                                    <a
                                        href={breadcrumb.path}
                                        className="text-xs md:text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                                    >
                                        {breadcrumb.name}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
        </div>
    );
}

export default Breadcrumb;
