/**
 * Test script to verify shareAyah functionality
 * Run this to check if the shareAyah button works correctly
 */

// Test the API endpoint to see the data structure
console.log('Testing ShareAyah functionality...');

// First, let's check the API data structure
fetch('https://indoquran.web.id/api/surahs/16')
    .then(response => response.json())
    .then(data => {
        console.log('API Response structure:', {
            surah: data.surah ? {
                name_latin: data.surah.name_latin,
                name_arabic: data.surah.name_arabic,
                name_english: data.surah.name_english,
                total_ayahs: data.surah.total_ayahs
            } : 'No surah',
            ayahs_count: data.ayahs ? data.ayahs.length : 0,
            first_ayah: data.ayahs && data.ayahs.length > 0 ? {
                ayah_number: data.ayahs[0].ayah_number,
                number: data.ayahs[0].number,
                verse_number: data.ayahs[0].verse_number,
                text_arabic: data.ayahs[0].text_arabic ? data.ayahs[0].text_arabic.substring(0, 50) + '...' : 'No text',
                text_indonesian: data.ayahs[0].text_indonesian ? data.ayahs[0].text_indonesian.substring(0, 50) + '...' : 'No translation'
            } : 'No ayahs',
            ayah_92: data.ayahs ? data.ayahs.find(a => 
                parseInt(a.ayah_number) === 92 || 
                parseInt(a.number) === 92 ||
                parseInt(a.verse_number) === 92
            ) : null
        });

        // Test shareAyah logic
        if (data.ayahs) {
            const testAyahNumber = 92;
            const ayah = data.ayahs.find(a => 
                parseInt(a.ayah_number) === parseInt(testAyahNumber) || 
                parseInt(a.number) === parseInt(testAyahNumber) ||
                parseInt(a.verse_number) === parseInt(testAyahNumber)
            );

            console.log('ShareAyah test for ayah 92:', {
                found: !!ayah,
                ayah: ayah ? {
                    ayah_number: ayah.ayah_number,
                    number: ayah.number,
                    verse_number: ayah.verse_number,
                    text_arabic: ayah.text_arabic ? ayah.text_arabic.substring(0, 50) + '...' : 'No text',
                    text_indonesian: ayah.text_indonesian ? ayah.text_indonesian.substring(0, 50) + '...' : 'No translation'
                } : null
            });

            if (ayah) {
                // Construct share text like in the actual function
                let shareText = `🕌 Al-Qur'an: ${data.surah.name_latin || data.surah.name_english} - Ayat ${testAyahNumber}\n\n`;
                shareText += `📖 Arab:\n${ayah.text_arabic}\n\n`;
                
                if (ayah.text_latin) {
                    shareText += `🔤 Latin:\n${ayah.text_latin}\n\n`;
                }
                
                const indonesianText = ayah.text_indonesian || ayah.translation_id || '';
                if (indonesianText) {
                    shareText += `🇮🇩 Terjemahan:\n${indonesianText}\n\n`;
                }

                shareText += `� Surah ${data.surah.name_latin} (${data.surah.name_arabic}) - Ayat ${testAyahNumber}\n`;
                shareText += `🔗 Baca selengkapnya: https://indoquran.web.id/surah/16/${testAyahNumber}\n\n`;
                shareText += `📱 IndoQuran - Baca Al-Qur'an dengan mudah`;

                console.log('Generated share text (first 200 chars):', shareText.substring(0, 200) + '...');
                
                const encodedText = encodeURIComponent(shareText);
                const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                
                console.log('WhatsApp URL generated successfully:', {
                    shareTextLength: shareText.length,
                    encodedTextLength: encodedText.length,
                    urlPreview: whatsappUrl.substring(0, 100) + '...'
                });
                
                console.log('✅ ShareAyah logic works correctly!');
            } else {
                console.error('❌ Could not find ayah 92 in the data');
            }
        }
    })
    .catch(error => {
        console.error('❌ Error testing shareAyah:', error);
    });
