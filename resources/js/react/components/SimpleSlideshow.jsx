import React, { useState, useEffect } from 'react';

const SimpleSlideshow = ({ className = '' }) => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        // Fetch images
        fetch('/api/prayer-images')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setImages(data.data.map(img => img.url));
                }
            })
            .catch(console.error);
    }, []);
    
    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);
    
    if (images.length === 0) {
        return (
            <div className={`bg-green-600 min-h-[500px] flex items-center justify-center ${className}`}>
                <div className="text-white">Loading images...</div>
            </div>
        );
    }
    
    return (
        <div className={`relative min-h-[500px] ${className}`}>
            <img
                src={images[currentIndex]}
                alt="Prayer"
                className="w-full h-full object-cover absolute inset-0"
                style={{ minHeight: '500px' }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            
            {/* Debug info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-sm z-10">
                <div>Total: {images.length}</div>
                <div>Current: {currentIndex}</div>
                <div>URL: {images[currentIndex]}</div>
            </div>
        </div>
    );
};

export default SimpleSlideshow;
