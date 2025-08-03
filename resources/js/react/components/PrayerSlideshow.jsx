import React, { useState, useEffect } from 'react';

const PrayerSlideshow = ({ className, debug = false, minHeight = "100vh" }) => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch images from API
    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                console.log('PrayerSlideshow: Fetching images from /api/prayer-images');
                const response = await fetch('/api/prayer-images');
                const data = await response.json();
                
                console.log('PrayerSlideshow: API response:', data);
                
                if (data.success && data.data && data.data.length > 0) {
                    setImages(data.data);
                    setCurrentIndex(0);
                    console.log('PrayerSlideshow: Images loaded successfully:', data.data.length, 'images');
                    if (debug) {
                        console.log('Prayer images loaded:', data.data);
                    }
                } else {
                    console.log('PrayerSlideshow: No images found or API error');
                    setError('No images found');
                }
            } catch (err) {
                console.error('PrayerSlideshow: Failed to fetch prayer images:', err);
                setError('Failed to load images');
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [debug]);

    // Auto-advance images
    useEffect(() => {
        if (images.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                (prevIndex + 1) % images.length
            );
        }, 8000); // Change image every 8 seconds for better viewing

        return () => clearInterval(timer);
    }, [images.length]);

    // Navigate to previous image
    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    // Navigate to next image
    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % images.length
        );
    };

    if (loading) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-200`}>
                <div className="text-gray-500">Loading images...</div>
            </div>
        );
    }

    if (error || images.length === 0) {
        return (
            <div className={`${className} flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700`}>
                <div className="text-white text-center">
                    <div className="text-lg font-semibold mb-2">Prayer Images</div>
                    <div className="text-sm opacity-75">
                        {error || 'No images available'}
                    </div>
                </div>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <div className={`relative ${className} overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-green-900`} style={{ minHeight }}>
            {/* Main background image with minimal blur */}
            <img
                key={`main-${currentIndex}`}
                src={currentImage.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
                style={{ minHeight }}
            />
            
            {/* Light blur overlay for depth */}
            <img
                key={`overlay-${currentIndex}`}
                src={currentImage.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-30 z-0"
                style={{ minHeight }}
            />

            {/* Light dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/25 z-1"></div>
            
            {/* Subtle gradient for content readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 z-1"></div>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 z-40 group"
                        aria-label="Previous image"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 z-40 group"
                        aria-label="Next image"
                    >
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Debug Panel */}
            {debug && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-sm z-40 backdrop-blur-sm border border-white/20">
                    <div>Images: {images.length}</div>
                    <div>Current: {currentIndex + 1}</div>
                    <div>Name: {currentImage.filename}</div>
                    <div>URL: {currentImage.url}</div>
                    <div className="mt-2 flex gap-2">
                        <button 
                            onClick={goToPrevious}
                            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                            Prev
                        </button>
                        <button 
                            onClick={goToNext}
                            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Image indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm border-2 ${
                                index === currentIndex 
                                    ? 'bg-white border-white shadow-lg scale-125 ring-2 ring-white/50' 
                                    : 'bg-white/30 border-white/70 hover:bg-white/60 hover:scale-110 hover:border-white'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PrayerSlideshow;
