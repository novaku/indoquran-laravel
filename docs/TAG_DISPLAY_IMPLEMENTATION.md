# Tag Display Implementation

## Overview
Implementasi tampilan tag di seluruh halaman frontend artikel IndoQuran, termasuk fitur filter artikel berdasarkan tag.

**Tanggal**: 31 Oktober 2025  
**Version**: 2.11.1

---

## Fitur yang Diimplementasikan

### 1. **Tampilan Tag di Halaman Daftar Artikel** (`/artikel`)

#### Lokasi: `resources/js/react/pages/ArticlesPage.jsx`

**Fitur:**
- ✅ Tag ditampilkan di setiap card artikel
- ✅ Tag berbentuk badge dengan warna hijau (`bg-green-100 text-green-800`)
- ✅ Tag bisa diklik untuk filter artikel
- ✅ Indicator filter tag aktif di bagian atas halaman
- ✅ Tombol "Hapus Filter" untuk clear filter tag

**Tampilan Tag di Card:**
```jsx
{article.tags && article.tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    {article.tags.map((tag) => (
      <Link
        key={tag.id}
        to={`/artikel?tag=${tag.slug}`}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
      >
        #{tag.name}
      </Link>
    ))}
  </div>
)}
```

**Filter Tag Indicator:**
```jsx
{selectedTag && (
  <div className="mb-6 flex items-center gap-3">
    <span className="text-gray-600">Filter berdasarkan tag:</span>
    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
      #{selectedTag}
    </span>
    <button onClick={clearTagFilter} className="text-sm text-gray-600 hover:text-red-600 underline">
      Hapus Filter
    </button>
  </div>
)}
```

---

### 2. **Tampilan Tag di Halaman Detail Artikel** (`/artikel/{slug}`)

#### Lokasi: `resources/js/react/pages/ArticleDetailPage.jsx`

**Fitur:**
- ✅ Tag ditampilkan di bagian header artikel (setelah meta info, sebelum tombol share)
- ✅ Tag berbentuk badge lebih besar dengan prefix `#`
- ✅ Tag bisa diklik untuk filter artikel dengan tag tersebut
- ✅ Tag juga ditampilkan di artikel terkait (related articles)

**Tampilan Tag di Detail:**
```jsx
{article.tags && article.tags.length > 0 && (
  <div className="mb-6">
    <div className="flex flex-wrap gap-2">
      {article.tags.map((tag) => (
        <Link
          key={tag.id}
          to={`/artikel?tag=${tag.slug}`}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  </div>
)}
```

**Tag di Artikel Terkait:**
```jsx
{related.tags && related.tags.length > 0 && (
  <div className="flex flex-wrap gap-1 mb-2">
    {related.tags.slice(0, 2).map((tag) => (
      <span
        key={tag.id}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        {tag.name}
      </span>
    ))}
  </div>
)}
```

---

### 3. **Filter Artikel Berdasarkan Tag**

#### URL Pattern
```
/artikel?tag={slug}
```

**Contoh:**
- `/artikel?tag=tafsir` - Menampilkan artikel dengan tag "Tafsir"
- `/artikel?tag=ibadah` - Menampilkan artikel dengan tag "Ibadah"
- `/artikel?tag=sholat` - Menampilkan artikel dengan tag "Sholat"

#### Backend Support
API endpoint sudah mendukung filter tag:
```
GET /api/articles?tag={slug}
```

