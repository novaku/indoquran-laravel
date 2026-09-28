import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    BookOpenIcon, 
    ShareIcon, 
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
    IoSparkles, 
    IoInformationCircleOutline,
    IoCheckmark,
    IoCopyOutline,
    IoShareSocialOutline
} from 'react-icons/io5';

// Color-blind friendly metadata for theme badges (High Contrast / WCAG AAA)
const getThemeMetadata = (title = '', content = '') => {
    const combined = `${title} ${content}`.toLowerCase();
    
    if (combined.includes('iman') || combined.includes('akidah') || combined.includes('tauhid') || combined.includes('keimanan') || combined.includes('allah') || combined.includes('rukun')) {
        return {
            badge: 'bg-emerald-100 text-emerald-950 border-emerald-500 font-extrabold',
            border: 'border-l-emerald-600',
            activeTab: 'bg-emerald-700 text-white border-emerald-800 shadow-md',
            icon: '🛡️',
            label: 'Akidah & Keimanan'
        };
    }
    if (combined.includes('hukum') || combined.includes('syariat') || combined.includes('perintah') || combined.includes('larangan') || combined.includes('sholat') || combined.includes('salat') || combined.includes('zakat') || combined.includes('puasa') || combined.includes('haji') || combined.includes('muamalah') || combined.includes('riba') || combined.includes('nikah')) {
        return {
            badge: 'bg-blue-100 text-blue-950 border-blue-500 font-extrabold',
            border: 'border-l-blue-600',
            activeTab: 'bg-blue-700 text-white border-blue-800 shadow-md',
            icon: '⚖️',
            label: 'Hukum & Syariat'
        };
    }
    if (combined.includes('kisah') || combined.includes('nabi') || combined.includes('sejarah') || combined.includes('kaum') || combined.includes('adam') || combined.includes('musa') || combined.includes('ibrahim') || combined.includes('israil') || combined.includes('rasul')) {
        return {
            badge: 'bg-amber-100 text-amber-950 border-amber-500 font-extrabold',
            border: 'border-l-amber-600',
            activeTab: 'bg-amber-700 text-white border-amber-800 shadow-md',
            icon: '📜',
            label: 'Kisah & Ibrah'
        };
    }
    if (combined.includes('janji') || combined.includes('ancaman') || combined.includes('azab') || combined.includes('pahala') || combined.includes('surga') || combined.includes('neraka')) {
        return {
            badge: 'bg-rose-100 text-rose-950 border-rose-500 font-extrabold',
            border: 'border-l-rose-600',
            activeTab: 'bg-rose-700 text-white border-rose-800 shadow-md',
            icon: '⚡',
            label: 'Janji & Peringatan'
        };
    }
    if (combined.includes('fatihah') || combined.includes('ummul') || combined.includes('sab\'ul') || combined.includes('nama') || combined.includes('sebutan')) {
        return {
            badge: 'bg-teal-100 text-teal-950 border-teal-500 font-extrabold',
            border: 'border-l-teal-600',
            activeTab: 'bg-teal-700 text-white border-teal-800 shadow-md',
            icon: '📖',
            label: 'Nama & Keutamaan'
        };
    }
    return {
        badge: 'bg-indigo-100 text-indigo-950 border-indigo-500 font-extrabold',
        border: 'border-l-indigo-600',
        activeTab: 'bg-indigo-700 text-white border-indigo-800 shadow-md',
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

    rawChunks.forEach((chunk, idx) => {
        const lineMatch = chunk.match(/^\s*(\d+)[\.\)]\s*([\s\S]+)$/);
        if (!lineMatch) return;

        const body = lineMatch[2].trim();

        let title = '';
        let content = body;

        // Colon match: "Keimanan: ..."
        const colonMatch = body.match(/^([^:\n]{2,50}):\s*([\s\S]+)$/);
        // Only treat dash as separator when surrounded by spaces (avoid splitting "al-Fatihah", "Ummul-Kitab", etc.)
        const dashMatch = body.match(/^([^\n]{2,50})\s+(?:[-–—])\s+([\s\S]+)$/);
        const commaMatch = body.match(/^([^,\n]{2,40}),\s*seperti:\s*([\s\S]+)$/i);

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
            const newlineMatch = body.match(/^([^\n]{2,60})\n+([\s\S]+)$/);
            if (newlineMatch) {
                title = newlineMatch[1].trim();
                content = newlineMatch[2].trim();
            } else {
                title = body.split('\n')[0].trim().replace(/[\.\:]$/, '');
                content = body.substring(title.length).trim();
            }
        }

        const cleanTitle = title.replace(/[\.\:]$/, '');

        parsedPoints.push({
            number: String(idx + 1),
            title: cleanTitle,
            content: content,
            meta: getThemeMetadata(cleanTitle, content)
        });
    });

    // Handle case where summary points list headings that are expanded in detail below (e.g. Surah 1)
    const emptyPoints = parsedPoints.filter(p => !p.content.trim());
    if (emptyPoints.length > 0) {
        const lastPoint = parsedPoints[parsedPoints.length - 1];
        if (lastPoint && lastPoint.content) {
            const candidateTitles = parsedPoints
                .filter(p => !p.content.trim() || p === lastPoint)
                .map(p => p.title.trim());

            const titlesPattern = candidateTitles.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
            const parts = lastPoint.content.split(new RegExp(`(?:^|\\n+)(?=(?:${titlesPattern})\\s*\\n)`, 'i'));

            parts.forEach(part => {
                const headerMatch = part.match(new RegExp(`^\\s*(${titlesPattern})\\s*\\n([\\s\\S]*)`, 'i'));
                if (headerMatch) {
                    const matchedTitle = headerMatch[1].trim().toLowerCase();
                    const bodyText = headerMatch[2].trim();
                    const targetPoint = parsedPoints.find(p => p.title.trim().toLowerCase() === matchedTitle);
                    if (targetPoint) {
                        targetPoint.content = bodyText;
                        targetPoint.meta = getThemeMetadata(targetPoint.title, bodyText);
                    }
                }
            });
        }
    }

    return {
        introText,
        points: parsedPoints,
        rawHtml: rawText
    };
};

