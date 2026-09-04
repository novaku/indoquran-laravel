import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    IoArrowBackOutline,
    IoHeartOutline, 
    IoHeart, 
    IoLogoWhatsapp, 
    IoChatbubbleEllipsesOutline,
    IoHandRightOutline,
    IoTimeOutline,
    IoPersonOutline,
    IoSparklesOutline,
    IoAlertCircleOutline
} from 'react-icons/io5';
import { formatDistanceToNow, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth, postWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseVertical from '../components/AdSenseVertical';
import AdSenseInline from '../components/AdSenseInline';
import { scrollToTop } from '../utils/scrollUtils';


const PrayerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [prayer, setPrayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otherPrayers, setOtherPrayers] = useState([]);
    const [loadingOthers, setLoadingOthers] = useState(false);

    // Comment form state
    const [commentText, setCommentText] = useState('');
    const [commentAnonymous, setCommentAnonymous] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Fetch single prayer
    const fetchPrayer = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchWithAuth(`/api/doa-bersama/${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                setPrayer(data.data);
            } else {
                setError(data.message || 'Doa tidak ditemukan');
            }
        } catch (err) {
            console.error('Error fetching prayer detail:', err);
            setError('Gagal memuat detail doa. Silakan periksa koneksi internet Anda.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Fetch other prayers for recommendation
    const fetchOtherPrayers = useCallback(async () => {
        try {
            setLoadingOthers(true);
            const response = await fetchWithAuth('/api/doa-bersama?sort=latest&per_page=5');
            const data = await response.json();
            if (data.success && data.data?.data) {
                // Exclude the current prayer
                const filtered = data.data.data.filter(p => String(p.id) !== String(id)).slice(0, 4);
                setOtherPrayers(filtered);
            }
        } catch (err) {
            console.error('Error fetching recommended prayers:', err);
        } finally {
            setLoadingOthers(false);
        }
    }, [id]);

    useEffect(() => {
        scrollToTop();
        fetchPrayer();
        fetchOtherPrayers();
    }, [fetchPrayer, fetchOtherPrayers]);


    // Handle Amin toggle
    const handleAminToggle = async () => {
        try {
            const response = await postWithAuth(`/api/doa-bersama/${prayer.id}/amin`);
            const data = await response.json();

            if (data.success) {
                setPrayer(prev => ({
                    ...prev,
                    user_has_amin: data.data.user_has_amin,
                    amin_count: data.data.amin_count
                }));
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Gagal mengubah status amin');
            }
        } catch (err) {
            console.error('Gagal mengaminkan doa:', err);
            toast.error('Terjadi kesalahan saat mengaminkan');
        }
    };

    // Handle comment submit
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setSubmittingComment(true);
            const response = await postWithAuth(`/api/doa-bersama/${prayer.id}/comments`, {
                content: commentText,
                is_anonymous: !user ? true : commentAnonymous
            });
            const data = await response.json();

            if (data.success) {
                setPrayer(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), data.data],
                    comment_count: (prev.comment_count || 0) + 1
                }));
                setCommentText('');
                setCommentAnonymous(false);
                toast.success(data.message || 'Doa balasan berhasil dikirim');
            } else {
                toast.error(data.message || 'Gagal mengirim komentar');
            }
        } catch (err) {
            console.error('Gagal mengirim komentar:', err);
            toast.error('Gagal mengirim komentar');
        } finally {
            setSubmittingComment(false);
        }
    };

    const authorName = prayer?.is_anonymous ? 'Hamba Allah' : (prayer?.user?.name || 'Saudara Seiman');
    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/doa-bersama/${prayer?.id || id}` 
        : `https://indoquran.web.id/doa-bersama/${prayer?.id || id}`;

    const handleShareWhatsapp = () => {
        if (!prayer) return;
        const shareText = `🤲 Doa dari ${authorName}\n\n"${prayer.content}"\n\nAmin ya Rabbal Alamin 🤲\n\nIkut mengaminkan atau titipkan doa bersama di IndoQuran:\n${shareUrl}\n\n- IndoQuran (https://indoquran.web.id)`;
        const encoded = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    const formatTimeAgo = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { 
                addSuffix: true, 
                locale: idLocale 
            });
        } catch {
            return 'beberapa waktu lalu';
        }
    };

    const formatFullDate = (dateString) => {
        try {
            return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: idLocale });
        } catch {
            return '';
        }
    };

    const getCategoryBadgeClass = (category) => {
        switch (category?.toLowerCase()) {
            case 'kesehatan':
                return 'bg-rose-50 text-rose-700 border-rose-200/80';
            case 'keluarga':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
            case 'pekerjaan':
                return 'bg-blue-50 text-blue-700 border-blue-200/80';
            case 'pendidikan':
                return 'bg-purple-50 text-purple-700 border-purple-200/80';
            case 'keuangan':
                return 'bg-amber-50 text-amber-700 border-amber-200/80';
            case 'perjalanan':
                return 'bg-teal-50 text-teal-700 border-teal-200/80';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm text-gray-600">Memuat doa...</p>
                </div>
            </div>
        );
    }

    // Error State / Not Found
    if (error || !prayer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/40 py-16 px-4">
                <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                        <IoAlertCircleOutline className="w-9 h-9" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Doa Tidak Ditemukan</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        {error || 'Doa yang Anda cari mungkin telah dihapus atau link tidak valid.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/doa-bersama')}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm shadow-sm"
                        >
                            Kembali ke Doa Bersama
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const prayerSnippet = prayer.content ? prayer.content.substring(0, 140) + (prayer.content.length > 140 ? '...' : '') : '';
    const seoTitle = `Doa dari ${authorName}: "${prayer.title || prayerSnippet.substring(0, 45)}" - Doa Bersama | IndoQuran`;
    const seoDesc = `"${prayerSnippet}" - Mari bersama-sama mengaminkan doa dari ${authorName} di komunitas Doa Bersama IndoQuran.`;

    return (
        <>
            <SEOHead 
                title={seoTitle}
                description={seoDesc}
                keywords={`doa bersama, doa ${authorName}, doa islam, amin doa, ${prayer.category || 'doa online'}, komunitas doa`}
                canonicalUrl={shareUrl}
                ogType="article"
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/50 py-4 sm:py-8">
                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-4xl" labelText="IKLAN" className="my-4 sm:my-6" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Navigation Header / Breadcrumbs */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <Link
                            to="/doa-bersama"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 bg-white border border-green-200/80 px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-green-50/80 transition-all"
                        >
                            <IoArrowBackOutline className="w-4 h-4" />
                            <span>Kembali ke Doa Bersama</span>
                        </Link>

                        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                            Doa Bersama IndoQuran
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Prayer Column */}
                        <main className="lg:col-span-8 space-y-6">
                            {/* Main Prayer Card */}
                            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/50 to-transparent rounded-bl-full pointer-events-none" />

                                {/* Header Info */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm">
                                        {prayer.is_anonymous ? '🤲' : prayer.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                                {authorName}
                                            </h1>
                                            {prayer.category && (
                                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${getCategoryBadgeClass(prayer.category)}`}>
                                                    {prayer.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <IoTimeOutline className="w-3.5 h-3.5 text-gray-400" />
                                                {formatTimeAgo(prayer.created_at)}
                                            </span>
                                            <span>•</span>
                                            <span>{formatFullDate(prayer.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title if exists */}
                                {prayer.title && prayer.title !== prayer.content && (
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                                        {prayer.title}
                                    </h2>
                                )}

                                {/* Main Prayer Text with Spiritual Quotation Style */}
                                <div className="bg-gradient-to-br from-green-50/40 via-emerald-50/20 to-transparent rounded-2xl p-5 sm:p-6 border border-green-100/80 mb-6">
                                    <div className="text-emerald-700 text-3xl font-serif mb-1 leading-none select-none opacity-60">
                                        “
                                    </div>
                                    <p className="text-gray-800 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-normal">
                                        {prayer.content}
                                    </p>
                                    <div className="text-right text-emerald-700 text-3xl font-serif mt-1 leading-none select-none opacity-60">
                                        ”
                                    </div>
                                </div>

                                {/* Actions Bar: Amin + Share */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    {/* Big Amin Button */}
                                    <button
                                        onClick={handleAminToggle}
                                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-xs cursor-pointer ${
                                            prayer.user_has_amin
                                                ? 'bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100'
                                                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                                        }`}
                                    >
                                        {prayer.user_has_amin ? (
                                            <>
                                                <IoHeart className="w-5 h-5 text-rose-500 scale-110" />
                                                <span>Telah Diaminkan ({prayer.amin_count || 0})</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoHeartOutline className="w-5 h-5" />
                                                <span>Aminkan Doa Ini ({prayer.amin_count || 0})</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Share Button (WhatsApp Only) */}
                                    <button
                                        onClick={handleShareWhatsapp}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs font-medium text-xs sm:text-sm cursor-pointer"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <IoLogoWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                        <span>Bagikan ke WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            {/* In-Content Inline Ad (Detik.com Pattern) */}
                            <AdSenseInline labelText="IKLAN" minHeight="100px" />

                            {/* Comments Section */}
                            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
                                <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <IoChatbubbleEllipsesOutline className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Doa Balasan & Dukungan
                                        </h3>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                                        {prayer.comments?.length || prayer.comment_count || 0} Balasan
                                    </span>
                                </div>

                                {/* Comment Form */}
                                    <form onSubmit={handleCommentSubmit} className="mb-8">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-xs">
                                                {user ? (user.name?.charAt(0)?.toUpperCase() || 'U') : '🤲'}
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder={user ? "Tuliskan doa kebaikan, dukungan, atau balasan amin..." : "Tuliskan doa kebaikan atau balasan amin sebagai Hamba Allah..."}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-sm text-gray-800 placeholder-gray-400 transition-all resize-none"
                                                    maxLength={1000}
                                                />
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                                                    {user ? (
                                                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={commentAnonymous}
                                                                onChange={(e) => setCommentAnonymous(e.target.checked)}
                                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                            />
                                                            <span>Kirim sebagai Hamba Allah</span>
                                                        </label>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200/70">
                                                            <span>🤲 Mengirim sebagai Hamba Allah (tanpa akun)</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-[11px] text-gray-400 mr-2">
                                                            {commentText.length}/1000
                                                        </span>
                                                        {commentText.trim() && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setCommentText('')}
                                                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                                                            >
                                                                Batal
                                                            </button>
                                                        )}
                                                        <button
                                                            type="submit"
                                                            disabled={submittingComment || !commentText.trim()}
                                                            className="px-5 py-2 bg-green-600 text-white rounded-full text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            {submittingComment ? 'Mengirim...' : 'Kirim Doa Balasan'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                {/* Comments List */}
                                {prayer.comments && prayer.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {prayer.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3.5">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs flex-shrink-0 shadow-2xs">
                                                    {comment.is_anonymous ? '🤲' : comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-gray-50/90 rounded-2xl px-4 py-3 border border-gray-100">
                                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                                            <span className="text-xs font-bold text-gray-900">
                                                                {comment.is_anonymous ? 'Hamba Allah' : comment.user?.name || 'Anonymous'}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {formatTimeAgo(comment.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <IoChatbubbleEllipsesOutline className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-600">Belum ada doa balasan</p>
                                        <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama menuliskan kata-kata kebaikan dan doa penguat!</p>
                                    </div>
                                )}
                            </div>
                        </main>

                        {/* Sidebar Column */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Sticky Sidebar AdSense Unit (Detik.com Pattern) */}
                            <AdSenseVertical 
                                adSlot="9021708920"
                                labelText="IKLAN"
                                minHeight="250px"
                                isSticky={false}
                            />

                            {/* CTA Box: Titip Doa Sendiri */}
                            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                                <div className="relative z-10 space-y-3">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
                                        <IoSparklesOutline className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Titip Doa</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        Punya Hajat atau Permintaan Doa?
                                    </h3>
                                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                                        Tuliskan doa kebaikan Anda agar dapat diaminkan oleh ribuan saudara seiman di seluruh Indonesia.
                                    </p>
                                    <Link
                                        to="/doa-bersama"
                                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm pt-2.5"
                                    >
                                        Kirim Doa Bersama Sekarang
                                    </Link>
                                </div>
                            </div>

                            {/* Other Prayers Recommendations */}
                            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                        <IoHandRightOutline className="w-4 h-4 text-emerald-600" />
                                        <span>Doa Saudara Lainnya</span>
                                    </h3>
                                    <Link to="/doa-bersama" className="text-xs text-emerald-600 font-semibold hover:underline">
                                        Semua →
                                    </Link>
                                </div>

                                {loadingOthers ? (
                                    <div className="py-4 text-center">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                ) : otherPrayers.length > 0 ? (
                                    <div className="space-y-3">
                                        {otherPrayers.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={`/doa-bersama/${item.id}`}
                                                className="block p-3 rounded-xl bg-gray-50/80 hover:bg-green-50/50 border border-gray-100 hover:border-green-200 transition-all group"
                                            >
                                                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                                                    <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                                                        {item.is_anonymous ? 'Hamba Allah' : item.user?.name || 'Saudara'}
                                                    </span>
                                                    <span>{formatTimeAgo(item.created_at)}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {item.content}
                                                </p>
                                                <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <IoHeartOutline className="w-3 h-3 text-red-400" />
                                                        {item.amin_count || 0} Amin
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <IoChatbubbleEllipsesOutline className="w-3 h-3 text-blue-400" />
                                                        {item.comment_count || 0} Komentar
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 py-2">Belum ada doa lain yang dimuat.</p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrayerDetailPage;
