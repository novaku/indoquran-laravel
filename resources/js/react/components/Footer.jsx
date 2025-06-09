import React, { useState, useEffect } from 'react';
import { IoLocationOutline } from 'react-icons/io5';

function Footer() {
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(true);

    // Get user's location and fetch location name
    useEffect(() => {
        const getCurrentLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        fetchLocationName(coords.latitude, coords.longitude);
                    },
                    (error) => {
                        console.log('Footer location error:', error);
                        // Fallback to Jakarta, Indonesia
                        fetchLocationName(-6.1751, 106.8650);
                    },
                    { 
                        timeout: 10000,
                        maximumAge: 300000, // 5 minutes cache
                        enableHighAccuracy: false // For footer, we don't need high accuracy
                    }
                );
            } else {
                // Fallback to Jakarta, Indonesia if geolocation is not supported
                fetchLocationName(-6.1751, 106.8650);
            }
        };

        getCurrentLocation();
    }, []);

    // Get location name from coordinates
    const fetchLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch location name');
            }
            
            const data = await response.json();
            
            if (data && data.address) {
                // Create a readable location name from the address components
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.county;
                const country = data.address.country;
                
                let locationStr = '';
                if (city && country) {
                    locationStr = `${city}, ${country}`;
                } else if (country) {
                    locationStr = country;
                } else {
                    locationStr = 'Indonesia'; // Default fallback
                }
                
                setLocationName(locationStr);
            } else {
                setLocationName('Indonesia');
            }
        } catch (error) {
            console.error('Error fetching location name for footer:', error);
            setLocationName('Indonesia');
        } finally {
            setLoading(false);
        }
    };
    return (
        <footer className="bg-white py-4 mt-auto border-t border-gray-100 w-full z-10 fixed bottom-0 left-0 shadow-sm">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
                        <div className="flex space-x-6">
                            <a href="/about" className="text-islamic-green hover:text-islamic-gold transition-colors">Tentang</a>
                            <a href="/privacy" className="text-islamic-green hover:text-islamic-gold transition-colors">Privasi</a>
                            <a href="/contact" className="text-islamic-green hover:text-islamic-gold transition-colors">Kontak</a>
                        </div>
                        
                        {/* Location Information */}
                        <div className="flex items-center text-sm text-gray-500">
                            <IoLocationOutline className="mr-1 text-islamic-green" />
                            {loading ? (
                                <span>Mendeteksi lokasi...</span>
                            ) : (
                                <span>{locationName}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-3 md:mt-0 text-islamic-brown text-sm">
                        &copy; {new Date().getFullYear()} Al-Quran Digital. Hak Cipta Dilindungi.
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