// Formatted paragraph and Arabic verses renderer
const renderFormattedParagraphs = (content, fontSizeClasses, currentTheme) => {
    if (!content) return null;

    const arabicRegex = /[\u0600-\u06FF]/;
    const paragraphs = content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

    return paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean);

        return (
            <div key={`p-${pIdx}`} className="mb-4 last:mb-0">
                {lines.map((line, lIdx) => {
                    const isPureArabic = arabicRegex.test(line) && !line.includes('(') && !line.includes('http') && line.length < 250;
                    const isHadithOrQuote = line.startsWith('“') || line.startsWith('"') || line.startsWith('(');

                    if (isPureArabic) {
                        return (
                            <div 
                                key={`l-${lIdx}`} 
                                dir="rtl"
                                className={`my-3 p-3.5 sm:p-4 rounded-xl border-r-4 font-arabic text-xl sm:text-2xl text-right leading-loose tracking-wide ${currentTheme.arabicBox}`}
                            >
                                {line}
                            </div>
                        );
                    }

                    if (isHadithOrQuote) {
                        return (
                            <blockquote 
                                key={`l-${lIdx}`} 
                                className="my-2.5 pl-3.5 border-l-2 border-amber-500/80 italic font-medium opacity-95 leading-relaxed"
                            >
                                {line}
                            </blockquote>
                        );
                    }

                    return (
                        <p key={`l-${lIdx}`} className={`${lIdx > 0 ? 'mt-2' : ''} leading-relaxed`}>
                            {line}
                        </p>
                    );
                })}
            </div>
        );
    });
};

