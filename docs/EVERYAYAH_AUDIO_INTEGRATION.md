# Integrasi Audio Murottal EveryAyah.com

## 📖 Deskripsi

Fitur integrasi audio murottal dari EveryAyah.com yang menyediakan audio tilawah Al-Quran dari berbagai qari terbaik dunia dengan kualitas tinggi.

## 🎯 Fitur Utama

### 1. **79+ Qari Pilihan**
   - Abdul Basit (Murattal & Mujawwad)
   - Abdurrahmaan As-Sudais
   - Mishary Rashid Alafasy
   - Husary (Murattal, Mujawwad, Muallim)
   - Minshawy (Murattal & Mujawwad)
   - Maher Al Muaiqly
   - Dan 70+ qari lainnya

### 2. **Berbagai Kualitas Audio**
   - 16kbps (Low)
   - 32kbps (Mobile)
   - 40kbps (Mobile)
   - 48kbps (Standard)
   - 64kbps (Good)
   - 128kbps (High)
   - 192kbps (Very High)

### 3. **Berbagai Gaya Tilawah**
   - **Murattal** (Bacaan bertajwid dengan tempo sedang)
   - **Mujawwad** (Bacaan indah dengan tajwid sempurna)
   - **Muallim** (Bacaan untuk pembelajaran)
   - **Warsh** (Riwayat Warsh)
   - **Translation** (Terjemahan dalam bahasa Inggris)

## 📡 API Endpoints

### 1. **Mendapatkan Semua Qari**
```http
GET /api/reciters
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "2",
      "name": "Abdul Basit Murattal",
      "subfolder": "Abdul_Basit_Murattal_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    },
    ...
  ],
  "total": 79
}
```

### 2. **Mendapatkan Qari Rekomendasi**
```http
GET /api/reciters/recommended
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "2",
      "name": "Abdul Basit Murattal",
      "subfolder": "Abdul_Basit_Murattal_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    },
    {
      "id": "8",
      "name": "Abdurrahmaan As-Sudais",
      "subfolder": "Abdurrahmaan_As-Sudais_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    },
    ...
  ]
}
```

### 3. **Mendapatkan Qari Berdasarkan Gaya**
```http
GET /api/reciters/by-style
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "murattal": [...],
    "mujawwad": [...],
    "muallim": [...],
    "warsh": [...],
    "translation": [...]
  }
}
```

### 4. **Mencari Qari**
```http
GET /api/reciters/search?q=sudais
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "7",
      "name": "Abdurrahmaan As-Sudais",
      "subfolder": "Abdurrahmaan_As-Sudais_64kbps",
      "bitrate": "64kbps",
      "style": "murattal"
    },
    {
      "id": "8",
      "name": "Abdurrahmaan As-Sudais",
      "subfolder": "Abdurrahmaan_As-Sudais_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    }
  ],
  "total": 2
}
```

### 5. **Mendapatkan Audio URL untuk Ayat Tertentu**
```http
GET /api/audio/ayah/{surahNumber}/{ayahNumber}?reciter=2
```

**Contoh:**
```http
GET /api/audio/ayah/1/1?reciter=2
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "surah_number": 1,
    "ayah_number": 1,
    "reciter": {
      "id": "2",
      "name": "Abdul Basit Murattal",
      "subfolder": "Abdul_Basit_Murattal_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    },
    "audio_url": "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3"
  }
}
```

### 6. **Mendapatkan Audio URL untuk Ayat dari Semua Qari**
```http
GET /api/audio/ayah/{surahNumber}/{ayahNumber}/all-reciters
```

**Contoh:**
```http
GET /api/audio/ayah/1/1/all-reciters
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "surah_number": 1,
    "ayah_number": 1,
    "reciters": [
      {
        "reciter_id": "1",
        "reciter_name": "Abdul Basit Murattal",
        "bitrate": "64kbps",
        "style": "murattal",
        "url": "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/001001.mp3"
      },
      {
        "reciter_id": "2",
        "reciter_name": "Abdul Basit Murattal",
        "bitrate": "192kbps",
        "style": "murattal",
        "url": "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3"
      },
      ...
    ]
  }
}
```

### 7. **Mendapatkan Audio URLs untuk Seluruh Surah**
```http
GET /api/audio/surah/{surahNumber}?reciter=2
```

