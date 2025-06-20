import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoHandRightOutline, IoAddOutline, IoHeartOutline } from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth, postWithAuth } from '../utils/apiUtils';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerCard from '../components/PrayerCard';
import PrayerForm from '../components/PrayerForm';
import PrayerFilters from '../components/PrayerFilters';
import SEOHead from '../components/SEOHead';

const PrayerPage = () => {
    const navigate = useNavigate();
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
    const fetchPrayers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
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
                setPrayers(newPrayers);
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
    }, [filters]);

    // Initial load and filter changes
    useEffect(() => {
        fetchPrayers(1);
    }, [filters]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page !== pagination.current_page) {
            fetchPrayers(page);
            // Scroll to top smoothly when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
                // Refresh the first page to show the new prayer
                fetchPrayers(1);
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

    return (
        <>
            <SEOHead 
                title="Doa Bersama - IndoQuran"
                description="Bergabunglah dalam doa bersama umat Islam. Posting doa, berikan amin, dan saling mendukung dalam spiritualitas."
                keywords="doa bersama, doa islam, amin, komunitas muslim, spiritual"
            />
            
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <IoArrowBackOutline className="w-5 h-5" />
                                <span>Kembali</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <IoHandRightOutline className="w-6 h-6 text-green-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Doa Bersama</h1>
                            </div>
                            
                            {user && (
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        showForm 
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    <IoAddOutline className="w-5 h-5" />
                                    {showForm ? 'Batal' : 'Kirim Doa'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Login Notice */}
                    {!user && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <IoHeartOutline className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-blue-800">
                                        Untuk dapat mengirim doa, memberikan amin, dan berkomentar, silakan{' '}
                                        <a href="/masuk" className="font-medium underline hover:no-underline">
                                            login
                                        </a>{' '}
                                        atau{' '}
                                        <a href="/auth/register" className="font-medium underline hover:no-underline">
                                            daftar
                                        </a>{' '}
                                        terlebih dahulu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prayer Form */}
                    {showForm && user && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <PrayerForm 
                                onSubmit={handleSubmitPrayer}
                                loading={submitting}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6">
                        <PrayerFilters 
                            filters={filters}
                            onFiltersChange={setFilters}
                            totalPrayers={pagination.total}
                        />
                    </div>

                    {/* Prayer List */}
                    <div className="space-y-4">
                        {loading && prayers.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : prayers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <IoHandRightOutline className="w-16 h-16 mx-auto" />
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
                            prayers.map((prayer) => (
                                <PrayerCard
                                    key={prayer.id}
                                    prayer={prayer}
                                    user={user}
                                    onAminToggle={handleAminToggle}
                                    onCommentSubmit={handleCommentSubmit}
                                />
                            ))
                        )}
                    </div>

                    {/* Simple Pagination */}
                    {pagination.last_page > 1 && !loading && prayers.length > 0 && (
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    pagination.current_page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                Sebelumnya
                            </button>
                            
                            <span className="text-sm text-gray-600">
                                Halaman {pagination.current_page} dari {pagination.last_page}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    pagination.current_page === pagination.last_page
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PrayerPage;
