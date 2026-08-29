import React from 'react';
import { IoListOutline } from 'react-icons/io5';

/**
 * Reusable Sticky Surah Navigation Bar for Quran Reading Pages (Juz, Halaman, etc.)
 */
export default function QuranSurahJumpBar({
    navRef,
    title = 'Navigasi Surah',
    unitLabel = 'Halaman',
    unitNumber = 1,
    surahs = [],
    activeSurahNumber,
    onSurahClick,
    onUnitChange,
    allUnitsCount,
    allUnitsLabel = 'Pilih Halaman'
}) {
    if (!surahs || surahs.length === 0) return null;

    const firstSurah = surahs[0]?.surah;
    const lastSurah = surahs[surahs.length - 1]?.surah;
    const surahRangeSummary = surahs.length > 1
        ? `${firstSurah?.name_latin} - ${lastSurah?.name_latin}`
        : firstSurah?.name_latin;

    return (
        <div 
            ref={navRef}
            className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-5 mb-8 border border-green-100 sticky top-[112px] sm:top-[116px] z-30 transition-all duration-300 backdrop-blur-md"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                        <IoListOutline className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900">
                            {title || `Navigasi Surah di ${unitLabel} ${unitNumber}`}
                        </h2>
                        <p className="text-xs text-gray-500">
                            Terdapat {surahs.length} surah ({surahRangeSummary})
                        </p>
                    </div>
                </div>

                {/* Optional Quick Switcher dropdown if requested */}
                {allUnitsCount && onUnitChange && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-xs text-gray-500 font-medium whitespace-nowrap">
                            {allUnitsLabel}:
                        </label>
                        <select
                            value={unitNumber}
                            onChange={(e) => onUnitChange(parseInt(e.target.value, 10))}
                            className="w-full md:w-auto text-xs sm:text-sm font-semibold border border-green-200 rounded-xl px-3 py-1.5 bg-green-50/70 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
                        >
                            {Array.from({ length: allUnitsCount }, (_, i) => i + 1).map((idx) => (
                                <option key={idx} value={idx}>
                                    {unitLabel} {idx}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Horizontal Scrollable Surah Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
                {surahs.map((surahData) => {
                    const sNum = surahData.surah?.number;
                    const isActive = activeSurahNumber === sNum;
                    const firstAyah = surahData.ayahs?.[0]?.ayah_number;
                    const lastAyah = surahData.ayahs?.[surahData.ayahs.length - 1]?.ayah_number;
                    const rangeText = firstAyah === lastAyah ? `Ayat ${firstAyah}` : `Ayat ${firstAyah}-${lastAyah}`;

                    return (
                        <button
                            key={sNum}
                            onClick={() => onSurahClick && onSurahClick(sNum)}
                            className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                                isActive
                                    ? 'bg-green-600 text-white border-green-600 shadow-md scale-[1.02]'
                                    : 'bg-green-50/60 hover:bg-green-100 text-gray-700 border-green-100 hover:border-green-300'
                            }`}
                            title={`Lompat ke Surah ${surahData.surah?.name_latin} (${rangeText})`}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isActive ? 'bg-white text-green-700' : 'bg-green-200/80 text-green-800'
                            }`}>
                                {sNum}
                            </span>
                            <span className="font-semibold">{surahData.surah?.name_latin}</span>
                            <span className={`text-[10px] opacity-75 font-arabic ${isActive ? 'text-green-100' : 'text-gray-500'}`}>
                                {surahData.surah?.name_arabic}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-green-700/60 text-green-100' : 'bg-white text-gray-600 border border-green-100'
                            }`}>
                                {surahData.ayahs?.length || 0} ay
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
