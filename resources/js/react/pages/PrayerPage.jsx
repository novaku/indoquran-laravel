import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    IoHandRightOutline, 
    IoAddOutline, 
    IoHeartOutline,
    IoPeopleOutline,
    IoTimeOutline,
    IoTrendingUpOutline,
    IoStarOutline,
    IoCheckmarkCircleOutline,
    IoEyeOutline,
    IoChatbubbleEllipsesOutline,
    IoShareSocialOutline,
    IoBookOutline,
    IoSearchOutline,
    IoSparklesOutline,
    IoCloseCircleOutline
} from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth, postWithAuth } from '../utils/apiUtils';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerCard from '../components/PrayerCard';
import SelectedPrayerCard from '../components/SelectedPrayerCard';
import PrayerForm from '../components/PrayerForm';
import PrayerFilters from '../components/PrayerFilters';
import PrayerSlideshow from '../components/PrayerSlideshow';
import SimpleSlideshow from '../components/SimpleSlideshow';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseInline from '../components/AdSenseInline';
import AdSenseHorizontal from '../components/AdSenseHorizontal';
import { scrollToTop } from '../utils/scrollUtils';

const PrayerPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    // Active Top-level Tab ('pilihan' | 'komunitas') - Default: 'pilihan'
    const activeTab = searchParams.get('tab') === 'komunitas' ? 'komunitas' : 'pilihan';
    const targetDoaId = searchParams.get('doa');

    // --- State for Target / Shared Prayer from URL (?doa=ID) ---
    const [targetPrayer, setTargetPrayer] = useState(null);
    const [targetLoading, setTargetLoading] = useState(false);

    // --- State for Doa Bersama (Komunitas) ---
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formInitialData, setFormInitialData] = useState(null);
    const [filters, setFilters] = useState({
        category: 'all',
        sort: 'latest',
        search: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    // --- State for Doa-Doa Pilihan (Database Feed) ---
    const [selectedPrayers, setSelectedPrayers] = useState([]);
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSearchInput, setSelectedSearchInput] = useState('');
    const [selectedSearch, setSelectedSearch] = useState('');
    const [selectedPagination, setSelectedPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
    });

    // Handle fetching and scrolling to target shared prayer (?doa=ID)
    useEffect(() => {
        if (!targetDoaId) {
            setTargetPrayer(null);
            return;
        }

        // Check if already in selectedPrayers
        const existing = selectedPrayers.find(p => String(p.id) === String(targetDoaId));
        if (existing) {
            setTargetPrayer(existing);
            const timer = setTimeout(() => {
                const el = document.getElementById(`doa-${targetDoaId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 350);
            return () => clearTimeout(timer);
        }

        // If not in current page, fetch directly from API
        let isMounted = true;
        setTargetLoading(true);
        fetch(`/api/doa-pilihan/${targetDoaId}`)
            .then(res => res.json())
            .then(res => {
                if (isMounted && res.success && res.data) {
                    setTargetPrayer(res.data);
                    setTimeout(() => {
                        const el = document.getElementById(`doa-${targetDoaId}`);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 350);
                }
            })
            .catch(err => console.error('Gagal memuat doa pilihan yang dituju:', err))
            .finally(() => {
                if (isMounted) setTargetLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [targetDoaId, selectedPrayers]);

    const handleClearTargetPrayer = () => {
        setTargetPrayer(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('doa');
        setSearchParams(newParams);
    };

    // Debounce search input for Doa Pilihan
    useEffect(() => {
        const timer = setTimeout(() => {
            setSelectedSearch(selectedSearchInput);
        }, 350);
        return () => clearTimeout(timer);
    }, [selectedSearchInput]);

    // Handle Tab change (default: pilihan)
    const handleTabChange = (newTab) => {
        const newParams = new URLSearchParams(searchParams);
        if (newTab === 'komunitas') {
            newParams.set('tab', 'komunitas');
        } else {
            newParams.delete('tab');
        }
        setSearchParams(newParams);
        scrollToTop();
    };

    // --- Fetchers for Community Prayers ---
    const fetchPrayers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const url = new URL('/api/doa-bersama', window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('category', filters.category);
            url.searchParams.append('sort', filters.sort);
            if (filters.search) {
                url.searchParams.append('search', filters.search);
            }

            const response = await fetchWithAuth(url.toString());
            const data = await response.json();

            if (data.success) {
                setPrayers(data.data.data);
                setPagination({
                    current_page: data.data.current_page,
                    last_page: data.data.last_page,
                    per_page: data.data.per_page,
                    total: data.data.total
                });
            }
        } catch (error) {
            console.error('Gagal memuat doa:', error);
            toast.error('Gagal memuat doa-doa komunitas');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (activeTab === 'komunitas') {
            fetchPrayers(1);
        }
    }, [filters, activeTab, fetchPrayers]);

    // --- Fetchers for Doa-Doa Pilihan ---
    const fetchSelectedCategories = useCallback(async () => {
        try {
            const response = await fetchWithAuth('/api/doa-pilihan/categories');
            const data = await response.json();
            if (data.success) {
                setSelectedCategories(data.data);
            }
        } catch (error) {
            console.error('Gagal memuat kategori doa pilihan:', error);
        }
    }, []);

    const fetchSelectedPrayers = useCallback(async (page = 1) => {
        try {
            setSelectedLoading(true);
            const url = new URL('/api/doa-pilihan', window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('category', selectedCategory);
            url.searchParams.append('per_page', 12);
            if (selectedSearch) {
                url.searchParams.append('search', selectedSearch);
            }

            const response = await fetchWithAuth(url.toString());
            const data = await response.json();

            if (data.success) {
                setSelectedPrayers(data.data.data);
                setSelectedPagination({
                    current_page: data.data.current_page,
                    last_page: data.data.last_page,
                    per_page: data.data.per_page,
                    total: data.data.total
                });
            }
        } catch (error) {
            console.error('Gagal memuat doa-doa pilihan:', error);
            toast.error('Gagal memuat doa-doa pilihan');
        } finally {
            setSelectedLoading(false);
        }
    }, [selectedCategory, selectedSearch]);

    // Load categories on mount
    useEffect(() => {
        fetchSelectedCategories();
    }, [fetchSelectedCategories]);

    // Load selected prayers when tab is 'pilihan' or filters change
    useEffect(() => {
        if (activeTab === 'pilihan') {
            fetchSelectedPrayers(1);
        }
    }, [activeTab, selectedCategory, selectedSearch, fetchSelectedPrayers]);

    // Pagination handlers
    const handleCommunityPageChange = (page) => {
        if (page !== pagination.current_page) {
            scrollToTop();
            fetchPrayers(page);
        }
    };

    const handleSelectedPageChange = (page) => {
        if (page !== selectedPagination.current_page) {
            scrollToTop();
            fetchSelectedPrayers(page);
        }
    };

    // Handle form submission
    const handleSubmitPrayer = async (prayerData) => {
        if (!user) {
            toast.error('Anda harus login terlebih dahulu untuk mengirim doa');
            return;
        }

        try {
            setSubmitting(true);
            const response = await postWithAuth('/api/doa-bersama', prayerData);
            const data = await response.json();

            if (data.success) {
                toast.success('Doa berhasil dikirim ke komunitas');
                setShowForm(false);
                setFormInitialData(null);
                fetchPrayers(1);
            } else {
                if (response.status === 401) {
                    toast.error('Sesi Anda telah berakhir. Silakan login kembali');
                } else {
                    toast.error(data.message || 'Gagal mengirim doa');
                }
            }
        } catch (error) {
            console.error('Gagal mengirim doa:', error);
            if (error.response?.status === 401) {
                toast.error('Anda harus login untuk mengirim doa');
            } else {
                toast.error('Gagal mengirim doa');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle amin toggle
    const handleAminToggle = async (prayerId) => {
        if (!user) {
            toast.error('Silakan login untuk memberikan amin');
            return;
        }

        try {
            const response = await postWithAuth(`/api/doa-bersama/${prayerId}/amin`);
            const data = await response.json();

            if (data.success) {
                setPrayers(prayers.map(prayer => 
                    prayer.id === prayerId 
                        ? {
                            ...prayer,
                            user_has_amin: data.data.user_has_amin,
                            amin_count: data.data.amin_count
                        }
                        : prayer
                ));
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Gagal memberikan amin');
            }
        } catch (error) {
            console.error('Gagal mengubah status amin:', error);
            toast.error('Gagal memberikan amin');
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (prayerId, commentData) => {
        if (!user) {
            toast.error('Silakan login untuk memberikan komentar');
            return;
        }

        try {
            const response = await postWithAuth(`/api/doa-bersama/${prayerId}/comments`, commentData);
            const data = await response.json();

            if (data.success) {
                setPrayers(prayers.map(prayer => 
                    prayer.id === prayerId 
                        ? {
                            ...prayer,
                            comments: [...prayer.comments, data.data],
                            comment_count: prayer.comment_count + 1
                        }
                        : prayer
                ));
                toast.success('Komentar berhasil ditambahkan');
                return true;
            } else {
                toast.error(data.message || 'Gagal menambahkan komentar');
                return false;
            }
        } catch (error) {
            console.error('Gagal mengirim komentar:', error);
            toast.error('Gagal menambahkan komentar');
            return false;
        }
    };

    // Handle using a Selected Prayer into Community Form
    const handleUsePrayerInCommunity = (p) => {
        if (!user) {
            toast.error('Silakan masuk (login) untuk mengirim doa ke komunitas');
            navigate('/masuk');
            return;
        }

        setFormInitialData({
            title: p.title,
            content: `${p.arabic}\n\nArtinya:\n"${p.translation}"\n\n(Sumber: ${p.source || 'Doa Pilihan'})`,
            category: 'umum',
            is_anonymous: false
        });
        setShowForm(true);
        handleTabChange('komunitas');
        toast.success(`Doa "${p.title}" telah dimuat ke formulir!`);
    };

    // Dynamic SEO data
    const seoTitle = targetPrayer
        ? `${targetPrayer.title} - Doa Pilihan Al-Qur'an & Sunnah | IndoQuran`
        : activeTab === 'pilihan'
            ? "Koleksi Doa-Doa Pilihan Al-Qur'an & Sunnah Lengkap Arab Latin Arti | IndoQuran"
            : "Doa Bersama - Komunitas Muslim Real-time | IndoQuran";

    const seoDescription = targetPrayer
        ? `${targetPrayer.title}: "${targetPrayer.translation?.slice(0, 140)}..." - Baca doa lengkap dengan teks Arab, Latin, arti, dan fadhilah di IndoQuran.`
        : activeTab === 'pilihan'
            ? "Koleksi lengkap doa-doa pilihan otentik dari Al-Qur'an dan As-Sunnah dengan teks Arab berharakat, transliterasi Latin, terjemahan Indonesia, rujukan sumber, dan fadhilah keutamaan."
            : "Bergabunglah dalam doa bersama umat Islam. Post doa, berikan amin, dan saling mendukung dalam spiritualitas. Komunitas muslim 24/7 siap berdoa bersama Anda.";

    const canonicalUrl = targetPrayer
        ? `https://indoquran.web.id/doa-bersama?doa=${targetPrayer.id}`
        : activeTab === 'komunitas'
            ? 'https://indoquran.web.id/doa-bersama?tab=komunitas'
            : 'https://indoquran.web.id/doa-bersama';

    return (
        <>
            <SEOHead 
                title={seoTitle}
                description={seoDescription}
                keywords="doa bersama, doa pilihan, kumpulan doa pilihan, doa al quran, doa hadits, doa para nabi, doa sehari hari, amin doa, komunitas muslim, spiritual, doa latin indonesia"
                canonicalUrl={canonicalUrl}
            />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/60 pb-16">
                {/* Hero / Header Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-2 border border-green-100 shadow-2xs">
                                    <IoHeartOutline className="w-3.5 h-3.5 text-green-600" />
                                    <span>Ruang Silaturahmi & Kebaikan Spiritual</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                    {activeTab === 'pilihan' ? 'Doa-Doa Pilihan' : 'Doa Bersama'}
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                                    {activeTab === 'pilihan'
                                        ? "Kumpulan doa-doa mustajab bersumber dari Al-Qur'an & As-Sunnah lengkap dengan teks Arab, Latin, dan artinya."
                                        : "Saling menitipkan hajat kebaikan, mendoakan sesama, dan mengaminkan doa saudara seiman secara real-time."
                                    }
                                </p>
                            </div>
                            
                            {user && activeTab === 'komunitas' && (
                                <button
                                    onClick={() => {
                                        if (showForm) setFormInitialData(null);
                                        setShowForm(!showForm);
                                    }}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                >
                                    <IoAddOutline className="w-5 h-5" />
                                    <span>{showForm ? 'Batal' : 'Kirim Doa'}</span>
                                </button>
                            )}

                            {activeTab === 'pilihan' && (
                                <button
                                    onClick={() => handleTabChange('komunitas')}
                                    className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-full font-semibold hover:bg-emerald-50 transition-colors shadow-2xs self-start sm:self-auto flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs sm:text-sm"
                                >
                                    <IoHandRightOutline className="w-4 h-4 text-emerald-600" />
                                    <span>Titip Doa Komunitas</span>
                                </button>
                            )}
                        </div>

                        {/* Feature Highlights Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                            <div className="bg-gradient-to-br from-green-50/80 to-white rounded-xl p-3 border border-green-100/80 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center mb-2 shadow-xs">
                                    <IoHandRightOutline className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Kirim Doa & Hajat</h4>
                                <p className="text-gray-500 text-[11px] sm:text-xs leading-snug mt-0.5">Tulis doa (bisa atas nama pribadi / Hamba Allah)</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50/80 to-white rounded-xl p-3 border border-red-100/80 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center mb-2 shadow-xs">
                                    <IoHeartOutline className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Saling Mengaminkan</h4>
                                <p className="text-gray-500 text-[11px] sm:text-xs leading-snug mt-0.5">Klik Amin untuk menguatkan doa sesama</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-xl p-3 border border-blue-100/80 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
                                    <IoChatbubbleEllipsesOutline className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Doa Balasan</h4>
                                <p className="text-gray-500 text-[11px] sm:text-xs leading-snug mt-0.5">Tulis komentar dan doa kebaikan penguat</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-xl p-3 border border-emerald-100/80 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
                                    <IoBookOutline className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Doa-Doa Pilihan</h4>
                                <p className="text-gray-500 text-[11px] sm:text-xs leading-snug mt-0.5">Lafadz Al-Qur'an & Sunnah lengkap berharakat</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Billboard Ad */}
                <AdSenseLeaderboard maxWidth="max-w-3xl" labelText="IKLAN" className="my-4 sm:my-6" />

                {/* Main Content Area */}
                <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">

                    {/* NESTED TAB SWITCHER */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-200/70 mb-6 sm:mb-8">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleTabChange('komunitas')}
                                className={`py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'komunitas'
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                                }`}
                            >
                                <IoHandRightOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Doa Bersama</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('pilihan')}
                                className={`py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'pilihan'
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                                }`}
                            >
                                <IoBookOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Doa-Doa Pilihan</span>
                            </button>
                        </div>
                    </div>

                    {/* ======================================================= */}
                    {/* TAB 1: DOA BERSAMA (KOMUNITAS)                          */}
                    {/* ======================================================= */}
                    {activeTab === 'komunitas' && (
                        <>
                            {/* Login Notice */}
                            {!user && (
                                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-2xs">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-2xs">
                                            <IoHeartOutline className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Bergabung dengan Komunitas Doa</h3>
                                            <p className="text-gray-600 text-sm mb-4">
                                                Login untuk mengirim doa, memberikan amin, dan berkomentar
                                            </p>
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => navigate('/masuk')}
                                                    className="px-5 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm shadow-2xs cursor-pointer"
                                                >
                                                    Masuk
                                                </button>
                                                <button 
                                                    onClick={() => navigate('/auth/register')}
                                                    className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm shadow-2xs cursor-pointer"
                                                >
                                                    Daftar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prayer Form */}
                            {showForm && user && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">Kirim Doa Baru</h2>
                                        {formInitialData && (
                                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                                                Memuat dari Doa Pilihan
                                            </span>
                                        )}
                                    </div>
                                    <PrayerForm 
                                        onSubmit={handleSubmitPrayer}
                                        loading={submitting}
                                        initialData={formInitialData}
                                        onCancel={() => {
                                            setShowForm(false);
                                            setFormInitialData(null);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Filters - Simplified */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                                <PrayerFilters 
                                    filters={filters}
                                    onFiltersChange={setFilters}
                                    totalPrayers={pagination.total}
                                />
                            </div>

                            {/* Community Prayer List */}
                            <div className="space-y-4">
                                {loading && prayers.length === 0 ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner size="lg" />
                                    </div>
                                ) : prayers.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <IoHandRightOutline className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {filters.search || filters.category !== 'all' 
                                                ? 'Tidak Ada Doa Ditemukan' 
                                                : 'Belum Ada Doa'
                                            }
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {filters.search || filters.category !== 'all' 
                                                ? 'Coba ubah filter atau kata kunci pencarian' 
                                                : 'Jadilah yang pertama mengirim doa'
                                            }
                                        </p>
                                        {user && !showForm && (
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                                            >
                                                Kirim Doa Pertama
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    prayers.map((prayer, index) => (
                                        <React.Fragment key={prayer.id}>
                                            {(index === 3 || (index > 3 && (index + 1) % 6 === 0)) && (
                                                <AdSenseInline labelText="IKLAN REKOMENDASI" minHeight="100px" />
                                            )}
                                            <PrayerCard
                                                prayer={prayer}
                                                user={user}
                                                onAminToggle={handleAminToggle}
                                                onCommentSubmit={handleCommentSubmit}
                                            />
                                        </React.Fragment>
                                    ))
                                )}
                            </div>

                            {/* Bottom Break Ad */}
                            {!loading && prayers.length > 0 && (
                                <div className="my-6">
                                    <AdSenseHorizontal 
                                        adSlot="1519827772"
                                        showLabel={true}
                                        labelText="IKLAN"
                                        minHeight="90px"
                                    />
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.last_page > 1 && !loading && prayers.length > 0 && (
                                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-sm text-gray-600 text-center sm:text-left">
                                            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} doa
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleCommunityPageChange(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                                    pagination.current_page === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                Sebelumnya
                                            </button>
                                            
                                            <span className="text-sm font-medium text-gray-700 px-3">
                                                {pagination.current_page} / {pagination.last_page}
                                            </span>
                                            
                                            <button
                                                onClick={() => handleCommunityPageChange(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.last_page}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                                    pagination.current_page === pagination.last_page
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                Selanjutnya
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ======================================================= */}
                    {/* TAB 2: DOA-DOA PILIHAN (DATABASE FEED)                  */}
                    {/* ======================================================= */}
                    {activeTab === 'pilihan' && (
                        <div className="space-y-6">
                            {/* Doa Pilihan Hero Banner */}
                            <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
                                        <IoSparklesOutline className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Khazanah Doa Mustajab</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                        Koleksi Doa Pilihan Al-Qur'an & As-Sunnah
                                    </h2>
                                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                                        Lafadz doa otentik pilihan para Nabi, Rasul, dan generasi salaf. Lengkap dengan teks Arab berharakat jelas, transliterasi Latin, terjemahan resmi, rujukan riwayat, serta keutamaannya untuk diamalkan setiap hari.
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar for Doa Pilihan */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <IoSearchOutline className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari judul doa, ayat, terjemahan, lafadz Latin, atau riwayat..."
                                        value={selectedSearchInput}
                                        onChange={(e) => setSelectedSearchInput(e.target.value)}
                                        className="block w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm text-gray-900 transition-all"
                                    />
                                    {selectedSearchInput && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSearchInput('');
                                                setSelectedSearch('');
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <IoCloseCircleOutline className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Nested Sub-Tabs: Categories Pills */}
                            {selectedCategories.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                                            <IoBookOutline className="w-4 h-4 text-emerald-600" />
                                            <span>Kategori Doa Pilihan</span>
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                            {selectedCategories.length - 1} Kategori
                                        </span>
                                    </div>

                                    {/* Category Pills List */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                        {selectedCategories.map((cat) => {
                                            const isActive = selectedCategory === cat.slug;
                                            return (
                                                <button
                                                    key={cat.slug}
                                                    onClick={() => {
                                                        setSelectedCategory(cat.slug);
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                                                        isActive
                                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                                                            : 'bg-gray-50 hover:bg-emerald-50/70 text-gray-700 hover:text-emerald-800 border border-gray-200/80 hover:border-emerald-200'
                                                    }`}
                                                >
                                                    <span>{cat.icon}</span>
                                                    <span>{cat.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Summary / Filter status */}
                            <div className="flex items-center justify-between px-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">
                                    {selectedSearch ? (
                                        <span>Hasil pencarian untuk "<span className="font-semibold text-gray-900">{selectedSearch}</span>"</span>
                                    ) : selectedCategory !== 'all' ? (
                                        <span>Kategori: <span className="font-semibold text-emerald-800">{selectedCategories.find(c => c.slug === selectedCategory)?.name || selectedCategory}</span></span>
                                    ) : (
                                        <span>Daftar Doa-Doa Pilihan</span>
                                    )}
                                </p>
                                {(selectedSearch || selectedCategory !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setSelectedSearchInput('');
                                            setSelectedSearch('');
                                        }}
                                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>

                            {/* Targeted Prayer Highlight (when opened via share link ?doa=ID) */}
                            {targetLoading && (
                                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 mb-4 animate-pulse">
                                    <LoadingSpinner size="sm" />
                                    <span>Membuka doa pilihan yang dituju...</span>
                                </div>
                            )}

                            {targetPrayer && !selectedPrayers.some(p => String(p.id) === String(targetPrayer.id)) && (
                                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border-2 border-emerald-400/80 shadow-md">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <IoSparklesOutline className="w-4 h-4 text-amber-600" />
                                            <span className="font-bold text-xs sm:text-sm text-emerald-950">Doa Pilihan yang Dituju</span>
                                        </div>
                                        <button
                                            onClick={handleClearTargetPrayer}
                                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                                        >
                                            Tutup / Lihat Semua
                                        </button>
                                    </div>
                                    <SelectedPrayerCard 
                                        prayer={targetPrayer}
                                        isHighlighted={true}
                                        onUseInCommunity={handleUsePrayerInCommunity}
                                    />
                                </div>
                            )}

                            {/* Selected Prayers Cards List */}
                            <div className="space-y-5">
                                {selectedLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
                                        <LoadingSpinner size="lg" />
                                        <p className="mt-4 text-sm text-gray-500 font-medium">Memuat doa-doa pilihan...</p>
                                    </div>
                                ) : selectedPrayers.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-6">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                            <IoBookOutline className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                            Tidak Ada Doa Pilihan yang Cocok
                                        </h3>
                                        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                                            Pencarian "{selectedSearch}" tidak menemukan hasil. Coba ganti kata kunci atau pilih kategori lain.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('all');
                                                setSelectedSearchInput('');
                                                setSelectedSearch('');
                                            }}
                                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                                        >
                                            Tampilkan Semua Doa
                                        </button>
                                    </div>
                                ) : (
                                    selectedPrayers.map((prayer, index) => (
                                        <React.Fragment key={prayer.id}>
                                            {(index === 3 || (index > 3 && (index + 1) % 6 === 0)) && (
                                                <AdSenseInline labelText="IKLAN REKOMENDASI" minHeight="100px" />
                                            )}
                                            <SelectedPrayerCard 
                                                prayer={prayer}
                                                isHighlighted={String(prayer.id) === String(targetDoaId)}
                                                onUseInCommunity={handleUsePrayerInCommunity}
                                            />
                                        </React.Fragment>
                                    ))
                                )}
                            </div>

                            {/* Pagination for Selected Prayers */}
                            {selectedPagination.last_page > 1 && !selectedLoading && selectedPrayers.length > 0 && (
                                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-sm text-gray-600 text-center sm:text-left">
                                            Halaman {selectedPagination.current_page} dari {selectedPagination.last_page}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleSelectedPageChange(selectedPagination.current_page - 1)}
                                                disabled={selectedPagination.current_page === 1}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                                    selectedPagination.current_page === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                            >
                                                Sebelumnya
                                            </button>
                                            
                                            <span className="text-sm font-medium text-gray-700 px-3">
                                                {selectedPagination.current_page} / {selectedPagination.last_page}
                                            </span>
                                            
                                            <button
                                                onClick={() => handleSelectedPageChange(selectedPagination.current_page + 1)}
                                                disabled={selectedPagination.current_page === selectedPagination.last_page}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                                    selectedPagination.current_page === selectedPagination.last_page
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                            >
                                                Selanjutnya
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Call to Action */}
                            <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50/80 rounded-3xl p-6 border border-emerald-200/70 text-center shadow-2xs">
                                <h4 className="font-bold text-gray-900 text-base mb-1">
                                    Punya Doa Pribadi atau Hajat yang Ingin Didoakan Bersama?
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-md mx-auto">
                                    Tuliskan permohonan doa Anda agar dapat diaminkan oleh ribuan saudara muslim seiman di seluruh tanah air.
                                </p>
                                <button
                                    onClick={() => {
                                        handleTabChange('komunitas');
                                        if (user) {
                                            setShowForm(true);
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    Buka Halaman Doa Bersama
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PrayerPage;
