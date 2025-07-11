import React, { useState, useEffect } from 'react';

const QuranBookAnimation = ({ className = '', autoPlay = true, size = 'lg' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Size variants
    const sizeClasses = {
        sm: {
            container: 'w-24 h-18',
            book: 'w-24 h-18',
            page: 'w-12 h-18',
            text: 'text-xs'
        },
        md: {
            container: 'w-40 h-30',
            book: 'w-40 h-30',
            page: 'w-20 h-30',
            text: 'text-sm'
        },
        lg: {
            container: 'w-48 h-36 lg:w-56 lg:h-42',
            book: 'w-48 h-36 lg:w-56 lg:h-42',
            page: 'w-24 h-36 lg:w-28 lg:h-42',
            text: 'text-base'
        },
        xl: {
            container: 'w-64 h-48 lg:w-72 lg:h-54',
            book: 'w-64 h-48 lg:w-72 lg:h-54',
            page: 'w-32 h-48 lg:w-36 lg:h-54',
            text: 'text-base lg:text-lg'
        }
    };

    const currentSize = sizeClasses[size] || sizeClasses.lg;

    useEffect(() => {
        if (autoPlay) {
            const timer = setTimeout(() => {
                handleBookClick();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoPlay]);

    const handleBookClick = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        setIsOpen(!isOpen);
        
        setTimeout(() => {
            setIsAnimating(false);
        }, 1000);
    };

    return (
        <div className={`relative ${currentSize.container} ${className} cursor-pointer select-none touch-manipulation`} 
             onClick={handleBookClick}
             onTouchStart={() => {}} // Enable touch on mobile
        >
            {/* Book Container */}
            <div className={`relative ${currentSize.book} mx-auto perspective-1000 transition-transform duration-300 hover:scale-105`}>
                {/* Book Spine/Back Cover */}
                <div className={`absolute inset-0 ${currentSize.book} bg-gradient-to-br from-green-800 to-green-900 rounded-lg shadow-2xl transform-style-preserve-3d`}>
                    {/* Decorative Pattern on Cover */}
                    <div className="absolute inset-2 border-2 border-yellow-400 rounded-md">
                        <div className="absolute inset-2 border border-yellow-300 rounded-sm">
                            <div className="flex flex-col items-center justify-center h-full text-yellow-100 p-1">
                                {/* Arabic Text */}
                                <div className="font-arabic text-center leading-tight mb-1" 
                                     style={{ 
                                         fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                         fontSize: size === 'xl' ? '16px' : size === 'lg' ? '14px' : '12px'
                                     }}>
                                    القرآن الكريم
                                </div>
                                {/* Indonesian Text */}
                                <div className="text-xs font-semibold text-center mb-1">
                                    AL-QURAN
                                </div>
                                <div className="text-xs text-yellow-200">
                                    DIGITAL
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Book binding details */}
                    <div className="absolute left-0 top-0 w-2 h-full bg-green-900 rounded-l-lg"></div>
                    <div className="absolute left-1 top-2 w-px h-4 bg-yellow-400"></div>
                    <div className="absolute left-1 bottom-2 w-px h-4 bg-yellow-400"></div>
                </div>

                {/* Left Page */}
                <div className={`absolute left-0 top-0 ${currentSize.page} bg-gradient-to-br from-green-800 to-green-900 rounded-l-lg shadow-xl transform-gpu origin-right transition-all duration-1000 ease-in-out transform-style-preserve-3d ${
                    isOpen ? 'rotate-y-180' : 'rotate-y-0'
                }`}>
                    {/* Front of left page (when closed) */}
                    <div className="absolute inset-0 backface-hidden">
                        <div className="absolute inset-2 border-2 border-yellow-400 rounded-md">
                            <div className="absolute inset-2 border border-yellow-300 rounded-sm">
                                <div className="flex flex-col items-center justify-center h-full text-yellow-100 p-1">
                                    <div className="font-arabic text-center leading-tight"
                                         style={{ 
                                             fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                             fontSize: size === 'xl' ? '16px' : size === 'lg' ? '14px' : '12px'
                                         }}>
                                        القرآن الكريم
                                    </div>
                                    <div className="text-xs font-semibold text-center mt-1">
                                        AL-QURAN
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Back of left page (when open) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-l-lg">
                        <div className="p-2 h-full flex flex-col">
                            {/* Page content */}
                            <div className="font-arabic text-gray-800 leading-tight text-right mb-1"
                                 style={{ 
                                     fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                     fontSize: size === 'xl' ? '14px' : size === 'lg' ? '12px' : '10px'
                                 }}>
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </div>
                            <div className="font-arabic text-gray-700 leading-tight text-right mb-1"
                                 style={{ 
                                     fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                     fontSize: size === 'xl' ? '11px' : size === 'lg' ? '10px' : '9px'
                                 }}>
                                الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                            </div>
                            <div className="font-arabic text-gray-700 leading-tight text-right mb-1"
                                 style={{ 
                                     fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                     fontSize: size === 'xl' ? '11px' : size === 'lg' ? '10px' : '9px'
                                 }}>
                                الرَّحْمَٰنِ الرَّحِيمِ
                            </div>
                            <div className="font-arabic text-gray-700 leading-tight text-right"
                                 style={{ 
                                     fontFamily: 'Scheherazade New, Arabic Typesetting, serif',
                                     fontSize: size === 'xl' ? '11px' : size === 'lg' ? '10px' : '9px'
                                 }}>
                                مَالِكِ يَوْمِ الدِّينِ
                            </div>
                            
                            {/* Decorative elements */}
                            <div className="mt-auto">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-1"></div>
                                <div className="text-center">
                                    <div className="w-2 h-2 mx-auto bg-yellow-400 rounded-full opacity-60"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Page */}
                <div className={`absolute right-0 top-0 ${currentSize.page} bg-gradient-to-br from-amber-50 to-yellow-50 rounded-r-lg shadow-xl transform-gpu transition-all duration-1000 ease-in-out ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}>
                    <div className="p-2 h-full flex flex-col">
                        {/* Indonesian translation */}
                        <div className="text-gray-600 mb-1 leading-tight"
                             style={{ fontSize: size === 'xl' ? '10px' : size === 'lg' ? '9px' : '8px' }}>
                            Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
                        </div>
                        <div className="text-gray-700 leading-tight mb-1"
                             style={{ fontSize: size === 'xl' ? '9px' : size === 'lg' ? '8px' : '7px' }}>
                            Segala puji bagi Allah, Tuhan seluruh alam,
                        </div>
                        <div className="text-gray-700 leading-tight mb-1"
                             style={{ fontSize: size === 'xl' ? '9px' : size === 'lg' ? '8px' : '7px' }}>
                            Yang Maha Pengasih, Maha Penyayang,
                        </div>
                        <div className="text-gray-700 leading-tight"
                             style={{ fontSize: size === 'xl' ? '9px' : size === 'lg' ? '8px' : '7px' }}>
                            Pemilik hari pembalasan.
                        </div>
                        
                        {/* Page number and decoration */}
                        <div className="mt-auto">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-1"></div>
                            <div className="text-center">
                                <span className="text-xs text-gray-500">1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookmark ribbon */}
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 bg-gradient-to-b from-red-500 to-red-600 transition-all duration-500 ${
                    isOpen ? 'h-12' : 'h-8'
                } rounded-b-sm shadow-md`}>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-600"></div>
                </div>

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-200/20 to-green-200/20 transition-opacity duration-500 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                }`}></div>
            </div>

            {/* Click instruction */}
            {!isAnimating && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 text-center">
                    {isOpen ? 'Klik untuk menutup' : 'Klik untuk membuka'}
                </div>
            )}

            {/* Floating particles effect */}
            {isOpen && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${10 + (i % 2) * 20}%`,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: '2s'
                            }}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuranBookAnimation;
