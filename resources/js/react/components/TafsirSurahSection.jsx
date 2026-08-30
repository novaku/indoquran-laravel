import React, { useState, useMemo } from 'react';
import { 
    BookOpenIcon, 
    DocumentTextIcon, 
    ShareIcon, 
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
    IoSparkles, 
    IoInformationCircleOutline,
    IoCheckmark,
    IoCopyOutline
} from 'react-icons/io5';

// Color-blind friendly metadata for theme badges (High Contrast / WCAG AAA)
const getThemeMetadata = (title = '', content = '') => {
    const combined = `${title} ${content}`.toLowerCase();
    
    if (combined.includes('iman') || combined.includes('akidah') || combined.includes('tauhid') || combined.includes('keimanan') || combined.includes('allah') || combined.includes('rukun')) {
        return {
            badge: 'bg-emerald-100 text-emerald-950 border-emerald-500 font-extrabold',
            border: 'border-l-emerald-600',
            icon: '🛡️',
            label: 'Akidah & Keimanan'
        };
    }
    if (combined.includes('hukum') || combined.includes('syariat') || combined.includes('perintah') || combined.includes('larangan') || combined.includes('sholat') || combined.includes('salat') || combined.includes('zakat') || combined.includes('puasa') || combined.includes('haji') || combined.includes('muamalah') || combined.includes('riba') || combined.includes('nikah')) {
        return {
            badge: 'bg-blue-100 text-blue-950 border-blue-500 font-extrabold',
            border: 'border-l-blue-600',
            icon: '⚖️',
            label: 'Hukum & Syariat'
        };
    }
    if (combined.includes('kisah') || combined.includes('nabi') || combined.includes('sejarah') || combined.includes('kaum') || combined.includes('adam') || combined.includes('musa') || combined.includes('ibrahim') || combined.includes('israil') || combined.includes('rasul')) {
        return {
            badge: 'bg-amber-100 text-amber-950 border-amber-500 font-extrabold',
            border: 'border-l-amber-600',
            icon: '📜',
            label: 'Kisah & Ibrah'
        };
    }
    if (combined.includes('fatihah') || combined.includes('ummul') || combined.includes('sab\'ul') || combined.includes('nama') || combined.includes('sebutan')) {
        return {
            badge: 'bg-teal-100 text-teal-950 border-teal-500 font-extrabold',
            border: 'border-l-teal-600',
            icon: '📖',
            label: 'Nama & Keutamaan'
        };
    }
    return {
        badge: 'bg-indigo-100 text-indigo-950 border-indigo-500 font-extrabold',
        border: 'border-l-indigo-600',
        icon: '💡',
        label: 'Hikmah & Mau\'izhah'
    };
};

