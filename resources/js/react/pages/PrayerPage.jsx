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
                description="Bergabunglah dalam doa bersama umat Islam. Posting doa, berikan amin, dan saling mendukung dalam spiritualitas. Komunitas muslim 24/7 siap berdoa bersama Anda."
                keywords="doa bersama, doa islam, amin, komunitas muslim, spiritual, doa real-time, komunitas doa online"
            />
            
            <div className="min-h-screen pt-16">
                {/* Extended Background Section - Hero + Main Content + Prayer List */}
                <div className="relative overflow-hidden">
                    {/* Background Slideshow - Extended to Prayer List */}
                    <div className="absolute inset-0 z-0">
                        <PrayerSlideshow className="w-full h-full" debug={false} minHeight="200vh" />
                    </div>
                    
                    {/* Light gradient overlay since background is now more subtle */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent via-black/5 to-black/10 z-1"></div>
                    
                    {/* Hero Section */}
                    <div className="relative z-10">
                        <div className="max-w-6xl mx-auto px-4 py-16 text-center flex items-center min-h-[500px]">
                            <div className="w-full">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-30 rounded-full mb-6 backdrop-blur-lg border-2 border-white/20">
                                    <IoHandRightOutline className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                                    Doa Bersama
                                </h1>
                                <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-xl bg-black/20 rounded-2xl p-6 backdrop-blur-sm">
                                    Bergabunglah dengan komunitas muslim untuk berdoa bersama, saling mendukung, 
                                    dan memperkuat ikatan spiritual
                                </p>
                                
                                {/* Action Button */}
                                {user && (
                                    <button
                                        onClick={() => setShowForm(!showForm)}
                                        className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 backdrop-blur-lg border-2 ${
                                            showForm 
                                                ? 'bg-white bg-opacity-20 text-green-600 hover:bg-opacity-30 border-white/30'
                                                : 'bg-white/90 text-green-600 hover:bg-white border-white/50'
                                        }`}
                                    >
                                        <IoAddOutline className="w-6 h-6" />
                                        {showForm ? 'Batal' : 'Kirim Doa Baru'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Over Background */}
                    <div className="relative max-w-6xl mx-auto px-4 pb-20 pt-8 z-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Login Notice */}
                            {!user && (
                                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-white mb-8 border border-white/30 shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white bg-opacity-25 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                            <IoHeartOutline className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2 drop-shadow-lg">Bergabung dengan Komunitas Doa</h3>
                                            <p className="text-white/90 mb-4 drop-shadow-md">
                                                Untuk dapat mengirim doa, memberikan amin, dan berkomentar, bergabunglah dengan 
                                                komunitas muslim IndoQuran
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button 
                                                    onClick={() => navigate('/masuk')}
                                                    className="bg-white/90 text-blue-600 px-6 py-2 rounded-full hover:bg-white transition-colors font-medium backdrop-blur-sm shadow-lg hover:shadow-xl"
                                                >
                                                    Masuk Sekarang
                                                </button>
                                                <button 
                                                    onClick={() => navigate('/auth/register')}
                                                    className="bg-blue-600/90 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl"
                                                >
                                                    Daftar Gratis
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prayer Form */}
                            {showForm && user && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 mb-8">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kirim Doa Baru</h2>
                                        <p className="text-gray-600">
                                            Bagikan doa Anda dengan komunitas muslim dan mari berdoa bersama
                                        </p>
                                    </div>
                                    <PrayerForm 
                                        onSubmit={handleSubmitPrayer}
                                        loading={submitting}
                                        onCancel={() => setShowForm(false)}
                                    />
                                </div>
                            )}

                            {/* Filters */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 mb-8">
                                <PrayerFilters 
                                    filters={filters}
                                    onFiltersChange={setFilters}
                                    totalPrayers={pagination.total}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prayer List Section - Over Background */}
                    <div className="relative max-w-6xl mx-auto px-4 pb-20 z-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Prayer List */}
                            <div className="space-y-6">
                                {loading && prayers.length === 0 ? (
                                    <div className="flex justify-center py-12">
                                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                                            <LoadingSpinner size="lg" />
                                        </div>
                                    </div>
                                ) : prayers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/30 shadow-2xl">
                                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                                <IoHandRightOutline className="w-12 h-12 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                                {filters.search || filters.category !== 'all' 
                                                    ? 'Tidak Ada Doa Ditemukan' 
                                                    : 'Belum Ada Doa'
                                                }
                                            </h3>
                                            <p className="text-white/90 text-lg mb-6 drop-shadow-md">
                                                {filters.search || filters.category !== 'all' 
                                                    ? 'Coba ubah filter atau kata kunci pencarian' 
                                                    : 'Jadilah yang pertama mengirim doa untuk komunitas'
                                                }
                                            </p>
                                            {user && !showForm && (
                                                <button
                                                    onClick={() => setShowForm(true)}
                                                    className="bg-white/90 text-green-600 px-8 py-3 rounded-full hover:bg-white transition-colors font-medium shadow-lg hover:shadow-xl backdrop-blur-sm"
                                                >
                                                    Kirim Doa Pertama
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    prayers.map((prayer) => (
                                        <div key={prayer.id} className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60">
                                            <PrayerCard
                                                prayer={prayer}
                                                user={user}
                                                onAminToggle={handleAminToggle}
                                                onCommentSubmit={handleCommentSubmit}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Enhanced Pagination */}
                            {pagination.last_page > 1 && !loading && prayers.length > 0 && (
                                <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} doa
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                                    pagination.current_page === 1
                                                        ? 'bg-gray-200/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                                                        : 'bg-green-600/90 text-white hover:bg-green-700 shadow-md hover:shadow-lg backdrop-blur-sm'
                                                }`}
                                            >
                                                Sebelumnya
                                            </button>
                                            
                                            <span className="text-sm text-gray-700 px-4 bg-white/50 rounded-full py-1 backdrop-blur-sm">
                                                Halaman {pagination.current_page} dari {pagination.last_page}
                                            </span>
                                            
                                            <button
                                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.last_page}
                                                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                                    pagination.current_page === pagination.last_page
                                                        ? 'bg-gray-200/50 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                                                        : 'bg-green-600/90 text-white hover:bg-green-700 shadow-md hover:shadow-lg backdrop-blur-sm'
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
                </div>

                {/* Visual Separator */}
                <div className="relative h-20 bg-gradient-to-b from-transparent to-green-50 -mt-10"></div>

                {/* Content Section - After Background */}
                <div className="bg-gradient-to-br from-green-50 via-blue-50 to-white">
                    <div className="max-w-6xl mx-auto px-4 py-16">
                        <div className="max-w-4xl mx-auto">
                            {/* Additional content can go here if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrayerPage;
