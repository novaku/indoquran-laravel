import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendar, FaUser, FaClock, FaEye, FaWhatsapp, FaEdit, FaBookOpen, FaQuoteLeft } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import AdSenseVertical from '../components/AdSenseVertical';
import AdSenseInline from '../components/AdSenseInline';
import { getWithAuth } from '../utils/apiUtils';
import { useAuth } from '../hooks/useAuth';
import { scrollToTop } from '../utils/scrollUtils';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (from either regular auth or admin auth)
  useEffect(() => {
    // Check regular user auth
    if (user && user.is_admin) {
      setIsAdmin(true);
      return;
    }

    // Check admin-specific auth
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        const adminData = JSON.parse(adminUser);
        if (adminData.is_admin) {
          setIsAdmin(true);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }

    setIsAdmin(false);
  }, [user]);

  useEffect(() => {
    scrollToTop();
    fetchArticle();
    fetchRelatedArticles();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    scrollToTop();
    try {
      const response = await getWithAuth(`/api/articles/${slug}`);
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
      scrollToTop();
    }
  };


  const fetchRelatedArticles = async () => {
    try {
      const response = await getWithAuth(`/api/articles/${slug}/related`);
      const data = await response.json();
      setRelatedArticles(data);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/images/default-article.svg';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  const handleShareWhatsapp = () => {
    const shareUrl = window.location.href;
    const shareTitle = article?.title || '';
    const shareText = `${shareTitle}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to split article content for in-article ad placement (detik.com pattern)
  const renderArticleContentWithAd = (contentHtml) => {
    if (!contentHtml) return null;

    const paragraphs = contentHtml.split('</p>');
    if (paragraphs.length <= 2) {
      return (
        <div className="space-y-6">
          <div
            className="prose prose-lg max-w-none article-content dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
          <AdSenseInline labelText="IKLAN" />
        </div>
      );
    }

    // Insert ad after roughly 2nd paragraph (detik.com in-article pattern)
    const splitIndex = 2;
    const part1 = paragraphs.slice(0, splitIndex).join('</p>') + (paragraphs[splitIndex - 1] ? '</p>' : '');
    const part2 = paragraphs.slice(splitIndex).join('</p>');

    return (
      <div className="space-y-6">
        <div
          className="prose prose-lg max-w-none article-content dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: part1 }}
        />
        <AdSenseInline labelText="IKLAN" />
        <div
          className="prose prose-lg max-w-none article-content dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: part2 }}
        />
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Artikel Tidak Ditemukan</h2>
          <Link to="/artikel" className="text-green-600 hover:text-green-700">
            Kembali ke Daftar Artikel
          </Link>
        </div>
      </div>
    );
  }

  const articleImageUrl = article.featured_image_url || getImageUrl(article.featured_image);
  const tagNames = article.tags ? article.tags.map((t) => t.name) : [];
  const tagsString = tagNames.join(', ');
  const cleanExcerpt = article.excerpt ? article.excerpt.replace(/<[^>]*>?/gm, '').trim() : '';
  const metaDescription = cleanExcerpt || (article.content ? article.content.replace(/<[^>]*>?/gm, '').slice(0, 160).trim() : article.title);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://indoquran.web.id/artikel/${article.slug}`
      },
      'headline': article.title,
      'description': metaDescription,
      'image': [
        articleImageUrl.startsWith('http') ? articleImageUrl : `https://indoquran.web.id${articleImageUrl}`
      ],
      'datePublished': article.published_at || article.created_at,
      'dateModified': article.updated_at || article.published_at || article.created_at,
      'author': {
        '@type': 'Person',
        'name': article.author?.name || 'Redaksi IndoQuran',
        'url': 'https://indoquran.web.id'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'IndoQuran',
        'url': 'https://indoquran.web.id',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://indoquran.web.id/android-chrome-512x512.png'
        }
      },
      'inLanguage': 'id-ID',
      'articleSection': 'Kajian Al-Quran & Islam',
      'keywords': `artikel islam, ${article.title}, kajian quran${tagsString ? ', ' + tagsString : ''}`
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
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': article.title,
          'item': `https://indoquran.web.id/artikel/${article.slug}`
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title={`${article.title} | IndoQuran`}
        description={metaDescription}
        keywords={`artikel islam, ${article.title}, kajian quran${tagsString ? ', ' + tagsString : ''}, indoquran`}
        canonicalUrl={`https://indoquran.web.id/artikel/${article.slug}`}
        ogImage={articleImageUrl}
        ogType="article"
        structuredData={structuredData}
        openGraph={{
          'article:published_time': article.published_at || article.created_at,
          'article:modified_time': article.updated_at || article.published_at,
          'article:author': article.author?.name || 'IndoQuran',
          'article:section': 'Kajian Al-Quran & Islam'
        }}
        additionalMeta={[
          { property: 'article:published_time', content: article.published_at || article.created_at },
          { property: 'article:modified_time', content: article.updated_at || article.published_at },
          { property: 'article:author', content: article.author?.name || 'IndoQuran' },
          { property: 'article:section', content: 'Kajian Al-Quran & Islam' }
        ]}
      />

      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        {/* Article Header */}
        <div className="bg-white border-b border-gray-200 py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="hover:text-green-600">Beranda</Link>
                <span className="mx-2">/</span>
                <Link to="/artikel" className="hover:text-green-600">Artikel</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate inline-block max-w-[200px] sm:max-w-none align-bottom">
                  {article.title}
                </span>
              </nav>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-5">
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-green-500" />
                  <span>{article.author?.name || 'Redaksi IndoQuran'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCalendar className="text-green-500" />
                  <span>{article.formatted_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-green-500" />
                  <span>{article.reading_time} menit baca</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaEye className="text-green-500" />
                  <span>{article.views_count} views</span>
                </div>
              </div>

              {/* Share & Admin Edit Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShareWhatsapp}
                  className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-xs cursor-pointer"
                  title="Bagikan ke WhatsApp"
                >
                  <FaWhatsapp className="text-base sm:text-lg" />
                  <span>Bagikan ke WhatsApp</span>
                </button>

                {/* Edit Button - Only visible for admin */}
                {isAdmin && article && (
                  <button
                    onClick={() => navigate(`/admin/artikel/edit/${article.id}`)}
                    className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
                    title="Edit Artikel"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Article Body with 2-Column Desktop Grid (Ala Detik.com) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Left Main Article Column (8 Cols) */}
            <main className="lg:col-span-8">
              {/* Featured Image */}
              {(article.featured_image_url || article.featured_image) && (
                <div className="mb-8">
                  <img
                    src={article.featured_image_url || getImageUrl(article.featured_image)}
                    alt={article.title}
                    className="w-full h-auto max-h-[480px] object-cover rounded-2xl shadow-md border border-gray-100 dark:border-gray-800"
                    onError={(e) => {
                      e.target.src = '/images/default-article.svg';
                    }}
                  />
                  {article.title && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic text-center">
                      Foto/Ilustrasi: {article.title}
                    </p>
                  )}
                </div>
              )}

              {/* Excerpt / Ringkasan Artikel */}
              {article.excerpt && article.excerpt.trim() && (
                <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-gray-900/60 dark:to-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 shadow-xs relative">
                  <div className="flex gap-3.5 sm:gap-4 items-start">
                    <FaQuoteLeft className="text-emerald-600/70 dark:text-emerald-400/60 text-lg sm:text-xl flex-shrink-0 mt-1" />
                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-medium italic">
                      {article.excerpt.trim()}
                    </p>
                  </div>
                </div>
              )}

              {/* In-Article Content with Middle Ad (Detik.com Pattern) */}
              <div className="article-body-wrapper pb-6">
                {renderArticleContentWithAd(article.content)}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="my-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Tag Terkait:</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/artikel?tag=${tag.slug}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 transition-colors border border-emerald-200/60 dark:border-emerald-800/60"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Right Desktop Sticky Sidebar (4 Cols - Ala Detik.com) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Vertical Sticky AdSense Unit */}
                <AdSenseVertical 
                  adSlot="9021708920"
                  labelText="IKLAN"
                  minHeight="300px"
                  isSticky={false}
                />

                {/* Baca Juga / Rekomendasi Sidebar */}
                {relatedArticles.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200/90 dark:border-gray-800 shadow-2xs">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                      <FaBookOpen className="text-emerald-600" />
                      <span>Baca Juga</span>
                    </h3>
                    <div className="space-y-3.5">
                      {relatedArticles.slice(0, 4).map((item, idx) => (
                        <Link 
                          key={item.id || idx}
                          to={`/artikel/${item.slug}`}
                          className="group flex items-start gap-3 text-xs"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[11px] group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 transition-colors">
                            {item.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="bg-gray-50/70 dark:bg-gray-900/50 py-12 border-t border-gray-100 dark:border-gray-850">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
                <span>Artikel Terkait Lainnya</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/artikel/${related.slug}`}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200/80 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="article-thumb-wrapper h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <img
                          src={getImageUrl(related.featured_image)}
                          alt={related.title}
                          className="article-thumb-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/default-article.svg';
                          }}
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 transition-colors text-sm sm:text-base">
                          {related.title}
                        </h3>
                        
                        {/* Tags for related articles */}
                        {related.tags && related.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {related.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-2 border-t border-gray-50 dark:border-gray-800/60">
                      <FaCalendar className="text-green-500" />
                      <span>{related.formatted_date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticleDetailPage;