// Robust, clean parser for Surah Tafsir & Descriptions
const parseSurahDescription = (rawText = '') => {
    if (!rawText) return { introText: '', points: [], rawHtml: '' };

    // Clean html tags to plain text while preserving paragraph breaks
    const cleanText = rawText.replace(/<[^>]+>/g, (match) => {
        if (match.startsWith('<p') || match.startsWith('</p')) return '\n\n';
        if (match.startsWith('<br')) return '\n';
        return '';
    }).replace(/&nbsp;/g, ' ').trim();

    // Check if description has numbered points (e.g. 1. / 1) / Di antara pokok-pokok isinya)
    const hasNumberedPoints = /(?:^|\n)\s*\d+[\.\)]\s+/.test(cleanText);

    if (!hasNumberedPoints) {
        return {
            introText: cleanText,
            points: [],
            rawHtml: rawText
        };
    }

    // Find where the points begin
    const firstPointIndex = cleanText.search(/(?:^|\n)\s*1[\.\)]\s+/);
    
    let introText = cleanText;
    let pointsText = '';

    if (firstPointIndex !== -1) {
        introText = cleanText.substring(0, firstPointIndex).replace(/(?:Di antara pokok-pokok isinya ialah:?|pokok-pokok isinya:?|Pokok-pokok isi:?|Kandungan utama:?)\s*$/i, '').trim();
        pointsText = cleanText.substring(firstPointIndex).trim();
    }

    // Split points cleanly
    const rawChunks = pointsText.split(/\n(?=\s*\d+[\.\)])/).filter(Boolean);
    const parsedPoints = [];

    rawChunks.forEach((chunk) => {
        const lineMatch = chunk.match(/^\s*(\d+)[\.\)]\s*([\s\S]+)$/);
        if (!lineMatch) return;

        const num = lineMatch[1];
        const body = lineMatch[2].trim();

        let title = '';
        let content = body;

        const colonMatch = body.match(/^([^:\n]{2,40}):\s*([\s\S]+)$/);
        const dashMatch = body.match(/^([^\-\n]{2,40})\s*-\s*([\s\S]+)$/);
        const commaMatch = body.match(/^([^,\n]{2,30}),\s*seperti:\s*([\s\S]+)$/i);

        if (colonMatch) {
            title = colonMatch[1].trim();
            content = colonMatch[2].trim();
        } else if (dashMatch) {
            title = dashMatch[1].trim();
            content = dashMatch[2].trim();
        } else if (commaMatch) {
            title = commaMatch[1].trim();
            content = `seperti: ${commaMatch[2].trim()}`;
        } else {
            const newlineMatch = body.match(/^([^\n]{2,50})\n+([\s\S]+)$/);
            if (newlineMatch) {
                title = newlineMatch[1].trim();
                content = newlineMatch[2].trim();
            }
        }

        parsedPoints.push({
            number: num,
            title: title,
            content: content,
            meta: getThemeMetadata(title, content)
        });
    });

    return {
        introText,
        points: parsedPoints,
        rawHtml: rawText
    };
};

