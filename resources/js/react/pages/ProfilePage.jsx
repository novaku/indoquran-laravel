import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilePage({ user, setUser }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(user || null);
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
    
    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
            return;
        }
        
        // Get the latest user data
        fetch('/api/profile')
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        navigate('/auth/login');
                    }
                    throw new Error('Failed to fetch profile');
                }
                return response.json();
            })
            .then(data => {
                setProfile(data);
                setFormData(prevData => ({
                    ...prevData,
                    name: data.name,
                    email: data.email
                }));
            })
            .catch(err => {
                setMessage({
                    type: 'error',
                    text: err.message
                });
            });
    }, [user, navigate]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage(null);
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                setErrors(data.errors || {});
                setMessage({
                    type: 'error',
                    text: data.message || 'Gagal memperbarui profil'
                });
                setLoading(false);
                return;
            }
            
            setProfile(data);
            setMessage({
                type: 'success',
                text: 'Profil berhasil diperbarui'
            });
            
            // Clear password fields
            setFormData(prevData => ({
                ...prevData,
                current_password: '',
                password: '',
                password_confirmation: ''
            }));
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Terjadi kesalahan. Silakan coba lagi.'
            });
        }
        
        setLoading(false);
    };
    
    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            
            // Clear user state and redirect
            if (setUser) setUser(null);
            navigate('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setMessage({
                type: 'error',
                text: 'Gagal logout. Silakan coba lagi.'
            });
        }
    };
    
    if (!profile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-md mx-auto px-4 py-8 pt-24">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Pengguna</h1>
                <p className="text-gray-600">Kelola pengaturan akun Anda untuk pengalaman Al-Quran yang personal</p>
            </div>
            
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
                    <span className="block sm:inline">{message.text}</span>
                </div>
            )}
            
            <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Nama
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nama lengkap Anda"
                        />
                        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Alamat email Anda"
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="mt-8 mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubah Kata Sandi</h3>
                        <p className="text-gray-600 text-sm mb-4">Biarkan kolom kata sandi kosong jika Anda tidak ingin mengubahnya</p>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="current_password">
                                Kata Sandi Saat Ini
                            </label>
                            <input
                                id="current_password"
                                type="password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                className={`appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.current_password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Kata sandi saat ini"
                            />
                            {errors.current_password && <p className="text-red-600 text-xs mt-1">{errors.current_password}</p>}
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Kata Sandi Baru
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Kata sandi baru"
                            />
                            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password_confirmation">
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Konfirmasi kata sandi baru"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full flex justify-center items-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                    
                    <div className="text-center text-gray-600 text-sm">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-green-600 hover:text-green-800 font-semibold hover:underline"
                        >
                            Keluar dari Akun
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
