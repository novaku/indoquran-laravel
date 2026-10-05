import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BellIcon,
    CheckIcon,
    XMarkIcon,
    EllipsisHorizontalIcon,
    SparklesIcon,
    BookOpenIcon,
    SpeakerWaveIcon,
    HeartIcon,
    ArrowRightIcon,
    ClockIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';

const STORAGE_KEY = 'indoquran_read_notifications';

// Default fallback notifications if network is offline
const DEFAULT_NOTIFICATIONS = [
    {
        id: 'notif-hadits-kategori-filter',
        title: 'Fitur Baru: Filter Kategori & Bab Hadits',
        message: 'Pilih dan telusuri hadits berdasarkan tema/bab (Iman, Shalat, Zakat, Puasa, Nikah, dll.) dengan katalog topik cepat di Hadits Reader & Hadits Hub.',
        link: '/hadits',
        time_ago: 'Baru saja',
        timestamp: '2026-10-05T09:30:00Z',
        category: 'Fitur Baru',
        type: 'feature',
        badge_icon: 'book',
        badge_color: 'bg-emerald-600',
        section: 'new',
        is_featured: true
    },
    {
        id: 'notif-seo-rich-snippets',
        title: 'Optimasi SEO & Google Rich Snippets',
        message: 'Pencarian ayat & juz makin mudah di Google dengan skema FAQPage tanya-jawab, breadcrumb terstruktur, dan navigasi langsung per nomor ayat.',
        link: '/surah',
        time_ago: '30 menit lalu',
        timestamp: '2026-10-05T09:00:00Z',
        category: 'SEO & Schema',
        type: 'feature',
        badge_icon: 'sparkles',
        badge_color: 'bg-blue-600',
        section: 'new',
        is_featured: true
    },
    {
        id: 'notif-penanda-hadits-baru',
        title: 'Penanda Hadits Nabawi Kini Tersedia',
        message: 'Kini Anda dapat menandai hadits pilihan, menyimpan hadits favorit, dan menuliskan catatan tadabbur & faidah hadits di halaman Penanda.',
        link: '/penanda?type=hadits',
        time_ago: '1 jam lalu',
        timestamp: '2026-10-05T08:00:00Z',
        category: 'Fitur Baru',
        type: 'bookmark',
        badge_icon: 'bookmark',
        badge_color: 'bg-amber-600',
        section: 'new',
        is_featured: false
    },
    {
        id: 'notif-hadits-7-kitab',
        title: 'Koleksi 7 Kitab Hadits Mu\'tamad & Syarah',
        message: 'Telah hadir 33.137 hadits dari 7 kitab mu\'tamad (Shahih Bukhari, Muslim, Abu Daud, Tirmidzi, An-Nasa\'i, Ibnu Majah, Musnad Ahmad) dengan teks Arab terstandarisasi & penjelasan syarah.',
        link: '/hadits',
        time_ago: '2 jam lalu',
        timestamp: '2026-10-05T07:00:00Z',
        category: 'Hadits Nabawi',
        type: 'feature',
        badge_icon: 'book',
        badge_color: 'bg-teal-600',
        section: 'new',
        is_featured: false
    },
    {
        id: 'notif-version-2-32-0',
        title: 'Pembaruan IndoQuran Versi 2.32.0',
        message: 'Filter kategori hadits, Google Rich Snippets komprehensif, navigasi kanonikal per nomor ayat, dedicated sitemap topik hadits, dan ketahanan cache Redis.',
        link: '/riwayat-versi',
        time_ago: 'Hari ini',
        timestamp: '2026-10-05T06:00:00Z',
        category: 'Riwayat Versi',
        type: 'version',
        badge_icon: 'check',
        badge_color: 'bg-indigo-600',
        section: 'new',
        is_featured: true
    },
    {
        id: 'notif-audio-arabic-speech',
        title: 'Audio Pelafalan Arab di Browser',
        message: 'Dengarkan suara pelafalan teks Arab seketika pada Hadits & Doa Bersama langsung di browser Anda menggunakan Web Speech API tanpa konsumsi kuota server.',
        link: '/hadits',
        time_ago: 'Kemarin',
        timestamp: '2026-10-04T14:00:00Z',
        category: 'Audio Player',
        type: 'audio',
        badge_icon: 'speaker',
        badge_color: 'bg-blue-600',
        section: 'earlier'
    },
    {
        id: 'notif-doa-bersama-audio',
        title: 'Doa Bersama Dilengkapi Tombol Audio',
        message: 'Setiap doa harian dan dzikir kini dapat diputar audio pelafalannya dengan tombol play instan untuk mempermudah menghafal dan bertilawah.',
        link: '/doa-bersama',
        time_ago: '2 hari lalu',
        timestamp: '2026-10-03T12:00:00Z',
        category: 'Doa & Dzikir',
        type: 'prayer',
        badge_icon: 'prayer',
        badge_color: 'bg-rose-600',
        section: 'earlier'
    },
    {
        id: 'notif-khatam-tracker-30juz',
        title: 'Rencanakan Target Khatam 30 Juz',
        message: 'Gunakan fitur Khatam Tracker di halaman Penanda untuk mencatat progres membaca harian Anda menuju khatam Al-Quran.',
        link: '/penanda',
        time_ago: '3 hari lalu',
        timestamp: '2026-10-02T09:00:00Z',
        category: 'Tilawah',
        type: 'tracker',
        badge_icon: 'target',
        badge_color: 'bg-purple-600',
        section: 'earlier'
    },
    {
        id: 'notif-tafsir-maudhui-update',
        title: 'Kajian Tematik Tafsir Maudhu\'i',
        message: 'Temukan himpunan ayat per topik kehidupan (Ketenangan Hati, Rezeki, Keluarga Sakinah, Birrul Walidain) dengan mudah.',
        link: '/tafsir-maudhui',
        time_ago: '4 hari lalu',
        timestamp: '2026-10-01T10:00:00Z',
        category: 'Tafsir Al-Quran',
        type: 'tafsir',
        badge_icon: 'sparkles',
        badge_color: 'bg-amber-500',
        section: 'earlier'
    },
    {
        id: 'notif-pwa-mobile-install',
        title: 'Install IndoQuran di Layar HP',
        message: 'Aplikasi IndoQuran mendukung Progressive Web App (PWA). Tambahkan ke layar utama smartphone untuk akses cepat dan bacaan offline.',
        link: '/riwayat-versi',
        time_ago: '5 hari lalu',
        timestamp: '2026-09-30T11:00:00Z',
        category: 'Aplikasi Web',
        type: 'system',
        badge_icon: 'mobile',
        badge_color: 'bg-emerald-500',
        section: 'earlier'
    }
];

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread'
    const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
    const [readIds, setReadIds] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch live notifications from backend API
    useEffect(() => {
        let isMounted = true;
        const loadNotifications = async () => {
            try {
                const response = await fetchWithAuth('/api/notifications');
                if (response.ok) {
                    const result = await response.json();
                    if (isMounted && result?.status === 'success' && Array.isArray(result?.data)) {
                        setNotifications(result.data);
                    }
                }
            } catch (err) {
                // Silently fallback to default notifications
            }
        };

        loadNotifications();
        return () => {
            isMounted = false;
        };
    }, []);

    // Save read IDs to localStorage
    const updateReadIds = (newIds) => {
        setReadIds(newIds);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
        } catch (e) {
            console.warn('Failed to save read notifications to localStorage', e);
        }
    };

    // Calculate unread count
    const unreadCount = useMemo(() => {
        return notifications.filter((item) => !readIds.includes(item.id)).length;
    }, [notifications, readIds]);

    // Filter notifications based on tab
    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter((item) => !readIds.includes(item.id));
        }
        return notifications;
    }, [notifications, filter, readIds]);

    // Separate into New & Earlier
    const newNotifications = useMemo(() => {
        return filteredNotifications.filter((item) => item.section === 'new');
    }, [filteredNotifications]);

    const earlierNotifications = useMemo(() => {
        return filteredNotifications.filter((item) => item.section !== 'new');
    }, [filteredNotifications]);

    // Close on click outside (for desktop popover)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Prevent background scroll when open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden', 'sm:overflow-auto');
        } else {
            document.body.classList.remove('overflow-hidden', 'sm:overflow-auto');
        }
        return () => {
            document.body.classList.remove('overflow-hidden', 'sm:overflow-auto');
        };
    }, [isOpen]);

    // Handle single notification click
    const handleNotificationClick = (item) => {
        if (!readIds.includes(item.id)) {
            updateReadIds([...readIds, item.id]);
        }
        setIsOpen(false);
        if (item.link) {
            navigate(item.link);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = (e) => {
        e?.stopPropagation();
        const allIds = notifications.map((item) => item.id);
        updateReadIds(allIds);
    };

    // Toggle single read status
    const handleToggleRead = (e, id) => {
        e.stopPropagation();
        if (readIds.includes(id)) {
            updateReadIds(readIds.filter((item) => item !== id));
        } else {
            updateReadIds([...readIds, id]);
        }
    };

    // Helper for badge icon rendering
    const renderBadgeIcon = (iconType) => {
        switch (iconType) {
            case 'book':
                return '📖';
            case 'bookmark':
                return '🔖';
            case 'speaker':
                return '🔊';
            case 'prayer':
                return '🤲';
            case 'target':
                return '🎯';
            case 'sparkles':
                return '✨';
            case 'mobile':
                return '📱';
            case 'check':
                return '✓';
            default:
                return '📢';
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Top Bell Trigger Button (Facebook Style) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative cursor-pointer touch-manipulation ${
                    isOpen
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-gray-100 hover:bg-gray-200/90 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
                title="Kabar Terbaru & Notifikasi"
                aria-label={`Notifikasi ${unreadCount > 0 ? `(${unreadCount} belum dibaca)` : ''}`}
            >
                <BellIcon className="w-5 h-5 transition-transform duration-200 active:scale-95" />

                {/* Unread Counter Badge (Facebook Style Red Bubble) */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] leading-tight flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Mobile Backdrop Overlay (Dark blur background for mobile view) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] sm:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Notification Drawer / Popover (Responsive: Bottom Sheet on Mobile, Anchored Dropdown on Desktop) */}
            {isOpen && (
                <div
                    className="fixed inset-x-0 bottom-0 max-h-[88vh] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-[85] flex flex-col overflow-hidden sm:fixed-none sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] sm:max-h-[620px] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200/90 sm:dark:border-gray-800 sm:inset-auto animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Daftar Notifikasi"
                >
                    {/* Mobile Drag Indicator Bar */}
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-1 sm:hidden flex-shrink-0" />

                    {/* Popover Header (Facebook Style) */}
                    <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 dark:border-gray-800/80 flex-shrink-0">
                        {/* Title Row */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                                    Notifikasi
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                        {unreadCount} baru
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                        title="Tandai semua notifikasi telah dibaca"
                                    >
                                        Tandai semua dibaca
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden cursor-pointer"
                                    title="Tutup Notifikasi"
                                    aria-label="Tutup"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs (Facebook Style Pills: All / Unread) */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setFilter('all')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    filter === 'all'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('unread')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    filter === 'unread'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span>Belum Dibaca</span>
                                {unreadCount > 0 && (
                                    <span
                                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                            filter === 'unread' ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                                        }`}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notification List Scroll Area */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60 p-2 sm:p-2.5 overscroll-contain">
                        {filteredNotifications.length === 0 ? (
                            <div className="py-12 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-3 text-2xl">
                                    🎉
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {filter === 'unread' ? 'Tidak Ada Notifikasi Baru' : 'Belum Ada Notifikasi'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                                    {filter === 'unread'
                                        ? 'Semua pembaruan dan kabar terbaru website telah Anda baca.'
                                        : 'Kabar dan pembaruan fitur IndoQuran akan muncul di sini.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* SECTION: TERBARU (NEW) */}
                                {newNotifications.length > 0 && (
                                    <div className="pb-2">
                                        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
                                            <span>Terbaru</span>
                                            <span className="text-[11px] font-normal text-emerald-600">Hari ini</span>
                                        </div>
                                        <div className="space-y-1">
                                            {newNotifications.map((item) => {
                                                const isUnread = !readIds.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className={`group flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer select-none relative ${
                                                            isUnread
                                                                ? 'bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                                        }`}
                                                    >
                                                        {/* Avatar with Corner Mini Badge (Facebook Pattern) */}
                                                        <div className="relative flex-shrink-0 mt-0.5">
                                                            <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs overflow-hidden border border-emerald-700/40">
                                                                <img
                                                                    src="/images/logo-icon.webp"
                                                                    alt="IndoQuran"
                                                                    className="w-7 h-7 object-contain"
                                                                />
                                                            </div>
                                                            {/* Overlapping Category Icon Badge */}
                                                            <div
                                                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md border-2 border-white dark:border-gray-900 ${
                                                                    item.badge_color || 'bg-emerald-600'
                                                                }`}
                                                            >
                                                                <span>{renderBadgeIcon(item.badge_icon)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Text Content */}
                                                        <div className="flex-1 min-w-0 pr-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <h4
                                                                    className={`text-sm leading-snug line-clamp-2 ${
                                                                        isUnread
                                                                            ? 'font-bold text-gray-950 dark:text-white'
                                                                            : 'font-semibold text-gray-800 dark:text-gray-200'
                                                                    }`}
                                                                >
                                                                    {item.title}
                                                                </h4>
                                                            </div>

                                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                                                                {item.message}
                                                            </p>

                                                            {/* Time & Category Tag */}
                                                            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                                                                <span>{item.time_ago}</span>
                                                                <span className="text-gray-400 font-normal">•</span>
                                                                <span className="text-gray-500 font-medium dark:text-gray-400">
                                                                    {item.category}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Blue Unread Dot (Exact Facebook Style) */}
                                                        {isUnread && (
                                                            <div className="flex-shrink-0 self-center pl-1">
                                                                <div
                                                                    className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 shadow-2xs ring-2 ring-blue-200 dark:ring-blue-900/50"
                                                                    title="Belum dibaca"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* SECTION: SEBELUMNYA (EARLIER) */}
                                {earlierNotifications.length > 0 && (
                                    <div className="pt-2">
                                        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                                            <span>Sebelumnya</span>
                                            <span className="text-[11px] font-normal text-gray-500">Minggu ini</span>
                                        </div>
                                        <div className="space-y-1">
                                            {earlierNotifications.map((item) => {
                                                const isUnread = !readIds.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleNotificationClick(item)}
                                                        className={`group flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer select-none relative ${
                                                            isUnread
                                                                ? 'bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50'
                                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                                        }`}
                                                    >
                                                        {/* Avatar with Corner Mini Badge */}
                                                        <div className="relative flex-shrink-0 mt-0.5">
                                                            <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs overflow-hidden border border-slate-700/40">
                                                                <img
                                                                    src="/images/logo-icon.webp"
                                                                    alt="IndoQuran"
                                                                    className="w-7 h-7 object-contain opacity-90"
                                                                />
                                                            </div>
                                                            {/* Overlapping Badge */}
                                                            <div
                                                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-md border-2 border-white dark:border-gray-900 ${
                                                                    item.badge_color || 'bg-gray-600'
                                                                }`}
                                                            >
                                                                <span>{renderBadgeIcon(item.badge_icon)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Text Content */}
                                                        <div className="flex-1 min-w-0 pr-1">
                                                            <h4
                                                                className={`text-sm leading-snug line-clamp-2 ${
                                                                    isUnread
                                                                        ? 'font-bold text-gray-950 dark:text-white'
                                                                        : 'font-semibold text-gray-800 dark:text-gray-200'
                                                                }`}
                                                            >
                                                                {item.title}
                                                            </h4>

                                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                                                                {item.message}
                                                            </p>

                                                            {/* Time & Category */}
                                                            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                                                                <span>{item.time_ago}</span>
                                                                <span className="text-gray-400 font-normal">•</span>
                                                                <span className="font-normal">{item.category}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Blue Unread Dot */}
                                                        {isUnread && (
                                                            <div className="flex-shrink-0 self-center pl-1">
                                                                <div
                                                                    className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 shadow-2xs ring-2 ring-blue-200 dark:ring-blue-900/50"
                                                                    title="Belum dibaca"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Popover Footer (Facebook Style) */}
                    <div className="p-3 sm:p-3.5 bg-gray-50 dark:bg-gray-950/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 flex-shrink-0">
                        <Link
                            to="/riwayat-versi"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                        >
                            <span>Lihat Riwayat Versi & Fitur</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>

                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
                        >
                            Bersihkan Tanda
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
