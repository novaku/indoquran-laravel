# Visual Guide: Dropdown Qari Selection

## 🎨 UI Components

### 1. Dropdown Component (Default State)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🎙️ Pilih Qari (Pembaca):                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Abdul Basit Murattal (192kbps)            ▼    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│         8 qari terbaik dunia tersedia                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Dropdown Component (Loading State)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              🎙️ Pilih Qari (Pembaca):                  │
│                                                         │
│              Memuat daftar qari...                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Dropdown Component (Expanded)

```
┌─────────────────────────────────────────────────────────┐
│              🎙️ Pilih Qari (Pembaca):                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ✓ Abdul Basit Murattal (192kbps)                │  │ <- Selected
│  ├──────────────────────────────────────────────────┤  │
│  │   Abdurrahmaan As-Sudais (192kbps)              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Alafasy (128kbps)                             │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Husary (128kbps)                              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Minshawy Murattal (128kbps)                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Maher Al Muaiqly (128kbps)                    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Saood Ash-Shuraym (128kbps)                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Muhsin Al Qasim (192kbps)                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Full Surah Audio Player Section

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🔊 Putar Surah Lengkap                            ║
║                                                           ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │  🎙️ Pilih Qari (Pembaca):                         │  ║
║  │                                                    │  ║
║  │  ┌──────────────────────────────────────────────┐ │  ║
║  │  │ Abdul Basit Murattal (192kbps)          ▼   │ │  ║
║  │  └──────────────────────────────────────────────┘ │  ║
║  │                                                    │  ║
║  │        8 qari terbaik dunia tersedia              │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                           ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │  Sedang memutar: Ayat 3 dari 7                    │  ║
║  │  ████████████░░░░░░░░░░░░░░░░░░░░░  42%           │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                           ║
║         [▶ Putar Surah]  [⏸ Jeda]  [⏹ Stop]            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## 🎯 Interaction Flow

### Flow 1: Normal Playback
```
User Opens Page
      ↓
API Loads Reciters
      ↓
Dropdown Shows 8 Reciters (Default: Abdul Basit)
      ↓
User Clicks "Putar Surah"
      ↓
Audio Plays with Selected Qari
      ↓
Progress Bar Updates
      ↓
Auto-advance to Next Ayah
```

### Flow 2: Change Qari Mid-Playback
```
Audio Currently Playing (Qari: Abdul Basit)
      ↓
User Opens Dropdown
      ↓
User Selects Different Qari (e.g., Sudais)
      ↓
Current Audio Stops Automatically
      ↓
selectedQari State Updates
      ↓
User Clicks "Putar Surah" Again
      ↓
Audio Plays with New Qari (Sudais)
```

### Flow 3: API Failure Handling
```
Page Loads
      ↓
API Request to /api/reciters/recommended
      ↓
API Fails (Network Error)
      ↓
Console Error Logged
      ↓
Fallback to Default 3 Reciters
      ↓
Dropdown Still Functional
```

## 📊 State Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Component States                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Initial]                                               │
│     ↓                                                    │
│  recitersLoading = true                                  │
│  availableReciters = []                                  │
│  selectedQari = '2'                                      │
│     ↓                                                    │
│  [API Call]                                              │
│     ↓                                                    │
│  Success → availableReciters populated                   │
│            recitersLoading = false                       │
│     ↓                                                    │
│  [Ready]                                                 │
│     ↓                                                    │
│  User Interaction:                                       │
│  - Select Qari → selectedQari updates                    │
│  - Play Audio → uses selectedQari                        │
│  - Change Qari while playing → stops audio               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎨 CSS Classes Used

### Dropdown Container
```css
.mb-4                    /* Margin bottom */
```

### Label
```css
.block                   /* Display block */
.text-sm                 /* Small text */
.font-medium             /* Medium font weight */
.text-gray-700           /* Gray text color */
.mb-2                    /* Margin bottom small */
.text-center             /* Center align */
```

### Select Element
```css
.w-full                  /* Full width */
.max-w-md                /* Max width medium */
.mx-auto                 /* Horizontal center margin */
.block                   /* Display block */
.bg-white                /* White background */
.border-2                /* 2px border */
.border-gray-300         /* Gray border */
.rounded-lg              /* Large border radius */
.px-4                    /* Horizontal padding */
.py-3                    /* Vertical padding */
.text-sm                 /* Small text */
.font-medium             /* Medium font weight */
.text-gray-700           /* Gray text */
.focus:outline-none      /* Remove outline on focus */
.focus:ring-2            /* Focus ring 2px */
.focus:ring-green-500    /* Green focus ring */
.focus:border-green-500  /* Green border on focus */
.transition-all          /* Smooth transitions */
.hover:border-green-400  /* Green border on hover */
.cursor-pointer          /* Pointer cursor */
.shadow-sm               /* Small shadow */
```

### Info Text
```css
.text-xs                 /* Extra small text */
.text-gray-500           /* Light gray text */
.text-center             /* Center align */
.mt-2                    /* Margin top small */
```

## 🎬 Animation Effects

### 1. Focus Effect
```
Default State:
  border: 2px solid #d1d5db (gray-300)

On Focus:
  border: 2px solid #10b981 (green-500)
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1)
  
Transition: all 0.2s ease
```

### 2. Hover Effect
```
Default State:
  border: 2px solid #d1d5db (gray-300)

On Hover:
  border: 2px solid #34d399 (green-400)
  
Transition: all 0.2s ease
```

### 3. Loading State
```
Text appears centered with gray color
Animation: Fade in (300ms)
```

## 📱 Responsive Behavior

### Desktop (≥768px)
```
┌────────────────────────────────────────┐
│  Label: 🎙️ Pilih Qari (Pembaca):     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Abdul Basit Murattal (192kbps)  │ │ <- max-w-md (448px)
│  └──────────────────────────────────┘ │
│                                        │
│      8 qari terbaik dunia tersedia    │
└────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────────┐
│  🎙️ Pilih Qari:         │
│                          │
│  ┌────────────────────┐ │
│  │ Abdul Basit...    │ │ <- Full width
│  └────────────────────┘ │
│                          │
│  8 qari tersedia        │
└──────────────────────────┘
```

## 🔍 Edge Cases Handled

### 1. Empty Reciters Array
```javascript
if (availableReciters.length === 0) {
  // Show fallback default reciters
  // Still functional
}
```

### 2. Selected Qari Not Found
```javascript
const reciter = availableReciters.find(r => r.id === reciterId);
if (!reciter) {
  // Use first available reciter or default
}
```

### 3. Network Error
```javascript
catch (error) {
  console.error('Error:', error);
  // Set fallback reciters
  // User can still use dropdown
}
```

## 🎯 Accessibility Features

- ✅ Semantic HTML (`<label>`, `<select>`)
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Clear focus indicators
- ✅ Descriptive labels
- ✅ Sufficient color contrast

---

**Visual Guide Created:** 19 Oktober 2025
**Component:** Dropdown Qari Selection
**Status:** ✅ Complete
