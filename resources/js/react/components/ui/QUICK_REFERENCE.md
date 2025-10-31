# UI Components - Quick Reference

## 🚀 Quick Start

```jsx
import { Card, Button, Input, Select, Badge, PageHeader, PageContent } from '../components/ui';
```

---

## 📦 Components Cheat Sheet

### Card
```jsx
<Card>Content</Card>
<Card padding="lg">More padding</Card>
<Card shadow="md" rounded="2xl">Custom styles</Card>
<Card hoverable onClick={handleClick}>Clickable</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `rounded`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (default: 'xl')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' (default: 'sm')
- `hoverable`: boolean
- `className`: additional classes

---

### Button
```jsx
<Button variant="primary">Save</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button loading disabled>Loading...</Button>
<Button leftIcon={<Icon />}>With Icon</Button>
<Button fullWidth>Full Width Button</Button>
```

**Variants:** `primary` | `secondary` | `outline` | `ghost` | `danger` | `success`  
**Sizes:** `xs` | `sm` | `md` | `lg`

**Props:**
- `variant`: button style
- `size`: button size
- `loading`: shows spinner
- `disabled`: disables button
- `leftIcon` / `rightIcon`: JSX element
- `fullWidth`: stretch to 100%
- `onClick`: click handler

---

### Input
```jsx
<Input 
  label="Name" 
  placeholder="Enter name"
  required 
/>

<Input 
  type="email"
  error="Invalid email"
  helperText="We won't share your email"
  leftIcon={<Icon />}
/>

<Input 
  as="textarea"
  rows={4}
/>
```

**Props:**
- `label`: field label
- `type`: input type (text, email, password, etc.)
- `placeholder`: placeholder text
- `error`: error message
- `helperText`: helper text below input
- `leftIcon` / `rightIcon`: JSX element
- `required`: boolean
- `disabled`: boolean
- `as`: 'input' | 'textarea'

---

### Select
```jsx
<Select
  label="Category"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
  value={selected}
  onChange={handleChange}
/>
```

**Props:**
- `label`: field label
- `options`: array of {value, label}
- `value`: selected value
- `onChange`: change handler
- `error`: error message
- `required`: boolean

---

### Badge
```jsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="danger" size="lg">Large</Badge>
<Badge variant="primary" outline>Outline</Badge>

<IconBadge 
  variant="success"
  icon={<CheckIcon />}
>
  Verified
</IconBadge>

<DotBadge variant="success" />
```

**Variants:** `default` | `primary` | `success` | `warning` | `danger` | `info` | `purple` | `orange`  
**Sizes:** `xs` | `sm` | `md` | `lg`

---

### Container
```jsx
<Container size="md">
  {/* Max-width container */}
</Container>
```

**Sizes:**
- `sm`: max-w-2xl (~672px)
- `md`: max-w-4xl (~896px)
- `lg`: max-w-6xl (~1152px)
- `xl`: max-w-7xl (~1280px)
- `full`: max-w-full

---

### PageHeader
```jsx
<PageHeader 
  title="Page Title"
  subtitle="Optional subtitle"
  icon={<Icon />}
  action={<Button>Action</Button>}
/>
```

---

### PageContent
```jsx
<PageContent size="lg">
  {/* Your page content */}
</PageContent>
```

**Sizes:** Same as Container

---

## 🎨 Common Patterns

### Simple Form
```jsx
<Card>
  <h2 className="text-xl font-bold mb-4">Contact Form</h2>
  
  <form className="space-y-4">
    <Input label="Name" required />
    <Input type="email" label="Email" required />
    <Input as="textarea" label="Message" rows={4} />
    
    <Button variant="primary" type="submit">
      Send Message
    </Button>
  </form>
</Card>
```

---

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card hoverable>
    <h3 className="font-bold">Card 1</h3>
    <p className="text-gray-600">Content</p>
  </Card>
  <Card hoverable>
    <h3 className="font-bold">Card 2</h3>
    <p className="text-gray-600">Content</p>
  </Card>
  <Card hoverable>
    <h3 className="font-bold">Card 3</h3>
    <p className="text-gray-600">Content</p>
  </Card>
</div>
```

---

### Page Layout
```jsx
<>
  <PageHeader 
    title="My Page" 
    icon={<BookOpenIcon />}
    action={<Button>New Item</Button>}
  />
  
  <PageContent size="lg">
    <Card>
      {/* Main content */}
    </Card>
    
    <Card className="mt-6">
      {/* Secondary content */}
    </Card>
  </PageContent>
</>
```

---

### Button Group
```jsx
<div className="flex gap-3">
  <Button variant="primary" leftIcon={<SaveIcon />}>
    Save
  </Button>
  <Button variant="secondary">
    Cancel
  </Button>
  <Button variant="danger" rightIcon={<TrashIcon />}>
    Delete
  </Button>
</div>
```

---

### Status Badges
```jsx
<div className="flex items-center gap-2">
  <DotBadge variant="success" />
  <span className="text-sm text-gray-600">Online</span>
</div>

<Badge variant="success" size="sm">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
<Badge variant="danger" size="sm">Inactive</Badge>
```

---

### Stats Cards
```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card padding="md" className="bg-gray-50">
    <p className="text-sm text-gray-500">Total Users</p>
    <p className="text-2xl font-bold text-gray-900">1,234</p>
  </Card>
  {/* More stats... */}
</div>
```

---

## 🎯 Design Tokens

### Colors
```jsx
Primary: green-600
Secondary: gray-600
Success: green-500
Danger: red-500
Warning: yellow-500
Info: blue-500
```

### Spacing
```jsx
sm: p-4
md: p-6 (default)
lg: p-8
```

### Shadows
```jsx
shadow-sm (preferred)
shadow-md
shadow-lg
```

### Border Radius
```jsx
rounded-xl (default)
rounded-2xl (large cards)
rounded-full (pills/avatars)
```

---

## 📱 Responsive Patterns

### Mobile-First
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive grid */}
</div>

<div className="flex flex-col md:flex-row gap-4">
  {/* Stack on mobile, row on desktop */}
</div>
```

---

## ⚡ Pro Tips

1. **Always use Card for sections** - Maintains visual consistency
2. **Button variants matter** - Primary for main actions, Secondary for alternatives
3. **Use PageHeader + PageContent** - Standard layout for all pages
4. **Badge for status** - Success/Warning/Danger for clear states
5. **Input with labels** - Better accessibility and UX
6. **Hoverable cards** - Makes clickable cards obvious
7. **Loading state** - Always show loading on async actions

---

## 🚫 Don't

- ❌ Don't use inline styles with Tailwind when Card props exist
- ❌ Don't create custom buttons when Button component covers it
- ❌ Don't skip labels on form inputs
- ❌ Don't use heavy shadows (shadow-2xl) - Keep it minimal
- ❌ Don't forget error states on inputs
- ❌ Don't mix old patterns with new components

---

## ✅ Do

- ✅ Use Card for all content sections
- ✅ Use Button for all clickable actions
- ✅ Use Input/Select for all form fields
- ✅ Use Badge for labels and status
- ✅ Use PageHeader for consistent page titles
- ✅ Keep shadow minimal (shadow-sm preferred)
- ✅ Show loading states on async actions
- ✅ Provide error feedback on forms

---

## 📖 Full Documentation

For complete API reference, examples, and migration guide:
👉 **See `UI_COMPONENTS_GUIDE.md`**

For live demo of all components:
👉 **Visit `/ui-demo` route**

---

**Happy Coding!** 🎉
