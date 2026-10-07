import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImage, FaTrash, FaCheckCircle, FaExclamationCircle, FaSpinner, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileInfo, setUploadFileInfo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);
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

  // Helper function to get CSRF token
  const getCsrfToken = async () => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken && metaToken.length > 10) {
      return metaToken;
    }

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
    
    return metaToken || '';
  };

  const fetchTags = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/tags?all=true', {
        method: 'GET',
        headers,
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(Array.isArray(data) ? data : (data.data || []));
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

  const startImageUpload = async (file) => {
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Ukuran file maksimal 2MB (file Anda: ${sizeMB} MB)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
    if (!isImageMime && !isImageExt) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const formattedSize = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadFileInfo({
      name: file.name,
      size: formattedSize,
      previewUrl: objectUrl,
      file: file
    });
    setUploadingImage(true);
    setUploadProgress(10);
    setUploadStatus('uploading');
    setUploadError(null);

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const csrfToken = await getCsrfToken();
      const authToken = localStorage.getItem('auth_token');

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open('POST', '/api/admin/articles/upload-image', true);
      xhr.withCredentials = true;
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Accept', 'application/json');
      if (csrfToken) {
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
      }
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 90), 90);
          setUploadProgress(percent);
          if (percent >= 90) {
            setUploadStatus('processing');
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setUploadProgress(100);
            setUploadStatus('success');
            setFormData(prev => ({
              ...prev,
              featured_image: data.path
            }));
            toast.success('Gambar berhasil diupload!');
            setTimeout(() => {
              setUploadingImage(false);
              setUploadStatus('idle');
              setUploadFileInfo(null);
              if (objectUrl) URL.revokeObjectURL(objectUrl);
            }, 900);
          } catch (err) {
            setUploadStatus('error');
            setUploadError('Gagal memproses respon server');
            toast.error('Gagal memproses respon server');
            setUploadingImage(false);
          }
        } else {
          let errorMsg = 'Upload gagal';
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMsg = errData.message || (errData.errors && Object.values(errData.errors).flat()[0]) || 'Upload gagal';
          } catch (e) {
            if (xhr.status === 401 || xhr.status === 403) {
              toast.error('Sesi admin telah berakhir. Silakan login kembali.');
              localStorage.removeItem('admin_user');
              navigate('/admin/login');
              return;
            }
          }
          setUploadStatus('error');
          setUploadError(errorMsg);
          toast.error(errorMsg);
          setUploadingImage(false);
        }
      };

      xhr.onerror = () => {
        setUploadStatus('error');
        setUploadError('Koneksi terputus atau terjadi kesalahan jaringan.');
        toast.error('Gagal mengupload gambar: gangguan koneksi.');
        setUploadingImage(false);
      };

      xhr.onabort = () => {
        setUploadStatus('idle');
        setUploadingImage(false);
        setUploadFileInfo(null);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        toast('Upload dibatalkan', { icon: 'ℹ️' });
      };

      xhr.send(formDataUpload);
    } catch (error) {
      console.error('Error starting upload:', error);
      setUploadStatus('error');
      setUploadError('Gagal memulai upload gambar.');
      toast.error('Gagal memulai upload gambar.');
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      startImageUpload(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploadingImage) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      startImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!uploadingImage) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
        const errorMessage = (errorData.errors && Object.values(errorData.errors).flat()[0]) || errorData.message || 'Gagal menyimpan artikel';
        throw new Error(errorMessage);
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gambar Unggulan</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gambar sampul utama untuk artikel. Format: JPG, PNG, WebP (Maksimal 2MB)
                </p>
              </div>
              {formData.featured_image && !uploadingImage && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                  <FaCheckCircle className="text-emerald-500" />
                  Gambar Terpasang
                </span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="article-featured-image-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
              onChange={handleImageUpload}
              onClick={(e) => {
                e.target.value = null;
              }}
              disabled={uploadingImage}
              className="hidden"
            />

            <div className="space-y-4">
              {/* Active Image Preview (if uploaded and not currently uploading) */}
              {formData.featured_image && !uploadingImage && (
                <div className="relative group max-w-lg rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                  <img
                    src={getImageUrl(formData.featured_image)}
                    alt="Featured"
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    onError={(e) => {
                      e.target.src = '/images/default-article.svg';
                    }}
                  />
                  <div className="p-3 bg-white flex items-center justify-between border-t border-gray-100">
                    <div className="text-xs text-gray-500 truncate max-w-[240px]" title={formData.featured_image}>
                      {formData.featured_image.split('/').pop()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <FaImage className="text-xs" />
                        Ganti Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
                      >
                        <FaTrash className="text-xs" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress Card (when uploading) */}
              {uploadingImage && uploadFileInfo && (
                <div className="max-w-xl p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {uploadFileInfo.previewUrl && (
                      <img
                        src={uploadFileInfo.previewUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shadow-xs flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {uploadFileInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {uploadFileInfo.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {uploadStatus === 'processing' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full animate-pulse">
                          <FaSpinner className="animate-spin text-xs" />
                          Memproses...
                        </span>
                      ) : uploadStatus === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          <FaCheckCircle className="text-xs" />
                          100% Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                          <FaCloudUploadAlt className="text-xs" />
                          {uploadProgress}%
                        </span>
                      )}
                      {uploadStatus === 'uploading' && (
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Batalkan upload"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden p-0.5 border border-emerald-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 rounded-full transition-all duration-300 ease-out upload-progress-striped shadow-xs"
                      style={{ width: `${Math.max(5, uploadProgress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2 text-xs text-emerald-700">
                    <span className="font-medium">
                      {uploadStatus === 'processing'
                        ? 'Menyimpan & mengoptimasi gambar di server...'
                        : uploadStatus === 'success'
                        ? 'Gambar berhasil disimpan!'
                        : `Mengupload gambar (${uploadProgress}%)...`}
                    </span>
                    <span className="font-semibold">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {/* Upload Error Banner if failed */}
              {uploadStatus === 'error' && uploadError && (
                <div className="max-w-xl p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 text-red-700">
                    <FaExclamationCircle className="text-base flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex-shrink-0"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Upload Dropzone / Button (when not uploading and no image) */}
              {!formData.featured_image && !uploadingImage && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                      : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                    <FaCloudUploadAlt className="text-2xl" />
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-all text-sm cursor-pointer mb-2 pointer-events-none"
                  >
                    <FaImage className="text-base" />
                    <span>Upload Gambar</span>
                  </button>
                  <p className="text-xs text-gray-600">
                    Klik tombol untuk memilih gambar atau seret file ke sini
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JPG, PNG, WebP (Maksimal 2MB)
                  </p>
                </div>
              )}
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
