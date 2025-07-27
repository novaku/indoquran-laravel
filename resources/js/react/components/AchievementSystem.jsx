import React, { useState, useEffect } from 'react';
import { 
    XMarkIcon,
    TrophyIcon,
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const AchievementNotification = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Show notification with animation
        setTimeout(() => setIsVisible(true), 100);
        
        // Auto hide after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setShouldRender(false);
            if (onClose) onClose();
        }, 300);
    };

    if (!shouldRender) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-sm relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50"></div>
                
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="relative">
                    {/* Icon and confetti */}
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center relative">
                            <TrophyIcon className="w-6 h-6 text-white" />
                            <SparklesIcon className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-bold text-green-600">PENCAPAIAN BARU!</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievement content */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-lg">
                            {achievement.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                            {achievement.description}
                        </p>
                        
                        {achievement.reward && (
                            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                <p className="text-xs text-yellow-700 font-medium">
                                    🎁 {achievement.reward}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Celebration message */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Barakallahu fiikum! Teruslah berbuat kebaikan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AchievementSystem = () => {
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        // Check for new achievements
        const checkAchievements = () => {
            // This would typically come from your API
            // For demo purposes, we'll show a sample achievement
            const sampleAchievement = {
                id: 1,
                title: "Komunitas 15K+",
                description: "Alhamdulillah! IndoQuran telah mencapai 15,000+ pengguna terdaftar.",
                reward: "Fitur bookmark premium telah dibuka untuk semua pengguna!",
                type: "milestone"
            };

            // Only show once per session
            if (!sessionStorage.getItem('achievement_shown_' + sampleAchievement.id)) {
                setTimeout(() => {
                    setAchievements([sampleAchievement]);
                    sessionStorage.setItem('achievement_shown_' + sampleAchievement.id, 'true');
                }, 3000); // Show after 3 seconds
            }
        };

        checkAchievements();
    }, []);

    const handleAchievementClose = (achievementId) => {
        setAchievements(prev => prev.filter(a => a.id !== achievementId));
    };

    return (
        <>
            {achievements.map(achievement => (
                <AchievementNotification
                    key={achievement.id}
                    achievement={achievement}
                    onClose={() => handleAchievementClose(achievement.id)}
                />
            ))}
        </>
    );
};

export default AchievementSystem;
