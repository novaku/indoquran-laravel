import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser, FaUserSecret, FaTrash, FaPaperPlane, FaComments, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getWithAuth, postWithAuth } from '../utils/apiUtils';

const ArticleCommentsSection = ({ articleSlug, articleId, isAdmin = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (articleSlug) {
      fetchComments();
    }
  }, [articleSlug]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await getWithAuth(`/api/articles/${articleSlug}/comments`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching article comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Silakan tuliskan komentar Anda.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        content: content.trim(),
        is_anonymous: isAnonymous
      };

      if (!user) {
        if (!isAnonymous && name.trim()) {
          payload.name = name.trim();
        }
        if (!isAnonymous && email.trim()) {
          payload.email = email.trim();
        }
      }

      const response = await postWithAuth(`/api/articles/${articleSlug}/comments`, payload);
      const data = await response.json();

      if (data.success && data.data) {
        setComments(prev => [data.data, ...prev]);
        setContent('');
        if (!user) {
          setName('');
          setEmail('');
          setIsAnonymous(false);
        }
        toast.success(data.message || 'Komentar berhasil dikirim!');
      } else {
        toast.error(data.message || 'Gagal mengirim komentar.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Terjadi kesalahan saat mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to obtain CSRF token for admin delete
  const getCsrfToken = async () => {
    try {
      const csrfResponse = await fetch('/admin/csrf-token', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        return csrfData.csrf_token;
      }
    } catch (err) {
      console.error('Error fetching csrf token:', err);
    }
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  const handleDeleteComment = async (commentId, authorName) => {
    if (!window.confirm(`Hapus komentar dari "${authorName}"?`)) {
      return;
    }

    try {
      setDeletingId(commentId);
      const csrfToken = await getCsrfToken();
      const authToken = localStorage.getItem('auth_token');

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/admin/article-comments/${commentId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Komentar berhasil dihapus.');
      } else {
        toast.error(data.message || 'Gagal menghapus komentar.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Terjadi kesalahan saat menghapus komentar.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="my-10 pt-8 border-t border-gray-200 dark:border-gray-800" id="comments">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg shadow-2xs">
            <FaComments />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Komentar & Diskusi</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sampaikan tanggapan, doa, atau pertanyaan Anda mengenai artikel ini
            </p>
          </div>
        </div>
      </div>

      {/* Form Comment */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-xs mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User state banner */}
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs">
              <div className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Masuk sebagai: </span>
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">{user.name}</span>
                </div>
              </div>

              {/* Checkbox Anonim for logged-in user */}
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <FaUserSecret className={isAnonymous ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>Kirim sebagai Anonim (Hamba Allah)</span>
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-3.5 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <FaUser className="text-emerald-600" />
                  <span>Kirim Komentar Pengunjung</span>
                </span>

                {/* Option to be anonymous */}
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <FaUserSecret className={isAnonymous ? 'text-emerald-600' : 'text-gray-400'} />
                    <span>Kirim sebagai Anonim (Hamba Allah)</span>
                  </span>
                </label>
              </div>

              {/* Guest name & email inputs (only active if not anonymous) */}
              {!isAnonymous ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Nama (Opsional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Anda (cth: Fulan)"
                      maxLength={100}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Email (Opsional, tidak dipublikasikan)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      maxLength={150}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-1 px-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                  <span>🤲</span>
                  <span>Komentar akan ditampilkan sebagai <strong>"Hamba Allah"</strong>. Nama & email Anda tidak akan dicatat atau dipublikasikan.</span>
                </div>
              )}
            </div>
          )}

          {/* Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan komentar, pertanyaan, atau tanggapan Anda di sini..."
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-all resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 px-1">
              <span>{isAnonymous ? 'Mode: Anonim (Hamba Allah)' : (user ? `Mode: Akun (${user.name})` : (name.trim() ? `Mode: ${name}` : 'Mode: Hamba Allah'))}</span>
              <span>{content.length}/2000</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {content.trim() && (
              <button
                type="button"
                onClick={() => setContent('')}
                className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <FaPaperPlane className="text-[11px]" />
              <span>{submitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mb-2"></div>
            <p>Memuat komentar...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((item) => {
            const isAnon = item.is_anonymous || item.author_name === 'Hamba Allah';
            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs hover:border-emerald-200 dark:hover:border-emerald-900/60 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs ${
                    isAnon
                      ? 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900 text-emerald-800 dark:text-emerald-300'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200'
                  }`}>
                    {isAnon ? '🤲' : (item.author_name?.charAt(0)?.toUpperCase() || 'U')}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {item.author_name}
                        </span>
                        {isAnon ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Anonim
                          </span>
                        ) : (
                          item.user_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Member Terdaftar
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span>{item.time_ago}</span>

                        {/* Admin Delete Action button directly from article */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(item.id, item.author_name)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-colors cursor-pointer border border-red-200 dark:border-red-900/60"
                            title="Hapus komentar ini (Aksi Admin)"
                          >
                            <FaTrash className="text-[10px]" />
                            <span>{deletingId === item.id ? 'Menghapus...' : 'Hapus'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-4 bg-gray-50/60 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <FaComments className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Belum ada komentar</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
              Jadilah yang pertama menuliskan tanggapan, doa, atau pertanyaan untuk artikel ini!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticleCommentsSection;
