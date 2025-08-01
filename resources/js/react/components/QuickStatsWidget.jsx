import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QuickStatsWidget = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuickStats = async () => {
            try {
                const response = await fetch('/api/visitor-stats/realtime');
                const data = await response.json();
                
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error('Error fetching quick stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuickStats();
        
        // Update every 2 minutes
        const interval = setInterval(fetchQuickStats, 120000);
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString();
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
                <div className="animate-pulse">
                    <div className="h-4 bg-white bg-opacity-30 rounded mb-2"></div>
                    <div className="h-6 bg-white bg-opacity-30 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse mr-2"></div>
                        <p className="text-sm text-green-100 font-medium">Aktivitas Hari Ini</p>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                        {formatNumber(stats.today_total)} pengunjung
                    </p>
                    <p className="text-xs text-green-100">
                        {formatNumber(stats.last_hour)} dalam 1 jam terakhir
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl mb-2">📊</div>
                    <Link 
                        to="/statistik"
                        className="text-xs text-green-100 hover:text-white underline"
                    >
                        Lihat Detail →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuickStatsWidget;
