import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendar, FaUser, FaClock, FaEye, FaShareAlt, FaFacebookF, FaTwitter, FaWhatsapp, FaLink, FaEdit } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import { getWithAuth } from '../utils/apiUtils';
import { useAuth } from '../hooks/useAuth';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
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
    fetchArticle();
    fetchRelatedArticles();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await getWithAuth(`/api/articles/${slug}`);
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
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

  const shareUrl = window.location.href;
  const shareTitle = article?.title || '';

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link berhasil disalin!');
    setShowShareMenu(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h2>
          <Link to="/artikel" className="text-green-600 hover:text-green-700">
            Kembali ke Daftar Artikel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${article.title} - IndoQuran`}
        description={article.excerpt || article.title}
        keywords={`artikel islam, ${article.title}, kajian quran`}
        canonicalUrl={`https://indoquran.web.id/artikel/${article.slug}`}
        ogImage={article.featured_image_url || getImageUrl(article.featured_image)}
        ogType="article"
      />

      <div className="min-h-screen bg-white">
        {/* Article Header */}
        <div className="bg-gradient-to-b from-primary-50 to-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <div className="mb-6 text-sm text-gray-600">
                <Link to="/" className="hover:text-green-600">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/artikel" className="hover:text-green-600">Artikel</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{article.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <FaUser className="text-green-500" />
                  <span>{article.author?.name || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-green-500" />
                  <span>{article.formatted_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-green-500" />
                  <span>{article.reading_time} menit baca</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEye className="text-green-500" />
                  <span>{article.views_count} views</span>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/artikel?tag=${tag.slug}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Button */}
              <div className="flex items-center gap-3">
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaShareAlt />
                    <span>Bagikan</span>
                  </button>

                  {showShareMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg py-2 z-10 min-w-[200px]">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        <FaFacebookF className="text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        <FaTwitter className="text-blue-400" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        <FaWhatsapp className="text-green-600" />
                        WhatsApp
                      </button>
                      <button
                        onClick={copyLink}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        <FaLink className="text-gray-600" />
                        Salin Link
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Button - Only visible for admin */}
                {isAdmin && article && (
                  <button
                    onClick={() => navigate(`/admin/artikel/edit/${article.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    title="Edit Artikel"
                  >
                    <FaEdit />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {(article.featured_image_url || article.featured_image) && (
          <div className="container mx-auto px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <img
                src={article.featured_image_url || getImageUrl(article.featured_image)}
                alt={article.title}
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/images/default-article.svg';
                }}
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Artikel Terkait</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/artikel/${related.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="h-40 bg-gray-200 overflow-hidden">
                        <img
                          src={getImageUrl(related.featured_image)}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/default-article.svg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-green-600">
                          {related.title}
                        </h3>
                        
                        {/* Tags for related articles */}
                        {related.tags && related.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {related.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <FaCalendar className="text-green-500" />
                          <span>{related.formatted_date}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .article-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .article-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1.3em;
          margin-bottom: 0.5em;
        }
        .article-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
        }
        .article-content p {
          margin-bottom: 1em;
          line-height: 1.8;
        }
        .article-content ul,
        .article-content ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .article-content li {
          margin-bottom: 0.5em;
        }
        .article-content blockquote {
          border-left: 4px solid #a16207;
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: italic;
          color: #6b7280;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1.5em 0;
        }
        .article-content a {
          color: #a16207;
          text-decoration: underline;
        }
        .article-content a:hover {
          color: #92400e;
        }
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        .article-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .article-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </>
  );
};

export default ArticleDetailPage;
