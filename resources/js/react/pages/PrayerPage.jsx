import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth, postWithAuth } from '../utils/apiUtils';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerCard from '../components/PrayerCard';
import PrayerForm from '../components/PrayerForm';
import PrayerFilters from '../components/PrayerFilters';
import SEOHead from '../components/SEOHead';

const PrayerPage = () => {
    const { user } = useAuth();
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        category: 'all',
        sort: 'latest',
        search: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    // Fetch prayers
    const fetchPrayers = useCallback(async (page = 1, reset = false) => {
        try {
            setLoading(reset);
            const url = new URL('/api/doa-bersama', window.location.origin);
            url.searchParams.append('page', page);
            url.searchParams.append('category', filters.category);
            url.searchParams.append('sort', filters.sort);
            if (filters.search) {
                url.searchParams.append('search', filters.search);
            }

            const response = await fetchWithAuth(url.toString());
            const data = await response.json();

            if (data.success) {
                const newPrayers = data.data.data;
                setPrayers(reset ? newPrayers : [...prayers, ...newPrayers]);
                setPagination({
                    current_page: data.data.current_page,
                    last_page: data.data.last_page,
                    per_page: data.data.per_page,
                    total: data.data.total
                });
            }
        } catch (error) {
            console.error('Gagal memuat doa:', error);
            toast.error('Gagal memuat doa-doa');
        } finally {
            setLoading(false);
        }
    }, [filters, prayers]);

    // Initial load and filter changes
    useEffect(() => {
        fetchPrayers(1, true);
    }, [filters]);

    // Handle form submission
    const handleSubmitPrayer = async (prayerData) => {
        // Double check authentication
        if (!user) {
            toast.error('Anda harus login terlebih dahulu untuk mengirim doa');
            return;
        }

        try {
            setSubmitting(true);
            const response = await postWithAuth('/api/doa-bersama', prayerData);
            const data = await response.json();

            if (data.success) {
                toast.success('Doa berhasil dikirim');
                setShowForm(false);
                // Add new prayer to the top of the list
                setPrayers([data.data, ...prayers]);
            } else {
                // Handle authentication errors specifically
                if (response.status === 401) {
                    toast.error('Sesi Anda telah berakhir. Silakan login kembali');
                } else {
                    toast.error(data.message || 'Gagal mengirim doa');
                }
            }
        } catch (error) {
            console.error('Gagal mengirim doa:', error);
            if (error.response?.status === 401) {
                toast.error('Anda harus login untuk mengirim doa');
            } else {
                toast.error('Gagal mengirim doa');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle amin toggle
    const handleAminToggle = async (prayerId) => {
        if (!user) {
            toast.error('Silakan login untuk memberikan amin');
            return;
        }

        try {
            const response = await postWithAuth(`/api/doa-bersama/${prayerId}/amin`);
            const data = await response.json();

            if (data.success) {
                setPrayers(prayers.map(prayer => 
                    prayer.id === prayerId 
                        ? {
                            ...prayer,
                            user_has_amin: data.data.user_has_amin,
                            amin_count: data.data.amin_count
                        }
                        : prayer
                ));
                
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Gagal memberikan amin');
            }
        } catch (error) {
            console.error('Gagal mengubah status amin:', error);
            toast.error('Gagal memberikan amin');
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (prayerId, commentData) => {
        if (!user) {
            toast.error('Silakan login untuk memberikan komentar');
            return;
        }

        try {
            const response = await postWithAuth(`/api/doa-bersama/${prayerId}/comments`, commentData);
            const data = await response.json();

            if (data.success) {
                // Update prayer with new comment
                setPrayers(prayers.map(prayer => 
                    prayer.id === prayerId 
                        ? {
                            ...prayer,
                            comments: [...prayer.comments, data.data],
                            comment_count: prayer.comment_count + 1
                        }
                        : prayer
                ));
                
                toast.success('Komentar berhasil ditambahkan');
                return true;
            } else {
                toast.error(data.message || 'Gagal menambahkan komentar');
                return false;
            }
        } catch (error) {
            console.error('Gagal mengirim komentar:', error);
            toast.error('Gagal menambahkan komentar');
            return false;
        }
    };

    // Load more prayers
    const loadMore = () => {
        if (pagination.current_page < pagination.last_page) {
            fetchPrayers(pagination.current_page + 1, false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 to-islamic-gold/5 pb-20">
            <div className="max-w-4xl mx-auto py-8 px-4">
            <SEOHead 
                title="Doa Bersama - IndoQuran"
                description="Bergabunglah dalam doa bersama umat Islam. Posting doa, berikan amin, dan saling mendukung dalam spiritualitas."
                keywords="doa bersama, doa islam, amin, komunitas muslim, spiritual"
            />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-islamic-green mb-4">
                    🤲 Doa Bersama
                </h1>
                <p className="text-gray-600 mb-4">
                    Mari berdoa bersama dan saling mendukung dalam kebaikan
                </p>
                
                {/* Login Information */}
                {!user && (
                    <div className="bg-gradient-to-r from-islamic-green/10 to-islamic-gold/10 rounded-lg p-4 mb-6 mx-auto max-w-2xl">
                        <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-islamic-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-islamic-green">
                                ℹ️ Informasi Penting
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-3">
                            Untuk dapat <strong>mengirim doa</strong>, <strong>memberikan amin</strong>, dan <strong>mengomentari doa</strong>, 
                            Anda perlu login terlebih dahulu.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <a 
                                href="/auth/login" 
                                className="bg-islamic-green text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-islamic-green/90 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                🔑 Login
                            </a>
                            <span className="text-islamic-green text-sm">atau</span>
                            <a 
                                href="/auth/register" 
                                className="bg-islamic-green text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-islamic-green/90 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                📝 Daftar
                            </a>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="bg-gradient-to-r from-islamic-green/10 to-islamic-gold/10 rounded-lg p-4 mb-6 mx-auto max-w-2xl">
                        <div className="flex items-center justify-center mb-2">
                            <span className="text-sm font-semibold text-islamic-green">
                                ✨ Selamat datang, {user.name}!
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-3">
                            Anda dapat mengirim doa, memberikan amin, dan berkomentar pada doa-doa yang ada.
                        </p>
                    </div>
                )}
                
                {user && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {showForm ? '✖ Batal' : '+ Kirim Doa'}
                    </button>
                )}
            </div>

            {/* Prayer Form */}
            {showForm && user && (
                <div className="mb-8">
                    <PrayerForm 
                        onSubmit={handleSubmitPrayer}
                        loading={submitting}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Filters */}
            <PrayerFilters 
                filters={filters}
                onFiltersChange={setFilters}
                totalPrayers={pagination.total}
            />

            {/* Prayer List */}
            <div className="space-y-6">
                {loading && prayers.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : prayers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                            Belum ada doa
                        </h3>
                        <p className="text-gray-400">
                            {filters.search || filters.category !== 'all' 
                                ? 'Tidak ada doa yang sesuai dengan filter' 
                                : 'Jadilah yang pertama mengirim doa'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {prayers.map((prayer) => (
                            <PrayerCard
                                key={prayer.id}
                                prayer={prayer}
                                user={user}
                                onAminToggle={handleAminToggle}
                                onCommentSubmit={handleCommentSubmit}
                            />
                        ))}

                        {/* Load More Button */}
                        {pagination.current_page < pagination.last_page && (
                            <div className="text-center py-6">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="bg-islamic-green/10 hover:bg-islamic-green/20 text-islamic-green px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Not logged in message */}
            {!user && (
                <div className="bg-gradient-to-r from-islamic-gold/10 to-islamic-green/10 rounded-xl p-6 mt-8 shadow-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-islamic-gold" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-lg font-bold text-islamic-gold mb-2">
                                🤲 Bergabunglah dalam Doa Bersama
                            </h3>
                            <p className="text-sm text-gray-800 mb-4">
                                Untuk dapat mengirim doa, memberikan amin, dan berkomentar, Anda perlu login terlebih dahulu.
                            </p>
                            <div className="flex items-center gap-3">
                                <a 
                                    href="/auth/login" 
                                    className="bg-gradient-to-r from-islamic-green to-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:from-emerald-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    🔑 Login Sekarang
                                </a>
                                <span className="text-islamic-gold text-sm">atau</span>
                                <a 
                                    href="/auth/register" 
                                    className="bg-white text-islamic-green px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    📝 Daftar Baru
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default PrayerPage;
