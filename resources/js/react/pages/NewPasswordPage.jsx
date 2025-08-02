import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    BookOpenIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';

function NewPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        // Validate token on component mount
        const validateToken = async () => {
            if (!token || !email) {
                setTokenValid(false);
                return;
            }

            try {
                const response = await fetch('/api/password/validate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({ token, email })
                });

                setTokenValid(response.ok);
            } catch (error) {
                console.error('Token validation error:', error);
                setTokenValid(false);
            }
        };

        validateToken();
    }, [token, email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password minimal 8 karakter';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password harus mengandung huruf besar, kecil, dan angka';
        }
        
        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Konfirmasi password wajib diisi';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Password tidak cocok';
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
            const response = await fetch('/api/password/reset/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    token,
                    email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/masuk?message=password-reset-success');
                }, 3000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ submit: data.message || 'Terjadi kesalahan saat reset password' });
                }
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while validating token
    if (tokenValid === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Memvalidasi link reset password...</p>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (tokenValid === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl border border-red-200 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Link Tidak Valid
                        </h2>
                        
                        <p className="text-gray-600 mb-8">
                            Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
                        </p>
                        
                        <div className="space-y-3">
                            <Link
                                to="/reset-password"
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                            >
                                Minta Link Baru
                            </Link>
                            
                            <Link
                                to="/masuk"
                                className="block text-center text-red-600 hover:text-red-700 font-medium"
                            >
                                Kembali ke Halaman Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-50 rounded-full opacity-30 blur-3xl"></div>
            </div>
            
            <SEOHead 
                title="Buat Password Baru - IndoQuran"
                description="Buat password baru untuk akun IndoQuran Anda."
            />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                {/* Logo */}
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <BookOpenIcon className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            IndoQuran
                        </span>
                    </Link>
                </div>
                
                <div className="text-center mt-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">
                        {success ? 'Password Berhasil Diubah!' : 'Buat Password Baru'}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {success 
                            ? 'Anda akan dialihkan ke halaman masuk'
                            : `Untuk akun: ${email}`
                        }
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-sm py-10 px-6 shadow-2xl rounded-2xl border border-white/20 sm:px-12">
                    {success ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Password Berhasil Diubah!
                            </h3>
                            
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-green-800">
                                    Password Anda telah berhasil diubah. Anda sekarang dapat masuk dengan password baru.
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <Link
                                    to="/masuk"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <LockClosedIcon className="w-5 h-5 mr-2" />
                                    Masuk Sekarang
                                </Link>
                                
                                <p className="text-sm text-gray-500">
                                    Atau tunggu 3 detik untuk dialihkan otomatis...
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <LockClosedIcon className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            {/* Error Messages */}
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                            }`}
                                            placeholder="Masukkan password baru"
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
                                    <p className="mt-2 text-sm text-gray-500">
                                        Minimal 8 karakter dengan huruf besar, kecil, dan angka
                                    </p>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                                errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                            }`}
                                            placeholder="Konfirmasi password baru"
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                            Ubah Password
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Security Tips */}
                            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-800 mb-3">
                                    🔐 Tips Password Aman
                                </h3>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                                    <li>• Hindari informasi pribadi seperti tanggal lahir</li>
                                    <li>• Jangan gunakan password yang sama di berbagai akun</li>
                                    <li>• Simpan password di tempat yang aman</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NewPasswordPage;