const TafsirSurahSection = ({
    surah,
    currentAyah,
    currentAyahNumber = 1,
    maxAyahNumber = 1,
    onShareSurah
}) => {
    const [activeTab, setActiveTab] = useState('surah'); // 'surah' | 'ayah'
    const [fontSizeMode, setFontSizeMode] = useState('normal'); // 'small' | 'normal' | 'large' | 'xlarge'
    const [readingTheme, setReadingTheme] = useState('parchment'); // 'modern' | 'parchment' | 'night'
    const [searchKeyword, setSearchKeyword] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);

    const surahRawDesc = surah?.description_long || surah?.description_short || surah?.description || '';
    const parsedDesc = useMemo(() => parseSurahDescription(surahRawDesc), [surahRawDesc]);

    // Active Ayah is solely tied to currentAyah from top navigation
    const activeAyahData = currentAyah || null;

    // Filtered points for Surah tab
    const filteredPoints = useMemo(() => {
        if (!searchKeyword.trim()) return parsedDesc.points;
        const kw = searchKeyword.toLowerCase();
        return parsedDesc.points.filter(
            p => p.content.toLowerCase().includes(kw) || p.title.toLowerCase().includes(kw)
        );
    }, [parsedDesc.points, searchKeyword]);

    // Font size classes
    const fontSizeClasses = {
        small: 'text-sm sm:text-base leading-relaxed',
        normal: 'text-base sm:text-lg leading-relaxed',
        large: 'text-lg sm:text-xl leading-loose',
        xlarge: 'text-xl sm:text-2xl leading-loose'
    }[fontSizeMode];

    // High Contrast & Color-Blind Safe Theme Tokens (WCAG AAA compliant: contrast >= 7:1)
    const currentTheme = useMemo(() => {
        if (readingTheme === 'night') {
            return {
                wrapper: 'bg-slate-950 border-slate-800 shadow-2xl text-slate-100',
                header: 'bg-slate-900 border-b border-slate-800 text-white',
                toolbarBg: 'bg-slate-900 border-slate-800',
                bodyText: 'text-slate-100 font-normal',
                subText: 'text-slate-300 font-medium',
                headingText: 'text-white font-extrabold',
                cardBg: 'bg-slate-900 border-slate-700 shadow-sm text-slate-100',
                cardHighlightBg: 'bg-slate-900 border-emerald-500 text-slate-100',
                arabicCardBg: 'bg-slate-900 border-slate-700 text-emerald-300',
                arabicText: 'text-emerald-300 font-normal',
                tabActive: 'bg-emerald-600 text-white font-bold shadow-md',
                tabInactive: 'text-slate-300 hover:text-white hover:bg-slate-800',
                inputBg: 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-400',
                footerBg: 'bg-slate-950 border-slate-800 text-slate-300',
                copyBtn: 'text-slate-200 hover:text-white hover:bg-slate-800 border-slate-700 bg-slate-800/80'
            };
        }
        
        if (readingTheme === 'parchment') {
            return {
                wrapper: 'bg-[#FDFBF7] border-amber-300 shadow-xl text-stone-950',
                header: 'bg-gradient-to-r from-[#1A3A34] via-[#234E46] to-[#1A3A34] text-white',
                toolbarBg: 'bg-[#F2ECD9] border-amber-300',
                bodyText: 'text-stone-950 font-normal',
                subText: 'text-stone-700 font-semibold',
                headingText: 'text-stone-950 font-extrabold',
                cardBg: 'bg-[#FFFDF7] border-amber-300/90 shadow-2xs text-stone-950',
                cardHighlightBg: 'bg-[#FEFCE8] border-amber-400 text-stone-950',
                arabicCardBg: 'bg-[#FAF5E6] border-amber-300/90',
                arabicText: 'text-stone-950 font-normal',
                tabActive: 'bg-[#1C3E37] text-white font-bold shadow-md',
                tabInactive: 'text-stone-900 hover:text-black hover:bg-amber-100/90 font-bold',
                inputBg: 'bg-white border-amber-400 text-stone-950 placeholder-stone-600 focus:border-emerald-800',
                footerBg: 'bg-[#F3EDE0] border-amber-300 text-stone-800 font-medium',
                copyBtn: 'text-stone-900 hover:text-black hover:bg-amber-200/80 border-amber-400 bg-amber-100/60'
            };
        }

        // 'modern' (Clean High-Contrast Light)
        return {
            wrapper: 'bg-white border-slate-300 shadow-xl text-slate-950',
            header: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white',
            toolbarBg: 'bg-slate-100 border-slate-300',
            bodyText: 'text-slate-950 font-normal',
            subText: 'text-slate-700 font-semibold',
            headingText: 'text-slate-950 font-extrabold',
            cardBg: 'bg-white border-slate-300 shadow-2xs text-slate-950',
            cardHighlightBg: 'bg-emerald-50 border-emerald-400 text-slate-950',
            arabicCardBg: 'bg-emerald-50/80 border-emerald-300',
            arabicText: 'text-slate-950 font-normal',
            tabActive: 'bg-emerald-800 text-white font-bold shadow-md',
            tabInactive: 'text-slate-900 hover:text-emerald-950 hover:bg-slate-200 font-bold',
            inputBg: 'bg-white border-slate-300 text-slate-950 placeholder-slate-600 focus:border-emerald-800',
            footerBg: 'bg-slate-100 border-slate-300 text-slate-800 font-medium',
            copyBtn: 'text-slate-900 hover:text-black hover:bg-slate-200 border-slate-300 bg-slate-50'
        };
    }, [readingTheme]);

    // Handle Copy with Toast Feedback
    const handleCopy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2200);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // Handle Share WhatsApp for Tafsir
    const handleShareTafsir = (type = 'surah') => {
        let text = '';
        if (type === 'surah') {
            text = `📖 *TAFSIR & KANDUNGAN SURAH ${surah.name_latin?.toUpperCase()}*\n`;
            text += `QS. ${surah.number}: ${surah.name_arabic} (${surah.name_indonesian})\n`;
            text += `Total: ${maxAyahNumber} Ayat • ${surah.revelation_place}\n\n`;
            text += `${parsedDesc.introText.slice(0, 500)}...\n\n`;
            text += `🔗 Baca Tafsir Selengkapnya di IndoQuran:\n${window.location.origin}/surah/${surah.number}`;
        } else {
            text = `📖 *TAFSIR SURAH ${surah.name_latin?.toUpperCase()} - AYAT ${currentAyahNumber}*\n`;
            text += `QS. ${surah.number}:${currentAyahNumber}\n\n`;
            if (activeAyahData?.text_arabic) text += `${activeAyahData.text_arabic}\n\n`;
            if (activeAyahData?.text_indonesian) text += `Artinya: "${activeAyahData.text_indonesian}"\n\n`;
            if (activeAyahData?.tafsir) text += `*Tafsir:*\n${activeAyahData.tafsir}\n\n`;
            text += `🔗 Baca di IndoQuran:\n${window.location.origin}/surah/${surah.number}/${currentAyahNumber}`;
        }

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <section 
            id="tafsir-section" 
            className={`rounded-3xl border transition-colors duration-200 overflow-hidden mt-8 ${currentTheme.wrapper}`}
        >
            {/* 1. Header Banner */}
            <div className={`p-5 sm:p-7 relative ${currentTheme.header}`}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                                <IoSparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Kajian & Tafsir Lengkap</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-100 border border-emerald-400/40">
                                <span>Sumber: Kemenag RI</span>
                            </span>
                        </div>

                        <div className="flex items-baseline gap-3 flex-wrap">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                Tafsir {surah.name_latin || surah.name_english}
                            </h2>
                            <span className="font-arabic text-2xl sm:text-3xl text-emerald-200" dir="rtl">
                                {surah.name_arabic}
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-2xl leading-relaxed">
                            {surah.name_indonesian ? `"${surah.name_indonesian}"` : ''} • Surah ke-{surah.number} • {maxAyahNumber} Ayat • Diturunkan di {surah.revelation_place || 'Mekah/Madinah'}
                        </p>
                    </div>

                    {/* Quick Share Button */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => handleShareTafsir(activeTab === 'ayah' ? 'ayah' : 'surah')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-emerald-950 hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer shadow-md"
                            title="Bagikan tafsir ke WhatsApp"
                        >
                            <ShareIcon className="w-4 h-4 text-emerald-800" />
                            <span>Bagikan Tafsir</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Reader Control Bar & Tabs */}
            <div className={`p-4 border-b ${currentTheme.toolbarBg} flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5`}>
                {/* Tab Switcher - Simple 2 Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl overflow-x-auto bg-black/10">
                    <button
                        type="button"
                        onClick={() => setActiveTab('surah')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'surah' ? currentTheme.tabActive : currentTheme.tabInactive
                        }`}
                    >
                        <BookOpenIcon className="w-4 h-4" />
                        <span>Kandungan Surah</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ayah')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'ayah' ? currentTheme.tabActive : currentTheme.tabInactive
                        }`}
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Tafsir Ayat {currentAyahNumber}</span>
                    </button>
                </div>

                {/* Reader Comfort Preferences (Search, Font Size & High-Contrast Mood) */}
                <div className="flex items-center justify-between lg:justify-end gap-2.5 flex-wrap">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-48 lg:w-44">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Cari tafsir..."
                            className={`w-full text-xs font-semibold rounded-xl pl-8 pr-3 py-1.5 border outline-none transition shadow-2xs ${currentTheme.inputBg}`}
                        />
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-600" />
                        {searchKeyword && (
                            <button
                                onClick={() => setSearchKeyword('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-700 hover:text-black"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Font Size Selector */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-black/10">
                        <span className="text-[11px] font-extrabold text-stone-800 px-1.5 hidden sm:inline">
                            Font:
                        </span>
                        {[
                            { id: 'small', label: 'A-' },
                            { id: 'normal', label: 'A' },
                            { id: 'large', label: 'A+' },
                            { id: 'xlarge', label: 'A++' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setFontSizeMode(btn.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                                    fontSizeMode === btn.id
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-stone-900 hover:bg-black/10'
                                }`}
                                title={`Ukuran Teks: ${btn.id}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* High Contrast Color Theme Selector */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-black/10">
                        {[
                            { id: 'modern', label: 'Terang', badgeDot: 'bg-white border-slate-600' },
                            { id: 'parchment', label: 'Klasik', badgeDot: 'bg-[#F2E8CF] border-amber-700' },
                            { id: 'night', label: 'Gelap', badgeDot: 'bg-slate-900 border-slate-500' }
                        ].map((th) => (
                            <button
                                key={th.id}
                                type="button"
                                onClick={() => setReadingTheme(th.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                                    readingTheme === th.id
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-stone-900 hover:bg-black/10'
                                }`}
                                title={`Mode Kontras: ${th.label}`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full border ${th.badgeDot}`} />
                                <span className="hidden sm:inline">{th.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Main Content Body */}
            <div className="p-5 sm:p-8">
                {/* TAB 1: Kandungan & Tafsir Surah */}
                {activeTab === 'surah' && (
                    <div className="space-y-6">
                        {/* Narrative Intro Card */}
                        {parsedDesc.introText ? (
                            <div className={`rounded-2xl p-5 sm:p-7 border ${currentTheme.cardBg}`}>
                                <div className="flex items-center justify-between gap-3 mb-3.5 border-b pb-3 border-stone-300">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs">
                                            📖
                                        </span>
                                        <h3 className={`text-base sm:text-lg ${currentTheme.headingText}`}>
                                            Pengantar & Latar Belakang Surah
                                        </h3>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(parsedDesc.introText, 'intro')}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                        title="Salin pengantar surah"
                                    >
                                        {copiedKey === 'intro' ? (
                                            <>
                                                <IoCheckmark className="w-4 h-4 text-emerald-600 font-bold" />
                                                <span className="text-emerald-700 font-extrabold">Tersalin!</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoCopyOutline className="w-3.5 h-3.5" />
                                                <span>Salin</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className={`${fontSizeClasses} ${currentTheme.bodyText} text-justify leading-relaxed whitespace-pre-line`}>
                                    {parsedDesc.introText}
                                </div>
                            </div>
                        ) : (
                            <p className={`${currentTheme.subText} italic text-center py-6`}>
                                Penjelasan lengkap untuk Surah ini belum tersedia.
                            </p>
                        )}

                        {/* Structured Pokok-Pokok Isi Cards */}
                        {filteredPoints.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-300">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs">
                                            ✨
                                        </span>
                                        <div>
                                            <h3 className={`text-base sm:text-lg ${currentTheme.headingText}`}>
                                                Pokok-Pokok Kandungan & Tema Utama
                                            </h3>
                                            <p className={`text-xs ${currentTheme.subText}`}>
                                                Ringkasan tema dan bahasan penting dalam surah ini
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-stone-900 text-white shadow-2xs">
                                        {filteredPoints.length} Tema
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredPoints.map((pt, idx) => (
                                        <div
                                            key={`point-${idx}`}
                                            className={`rounded-2xl p-5 sm:p-6 border border-l-4 transition-all duration-200 hover:shadow-md ${currentTheme.cardBg} ${pt.meta.border}`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-3.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-xs font-extrabold bg-stone-950 text-white shadow-2xs">
                                                        #{pt.number}
                                                    </span>
                                                    <span className="text-lg">{pt.meta.icon}</span>
                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full border shadow-2xs ${pt.meta.badge}`}>
                                                        {pt.title || pt.meta.label}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${pt.title ? pt.title + ':\n' : ''}${pt.content}`, `pt-${idx}`)}
                                                    className={`p-1.5 rounded-lg border transition cursor-pointer ${currentTheme.copyBtn}`}
                                                    title="Salin tema ini"
                                                >
                                                    {copiedKey === `pt-${idx}` ? (
                                                        <IoCheckmark className="w-4 h-4 text-emerald-600 font-bold" />
                                                    ) : (
                                                        <IoCopyOutline className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            <p className={`${fontSizeClasses} ${currentTheme.bodyText} leading-relaxed`}>
                                                {pt.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Tafsir Ayat Aktif (Tied strictly to Top Navigation currentAyahNumber) */}
                {activeTab === 'ayah' && (
                    <div className="space-y-6">
                        {/* Ayah Context Header */}
                        <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-3 ${currentTheme.cardBg}`}>
                            <div className="flex items-center gap-2.5">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-700 text-white font-extrabold text-sm shadow-xs">
                                    {currentAyahNumber}
                                </span>
                                <div>
                                    <h3 className={`text-sm sm:text-base ${currentTheme.headingText}`}>
                                        Tafsir Ayat ke-{currentAyahNumber}
                                    </h3>
                                    <p className={`text-xs ${currentTheme.subText}`}>
                                        Surah {surah.name_latin} • Ayat {currentAyahNumber} dari {maxAyahNumber}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopy(activeAyahData?.tafsir || 'Tafsir belum tersedia', 'ayah-tafsir-header')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                title="Salin tafsir ayat ini"
                            >
                                {copiedKey === 'ayah-tafsir-header' ? (
                                    <>
                                        <IoCheckmark className="w-4 h-4 text-emerald-600 font-bold" />
                                        <span className="text-emerald-700 font-bold">Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <IoCopyOutline className="w-3.5 h-3.5" />
                                        <span>Salin Tafsir</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Active Ayah Context (Arabic & Translation & Tafsir) */}
                        {activeAyahData ? (
                            <div className="space-y-4">
                                {/* Arabic Quote Card (High Contrast WCAG AAA Compliant) */}
                                {activeAyahData.text_arabic && (
                                    <div className={`p-5 sm:p-6 rounded-2xl border text-right ${currentTheme.arabicCardBg}`} dir="rtl">
                                        <p 
                                            className={`font-arabic text-2xl sm:text-3xl ${currentTheme.arabicText} leading-loose select-text`}
                                            style={{
                                                fontFamily: "'AlQuran-IndoPak', 'Scheherazade New', 'Scheherazade', 'Amiri', 'Traditional Arabic', serif",
                                                lineHeight: '2.4'
                                            }}
                                        >
                                            {activeAyahData.text_arabic}
                                        </p>
                                    </div>
                                )}

                                {/* Indonesian Translation Card */}
                                {activeAyahData.text_indonesian && (
                                    <div className={`p-4 sm:p-5 rounded-xl border ${currentTheme.cardBg}`}>
                                        <p className={`text-xs font-extrabold uppercase tracking-wider mb-1 ${currentTheme.subText}`}>
                                            Terjemahan Ayat {currentAyahNumber}:
                                        </p>
                                        <p className={`text-sm sm:text-base ${currentTheme.bodyText} italic leading-relaxed`}>
                                            "{activeAyahData.text_indonesian}"
                                        </p>
                                    </div>
                                )}

                                {/* Verse Tafsir Card */}
                                <div className={`p-5 sm:p-7 rounded-2xl border ${currentTheme.cardBg}`}>
                                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs">
                                                📜
                                            </span>
                                            <h4 className={`text-base ${currentTheme.headingText}`}>
                                                Tafsir Ringkas Kemenag RI
                                            </h4>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(activeAyahData?.tafsir || 'Tafsir belum tersedia', 'ayah-tafsir-body')}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                            title="Salin teks tafsir"
                                        >
                                            {copiedKey === 'ayah-tafsir-body' ? (
                                                <>
                                                    <IoCheckmark className="w-4 h-4 text-emerald-600 font-bold" />
                                                    <span className="text-emerald-700 font-bold">Tersalin!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <IoCopyOutline className="w-3.5 h-3.5" />
                                                    <span>Salin</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {activeAyahData?.tafsir ? (
                                        <div className={`${fontSizeClasses} ${currentTheme.bodyText} leading-relaxed whitespace-pre-line`}>
                                            {activeAyahData.tafsir}
                                        </div>
                                    ) : (
                                        <p className={`${currentTheme.subText} italic py-4 text-center`}>
                                            Tafsir untuk ayat {currentAyahNumber} belum tersedia.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`p-6 rounded-2xl border text-center ${currentTheme.cardBg}`}>
                                <p className={`${currentTheme.subText} italic`}>
                                    Pilih nomor ayat pada navigasi di atas untuk melihat tafsir ayat terkait.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Footer Note */}
            <div className={`px-6 py-4 border-t text-xs ${currentTheme.footerBg} flex flex-col sm:flex-row items-center justify-between gap-2`}>
                <div className="flex items-center gap-1.5">
                    <IoInformationCircleOutline className="w-4 h-4 text-emerald-700" />
                    <span>Tafsir bersumber dari Al-Qur'an dan Terjemahannya Kementerian Agama Republik Indonesia.</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onShareSurah}
                        className="text-emerald-800 hover:underline font-bold cursor-pointer"
                    >
                        Bagikan Surah
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TafsirSurahSection;
