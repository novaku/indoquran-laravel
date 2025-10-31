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

    return (
        <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-300">
            {/* Prayer Header */}
            <div className="flex items-start gap-3 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-sm">
                    {prayer.is_anonymous ? '🤲' : prayer.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                
                {/* User Info & Content */}
                <div className="flex-1 min-w-0">
                    {/* Name & Time */}
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-base">
                            {prayer.is_anonymous ? 'Hamba Allah' : prayer.user?.name || 'Anonymous'}
                        </h4>
                        <span className="text-gray-500 text-sm">
                            {formatTimeAgo(prayer.created_at)}
                        </span>
                    </div>
                    
                    {/* Prayer Content */}
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                        {prayer.content}
                    </p>
                </div>
            </div>

            {/* Action Buttons - Simple Icons */}
            <div className="flex items-center gap-6 pl-[60px]">
                {/* Like/Heart Button */}
                <button
                    onClick={handleAminClick}
                    disabled={!user}
                    className="group flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!user ? 'Login untuk memberikan amin' : 'Klik untuk memberikan amin'}
                >
                    <svg 
                        className={`w-5 h-5 transition-all ${prayer.user_has_amin ? 'fill-red-500 text-red-500' : 'fill-none group-hover:fill-red-100'}`} 
                        stroke="currentColor" 
                        strokeWidth={2} 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Comment Button */}
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="group flex items-center gap-1.5 text-gray-500 hover:text-green-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>

                {/* Share Button */}
                <button
                    onClick={() => {
                        const shareText = `🤲 Doa dari ${prayer.is_anonymous ? 'Hamba Allah' : prayer.user?.name}\n\n${prayer.content}\n\nAmin ya Rabbal Alamin 🤲\n\n- Doa Bersama IndoQuran`;
                        const encodedText = encodeURIComponent(shareText);
                        const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                        window.open(whatsappUrl, '_blank');
                    }}
                    className="group flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Bagikan doa"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </button>

                {/* More Options */}
                <button className="group flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 pl-[60px]">
                    {/* Comment Form */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Tulis komentar..."
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-800 placeholder-gray-400"
                                        maxLength={1000}
                                    />
                                    {commentText.trim() && (
                                        <div className="flex items-center justify-end gap-3 mt-3">
                                            <button
                                                type="button"
                                                onClick={() => setCommentText('')}
                                                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingComment}
                                                className="px-5 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submittingComment ? 'Mengirim...' : 'Kirim'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="mb-6 bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Silakan login untuk berkomentar
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <a 
                                    href="/masuk" 
                                    className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    Login
                                </a>
                                <a 
                                    href="/auth/register" 
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Daftar
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    {prayer.comments && prayer.comments.length > 0 ? (
                        <div className="space-y-4">
                            {prayer.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                        {comment.is_anonymous ? '🤲' : comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {comment.is_anonymous ? 'Hamba Allah' : comment.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500">Belum ada komentar</p>
                            <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama berkomentar!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrayerCard;
