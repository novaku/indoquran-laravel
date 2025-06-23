import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    UsersIcon, 
    ChatBubbleLeftRightIcon, 
    HeartIcon, 
    MagnifyingGlassIcon, 
    BookOpenIcon, 
    DocumentTextIcon,
    ArrowRightStartOnRectangleIcon,
    ChartBarIcon,
    EyeIcon,
    CalendarIcon,
    EnvelopeIcon,
    EnvelopeOpenIcon,
    PaperAirplaneIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    console.log('AdminDashboard component starting to load...');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [adminUser, setAdminUser] = useState(null);
    const [replyModal, setReplyModal] = useState({ isOpen: false, contact: null });
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [contactFilter, setContactFilter] = useState('all'); // 'all', 'unread', 'read'
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AdminDashboard useEffect running...');
        // Check if admin is logged in
        const storedAdminUser = localStorage.getItem('admin_user');
        if (!storedAdminUser) {
            navigate('/admin/login');
            return;
        }

        try {
            const userData = JSON.parse(storedAdminUser);
            if (!userData.is_admin) {
                toast.error('Akses tidak diizinkan');
                navigate('/admin/login');
                return;
            }
            setAdminUser(userData);
        } catch (error) {
            console.error('Error parsing admin user data:', error);
            navigate('/admin/login');
            return;
        }

        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            // Get fresh CSRF token (same approach as login page)
            const csrfResponse = await fetch('/admin/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            let csrfToken = '';
            if (csrfResponse.ok) {
                const csrfData = await csrfResponse.json();
                csrfToken = csrfData.csrf_token;
                // Update meta tag
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.setAttribute('content', csrfToken);
                }
            } else {
                // Fallback to meta tag
                csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            }

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

            console.log('Dashboard response status:', response.status);
            console.log('Dashboard response headers:', response.headers.get('content-type'));

            if (response.ok) {
                const data = await response.json();
                console.log('Dashboard data received:', data);
                console.log('Setting dashboard data to state...');
                setDashboardData(data);
                console.log('Dashboard data set successfully');
            } else {
                const responseText = await response.text();
                console.error('Dashboard error response:', responseText);
                
                if (response.status === 403 || response.status === 401) {
                    toast.error('Sesi admin telah berakhir. Silakan login kembali.');
                    localStorage.removeItem('admin_user');
                    navigate('/admin/login');
                } else if (responseText.includes('<!DOCTYPE')) {
                    toast.error('Terjadi kesalahan pada server. Silakan login kembali.');
                    localStorage.removeItem('admin_user');
                    navigate('/admin/login');
                } else {
                    toast.error('Gagal memuat data dashboard');
                }
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            if (error.message.includes('Failed to fetch')) {
                toast.error('Koneksi ke server gagal. Periksa koneksi internet Anda.');
            } else {
                toast.error('Terjadi kesalahan saat memuat dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_user');
        toast.success('Logout berhasil');
        navigate('/admin/login');
    };

    const markAsRead = async (contactId) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(`/api/admin/contacts/${contactId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                // Update local state
                setDashboardData(prev => ({
                    ...prev,
                    recent_activities: {
                        ...prev.recent_activities,
                        contacts: prev.recent_activities.contacts.map(contact =>
                            contact.id === contactId ? { ...contact, is_read: true } : contact
                        )
                    }
                }));
                toast.success('Pesan ditandai sebagai sudah dibaca');
            } else {
                toast.error('Gagal menandai pesan sebagai sudah dibaca');
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const openReplyModal = (contact) => {
        setReplyModal({ isOpen: true, contact });
        setReplyMessage('');
    };

    const closeReplyModal = () => {
        setReplyModal({ isOpen: false, contact: null });
        setReplyMessage('');
    };

    const sendReply = async () => {
        if (!replyMessage.trim()) {
            toast.error('Pesan balasan tidak boleh kosong');
            return;
        }

        setSendingReply(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(`/api/admin/contacts/${replyModal.contact.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    message: replyMessage
                })
            });

            if (response.ok) {
                toast.success('Balasan berhasil dikirim');
                closeReplyModal();
                // Mark as read after replying
                markAsRead(replyModal.contact.id);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || 'Gagal mengirim balasan');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Terjadi kesalahan saat mengirim balasan');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) {
        console.log('AdminDashboard still loading, showing spinner...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Memuat dashboard admin...</p>
                </div>
            </div>
        );
    }

    console.log('AdminDashboard rendering main content. DashboardData:', dashboardData);

    // Add safety check for dashboard data
    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <p className="text-gray-600">Data dashboard tidak tersedia</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                        Muat Ulang
                    </button>
                </div>
            </div>
        );
    }

    console.log('AdminDashboard rendering main content. DashboardData:', dashboardData);

    const stats = dashboardData?.stats || {};
    const recentActivities = dashboardData?.recent_activities || {};

    console.log('Dashboard rendering with:', { dashboardData, stats, recentActivities });

    const statCards = [
        {
            title: 'Total Pengguna',
            value: stats.total_users || 0,
            icon: UsersIcon,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Pesan Kontak',
            value: stats.total_contacts || 0,
            subtitle: `${recentActivities.contacts?.filter(c => !c.is_read)?.length || 0} belum dibaca`,
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-green-500',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Doa Bersama',
            value: stats.total_prayers || 0,
            icon: HeartIcon,
            color: 'bg-pink-500',
            bgColor: 'bg-pink-50'
        },
        {
            title: 'Pencarian',
            value: stats.total_search_terms || 0,
            icon: MagnifyingGlassIcon,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Total Surah',
            value: stats.total_surahs || 0,
            icon: BookOpenIcon,
            color: 'bg-emerald-500',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Total Ayat',
            value: stats.total_ayahs || 0,
            icon: DocumentTextIcon,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Panel administrasi IndoQuran</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {adminUser && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                                    <p className="text-xs text-gray-500">{adminUser.email}</p>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statCards.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
                                <div className="flex items-center">
                                    <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                                        {stat.subtitle && (
                                            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Ringkasan', icon: ChartBarIcon },
                                { id: 'users', label: 'Pengguna Terbaru', icon: UsersIcon },
                                { id: 'contacts', label: 'Kontak Terbaru', icon: ChatBubbleLeftRightIcon },
                                { id: 'prayers', label: 'Doa Terbaru', icon: HeartIcon },
                                { id: 'searches', label: 'Pencarian Populer', icon: MagnifyingGlassIcon }
                            ].map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                    >
                                        <IconComponent className="h-4 w-4 mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="text-center py-8">
                                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard IndoQuran</h3>
                                <p className="text-gray-600">
                                    Selamat datang di panel administrasi. Gunakan tab di atas untuk melihat data terkini.
                                </p>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Pengguna Terbaru</h3>
                                <div className="space-y-3">
                                    {recentActivities.users?.length > 0 ? (
                                        recentActivities.users.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Belum ada data pengguna</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contacts Tab */}
                        {activeTab === 'contacts' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Pesan Kontak Terbaru</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setContactFilter('all')}
                                            className={`px-3 py-1 text-sm rounded-md ${
                                                contactFilter === 'all'
                                                    ? 'bg-emerald-100 text-emerald-800 font-medium'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Semua
                                        </button>
                                        <button
                                            onClick={() => setContactFilter('unread')}
                                            className={`px-3 py-1 text-sm rounded-md ${
                                                contactFilter === 'unread'
                                                    ? 'bg-blue-100 text-blue-800 font-medium'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Belum Dibaca
                                        </button>
                                        <button
                                            onClick={() => setContactFilter('read')}
                                            className={`px-3 py-1 text-sm rounded-md ${
                                                contactFilter === 'read'
                                                    ? 'bg-gray-100 text-gray-800 font-medium'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            Sudah Dibaca
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {(() => {
                                        let filteredContacts = recentActivities.contacts || [];
                                        
                                        if (contactFilter === 'unread') {
                                            filteredContacts = filteredContacts.filter(contact => !contact.is_read);
                                        } else if (contactFilter === 'read') {
                                            filteredContacts = filteredContacts.filter(contact => contact.is_read);
                                        }
                                        
                                        return filteredContacts.length > 0 ? (
                                            filteredContacts.map((contact) => (
                                                <div key={contact.id} className={`p-4 rounded-lg border ${
                                                    !contact.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{contact.name}</p>
                                                                <p className="text-sm text-gray-600">{contact.email}</p>
                                                            </div>
                                                            {!contact.is_read && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                                                                    Belum Dibaca
                                                                </span>
                                                            )}
                                                            {contact.is_read && (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    <EnvelopeOpenIcon className="h-3 w-3 mr-1" />
                                                                    Sudah Dibaca
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(contact.created_at).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">{contact.subject}</p>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{contact.message}</p>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                                                        <button
                                                            onClick={() => openReplyModal(contact)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                        >
                                                            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                                                            Balas
                                                        </button>
                                                        {!contact.is_read && (
                                                            <button
                                                                onClick={() => markAsRead(contact.id)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1" />
                                                                Tandai Dibaca
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">
                                                {contactFilter === 'unread' ? 'Tidak ada pesan yang belum dibaca' :
                                                 contactFilter === 'read' ? 'Tidak ada pesan yang sudah dibaca' :
                                                 'Belum ada pesan kontak'}
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Prayers Tab */}
                        {activeTab === 'prayers' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Doa Bersama Terbaru</h3>
                                <div className="space-y-3">
                                    {recentActivities.prayers?.length > 0 ? (
                                        recentActivities.prayers.map((prayer) => (
                                            <div key={prayer.id} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-medium text-gray-900">
                                                        {prayer.user?.name || 'Anonim'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(prayer.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-3">{prayer.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Belum ada doa bersama</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Searches Tab */}
                        {activeTab === 'searches' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Pencarian Populer</h3>
                                <div className="space-y-3">
                                    {recentActivities.popular_searches?.length > 0 ? (
                                        recentActivities.popular_searches.map((search, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-gray-900">{search.term}</p>
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {search.search_count} kali
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Belum ada data pencarian</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Modal */}
            {replyModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-transparent transition-opacity" 
                            aria-hidden="true"
                            onClick={closeReplyModal}
                        ></div>

                        {/* Center the modal */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Balas Pesan Kontak
                                            </h3>
                                            <button
                                                onClick={closeReplyModal}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                        
                                        {/* Contact Info */}
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                            <p className="text-sm font-medium text-gray-900">Kepada: {replyModal.contact?.name}</p>
                                            <p className="text-sm text-gray-600">Email: {replyModal.contact?.email}</p>
                                            <p className="text-sm text-gray-600">Subjek: {replyModal.contact?.subject}</p>
                                        </div>

                                        {/* Original Message */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pesan Asli:
                                            </label>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
                                                {replyModal.contact?.message}
                                            </div>
                                        </div>

                                        {/* Reply Message */}
                                        <div className="mb-4">
                                            <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-2">
                                                Pesan Balasan:
                                            </label>
                                            <textarea
                                                id="reply-message"
                                                rows={6}
                                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                                placeholder="Tulis balasan Anda di sini..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    disabled={sendingReply || !replyMessage.trim()}
                                    onClick={sendReply}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                                        sendingReply || !replyMessage.trim()
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                                    }`}
                                >
                                    {sendingReply ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Mengirim...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                            Kirim Balasan
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeReplyModal}
                                    disabled={sendingReply}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
