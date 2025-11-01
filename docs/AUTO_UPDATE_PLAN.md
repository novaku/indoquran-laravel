# Auto-Update All Pages Script

## Pages to Update with UI Components

This document lists all pages that need UI component updates.

### ✅ Completed
1. QuranHomePage.jsx
2. UserProfilePage.jsx  
3. SurahListPage.jsx

### 🔄 In Progress
Below are the files and their required changes:

#### 4. UserAuthPage.jsx
**Imports:**
```jsx
import { Card, Button, Input, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace form containers with `<Card>`
- Replace buttons with `<Button variant="primary">`
- Replace inputs with `<Input>` components

#### 5. UserBookmarksPage.jsx
**Imports:**
```jsx
import { Card, Button, Badge, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace header div with `<PageHeader>`
- Replace content wrapper with `<PageContent>`
- Replace bookmark cards with `<Card hoverable>`
- Replace badges with `<Badge variant="success/warning">`

#### 6. AboutProjectPage.jsx
**Imports:**
```jsx
import { Card, Button, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace header div with `<PageHeader>`
- Replace content wrapper with `<PageContent>`
- Replace sections with `<Card>`
- Replace buttons with `<Button>`

#### 7. ContactSupportPage.jsx
**Imports:**
```jsx
import { Card, Button, Input, Select, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace form card with `<Card>`
- Replace all inputs with `<Input>` components
- Replace submit button with `<Button variant="primary" loading={loading}>`

#### 8. DonationSupportPage.jsx
**Imports:**
```jsx
import { Card, Button, PageHeader, PageContent, Badge } from '../components/ui';
```

**Changes:**
- Replace donation packages with `<Card hoverable>`
- Replace CTA buttons with `<Button variant="primary">`
- Replace badges with `<Badge variant="success">`

#### 9. JuzIndexPage.jsx & JuzPage.jsx
**Imports:**
```jsx
import { Card, Button, Badge, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace juz cards with `<Card hoverable>`
- Replace navigation buttons with `<Button>`
- Replace status badges with `<Badge>`

#### 10. PageListPage.jsx & PageDetailPage.jsx
**Imports:**
```jsx
import { Card, Button, PageHeader, PageContent } from '../components/ui';
```

**Changes:**
- Replace page cards with `<Card hoverable>`
- Replace navigation buttons with `<Button>`

### Pattern Summary

**Common Import:**
```jsx
import { Card, Button, Input, Select, Badge, PageHeader, PageContent } from '../components/ui';
```

**Common Replacements:**

1. **Headers:**
```jsx
// Before
<div className="bg-white border-b">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <h1>Title</h1>
  </div>
</div>

// After
<PageHeader title="Title" icon={<Icon />} />
```

2. **Content Wrapper:**
```jsx
// Before
<div className="max-w-7xl mx-auto px-4 py-8">
  {/* content */}
</div>

// After
<PageContent size="lg">
  {/* content */}
</PageContent>
```

3. **Cards:**
```jsx
// Before
<div className="bg-white rounded-xl border p-6 shadow-sm">
  {/* content */}
</div>

// After
<Card>
  {/* content */}
</Card>
```

4. **Buttons:**
```jsx
// Before
<button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
  Save
</button>

// After
<Button variant="primary">Save</Button>
```

5. **Inputs:**
```jsx
// Before
<input
  type="text"
  className="w-full px-4 py-3 border rounded-lg"
  placeholder="Name"
/>

// After
<Input
  label="Name"
  placeholder="Name"
/>
```

6. **Badges:**
```jsx
// Before
<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
  Active
</span>

// After
<Badge variant="success">Active</Badge>
```

### Bulk Update Strategy

1. Add imports to all files
2. Replace headers with PageHeader
3. Replace content wrappers with PageContent
4. Replace cards with Card component
5. Replace buttons with Button component
6. Replace inputs with Input component
7. Replace badges with Badge component
8. Test each file after update
9. Build and verify no errors

### Estimated Impact

- **Files to Update:** 7-10 files
- **Time per file:** 5-10 minutes
- **Total Time:** 60-90 minutes
- **Lines Changed:** ~500-800 lines
- **Bundle Impact:** Minimal (components already bundled)

### Quality Checklist

For each updated file:
- ✅ No compile errors
- ✅ Imports added correctly
- ✅ All opening tags have closing tags
- ✅ Props passed correctly
- ✅ Styling consistent
- ✅ Functionality preserved
- ✅ Loading states preserved
- ✅ Error states preserved

