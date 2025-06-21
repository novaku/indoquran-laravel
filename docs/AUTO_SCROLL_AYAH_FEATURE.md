# Auto-Scroll to Ayah Feature Documentation

## Overview
Fitur auto-scroll to ayah memungkinkan user untuk otomatis diarahkan ke text Arabic ayat yang spesifik ketika mengklik link ayat dari berbagai halaman, terutama dari halaman Tafsir Maudhui.

## How It Works

### 1. URL Navigation
- Format URL: `/surah/{surah_number}/{ayah_number}`
- Contoh: `/surah/2/255` untuk Ayat Kursi
- URL ini dapat diakses langsung atau melalui link dari halaman lain

### 2. Auto-Scroll Process
1. **URL Detection**: Component mendeteksi perubahan URL parameter
2. **State Update**: currentAyahNumber di-update sesuai URL
3. **DOM Ready Check**: Menunggu component dan data ter-load sempurna
4. **Multi-Strategy Scroll**: Menggunakan beberapa strategi scroll untuk reliability
5. **Visual Feedback**: Memberikan highlight sementara pada ayat target

### 3. Scroll Strategies (Prioritized)
```javascript
// Strategy 1: Use currentAyahRef (primary reference)
currentAyahRef.current.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
});

// Strategy 2: Use specific ayah ID
document.getElementById(`ayah-${ayahNum}-arabic`).scrollIntoView({
    behavior: 'smooth',
    block: 'center', 
    inline: 'nearest'
});

// Strategy 3: Fallback to ayah content container
document.getElementById('ayah-content').scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
});
```

### 4. Visual Feedback
- **Highlight Effect**: Background kuning gradien selama 2 detik
- **Smooth Animation**: Transition effect untuk highlight
- **Non-intrusive**: Tidak mengganggu reading experience

## Implementation Details

### Key Functions

#### scrollToCurrentAyah()
```javascript
const scrollToCurrentAyah = useCallback((ayahNum = currentAyahNumber) => {
    // Multiple scroll strategies with fallbacks
    // Visual highlight effect
    // Console logging for debugging
}, [currentAyahNumber]);
```

#### URL Change Detection
```javascript
useEffect(() => {
    if (ayahNumber) {
        const ayahNum = parseInt(ayahNumber);
        if (ayahNum !== currentAyahNumber) {
            setCurrentAyahNumber(ayahNum);
            // Auto-scroll when URL changes
            setTimeout(() => {
                scrollToCurrentAyah(ayahNum);
            }, 100);
        }
    }
}, [ayahNumber, currentAyahNumber]);
```

#### Component Load Detection
```javascript
useEffect(() => {
    // Auto-scroll when component is fully loaded
    if (!loading && ayahs.length > 0 && ayahNumber && currentAyah) {
        setTimeout(() => {
            scrollToCurrentAyah(parseInt(ayahNumber));
        }, 200);
    }
}, [loading, ayahs.length, ayahNumber, currentAyah, scrollToCurrentAyah]);
```

### DOM Structure
```html
<div id="ayah-content">
    <div id="ayah-{ayahNumber}-arabic">
        <p ref={currentAyahRef} className="font-arabic">
            {arabic_text}
        </p>
    </div>
</div>
```

## Usage Examples

### From Tafsir Maudhui Page
```jsx
<Link to={`/surah/${verse.surah}/${verse.ayah}`}>
    {verse.surah}:{verse.ayah}
</Link>
```

### Direct URL Access
- `http://localhost:8000/surah/2/255` - Langsung ke Ayat Kursi
- `http://localhost:8000/surah/18/10` - Langsung ke ayat Ashabul Kahfi

### Programmatic Navigation
```javascript
// From any React component
navigate(`/surah/${surahNumber}/${ayahNumber}`);
```

## Timing & Performance

### Delays Used
- **URL Change**: 100ms delay untuk state update
- **Component Load**: 200ms delay untuk DOM rendering
- **Navigation**: 300ms delay untuk smooth transition
- **Highlight Duration**: 2000ms untuk visual feedback

### Performance Considerations
- Minimal DOM queries dengan ID-based targeting
- Efficient ref usage untuk current ayah
- Debounced execution untuk prevent rapid calls
- Navigation state tracking untuk prevent race conditions

## Browser Compatibility
- ✅ Chrome/Chromium (modern versions)
- ✅ Firefox (modern versions)
- ✅ Safari (modern versions)
- ✅ Edge (modern versions)
- ⚠️ Older browsers may fallback to instant scroll

## Troubleshooting

### Common Issues
1. **Scroll tidak terjadi**: Periksa apakah ayah number valid dan ada dalam data
2. **Scroll ke posisi salah**: Periksa DOM structure dan ID ayat
3. **Highlight tidak muncul**: Periksa CSS transition support

### Debug Mode
Enable console logging untuk melihat scroll process:
```javascript
console.log(`🎯 Scrolling to ayah ${ayahNum}...`);
console.log('📍 Using strategy for scroll');
```

## Future Enhancements
1. **Smooth page transition**: Animate dari halaman sebelumnya
2. **Reading progress**: Update reading progress ketika scroll
3. **Bookmark integration**: Auto-bookmark ayat yang di-scroll
4. **Audio integration**: Auto-play audio ketika scroll ke ayat
5. **Responsive timing**: Adjust delay berdasarkan device performance

## Related Files
- `/resources/js/react/pages/SimpleSurahPage.jsx` - Main implementation
- `/resources/js/react/pages/TafsirMaudhuiPage.jsx` - Source of ayah links
- `/docs/TAFSIR_MAUDHUI_FEATURE.md` - Overall Tafsir Maudhui documentation
