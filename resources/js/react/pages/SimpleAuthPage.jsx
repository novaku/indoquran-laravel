import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    BookOpenIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';

function SimpleAuthPage() {
    const { action } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const isLogin = action === 'login';
    const isRegister = action === 'register';
    
    useEffect(() => {
        setErrors({});
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: ''
        });
    }, [action]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear field-specific error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email tidak valid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }
        
        if (isRegister) {
            if (!formData.name) {
                newErrors.name = 'Nama wajib diisi';
            } else if (formData.name.length < 2) {
                newErrors.name = 'Nama minimal 2 karakter';
            }
            
            if (!formData.password_confirmation) {
                newErrors.password_confirmation = 'Silakan konfirmasi password Anda';
            } else if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Password tidak cocok';
            }
        }
        
        return newErrors;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        setErrors({});
        
        try {
            const result = await login(formData, isRegister);
            
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                setErrors({ submit: result.message || 'Autentikasi gagal' });
            }
        } catch (error) {
            console.error('Auth error:', error);
            setErrors({ 
                submit: error.message || 'Terjadi kesalahan. Silakan coba lagi.' 
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <SEOHead 
                title={`${isLogin ? 'Masuk' : 'Buat Akun'} - IndoQuran`}
                description={`${isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'} untuk menyimpan progres baca dan bookmark Anda.`}
            />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">IndoQuran</span>
                    </Link>
                </div>
                
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    {isLogin ? 'Masuk ke akun Anda' : 'Buat akun Anda'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isLogin ? (
                        <>
                            Belum punya akun?{' '}
                            <Link 
                                to="/auth/register" 
                                className="font-medium text-green-600 hover:text-green-500"
                            >
                                Buat di sini
                            </Link>
                        </>
                    ) : (
                        <>
                            Sudah punya akun?{' '}
                            <Link 
                                to="/auth/login" 
                                className="font-medium text-green-600 hover:text-green-500"
                            >
                                Masuk
                            </Link>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                    {/* Error Message */}
                    {errors.submit && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{errors.submit}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Name Field (Register only) */}
                        {isRegister && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nama Lengkap
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required={isRegister}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Alamat Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan email Anda"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder={isLogin ? "Masukkan password Anda" : "Buat password"}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            {isRegister && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Minimal 6 karakter
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field (Register only) */}
                        {isRegister && (
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                    Konfirmasi Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required={isRegister}
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                                            errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Konfirmasi password Anda"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    isLogin ? 'Masuk' : 'Buat Akun'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Additional Links */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Atau</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Lanjutkan tanpa akun
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimpleAuthPage;
