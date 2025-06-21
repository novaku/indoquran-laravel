# Fitur Search Logging - IndoQuran

## Deskripsi
Fitur untuk mencatat dan melacak kata pencarian pengguna dengan sistem counter untuk menampilkan pencarian populer. Sistem ini mendukung tracking untuk user yang login maupun anonymous users.

## Struktur Database

### Tabel `search_terms`
```sql
- id: Primary key
- term: Kata pencarian (string, terindeks)
- search_count: Counter jumlah pencarian (integer, default 1)
- user_ip: IP address user (string, nullable)
- created_at: Timestamp dibuat
- updated_at: Timestamp terakhir diupdate
```

### Index Database
- `term` - untuk optimasi pencarian
- `[term, search_count]` - untuk optimasi popular searches
- `search_count` - untuk ranking popular searches

## API Endpoints

### 1. Log Search Term
**POST** `/api/search/log`

**Request Body:**
```json
{
  "term": "Al-Fatihah"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Search term logged successfully",
  "data": {
    "id": 1,
    "term": "al-fatihah",
    "search_count": 1,
    "user_ip": "127.0.0.1",
    "created_at": "2025-06-21T13:27:59.000000Z",
    "updated_at": "2025-06-21T13:27:59.000000Z"
  }
}
```

### 2. Get Popular Searches
**GET** `/api/search/popular?limit=6`

**Response:**
```json
{
  "status": "success",
  "data": ["allah", "al-fatihah", "al-baqarah", "ya-sin", "rahmat", "ar-rahman"]
}
```

### 3. Get Search History by IP
**GET** `/api/search/history?limit=10`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "term": "al-fatihah",
      "search_count": 3,
      "updated_at": "2025-06-21T13:27:59.000000Z"
    }
  ]
}
```

## Model Methods

### SearchTerm Model

#### Static Methods
- `recordSearch($term, $userIp = null)` - Mencatat pencarian baru atau increment counter
- `getPopularSearches($limit = 6)` - Mendapatkan array popular search terms

#### Scopes
- `popular($limit = 10)` - Query builder untuk popular searches
- `forIp($userIp)` - Query builder untuk pencarian berdasarkan IP

## Frontend Integration

### SimpleSearchPage.jsx
Halaman pencarian otomatis mencatat search terms dengan fitur:

1. **Auto Logging**: Setiap pencarian dicatat otomatis ke database berdasarkan IP
2. **Popular Searches Display**: Menampilkan popular searches dari database
3. **Real-time Updates**: Popular searches diupdate setelah pencarian berhasil
4. **Anonymous Support**: Tracking berdasarkan IP address saja

### Implementasi
```javascript
// Log search term (tanpa authentication)
const logSearchTerm = useCallback(async (searchTerm) => {
  try {
    await fetchWithAuth('/api/search/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ term: searchTerm })
    });
  } catch (error) {
    console.error('Error logging search term:', error);
  }
}, []);

// Fetch popular searches
const fetchPopularSearches = useCallback(async () => {
  try {
    const response = await fetchWithAuth('/api/search/popular?limit=6');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setPopularSearches(data.data);
      }
    }
  } catch (error) {
    console.error('Error fetching popular searches:', error);
  }
}, []);
```

## Fitur Tracking

### User Authentication Tracking
- **IP-based Tracking**: Menyimpan `user_ip` untuk tracking berdasarkan alamat IP
- **Privacy Focused**: Tidak menyimpan data user personal
- **Anonymous Only**: Semua tracking anonymous berdasarkan IP

### Counter Logic
- **Existing Term + Same IP**: Increment counter dan update timestamp
- **New Term**: Create record baru dengan count = 1
- **Case Insensitive**: Semua terms disimpan dalam lowercase untuk consistency

## Data Seeding

### Default Popular Terms
Database di-seed dengan data realistis:
```php
- "allah" (200 searches)
- "al-fatihah" (150 searches)
- "al-baqarah" (120 searches)
- "ya-sin" (98 searches)
- "ar-rahman" (87 searches)
- dll.
```

## Security & Privacy

### Data Protection
- Search terms tidak berisi data sensitif
- IP address hanya untuk basic analytics
- No personal data storage
- Full anonymous tracking

### Rate Limiting
- Search logging tidak memblokir search functionality
- Error pada logging tidak mengganggu search results
- Asynchronous logging untuk performance

## Performance Considerations

### Database Optimization
- Index pada kolom `term` untuk fast lookup
- Composite index untuk popular searches query
- Efficient groupBy query untuk ranking

### Frontend Optimization
- Non-blocking search logging
- Cached popular searches
- Debounced API calls

## Monitoring & Analytics

### Metrics Available
- Total searches per term
- IP-based search patterns  
- Popular search trends
- Anonymous search analytics

### Usage
Data ini dapat digunakan untuk:
- Improving search suggestions
- Content recommendations
- User experience optimization
- SEO keyword insights

## Future Enhancements

### Planned Features
1. **Search Suggestions**: Auto-complete berdasarkan popular terms
2. **Trending Searches**: Time-based trending analysis
3. **User Recommendations**: Personal search recommendations
4. **Search Analytics Dashboard**: Admin interface untuk analytics
5. **Export Functionality**: Export search data untuk analysis
6. **Search Filters**: Kategori-based search tracking

### Potential Improvements
- Machine learning untuk better suggestions
- Search intent analysis
- Multi-language search support
- Advanced user behavior tracking
