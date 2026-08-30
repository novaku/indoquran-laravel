import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    BookOpenIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { scrollToTop } from '../utils/scrollUtils';

function PasswordResetPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        scrollToTop();
    }, []);


    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Email wajib diisi');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Email tidak valid');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setResendCooldown(60); // 60 seconds cooldown
                
                // Start countdown
                const countdown = setInterval(() => {
                    setResendCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError(data.message || 'Terjadi kesalahan saat mengirim link reset password');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setResendCooldown(60);
                
                const countdown = setInterval(() => {
                    setResendCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError(data.message || 'Gagal mengirim ulang email');
            }
        } catch (error) {
            console.error('Resend error:', error);
            setError('Terjadi kesalahan. Silakan coba lagi.');
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
                title="Reset Password - IndoQuran"
                description="Reset password akun IndoQuran Anda untuk kembali mengakses fitur bookmark dan progres baca."
            />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                {/* Back Button */}
                <div className="mb-6">
                    <Link 
                        to="/masuk" 
                        className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Kembali ke halaman masuk
                    </Link>
                </div>

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
                        Reset Password
                    </h2>
                    <p className="text-lg text-gray-600">
                        {success 
                            ? 'Link reset password telah dikirim ke email Anda'
                            : 'Masukkan email Anda untuk menerima link reset password'
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
                                Email Berhasil Dikirim!
                            </h3>
                            
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-green-800">
                                    Link reset password telah dikirim ke email:
                                </p>
                                <p className="text-sm font-semibold text-green-900 mt-1">
                                    {email}
                                </p>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-6 space-y-2">
                                <p>� Periksa kotak masuk email Anda</p>
                                <p>� Cari email dari IndoQuran</p>
                                <p>🔗 Klik link untuk reset password</p>
                                <p>⏱️ Link akan kedaluwarsa dalam 60 menit</p>
                                <p>📁 Jika tidak ada di inbox, periksa folder spam</p>
                            </div>

                            {/* Resend Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0 || loading}
                                    className="w-full flex justify-center py-3 px-4 border border-green-600 text-sm font-medium rounded-xl text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? (
                                        <LoadingSpinner size="sm" />
                                    ) : resendCooldown > 0 ? (
                                        `Kirim ulang dalam ${resendCooldown}s`
                                    ) : (
                                        'Kirim ulang ke Email'
                                    )}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    to="/masuk"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Kembali ke Halaman Masuk
                                </Link>
                                
                                <Link
                                    to="/"
                                    className="block text-center text-green-600 hover:text-green-700 font-medium transition-colors"
                                >
                                    Lanjutkan ke Beranda
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`appearance-none block w-full px-4 py-3 pl-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                                error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                                            }`}
                                            placeholder="Masukkan email akun Anda"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Box */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex">
                                            <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
                                            <div className="ml-3">
                                                <p className="text-sm text-blue-800">
                                                    Pastikan email yang Anda masukkan adalah email yang terdaftar di akun IndoQuran Anda.
                                                </p>
                                            </div>
                                        </div>
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
                                            <EnvelopeIcon className="w-5 h-5 mr-2" />
                                            Kirim Link Reset ke Email
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Additional Help */}
                            <div className="mt-8 p-6 bg-gray-50 rounded-xl border">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                    💡 Tips Keamanan
                                </h3>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Gunakan password yang unik dan kuat</li>
                                    <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                                    <li>• Jangan gunakan password yang sama di berbagai situs</li>
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

export default PasswordResetPage;
