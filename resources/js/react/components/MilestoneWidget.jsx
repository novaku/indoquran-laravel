import React, { useState, useEffect } from 'react';
import { 
    TrophyIcon, 
    StarIcon,
    FireIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { fetchWithAuth } from '../utils/apiUtils';

const MilestoneWidget = () => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                setLoading(true);
                const response = await fetchWithAuth('/api/stats/public', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.status === 'success') {
                        const stats = result.data;
                        
                        // Calculate milestones based on stats
                        const calculatedMilestones = [
                            {
                                title: 'Target Hari Ini',
                                description: 'Bacaan Al-Quran',
                                current: stats.dailyReads,
                                target: 3500,
                                icon: FireIcon,
                                color: 'red',
                                unit: 'sesi'
                            },
                            {
                                title: 'Komunitas Berkembang',
                                description: 'Pengguna terdaftar',
                                current: stats.totalUsers,
                                target: 20000,
                                icon: StarIcon,
                                color: 'blue',
                                unit: 'muslim'
                            },
                            {
                                title: 'Ayat Terbaca',
                                description: 'Total komunitas',
                                current: stats.totalVersesRead,
                                target: 2000000,
                                icon: TrophyIcon,
                                color: 'yellow',
                                unit: 'ayat'
                            }
                        ];
                        
                        setMilestones(calculatedMilestones);
                    }
                }
            } catch (error) {
                console.error('Error fetching milestones:', error);
                // Fallback milestones
                setMilestones([
                    {
                        title: 'Target Hari Ini',
                        description: 'Bacaan Al-Quran',
                        current: 3240,
                        target: 3500,
                        icon: FireIcon,
                        color: 'red',
                        unit: 'sesi'
                    },
                    {
                        title: 'Komunitas Berkembang',
                        description: 'Pengguna terdaftar',
                        current: 16850,
                        target: 20000,
                        icon: StarIcon,
                        color: 'blue',
                        unit: 'muslim'
                    },
                    {
                        title: 'Ayat Terbaca',
                        description: 'Total komunitas',
                        current: 1387250,
                        target: 2000000,
                        icon: TrophyIcon,
                        color: 'yellow',
                        unit: 'ayat'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString('id-ID');
    };

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const getColorClasses = (color) => {
        const colorMap = {
            red: {
                bg: 'bg-red-100',
                icon: 'text-red-600',
                progress: 'bg-red-500',
                text: 'text-red-700'
            },
            blue: {
                bg: 'bg-blue-100',
                icon: 'text-blue-600',
                progress: 'bg-blue-500',
                text: 'text-blue-700'
            },
            yellow: {
                bg: 'bg-yellow-100',
                icon: 'text-yellow-600',
                progress: 'bg-yellow-500',
                text: 'text-yellow-700'
            },
            green: {
                bg: 'bg-green-100',
                icon: 'text-green-600',
                progress: 'bg-green-500',
                text: 'text-green-700'
            }
        };
        return colorMap[color] || colorMap.green;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pencapaian Komunitas</h3>
                <SparklesIcon className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="space-y-6">
                {milestones.map((milestone, index) => {
                    const IconComponent = milestone.icon;
                    const colors = getColorClasses(milestone.color);
                    const percentage = getProgressPercentage(milestone.current, milestone.target);
                    const isCompleted = percentage >= 100;
                    
                    return (
                        <div key={index} className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        <IconComponent className={`w-4 h-4 ${colors.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {milestone.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                                {isCompleted && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                        <span className="text-xs font-bold">SELESAI!</span>
                                        <TrophyIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">
                                        {formatNumber(milestone.current)} / {formatNumber(milestone.target)} {milestone.unit}
                                    </span>
                                    <span className={`font-semibold ${colors.text}`}>
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-2 ${colors.progress} transition-all duration-1000 ease-out rounded-full relative`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        {percentage > 80 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 text-center">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-700 font-medium">
                        🎯 Setiap bacaan Anda berkontribusi untuk pencapaian komunitas!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MilestoneWidget;
