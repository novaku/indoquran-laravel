import React, { useState } from 'react';
import { 
    IoCopyOutline, 
    IoCheckmarkOutline, 
    IoLogoWhatsapp, 
    IoBookOutline, 
    IoSparklesOutline, 
    IoHandRightOutline 
} from 'react-icons/io5';
import { toast } from 'react-hot-toast';

const SelectedPrayerCard = ({ prayer, onUseInCommunity, isHighlighted = false }) => {
    const [copied, setCopied] = useState(false);

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
                isHighlighted
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

                {prayer.source && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200/80 text-gray-600 text-xs font-medium">
                        <IoBookOutline className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{prayer.source}</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-800 transition-colors">
                {prayer.title}
            </h3>

            {/* Arabic Text Block */}
            <div className="bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-transparent rounded-2xl p-5 sm:p-6 border border-emerald-100/70 mb-4">
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
