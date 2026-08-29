import React from 'react';
import { IoListOutline, IoArrowUpOutline } from 'react-icons/io5';

/**
 * Reusable Floating Navigation & Back to Top Buttons
 */
export default function QuranFloatingActions({
    show = false,
    onScrollToSurahNav,
    onScrollToTop,
    showSurahNavButton = true
}) {
    if (!show) return null;

    const handleScrollTop = () => {
        if (onScrollToTop) {
            onScrollToTop();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 transition-all duration-300 animate-fade-in">
            {showSurahNavButton && onScrollToSurahNav && (
                <button
                    onClick={onScrollToSurahNav}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md text-green-700 border border-green-200 shadow-lg hover:bg-green-50 hover:border-green-400 transition-all text-xs font-semibold cursor-pointer"
                    title="Lihat Daftar Surah"
                >
                    <IoListOutline className="w-4 h-4 text-green-600" />
                    <span className="hidden sm:inline">Navigasi Surah</span>
                </button>
            )}

            <button
                onClick={handleScrollTop}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center transition-all self-end cursor-pointer"
                title="Kembali ke Atas"
            >
                <IoArrowUpOutline className="w-5 h-5" />
            </button>
        </div>
    );
}
