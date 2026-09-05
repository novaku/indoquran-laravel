import React, { useState, useEffect } from 'react';
import { 
    XMarkIcon, 
    SparklesIcon, 
    CalendarIcon, 
    BookmarkIcon, 
    ArrowPathIcon,
    CheckIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui';
import { SURAH_FALLBACK_DATA } from '../data/surahsFallbackData';
import { 
    getKhatamStats, 
    updateKhatamTarget, 
    updateManualPosition, 
    resetKhatamPlan 
} from '../services/KhatamTrackerService';

const TARGET_PRESETS = [
    {
        days: 30,
        title: '30 Hari (One Day One Juz)',
        subtitle: '~208 ayat / 1 Juz per hari',
        badge: 'Paling Populer',
        recommended: true,
        icon: '🌙'
    },
    {
        days: 60,
        title: '60 Hari (Santai & Istiqomah)',
        subtitle: '~104 ayat / 0.5 Juz per hari',
        badge: 'Rekomendasi',
        recommended: false,
        icon: '📖'
    },
    {
        days: 90,
        title: '90 Hari (3 Bulan)',
        subtitle: '~69 ayat / sepertiga Juz per hari',
        badge: 'Rutin Harian',
        recommended: false,
        icon: '✨'
    },
    {
        days: 365,
        title: '1 Tahun (Khatam Tahunan)',
        subtitle: '~17 ayat / 1 halaman per hari',
        badge: 'Pemula',
        recommended: false,
        icon: '🌱'
    }
];

export default function KhatamTargetModal({ isOpen, onClose }) {
    const [stats, setStats] = useState(getKhatamStats);
    const [selectedDays, setSelectedDays] = useState(30);
    const [customDays, setCustomDays] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Manual reading update form
    const [manualSurah, setManualSurah] = useState(1);
    const [manualAyah, setManualAyah] = useState(1);
    const [activeTab, setActiveTab] = useState('target'); // 'target' | 'manual'

    useEffect(() => {
        if (isOpen) {
            const currentStats = getKhatamStats();
            setStats(currentStats);
            const isPreset = TARGET_PRESETS.some(p => p.days === currentStats.targetDays);
            if (isPreset) {
                setSelectedDays(currentStats.targetDays);
                setIsCustomMode(false);
            } else {
                setSelectedDays(currentStats.targetDays);
                setCustomDays(String(currentStats.targetDays));
                setIsCustomMode(true);
            }
            setManualSurah(currentStats.currentSurah || 1);
            setManualAyah(currentStats.currentAyah || 1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentSelectedSurah = SURAH_FALLBACK_DATA.find(s => s.number === parseInt(manualSurah, 10)) || SURAH_FALLBACK_DATA[0];

    const handleSaveTarget = () => {
        const daysToSave = isCustomMode ? (parseInt(customDays, 10) || 30) : selectedDays;
        updateKhatamTarget(daysToSave);
        setStats(getKhatamStats());
        onClose();
    };

    const handleSaveManualPosition = () => {
        updateManualPosition(parseInt(manualSurah, 10), parseInt(manualAyah, 10));
        setStats(getKhatamStats());
        onClose();
    };

    const handleReset = () => {
        if (window.confirm('Apakah Anda yakin ingin mengatur ulang progres dan target khatam dari awal?')) {
            resetKhatamPlan();
            setStats(getKhatamStats());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base shadow-2xs">
                            🎯
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-base">Atur Target Khatam Al-Quran</h3>
                            <p className="text-xs text-gray-500">Sesuaikan target harian & catat riwayat tilawah Anda</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Subnav Tabs */}
                <div className="flex border-b border-gray-200/80 bg-gray-50/60 px-5 pt-2">
                    <button
                        onClick={() => setActiveTab('target')}
                        className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'target'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        🎯 Target Hari & Kecepatan
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                            activeTab === 'manual'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        📖 Catat Bacaan Fisik (Mushaf)
                    </button>
                </div>

                <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
                    {activeTab === 'target' && (
                        <>
                            <div className="space-y-2.5">
                                <label className="block text-xs font-semibold text-gray-700">
                                    Pilih Rencana Durasi Khatam:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {TARGET_PRESETS.map((preset) => {
                                        const isSelected = !isCustomMode && selectedDays === preset.days;
                                        return (
                                            <button
                                                key={preset.days}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDays(preset.days);
                                                    setIsCustomMode(false);
                                                }}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{preset.icon}</span>
                                                        <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                                            {preset.days} Hari
                                                        </span>
                                                    </div>
                                                    {preset.badge && (
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                            isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {preset.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-tight">
                                                    {preset.subtitle}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Days Option */}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomMode(true)}
                                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                            isCustomMode
                                                ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-2xs'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span>⚙️</span>
                                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                                    Target Hari Kustom
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">Tentukan hari sendiri</span>
                                        </div>
                                        {isCustomMode && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    value={customDays}
                                                    onChange={(e) => setCustomDays(e.target.value)}
                                                    placeholder="Contoh: 40"
                                                    className="w-32 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <span className="text-xs text-gray-600 font-medium">Hari</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Target Khatam Dipilih:</span>
                                    <span className="font-bold text-emerald-800">
                                        {isCustomMode ? `${customDays || 30} Hari` : `${selectedDays} Hari`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Kebutuhan Tilawah Harian:</span>
                                    <span className="font-bold text-gray-900">
                                        ~{Math.ceil(6236 / (isCustomMode ? parseInt(customDays, 10) || 30 : selectedDays))} Ayat / Hari
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/80">
                                    💡 <em>Tips:</em> Anda dapat membaca langsung di web atau membaca di Al-Quran cetak lalu mencatat progresnya di sini.
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === 'manual' && (
                        <div className="space-y-3.5">
                            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
                                <strong>Membaca di Al-Quran Fisik?</strong> Anda dapat memperbarui posisi bacaan terakhir agar persentase khatam dan target harian di web tetap tersinkronisasi.
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Pilih Surah Terakhir Dibaca:
                                    </label>
                                    <select
                                        value={manualSurah}
                                        onChange={(e) => {
                                            setManualSurah(parseInt(e.target.value, 10));
                                            setManualAyah(1);
                                        }}
                                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {SURAH_FALLBACK_DATA.map((s) => (
                                            <option key={s.number} value={s.number}>
                                                {s.number}. {s.name_latin} ({s.name_arabic}) - {s.total_ayahs} Ayat
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nomor Ayat Terakhir:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={currentSelectedSurah.total_ayahs}
                                            value={manualAyah}
                                            onChange={(e) => setManualAyah(Math.min(currentSelectedSurah.total_ayahs, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                            className="w-32 px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                        />
                                        <span className="text-xs text-gray-500">
                                            dari {currentSelectedSurah.total_ayahs} ayat
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/80">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium cursor-pointer"
                    >
                        Reset Rencana
                    </button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={activeTab === 'target' ? handleSaveTarget : handleSaveManualPosition}
                            leftIcon={<CheckIcon className="w-4 h-4" />}
                            className="shadow-sm"
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
