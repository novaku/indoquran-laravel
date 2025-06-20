import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

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

    const getCategoryLabel = (category) => {
        const categories = {
            umum: 'Umum',
            kesehatan: 'Kesehatan',
            keluarga: 'Keluarga',
            pekerjaan: 'Pekerjaan',
            pendidikan: 'Pendidikan',
            keuangan: 'Keuangan',
            perjalanan: 'Perjalanan',
            lainnya: 'Lainnya'
        };
        return categories[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            umum: 'bg-gray-100 text-gray-800',
            kesehatan: 'bg-green-100 text-green-800',
            keluarga: 'bg-pink-100 text-pink-800',
            pekerjaan: 'bg-blue-100 text-blue-800',
            pendidikan: 'bg-purple-100 text-purple-800',
            keuangan: 'bg-yellow-100 text-yellow-800',
            perjalanan: 'bg-indigo-100 text-indigo-800',
            lainnya: 'bg-orange-100 text-orange-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center text-sm text-black">
                            <div className="w-10 h-10 bg-gradient-to-r from-islamic-green to-islamic-gold rounded-full flex items-center justify-center text-black font-medium text-sm shadow-md">
                                {prayer.is_anonymous ? '🤲' : prayer.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3">
                                <span className="font-semibold text-black block">
                                    {prayer.is_anonymous ? 'Hamba Allah' : prayer.user?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-black">
                                    {formatTimeAgo(prayer.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2 leading-tight">
                        {prayer.title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryColor(prayer.category)}`}>
                        {getCategoryLabel(prayer.category)}
                    </span>
                    {prayer.is_featured && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm">
                            ⭐ Unggulan
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <p className="text-black leading-relaxed whitespace-pre-wrap">
                    {prayer.content}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                    {/* Amin Button */}
                    <button
                        onClick={handleAminClick}
                        disabled={!user}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                            prayer.user_has_amin === true
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-100 text-black hover:bg-green-600 hover:text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={!user ? 'Login untuk memberikan amin' : 'Klik untuk memberikan amin'}
                    >
                        <span className="text-base">🤲</span>
                        <span>
                            Amin
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            prayer.user_has_amin === true
                                ? 'bg-white text-green-600'
                                : 'bg-white bg-opacity-20 text-black'
                        }`}>
                            {prayer.amin_count || 0}
                        </span>
                    </button>

                    {/* Comments Button */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-green-600 hover:text-white transition-all duration-200 font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>
                            Komentar
                        </span>
                        <span className="bg-white bg-opacity-20 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                            {prayer.comment_count || 0}
                        </span>
                    </button>
                </div>

                {/* Share Button */}
                <button 
                    onClick={() => {
                        const shareText = `🤲 ${prayer.title}\n\n${prayer.content}\n\n🔗 Bergabung di Doa Bersama: ${window.location.origin}/doa-bersama\n\n- Doa Bersama IndoQuran`;
                        const encodedText = encodeURIComponent(shareText);
                        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                        window.open(whatsappUrl, '_blank');
                    }}
                    className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 font-medium text-sm"
                    title="Bagikan doa ini"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4">
                    {/* Comment Form */}
                    {user ? (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center mb-3">
                                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm font-medium text-black">Tambahkan Komentar atau Dukungan</span>
                            </div>
                            <form onSubmit={handleCommentSubmit} encType="application/x-www-form-urlencoded">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Tulis dukungan, doa, atau kata semangat untuk saudara kita..."
                                            rows={3}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-sm text-black"
                                            maxLength={1000}
                                        />
                                        <div className="flex items-center justify-between mt-3">
                                            <label className="flex items-center text-xs text-black">
                                                <input
                                                    type="checkbox"
                                                    checked={commentAnonymous}
                                                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                                                    className="h-3 w-3 text-green-600 focus:ring-green-500 rounded mr-2"
                                                />
                                                Kirim sebagai anonim (Hamba Allah)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-black">
                                                    {commentText.length}/1000
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={!commentText.trim() || submittingComment}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                                                >
                                                    {submittingComment ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Mengirim...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                            Kirim Komentar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-sm font-semibold text-black">
                                    Login Diperlukan
                                </span>
                            </div>
                            <p className="text-sm text-black text-center mb-4">
                                Untuk memberikan komentar atau dukungan pada doa ini, silakan login terlebih dahulu.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <a 
                                    href="/masuk" 
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-700 transition-all duration-200"
                                >
                                    🔑 Login
                                </a>
                                <span className="text-black text-sm font-medium">atau</span>
                                <a 
                                    href="/auth/register" 
                                    className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-50 transition-all duration-200 border border-orange-600"
                                >
                                    📝 Daftar
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {prayer.comments && prayer.comments.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12v-2a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H7l-4 4v-4H5a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-black">
                                        Dukungan dan Doa ({prayer.comments.length})
                                    </span>
                                </div>
                                {prayer.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 shadow-md">
                                            {comment.is_anonymous ? '🤲' : comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {comment.is_anonymous ? 'Hamba Allah' : comment.user?.name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {formatTimeAgo(comment.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">
                                    Belum ada komentar
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Jadilah yang pertama memberi dukungan dan doa!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrayerCard;