const TafsirSurahSection = ({
    surah,
    maxAyahNumber = 1,
    onShareSurah
}) => {
    const [fontSizeMode, setFontSizeMode] = useState('normal'); // 'small' | 'normal' | 'large' | 'xlarge'
    const [readingTheme, setReadingTheme] = useState('parchment'); // 'modern' | 'parchment' | 'night'
    const [searchKeyword, setSearchKeyword] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);
    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const [viewMode, setViewMode] = useState('tab'); // 'tab' | 'grid'

    const tabsScrollRef = useRef(null);

    const surahRawDesc = surah?.description_long || surah?.description_short || surah?.description || '';
    const parsedDesc = useMemo(() => parseSurahDescription(surahRawDesc), [surahRawDesc]);

    // Filtered points for Kandungan Surah
    const filteredPoints = useMemo(() => {
        if (!searchKeyword.trim()) return parsedDesc.points;
        const kw = searchKeyword.toLowerCase();
        return parsedDesc.points.filter(
            p => p.content.toLowerCase().includes(kw) || p.title.toLowerCase().includes(kw)
        );
    }, [parsedDesc.points, searchKeyword]);

    // Ensure valid active tab index
    const safeActiveIdx = useMemo(() => {
        if (filteredPoints.length === 0) return 0;
        return Math.min(Math.max(0, activeTabIdx), filteredPoints.length - 1);
    }, [activeTabIdx, filteredPoints.length]);

    const activePoint = filteredPoints[safeActiveIdx] || null;

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
                inputBg: 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-400',
                footerBg: 'bg-slate-950 border-slate-800 text-slate-300',
                copyBtn: 'text-slate-200 hover:text-white hover:bg-slate-800 border-slate-700 bg-slate-800/80',
                tabActive: 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/40',
                tabInactive: 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white',
                tabContentBg: 'bg-slate-900 border-slate-800 shadow-md text-slate-100',
                navBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 active:scale-95',
                navBtnDisabled: 'bg-slate-900/40 text-slate-600 border-slate-800/50 cursor-not-allowed opacity-50',
                arabicBox: 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
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
                inputBg: 'bg-white border-amber-400 text-stone-950 placeholder-stone-600 focus:border-emerald-800',
                footerBg: 'bg-[#F3EDE0] border-amber-300 text-stone-800 font-medium',
                copyBtn: 'text-stone-900 hover:text-black hover:bg-amber-200/80 border-amber-400 bg-amber-100/60',
                tabActive: 'bg-[#1A3A34] text-white border-[#1A3A34] shadow-md ring-2 ring-emerald-800/30',
                tabInactive: 'bg-[#F5EEDB] text-stone-800 border-amber-300 hover:bg-amber-100/80 hover:text-stone-950',
                tabContentBg: 'bg-[#FFFDF7] border-amber-300 shadow-md text-stone-950',
                navBtn: 'bg-amber-100 hover:bg-amber-200 text-stone-900 border-amber-300 active:scale-95',
                navBtnDisabled: 'bg-stone-100 text-stone-400 border-amber-200/60 cursor-not-allowed opacity-50',
                arabicBox: 'bg-emerald-50 border-emerald-600 text-emerald-950'
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
            inputBg: 'bg-white border-slate-300 text-slate-950 placeholder-slate-600 focus:border-emerald-800',
            footerBg: 'bg-slate-100 border-slate-300 text-slate-800 font-medium',
            copyBtn: 'text-slate-900 hover:text-black hover:bg-slate-200 border-slate-300 bg-slate-50',
            tabActive: 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30',
            tabInactive: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900',
            tabContentBg: 'bg-white border-slate-300 shadow-md text-slate-950',
            navBtn: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 active:scale-95',
            navBtnDisabled: 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50',
            arabicBox: 'bg-emerald-50 border-emerald-600 text-emerald-950'
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

    // Handle Share WhatsApp for Kandungan Surah
    const handleShareKandungan = () => {
        if (!surah) return;
        let text = `📖 *KANDUNGAN & POKOK SURAH ${surah.name_latin?.toUpperCase()}*\n`;
        text += `QS. ${surah.number}: ${surah.name_arabic} (${surah.name_indonesian})\n`;
        text += `Total: ${maxAyahNumber || surah.number_of_ayahs || surah.verses_count} Ayat • ${surah.revelation_place || ''}\n\n`;
        if (parsedDesc.introText) {
            text += `${parsedDesc.introText.slice(0, 500)}...\n\n`;
        }
        text += `🔗 Baca Selengkapnya di IndoQuran:\n${window.location.origin}/surah/${surah.number}?tab=kandungan`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Handle Share WhatsApp for a Specific Point
    const handleSharePoint = (point) => {
        if (!surah || !point) return;
        let text = `📖 *${surah.name_latin?.toUpperCase()} - ${point.title}*\n`;
        text += `QS. ${surah.number}: ${surah.name_arabic} (${surah.name_indonesian})\n\n`;
        text += `${point.content.slice(0, 600)}${point.content.length > 600 ? '...' : ''}\n\n`;
        text += `🔗 Baca Selengkapnya di IndoQuran:\n${window.location.origin}/surah/${surah.number}?tab=kandungan`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Scroll active tab into view
    const handleSelectTab = (idx) => {
        setActiveTabIdx(idx);
        if (tabsScrollRef.current) {
            const tabBtn = tabsScrollRef.current.children[idx];
            if (tabBtn) {
                tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    };

    // Tab navigation next / prev
    const handlePrevTab = () => {
        if (safeActiveIdx > 0) {
            handleSelectTab(safeActiveIdx - 1);
        }
    };

    const handleNextTab = () => {
        if (safeActiveIdx < filteredPoints.length - 1) {
            handleSelectTab(safeActiveIdx + 1);
        }
    };

    // Scroll tab strip horizontally
    const scrollTabStrip = (direction) => {
        if (tabsScrollRef.current) {
            const scrollAmount = direction === 'left' ? -220 : 220;
            tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!surah) return null;

    return (
        <section 
            id="kandungan-surah-section" 
            className={`rounded-3xl border transition-colors duration-200 overflow-hidden mt-8 ${currentTheme.wrapper}`}
        >
            {/* 1. Header Banner */}
            <div className={`p-5 sm:p-7 relative ${currentTheme.header}`}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                                <IoSparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Kandungan & Pokok Surah</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-100 border border-emerald-400/40">
                                <span>Sumber: Kemenag RI</span>
                            </span>
                        </div>

                        <div className="flex items-baseline gap-3 flex-wrap">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                Kandungan Surah {surah.name_latin || surah.name_english}
                            </h2>
                            <span className="font-arabic text-2xl sm:text-3xl text-emerald-200" dir="rtl">
                                {surah.name_arabic}
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-2xl leading-relaxed">
                            {surah.name_indonesian ? `"${surah.name_indonesian}"` : ''} • Surah ke-{surah.number} • {maxAyahNumber || surah.number_of_ayahs || surah.verses_count} Ayat • Diturunkan di {surah.revelation_place || 'Mekah/Madinah'}
                        </p>
                    </div>

                    {/* Quick Share Button */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleShareKandungan}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-emerald-950 hover:bg-emerald-50 transition-all active:scale-95 cursor-pointer shadow-md"
                            title="Bagikan kandungan surah ke WhatsApp"
                        >
                            <ShareIcon className="w-4 h-4 text-emerald-800" />
                            <span>Bagikan Kandungan</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Reader Control Bar */}
            <div className={`p-4 border-b ${currentTheme.toolbarBg} flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5`}>
                {/* Title badge */}
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-800 text-white shadow-xs">
                        <BookOpenIcon className="w-4 h-4" />
                    </span>
                    <div>
                        <h3 className={`text-sm sm:text-base font-bold ${currentTheme.headingText}`}>
                            Intisari & Tema Utama
                        </h3>
                        <p className={`text-[11px] ${currentTheme.subText}`}>
                            Ringkasan dan pokok-pokok ajaran dalam surah
                        </p>
                    </div>
                </div>

                {/* Reader Comfort Preferences (Search, Font Size & High-Contrast Mood) */}
                <div className="flex items-center justify-between lg:justify-end gap-2.5 flex-wrap">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-48 lg:w-48">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => {
                                setSearchKeyword(e.target.value);
                                setActiveTabIdx(0);
                            }}
                            placeholder="Cari dalam kandungan..."
                            className={`w-full text-xs font-semibold rounded-xl pl-8 pr-3 py-1.5 border outline-none transition shadow-2xs ${currentTheme.inputBg}`}
                        />
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-600" />
                        {searchKeyword && (
                            <button
                                onClick={() => {
                                    setSearchKeyword('');
                                    setActiveTabIdx(0);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-700 hover:text-black cursor-pointer"
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
            <div className="p-5 sm:p-8 space-y-6">
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
                            {renderFormattedParagraphs(parsedDesc.introText, fontSizeClasses, currentTheme)}
                        </div>
                    </div>
                ) : (
                    <p className={`${currentTheme.subText} italic text-center py-6`}>
                        Penjelasan kandungan untuk Surah ini belum tersedia.
                    </p>
                )}

                {/* Structured Pokok-Pokok Isi in TAB & GRID Formats */}
                {filteredPoints.length > 0 && (
                    <div className="mt-8 space-y-4">
                        {/* Section Header with View Switcher (Tab vs Grid) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-300">
                            <div className="flex items-center gap-2.5">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-xs">
                                    ✨
                                </span>
                                <div>
                                    <h3 className={`text-base sm:text-lg ${currentTheme.headingText}`}>
                                        Pokok-Pokok Kandungan & Tema Utama
                                    </h3>
                                    <p className={`text-xs ${currentTheme.subText}`}>
                                        Pilih tema untuk membaca pembahasan lengkap secara mendalam
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-stone-900 text-white shadow-2xs">
                                    {filteredPoints.length} Tema
                                </span>

                                {/* View Mode Toggle */}
                                <div className="flex items-center p-1 rounded-xl bg-black/10 border border-stone-300/40">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('tab')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            viewMode === 'tab'
                                                ? 'bg-emerald-700 text-white shadow-xs'
                                                : 'text-stone-800 hover:text-black hover:bg-black/5'
                                        }`}
                                        title="Bentuk Tab (Fokus per tema)"
                                    >
                                        <ViewColumnsIcon className="w-3.5 h-3.5" />
                                        <span>Bentuk Tab</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            viewMode === 'grid'
                                                ? 'bg-emerald-700 text-white shadow-xs'
                                                : 'text-stone-800 hover:text-black hover:bg-black/5'
                                        }`}
                                        title="Bentuk Grid (Semua tema)"
                                    >
                                        <Squares2X2Icon className="w-3.5 h-3.5" />
                                        <span>Semua</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MODE 1: TAB VIEW (User Requested: Bentuk Tab untuk menampilkan banyak teks) */}
                        {viewMode === 'tab' && (
                            <div className="space-y-4">
                                {/* Horizontal Tabs Navigation Bar */}
                                <div className="relative">
                                    {/* Left Scroll Button */}
                                    <button
                                        type="button"
                                        onClick={() => scrollTabStrip('left')}
                                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md border border-stone-300 dark:border-slate-700 items-center justify-center text-stone-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition cursor-pointer"
                                        aria-label="Gulir tab ke kiri"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>

                                    {/* Tab Items Container */}
                                    <div 
                                        ref={tabsScrollRef}
                                        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1.5 sm:px-8"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {filteredPoints.map((pt, idx) => {
                                            const isActive = idx === safeActiveIdx;
                                            return (
                                                <button
                                                    key={`tab-btn-${idx}`}
                                                    type="button"
                                                    onClick={() => handleSelectTab(idx)}
                                                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                                                        isActive
                                                            ? currentTheme.tabActive
                                                            : currentTheme.tabInactive
                                                    }`}
                                                >
                                                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-extrabold ${
                                                        isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-stone-800 dark:text-slate-200'
                                                    }`}>
                                                        #{pt.number}
                                                    </span>
                                                    <span className="text-base">{pt.meta.icon}</span>
                                                    <span className="whitespace-nowrap max-w-[140px] sm:max-w-[200px] truncate">
                                                        {pt.title || pt.meta.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Right Scroll Button */}
                                    <button
                                        type="button"
                                        onClick={() => scrollTabStrip('right')}
                                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md border border-stone-300 dark:border-slate-700 items-center justify-center text-stone-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition cursor-pointer"
                                        aria-label="Gulir tab ke kanan"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Active Tab Content Panel */}
                                {activePoint && (
                                    <div className={`rounded-2xl border border-l-4 transition-all duration-200 shadow-md p-6 sm:p-8 ${currentTheme.tabContentBg} ${activePoint.meta.border}`}>
                                        {/* Tab Content Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-stone-200 dark:border-slate-800">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-lg text-xs sm:text-sm font-extrabold bg-stone-950 text-white shadow-2xs">
                                                    #{activePoint.number}
                                                </span>
                                                <span className="text-2xl">{activePoint.meta.icon}</span>
                                                <div className="flex flex-col">
                                                    <span className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border shadow-2xs w-fit ${activePoint.meta.badge}`}>
                                                        {activePoint.meta.label}
                                                    </span>
                                                    <h4 className={`text-lg sm:text-2xl font-extrabold tracking-tight mt-1 ${currentTheme.headingText}`}>
                                                        {activePoint.title || activePoint.meta.label}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Action Buttons for Active Tab */}
                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${activePoint.title ? activePoint.title + ':\n\n' : ''}${activePoint.content}`, `active-tab`)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                                    title="Salin isi tema ini"
                                                >
                                                    {copiedKey === 'active-tab' ? (
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

                                                <button
                                                    type="button"
                                                    onClick={() => handleSharePoint(activePoint)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                                    title="Bagikan tema ini ke WhatsApp"
                                                >
                                                    <IoShareSocialOutline className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Bagikan</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tab Content Full Text Body */}
                                        <div className={`${fontSizeClasses} ${currentTheme.bodyText} text-justify leading-relaxed whitespace-pre-line min-h-[140px]`}>
                                            {renderFormattedParagraphs(activePoint.content, fontSizeClasses, currentTheme)}
                                        </div>

                                        {/* Tab Navigation Footer (Previous / Next Buttons) */}
                                        <div className="mt-8 pt-5 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                disabled={safeActiveIdx === 0}
                                                onClick={handlePrevTab}
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                                                    safeActiveIdx === 0
                                                        ? currentTheme.navBtnDisabled
                                                        : currentTheme.navBtn
                                                }`}
                                            >
                                                <ChevronLeftIcon className="w-4 h-4" />
                                                <span>Tema Sebelumnya</span>
                                            </button>

                                            <div className="text-xs sm:text-sm font-extrabold text-stone-600 dark:text-slate-400">
                                                Tema {safeActiveIdx + 1} dari {filteredPoints.length}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={safeActiveIdx === filteredPoints.length - 1}
                                                onClick={handleNextTab}
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition ${
                                                    safeActiveIdx === filteredPoints.length - 1
                                                        ? currentTheme.navBtnDisabled
                                                        : currentTheme.navBtn
                                                }`}
                                            >
                                                <span>Tema Selanjutnya</span>
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODE 2: GRID VIEW (Alternative overview mode) */}
                        {viewMode === 'grid' && (
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

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(`${pt.title ? pt.title + ':\n' : ''}${pt.content}`, `pt-${idx}`)}
                                                    className={`p-1.5 rounded-lg border transition cursor-pointer ${currentTheme.copyBtn}`}
                                                    title="Salin tema ini"
                                                >
                                                    {copiedKey === `pt-${idx}` ? (
                                                        <IoCheckmark className="w-4 h-4 text-emerald-600 font-bold" />
                                                    ) : (
                                                        <IoCopyOutline className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveTabIdx(idx);
                                                        setViewMode('tab');
                                                    }}
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${currentTheme.copyBtn}`}
                                                    title="Buka dalam mode tab"
                                                >
                                                    Buka Tab
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`${fontSizeClasses} ${currentTheme.bodyText} leading-relaxed`}>
                                            {renderFormattedParagraphs(pt.content, fontSizeClasses, currentTheme)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Footer Note */}
            <div className={`px-6 py-4 border-t text-xs ${currentTheme.footerBg} flex flex-col sm:flex-row items-center justify-between gap-2`}>
                <div className="flex items-center gap-1.5">
                    <IoInformationCircleOutline className="w-4 h-4 text-emerald-700" />
                    <span>Kandungan surah bersumber dari Al-Qur'an dan Terjemahannya Kementerian Agama Republik Indonesia.</span>
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
