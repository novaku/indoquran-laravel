/**
 * Utility function to get the correct URL for audio files based on environment
 * In production, adds '/public' prefix to URLs that are relative to our domain
 * 
 * @param {string} audioUrl - The audio URL, could be absolute or relative
 * @returns {string} The correct audio URL with the proper prefix if needed
 */
export const getAudioUrl = (audioUrl) => {
    // Get the base URL from window.Laravel
    const baseUrl = window.Laravel?.baseUrl || '';
    
    // Skip prefixing for external URLs (those that start with http:// or https://)
    if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
        return audioUrl;
    }
    
    // Make sure the path starts with a slash
    const normalizedPath = audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
    
    return `${baseUrl}${normalizedPath}`;
};
