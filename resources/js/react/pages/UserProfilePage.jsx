import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoSaveOutline, IoLogOutOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth.jsx';
import { getWithAuth, putWithAuth } from '../utils/apiUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { Card, Button, Input, PageHeader, PageContent } from '../components/ui';
import { scrollToTop } from '../utils/scrollUtils';

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
        scrollToTop();
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
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                            Profil Saya
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                            Kelola informasi akun dan preferensi IndoQuran Anda
                        </p>
                    </div>
                </div>

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
                                {/* Basic Information Header with Avatar */}
                                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.name || 'Avatar'} 
                                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl border-2 border-emerald-500 shadow-sm">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Pengguna IndoQuran'}</h2>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        {user?.google_id && (
                                            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <svg className="w-3 h-3" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                                </svg>
                                                Terhubung dengan Akun Google
                                            </span>
                                        )}
                                    </div>
                                </div>

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

                                    {user?.google_id && (
                                        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3.5 shadow-sm">
                                            <div className="flex-shrink-0 mt-0.5 text-emerald-600">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-sm text-emerald-900 leading-relaxed">
                                                <p className="font-semibold text-emerald-950 mb-1">
                                                    Informasi Akun Google
                                                </p>
                                                <p>
                                                    Karena Anda menggunakan login Google, password akun Anda sekarang adalah <code className="bg-white text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 select-all tracking-wider">indoquran</code>.
                                                </p>
                                                <p className="mt-1.5 text-xs text-emerald-700">
                                                    Anda dapat memasukkan <strong>indoquran</strong> pada kolom <em>Password Saat Ini</em> di bawah jika ingin mengganti password agar dapat login menggunakan email dan password secara manual.
                                                </p>
                                            </div>
                                        </div>
                                    )}

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
                                                    placeholder={user?.google_id ? "Masukkan password saat ini (default: indoquran)" : "Masukkan password saat ini"}
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
