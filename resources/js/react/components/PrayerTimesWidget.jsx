import React, { useState, useEffect } from 'react';
import { IoLocationOutline, IoTimeOutline, IoRefreshOutline, IoCalendarOutline, IoAlarmOutline } from 'react-icons/io5';

const PrayerTimesWidget = () => {
    const [location, setLocation] = useState(null);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [date, setDate] = useState(new Date());
    const [timeRemaining, setTimeRemaining] = useState('');

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setLocation(coords);
                    fetchLocationName(coords.latitude, coords.longitude);
                    setError(null);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Fallback to a default location (Jakarta Pusat)
                    const defaultCoords = {
                        latitude: -6.1751,
                        longitude: 106.8650
                    };
                    setLocation(defaultCoords);
                    setLocationName('Jakarta Pusat, Indonesia (default)');
                    setError('Menggunakan lokasi default. Untuk akurasi lebih baik, izinkan akses lokasi pada browser Anda.');
                    setLoading(false);
                },
                { timeout: 10000 } // 10 seconds timeout
            );
        } else {
            // Fallback to a default location (Jakarta Pusat) if geolocation is not supported
            const defaultCoords = {
                latitude: -6.1751,
                longitude: 106.8650
            };
            setLocation(defaultCoords);
            setLocationName('Jakarta Pusat, Indonesia (default)');
            setError('Geolokasi tidak didukung oleh browser Anda. Menggunakan lokasi default.');
            setLoading(false);
        }
    }, []);

    // Get location name from coordinates
    const fetchLocationName = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            
            if (!response.ok) {
                throw new Error('Gagal mendapatkan nama lokasi');
            }
            
            const data = await response.json();
            
            if (data && data.address) {
                // Create a readable location name from the address components
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
                const state = data.address.state || data.address.county;
                const country = data.address.country;
                
                let locationStr = '';
                if (city) locationStr += city;
                if (state && state !== city) locationStr += locationStr ? `, ${state}` : state;
                if (country) locationStr += locationStr ? `, ${country}` : country;
                
                setLocationName(locationStr || 'Lokasi saat ini');
            } else {
                setLocationName('Lokasi saat ini');
            }
        } catch (error) {
            console.error('Error fetching location name:', error);
            setLocationName('Lokasi saat ini');
        }
    };

    // Update current time every minute and calculate time remaining to next prayer
    useEffect(() => {
        const timerID = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            
            if (nextPrayer) {
                calculateTimeRemaining(now, nextPrayer.time);
            }
        }, 1000);

        return () => {
            clearInterval(timerID);
        };
    }, [nextPrayer]);
    
    // Calculate time remaining until next prayer
    const calculateTimeRemaining = (now, prayerTimeStr) => {
        if (!prayerTimeStr) return;
        
        const [prayerHours, prayerMinutes] = prayerTimeStr.split(':').map(Number);
        
        // Create prayer time Date object
        const prayerTime = new Date(now);
        prayerTime.setHours(prayerHours, prayerMinutes, 0, 0);
        
        // If prayer time is earlier today, it must be for tomorrow
        if (prayerTime < now) {
            prayerTime.setDate(prayerTime.getDate() + 1);
        }
        
        // Calculate difference in milliseconds
        const diffMs = prayerTime - now;
        
        // Convert to hours, minutes, seconds
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        // Format as "HH:MM:SS"
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        
        setTimeRemaining(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    // Fetch prayer times when location is obtained
    useEffect(() => {
        if (location) {
            fetchPrayerTimes();
        }
    }, [location]);

    // Calculate next prayer time
    useEffect(() => {
        if (prayerTimes) {
            calculateNextPrayer();
        }
    }, [prayerTimes, currentTime]);

    const fetchPrayerTimes = async (retryCount = 0) => {
        try {
            setLoading(true);
            const { latitude, longitude } = location;
            
            // Use Aladhan API to get prayer times
            const today = new Date();
            const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
            setDate(today);
            
            // Use our Laravel backend as a proxy to avoid CSP issues
            try {
                const API_URL = `/api/prayer-times?date=${formattedDate}&latitude=${latitude}&longitude=${longitude}&method=11`;
                
                console.log(`Fetching prayer times from Laravel backend: ${API_URL}`);
                
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 seconds timeout
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch prayer times: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.code === 200 && data.status === 'OK') {
                    setPrayerTimes(data.data.timings);
                    setError(null);
                    console.log('Prayer times fetched successfully:', data.data.timings);
                    return;
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (apiError) {
                console.log('Laravel API fetch failed, using calculation method...', apiError);
                
                // If the API call fails for any reason, fall back to local calculation
                console.log('Using direct prayer time calculation for coordinates:', latitude, longitude);
                
                try {
                    // Try to calculate prayer times directly
                    const calculatedTimes = await calculatePrayerTimes(latitude, longitude, today);
                    setPrayerTimes(calculatedTimes);
                    setError('Menggunakan perhitungan lokal karena keterbatasan akses server.');
                    console.log('Prayer times calculated successfully:', calculatedTimes);
                } catch (calcError) {
                    console.error('Calculation error:', calcError);
                    // Fallback to offline data
                    const offlineTimes = getOfflineFallbackPrayerTimes();
                    setPrayerTimes(offlineTimes);
                    setError('Tidak dapat terhubung ke server. Menggunakan data perkiraan offline (kurang akurat).');
                }
                return;
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            
            // Network errors or other issues
            if ((error.message.includes('network') || error.message.includes('timeout') || error.name === 'AbortError') && retryCount < 2) {
                console.log(`Retrying (${retryCount + 1}/2)...`);
                setError(`Mencoba menghubungi server lagi... (${retryCount + 1}/2)`);
                
                // Wait for 2 seconds before retrying
                setTimeout(() => {
                    fetchPrayerTimes(retryCount + 1);
                }, 2000);
                return;
            }
                
            // Try alternative API if main one failed and we've reached max retries
            if (retryCount >= 2) {
                console.log('Trying alternative API source...');
                setError('Mencoba sumber data alternatif...');
                
                // Try the alternative API
                const alternativeSuccess = await fetchPrayerTimesAlternative();
                
                // If alternative also failed, show the final error
                if (!alternativeSuccess) {
                    console.log('Using offline fallback data...');
                    // Use offline fallback as last resort
                    const offlineTimes = getOfflineFallbackPrayerTimes();
                    setPrayerTimes(offlineTimes);
                    setError('Tidak dapat terhubung ke server. Menggunakan data perkiraan offline (kurang akurat).');
                }
                return;
            }
            
            // Use a more detailed error message
            setError(`Gagal memuat jadwal shalat. ${error.message || 'Silakan coba lagi nanti.'}`);
            
            // Try to use offline data anyway so user sees something
            const offlineTimes = getOfflineFallbackPrayerTimes();
            setPrayerTimes(offlineTimes);
        } finally {
            setLoading(false);
        }
    };

    // Try alternative API if the main one fails
    const fetchPrayerTimesAlternative = async () => {
        try {
            setLoading(true);
            const { latitude, longitude } = location;
            
            // Since we've already experienced issues with API access due to CSP,
            // let's directly use our local calculation method instead of trying another API
            console.log('Using direct prayer time calculation for coordinates:', latitude, longitude);
            
            const today = new Date();
            
            // Use our local calculation function since we already have it
            const calculatedTimes = await calculatePrayerTimes(latitude, longitude, today);
            
            setPrayerTimes(calculatedTimes);
            setError("Menggunakan perhitungan lokal. Data mungkin kurang akurat.");
            console.log('Prayer times calculated successfully:', calculatedTimes);
            return true;
        } catch (error) {
            console.error('Alternative API also failed:', error);
            
            // Use offline fallback data as last resort
            console.log('Using offline fallback data...');
            const offlineTimes = getOfflineFallbackPrayerTimes();
            setPrayerTimes(offlineTimes);
            setError('Tidak dapat terhubung ke server. Menggunakan data perkiraan offline (kurang akurat).');
            
            // We still return true because we did provide some prayer times
            return true;
        } finally {
            setLoading(false);
        }
    };

    // Fallback prayer times for when all online methods fail
    const getOfflineFallbackPrayerTimes = () => {
        const now = new Date();
        const month = now.getMonth(); // 0-11
        
        // Extremely simplified fallback data based on Jakarta
        // In a real app, you'd have a more comprehensive offline database
        let fallbackTimes = {
            // Default fallback for Jakarta area
            Fajr: "04:40",
            Dhuhr: "12:00",
            Asr: "15:15",
            Maghrib: "18:00",
            Isha: "19:15"
        };
        
        // Adjust slightly based on month (very rough approximation)
        if (month >= 0 && month <= 2) { // Jan-Mar
            fallbackTimes = {
                Fajr: "04:45",
                Dhuhr: "12:10",
                Asr: "15:25",
                Maghrib: "18:15",
                Isha: "19:30"
            };
        } else if (month >= 3 && month <= 5) { // Apr-Jun
            fallbackTimes = {
                Fajr: "04:40",
                Dhuhr: "12:00",
                Asr: "15:15",
                Maghrib: "18:00",
                Isha: "19:15"
            };
        } else if (month >= 6 && month <= 8) { // Jul-Sep
            fallbackTimes = {
                Fajr: "04:35",
                Dhuhr: "11:55",
                Asr: "15:05",
                Maghrib: "17:45",
                Isha: "19:00"
            };
        } else { // Oct-Dec
            fallbackTimes = {
                Fajr: "04:30",
                Dhuhr: "11:50",
                Asr: "15:00",
                Maghrib: "17:40",
                Isha: "18:55"
            };
        }
        
        return fallbackTimes;
    };

    // Calculate prayer times based on location and date
    // This is a simplified calculation that approximates prayer times
    const calculatePrayerTimes = async (latitude, longitude, date) => {
        // Convert date to day of year (1-366)
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Get timezone offset in hours
        const timezoneOffset = date.getTimezoneOffset() / -60;
        
        // Simplified calculation based on latitude and day of year
        // This is not as accurate as proper astronomical calculations
        // but will work as a reasonable fallback
        
        // Base times for equator at equinox (approximate)
        let fajrBase = 5.0;   // 5:00 AM
        let dhuhrBase = 12.0; // 12:00 PM
        let asrBase = 15.25;  // 3:15 PM
        let maghribBase = 18.0; // 6:00 PM
        let ishaBase = 19.5;  // 7:30 PM
        
        // Adjust for latitude (day length changes)
        const latitudeEffect = Math.abs(latitude) / 90.0; // 0 at equator, 1 at poles
        
        // Day length adjustment based on time of year
        // Simplified sinusoidal model
        const yearProgress = dayOfYear / 365.0;
        const seasonalFactor = Math.sin((yearProgress * 2 * Math.PI) - Math.PI/2);
        
        // Northern hemisphere summer / Southern hemisphere winter
        let dayLengthChange;
        if (latitude > 0) { // Northern hemisphere
            dayLengthChange = seasonalFactor * (latitudeEffect * 3); // Hours longer/shorter
        } else { // Southern hemisphere
            dayLengthChange = -seasonalFactor * (latitudeEffect * 3); // Opposite season
        }
        
        // Adjust prayer times based on day length
        fajrBase -= dayLengthChange * 0.5;
        maghribBase += dayLengthChange * 0.5;
        ishaBase += dayLengthChange * 0.5;
        
        // Adjust for longitude within timezone
        // Every 15 degrees longitude = 1 hour time difference
        const longitudeAdjustment = ((longitude % 15) / 15) * 1.0; // Hours
        
        // Apply adjustments
        fajrBase += longitudeAdjustment;
        dhuhrBase += longitudeAdjustment;
        asrBase += longitudeAdjustment;
        maghribBase += longitudeAdjustment;
        ishaBase += longitudeAdjustment;
        
        // Convert decimal hours to HH:MM format
        const formatTime = (decimalHours) => {
            // Ensure time is between 0 and 24
            decimalHours = decimalHours % 24;
            if (decimalHours < 0) decimalHours += 24;
            
            const hours = Math.floor(decimalHours);
            const minutes = Math.floor((decimalHours - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };
        
        // Return prayer times
        return {
            Fajr: formatTime(fajrBase),
            Sunrise: formatTime(fajrBase + 1.5),
            Dhuhr: formatTime(dhuhrBase),
            Asr: formatTime(asrBase),
            Sunset: formatTime(maghribBase - 0.5),
            Maghrib: formatTime(maghribBase),
            Isha: formatTime(ishaBase),
            Midnight: formatTime(0)
        };
    };

    const calculateNextPrayer = () => {
        if (!prayerTimes) return;

        // Prayer times to display (we don't need all from the API)
        const prayers = [
            { name: 'Fajr', time: prayerTimes.Fajr, nameID: 'Subuh' },
            { name: 'Dhuhr', time: prayerTimes.Dhuhr, nameID: 'Dzuhur' },
            { name: 'Asr', time: prayerTimes.Asr, nameID: 'Ashar' },
            { name: 'Maghrib', time: prayerTimes.Maghrib, nameID: 'Maghrib' },
            { name: 'Isha', time: prayerTimes.Isha, nameID: 'Isya' }
        ];

        const now = currentTime;
        const nowTimeString = now.toTimeString().substring(0, 5);

        // Find the next prayer
        let nextPrayerTime = null;

        for (const prayer of prayers) {
            if (prayer.time > nowTimeString) {
                nextPrayerTime = prayer;
                break;
            }
        }

        // If no next prayer found today, it means the next prayer is Fajr tomorrow
        if (!nextPrayerTime) {
            nextPrayerTime = prayers[0]; // Fajr
        }

        setNextPrayer(nextPrayerTime);
        
        // Calculate time remaining
        if (nextPrayerTime) {
            calculateTimeRemaining(now, nextPrayerTime.time);
        }
    };

    const formatTimeToLocale = (timeString) => {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        
        return date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    // Format current time for display
    const formattedCurrentTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const handleRefresh = () => {
        setError(null); // Clear previous errors
        setLoading(true);
        
        console.log('Refreshing prayer times...');
        
        if (location) {
            fetchPrayerTimes();
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('Got user location:', coords);
                    setLocation(coords);
                    fetchLocationName(coords.latitude, coords.longitude);
                    setError(null);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Provide more detailed error based on error code
                    let errorMsg = 'Menggunakan lokasi default. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg += 'Akses lokasi ditolak. Silakan izinkan akses lokasi pada browser Anda.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg += 'Informasi lokasi tidak tersedia.';
                            break;
                        case error.TIMEOUT:
                            errorMsg += 'Permintaan lokasi habis waktu.';
                            break;
                        default:
                            errorMsg += 'Untuk akurasi lebih baik, izinkan akses lokasi pada browser Anda.';
                    }
                    
                    // Fallback to Jakarta Pusat
                    const defaultCoords = {
                        latitude: -6.1751,
                        longitude: 106.8650
                    };
                    setLocation(defaultCoords);
                    setLocationName('Jakarta Pusat, Indonesia (default)');
                    setError(errorMsg);
                    
                    // Continue with default location
                    fetchPrayerTimes();
                },
                { 
                    timeout: 10000,
                    maximumAge: 60000, // Accept cached position up to 1 minute old
                    enableHighAccuracy: false // Don't need high accuracy, save battery
                }
            );
        } else {
            // Fallback to a default location if geolocation is not supported
            const defaultCoords = {
                latitude: -6.1751,
                longitude: 106.8650
            };
            setLocation(defaultCoords);
            setLocationName('Jakarta Pusat, Indonesia (default)');
            setError('Geolokasi tidak didukung oleh browser Anda. Menggunakan lokasi default.');
            
            // Continue with default location
            fetchPrayerTimes();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 h-full">
            <div className="bg-islamic-green/95 text-white px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                    <IoTimeOutline className="mr-2" /> 
                    <span>Jadwal Shalat</span>
                    <span className="ml-2 text-sm bg-white/20 px-2 py-0.5 rounded-full">
                        {formattedCurrentTime}
                    </span>
                </h2>
                <button 
                    onClick={handleRefresh} 
                    className="text-white hover:text-islamic-cream transition-colors"
                    title="Perbarui jadwal"
                    disabled={loading}
                >
                    <IoRefreshOutline className={`text-xl ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            <div className="p-4">
                {error && !location ? (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md mb-3">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-islamic-green"></div>
                        <span className="ml-2 text-gray-600">Memuat jadwal shalat...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                            <IoLocationOutline className="mr-1 text-islamic-green" />
                            <span>{locationName || 'Lokasi saat ini (auto-detect)'}</span>
                        </div>
                        
                        {error && (
                            <div className={`text-sm mb-3 p-2 rounded-md ${error.includes('perkiraan') || error.includes('perhitungan lokal') ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'}`}>
                                {error}
                                {(error.includes('gagal') || error.includes('server')) && (
                                    <button 
                                        onClick={handleRefresh} 
                                        className="ml-2 text-islamic-green underline hover:no-underline"
                                    >
                                        Coba lagi
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                            <IoCalendarOutline className="mr-1 text-islamic-green" />
                            <span>{date.toLocaleDateString('id-ID', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                        
                        {nextPrayer && (
                            <div className="bg-islamic-green/10 rounded-md p-3 mb-4">
                                <p className="text-sm text-gray-600">Waktu shalat berikutnya:</p>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-islamic-green">{nextPrayer.nameID}</h3>
                                    <span className="text-lg font-semibold text-islamic-brown">
                                        {formatTimeToLocale(nextPrayer.time)}
                                    </span>
                                </div>
                                
                                {timeRemaining && (
                                    <div className="mt-2 flex items-center text-sm text-islamic-brown">
                                        <IoAlarmOutline className="mr-1" />
                                        <span>Waktu tersisa: {timeRemaining}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-2">
                            {prayerTimes && (
                                <>
                                    <div className={`flex justify-between py-1 border-b border-gray-100 ${nextPrayer && nextPrayer.name === 'Fajr' ? 'bg-islamic-green/5 font-medium rounded px-2' : ''}`}>
                                        <span className="text-gray-700">Subuh</span>
                                        <span className={`font-medium ${nextPrayer && nextPrayer.name === 'Fajr' ? 'text-islamic-green' : 'text-islamic-brown'}`}>
                                            {formatTimeToLocale(prayerTimes.Fajr)}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between py-1 border-b border-gray-100 ${nextPrayer && nextPrayer.name === 'Dhuhr' ? 'bg-islamic-green/5 font-medium rounded px-2' : ''}`}>
                                        <span className="text-gray-700">Dzuhur</span>
                                        <span className={`font-medium ${nextPrayer && nextPrayer.name === 'Dhuhr' ? 'text-islamic-green' : 'text-islamic-brown'}`}>
                                            {formatTimeToLocale(prayerTimes.Dhuhr)}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between py-1 border-b border-gray-100 ${nextPrayer && nextPrayer.name === 'Asr' ? 'bg-islamic-green/5 font-medium rounded px-2' : ''}`}>
                                        <span className="text-gray-700">Ashar</span>
                                        <span className={`font-medium ${nextPrayer && nextPrayer.name === 'Asr' ? 'text-islamic-green' : 'text-islamic-brown'}`}>
                                            {formatTimeToLocale(prayerTimes.Asr)}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between py-1 border-b border-gray-100 ${nextPrayer && nextPrayer.name === 'Maghrib' ? 'bg-islamic-green/5 font-medium rounded px-2' : ''}`}>
                                        <span className="text-gray-700">Maghrib</span>
                                        <span className={`font-medium ${nextPrayer && nextPrayer.name === 'Maghrib' ? 'text-islamic-green' : 'text-islamic-brown'}`}>
                                            {formatTimeToLocale(prayerTimes.Maghrib)}
                                        </span>
                                    </div>
                                    <div className={`flex justify-between py-1 ${nextPrayer && nextPrayer.name === 'Isha' ? 'bg-islamic-green/5 font-medium rounded px-2' : ''}`}>
                                        <span className="text-gray-700">Isya</span>
                                        <span className={`font-medium ${nextPrayer && nextPrayer.name === 'Isha' ? 'text-islamic-green' : 'text-islamic-brown'}`}>
                                            {formatTimeToLocale(prayerTimes.Isha)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500 italic">
                            <p>* Jadwal shalat bersifat perkiraan berdasarkan lokasi Anda saat ini.</p>
                            {error && (error.includes('perhitungan lokal') || error.includes('perkiraan')) && (
                                <p className="mt-1">* Menggunakan perhitungan lokal karena keterbatasan akses ke server jadwal shalat.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PrayerTimesWidget;
