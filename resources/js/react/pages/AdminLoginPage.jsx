import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { LockClosedIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { scrollToTop } from '../utils/scrollUtils';

const AdminLoginPage = () => {
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [formData, setFormData] = useState({
        email: '',
        otp_code: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const [sessionChecking, setSessionChecking] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [expiresAt, setExpiresAt] = useState(null);
    const [sessionInitialized, setSessionInitialized] = useState(false);
    const navigate = useNavigate();

    // Initialize session on component mount and check for existing admin session
    React.useEffect(() => {
        scrollToTop();
        const validateAdminSession = async (userData) => {

            try {
                // Get CSRF token first
                const csrfToken = await getCsrfToken();
                
                // Try to fetch admin dashboard data to validate session
                const response = await fetch('/api/admin/dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    return true; // Session is valid
                } else if (response.status === 401 || response.status === 403) {
                    console.log('Admin session unauthorized:', response.status);
                    return false; // Session is definitely invalid
                } else {
                    console.log('Admin session validation inconclusive:', response.status);
                    // For other errors (500, network issues, etc.), assume session might be valid
                    // to avoid repeatedly logging users out due to server issues
                    return 'inconclusive';
                }
            } catch (error) {
                console.error('Error validating admin session:', error);
                // Network errors - assume session might be valid to avoid false logouts
                return 'inconclusive';
            }
        };

        const checkExistingSession = async () => {
            try {
                const storedAdminUser = localStorage.getItem('admin_user');
                if (storedAdminUser) {
                    const userData = JSON.parse(storedAdminUser);
                    if (userData.is_admin) {
                        console.log('Found stored admin session, validating with server...');
                        
                        // Validate session with server
                        const validationResult = await validateAdminSession(userData);
                        
                        if (validationResult === true) {
                            console.log('Admin session validated, redirecting to dashboard...');
                            toast.success('Sesi admin masih aktif, mengarahkan ke dashboard...');
                            navigate('/admin/dashboard');
                            return true; // Session exists and is valid
                        } else if (validationResult === false) {
                            console.log('Admin session expired, removing stored data...');
                            localStorage.removeItem('admin_user');
                            toast.info('Sesi admin telah berakhir, silakan login kembali.');
                        } else {
                            // validationResult === 'inconclusive'
                            console.log('Could not validate session due to network/server issues, proceeding to dashboard...');
                            toast.success('Mengarahkan ke dashboard...');
                            navigate('/admin/dashboard');
                            return true; // Assume valid to avoid false logouts
                        }
                    } else {
                        // Invalid admin data, remove it
                        localStorage.removeItem('admin_user');
                    }
                }
            } catch (error) {
                console.error('Error checking existing admin session:', error);
                // Remove corrupted data
                localStorage.removeItem('admin_user');
            }
            return false; // No valid session found
        };

        const initializeSession = async () => {
            setSessionChecking(true);
            
            // First check if there's already a valid admin session
            if (await checkExistingSession()) {
                return; // Don't need to initialize if redirecting
            }

            try {
                console.log('Initializing admin session...');
                await getCsrfToken();
                setSessionInitialized(true);
                console.log('Admin session initialized successfully');
            } catch (error) {
                console.error('Failed to initialize session:', error);
                // Still set as initialized to allow user to try
                setSessionInitialized(true);
            } finally {
                setSessionChecking(false);
            }
        };

        initializeSession();
    }, [navigate]);

    // Countdown timer for OTP expiry
    React.useEffect(() => {
        let interval = null;
        if (expiresAt && countdown > 0) {
            interval = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(expiresAt).getTime();
                const difference = expiry - now;
                
                if (difference > 0) {
                    setCountdown(Math.floor(difference / 1000));
                } else {
                    setCountdown(0);
                    setOtpSent(false);
                    setStep('email');
                    toast.error('Kode OTP telah kadaluarsa. Silakan minta kode baru.');
                }
            }, 1000);
        } else if (countdown === 0) {
            clearInterval(interval);
        }
        
        return () => clearInterval(interval);
    }, [countdown, expiresAt]);

    const formatCountdown = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getCsrfToken = async () => {
        try {
            // First, try to get CSRF token from the dedicated endpoint
            // This ensures session is properly initialized
            const response = await fetch('/admin/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                // Also update the meta tag for future reference
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', data.csrf_token);
                }
                console.log('Fresh CSRF token obtained:', data.csrf_token.substring(0, 10) + '...');
                return data.csrf_token;
            } else {
                console.error('CSRF token endpoint failed:', response.status, response.statusText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error getting CSRF token:', error);
            
            // Fallback to meta tag
            const fallbackToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (fallbackToken) {
                console.log('Using fallback CSRF token from meta tag');
                return fallbackToken;
            }
            
            throw new Error('No CSRF token available');
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        if (!formData.email) {
            toast.error('Silakan masukkan email terlebih dahulu.');
            return;
        }

        if (!sessionInitialized) {
            toast.error('Session sedang diinisialisasi, silakan tunggu sebentar...');
            return;
        }

        setLoading(true);

        try {
            // Get fresh CSRF token
            console.log('Getting CSRF token for OTP request...');
            const csrfToken = await getCsrfToken();
            
            if (!csrfToken) {
                toast.error('CSRF token tidak ditemukan. Silakan refresh halaman.');
                setLoading(false);
                return;
            }

            console.log('Sending OTP request with token:', csrfToken.substring(0, 10) + '...');

            const response = await fetch('/admin/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email: formData.email })
            });

            console.log('OTP response status:', response.status);

            const data = await response.json();

            if (response.ok) {
                toast.success('Kode OTP telah dikirim ke email Anda!');
                setOtpSent(true);
                setStep('otp');
                setExpiresAt(data.expires_at);
                setCountdown(3600); // 1 hour in seconds
            } else {
                // Log response details for debugging
                console.error('Send OTP error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data
                });
                
                if (response.status === 419) {
                    toast.error('Session telah kadaluarsa. Memulai ulang session...');
                    // Try to reinitialize session and retry once
                    try {
                        console.log('Reinitializing session after 419 error...');
                        await getCsrfToken();
                        toast.error('Session telah diperbaharui. Silakan coba lagi.');
                    } catch (retryError) {
                        console.error('Failed to reinitialize session:', retryError);
                        toast.error('Gagal memperbaharui session. Silakan refresh halaman.');
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }
                } else {
                    toast.error(data.message || 'Gagal mengirim OTP. Silakan coba lagi.');
                }
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                toast.error('Koneksi gagal. Pastikan server berjalan dan coba lagi.');
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (step === 'email') {
            await handleSendOtp(e);
            return;
        }

        // OTP verification step
        if (!formData.otp_code || formData.otp_code.length !== 6) {
            toast.error('Silakan masukkan kode OTP 6 digit.');
            return;
        }

        setLoading(true);

        try {
            // Get fresh CSRF token
            const csrfToken = await getCsrfToken();

            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    email: formData.email,
                    otp_code: formData.otp_code,
                    remember: formData.remember
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Login berhasil! Selamat datang, Admin.');
                // Store admin user data
                localStorage.setItem('admin_user', JSON.stringify(data.user));
                navigate('/admin/dashboard');
            } else {
                toast.error(data.message || 'Login gagal. Silakan coba lagi.');
                
                // If OTP is invalid, allow user to request new OTP
                if (response.status === 422) {
                    setOtpSent(false);
                    setStep('email');
                    setCountdown(0);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setOtpSent(false);
        setCountdown(0);
        setFormData(prev => ({ ...prev, otp_code: '' }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-8">
            {/* Show loading spinner while checking existing session */}
            {sessionChecking ? (
                <div className="max-w-md w-full space-y-8 text-center">
                    <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Admin Panel
                    </h2>
                    <div className="flex flex-col items-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600">Memeriksa sesi admin...</p>
                    </div>
                </div>
            ) : (
            <div className="max-w-md w-full space-y-6">
                {/* Back to Homepage Navigation Bar */}
                <div className="flex items-center justify-between pb-1">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-700 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-xs backdrop-blur-xs transition-all duration-200 group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                    <Link 
                        to="/" 
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors"
                        title="Buka Halaman Utama IndoQuran"
                    >
                        <img 
                            src="/images/logo-icon.webp" 
                            alt="IndoQuran" 
                            className="w-5 h-5 object-contain"
                            width="20"
                            height="20"
                        />
                        <span>IndoQuran</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center mb-4">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Admin Panel
                    </h2>
                    <p className="text-gray-600">
                        {step === 'email' 
                            ? 'Masukkan email untuk menerima kode OTP'
                            : 'Masukkan kode OTP yang dikirim ke email Anda'
                        }
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white shadow-xl rounded-lg p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={step === 'otp'}
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm ${step === 'otp' ? 'bg-gray-50' : ''}`}
                                    placeholder="kontak@indoquran.web.id"
                                />
                            </div>
                        </div>

                        {/* OTP Field (shown only in OTP step) */}
                        {step === 'otp' && (
                            <div>
                                <label htmlFor="otp_code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode OTP (6 digit)
                                </label>
                                <input
                                    id="otp_code"
                                    name="otp_code"
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={formData.otp_code}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-center text-2xl letter-spacing-wider font-mono"
                                    placeholder="123456"
                                />
                                
                                {/* Countdown Timer */}
                                {countdown > 0 && (
                                    <div className="mt-2 text-center">
                                        <p className="text-sm text-gray-600">
                                            Kode akan kadaluarsa dalam: 
                                            <span className="font-mono font-bold text-red-600 ml-1">
                                                {formatCountdown(countdown)}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                
                                {/* Back to email button */}
                                <div className="mt-3 text-center">
                                    <button
                                        type="button"
                                        onClick={handleBackToEmail}
                                        className="text-sm text-emerald-600 hover:text-emerald-500 underline"
                                    >
                                        Kembali ke email
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Remember Me (only in email step) */}
                        {step === 'email' && (
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                                    Ingat saya
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || !sessionInitialized}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" color="white" />
                                ) : !sessionInitialized ? (
                                    'Menginisialisasi session...'
                                ) : (
                                    step === 'email' ? 'Kirim Kode OTP' : 'Masuk ke Admin Panel'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Notice & Back Option */}
                <div className="text-center space-y-3">
                    <p className="text-xs text-gray-500">
                        {step === 'email' 
                            ? 'Halaman ini khusus untuk administrator IndoQuran. Kode OTP akan dikirim ke email yang valid.'
                            : 'Periksa email Anda untuk kode OTP. Kode berlaku selama 1 jam.'
                        }
                        <br />
                        Akses tidak sah akan dicatat dan dilaporkan.
                    </p>
                    <div className="pt-1">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors hover:underline"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Batal &amp; kembali ke halaman utama</span>
                        </Link>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default AdminLoginPage;
