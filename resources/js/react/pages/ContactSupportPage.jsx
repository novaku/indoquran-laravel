import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    IoMailOutline, 
    IoSendOutline, 
    IoPersonOutline, 
    IoDocumentAttachOutline,
    IoTimeOutline,
    IoLocationOutline,
    IoCallOutline,
    IoHelpCircleOutline,
    IoChatbubbleEllipsesOutline,
    IoShieldCheckmarkOutline,
    IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { postWithAuth, getAuthToken } from '../utils/apiUtils';
import { isAuthenticated, authenticatedFetch } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSenseLeaderboard from '../components/AdSenseLeaderboard';
import AdSenseHorizontal from '../components/AdSenseHorizontal';

function ContactSupportPage() {
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

    // Contact options untuk quick access
    const contactOptions = [
        {
            icon: IoHelpCircleOutline,
            title: "Pertanyaan Umum",
            description: "Untuk pertanyaan seputar fitur dan penggunaan IndoQuran",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            icon: IoChatbubbleEllipsesOutline,
            title: "Saran & Masukan",
            description: "Sampaikan ide dan saran untuk pengembangan platform",
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            icon: IoShieldCheckmarkOutline,
            title: "Laporan Bug",
            description: "Laporkan masalah teknis atau error yang ditemukan",
            bgColor: "bg-red-100",
            iconColor: "text-red-600"
        }
    ];

    const contactInfo = [
        {
            icon: IoMailOutline,
            title: "Email",
            content: "kontak@indoquran.web.id",
            description: "Tim support siap membantu Anda"
        },
        {
            icon: IoTimeOutline,
            title: "Response Time",
            content: "1-2 Hari Kerja",
            description: "Kami berkomitmen merespons cepat"
        },
        {
            icon: IoLocationOutline,
            title: "Lokasi",
            content: "Indonesia",
            description: "Melayani seluruh Indonesia"
        }
    ];

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

        // Frontend validation
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = ['Nama tidak boleh kosong'];
        if (!formData.email?.trim()) newErrors.email = ['Email tidak boleh kosong'];
        if (!formData.subject?.trim()) newErrors.subject = ['Subjek tidak boleh kosong'];
        if (!formData.message?.trim()) newErrors.message = ['Pesan tidak boleh kosong'];

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = new FormData();
            
            // Add each field individually with trimmed values
            submitData.append('name', formData.name.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('subject', formData.subject.trim());
            submitData.append('message', formData.message.trim());
            
            if (selectedFile) {
                submitData.append('attachment', selectedFile);
            }

            console.log('Submitting contact form with data:', {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                hasFile: !!selectedFile
            });

            const response = isAuthenticated() 
                ? await postWithAuth('/api/contact', submitData)
                : await fetch('/api/contact', {
                    method: 'POST',
                    body: submitData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
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
                console.error('Contact submission failed:', response.status, errorData);
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
                title="Hubungi Kami - IndoQuran Customer Support & Bantuan"
                description="Hubungi tim IndoQuran untuk pertanyaan, saran, bantuan teknis, atau masukan. Customer service responsive 24/7 siap membantu Anda."
            />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white pt-16">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoMailOutline className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Hubungi Kami
                        </h1>
                        <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                            Kami senang mendengar dari Anda. Tim customer support IndoQuran siap membantu!
                        </p>
                        
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform -rotate-12"></div>
                        </div>
                    </div>
                </div>

                {/* Contact Options */}
                <div className="relative -mt-8">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            {contactOptions.map((option, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                                    <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <option.icon className={`w-6 h-6 ${option.iconColor}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Billboard Ad (Detik.com Pattern) */}
                <AdSenseLeaderboard maxWidth="max-w-6xl" labelText="IKLAN" className="my-6" />

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
                                <p className="text-gray-600">
                                    Isi form di bawah ini dan kami akan merespons sesegera mungkin
                                </p>
                            </div>

                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 mr-2" />
                                        <p className="text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            )}

                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-red-800">{errors.general}</p>
                                </div>
                            )}

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
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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

                        {/* Contact Information */}
                        <div className="space-y-6">
                            {/* Contact Info Cards */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Kontak</h2>
                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <info.icon className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                                                <p className="text-green-600 font-medium mb-1">{info.content}</p>
                                                <p className="text-gray-600 text-sm">{info.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ Quick Links */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                                <h2 className="text-2xl font-bold mb-4">Pertanyaan Umum</h2>
                                <p className="text-blue-100 mb-6">
                                    Sebelum menghubungi kami, cek dulu FAQ untuk jawaban cepat atas pertanyaan umum
                                </p>
                                <div className="space-y-3">
                                    <div className="text-sm">
                                        <p className="font-medium">• Bagaimana cara bookmark ayat?</p>
                                        <p className="font-medium">• Cara menggunakan fitur pencarian?</p>
                                        <p className="font-medium">• Troubleshooting audio player?</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/bantuan')}
                                    className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Lihat FAQ Lengkap
                                </button>
                            </div>

                            {/* Community Support */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
                                <h2 className="text-2xl font-bold mb-4">Bergabung dengan Komunitas</h2>
                                <p className="text-green-100 mb-4">
                                    Bergabunglah dengan komunitas IndoQuran untuk berbagi pengalaman dan saling membantu
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={() => navigate('/doa-bersama')}
                                        className="bg-white text-green-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-center"
                                    >
                                        Doa Bersama
                                    </button>
                                    <button 
                                        onClick={() => navigate('/member')}
                                        className="bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-900 transition-colors font-medium text-center"
                                    >
                                        Member Area
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Break Ad (Detik.com Pattern) */}
                    <div className="w-full my-8">
                        <AdSenseHorizontal 
                            adSlot="1519827772"
                            showLabel={true}
                            labelText="IKLAN"
                            minHeight="90px"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactSupportPage;
