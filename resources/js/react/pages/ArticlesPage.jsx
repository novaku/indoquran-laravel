import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaCalendar, FaUser, FaClock, FaEye, FaFire, FaTimes } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import AdSenseInFeed from '../components/AdSenseInFeed';
import { getWithAuth } from '../utils/apiUtils';
import { scrollToTop } from '../utils/scrollUtils';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularTags, setPopularTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState(null);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchPopularTags();
  }, []);

  const fetchPopularTags = async () => {
    try {
      setLoadingTags(true);
      const response = await getWithAuth('/api/tags/popular?limit=20');
      if (response.ok) {
        const data = await response.json();
        setPopularTags(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    scrollToTop();
    const tag = searchParams.get('tag') || '';
    const query = searchParams.get('search') || '';
    setSelectedTag(tag);
    setSearchQuery(query);
    fetchArticles(currentPage, query, tag);
  }, [currentPage, searchParams]);

  const fetchArticles = async (page = 1, search = '', tag = '') => {
    setLoading(true);
    scrollToTop();
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
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);

    if (
      (searchParams.get('search') || '') === searchQuery.trim() &&
      (searchParams.get('tag') || '') === selectedTag &&
      currentPage === 1
    ) {
      fetchArticles(1, searchQuery.trim(), selectedTag);
    }
  };

  const handlePageChange = (page) => {
    const params = { page: page.toString() };
    if (selectedTag) params.tag = selectedTag;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);
    scrollToTop();
  };

  const handleTagClick = (tagSlug) => {
    if (selectedTag === tagSlug) {
      // Toggle off
      clearTagFilter();
    } else {
      const params = { page: '1', tag: tagSlug };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      setSearchParams(params);
    }
  };

  const clearTagFilter = () => {
    setSelectedTag('');
    const params = { page: '1' };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    setSearchParams(params);
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/default-article.svg';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  const activeTagObj = popularTags.find((t) => t.slug === selectedTag);
  const activeTagName = activeTagObj ? activeTagObj.name : selectedTag;
  const isSelectedInExtra = !showAllTags && popularTags.slice(10).some((t) => t.slug === selectedTag);
  const displayedTags = (showAllTags || isSelectedInExtra) ? popularTags : popularTags.slice(0, 10);

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
        title={selectedTag ? `Artikel Tag #${activeTagName} - IndoQuran` : (searchQuery ? `Hasil Pencarian Artikel "${searchQuery}" - IndoQuran` : "Artikel Islami - Kajian Al-Quran & Pengetahuan Islam | IndoQuran")}
        description={selectedTag ? `Kumpulan artikel islami dan kajian Al-Quran dengan topik #${activeTagName} di IndoQuran.` : "Baca berbagai artikel islami, kajian Al-Quran, dan pengetahuan agama untuk memperdalam pemahaman Islam Anda."}
        keywords="artikel islam, kajian quran, artikel islami, pengetahuan agama, tafsir, bacaan islam, indoquran"
        canonicalUrl="https://indoquran.web.id/artikel"
        structuredData={articlesStructuredData}
        noindex={Boolean(selectedTag || searchQuery || currentPage > 1)}
        robots={selectedTag || searchQuery || currentPage > 1 ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              Artikel Islami
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-6">
              Kumpulan artikel dan kajian untuk memperdalam pemahaman Al-Quran dan Islam
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari artikel..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm shadow-xs cursor-pointer"
                >
                  Cari
                </button>
              </div>
            </form>

            {/* Popular Hashtags */}
            {(loadingTags || popularTags.length > 0) && (
              <div className="mt-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  <FaFire className="text-amber-500 text-xs" />
                  <span>Hashtag Populer:</span>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2">
                  {loadingTags ? (
                    [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-7 w-20 sm:w-24 bg-gray-200 animate-pulse rounded-full"
                      />
                    ))
                  ) : (
                    <>
                      {displayedTags.map((tag) => {
                        const isSelected = selectedTag === tag.slug;
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagClick(tag.slug)}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-green-600 text-white ring-2 ring-green-600/30 shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 border border-gray-200/80'
                            }`}
                            title={`${tag.articles_count} artikel terkait #${tag.name}`}
                          >
                            <span className={isSelected ? 'text-green-200 font-bold' : 'text-gray-400 group-hover:text-green-600 font-semibold'}>
                              #
                            </span>
                            <span>{tag.name}</span>
                            <span
                              className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                                isSelected
                                  ? 'bg-green-700 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 group-hover:bg-green-100 group-hover:text-green-800 group-hover:border-green-200'
                              }`}
                            >
                              {tag.articles_count}
                            </span>
                          </button>
                        );
                      })}

                      {popularTags.length > 10 && !isSelectedInExtra && (
                        <button
                          type="button"
                          onClick={() => setShowAllTags(!showAllTags)}
                          className="text-xs text-gray-500 hover:text-green-700 font-medium py-1 px-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border border-dashed border-gray-300"
                        >
                          {showAllTags ? 'Tampilkan Lebih Sedikit' : `+${popularTags.length - 10} lainnya`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-4 py-8">
          {/* Tag Filter Indicator */}
          {selectedTag && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Menampilkan artikel dengan tag:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white shadow-2xs">
                  <span>#{activeTagName}</span>
                  {activeTagObj && typeof activeTagObj.articles_count === 'number' && (
                    <span className="bg-green-700 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                      {activeTagObj.articles_count} artikel
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={clearTagFilter}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium hover:underline cursor-pointer"
              >
                <FaTimes className="text-[10px]" />
                <span>Hapus Filter</span>
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
                {articles.map((article, index) => {
                  const showInFeedAd = index === 5;

                  return (
                    <React.Fragment key={article.id}>
                      {showInFeedAd && (
                        <AdSenseInFeed 
                          adSlot="1519827772"
                          labelText="IKLAN REKOMENDASI"
                        />
                      )}
                      <Link
                        to={`/artikel/${article.slug}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                      >
                    {/* Featured Image */}
                    <div className="article-thumb-wrapper h-48 bg-gray-100">
                      <img
                        src={article.featured_image_url || getImageUrl(article.featured_image)}
                        alt={article.title}
                        className="article-thumb-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
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
                </React.Fragment>
                );
              })}
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
