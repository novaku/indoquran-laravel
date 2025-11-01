# Panduan Simplifikasi Desain IndoQuran

## Prinsip Desain Simple & Clean

### 1. Background Pattern
```jsx
// OLD - Complex dengan slideshow/backdrop
<div className="bg-gradient-to-br from-islamic-gold via-islamic-green to-blue-900">
  <div className="backdrop-blur-xl bg-black/20">

// NEW - Simple gradient
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
```

### 2. Header Pattern
```jsx
// NEW - Simple header dengan border
<div className="bg-white border-b border-gray-200">
  <div className="max-w-4xl mx-auto px-4 py-6">
    <h1 className="text-2xl font-bold text-gray-900">Judul Halaman</h1>
  </div>
</div>
```

### 3. Card Pattern
```jsx
// OLD - Complex shadows dan blur
<div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60">

// NEW - Simple white card
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
```

### 4. Button Pattern
```jsx
// OLD - Transform dan shadow berlebihan
<button className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-105">

// NEW - Simple button
<button className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
```

### 5. Input Pattern
```jsx
// NEW - Clean input dengan rounded-xl
<input className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900" />
```

### 6. Spacing & Layout
- Max width container: `max-w-3xl` atau `max-w-4xl`
- Padding: `p-4`, `p-6`, `py-8`
- Gap: `gap-4`, `gap-6`, `space-y-4`
- Rounded: `rounded-2xl`, `rounded-xl`, `rounded-full`

### 7. Color Scheme
- Background: `bg-white`, `bg-gray-50`, `bg-gray-100`
- Text: `text-gray-900` (judul), `text-gray-700` (konten), `text-gray-500` (subtitle)
- Primary: `bg-green-600`, `text-green-600`, `border-green-200`
- Border: `border-gray-200`, `border-gray-300`

### 8. Typography
- H1: `text-2xl font-bold text-gray-900`
- H2: `text-xl font-bold text-gray-900`
- Body: `text-base text-gray-700`
- Small: `text-sm text-gray-600`

## Checklist Per Halaman
- [ ] Remove backdrop-blur effects
- [ ] Replace complex gradients dengan simple `from-gray-50 via-white to-green-50`
- [ ] Change shadow-2xl/3xl menjadi shadow-sm
- [ ] Update rounded-3xl menjadi rounded-2xl atau rounded-xl
- [ ] Remove transform hover:scale effects
- [ ] Simplify button designs
- [ ] Use consistent spacing (p-4, p-6, gap-4)
- [ ] Update border colors to gray-200
- [ ] Remove heavy animations
- [ ] Use clean white cards

## Halaman yang Sudah Diupdate
- [x] PrayerPage.jsx - ✅ Complete
- [x] PrayerCard.jsx - ✅ Complete  
- [x] PrayerForm.jsx - ✅ Complete
- [x] QuranHomePage.jsx - ✅ Already simple

## Halaman yang Perlu Diupdate
- [ ] SurahListPage.jsx
- [ ] UserProfilePage.jsx
- [ ] AsmaulHusnaPage.jsx
- [ ] UserBookmarksPage.jsx
- [ ] TafsirMaudhuiPage.jsx
- [ ] JuzPage.jsx
- [ ] SurahDetailPage.jsx
- [ ] UserAuthPage.jsx
- [ ] AboutProjectPage.jsx
- [ ] ContactSupportPage.jsx
- [ ] Dan lainnya...
