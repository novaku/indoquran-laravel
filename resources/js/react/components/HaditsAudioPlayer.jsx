import React from 'react';
import {
    PlayIcon,
    PauseIcon,
    StopIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from '@heroicons/react/24/solid';

/**
 * Interactive Audio Player Bar for Hadits
 * Powered by Web Speech API
 */
export default function HaditsAudioPlayer({
    haditsId,
    speech,
    className = ''
}) {
    if (!speech || !speech.isSupported) {
        return null;
    }

    const isActive = speech.activeId === haditsId;
    if (!isActive) return null;

    const {
        isPlaying,
        isPaused,
        currentChunkIndex,
        totalChunks,
        rate,
        pause,
        resume,
        stop,
        changeRate
    } = speech;

    const speedOptions = [
        { label: '0.75x', value: 0.75 },
        { label: '0.85x', value: 0.85 },
        { label: '1.0x', value: 1.0 }
    ];

    return (
        <div className={`bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl p-3 border border-emerald-200 shadow-sm transition-all duration-300 animate-fadeIn ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">

                {/* Left: Wave Animation & Status */}
                <div className="flex items-center space-x-2.5">
                    {/* Equalizer Sound Waves */}
                    <div className="flex items-end space-x-0.5 h-4 w-5 px-0.5">
                        <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '0ms' }} />
                        <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isPlaying ? 'h-4 animate-pulse' : 'h-2'}`} style={{ animationDelay: '150ms' }} />
                        <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} style={{ animationDelay: '300ms' }} />
                        <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '100ms' }} />
                    </div>

                    <div className="text-xs">
                        <div className="font-semibold text-emerald-900 flex items-center space-x-1.5">
                            <span>{isPlaying ? 'Membacakan Teks Arab' : isPaused ? 'Audio Dijeda' : 'Audio Player'}</span>
                            {totalChunks > 1 && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded-full">
                                    Bagian {currentChunkIndex + 1}/{totalChunks}
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                            Audio sintesis browser (Web Speech API)
                        </div>
                    </div>
                </div>

                {/* Center / Right: Controls */}
                <div className="flex items-center space-x-2">

                    {/* Speed Selector */}
                    <div className="inline-flex rounded-lg bg-white/80 p-0.5 border border-emerald-200/80 text-[11px]">
                        {speedOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => changeRate(opt.value)}
                                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                    rate === opt.value
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                        : 'text-gray-600 hover:text-emerald-700'
                                }`}
                                title={`Kecepatan ${opt.label}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Play / Pause Button */}
                    {isPlaying ? (
                        <button
                            onClick={pause}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            title="Jeda Pembacaan"
                        >
                            <PauseIcon className="w-3.5 h-3.5" />
                            <span>Jeda</span>
                        </button>
                    ) : (
                        <button
                            onClick={resume}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                            title="Lanjutkan Pembacaan"
                        >
                            <PlayIcon className="w-3.5 h-3.5" />
                            <span>Lanjut</span>
                        </button>
                    )}

                    {/* Stop Button */}
                    <button
                        onClick={stop}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-200/80 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs font-medium transition-colors"
                        title="Hentikan Audio"
                    >
                        <StopIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Stop</span>
                    </button>

                </div>

            </div>

            {/* Subtle Progress Bar */}
            {totalChunks > 1 && (
                <div className="w-full bg-emerald-100/60 rounded-full h-1 mt-2.5 overflow-hidden">
                    <div
                        className="bg-emerald-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((currentChunkIndex + 1) / totalChunks) * 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
