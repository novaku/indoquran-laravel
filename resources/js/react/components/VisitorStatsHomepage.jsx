import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const VisitorStatsHomepage = () => {
    const [stats, setStats] = useState(null);
    const [realtimeStats, setRealtimeStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch statistics data
    const fetchStats = async () => {
        try {
            const response = await fetch('/api/visitor-stats/');
            const data = await response.json();
            
            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.message || 'Gagal mengambil data statistik');
            }
        } catch (err) {
            setError('Gagal mengambil data statistik: ' + err.message);
        }
    };

    // Fetch realtime statistics
    const fetchRealtimeStats = async () => {
        try {
            const response = await fetch('/api/visitor-stats/realtime');
            const data = await response.json();
            
            if (data.success) {
                setRealtimeStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching realtime stats:', err);
        }
    };

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchStats();
            await fetchRealtimeStats();
            setLoading(false);
        };

        loadData();
    }, []);

    // Set up realtime refresh
    useEffect(() => {
        const interval = setInterval(fetchRealtimeStats, 60000); // Update every 1 minute
        return () => clearInterval(interval);
    }, []);

    // Format number with thousand separators
    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Chart configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#666'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: '#666'
                }
            }
        },
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat statistik pengunjung...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">❌</div>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const dailyChartData = {
        labels: stats?.daily?.slice(-7).map(d => new Date(d.date).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric' 
        })) || [],
        datasets: [
            {
                label: 'Pengunjung Harian',
                data: stats?.daily?.slice(-7).map(d => d.visitors) || [],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const hourlyChartData = {
        labels: stats?.hourly?.filter((_, index) => index % 4 === 0).map(h => `${h.hour}:00`) || [],
        datasets: [
            {
                label: 'Pengunjung per Jam',
                data: stats?.hourly?.filter((_, index) => index % 4 === 0).map(h => h.visitors) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 4,
            },
        ],
    };

    const browserChartData = {
        labels: stats?.browser_stats?.map(b => b.browser) || [],
        datasets: [
            {
                data: stats?.browser_stats?.map(b => b.count) || [],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Summary Cards */}
            <div className="pt-2 pb-6 px-6 bg-gray-50">
                {/* Real-time indicator */}
                {realtimeStats && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            <span className="text-sm text-gray-600">Data real-time</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                            Diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-lg p-2 mr-3">
                                <span className="text-green-600 text-lg">👥</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Hari Ini</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatNumber(stats?.summary?.today || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-blue-100 rounded-lg p-2 mr-3">
                                <span className="text-blue-600 text-lg">📅</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Minggu Ini</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatNumber(stats?.summary?.weekly || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-purple-100 rounded-lg p-2 mr-3">
                                <span className="text-purple-600 text-lg">📊</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Bulan Ini</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatNumber(stats?.summary?.monthly || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-orange-100 rounded-lg p-2 mr-3">
                                <span className="text-orange-600 text-lg">🎯</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatNumber(stats?.summary?.total || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {[
                        { id: 'overview', label: '📈 Ringkasan' },
                        { id: 'charts', label: '📊 Grafik' },
                        { id: 'popular', label: '🔥 Populer' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">📊 Tren 7 Hari Terakhir</h3>
                                <div className="h-64">
                                    <Line data={dailyChartData} options={chartOptions} />
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">⏰ Aktivitas per Jam</h3>
                                <div className="h-64">
                                    <Bar data={hourlyChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {realtimeStats && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                    Real-time Activity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{formatNumber(realtimeStats.last_five_minutes)}</p>
                                        <p className="text-sm text-gray-600">5 menit terakhir</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{formatNumber(realtimeStats.last_hour)}</p>
                                        <p className="text-sm text-gray-600">1 jam terakhir</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{formatNumber(realtimeStats.today_total)}</p>
                                        <p className="text-sm text-gray-600">Total hari ini</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Charts Tab */}
                {activeTab === 'charts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">📱 Browser Usage</h3>
                            <div className="h-64">
                                <Doughnut data={browserChartData} options={{...chartOptions, maintainAspectRatio: false}} />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">📈 Tren Bulanan</h3>
                            <div className="h-64">
                                <Line data={{
                                    labels: stats?.monthly?.slice(-6).map(m => m.month_name_id) || [],
                                    datasets: [{
                                        label: 'Pengunjung Bulanan',
                                        data: stats?.monthly?.slice(-6).map(m => m.visitors) || [],
                                        borderColor: 'rgb(139, 92, 246)',
                                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                        tension: 0.4,
                                        fill: true,
                                    }]
                                }} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Popular Tab */}
                {activeTab === 'popular' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">🔥 Halaman Populer</h3>
                            <div className="space-y-2">
                                {stats?.popular_pages?.slice(0, 8).map((page, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{page.page_title}</p>
                                            <p className="text-xs text-gray-500 truncate">{page.path}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                                            {formatNumber(page.visit_count)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">📖 Surah Populer</h3>
                            <div className="space-y-2">
                                {stats?.popular_surahs?.slice(0, 8).map((surah, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Surah #{surah.surah_number}</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">
                                            {formatNumber(surah.visit_count)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorStatsHomepage;
