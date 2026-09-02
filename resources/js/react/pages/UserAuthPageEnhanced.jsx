import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    BookOpenIcon,
    ExclamationCircleIcon,
    HeartIcon,
    SparklesIcon,
    ShieldCheckIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { scrollToTop } from '../utils/scrollUtils';

function UserAuthPage() {
    const location = useLocation();
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
    
    const isLogin = location.pathname === '/masuk';
    const isRegister = location.pathname === '/daftar';
    
    useEffect(() => {
        scrollToTop();
        setErrors({});
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: ''
        });
    }, [location.pathname]);

    
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-50 rounded-full opacity-30 blur-3xl"></div>
            </div>
            
            <SEOHead 
                title={`${isLogin ? 'Masuk' : 'Buat Akun'} - IndoQuran`}
                description={`${isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'} untuk menyimpan progres baca dan bookmark Anda.`}
            />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                {/* Logo */}
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <img 
                            src="/images/logo-icon.webp" 
                            alt="IndoQuran Logo" 
                            className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                            width="56"
                            height="56"
                        />
                        <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            IndoQuran
                        </span>
                    </Link>
                </div>
                
                <div className="text-center mt-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">
                        {isLogin ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        {isLogin ? 
                            'Masuk untuk melanjutkan perjalanan spiritual Anda' : 
                            'Bergabung dengan komunitas pembaca Al-Quran'
                        }
                    </p>
                    
                    {/* Quick Benefits */}
                    {isLogin && (
                        <div className="flex justify-center space-x-6 mb-6">
                            <div className="flex items-center space-x-1 text-green-600">
                                <BookmarkIcon className="w-4 h-4" />
                                <span className="text-sm">Bookmark</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                                <HeartIcon className="w-4 h-4" />
                                <span className="text-sm">Favorit</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                                <SparklesIcon className="w-4 h-4" />
                                <span className="text-sm">Progress</span>
                            </div>
                        </div>
                    )}
                </div>
                
                <p className="mt-4 text-center text-sm text-gray-600">
                    {isLogin ? (
                        <>
                            Belum punya akun?{' '}
                            <Link 
                                to="/daftar" 
                                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                            >
                                Buat di sini
                            </Link>
                        </>
                    ) : (
                        <>
                            Sudah punya akun?{' '}
                            <Link 
                                to="/masuk" 
                                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
                            >
                                Masuk
                            </Link>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-sm py-10 px-6 shadow-2xl rounded-2xl border border-white/20 sm:px-12">
                    {/* Error Message */}
                    {errors.submit && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                        }`}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                    }`}
                                    placeholder="Masukkan email Anda"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                    }`}
                                    placeholder={isLogin ? "Masukkan password Anda" : "Buat password"}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                            {isRegister && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Minimal 6 karakter
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field (Register only) */}
                        {isRegister && (
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                        className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                            errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                        }`}
                                        placeholder="Konfirmasi password Anda"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        )}

                        {/* Forgot Password Link (Login only) */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <Link
                                    to="/reset-password"
                                    className="text-sm text-green-600 hover:text-green-500 font-medium transition-colors"
                                >
                                    Lupa password?
                                </Link>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                        {isLogin ? 'Masuk' : 'Buat Akun'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Additional Links */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500 font-medium">Atau</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/"
                                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                <BookOpenIcon className="w-4 h-4 mr-2" />
                                Lanjutkan tanpa akun
                            </Link>
                        </div>

                        {/* Member Benefits Info */}
                        {isRegister && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                    <SparklesIcon className="w-4 h-4 mr-1" />
                                    Keuntungan Jadi Member
                                </h3>
                                <ul className="text-xs text-green-700 space-y-2">
                                    <li className="flex items-center">
                                        <BookmarkIcon className="w-3 h-3 mr-2" />
                                        Bookmark ayat favorit
                                    </li>
                                    <li className="flex items-center">
                                        <HeartIcon className="w-3 h-3 mr-2" />
                                        Catatan pribadi untuk setiap ayat
                                    </li>
                                    <li className="flex items-center">
                                        <SparklesIcon className="w-3 h-3 mr-2" />
                                        Tracking progress baca Al-Quran
                                    </li>
                                    <li className="flex items-center">
                                        <ShieldCheckIcon className="w-3 h-3 mr-2" />
                                        Bergabung komunitas doa bersama
                                    </li>
                                </ul>
                                <Link 
                                    to="/member" 
                                    className="text-xs text-green-600 hover:text-green-700 underline mt-3 inline-block font-medium"
                                >
                                    Lihat semua keuntungan →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAuthPage;
