/**
 * Geolocation utilities to handle permissions and location requests
 */

/**
 * Check geolocation permissions and get current status
 * @returns {Promise<string>} Permission status: 'granted', 'denied', 'prompt', or 'unsupported'
 */
export const checkGeolocationPermissions = async () => {
    try {
        if (!navigator.permissions) {
            return 'unsupported';
        }
        
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        return permissionStatus.state;
    } catch (error) {
        console.warn('Could not query geolocation permissions:', error);
        return 'unsupported';
    }
};

/**
 * Request geolocation with proper error handling and fallback
 * @param {Object} options - Geolocation options
 * @param {Object} fallbackCoords - Default coordinates to use on error
 * @returns {Promise<{success: boolean, coords?: Object, error?: string}>}
 */
export const requestGeolocation = (
    options = { 
        timeout: 10000, 
        maximumAge: 300000, 
        enableHighAccuracy: false 
    },
    fallbackCoords = { latitude: -6.1751, longitude: 106.8650 } // Jakarta, Indonesia
) => {
    return new Promise((resolve) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser');
            resolve({
                success: false,
                coords: fallbackCoords,
                error: 'Geolocation tidak didukung oleh browser ini'
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    success: true,
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                });
            },
            (error) => {
                let errorMessage = 'Terjadi kesalahan saat mendapatkan lokasi. ';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Akses lokasi ditolak.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Informasi lokasi tidak tersedia.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Permintaan lokasi habis waktu.';
                        break;
                    default:
                        errorMessage += 'Kesalahan tidak diketahui.';
                }
                
                console.error('Geolocation error:', error);
                
                resolve({
                    success: false,
                    coords: fallbackCoords,
                    error: errorMessage
                });
            },
            options
        );
    });
};

/**
 * Get location name from coordinates using our own proxy to OpenStreetMap Nominatim
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Location name or default text
 */
export const getLocationName = async (latitude, longitude) => {
    try {
        // Use our own API proxy endpoint instead of directly calling Nominatim
        const response = await fetch(
            `/api/geocode/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch location name');
        }
        
        const data = await response.json();
        
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
            const state = data.address.state || data.address.county;
            const country = data.address.country;
            
            let locationStr = '';
            if (city) locationStr += city;
            if (state && state !== city) locationStr += locationStr ? `, ${state}` : state;
            if (country) locationStr += locationStr ? `, ${country}` : country;
            
            return locationStr || 'Lokasi saat ini';
        }
        
        return 'Lokasi saat ini';
    } catch (error) {
        console.error('Error fetching location name:', error);
        return 'Lokasi saat ini';
    }
};

/**
 * Initialize geolocation with permissions check and retry logic
 * @param {Object} config Configuration options
 * @returns {Promise<{location: Object, locationName: string, error?: string}>}
 */
export const initializeGeolocation = async (config = {}) => {
    const {
        enableRetry = true,
        maxRetries = 2,
        retryDelay = 2000,
        options = { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
        fallbackCoords = { latitude: -6.1751, longitude: 106.8650 },
        fallbackLocationName = 'Jakarta Pusat, Indonesia (default)'
    } = config;

    let retryCount = 0;
    
    const tryGetLocation = async () => {
        // Check permissions first
        const permissionStatus = await checkGeolocationPermissions();
        console.log('Geolocation permission status:', permissionStatus);
        
        if (permissionStatus === 'denied') {
            return {
                location: fallbackCoords,
                locationName: fallbackLocationName,
                error: 'Akses lokasi ditolak. Menggunakan lokasi default.'
            };
        }
        
        // Try to get location
        const result = await requestGeolocation(options, fallbackCoords);
        
        if (result.success) {
            const locationName = await getLocationName(result.coords.latitude, result.coords.longitude);
            return {
                location: result.coords,
                locationName: locationName
            };
        } else {
            // If retry is enabled and we haven't exceeded max retries
            if (enableRetry && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying geolocation (attempt ${retryCount}/${maxRetries})...`);
                
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return tryGetLocation();
            }
            
            return {
                location: result.coords,
                locationName: fallbackLocationName,
                error: result.error
            };
        }
    };
    
    return tryGetLocation();
};

export default {
    checkGeolocationPermissions,
    requestGeolocation,
    getLocationName,
    initializeGeolocation
};
