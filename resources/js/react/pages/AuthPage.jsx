import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AuthPage({ setUser }) {
    const { action } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    
    const isLogin = action === 'login';
    
    // Handle redirect after successful login
    useEffect(() => {
        if (loginSuccess) {
            // Add a small delay to ensure user state is properly set
            const timeout = setTimeout(() => {
                // Navigate to home page with replace to avoid back button issues
                navigate('/', { replace: true });
            }, 150);
            
            return () => clearTimeout(timeout);
        }
    }, [loginSuccess, navigate]);
    
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
        
        try {
            const url = isLogin ? '/api/login' : '/api/register';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                setErrors(data.errors || { message: data.message });
                setLoading(false);
                return;
            }
            
            // Set user and navigate to home
            if (data.user) {
                setUser(data.user);
                setLoading(false);
                
                // Trigger redirect via useEffect with a slight delay for state to propagate
                setTimeout(() => {
                    setLoginSuccess(true);
                }, 100);
            } else {
                setErrors({ message: 'Login successful but user data not returned.' });
                setLoading(false);
            }
        } catch (error) {
            setErrors({ message: 'Terjadi kesalahan. Silakan coba lagi.' });
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-md mx-auto px-4 py-8 pt-24">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {isLogin ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
                </h1>
                <p className="text-gray-600">
                    {isLogin 
                        ? 'Masuk untuk mengakses pengalaman Al-Quran yang personal' 
                        : 'Bergabunglah dengan kami untuk meningkatkan pengalaman membaca Al-Quran'
                    }
                </p>
            </div>
            
            {errors.message && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    <span className="block sm:inline">{errors.message}</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
                {!isLogin && (
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
                )}
                
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
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Kata Sandi
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Kata sandi Anda"
                    />
                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                </div>
                
                {!isLogin && (
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password_confirmation">
                            Konfirmasi Kata Sandi
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Konfirmasi kata sandi Anda"
                        />
                    </div>
                )}
                
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
                            isLogin ? 'Masuk' : 'Daftar'
                        )}
                    </button>
                </div>
                
                <div className="text-center text-gray-600 text-sm">
                    {isLogin ? (
                        <>
                            Belum punya akun?{' '}
                            <a href="/auth/register" className="text-green-600 hover:text-green-800 font-semibold hover:underline">
                                Daftar
                            </a>
                        </>
                    ) : (
                        <>
                            Sudah punya akun?{' '}
                            <a href="/auth/login" className="text-green-600 hover:text-green-800 font-semibold hover:underline">
                                Masuk
                            </a>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default AuthPage;
