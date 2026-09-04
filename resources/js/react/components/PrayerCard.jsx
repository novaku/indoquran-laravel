import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { 
    IoHeartOutline, 
    IoHeart, 
    IoChatbubbleEllipsesOutline, 
    IoLogoWhatsapp, 
    IoOpenOutline,
    IoEllipsisHorizontalOutline
} from 'react-icons/io5';

const PrayerCard = ({ prayer, user, onAminToggle, onCommentSubmit }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentAnonymous, setCommentAnonymous] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const handleAminClick = () => {
        onAminToggle(prayer.id);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        const success = await onCommentSubmit(prayer.id, {
            content: commentText,
            is_anonymous: commentAnonymous
        });

        if (success) {
            setCommentText('');
            setCommentAnonymous(false);
        }
        setSubmittingComment(false);
    };

    const formatTimeAgo = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { 
                addSuffix: true, 
                locale: id 
            });
        } catch (error) {
            return 'beberapa waktu lalu';
        }
    };

    const authorName = prayer.is_anonymous ? 'Hamba Allah' : (prayer.user?.name || 'Saudara Seiman');
    const prayerUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/doa-bersama/${prayer.id}` 
        : `https://indoquran.web.id/doa-bersama/${prayer.id}`;

    const handleShareWhatsapp = () => {
        const shareText = `🤲 Doa dari ${authorName}\n\n"${prayer.content}"\n\nAmin ya Rabbal Alamin 🤲\n\nIkut mengaminkan atau titipkan doa bersama:\n${prayerUrl}\n\n- IndoQuran (https://indoquran.web.id)`;
        const encodedText = encodeURIComponent(shareText);
        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-300 border border-gray-100/80">
            {/* Prayer Header */}
            <div className="flex items-start gap-3 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-sm">
                    {prayer.is_anonymous ? '🤲' : prayer.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                
                {/* User Info & Content */}
                <div className="flex-1 min-w-0">
                    {/* Name, Category & Time */}
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 text-base">
                                {authorName}
                            </h4>
                            {prayer.category && prayer.category !== 'umum' && (
                                <span className="px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 rounded-full border border-green-200/60 capitalize">
                                    {prayer.category}
                                </span>
                            )}
                        </div>
                        <span className="text-gray-400 text-xs">
                            {formatTimeAgo(prayer.created_at)}
                        </span>
                    </div>
                    
                    {/* Prayer Content */}
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] mt-1">
                        {prayer.content}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 pl-[60px]">
                <div className="flex items-center gap-6">
                    {/* Like/Heart Button */}
                    <button
                        onClick={handleAminClick}
                        className={`group flex items-center gap-1.5 transition-colors cursor-pointer ${
                            prayer.user_has_amin ? 'text-red-500 font-semibold' : 'text-gray-500 hover:text-red-500'
                        }`}
                        title={prayer.user_has_amin ? 'Batalkan amin' : 'Klik untuk memberikan amin (Hamba Allah)'}
                    >
                        {prayer.user_has_amin ? (
                            <IoHeart className="w-5 h-5 text-red-500 scale-110 transition-transform" />
                        ) : (
                            <IoHeartOutline className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-xs">
                            {prayer.amin_count || 0} Amin
                        </span>
                    </button>

                    {/* Comment Button */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="group flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                        title="Lihat komentar"
                    >
                        <IoChatbubbleEllipsesOutline className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs">
                            {prayer.comment_count || 0} Komentar
                        </span>
                    </button>

                    {/* Share Button (WhatsApp Only) */}
                    <button
                        onClick={handleShareWhatsapp}
                        className="group flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Bagikan ke WhatsApp"
                    >
                        <IoLogoWhatsapp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs">WhatsApp</span>
                    </button>
                </div>

                {/* Direct Link to Single Prayer Page */}
                <Link
                    to={`/doa-bersama/${prayer.id}`}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition-colors"
                    title="Buka halaman doa tersendiri"
                >
                    <span>Detail</span>
                    <IoOpenOutline className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 pl-[60px]">
                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-6">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-2xs">
                                {user ? (user.name?.charAt(0)?.toUpperCase() || 'U') : '🤲'}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={user ? "Tulis komentar atau doa balasan..." : "Tulis doa balasan sebagai Hamba Allah..."}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-800 placeholder-gray-400"
                                    maxLength={1000}
                                />
                                {commentText.trim() && (
                                    <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                                        {user ? (
                                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={commentAnonymous}
                                                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                                <span>Kirim sebagai Hamba Allah</span>
                                            </label>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-medium rounded-full border border-emerald-200/70">
                                                <span>🤲 Mengirim sebagai Hamba Allah</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                type="button"
                                                onClick={() => setCommentText('')}
                                                className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingComment}
                                                className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                            >
                                                {submittingComment ? 'Mengirim...' : 'Kirim'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    {prayer.comments && prayer.comments.length > 0 ? (
                        <div className="space-y-4">
                            {prayer.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                                        {comment.is_anonymous ? '🤲' : comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-semibold text-gray-900">
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
                        <div className="text-center py-6">
                            <p className="text-xs text-gray-500">Belum ada komentar</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Jadilah yang pertama menuliskan doa balasan!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrayerCard;

