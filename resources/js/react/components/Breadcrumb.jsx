import React from 'react';
import { useLocation } from 'react-router-dom';

function Breadcrumb({ breadcrumbs }) {
    const location = useLocation();

    // Don't show breadcrumb on home page 
    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <div className="fixed left-0 right-0 top-4 z-30 flex items-center justify-center pointer-events-none transition-all duration-300">
            <div className="flex items-center breadcrumb-transparent rounded-full px-3 py-1.5 pointer-events-auto transition-all duration-200">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <li key={index} className="inline-flex items-center">
                                {index > 0 && (
                                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-600/70 mx-0.5 md:mx-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="text-xs md:text-sm font-semibold text-islamic-green drop-shadow-sm">
                                        {breadcrumb.name}
                                    </span>
                                ) : (
                                    <a
                                        href={breadcrumb.path}
                                        className="text-xs md:text-sm font-medium text-gray-700 hover:text-islamic-green transition-colors drop-shadow-sm"
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
