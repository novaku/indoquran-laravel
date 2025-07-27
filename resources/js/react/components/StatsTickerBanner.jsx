import React, { useState, useEffect } from 'react';
import { 
    UsersIcon, 
    BookOpenIcon, 
    ClockIcon,
    ArrowTrendingUpIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';

const StatsTickerBanner = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVersesRead: 0,
        onlineUsers: 0,
        dailyReads: 0,
        totalReadingSessions: 0
    });
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetchWithAuth('/api/stats/public', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        setStats(result.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching ticker stats:', error);
                // Fallback data
                setStats({
                    totalUsers: 16850,
                    totalVersesRead: 1387250,
                    onlineUsers: 398,
                    dailyReads: 3240,
                    totalReadingSessions: 98450
                });
            }
        };

        fetchStats();
        
        // Update every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('id-ID');
    };

    const statsItems = [
        {
            icon: UsersIcon,
            label: 'Muslim Tergabung',
            value: stats.totalUsers,
            color: 'text-blue-600'
        },
        {
            icon: BookOpenIcon,
            label: 'Ayat Dibaca',
            value: stats.totalVersesRead,
            color: 'text-green-600'
        },
        {
            icon: ArrowTrendingUpIcon,
            label: 'Sesi Bacaan',
            value: stats.totalReadingSessions,
            color: 'text-purple-600'
        },
        {
            icon: GlobeAltIcon,
            label: 'Sedang Online',
            value: stats.onlineUsers,
            color: 'text-orange-600',
            isLive: true
        },
        {
            icon: ClockIcon,
            label: 'Baca Hari Ini',
            value: stats.dailyReads,
            color: 'text-indigo-600'
        }
    ];

    // Auto-rotate stats every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % statsItems.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [statsItems.length]);

    return (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='m0 40h40v-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="flex items-center justify-center space-x-8 md:space-x-12">
                    {/* Logo or brand */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">Q</span>
                        </div>
                        <span className="text-sm font-semibold hidden sm:inline">IndoQuran Live</span>
                    </div>

                    {/* Rotating stats */}
                    <div className="flex-1 min-w-0">
                        <div className="relative h-8 overflow-hidden">
                            {statsItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const isActive = index === currentIndex;
                                
                                return (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 flex items-center justify-center space-x-3 transition-all duration-500 ${
                                            isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <IconComponent className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {item.label}:
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold">
                                                {formatNumber(item.value)}
                                            </span>
                                            {item.isLive && (
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-bold">LIVE</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="flex space-x-1 flex-shrink-0">
                        {statsItems.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? 'bg-white' : 'bg-white/40'
                                }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
                        style={{
                            left: `${20 + index * 30}%`,
                            animationDelay: `${index * 0.5}s`,
                            animationDuration: '4s'
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default StatsTickerBanner;
