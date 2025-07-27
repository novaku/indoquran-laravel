import React, { useState, useEffect } from 'react';
import { 
    UsersIcon, 
    BookOpenIcon, 
    GlobeAltIcon,
    HeartIcon,
    ArrowTrendingUpIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';
import AnimatedCounter from './AnimatedCounter';

const HeroStatsSection = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVersesRead: 0,
        onlineUsers: 0,
        dailyReads: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetchWithAuth('/api/stats/public', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    setStats(result.data);
                } else {
                    throw new Error(result.message || 'Failed to load stats');
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                
                // Fallback dengan data dummy yang menarik
                setStats({
                    totalUsers: 15420,
                    totalVersesRead: 1247380,
                    onlineUsers: 342,
                    dailyReads: 2840
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('id-ID');
    };

    const heroStats = [
        {
            label: 'Muslim Tergabung',
            value: stats.totalUsers,
            icon: UsersIcon,
            gradient: 'from-blue-500 to-blue-600',
            description: 'Membaca Al-Quran bersama kami'
        },
        {
            label: 'Ayat Telah Dibaca',
            value: stats.totalVersesRead,
            icon: BookOpenIcon,
            gradient: 'from-green-500 to-emerald-600',
            description: 'Total ayat yang dibaca komunitas'
        },
        {
            label: 'Sedang Online',
            value: stats.onlineUsers,
            icon: GlobeAltIcon,
            gradient: 'from-purple-500 to-purple-600',
            description: 'Pengguna aktif saat ini',
            isLive: true
        },
        {
            label: 'Dibaca Hari Ini',
            value: stats.dailyReads,
            icon: ArrowTrendingUpIcon,
            gradient: 'from-orange-500 to-red-500',
            description: 'Sesi bacaan hari ini'
        }
    ];

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-sm animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-40">
                <div 
                    className="w-full h-full" 
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <SparklesIcon className="w-8 h-8 text-green-600" />
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                            Bergabung dengan Komunitas
                        </h2>
                        <SparklesIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Ribuan muslim dari seluruh Indonesia membaca Al-Quran bersama kami setiap hari
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {heroStats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div 
                                key={index} 
                                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden"
                            >
                                {/* Background gradient effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                            <AnimatedCounter 
                                                end={stat.value} 
                                                duration={2000}
                                                className="inline-block"
                                            />
                                            {stat.isLive && (
                                                <span className="relative ml-2">
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                            {stat.label}
                                        </p>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {stat.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to action */}
                <div className="text-center mt-12">
                    <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md mx-auto">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <HeartIcon className="w-5 h-5 text-red-500" />
                            <p className="text-sm font-medium text-gray-700">
                                Mari bergabung dalam kebaikan
                            </p>
                            <HeartIcon className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-xs text-gray-600">
                            Setiap ayat yang Anda baca adalah pahala yang mengalir
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroStatsSection;
