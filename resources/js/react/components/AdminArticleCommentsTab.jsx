import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
    ChatBubbleBottomCenterTextIcon, 
    TrashIcon, 
    MagnifyingGlassIcon, 
    ArrowTopRightOnSquareIcon,
    ArrowPathIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentTextIcon,
    FolderIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const AdminArticleCommentsTab = ({ initialArticleId = null }) => {
    // View mode: 'grouped' (default) or 'flat'
    const [viewMode, setViewMode] = useState('grouped');
    
    // Grouped data (articles with comments_list)
    const [articlesWithComments, setArticlesWithComments] = useState([]);
    
    // Flat data (single comments)
    const [flatComments, setFlatComments] = useState([]);
    
    const [totalCommentsCount, setTotalCommentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [articleIdFilter, setArticleIdFilter] = useState(initialArticleId || '');
    // Expanded articles map - default is empty (all articles collapsed by default)
    const [expandedArticles, setExpandedArticles] = useState(
        initialArticleId ? { [initialArticleId]: true } : {}
    );
    const [perPage, setPerPage] = useState(5);
    const [sortBy, setSortBy] = useState('comments_count');
    
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 5,
        from: 0,
        to: 0
    });
    
    const [deletingId, setDeletingId] = useState(null);
    const [deletingArticleId, setDeletingArticleId] = useState(null);

    // Get CSRF Token
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
        } catch (error) {
            console.error('Error getting CSRF token:', error);
        }
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const fetchData = async (
        page = 1, 
        search = searchQuery, 
        articleId = articleIdFilter, 
        mode = viewMode, 
        perP = perPage, 
        sort = sortBy
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                page: page.toString(),
                per_page: perP.toString(),
                group_by: mode === 'grouped' ? 'article' : 'none'
            });
            if (search) params.append('search', search);
            if (articleId) params.append('article_id', articleId);
            if (sort) params.append('sort_by', sort);

            const csrfToken = await getCsrfToken();
            const authToken = localStorage.getItem('auth_token');

            const headers = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken
            };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`/api/admin/article-comments?${params.toString()}`, {
                method: 'GET',
                headers,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Gagal memuat data komentar');
            }

            const data = await response.json();
            
            if (mode === 'grouped') {
                setArticlesWithComments(data.data || []);
                setTotalCommentsCount(data.total_comments || 0);
            } else {
                setFlatComments(data.data || []);
                setTotalCommentsCount(data.total || 0);
            }

            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                total: data.total || 0,
                per_page: data.per_page || perP,
                from: data.from || 0,
                to: data.to || 0
            });
        } catch (error) {
            console.error('Error fetching admin article comments:', error);
            toast.error('Gagal mengambil data komentar artikel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, searchQuery, articleIdFilter, viewMode, perPage, sortBy);
    }, [articleIdFilter, viewMode, perPage, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchData(1, searchQuery, articleIdFilter, viewMode, perPage, sortBy);
    };

    const toggleArticleExpand = (artId) => {
        setExpandedArticles(prev => ({
            ...prev,
            [artId]: !prev[artId]
        }));
    };

    const anyExpanded = articlesWithComments.some(art => !!expandedArticles[art.id]);

    const toggleAllExpand = () => {
        if (anyExpanded) {
            // Close all
            setExpandedArticles({});
        } else {
            // Open all
            const nextState = {};
            articlesWithComments.forEach(art => {
                nextState[art.id] = true;
            });
            setExpandedArticles(nextState);
        }
    };

    // Delete single comment
    const handleDeleteSingleComment = async (commentId, authorName, articleTitle, articleId) => {
        const confirmMessage = `Apakah Anda yakin ingin menghapus komentar dari "${authorName}" pada artikel "${articleTitle || 'ini'}"?`;
        if (!window.confirm(confirmMessage)) {
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
                toast.success('Komentar berhasil dihapus.');

                // Update state in grouped mode
                setArticlesWithComments(prevArticles => {
                    return prevArticles
                        .map(art => {
                            if (art.id === articleId) {
                                const updatedList = (art.comments_list || []).filter(c => c.id !== commentId);
                                return {
                                    ...art,
                                    comments_list: updatedList,
                                    comments_count: Math.max(0, (art.comments_count || 1) - 1)
                                };
                            }
                            return art;
                        })
                        .filter(art => (art.comments_list && art.comments_list.length > 0) || art.comments_count > 0);
                });

                // Update flat mode
                setFlatComments(prev => prev.filter(c => c.id !== commentId));
                setTotalCommentsCount(prev => Math.max(0, prev - 1));
            } else {
                toast.error(data.message || 'Gagal menghapus komentar');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Terjadi kesalahan saat menghapus komentar');
        } finally {
            setDeletingId(null);
        }
    };

    // Delete all comments for an article
    const handleDeleteAllCommentsForArticle = async (articleId, articleTitle, count) => {
        const confirmMessage = `PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA (${count}) komentar pada artikel "${articleTitle}"?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setDeletingArticleId(articleId);
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

            const response = await fetch(`/api/admin/article-comments/article/${articleId}`, {
                method: 'DELETE',
                headers,
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(data.message || 'Semua komentar artikel berhasil dihapus');
                // Remove article card from grouped view
                setArticlesWithComments(prev => prev.filter(art => art.id !== articleId));
                setTotalCommentsCount(prev => Math.max(0, prev - count));
            } else {
                toast.error(data.message || 'Gagal menghapus komentar artikel');
            }
        } catch (error) {
            console.error('Error deleting article comments:', error);
            toast.error('Terjadi kesalahan saat menghapus komentar artikel');
        } finally {
            setDeletingArticleId(null);
        }
    };

    // Render interactive numbered page buttons
    const renderPageNumbers = () => {
        const { current_page, last_page } = pagination;
        if (!last_page || last_page <= 0) return null;

        if (last_page === 1) {
            return (
                <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    1
                </span>
            );
        }

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, current_page - 2);
        let endPage = Math.min(last_page, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    type="button"
                    onClick={() => fetchData(1, searchQuery, articleIdFilter, viewMode, perPage, sortBy)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 transition-colors cursor-pointer"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots-start" className="px-0.5 text-gray-400 text-xs">...</span>);
            }
        }

        for (let p = startPage; p <= endPage; p++) {
            const isActive = p === current_page;
            pages.push(
                <button
                    key={p}
                    type="button"
                    onClick={() => fetchData(p, searchQuery, articleIdFilter, viewMode, perPage, sortBy)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                            ? 'bg-emerald-600 text-white shadow-xs font-bold border border-emerald-600'
                            : 'text-gray-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
                    }`}
                >
                    {p}
                </button>
            );
        }

        if (endPage < last_page) {
            if (endPage < last_page - 1) {
                pages.push(<span key="dots-end" className="px-0.5 text-gray-400 text-xs">...</span>);
            }
            pages.push(
                <button
                    key={last_page}
                    type="button"
                    onClick={() => fetchData(last_page, searchQuery, articleIdFilter, viewMode, perPage, sortBy)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 transition-colors cursor-pointer"
                >
                    {last_page}
                </button>
            );
        }

        return pages;
    };

    // Render comprehensive pagination footer
    const renderPagination = (isGrouped = true) => {
        if (pagination.total === 0) return null;

        const { current_page, last_page, total, from, to } = pagination;
        const unitLabel = isGrouped ? 'judul artikel' : 'komentar';

        return (
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-2xs mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Information */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                    <span>
                        Menampilkan <span className="font-bold text-gray-900">{from || 0} - {to || 0}</span> dari{' '}
                        <span className="font-bold text-gray-900">{total}</span> {unitLabel}
                    </span>
                    {isGrouped && totalCommentsCount > 0 && (
                        <span className="text-gray-400">
                            • (Total <span className="font-semibold text-emerald-700">{totalCommentsCount}</span> komentar terdaftar)
                        </span>
                    )}
                </div>

                {/* Navigation and Page Numbers */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => fetchData(current_page - 1, searchQuery, articleIdFilter, viewMode, perPage, sortBy)}
                        disabled={current_page <= 1}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Sebelumnya
                    </button>

                    <div className="flex items-center gap-1">
                        {renderPageNumbers()}
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchData(current_page + 1, searchQuery, articleIdFilter, viewMode, perPage, sortBy)}
                        disabled={current_page >= last_page}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Filter Toolbar */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-emerald-600" />
                            <span>Moderasi Komentar Artikel</span>
                            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                {totalCommentsCount} Total Komentar
                            </span>
                            {viewMode === 'grouped' && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {pagination.total} Judul Artikel
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Kelola, tinjau, dan hapus komentar artikel yang dikelompokkan berdasarkan judul artikel
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        {/* Toggle View Mode */}
                        <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode('grouped')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                                    viewMode === 'grouped'
                                        ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Kelompokkan berdasarkan Judul Artikel"
                            >
                                <FolderIcon className="w-3.5 h-3.5" />
                                <span>Group by Artikel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('flat')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                                    viewMode === 'flat'
                                        ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Tampilkan semua komentar secara langsung"
                            >
                                <ListBulletIcon className="w-3.5 h-3.5" />
                                <span>Daftar Datar</span>
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchData(pagination.current_page, searchQuery, articleIdFilter, viewMode)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                            title="Segarkan data"
                        >
                            <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari berdasarkan judul artikel, nama pengirim, email, atau isi komentar..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                        Cari
                    </button>

                    {(searchQuery || articleIdFilter) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setArticleIdFilter('');
                                fetchData(1, '', '', viewMode, perPage, sortBy);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Sub-bar: Sort, Per-Page, and Collapse Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="font-medium">Urutkan:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    const newSort = e.target.value;
                                    setSortBy(newSort);
                                    fetchData(1, searchQuery, articleIdFilter, viewMode, perPage, newSort);
                                }}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value="comments_count">Komentar Terbanyak</option>
                                <option value="latest_comment">Komentar Terbaru</option>
                                <option value="title_asc">Judul Artikel (A - Z)</option>
                                <option value="title_desc">Judul Artikel (Z - A)</option>
                                <option value="latest_article">Artikel Terbaru</option>
                            </select>
                        </div>

                        {/* Per-Page Selector */}
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="font-medium">Tampilkan:</span>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    const newPerPage = Number(e.target.value);
                                    setPerPage(newPerPage);
                                    fetchData(1, searchQuery, articleIdFilter, viewMode, newPerPage, sortBy);
                                }}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                                <option value={5}>5 Judul per Halaman</option>
                                <option value={10}>10 Judul per Halaman</option>
                                <option value={20}>20 Judul per Halaman</option>
                                <option value={50}>50 Judul per Halaman</option>
                            </select>
                        </div>
                    </div>

                    {viewMode === 'grouped' && articlesWithComments.length > 0 && (
                        <button
                            type="button"
                            onClick={toggleAllExpand}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {anyExpanded ? (
                                <>
                                    <ChevronUpIcon className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Tutup Semua</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Buka Semua</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-16 text-center">
                    <LoadingSpinner />
                    <p className="text-xs text-gray-500 mt-2">Memuat komentar artikel...</p>
                </div>
            ) : viewMode === 'grouped' ? (
                /* ============================================================== */
                /* GROUP BY JUDUL ARTIKEL (PRIMARY VIEW)                           */
                /* ============================================================== */
                articlesWithComments.length > 0 ? (
                    <div className="space-y-5">
                        {articlesWithComments.map((article) => {
                            const isExpanded = !!expandedArticles[article.id];
                            const commentsList = article.comments_list || [];
                            const commentCount = article.comments_count || commentsList.length;

                            return (
                                <div
                                    key={article.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all"
                                >
                                    {/* Article Header Banner */}
                                    <div 
                                        onClick={() => toggleArticleExpand(article.id)}
                                        className={`bg-gradient-to-r from-emerald-50/70 via-gray-50/50 to-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none hover:bg-emerald-50/90 transition-colors ${
                                            isExpanded ? 'border-b border-gray-200/80' : ''
                                        }`}
                                    >
                                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                            {/* Expand/Collapse Chevron Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleArticleExpand(article.id);
                                                }}
                                                className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer mt-0.5 sm:mt-0 flex-shrink-0"
                                                title={isExpanded ? 'Tutup komentar' : 'Buka komentar'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronUpIcon className="w-5 h-5 text-emerald-700" />
                                                ) : (
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>

                                            <DocumentTextIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 hidden sm:block" />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a
                                                        href={`/artikel/${article.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="font-bold text-base text-gray-900 hover:text-emerald-700 transition-colors flex items-center gap-1.5 line-clamp-1"
                                                        title="Buka artikel di tab baru"
                                                    >
                                                        <span>{article.title}</span>
                                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                    </a>
                                                </div>
                                                {article.formatted_date && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        Dipublikasikan: {article.formatted_date}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Badges & Bulk Action */}
                                        <div className="flex items-center gap-2.5 self-end md:self-auto flex-shrink-0">
                                            {/* Total Comments Badge */}
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                                                <span>Total {commentCount} Komentar</span>
                                            </span>

                                            {/* Delete All comments of this article */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAllCommentsForArticle(article.id, article.title, commentCount);
                                                }}
                                                disabled={deletingArticleId === article.id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                title="Hapus seluruh komentar pada artikel ini"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                                <span>{deletingArticleId === article.id ? 'Menghapus...' : 'Hapus Semua'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comments under this article */}
                                    {isExpanded && (
                                        <div className="p-4 sm:p-6 divide-y divide-gray-100 space-y-4">
                                            {commentsList.length > 0 ? (
                                                commentsList.map((item) => {
                                                    const isAnon = item.is_anonymous || item.author_name === 'Hamba Allah';

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="pt-4 first:pt-0 group"
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                                
                                                                {/* Author & Meta */}
                                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-2xs ${
                                                                        isAnon ? 'bg-emerald-600' : 'bg-blue-600'
                                                                    }`}>
                                                                        {isAnon ? '🤲' : (item.author_name?.charAt(0)?.toUpperCase() || 'U')}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                            <span className="font-bold text-sm text-gray-900">
                                                                                {item.author_name}
                                                                            </span>

                                                                            {isAnon ? (
                                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                                    Anonim (Hamba Allah)
                                                                                </span>
                                                                            ) : item.user ? (
                                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                                    Member Terdaftar
                                                                                </span>
                                                                            ) : (
                                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                                                    Pengunjung
                                                                                </span>
                                                                            )}

                                                                            {(item.email || item.user?.email) && (
                                                                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                                                                    <EnvelopeIcon className="w-3 h-3 text-gray-400" />
                                                                                    <span>{item.email || item.user?.email}</span>
                                                                                </span>
                                                                            )}

                                                                            {item.ip_address && (
                                                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                                                    <GlobeAltIcon className="w-3 h-3" />
                                                                                    <span>{item.ip_address}</span>
                                                                                </span>
                                                                            )}

                                                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                                                <CalendarIcon className="w-3 h-3" />
                                                                                <span>{item.time_ago || item.created_at}</span>
                                                                            </span>
                                                                        </div>

                                                                        {/* Comment text body */}
                                                                        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 mt-2">
                                                                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                                                {item.content}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Single Delete Button */}
                                                                <div className="flex items-center justify-end sm:self-start pt-1 sm:pt-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteSingleComment(item.id, item.author_name, article.title, article.id)}
                                                                        disabled={deletingId === item.id}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 bg-red-50/60 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                        title="Hapus komentar ini"
                                                                    >
                                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                                        <span>{deletingId === item.id ? 'Menghapus...' : 'Hapus'}</span>
                                                                    </button>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-xs text-gray-400 italic py-2 text-center">
                                                    Tidak ada komentar yang cocok dengan pencarian pada artikel ini.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Pagination for grouped view */}
                        {renderPagination(true)}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
                        <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-800">Tidak ada komentar artikel ditemukan</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'Tidak ada komentar atau judul artikel yang cocok dengan kata kunci pencarian Anda.' : 'Belum ada komentar artikel yang masuk.'}
                        </p>
                    </div>
                )
            ) : (
                /* ============================================================== */
                /* FLAT VIEW (DAFTAR SEMUA KOMENTAR)                               */
                /* ============================================================== */
                flatComments.length > 0 ? (
                    <div className="space-y-4">
                        {flatComments.map((item) => {
                            const isAnon = item.is_anonymous || item.author_name === 'Hamba Allah';
                            const articleTitle = item.article?.title || 'Artikel IndoQuran';
                            const articleSlug = item.article?.slug;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs hover:border-emerald-300 transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-gray-400 font-medium">Artikel:</span>
                                                {articleSlug ? (
                                                    <a
                                                        href={`/artikel/${articleSlug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 line-clamp-1"
                                                    >
                                                        <span>{articleTitle}</span>
                                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="font-semibold text-gray-700">{articleTitle}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-600">
                                                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                                                        isAnon ? 'bg-emerald-600' : 'bg-blue-600'
                                                    }`}>
                                                        {isAnon ? '🤲' : (item.author_name?.charAt(0)?.toUpperCase() || 'U')}
                                                    </div>
                                                    <span>{item.author_name}</span>
                                                </div>

                                                {isAnon ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Anonim (Hamba Allah)
                                                    </span>
                                                ) : item.user ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Member Terdaftar
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                        Pengunjung
                                                    </span>
                                                )}

                                                {(item.email || item.user?.email) && (
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <EnvelopeIcon className="w-3.5 h-3.5" />
                                                        <span>{item.email || item.user?.email}</span>
                                                    </span>
                                                )}

                                                {item.ip_address && (
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <GlobeAltIcon className="w-3.5 h-3.5" />
                                                        <span>{item.ip_address}</span>
                                                    </span>
                                                )}

                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    <span>{item.time_ago || item.created_at}</span>
                                                </span>
                                            </div>

                                            <div className="bg-gray-50/90 rounded-xl p-3.5 border border-gray-100">
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                    {item.content}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex lg:flex-col items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSingleComment(item.id, item.author_name, articleTitle, item.article_id)}
                                                disabled={deletingId === item.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                title="Hapus komentar ini"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                                <span>{deletingId === item.id ? 'Menghapus...' : 'Hapus Komentar'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination for flat view */}
                        {renderPagination(false)}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
                        <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-800">Tidak ada komentar ditemukan</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'Tidak ada komentar yang cocok dengan kata kunci pencarian Anda.' : 'Belum ada komentar artikel yang masuk.'}
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default AdminArticleCommentsTab;