**Contoh:**
```http
GET /api/audio/surah/1?reciter=8
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "surah": {
      "number": 1,
      "name_latin": "Al-Fatihah",
      "name_arabic": "الفاتحة",
      "ayah_count": 7,
      ...
    },
    "reciter": {
      "id": "8",
      "name": "Abdurrahmaan As-Sudais",
      "subfolder": "Abdurrahmaan_As-Sudais_192kbps",
      "bitrate": "192kbps",
      "style": "murattal"
    },
    "audio_urls": {
      "1": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001001.mp3",
      "2": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001002.mp3",
      "3": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001003.mp3",
      "4": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001004.mp3",
      "5": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001005.mp3",
      "6": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001006.mp3",
      "7": "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/001007.mp3"
    }
  }
}
```

## 🎤 Daftar Qari Rekomendasi (Top 8)

| ID | Nama Qari | Bitrate | Style |
|----|-----------|---------|-------|
| 2  | Abdul Basit Murattal | 192kbps | murattal |
| 8  | Abdurrahmaan As-Sudais | 192kbps | murattal |
| 15 | Alafasy | 128kbps | murattal |
| 20 | Husary | 128kbps | murattal |
| 34 | Minshawy Murattal | 128kbps | murattal |
| 29 | Maher Al Muaiqly | 128kbps | murattal |
| 44 | Saood Ash-Shuraym | 128kbps | murattal |
| 52 | Muhsin Al Qasim | 192kbps | murattal |

## 💻 Contoh Penggunaan di Frontend

### React Example - Audio Player dengan Dropdown Qari

```jsx
import React, { useState, useEffect } from 'react';

function QuranAudioPlayer({ surahNumber, ayahNumber }) {
  const [reciters, setReciters] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState('2'); // Default: Abdul Basit
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  // Fetch recommended reciters
  useEffect(() => {
    fetch('/api/reciters/recommended')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setReciters(data.data);
        }
      });
  }, []);

  // Fetch audio URL when reciter or ayah changes
  useEffect(() => {
    const url = `/api/audio/ayah/${surahNumber}/${ayahNumber}?reciter=${selectedReciter}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAudioUrl(data.data.audio_url);
        }
      });
  }, [surahNumber, ayahNumber, selectedReciter]);

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="audio-player">
      <h3>Audio Murottal</h3>
      
      {/* Reciter Dropdown */}
      <select 
        value={selectedReciter} 
        onChange={(e) => setSelectedReciter(e.target.value)}
        className="reciter-select"
      >
        {reciters.map(reciter => (
          <option key={reciter.id} value={reciter.id}>
            {reciter.name} ({reciter.bitrate})
          </option>
        ))}
      </select>

      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause Button */}
      <button onClick={playAudio}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
    </div>
  );
}

export default QuranAudioPlayer;
```

### Full Surah Player Example

```jsx
import React, { useState, useEffect } from 'react';

