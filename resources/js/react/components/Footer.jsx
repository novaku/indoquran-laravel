import React, { useState, useEffect, useRef } from 'react';
import { IoLocationOutline, IoChevronUpOutline } from 'react-icons/io5';
import { useFooterAutoHide, useDropdownMenu } from '../hooks/useNavigation';

function Footer() {
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Auto-hide functionality
    const isVisible = useFooterAutoHide();
    const { isOpen: isMenuOpen, toggle: toggleMenu, close: closeMenu } = useDropdownMenu();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeMenu]);

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
        <footer className={`bg-white py-3 mt-auto border-t border-gray-100 w-full z-10 fixed bottom-0 left-0 shadow-sm footer-auto-hide ${
            isVisible ? '' : 'hidden'
        }`}>
            <div className="container mx-auto px-4 max-w-6xl footer-mobile">
                {/* Mobile Compact View */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <IoLocationOutline className="mr-1 text-islamic-green flex-shrink-0" />
                            {loading ? (
                                <span>...</span>
                            ) : (
                                <span className="truncate max-w-24">{locationName}</span>
                            )}
                        </div>
                        
                        <div className="text-islamic-brown text-xs text-center flex-1 px-2">
                            &copy; {new Date().getFullYear()} Al-Quran Digital
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={toggleMenu}
                                className="p-2 text-islamic-green hover:text-islamic-gold transition-colors mobile-touch-target"
                                aria-label="Toggle footer menu"
                            >
                                <IoChevronUpOutline 
                                    className={`h-5 w-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                                />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 bottom-full mb-2 w-48 dropdown-backdrop rounded-lg shadow-lg border border-gray-200 py-2 z-50 mobile-dropdown-footer">
                                    <a 
                                        href="/about" 
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                        onClick={() => closeMenu()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Tentang
                                    </a>
                                    <a 
                                        href="/privacy" 
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                        onClick={() => closeMenu()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Privasi
                                    </a>
                                    <a 
                                        href="/contact" 
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-islamic-green/5 hover:text-islamic-green transition-colors mobile-touch-target"
                                        onClick={() => closeMenu()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Kontak
                                    </a>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <div className="px-4 py-2">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <IoLocationOutline className="mr-1 text-islamic-green flex-shrink-0" />
                                            {loading ? (
                                                <span>Mendeteksi lokasi...</span>
                                            ) : (
                                                <span className="truncate">{locationName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:flex flex-col md:flex-row justify-between items-center py-4">
                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
                        <div className="flex space-x-6">
                            <a href="/about" className="text-islamic-green hover:text-islamic-gold transition-colors nav-link">Tentang</a>
                            <a href="/privacy" className="text-islamic-green hover:text-islamic-gold transition-colors nav-link">Privasi</a>
                            <a href="/contact" className="text-islamic-green hover:text-islamic-gold transition-colors nav-link">Kontak</a>
                        </div>
                        
                        {/* Location Information */}
                        <div className="flex items-center text-sm text-gray-500">
                            <IoLocationOutline className="mr-1 text-islamic-green flex-shrink-0" />
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
