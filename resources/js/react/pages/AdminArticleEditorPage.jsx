import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';
import TipTapEditor from '../components/TipTapEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import { scrollToTop } from '../utils/scrollUtils';

const AdminArticleEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    published_at: ''
  });

  useEffect(() => {
    scrollToTop();
    if (isEdit) {
      fetchArticle();
    }
    fetchTags();
  }, [id]);


  // Auto-generate slug from title for new articles
  useEffect(() => {
    if (!isEdit && !isSlugManuallyEdited) {
      const newSlug = formData.title ? generateSlug(formData.title) : '';
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  }, [formData.title, isEdit, isSlugManuallyEdited]);

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

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags?all=true', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(`/api/admin/articles/${id}/edit`, {
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
        throw new Error('Failed to fetch article');
      }
      
      const article = await response.json();
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image: article.featured_image || '',
        status: article.status || 'draft',
        published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''
      });
      
      // Set selected tags if article has tags
      if (article.tags && Array.isArray(article.tags)) {
        setSelectedTags(article.tags.map(tag => tag.name));
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      alert('Gagal mengambil data artikel');
      navigate('/admin/artikel');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      // Replace Indonesian special characters
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      // Remove special characters
      .replace(/[^\w\s-]/g, '')
      // Replace spaces and multiple hyphens with single hyphen
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Track if user manually edits slug
    if (name === 'slug' && !isEdit) {
      setIsSlugManuallyEdited(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const parseTags = (input) => {
    if (!input || typeof input !== 'string') return [];

    let rawTags = [];

    // If string contains '#', extract each hashtag (e.g. #Ikhlas #TazkiyatunNafs or #Ikhlas, #TazkiyatunNafs)
    if (input.includes('#')) {
      const matches = input.match(/#([^\s,#;]+)/g);
      if (matches && matches.length > 0) {
        rawTags = matches.map(m => m.replace(/^#+/, '').trim());
      } else {
        rawTags = input.split('#').map(t => t.trim()).filter(Boolean);
      }
    } else if (input.includes(',') || input.includes(';') || input.includes('\n')) {
      rawTags = input.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean);
    } else {
      rawTags = [input.trim()].filter(Boolean);
    }

    return rawTags.map(t => t.replace(/^#+/, '').trim()).filter(Boolean);
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    const clean = value.replace(/^#+/, '').trim();
    setShowTagSuggestions(clean.length > 0 && !value.includes('#') && !value.includes(','));
  };

  const addTags = (tagsInput) => {
    const list = Array.isArray(tagsInput) ? tagsInput : [tagsInput];
    const parsed = list.flatMap(item => parseTags(item));

    if (parsed.length === 0) return;

    setSelectedTags(prevSelected => {
      const newSelected = [...prevSelected];

      parsed.forEach(rawTag => {
        const cleanTag = rawTag.replace(/^#+/, '').trim();
        if (!cleanTag) return;

        // Case-insensitive check against already selected tags
        const alreadySelected = newSelected.some(
          existing => existing.toLowerCase() === cleanTag.toLowerCase()
        );
        if (alreadySelected) return;

        // Case-insensitive match with available tags in DB to adopt canonical casing
        const matchedAvailable = availableTags.find(
          avail => avail.name.toLowerCase() === cleanTag.toLowerCase()
        );

        const tagToInsert = matchedAvailable ? matchedAvailable.name : cleanTag;
        newSelected.push(tagToInsert);
      });

      return newSelected;
    });

    setTagInput('');
    setShowTagSuggestions(false);
  };

  const addTag = (tagName) => addTags(tagName);

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTags(tagInput);
      }
    }
  };

  const handleTagInputPaste = (e) => {
    const pastedText = e.clipboardData?.getData('text');
    if (!pastedText) return;

    // If pasted text contains hashtags (#), commas, or multiple lines, auto-parse and add immediately
    if (pastedText.includes('#') || pastedText.includes(',') || pastedText.includes('\n')) {
      e.preventDefault();
      addTags(pastedText);
    }
  };

  const cleanTagInput = tagInput.replace(/^#+/, '').trim().toLowerCase();
  const filteredTagSuggestions = availableTags.filter(tag =>
    cleanTagInput &&
    tag.name.toLowerCase().includes(cleanTagInput) &&
    !selectedTags.some(st => st.toLowerCase() === tag.name.toLowerCase())
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const csrfToken = await getCsrfToken();
      
      const response = await fetch('/api/admin/articles/upload-image', {
        method: 'POST',
        body: formDataUpload,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'same-origin'
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          featured_image: data.path
        }));
        alert('Gambar berhasil diupload');
      } else {
        if (response.status === 401 || response.status === 403) {
          alert('Sesi admin telah berakhir. Silakan login kembali.');
          localStorage.removeItem('admin_user');
          navigate('/admin/login');
          return;
        }
        throw new Error(data.message || 'Upload gagal');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengupload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Judul artikel harus diisi');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      alert('Konten artikel harus diisi');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        tags: selectedTags, // Add tags to payload
        published_at: formData.status === 'published' && formData.published_at 
          ? formData.published_at 
          : null
      };

      const csrfToken = await getCsrfToken();

      let response;
      if (isEdit) {
        response = await fetch(`/api/admin/articles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sesi admin telah berakhir. Silakan login kembali.');
          localStorage.removeItem('admin_user');
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan artikel');
      }

      alert(isEdit ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat');
      navigate('/admin/artikel');
    } catch (error) {
      console.error('Error saving article:', error);
      alert(error.message || 'Gagal menyimpan artikel');
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/artikel')}
                className="p-2.5 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 transition-colors cursor-pointer"
                title="Kembali ke Daftar Artikel"
              >
                <FaArrowLeft className="text-base" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    formData.status === 'published' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {formData.status === 'published' ? 'Terbit' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">
                  {isEdit ? 'Perbarui konten artikel dan publikasikan perubahan' : 'Buat dan tulis artikel baru untuk edukasi pembaca IndoQuran'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => navigate('/admin/artikel')}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
              >
                <FaSave />
                <span>{saving ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Masukkan judul artikel..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) {!isEdit && <span className="text-xs text-gray-500 font-normal">(otomatis dari judul)</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="otomatis-dari-judul"
                  />
                  {!isEdit && isSlugManuallyEdited && formData.title && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSlugManuallyEdited(false);
                        setFormData(prev => ({
                          ...prev,
                          slug: generateSlug(formData.title)
                        }));
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      title="Reset ke otomatis dari judul"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {!isEdit 
                    ? isSlugManuallyEdited
                      ? 'Slug telah diubah manual. Klik "Reset" untuk kembali otomatis dari judul.'
                      : 'Slug akan otomatis terisi dan ter-update saat judul berubah. Edit manual untuk mengunci slug.'
                    : 'URL artikel ini. Hati-hati mengubah slug karena dapat mempengaruhi SEO.'
                  }
                </p>
                {formData.slug && (
                  <p className="text-xs text-primary-600 mt-1">
                    Preview URL: /artikel/{formData.slug}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ringkasan (Excerpt)
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ringkasan singkat artikel (max 500 karakter)..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/500 karakter
                </p>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tag Artikel</h2>
            
            <div className="space-y-4">
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-green-600 hover:text-green-900 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambah Tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    onPaste={handleTagInputPaste}
                    onFocus={() => {
                      const clean = tagInput.replace(/^#+/, '').trim();
                      setShowTagSuggestions(clean.length > 0 && !tagInput.includes('#') && !tagInput.includes(','));
                    }}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ketik tag atau paste hashtag (#Tag1 #Tag2)..."
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addTags(tagInput)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
                    >
                      Tambah
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tekan Enter atau klik Tambah. Mendukung paste multiple hashtag sekaligus (contoh: <code className="bg-gray-100 px-1 py-0.5 rounded text-green-700">#Ikhlas #TazkiyatunNafs #AmalSaleh</code>). Tag yang sama (tidak membedakan huruf besar/kecil) tidak akan diduplikasi.
                </p>

                {/* Tag Suggestions */}
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTagSuggestions.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.name)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center justify-between group"
                      >
                        <span className="font-medium text-gray-900">#{tag.name}</span>
                        {tag.articles_count > 0 && (
                          <span className="text-xs text-gray-500">
                            {tag.articles_count} artikel
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Tags Quick Select */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Populer
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !selectedTags.some(st => st.toLowerCase() === tag.name.toLowerCase()))
                      .slice(0, 10)
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag.name)}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-green-100 hover:text-green-800 transition-colors"
                        >
                          #{tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gambar Unggulan</h2>
            
            <div className="space-y-4">
              {formData.featured_image && (
                <div className="relative inline-block">
                  <img
                    src={getImageUrl(formData.featured_image)}
                    alt="Featured"
                    className="w-full max-w-md h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = '/images/default-article.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 shadow-lg transition-all"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}

              <div>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 cursor-pointer shadow-md transition-all">
                  <FaImage className="text-lg" />
                  <span>{uploadingImage ? 'Mengupload...' : 'Upload Gambar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Format: JPG, PNG, WebP (Max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Konten Artikel *</h2>
            <TipTapEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Mulai menulis konten artikel di sini..."
            />
          </div>

          {/* Publishing Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Opsi Publikasi</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Published Date */}
              {formData.status === 'published' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Publikasi
                  </label>
                  <input
                    type="datetime-local"
                    name="published_at"
                    value={formData.published_at}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4 border-t border-gray-200 -mx-6 px-6 shadow-xs">
            <button
              type="button"
              onClick={() => navigate('/admin/artikel')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            >
              <FaSave />
              <span>{saving ? 'Menyimpan...' : (isEdit ? 'Perbarui Artikel' : 'Simpan Artikel')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArticleEditorPage;
