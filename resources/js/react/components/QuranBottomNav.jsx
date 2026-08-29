import React from 'react';
import { Link } from 'react-router-dom';
import { 
    IoChevronBackOutline, 
    IoChevronForwardOutline, 
    IoCompassOutline 
} from 'react-icons/io5';

/**
 * Reusable Bottom Completion & Pagination Navigation Card
 */
export default function QuranBottomNav({
    unitLabel = 'Halaman',
    currentIndex = 1,
    totalCount = 604,
    indexUrl = '/halaman',
    indexLabel = 'Lihat Indeks Semua Halaman',
    onNavigate,
    prevSubtitle,
    nextSubtitle,
    quickSelector
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

    return (
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-green-100">
            <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    Navigasi {unitLabel} Al-Quran
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    Selesai Membaca {unitLabel} {currentIndex}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Lanjutkan tilawah ke {unitLabel} berikutnya atau pilih {unitLabel.toLowerCase()} lain
                </p>
            </div>

            {/* Prev / Next Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Prev Button */}
                {currentIndex > 1 ? (
                    <button
                        onClick={handlePrev}
                        className="flex items-center justify-between p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-white hover:border-green-400 hover:shadow-md transition-all text-left group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-200 text-green-700 flex items-center justify-center transition-colors">
                                <IoChevronBackOutline className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-green-700">{unitLabel} Sebelumnya</div>
                                <div className="text-base font-bold text-gray-900">
                                    {unitLabel} {currentIndex - 1}
                                </div>
                                {prevSubtitle && (
                                    <div className="text-xs text-gray-500">{prevSubtitle}</div>
                                )}
                            </div>
                        </div>
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 opacity-60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center">
                            <IoChevronBackOutline className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500">{unitLabel} Sebelumnya</div>
                            <div className="text-sm font-semibold text-gray-400">Ini adalah {unitLabel} Pertama (1)</div>
                        </div>
                    </div>
                )}

                {/* Next Button */}
                {currentIndex < totalCount ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center justify-between p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-l from-green-50 to-white hover:border-green-400 hover:shadow-md transition-all text-right group cursor-pointer"
                    >
                        <div className="text-left">
                            <div className="text-xs font-semibold text-green-700">{unitLabel} Selanjutnya</div>
                            <div className="text-base font-bold text-gray-900">
                                {unitLabel} {currentIndex + 1}
                            </div>
                            {nextSubtitle && (
                                <div className="text-xs text-gray-500">{nextSubtitle}</div>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-600 group-hover:bg-green-700 text-white flex items-center justify-center transition-colors shadow-sm">
                            <IoChevronForwardOutline className="w-5 h-5" />
                        </div>
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 opacity-60 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-medium text-gray-500">{unitLabel} Selanjutnya</div>
                            <div className="text-sm font-semibold text-gray-400">Ini adalah {unitLabel} Terakhir ({totalCount})</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center">
                            <IoChevronForwardOutline className="w-5 h-5" />
                        </div>
                    </div>
                )}
            </div>

            {/* Optional Quick Grid (e.g. 30 Juz selector) */}
            {quickSelector}

            {/* Index Shortcut */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                    Navigasi cepat ke seluruh {totalCount} {unitLabel.toLowerCase()} Al-Quran
                </div>
                <Link
                    to={indexUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs transition-colors border border-green-200 shadow-2xs"
                >
                    <IoCompassOutline className="w-4 h-4" />
                    <span>{indexLabel}</span>
                </Link>
            </div>
        </div>
    );
}
