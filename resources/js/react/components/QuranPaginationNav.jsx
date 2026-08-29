import React from 'react';
import { Link } from 'react-router-dom';
import { 
    IoChevronBackOutline, 
    IoChevronForwardOutline, 
    IoGridOutline 
} from 'react-icons/io5';

/**
 * Reusable Top Navigation Bar for Quran Reading Pages (Juz, Halaman, etc.)
 */
export default function QuranPaginationNav({
    unitLabel = 'Halaman', // 'Halaman' | 'Juz'
    currentIndex = 1,
    totalCount = 604,
    indexUrl = '/halaman',
    indexTitle = 'Daftar Semua Halaman',
    onNavigate,
    itemLabelFormatter,
    subtitle
}) {
    const handlePrev = () => {
        if (currentIndex > 1 && onNavigate) {
            onNavigate(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalCount && onNavigate) {
            onNavigate(currentIndex + 1);
        }
    };

    const handleChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (val && onNavigate) {
            onNavigate(val);
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-green-100 p-3 sm:p-4 mb-6 transition-all">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Prev Button */}
                <button
                    onClick={handlePrev}
                    disabled={currentIndex <= 1}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-green-200 bg-white text-green-700 hover:bg-green-50 hover:border-green-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-green-200 shadow-sm"
                    title={currentIndex > 1 ? `Ke ${unitLabel} ${currentIndex - 1}` : `${unitLabel} Pertama`}
                >
                    <IoChevronBackOutline className="w-4 h-4" />
                    <span>
                        {currentIndex > 1 ? `${unitLabel} ${currentIndex - 1}` : `Awal (${unitLabel} 1)`}
                    </span>
                </button>

                {/* Center: Dropdown & Grid Index */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Link
                        to={indexUrl}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-green-700 transition-colors"
                        title={indexTitle}
                    >
                        <IoGridOutline className="w-4 h-4" />
                    </Link>

                    <div className="relative flex items-center">
                        <select
                            value={currentIndex}
                            onChange={handleChange}
                            className="appearance-none font-semibold text-green-800 bg-green-50/80 border border-green-300 hover:border-green-400 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors cursor-pointer shadow-sm"
                        >
                            {Array.from({ length: totalCount }, (_, i) => i + 1).map((idx) => {
                                const customLabel = itemLabelFormatter ? itemLabelFormatter(idx) : null;
                                return (
                                    <option key={idx} value={idx}>
                                        {customLabel || `${unitLabel} ${idx}`}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-green-700">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={currentIndex >= totalCount}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-green-200 bg-white text-green-700 hover:bg-green-50 hover:border-green-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-green-200 shadow-sm"
                    title={currentIndex < totalCount ? `Ke ${unitLabel} ${currentIndex + 1}` : `${unitLabel} Terakhir`}
                >
                    <span>
                        {currentIndex < totalCount ? `${unitLabel} ${currentIndex + 1}` : `Akhir (${unitLabel} ${totalCount})`}
                    </span>
                    <IoChevronForwardOutline className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
