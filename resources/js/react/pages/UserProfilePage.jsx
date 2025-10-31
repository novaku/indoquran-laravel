import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoSaveOutline, IoLogOutOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth.jsx';
import { getWithAuth, putWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { Card, Button, Input, PageHeader, PageContent } from '../components/ui';

function UserProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/masuk');
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || ''
        }));
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage(null);

        try {
            const response = await putWithAuth('/api/profile', formData);
            
            if (response.ok) {
                const data = await response.json();
                updateUser(data.user);
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                }));
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setMessage({ type: 'error', text: errorData.message || 'Gagal memperbarui profil' });
                }
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            await logout();
            navigate('/');
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <>
            <SEOHead 
                title="Profil Saya - IndoQuran"
                description="Kelola informasi akun dan preferensi Anda"
            />
            
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <PageHeader
                    title="Profil Saya"
                    icon={<IoPersonOutline className="w-6 h-6" />}
                />

                {/* Content */}
                <PageContent size="md">
                    {message && (
                        <Card className={`mb-6 ${
                            message.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {message.text}
                        </Card>
                    )}

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                                
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                errors.name ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                errors.email ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                            placeholder="Masukkan alamat email"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Password Change */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Kosongkan bagian ini jika tidak ingin mengubah password
                                </p>
                                
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Saat Ini
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                id="current_password"
                                                name="current_password"
                                                value={formData.current_password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                    errors.current_password ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="Masukkan password saat ini"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.current ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.current_password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.current_password[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                    errors.password ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="Masukkan password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.new ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                                    errors.password_confirmation ? 'border-red-300' : 'border-gray-200'
                                                }`}
                                                placeholder="Konfirmasi password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.confirm ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                    loading={loading}
                                    leftIcon={<IoSaveOutline className="w-5 h-5" />}
                                >
                                    Simpan Perubahan
                                </Button>

                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleLogout}
                                    leftIcon={<IoLogOutOutline className="w-5 h-5" />}
                                >
                                    Keluar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </PageContent>
            </div>
        </>
    );
}

export default UserProfilePage;