**Contoh Response:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 2,
      "title": "Surah Yasin: Jantungnya Al-Quran",
      "slug": "surah-yasin-jantungnya-al-quran",
      "tags": [
        {
          "id": 2,
          "name": "Tafsir",
          "slug": "tafsir"
        },
        {
          "id": 1,
          "name": "Ibadah",
          "slug": "ibadah"
        }
      ]
    }
  ],
  "total": 3
}
```

---

## State Management di ArticlesPage

### State Variables
```javascript
const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
```

### useEffect Hook
```javascript
useEffect(() => {
  const tag = searchParams.get('tag') || '';
  setSelectedTag(tag);
  fetchArticles(currentPage, searchQuery, tag);
}, [currentPage, searchParams]);
```

### Fetch Function
```javascript
const fetchArticles = async (page = 1, search = '', tag = '') => {
  const params = new URLSearchParams({ page: page.toString() });
  if (search) params.append('search', search);
  if (tag) params.append('tag', tag);
  
  const response = await getWithAuth(`/api/articles?${params.toString()}`);
  // ... handle response
};
```

### Clear Filter Function
```javascript
const clearTagFilter = () => {
  setSelectedTag('');
  setSearchParams({ page: '1' });
  fetchArticles(1, searchQuery, '');
};
```

---

## Design System

### Tag Badge Styling

#### Small Badge (untuk card artikel & related articles)
```css
px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200
```

#### Medium Badge (untuk detail artikel)
```css
px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200
```

#### Large Badge (untuk filter indicator)
```css
px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800
```

### Color Scheme
- **Background**: `bg-green-100` (#dcfce7)
- **Text**: `text-green-800` (#166534)
- **Hover**: `bg-green-200` (#bbf7d0)

---

## User Flow

### Scenario 1: Filter dari Halaman Daftar
1. User membuka `/artikel`
2. User melihat artikel dengan berbagai tag
3. User mengklik tag "Tafsir" di salah satu artikel
4. URL berubah menjadi `/artikel?tag=tafsir`
5. Halaman menampilkan hanya artikel dengan tag "Tafsir"
6. Indicator filter muncul di atas: "Filter berdasarkan tag: #tafsir [Hapus Filter]"
7. User bisa klik "Hapus Filter" untuk kembali ke semua artikel

### Scenario 2: Filter dari Halaman Detail
1. User membaca artikel di `/artikel/tadabbur-al-quran`
2. User melihat tag di bawah meta info: #Tafsir #Ibadah #Akhlak
3. User mengklik tag "#Tafsir"
4. Browser navigate ke `/artikel?tag=tafsir`
5. Menampilkan daftar artikel dengan tag "Tafsir"

### Scenario 3: Tag di Artikel Terkait
1. User membaca artikel
2. Scroll ke bawah ke bagian "Artikel Terkait"
3. Setiap artikel terkait menampilkan max 2 tag pertama
4. Tag tidak clickable di artikel terkait (untuk menghindari confusion)
5. User bisa klik artikel untuk baca, lalu klik tag di halaman detail

---

## Testing

### Test 1: API Response dengan Tag
```bash
curl -s 'http://localhost:8000/api/articles' | jq '.data[0] | {title, tags: .tags | map({name, slug})}'
```

**Expected Output:**
```json
{
  "title": "Mengenal Tajwid: Seni Membaca Al-Quran dengan Benar",
  "tags": [
    {"name": "Ibadah", "slug": "ibadah"},
    {"name": "Fiqih", "slug": "fiqih"}
  ]
}
```

### Test 2: Filter Berdasarkan Tag
```bash
curl -s 'http://localhost:8000/api/articles?tag=tafsir' | jq '{total: .total, articles: .data | map(.title)}'
```

**Expected Output:**
```json
{
  "total": 3,
  "articles": [
    "Surah Yasin: Jantungnya Al-Quran",
    "Tadabbur Al-Quran: Merenungkan Ayat-Ayat Allah",
    "Makna Surah Al-Fatihah: Induk Segala Surah"
  ]
}
```

### Test 3: Tag Popular
```bash
curl -s 'http://localhost:8000/api/tags/popular?limit=5' | jq '.[] | {name, articles_count}'
```

**Expected Output:**
```json
{"name": "Ibadah", "articles_count": 5}
{"name": "Tafsir", "articles_count": 3}
{"name": "Akhlak", "articles_count": 2}
{"name": "Motivasi", "articles_count": 2}
{"name": "Fiqih", "articles_count": 1}
```

---

## Browser Testing Checklist

- [x] Tag muncul di card artikel (/artikel)
- [x] Tag clickable dan navigate ke filter page
- [x] Filter indicator muncul saat ada tag dipilih
- [x] Tombol "Hapus Filter" berfungsi
- [x] Tag muncul di detail artikel
- [x] Tag di detail clickable
- [x] Tag muncul di artikel terkait (max 2 tag)
- [x] Pagination tetap berfungsi dengan filter tag
- [x] Search tetap berfungsi dengan filter tag
- [x] URL parameter `?tag={slug}` persist saat pagination

---

## Potential Improvements (Future)

### 1. **Tag Cloud Widget**
Menampilkan semua tag dengan ukuran berbeda berdasarkan popularitas:
```jsx
<div className="tag-cloud">
  {tags.map(tag => (
    <Link
      to={`/artikel?tag=${tag.slug}`}
      style={{ fontSize: `${0.8 + (tag.count / maxCount) * 0.8}rem` }}
    >
      {tag.name}
    </Link>
  ))}
</div>
```

### 2. **Multi-Tag Filter**
Filter artikel dengan multiple tags:
```
/artikel?tags=tafsir,ibadah,sholat
```

### 3. **Tag Autocomplete di Search**
Saat user mengetik di search, suggest tags yang relevan

### 4. **Tag Management di Admin**
Interface untuk create/edit/delete tags:
- Bulk assign tags ke artikel
- Merge duplicate tags
- Tag statistics dan analytics

### 5. **Related Tags**
Di halaman filter tag, tampilkan "Tag Terkait" untuk eksplorasi lebih lanjut

---

## Files Modified

1. **resources/js/react/pages/ArticlesPage.jsx**
   - Added `selectedTag` state
   - Updated `fetchArticles()` to accept tag parameter
   - Added tag display in article cards
   - Added tag filter indicator
   - Added `clearTagFilter()` function
   - Updated pagination to preserve tag filter

2. **resources/js/react/pages/ArticleDetailPage.jsx**
   - Added tag display after meta info
   - Made tags clickable with Link component
   - Added tags to related articles (max 2 tags)

---

## Conclusion

✅ **Semua tag sekarang ditampilkan di frontend artikel**
✅ **Filter artikel berdasarkan tag berfungsi dengan baik**
✅ **UI/UX konsisten dengan design system IndoQuran**
✅ **Tested dan berfungsi sempurna di development environment**

Fitur ini meningkatkan discoverability artikel dan memudahkan user untuk menemukan konten yang relevan berdasarkan topik yang mereka minati.
