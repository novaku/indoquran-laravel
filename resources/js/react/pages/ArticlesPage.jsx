import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaCalendar, FaUser, FaClock, FaEye } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import { getWithAuth } from '../utils/apiUtils';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState(null);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const tag = searchParams.get('tag') || '';
    const query = searchParams.get('search') || '';
    setSelectedTag(tag);
    setSearchQuery(query);
    fetchArticles(currentPage, query, tag);
  }, [currentPage, searchParams]);

  const fetchArticles = async (page = 1, search = '', tag = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append('search', search);
      if (tag) params.append('tag', tag);
      
      const response = await getWithAuth(`/api/articles?${params.toString()}`);
      const data = await response.json();
      setArticles(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        per_page: data.per_page
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { page: '1' };
    if (selectedTag) params.tag = selectedTag;
    setSearchParams(params);
    fetchArticles(1, searchQuery, selectedTag);
  };

  const handlePageChange = (page) => {
    const params = { page: page.toString() };
    if (selectedTag) params.tag = selectedTag;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearTagFilter = () => {
    setSelectedTag('');
    setSearchParams({ page: '1' });
    fetchArticles(1, searchQuery, '');
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/default-article.svg';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  if (loading && articles.length === 0) {
    return <LoadingSpinner />;
  }

  const articlesStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Artikel Islami & Kajian Al-Quran',
      'description': 'Kumpulan artikel islami, kajian Al-Quran, tafsir, dan pengetahuan agama Islam untuk memperdalam keimanan Anda.',
      'url': 'https://indoquran.web.id/artikel',
      'inLanguage': 'id-ID',
      'publisher': {
        '@type': 'Organization',
        'name': 'IndoQuran',
        'url': 'https://indoquran.web.id',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://indoquran.web.id/android-chrome-512x512.png'
        }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Beranda',
          'item': 'https://indoquran.web.id'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Artikel',
          'item': 'https://indoquran.web.id/artikel'
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title={selectedTag ? `Artikel Tag #${selectedTag} - IndoQuran` : (searchQuery ? `Hasil Pencarian Artikel "${searchQuery}" - IndoQuran` : "Artikel Islami - Kajian Al-Quran & Pengetahuan Islam | IndoQuran")}
        description={selectedTag ? `Kumpulan artikel islami dan kajian Al-Quran dengan topik #${selectedTag} di IndoQuran.` : "Baca berbagai artikel islami, kajian Al-Quran, dan pengetahuan agama untuk memperdalam pemahaman Islam Anda."}
        keywords="artikel islam, kajian quran, artikel islami, pengetahuan agama, tafsir, bacaan islam, indoquran"
        canonicalUrl="https://indoquran.web.id/artikel"
        structuredData={articlesStructuredData}
        noindex={Boolean(selectedTag || searchQuery || currentPage > 1)}
        robots={selectedTag || searchQuery || currentPage > 1 ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Artikel Islami
            </h1>
            <p className="text-center text-green-100 max-w-2xl mx-auto">
              Kumpulan artikel dan kajian untuk memperdalam pemahaman Al-Quran dan Islam
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari artikel..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                >
                  Cari
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-4 py-12">
          {/* Tag Filter Indicator */}
          {selectedTag && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-gray-600">Filter berdasarkan tag:</span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                #{selectedTag}
              </span>
              <button
                onClick={clearTagFilter}
                className="text-sm text-gray-600 hover:text-red-600 underline"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'Tidak ada artikel yang ditemukan.' : 'Belum ada artikel tersedia.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/artikel/${article.slug}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Featured Image */}
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={article.featured_image_url || getImageUrl(article.featured_image)}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/default-article.svg';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-green-600">
                        {article.title}
                      </h2>

                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag) => (
                            <Link
                              key={tag.id}
                              to={`/artikel?tag=${tag.slug}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                            >
                              #{tag.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaUser className="text-green-500" />
                          <span>{article.author?.name || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendar className="text-green-500" />
                          <span>{article.formatted_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-green-500" />
                          <span>{article.reading_time} menit</span>
                        </div>
                        {article.views_count > 0 && (
                          <div className="flex items-center gap-1">
                            <FaEye className="text-green-500" />
                            <span>{article.views_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.last_page)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.last_page ||
                      (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === pagination.current_page
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.current_page - 2 ||
                      page === pagination.current_page + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticlesPage;