function FullSurahPlayer({ surahNumber }) {
  const [reciters, setReciters] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState('8'); // Sudais
  const [audioUrls, setAudioUrls] = useState({});
  const [currentAyah, setCurrentAyah] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  // Fetch reciters
  useEffect(() => {
    fetch('/api/reciters/recommended')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setReciters(data.data);
        }
      });
  }, []);

  // Fetch all audio URLs for the surah
  useEffect(() => {
    fetch(`/api/audio/surah/${surahNumber}?reciter=${selectedReciter}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAudioUrls(data.data.audio_urls);
        }
      });
  }, [surahNumber, selectedReciter]);

  const playFullSurah = () => {
    setCurrentAyah(1);
    setIsPlaying(true);
  };

  const onAudioEnded = () => {
    const nextAyah = currentAyah + 1;
    if (audioUrls[nextAyah]) {
      setCurrentAyah(nextAyah);
    } else {
      setIsPlaying(false);
      setCurrentAyah(1);
    }
  };

  useEffect(() => {
    if (isPlaying && audioUrls[currentAyah]) {
      if (audioRef.current) {
        audioRef.current.src = audioUrls[currentAyah];
        audioRef.current.play();
      }
    }
  }, [currentAyah, isPlaying, audioUrls]);

  return (
    <div className="full-surah-player">
      <h3>Putar Surah Lengkap</h3>
      
      {/* Reciter Selection */}
      <div className="reciter-selector">
        <label>Pilih Qari:</label>
        <select 
          value={selectedReciter} 
          onChange={(e) => setSelectedReciter(e.target.value)}
        >
          {reciters.map(reciter => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.name} ({reciter.bitrate})
            </option>
          ))}
        </select>
      </div>

      {/* Audio Element */}
      <audio 
        ref={audioRef}
        onEnded={onAudioEnded}
      />

      {/* Controls */}
      <div className="controls">
        <button onClick={playFullSurah} disabled={isPlaying}>
          ▶ Putar Surah
        </button>
        <button onClick={() => setIsPlaying(false)} disabled={!isPlaying}>
          ⏹ Stop
        </button>
        <p>Sedang Memutar Ayat: {currentAyah}</p>
      </div>
    </div>
  );
}
```

## 📋 Format Audio URL

Format URL audio mengikuti pola:
```
https://everyayah.com/data/{subfolder}/{SSSAAA}.mp3
```

Dimana:
- `{subfolder}` = Folder reciter (contoh: `Abdul_Basit_Murattal_192kbps`)
- `SSS` = Nomor surah (3 digit, dengan leading zero)
- `AAA` = Nomor ayat (3 digit, dengan leading zero)

**Contoh:**
- Surah 1, Ayat 1: `001001.mp3`
- Surah 2, Ayat 255: `002255.mp3`
- Surah 114, Ayat 6: `114006.mp3`

## 🔧 Konfigurasi

File konfigurasi terletak di:
```
config/reciters.php
```

Struktur konfigurasi:
```php
[
    'base_url' => 'https://everyayah.com/data/',
    'reciters' => [...],
    'recommended' => ['2', '8', '15', '20', '34', '29', '44', '52']
]
```

## 📱 Implementasi di SurahDetailPage

Untuk mengintegrasikan ke halaman detail surah yang sudah ada, tambahkan dropdown qari:

```jsx
// Di SurahDetailPage.jsx
const [availableReciters, setAvailableReciters] = useState([]);
const [selectedReciter, setSelectedReciter] = useState('2');

// Fetch reciters saat komponen mount
useEffect(() => {
  fetch('/api/reciters/recommended')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        setAvailableReciters(data.data);
      }
    });
}, []);

// Update fungsi getAudioUrl
const getAudioUrl = (ayahNumber) => {
  const surahNum = String(surah.number).padStart(3, '0');
  const ayahNum = String(ayahNumber).padStart(3, '0');
  const reciter = availableReciters.find(r => r.id === selectedReciter);
  
  if (reciter) {
    return `https://everyayah.com/data/${reciter.subfolder}/${surahNum}${ayahNum}.mp3`;
  }
  
  return null;
};
```

## 🎯 Keuntungan Menggunakan EveryAyah.com

1. ✅ **Gratis dan Open Source** - Tidak ada biaya lisensi
2. ✅ **CDN Global** - Audio dimuat cepat dari berbagai lokasi
3. ✅ **Kualitas Tinggi** - Hingga 192kbps bitrate
4. ✅ **Pilihan Qari Lengkap** - 79+ qari dari seluruh dunia
5. ✅ **Format Konsisten** - Semua file menggunakan format yang sama
6. ✅ **Reliabilitas Tinggi** - Uptime 99.9%
7. ✅ **No API Limit** - Tidak ada batasan request

## 📊 Testing

Test API endpoints menggunakan curl:

```bash
# Get all reciters
curl http://localhost:8000/api/reciters

# Get recommended reciters
curl http://localhost:8000/api/reciters/recommended

# Get audio for specific ayah
curl "http://localhost:8000/api/audio/ayah/1/1?reciter=2"

# Get all audio for a surah
curl "http://localhost:8000/api/audio/surah/1?reciter=8"

# Search reciters
curl "http://localhost:8000/api/reciters/search?q=basit"
```

## 🔄 Migration dari Audio Lama

Jika sebelumnya menggunakan API audio lain, migrasi sangat mudah:

```javascript
// Old way
const audioUrl = ayah.audio_url; 

// New way - dengan pilihan qari
const audioUrl = `/api/audio/ayah/${surah.number}/${ayah.number}?reciter=${selectedReciter}`;
```

## 📝 Update Log

**Version 1.0.0** - 19 Oktober 2025
- ✅ Integrasi EveryAyah.com API
- ✅ 79+ qari tersedia
- ✅ Berbagai kualitas audio (16kbps - 192kbps)
- ✅ Support gaya: Murattal, Mujawwad, Muallim, Warsh
- ✅ API endpoints lengkap
- ✅ Dokumentasi lengkap

## 🔗 Referensi

- Website: https://everyayah.com/
- Old Index: https://everyayah.com/old_index.html
- Recitations Data: https://everyayah.com/data/recitations.js
- Base URL: https://everyayah.com/data/

---

**Dibuat dengan ❤️ untuk IndoQuran**
