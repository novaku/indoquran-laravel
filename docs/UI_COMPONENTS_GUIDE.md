# IndoQuran UI Component Library

## 📚 Komponen Reusable untuk Konsistensi Desain

Library ini menyediakan komponen UI yang consistent, reusable, dan mudah digunakan untuk membangun halaman-halaman IndoQuran.

## 🎨 Komponen Tersedia

### 1. Card
Komponen container untuk menampilkan konten dalam card.

```jsx
import { Card } from '../components/ui';

// Basic usage
<Card>
  <h3>Title</h3>
  <p>Content here</p>
</Card>

// Hoverable card
<Card hoverable onClick={() => navigate('/detail')}>
  Interactive content
</Card>

// Custom styling
<Card padding="lg" rounded="xl" shadow="md">
  Spacious card with custom styling
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'xl')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' (default: 'sm')
- `hoverable`: boolean (default: false)
- `noPadding`: boolean (default: false)
- `onClick`: function
- `className`: string

---

### 2. Button
Komponen button dengan berbagai variants.

```jsx
import { Button } from '../components/ui';

// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Save Changes
</Button>

// Secondary button
<Button variant="secondary" size="sm">
  Cancel
</Button>

// With icons
<Button 
  variant="primary" 
  leftIcon={<PlusIcon className="w-5 h-5" />}
>
  Add New
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' (default: 'primary')
- `size`: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full' (default: 'full')
- `fullWidth`: boolean (default: false)
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `onClick`: function
- `className`: string

---

### 3. Input & Select
Komponen form input dengan styling konsisten.

```jsx
import { Input, Select } from '../components/ui';

// Text input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// Input with error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Input with icons
<Input
  label="Search"
  placeholder="Search..."
  leftIcon={<SearchIcon className="w-5 h-5" />}
/>

// Textarea
<Input
  as="textarea"
  label="Message"
  rows={4}
  placeholder="Enter your message"
/>

// Select dropdown
<Select
  label="Category"
  options={[
    { value: 'umum', label: 'Umum' },
    { value: 'kesehatan', label: 'Kesehatan' },
  ]}
  value={category}
  onChange={(e) => setCategory(e.target.value)}
/>
```

**Input Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `as`: 'input' | 'textarea' (default: 'input')
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `required`: boolean
- `className`: string
- `containerClassName`: string
- All standard HTML input attributes

**Select Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{value: string, label: string}>
- `required`: boolean
- `className`: string
- `containerClassName`: string

---

### 4. Container, PageHeader, PageContent
Komponen layout untuk struktur halaman yang konsisten.

```jsx
import { Container, PageHeader, PageContent } from '../components/ui';

// Basic container
<Container>
  <h1>Content</h1>
</Container>

// Different sizes
<Container size="sm">Narrow content</Container>
<Container size="lg">Wide content</Container>

// Page with header
<>
  <PageHeader 
    title="Profil Saya"
    subtitle="Kelola informasi akun Anda"
    icon={<UserIcon className="w-6 h-6" />}
    action={
      <Button variant="primary">Edit</Button>
    }
  />
  
  <PageContent size="md">
    <Card>
      <p>Your content here</p>
    </Card>
  </PageContent>
</>
```

**Container Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `noPadding`: boolean (default: false)
- `centerContent`: boolean (default: false)
- `className`: string

**PageHeader Props:**
- `title`: string (required)
- `subtitle`: string
- `icon`: ReactNode
- `action`: ReactNode
- `className`: string

**PageContent Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `className`: string

---

### 5. Badge, IconBadge, DotBadge
Komponen label kecil untuk status, kategori, dan tags.

```jsx
import { Badge, IconBadge, DotBadge } from '../components/ui';

// Basic badge
<Badge>New</Badge>

// Colored variants
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="info">Info</Badge>

// Outline style
<Badge variant="primary" outline>Featured</Badge>

// Different sizes
<Badge size="xs">Tiny</Badge>
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Badge with icon
<IconBadge 
  icon={<StarIcon className="w-3 h-3" />}
  variant="warning"
>
  Popular
</IconBadge>

// Dot indicator
<DotBadge variant="success" size="md" />
```

**Badge Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' (default: 'default')
- `size`: 'xs' | 'sm' | 'md' | 'lg' (default: 'md')
- `outline`: boolean (default: false)
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'full' (default: 'full')
- `className`: string

---

## 🚀 Usage Examples

### Contoh Halaman Lengkap

```jsx
import React, { useState } from 'react';
import { PageHeader, PageContent, Card, Button, Input, Badge } from '../components/ui';
import { UserIcon, PlusIcon } from '@heroicons/react/24/outline';

function ExamplePage() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <>
      <PageHeader 
        title="User Management"
        subtitle="Manage user accounts"
        icon={<UserIcon className="w-6 h-6" />}
        action={
          <Button 
            variant="primary" 
            leftIcon={<PlusIcon className="w-5 h-5" />}
          >
            Add User
          </Button>
        }
      />

      <PageContent size="md">
        <Card>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            <div className="flex gap-3">
              <Button variant="primary" type="submit">
                Save
              </Button>
              <Button variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="text-lg font-bold mb-4">Users</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-600">john@example.com</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </Card>
      </PageContent>
    </>
  );
}

export default ExamplePage;
```

---

## 🎨 Design Tokens

### Colors
- **Primary**: Green (green-600, green-700)
- **Secondary**: Gray (gray-600, gray-700)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Info**: Blue

### Spacing
- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)

### Border Radius
- **sm**: 0.375rem
- **md**: 0.5rem
- **lg**: 0.75rem
- **xl**: 1rem
- **2xl**: 1.5rem
- **full**: 9999px

### Shadows
- **sm**: Small subtle shadow
- **md**: Medium shadow
- **lg**: Large shadow

---

## 📝 Best Practices

1. **Gunakan komponen UI untuk consistency**
   ```jsx
   // ✅ Good
   <Button variant="primary">Save</Button>
   
   // ❌ Avoid
   <button className="px-6 py-2.5 bg-green-600...">Save</button>
   ```

2. **Kombinasikan props untuk customization**
   ```jsx
   <Card padding="lg" shadow="md" hoverable>
     Content
   </Card>
   ```

3. **Gunakan variants yang tersedia**
   ```jsx
   <Button variant="primary">Primary</Button>
   <Button variant="secondary">Secondary</Button>
   <Button variant="outline">Outline</Button>
   ```

4. **Maintain accessibility**
   ```jsx
   <Input 
     label="Email" 
     required 
     aria-label="Email address"
   />
   ```

---

## 🔄 Migration Guide

### Dari style lama ke komponen UI:

**Before:**
```jsx
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
  <button className="px-6 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700">
    Save
  </button>
</div>
```

**After:**
```jsx
<Card>
  <Button variant="primary">Save</Button>
</Card>
```

---

## 📦 Import Patterns

```jsx
// Import semua dari satu tempat
import { Card, Button, Input, Container, Badge } from '../components/ui';

// Atau import individual
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
```

---

## 🎯 Next Steps

1. Gunakan komponen ini untuk halaman-halaman baru
2. Gradually migrate halaman existing
3. Extend komponen dengan variant baru jika diperlukan
4. Share feedback untuk improvement

---

Created with ❤️ for IndoQuran Project
