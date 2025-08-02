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

    // Categories untuk quick access
    const prayerCategories = [
        {
            icon: IoHeartOutline,
            title: "Kesehatan",
            description: "Doa untuk kesehatan diri dan keluarga",
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
            category: "kesehatan"
        },
        {
            icon: IoStarOutline,
            title: "Rezeki",
            description: "Doa untuk kelancaran rezeki dan pekerjaan",
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            category: "rezeki"
        },
        {
            icon: IoPeopleOutline,
            title: "Keluarga",
            description: "Doa untuk keharmonisan keluarga",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            category: "keluarga"
        },
        {
            icon: IoCheckmarkCircleOutline,
            title: "Umum",
            description: "Doa-doa umum dan berbagai keperluan",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
            category: "umum"
        }
    ];

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
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white pt-16">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                            <IoHandRightOutline className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Doa Bersama
                        </h1>
                        <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed mb-8">
                            Bergabunglah dengan komunitas muslim untuk berdoa bersama, saling mendukung, 
                            dan memperkuat ikatan spiritual
                        </p>
                        
                        {/* Action Button */}
                        {user && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                    showForm 
                                        ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                        : 'bg-white text-green-600 hover:bg-gray-100'
                                }`}
                            >
                                <IoAddOutline className="w-6 h-6" />
                                {showForm ? 'Batal' : 'Kirim Doa Baru'}
                            </button>
                        )}
                        
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10">
                            <div className="w-full h-full bg-white rounded-full transform -rotate-12"></div>
                        </div>
                    </div>
                </div>

                {/* Prayer Categories */}
                <div className="max-w-6xl mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Doa</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Pilih kategori doa sesuai kebutuhan atau jelajahi semua doa dari komunitas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {prayerCategories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setFilters(prev => ({ ...prev, category: category.category }))}
                                className={`text-left bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                                    filters.category === category.category ? 'ring-2 ring-green-500 bg-green-50' : ''
                                }`}
                            >
                                <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center mb-4`}>
                                    <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                                <p className="text-gray-600 text-sm">{category.description}</p>
                            </button>
                        ))}
                    </div>
                    {/* Main Content Area */}
                    <div className="max-w-4xl mx-auto">
                        {/* Login Notice */}
                        {!user && (
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <IoHeartOutline className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">Bergabung dengan Komunitas Doa</h3>
                                        <p className="text-blue-100 mb-4">
                                            Untuk dapat mengirim doa, memberikan amin, dan berkomentar, bergabunglah dengan 
                                            komunitas muslim IndoQuran
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button 
                                                onClick={() => navigate('/masuk')}
                                                className="bg-white text-blue-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium"
                                            >
                                                Masuk Sekarang
                                            </button>
                                            <button 
                                                onClick={() => navigate('/auth/register')}
                                                className="bg-blue-800 text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors font-medium"
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
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                            <PrayerFilters 
                                filters={filters}
                                onFiltersChange={setFilters}
                                totalPrayers={pagination.total}
                            />
                        </div>

                        {/* Prayer List */}
                        <div className="space-y-6">
                            {loading && prayers.length === 0 ? (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : prayers.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <IoHandRightOutline className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-500 mb-4">
                                        {filters.search || filters.category !== 'all' 
                                            ? 'Tidak Ada Doa Ditemukan' 
                                            : 'Belum Ada Doa'
                                        }
                                    </h3>
                                    <p className="text-gray-400 text-lg mb-6">
                                        {filters.search || filters.category !== 'all' 
                                            ? 'Coba ubah filter atau kata kunci pencarian' 
                                            : 'Jadilah yang pertama mengirim doa untuk komunitas'
                                        }
                                    </p>
                                    {user && !showForm && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
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

                        {/* Enhanced Pagination */}
                        {pagination.last_page > 1 && !loading && prayers.length > 0 && (
                            <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} doa
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                                pagination.current_page === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                                            }`}
                                        >
                                            Sebelumnya
                                        </button>
                                        
                                        <span className="text-sm text-gray-600 px-4">
                                            Halaman {pagination.current_page} dari {pagination.last_page}
                                        </span>
                                        
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                                pagination.current_page === pagination.last_page
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
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
        </>
    );
};

export default PrayerPage;
