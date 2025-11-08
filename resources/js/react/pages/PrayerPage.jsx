import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IoHandRightOutline, 
    IoAddOutline, 
    IoHeartOutline,
    IoPeopleOutline,
    IoTimeOutline,
    IoTrendingUpOutline,
    IoStarOutline,
    IoCheckmarkCircleOutline,
    IoEyeOutline
} from 'react-icons/io5';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth, postWithAuth } from '../utils/apiUtils';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerCard from '../components/PrayerCard';
import PrayerForm from '../components/PrayerForm';
import PrayerFilters from '../components/PrayerFilters';
import PrayerSlideshow from '../components/PrayerSlideshow';
import SimpleSlideshow from '../components/SimpleSlideshow';
import SEOHead from '../components/SEOHead';
import AdSenseVertical from '../components/AdSenseVertical';

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
                title="Doa Bersama - Komunitas Muslim Real-time | IndoQuran"
                description="Bergabunglah dalam doa bersama umat Islam. Post doa, berikan amin, dan saling mendukung dalam spiritualitas. Komunitas muslim 24/7 siap berdoa bersama Anda."
                keywords="doa bersama, doa islam, amin, komunitas muslim, spiritual, doa real-time, komunitas doa online"
            />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
                {/* Simple Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Doa Bersama</h1>
                            {user && (
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    {showForm ? 'Batal' : '+ Kirim Doa'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Login Notice */}
                    {!user && (
                        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <IoHeartOutline className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Bergabung dengan Komunitas Doa</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Login untuk mengirim doa, memberikan amin, dan berkomentar
                                    </p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => navigate('/masuk')}
                                            className="px-5 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm"
                                        >
                                            Masuk
                                        </button>
                                        <button 
                                            onClick={() => navigate('/auth/register')}
                                            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Daftar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prayer Form */}
                    {showForm && user && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Kirim Doa Baru</h2>
                            <PrayerForm 
                                onSubmit={handleSubmitPrayer}
                                loading={submitting}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    )}

                    {/* Filters - Simplified */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
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
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IoHandRightOutline className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {filters.search || filters.category !== 'all' 
                                        ? 'Tidak Ada Doa Ditemukan' 
                                        : 'Belum Ada Doa'
                                    }
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {filters.search || filters.category !== 'all' 
                                        ? 'Coba ubah filter atau kata kunci pencarian' 
                                        : 'Jadilah yang pertama mengirim doa'
                                    }
                                </p>
                                {user && !showForm && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
                                    >
                                        Kirim Doa Pertama
                                    </button>
                                )}
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

                    {/* Pagination */}
                    {pagination.last_page > 1 && !loading && prayers.length > 0 && (
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} doa
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            pagination.current_page === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        Sebelumnya
                                    </button>
                                    
                                    <span className="text-sm text-gray-700 px-3">
                                        {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            pagination.current_page === pagination.last_page
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PrayerPage;
