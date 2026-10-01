import React, { useState } from 'react';
import { 
    IoCopyOutline, 
    IoCheckmarkOutline, 
    IoLogoWhatsapp, 
    IoBookOutline, 
    IoSparklesOutline, 
    IoHandRightOutline
} from 'react-icons/io5';
import {
    PlayIcon as SolidPlayIcon,
    PauseIcon as SolidPauseIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useArabicSpeech } from '../hooks/useArabicSpeech';
import HaditsAudioPlayer from './HaditsAudioPlayer';

const SelectedPrayerCard = ({ prayer, onUseInCommunity, isHighlighted = false, speech }) => {
    const [copied, setCopied] = useState(false);
    const localSpeech = useArabicSpeech();
    const activeSpeech = speech || localSpeech;

    const prayerShareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/doa-bersama?doa=${prayer.id}#doa-${prayer.id}`
        : `https://indoquran.web.id/doa-bersama?doa=${prayer.id}#doa-${prayer.id}`;

    const handleCopy = async () => {
        try {
            const textToCopy = `🤲 ${prayer.title}\n\n${prayer.arabic}\n\nArtinya:\n"${prayer.translation}"\n\n📖 Sumber: ${prayer.source || 'Doa Pilihan'}\n${prayer.fadhilah ? `✨ Keutamaan: ${prayer.fadhilah}\n` : ''}\nDibaca dari IndoQuran:\n${prayerShareUrl}`;
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success('Lafadz doa & tautan berhasil disalin!');
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            toast.error('Gagal menyalin doa ke clipboard');
        }
    };

    const handleShareWhatsApp = () => {
        const textToShare = `🤲 *${prayer.title}*\n\n${prayer.arabic}\n\n_${prayer.latin}_\n\n*Artinya:*\n"${prayer.translation}"\n\n📖 *Sumber:* ${prayer.source || 'Doa Pilihan'}\n${prayer.fadhilah ? `✨ *Keutamaan:* ${prayer.fadhilah}\n` : ''}\nMari baca dan amalkan bersama di IndoQuran:\n${prayerShareUrl}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <div 
            id={`doa-${prayer.id}`}
            className={`bg-white rounded-2xl p-5 sm:p-6 transition-all duration-300 relative group overflow-hidden ${
                isHighlighted || (activeSpeech && activeSpeech.activeId === prayer.id)
                    ? 'ring-2 ring-emerald-500 shadow-xl border-emerald-400 bg-emerald-50/20'
                    : 'hover:shadow-lg border border-emerald-100/80 hover:border-emerald-300'
            }`}
        >
            {/* Subtle top decoration bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 opacity-80" />

            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs">
                        #{prayer.order}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {prayer.category_name || prayer.category}
                    </span>
                    {isHighlighted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold animate-pulse">
                            <IoSparklesOutline className="w-3.5 h-3.5 text-amber-600" />
                            <span>Doa yang Dituju</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {prayer.source && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200/80 text-gray-600 text-xs font-medium">
                            <IoBookOutline className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{prayer.source}</span>
                        </div>
                    )}

                    {/* Play Audio Button (Client-side Web Speech API) */}
                    {activeSpeech && activeSpeech.isSupported && (
                        <button
                            onClick={() => {
                                if (activeSpeech.activeId === prayer.id) {
                                    if (activeSpeech.isPlaying) activeSpeech.pause();
                                    else activeSpeech.resume();
                                } else {
                                    activeSpeech.play(prayer.id, prayer.arabic);
                                }
                            }}
                            className={`group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeSpeech.activeId === prayer.id
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs hover:shadow-xs'
                            }`}
                            title="Putar Audio Pelafalan Arab (Speech Synthesis)"
                        >
                            <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-md transition-all ${
                                activeSpeech.activeId === prayer.id
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-600 text-white shadow-2xs group-hover:scale-105'
                            }`}>
                                {activeSpeech.activeId === prayer.id && activeSpeech.isPlaying ? (
                                    <SolidPauseIcon className="w-3 h-3 fill-current" />
                                ) : (
                                    <SolidPlayIcon className="w-3 h-3 ml-0.5 fill-current" />
                                )}
                            </span>
                            <span>
                                {activeSpeech.activeId === prayer.id
                                    ? (activeSpeech.isPlaying ? 'Jeda' : 'Lanjut')
                                    : 'Putar Audio'}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-800 transition-colors">
                {prayer.title}
            </h3>

            {/* Arabic Text Block */}
            <div className={`bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-transparent rounded-2xl p-5 sm:p-6 border transition-all mb-4 ${
                activeSpeech && activeSpeech.activeId === prayer.id
                    ? 'border-emerald-300 ring-2 ring-emerald-200/60 shadow-xs'
                    : 'border-emerald-100/70'
            }`}>
                <p 
                    className="font-arabic text-right text-2xl sm:text-3xl leading-loose font-normal text-gray-900 select-text"
                    dir="rtl"
                    lang="ar"
                >
                    {prayer.arabic}
                </p>

                {/* Latin Transliteration */}
                {prayer.latin && (
                    <div className="mt-4 pt-3 border-t border-emerald-100/60">
                        <p className="text-xs sm:text-sm text-emerald-800/90 font-medium italic leading-relaxed">
                            {prayer.latin}
                        </p>
                    </div>
                )}

                {/* Client-side Audio Player (Web Speech API) */}
                {activeSpeech && activeSpeech.isSupported && activeSpeech.activeId === prayer.id && (
                    <div className="mt-4 pt-3.5 border-t border-emerald-100/70">
                        <HaditsAudioPlayer haditsId={prayer.id} speech={activeSpeech} />
                    </div>
                )}
            </div>

            {/* Indonesian Translation */}
            <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Artinya:
                </h4>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    "{prayer.translation}"
                </p>
            </div>

            {/* Fadhilah / Keutamaan (if available) */}
            {prayer.fadhilah && (
                <div className="bg-gradient-to-r from-amber-50/90 to-yellow-50/50 border border-amber-200/80 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm text-amber-900 mb-5 flex items-start gap-2.5 shadow-2xs">
                    <IoSparklesOutline className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-amber-950">Keutamaan / Waktu Membaca: </span>
                        <span>{prayer.fadhilah}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                            copied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200'
                        }`}
                        title="Salin doa lengkap"
                    >
                        {copied ? (
                            <>
                                <IoCheckmarkOutline className="w-4 h-4 text-white" />
                                <span>Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <IoCopyOutline className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
                                <span>Salin Doa</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleShareWhatsApp}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                        title="Bagikan ke WhatsApp"
                    >
                        <IoLogoWhatsapp className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                </div>

                {onUseInCommunity && (
                    <button
                        onClick={() => onUseInCommunity(prayer)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 hover:border-emerald-400 transition-all shadow-2xs cursor-pointer ml-auto"
                        title="Jadikan doa bersama untuk diaminkan komunitas"
                    >
                        <IoHandRightOutline className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim ke Doa Bersama</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SelectedPrayerCard;
