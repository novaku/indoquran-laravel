import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMailOutline, IoArrowBackOutline, IoSendOutline, IoPersonOutline, IoDocumentAttachOutline } from 'react-icons/io5';
import { postWithAuth, getAuthToken } from '../utils/apiUtils';
import { isAuthenticated, authenticatedFetch } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';

function SimpleContactPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Pre-fill user data if authenticated
    useEffect(() => {
        const fetchUserData = async () => {
            if (isAuthenticated()) {
                try {
                    const response = await authenticatedFetch('/api/user');
                    if (response.ok) {
                        const userData = await response.json();
                        if (userData) {
                            setFormData(prev => ({
                                ...prev,
                                name: userData.name || '',
                                email: userData.email || ''
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();

        // Handle pre-filled data from navigation state (e.g., from donation page)
        if (location.state) {
            const { name, email, subject, message } = location.state;
            setFormData(prev => ({
                ...prev,
                name: name || prev.name,
                email: email || prev.email,
                subject: subject || prev.subject,
                message: message || prev.message
            }));
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, file: 'Ukuran file maksimal 5MB' }));
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, file: 'Tipe file tidak didukung. Gunakan JPG, PNG, GIF, PDF, atau TXT' }));
                return;
            }
            
            setSelectedFile(file);
            setErrors(prev => ({ ...prev, file: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            
            if (selectedFile) {
                submitData.append('attachment', selectedFile);
            }

            const response = isAuthenticated() 
                ? await postWithAuth('/api/contact', submitData)
                : await fetch('/api/contact', {
                    method: 'POST',
                    body: submitData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    }
                });

            if (response.ok) {
                setSuccessMessage('Pesan Anda telah berhasil dikirim! Kami akan merespons sesegera mungkin.');
                setFormData({
                    name: formData.name, // Keep name and email if user is logged in
                    email: formData.email,
                    subject: '',
                    message: ''
                });
                setSelectedFile(null);
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setErrors({ general: errorData.message || 'Gagal mengirim pesan. Silakan coba lagi.' });
                }
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SEOHead 
                title="Hubungi Kami - IndoQuran"
                description="Hubungi tim IndoQuran untuk pertanyaan, saran, atau bantuan"
            />
            
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-2xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <IoArrowBackOutline className="w-5 h-5" />
                                <span>Kembali</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <IoMailOutline className="w-6 h-6 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Hubungi Kami</h1>
                        </div>
                        <p className="text-gray-600 mt-2">
                            Kami senang mendengar dari Anda. Kirimkan pertanyaan, saran, atau masukan Anda.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-2xl mx-auto px-4 py-6">
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    )}

                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{errors.general}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap *
                                    </label>
                                    <div className="relative">
                                        <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                errors.name ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                errors.email ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                            placeholder="Masukkan alamat email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subjek *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        errors.subject ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                    placeholder="Masukkan subjek pesan"
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject[0]}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pesan *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical ${
                                        errors.message ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                    placeholder="Tulis pesan Anda di sini..."
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600">{errors.message[0]}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                                    Lampiran (opsional)
                                </label>
                                <div className="relative">
                                    <IoDocumentAttachOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="file"
                                        id="attachment"
                                        name="attachment"
                                        onChange={handleFileChange}
                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            errors.file ? 'border-red-300' : 'border-gray-200'
                                        }`}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Format yang didukung: JPG, PNG, GIF, PDF, TXT. Maksimal 5MB.
                                </p>
                                {selectedFile && (
                                    <p className="mt-1 text-sm text-green-600">
                                        File terpilih: {selectedFile.name}
                                    </p>
                                )}
                                {errors.file && (
                                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                )}
                                {errors.attachment && (
                                    <p className="mt-1 text-sm text-red-600">{errors.attachment[0]}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <IoSendOutline className="w-5 h-5" />
                                        <span>Kirim Pesan</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 text-center text-gray-600">
                        <p className="mb-2">Atau hubungi kami melalui:</p>
                        <p className="text-sm">
                            Email: kontak@indoquran.web.id<br />
                            Response time: 1-2 hari kerja
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SimpleContactPage;
