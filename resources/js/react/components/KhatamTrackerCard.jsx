import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    BookOpenIcon, 
    PlayIcon, 
    FireIcon, 
    SparklesIcon, 
    Cog6ToothIcon, 
    CheckCircleIcon,
    ClockIcon,
    ArrowRightIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui';
import { 
    getKhatamStats, 
    markTodayGoalComplete 
} from '../services/KhatamTrackerService';
import KhatamTargetModal from './KhatamTargetModal';

export default function KhatamTrackerCard({ className = '' }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(getKhatamStats);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [justCompletedToday, setJustCompletedToday] = useState(false);

    useEffect(() => {
        const updateStats = () => {
            setStats(getKhatamStats());
        };

        // Listen for internal updates
        window.addEventListener('indoquran_khatam_updated', updateStats);
        window.addEventListener('indoquran_bookmarks_updated', updateStats);
        return () => {
            window.removeEventListener('indoquran_khatam_updated', updateStats);
            window.removeEventListener('indoquran_bookmarks_updated', updateStats);
        };
    }, []);

    const handleContinueReading = () => {
        navigate(`/surah/${stats.currentSurah}/${stats.currentAyah}`);
    };

    const handleMarkComplete = () => {
        markTodayGoalComplete();
        setStats(getKhatamStats());
        setJustCompletedToday(true);
        setTimeout(() => setJustCompletedToday(false), 3000);
    };

    return (
        <>
            <div className={`relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100/90 shadow-xs hover:shadow-md transition-all ${className}`}>
                {/* Subtle top aura */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
                            <BookOpenIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                    Target Khatam & Tilawah
                                </h2>
                                {stats.streak > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                                        <FireIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                        <span>{stats.streak} Hari Streak</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Pantau istiqomah membaca Al-Quran & target khatam harian Anda
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-emerald-50/60 hover:border-emerald-300 text-xs font-semibold text-gray-700 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Atur target khatam atau catat bacaan fisik"
                        >
                            <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
                            <span>Atur Target</span>
                        </button>
                    </div>
                </div>

                {/* Main Progress Area */}
                <div className="relative z-10 pt-5 space-y-5">
                    {/* Overall Quran Khatam Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                <span>Khatam Al-Quran:</span>
                                <span className="text-emerald-700 text-sm font-extrabold">{stats.percentTotal}%</span>
                            </div>
                            <span className="text-gray-500 font-medium">
                                {stats.currentAbsolute.toLocaleString('id-ID')} / {stats.totalAyahs.toLocaleString('id-ID')} Ayat
                            </span>
                        </div>

                        {/* Progress track */}
                        <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/70">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-700 shadow-xs"
                                style={{ width: `${Math.max(2, stats.percentTotal)}%` }}
                            />
                        </div>

                        {/* Position info pills */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5 text-[11px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
                                    Juz {stats.currentJuz} dari 30
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-gray-700">
                                    QS. {stats.surahName}: Ayat {stats.currentAyah}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                                <span>Target Selesai: <strong>{stats.formattedFinishDate}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Daily Target Box */}
                    <div className="bg-gradient-to-r from-gray-50 via-emerald-50/30 to-teal-50/20 rounded-xl p-3.5 sm:p-4 border border-emerald-100/80 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                <span>🎯 Target Hari Ini:</span>
                                <span className="text-gray-600 font-normal">
                                    {stats.todayReadCount} / {stats.dailyTargetAyahs} Ayat
                                </span>
                            </div>
                            {stats.isTodayGoalMet || justCompletedToday ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    <span>Target Hari Ini Tercapai!</span>
                                </span>
                            ) : (
                                <span className="text-[11px] font-medium text-gray-500">
                                    Sisa {Math.max(0, stats.dailyTargetAyahs - stats.todayReadCount)} ayat lagi
                                </span>
                            )}
                        </div>

                        {/* Daily Progress Bar */}
                        <div className="relative h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    stats.isTodayGoalMet ? 'bg-emerald-500' : 'bg-teal-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(stats.todayReadCount > 0 ? 4 : 0, stats.todayPercent))}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <Button
                            variant="primary"
                            onClick={handleContinueReading}
                            leftIcon={<PlayIcon className="w-4 h-4" />}
                            className="shadow-sm shadow-emerald-700/10 font-semibold"
                        >
                            <span>Lanjutkan Tilawah (Ayat {stats.currentAyah})</span>
                            <ArrowRightIcon className="w-4 h-4 ml-1 opacity-70" />
                        </Button>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                            {!stats.isTodayGoalMet && !justCompletedToday ? (
                                <button
                                    type="button"
                                    onClick={handleMarkComplete}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition-colors border border-emerald-200/60 cursor-pointer"
                                    title="Tandai target bacaan hari ini sudah selesai dibaca di luar web"
                                >
                                    <CheckIcon className="w-3.5 h-3.5" />
                                    <span>Tandai Selesai Hari Ini</span>
                                </button>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <span>Ubah Posisi Manual</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Modal */}
            <KhatamTargetModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setStats(getKhatamStats());
                }}
            />
        </>
    );
}
