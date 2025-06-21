/**
 * Audio Player Fix Test Script
 * 
 * This script tests the audio URL parsing logic that was implemented
 * to fix the audio player issue in SimpleSurahPage.
 */

// Simulate the actual API response format
const mockApiResponse = {
    "ayah_number": "92",
    "audio_urls": {
        "01": "https://equran.nos.wjv-1.neo.id/audio-partial/Abdullah-Al-Juhany/016092.mp3",
        "02": "https://equran.nos.wjv-1.neo.id/audio-partial/Abdul-Muhsin-Al-Qasim/016092.mp3",
        "03": "https://equran.nos.wjv-1.neo.id/audio-partial/Abdurrahman-as-Sudais/016092.mp3",
        "04": "https://equran.nos.wjv-1.neo.id/audio-partial/Ibrahim-Al-Dossari/016092.mp3",
        "05": "https://equran.nos.wjv-1.neo.id/audio-partial/Misyari-Rasyid-Al-Afasi/016092.mp3"
    }
};

// Test the audio URL parsing logic
function testAudioUrlParsing(ayah) {
    console.log('🧪 Testing audio URL parsing...');
    console.log('Input ayah data:', ayah);
    
    let audioUrl = null;
    
    // Handle different audio URL formats
    if (ayah.audio_url) {
        audioUrl = ayah.audio_url;
        console.log('🎵 Using direct audio_url:', audioUrl);
    } else if (ayah.audio_urls) {
        const audioUrls = typeof ayah.audio_urls === 'string' 
            ? JSON.parse(ayah.audio_urls) 
            : ayah.audio_urls;
        
        console.log('🎵 Processing audio_urls:', audioUrls);
        
        if (Array.isArray(audioUrls) && audioUrls.length > 0) {
            audioUrl = audioUrls[0];
            console.log('🎵 Using first URL from array:', audioUrl);
        } else if (typeof audioUrls === 'object' && audioUrls !== null) {
            // Handle both old format (qari names) and new format (numbered keys)
            const preferredQaris = ['alafasy', 'sudais', 'husary', 'minshawi', 'abdulbasit'];
            const preferredKeys = ['03', '05', '01', '02', '04']; // Sudais, Alafasy, Abdullah, Abdul-Muhsin, Ibrahim
            
            // Try preferred qari names first (for backward compatibility)
            for (const qari of preferredQaris) {
                if (audioUrls[qari]) {
                    audioUrl = audioUrls[qari];
                    console.log(`🎵 Using preferred qari ${qari}:`, audioUrl);
                    break;
                }
            }
            
            // If no qari names found, try numbered keys
            if (!audioUrl) {
                for (const key of preferredKeys) {
                    if (audioUrls[key]) {
                        audioUrl = audioUrls[key];
                        console.log(`🎵 Using preferred key ${key}:`, audioUrl);
                        break;
                    }
                }
            }
            
            // If still no URL found, get first available
            if (!audioUrl) {
                const firstKey = Object.keys(audioUrls)[0];
                if (firstKey) {
                    audioUrl = audioUrls[firstKey];
                    console.log(`🎵 Using first available (${firstKey}):`, audioUrl);
                }
            }
        }
    }
    
    console.log('✅ Final audio URL:', audioUrl);
    return audioUrl;
}

// Run the test
const result = testAudioUrlParsing(mockApiResponse);

console.log('\n📊 Test Results:');
console.log('Input format: Numbered keys (01, 02, 03, 04, 05)');
console.log('Expected: Should select key "03" (Sudais) as preferred');
console.log('Actual result:', result);
console.log('Test passed:', result === mockApiResponse.audio_urls["03"] ? '✅ YES' : '❌ NO');

// Test with old format
console.log('\n🧪 Testing with old format...');
const oldFormatData = {
    "ayah_number": "1",
    "audio_urls": {
        "alafasy": "https://example.com/alafasy/001.mp3",
        "sudais": "https://example.com/sudais/001.mp3",
        "husary": "https://example.com/husary/001.mp3"
    }
};

const oldResult = testAudioUrlParsing(oldFormatData);
console.log('Old format test passed:', oldResult === oldFormatData.audio_urls["alafasy"] ? '✅ YES' : '❌ NO');
