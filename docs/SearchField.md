# SearchField Component

A reusable search component for Al-Quran with support for both surah and ayah searching.

## Features

- **Surah Search**: Search surahs by latin name, Indonesian name, or surah number
- **Ayah Search**: Search through ayah content with Indonesian translation
- **Autocomplete**: Real-time suggestions with debounced API calls
- **Keyboard Navigation**: Arrow keys, Enter, and Escape support
- **Highlighting**: Search term highlighting in results
- **Theming**: Support for different themes (islamic, amber)
- **Navigation**: Direct navigation to surah pages or specific ayahs

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuggestionClick` | `function` | `undefined` | Callback when a suggestion is clicked |
| `onViewAllResults` | `function` | `undefined` | Callback when "View All Results" is clicked |
| `surahs` | `array` | `[]` | Array of surah data for search functionality |
| `className` | `string` | `''` | Additional CSS classes |
| `placeholder` | `string` | `'Cari ayat Al-Quran...'` | Input placeholder text |
| `theme` | `'islamic'` \| `'amber'` | `'islamic'` | Color theme |

## Usage

### Basic Usage

```jsx
import SearchField from '../components/SearchField';

function MyPage() {
    const [surahs, setSurahs] = useState([]);
    
    return (
        <SearchField 
            surahs={surahs}
            className="w-full"
            theme="islamic"
        />
    );
}
```

### With Custom Handlers

```jsx
import SearchField from '../components/SearchField';

function MyPage() {
    const [surahs, setSurahs] = useState([]);
    
    const handleSuggestionClick = (suggestion) => {
        console.log('Suggestion clicked:', suggestion);
        // Add custom logic here
    };
    
    const handleViewAllResults = (query) => {
        console.log('View all results for:', query);
        // Add custom logic here
    };
    
    return (
        <SearchField 
            surahs={surahs}
            onSuggestionClick={handleSuggestionClick}
            onViewAllResults={handleViewAllResults}
            className="w-full mb-4"
            placeholder="Cari surah atau ayat..."
            theme="amber"
        />
    );
}
```

### Different Themes

```jsx
// Islamic theme (green colors)
<SearchField 
    surahs={surahs}
    theme="islamic"
/>

// Amber theme (orange/amber colors)
<SearchField 
    surahs={surahs}
    theme="amber"
/>
```

## Search Types

The component returns two types of suggestions:

### Surah Suggestions
- Triggered by searching surah names or numbers
- Shows surah details (name, ayah count, revelation place)
- Navigates to `/surah/{number}` when clicked

### Ayah Suggestions  
- Triggered by searching ayah content
- Shows highlighted text matches
- Navigates to `/surah/{surah_number}/{ayah_number}` when clicked

## Suggestion Object Structure

### Surah Suggestion
```javascript
{
    type: 'surah',
    surah: {
        number: 1,
        name_latin: 'Al-Fatihah',
        name_indonesian: 'Pembukaan',
        name_arabic: 'ٱلْفَاتِحَة',
        total_ayahs: 7,
        revelation_place: 'Makkah'
    },
    text: 'Al-Fatihah',
    highlightedText: {
        before: '',
        match: 'Al-Fatihah',
        after: ' (Pembukaan)'
    }
}
```

### Ayah Suggestion
```javascript
{
    type: 'ayah',
    ayah: {
        surah_number: 1,
        number: 1,
        text_indonesian: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.'
    },
    surahName: 'Al-Fatihah',
    text: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
    highlightedText: {
        before: 'Dengan nama ',
        match: 'Allah',
        after: ' Yang Maha Pengasih, Maha Penyayang.'
    }
}
```

## Keyboard Controls

- **Arrow Down**: Navigate to next suggestion
- **Arrow Up**: Navigate to previous suggestion  
- **Enter**: Select highlighted suggestion or submit search
- **Escape**: Close suggestions dropdown

## Styling

The component uses Tailwind CSS classes and supports theming. You can customize the appearance by:

1. Passing custom `className` prop
2. Using different `theme` values
3. Modifying the theme configuration in the component

## Dependencies

- React (hooks: useState, useEffect, useRef, useCallback)
- React Router (useNavigate)
- Custom utilities:
  - `fetchWithAuth` from '../utils/apiUtils'
  - `authUtils` from '../utils/auth'

## API Requirements

The component expects:
- `/api/search?q={query}&limit={limit}` endpoint for ayah search
- Authentication token support via `authUtils.getAuthToken()`
- Response format: `{ status: 'success', data: [...] }`
