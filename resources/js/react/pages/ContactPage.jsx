import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postWithAuth, getAuthToken, getAuthHeaders } from '../utils/apiUtils';

function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subjek wajib diisi';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Pesan wajib diisi';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Pesan terlalu pendek (minimal 10 karakter)';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // For contact API, we need to use a custom approach since it requires internal headers
            // but we still want to include auth token if available
            const authHeaders = getAuthHeaders();
            
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Internal-Request': process.env.VITE_INTERNAL_API_KEY || 'ind0Quran-Internal-Key-2025!',
                    ...authHeaders
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Terjadi kesalahan saat mengirim pesan');
                }
            } else {
                // Success
                setSuccessMessage(data.message || 'Pesan telah berhasil dikirim. Terima kasih!');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                
                // Redirect to homepage after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (error) {
            setErrors({
                general: error.message || 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pt-24 pb-20">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-islamic-green mb-6 border-b pb-3">Hubungi Kami</h1>
                
                {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {errors.general && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{errors.general}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <p className="text-gray-700 mb-6">
                    Kami sangat menghargai masukan, pertanyaan, dan saran dari Anda. 
                    Silakan isi formulir di bawah ini, dan tim kami akan menghubungi Anda secepatnya.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nama
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Subjek
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green ${
                                errors.subject ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Pesan
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="5"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green ${
                                errors.message ? 'border-red-300' : 'border-gray-300'
                            }`}
                        ></textarea>
                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || successMessage}
                            className={`w-full bg-islamic-green text-white py-2 px-4 rounded-md hover:bg-islamic-green-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-islamic-green ${
                                (isSubmitting || successMessage) ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-islamic-brown mb-3">Informasi Kontak</h2>
                    <div className="space-y-3">
                        <p className="flex items-center text-gray-700">
                            <svg className="h-5 w-5 mr-3 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            info@indoquran.id
                        </p>
                        <p className="flex items-center text-gray-700">
                            <svg className="h-5 w-5 mr-3 text-islamic-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Jakarta, Indonesia
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
