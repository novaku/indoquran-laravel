import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  // Helper function to get CSRF token (same as AdminDashboard)
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
        // Update meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
          metaTag.setAttribute('content', csrfData.csrf_token);
        }
        return csrfData.csrf_token;
      }
    } catch (error) {
      console.error('Error getting CSRF token:', error);
    }
    
    // Fallback to meta tag
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  const fetchArticles = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`/api/admin/articles?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sesi admin telah berakhir. Silakan login kembali.');
          localStorage.removeItem('admin_user');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      setArticles(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      alert('Gagal mengambil data artikel');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(1, searchQuery);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sesi admin telah berakhir. Silakan login kembali.');
          localStorage.removeItem('admin_user');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to delete article');
      }
      
      alert('Artikel berhasil dihapus');
      fetchArticles(pagination?.current_page || 1, searchQuery);
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Gagal menghapus artikel');
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/default-article.svg';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  if (loading && articles.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
              <p className="text-gray-600 mt-1">Kelola semua artikel di website</p>
            </div>
            <Link
              to="/admin/artikel/baru"
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FaPlus />
              <span>Artikel Baru</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Cari
              </button>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {articles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchQuery || statusFilter ? 'Tidak ada artikel yang ditemukan.' : 'Belum ada artikel.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={article.featured_image_url || getImageUrl(article.featured_image)}
                            alt={article.title}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/images/default-article.svg';
                            }}
                          />
                          <div className="max-w-md">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {article.title}
                            </div>
                            {article.excerpt && (
                              <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                                {article.excerpt}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {article.author?.name || 'Admin'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.views_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.formatted_date || new Date(article.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {article.status === 'published' && (
                            <Link
                              to={`/artikel/${article.slug}`}
                              target="_blank"
                              className="p-2 text-blue-600 hover:text-blue-700"
                              title="Lihat"
                            >
                              <FaEye />
                            </Link>
                          )}
                          <Link
                            to={`/admin/artikel/edit/${article.id}`}
                            className="p-2 text-primary-600 hover:text-primary-700"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            className="p-2 text-red-600 hover:text-red-700"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Total: {pagination.total} artikel
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchArticles(pagination.current_page - 1, searchQuery)}
                  disabled={pagination.current_page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => fetchArticles(pagination.current_page + 1, searchQuery)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminArticlesPage;
