import React, { useState, useEffect } from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { initializeGeolocation } from '../utils/geolocationUtils';

function Footer() {
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(true);

    // Get user's location and fetch location name
    useEffect(() => {
        const setupLocation = async () => {
            try {
                const result = await initializeGeolocation({
                    enableRetry: false, // For footer, don't retry to avoid blocking
                    options: { 
                        timeout: 10000,
                        maximumAge: 300000, // 5 minutes cache for footer
                        enableHighAccuracy: false // Don't need high accuracy for footer
                    }
                });
                
                setLocationName(result.locationName);
                setLoading(false);
            } catch (err) {
                console.warn('Footer geolocation error:', err);
                setLocationName('Jakarta Pusat, Indonesia');
                setLoading(false);
            }
        };
        
        setupLocation();
    }, []);
    
    return (
        <footer className="bg-white py-3 mt-auto border-t border-gray-100 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-center items-center py-2 space-y-2 md:space-y-0 md:space-x-4">
                    {/* Location Information */}
                    <div className="flex items-center text-sm text-gray-500">
                        <IoLocationOutline className="mr-2 text-islamic-green flex-shrink-0" />
                        {loading ? (
                            <span>Mendeteksi lokasi...</span>
                        ) : (
                            <span>{locationName}</span>
                        )}
                    </div>
                    
                    {/* Copyright */}
                    <div className="text-islamic-brown text-xs text-center">
                        &copy; {new Date().getFullYear()} Al-Quran Digital
                    </div>
                </div>
            </div>
        </footer>
    );
}
export default Footer;
