import React, { useState, useMemo, useEffect } from 'react';
import { 
    CheckCircleIcon, 
    CogIcon, 
    BugAntIcon, 
    SparklesIcon, 
    ShieldCheckIcon, 
    RocketLaunchIcon, 
    DocumentTextIcon, 
    ChevronDownIcon, 
    ChevronUpIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    TagIcon,
    ArrowUpIcon,
    FunnelIcon,
    QueueListIcon
} from '@heroicons/react/24/outline';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseInline from '../components/AdSenseInline';
import versionsData from '../../../../database/seeders/versions_data.json';
import { scrollToTop } from '../utils/scrollUtils';

function RiwayatVersiPage() {
    const versions = versionsData || [];
    const [expandedVersions, setExpandedVersions] = useState(() => {
        return versions.length > 0 ? { [versions[0].version]: true } : {};
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'feature' | 'improvement' | 'fix'

    useEffect(() => {
        scrollToTop();
    }, []);


    const toggleVersion = (versionNumber) => {
        setExpandedVersions(prev => ({
            ...prev,
            [versionNumber]: !prev[versionNumber]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        versions.forEach(v => {
            allExpanded[v.version] = true;
        });
        setExpandedVersions(allExpanded);
    };

    const collapseAll = () => {
        setExpandedVersions({});
    };

    // Filter versions based on search and type filter
    const filteredVersions = useMemo(() => {
        return versions.filter(version => {
            const matchesSearch = searchQuery === '' || 
                version.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
                version.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                version.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (version.changes && version.changes.some(c => c.text.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesFilter = selectedFilter === 'all' || 
                version.type === selectedFilter ||
                (version.changes && version.changes.some(c => c.type === selectedFilter));

            return matchesSearch && matchesFilter;
        });
    }, [versions, searchQuery, selectedFilter]);

    const getVersionBadgeColor = (type) => {
        switch (type) {
            case 'major': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'feature': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'minor': return 'bg-blue-50 text-blue-700 border-blue-300';
            case 'patch': return 'bg-teal-50 text-teal-700 border-teal-300';
            default: return 'bg-gray-50 text-gray-700 border-gray-300';
        }
    };

    const getChangeIcon = (type) => {
        switch (type) {
            case 'feature': return <SparklesIcon className="w-5 h-5 text-emerald-600" />;
            case 'improvement': return <CogIcon className="w-5 h-5 text-blue-600" />;
            case 'fix': return <BugAntIcon className="w-5 h-5 text-rose-600" />;
            case 'security': return <ShieldCheckIcon className="w-5 h-5 text-purple-600" />;
            case 'documentation': return <DocumentTextIcon className="w-5 h-5 text-amber-600" />;
            default: return <CheckCircleIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getChangeTypeText = (type) => {
        switch (type) {
            case 'feature': return 'Fitur Baru';
            case 'improvement': return 'Peningkatan';
            case 'fix': return 'Perbaikan';
            case 'security': return 'Keamanan';
            case 'documentation': return 'Dokumentasi';
            default: return 'Lainnya';
        }
    };

    const getChangeItemStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-emerald-50/40 border-l-4 border-emerald-500 hover:bg-emerald-50/70';
            case 'improvement': return 'bg-blue-50/40 border-l-4 border-blue-500 hover:bg-blue-50/70';
            case 'fix': return 'bg-rose-50/40 border-l-4 border-rose-500 hover:bg-rose-50/70';
            case 'security': return 'bg-purple-50/40 border-l-4 border-purple-500 hover:bg-purple-50/70';
            case 'documentation': return 'bg-amber-50/40 border-l-4 border-amber-500 hover:bg-amber-50/70';
            default: return 'bg-gray-50/40 border-l-4 border-gray-400 hover:bg-gray-50/70';
        }
    };

    const getChangeTypeBadgeStyle = (type) => {
        switch (type) {
            case 'feature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'fix': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'security': return 'bg-purple-100 text-purple-900 border-purple-200';
            case 'documentation': return 'bg-amber-100 text-amber-900 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const latestVersion = versions[0] || null;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Riwayat Versi - IndoQuran",
        "description": "Catatan perubahan dan pembaruan versi platform Al-Quran digital IndoQuran dengan Khazanah Doa-Doa Pilihan, Logo Resmi Baru, Jadwal Sholat Realtime, Navigasi Mushaf Modern, Detail Doa & Dzikir, Tafsir Maudhui, Bookmark, dan PWA",
        "url": `${window.location.origin}/riwayat-versi`,
        "dateModified": "2026-09-04",
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "IndoQuran",
            "applicationCategory": "Religious Application",
            "operatingSystem": "Web Browser",
            "softwareVersion": latestVersion?.version || "2.23.0",
            "releaseNotes": latestVersion?.description || "",
            "installUrl": window.location.origin,
            "applicationSubCategory": "Progressive Web App",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
            }
        }
    };

    const scrollToVersion = (versionNum) => {
        setExpandedVersions(prev => ({ ...prev, [versionNum]: true }));
        const element = document.getElementById(`version-${versionNum}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/70 text-gray-800">
            <SEOHead 
                title="Riwayat Versi - Changelog Lengkap IndoQuran ✅"
                description="Catatan lengkap perjalanan pembaruan IndoQuran: Khazanah Doa-Doa Pilihan Otentik, Logo Resmi Baru, Jadwal Sholat Realtime, Navigasi Mushaf Modern, Detail Doa & Dzikir, Tafsir Tematik Maudhui, Penanda & Bookmark, dan PWA."
                keywords="indoquran update, changelog, version history, riwayat versi, pembaruan aplikasi, indoquran 2.23.0, doa pilihan, doa bersama, logo indoquran, jadwal sholat, navigasi mushaf, doa dan dzikir, tafsir maudhui, penanda quran, PWA"
                canonicalUrl={`${window.location.origin}/riwayat-versi`}
            />
            <StructuredData data={structuredData} />
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                        Riwayat Versi IndoQuran
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                        Transparansi dan dokumentasi menyeluruh terhadap setiap penambahan fitur, peningkatan performa, serta perbaikan sistem di platform IndoQuran.
                    </p>

                    {latestVersion && (
                        <div className="pt-2">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Rilis Terkini: <strong className="text-emerald-700">v{latestVersion.version}</strong> ({latestVersion.date})
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Billboard Ad (Detik.com Pattern) */}
            <AdSenseLeaderboard maxWidth="max-w-7xl" labelText="IKLAN" />

            {/* Main Content Area - Wide 7xl Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Timeline Column (8 cols on lg) */}
                    <main className="lg:col-span-8 space-y-6">

                        {/* Search & Filter Toolbar */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs space-y-4">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                {/* Search input */}
                                <div className="relative flex-1">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari fitur, perbaikan, atau kata kunci..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full px-1.5 py-0.5"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Expand / Collapse controls */}
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button
                                        onClick={expandAll}
                                        className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                                        title="Buka semua rincian perubahan"
                                    >
                                        Buka Semua
                                    </button>
                                    <button
                                        onClick={collapseAll}
                                        className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                        title="Tutup semua rincian perubahan"
                                    >
                                        Tutup Semua
                                    </button>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-gray-100 text-xs">
                                <span className="font-medium text-gray-500 mr-1 flex items-center gap-1">
                                    <FunnelIcon className="w-3.5 h-3.5 text-emerald-600" /> Kategori:
                                </span>
                                {[
                                    { id: 'all', label: `Semua (${versions.length})` },
                                    { id: 'feature', label: 'Fitur Baru' },
                                    { id: 'improvement', label: 'Peningkatan' },
                                    { id: 'fix', label: 'Perbaikan' }
                                ].map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedFilter(filter.id)}
                                        className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                                            selectedFilter === filter.id 
                                                ? 'bg-emerald-600 text-white shadow-2xs' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Empty Search Result or Versions Timeline */}
                        {filteredVersions.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-2xs text-center space-y-3">
                                <p className="text-base font-semibold text-gray-700">Tidak ada riwayat versi yang cocok</p>
                                <p className="text-xs text-gray-500">Coba ubah kata kunci pencarian atau reset filter kategori.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
                                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                                >
                                    Reset Pencarian & Filter
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Versions Timeline */}
                                <div className="space-y-6">
                                    {filteredVersions.map((version, index) => {
                                        const isExpanded = !!expandedVersions[version.version];
                                        const showInlineAd = index === 1 || (index > 1 && (index + 1) % 5 === 0);

                                        return (
                                            <React.Fragment key={version.version}>
                                                {showInlineAd && (
                                                    <AdSenseInline labelText="IKLAN REKOMENDASI" minHeight="90px" />
                                                )}
                                                <article 
                                                    id={`version-${version.version}`}
                                                    className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden hover:border-emerald-300 hover:shadow-xs transition-all scroll-mt-24"
                                                >
                                                {/* Version Header Card */}
                                                <div className="p-6 sm:p-7">
                                                    <div className="flex items-start justify-between flex-wrap gap-4">
                                                        <div className="flex items-start gap-4 flex-1 min-w-[260px]">
                                                            {/* Version Number Squircle Badge */}
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-base flex items-center justify-center shadow-xs flex-shrink-0">
                                                                v{version.version}
                                                            </div>
                                                            <div className="flex-1 space-y-1.5">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                                                        Versi {version.version}
                                                                    </h2>
                                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVersionBadgeColor(version.type)}`}>
                                                                        {version.type ? (version.type.charAt(0).toUpperCase() + version.type.slice(1)) : 'Release'}
                                                                    </span>
                                                                    {index === 0 && selectedFilter === 'all' && searchQuery === '' && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                                                                            TERBARU
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <h3 className="text-base sm:text-lg font-bold text-emerald-800 leading-snug">
                                                                    {version.title}
                                                                </h3>
                                                                
                                                                <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
                                                                    {version.description}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Release Date Badge */}
                                                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-medium">
                                                                <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>{version.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Changes Accordion */}
                                                {version.changes && version.changes.length > 0 && (
                                                    <div className="border-t border-gray-100 bg-gray-50/50">
                                                        <button
                                                            onClick={() => toggleVersion(version.version)}
                                                            className="w-full px-6 sm:px-7 py-3.5 flex items-center justify-between text-left hover:bg-gray-100/60 transition-colors cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 group-hover:text-emerald-700">
                                                                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                                                <span>Daftar Perubahan & Fitur</span>
                                                                <span className="text-xs font-normal text-gray-500">
                                                                    ({version.changes.length} item)
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-emerald-700">
                                                                <span>{isExpanded ? 'Sembunyikan' : 'Lihat Rincian'}</span>
                                                                {isExpanded ? (
                                                                    <ChevronUpIcon className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronDownIcon className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="p-6 sm:p-7 pt-2 space-y-3">
                                                                {version.changes.map((change, changeIdx) => (
                                                                    <div 
                                                                        key={changeIdx}
                                                                        className={`p-4 rounded-xl transition-all border border-gray-200/60 shadow-2xs flex items-start gap-3.5 ${getChangeItemStyle(change.type)}`}
                                                                    >
                                                                        <div className="flex-shrink-0 mt-0.5">
                                                                            {getChangeIcon(change.type)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 space-y-1">
                                                                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getChangeTypeBadgeStyle(change.type)}`}>
                                                                                {getChangeTypeText(change.type)}
                                                                            </span>
                                                                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                                                                                {change.text}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                </article>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Community Feedback Note */}
                        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 text-center space-y-3">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                Punya Masukan atau Menemukan Kendala?
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                                Pengembangan IndoQuran selalu terbuka untuk saran dan masukan dari seluruh umat muslim. Sampaikan masukan Anda untuk rilis selanjutnya.
                            </p>
                            <div className="pt-2">
                                <a 
                                    href="/kontak"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                                >
                                    <span>Kirim Saran & Feedback</span>
                                </a>
                            </div>
                        </div>

                    </main>

                    {/* Sidebar Column (4 cols on lg) */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="sticky top-20 space-y-6">
                            
                            {/* Latest Version Card */}
                            {latestVersion && (
                                <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                                    <div className="relative z-10 space-y-2">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-emerald-100 border border-white/20">
                                            Rilis Terbaru
                                        </span>
                                        <p className="text-3xl font-extrabold tracking-tight pt-1">
                                            v{latestVersion.version}
                                        </p>
                                        <p className="text-xs text-emerald-100 font-medium">
                                            {latestVersion.date}
                                        </p>
                                        <p className="text-xs text-emerald-50 leading-relaxed pt-1 line-clamp-3">
                                            {latestVersion.title}
                                        </p>
                                        <button
                                            onClick={() => scrollToVersion(latestVersion.version)}
                                            className="w-full mt-3 py-2 px-3 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer text-center"
                                        >
                                            Lihat Rilis Ini
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Summary Metrics */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs space-y-3">
                                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    <QueueListIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Statistik Riwayat Versi</span>
                                </h3>
                                <div className="divide-y divide-gray-100 text-xs">
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600">Total Versi Dirilis</span>
                                        <span className="font-bold text-emerald-700">{versions.length} Versi</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600">Sumber Data</span>
                                        <span className="font-bold text-gray-800">Static File (Instan)</span>
                                    </div>
                                    <div className="py-2.5 flex items-center justify-between">
                                        <span className="text-gray-600">Siklus Pembaruan</span>
                                        <span className="font-semibold text-gray-700">Berkala & Stabil</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Navigation to Key Versions */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs space-y-3">
                                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    <TagIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Pintasan Versi Utama</span>
                                </h3>
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    {versions.slice(0, 10).map((v) => (
                                        <button
                                            key={v.version}
                                            onClick={() => scrollToVersion(v.version)}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-transparent hover:border-emerald-100 cursor-pointer group"
                                        >
                                            <span className="font-bold text-gray-800 group-hover:text-emerald-700">
                                                v{v.version}
                                            </span>
                                            <span className="text-[11px] text-gray-400 group-hover:text-emerald-600 truncate ml-2">
                                                {v.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}

export default RiwayatVersiPage;
