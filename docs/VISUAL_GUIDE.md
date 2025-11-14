# Visual Design Guide - Minecloud Dashboard

## 🎨 Color System

### Primary Colors

```css
Primary Blue:    #3B82F6  (Buttons, active states, accents)
Background:      #F8F9FB  (Page background)
Card White:      #FFFFFF  (Cards and panels)
```

### Gray Scale

```css
Gray 900: #111827  (Primary text)
Gray 600: #4B5563  (Secondary text)
Gray 500: #6B7280  (Tertiary text)
Gray 200: #E5E7EB  (Borders)
Gray 100: #F3F4F6  (Hover states)
Gray 50:  #F9FAFB  (Active backgrounds)
```

### Accent Colors (for folders/icons)

```css
Blue:    #3B82F6  (Files, default)
Purple:  #9333EA  (Products)
Green:   #10B981  (Orders)
Yellow:  #F59E0B  (Documents)
Pink:    #EC4899  (Images)
Orange:  #F97316  (Files)
Indigo:  #6366F1  (Designs)
```

---

## 📐 Layout Structure

### Sidebar (Left)

```
┌─────────────────────┐
│  [Logo] minecloud   │ ← Header (h-16)
├─────────────────────┤
│  📁 Files           │ ← Navigation items
│  📊 Activity        │   (rounded hover states)
│  📅 Calendar        │
│  👥 Contact         │
│                     │
│  ...               │
│                     │
│  ⚙️  Settings       │ ← Bottom navigation
│                     │
│  Storage: 42/256 GB │ ← Storage indicator
└─────────────────────┘
Width: 16rem (64 * 4px)
Background: White
```

### Topbar (Top)

```
┌──────────────────────────────────────────────────────────┐
│  ☰  │  🔍 Search anything...     │  🔔  [Avatar] [Logout] │
└──────────────────────────────────────────────────────────┘
Height: 4rem (64px)
Background: White
Border-bottom: 1px solid gray-100
```

### Main Content Area

```
┌─────────────────────────────────────────────────────────┐
│  Padding: 24-32px                                       │
│  Max-width: 1600px (centered)                           │
│                                                          │
│  ┌─ Quick Access ──────────────────────────────────┐   │
│  │  [Card] [Card] [Card] [Card]                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ All Files ─────────────────────────────────────┐   │
│  │  [Card] [Card] [Card]                            │   │
│  │  [Card] [Card] [Card]                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎴 Card Components

### Quick Access Card (Horizontal)

```
┌────────────────────────────────────┐
│  ┌──┐  Studio Work               │
│  │📁│  2.3 GB • 23 items          │
│  └──┘                              │
└────────────────────────────────────┘
Height: ~80px
Padding: 16px
Border: 1px solid gray-200
Hover: shadow-sm, border-gray-300
```

### Dashboard Card (Vertical)

```
┌──────────────────────┐
│                 ⋮    │ ← More options (on hover)
│  ┌────────┐          │
│  │   📁   │          │ ← Icon (48x48)
│  └────────┘          │
│                      │
│  Products            │ ← Title (font-semibold)
│  2.5 GB • 45 items   │ ← Meta (text-xs, gray)
│                      │
└──────────────────────┘
Padding: 20px
Border-radius: 12px
Hover: shadow-md, lift -2px
```

---

## 🔤 Typography Scale

### Headings

```javascript
Page Title:     text-2xl font-bold        (24px)
Card Title:     text-lg font-semibold     (18px)
Section Title:  text-base font-semibold   (16px)
```

### Body Text

```javascript
Primary:   text-sm text-gray-900   (14px)
Secondary: text-sm text-gray-600   (14px)
Tertiary:  text-xs text-gray-500   (12px)
```

### Font Family

```css
font-family: Inter, system-ui, -apple-system, sans-serif;
```

---

## 📏 Spacing System

### Page-level

```javascript
Padding:         p-6 lg:p-8           (24px → 32px)
Section gap:     space-y-6 / gap-6     (24px)
Card margin:     mb-8                  (32px)
```

### Component-level

```javascript
Card padding:    p-4 / p-5             (16px / 20px)
Button padding:  px-4 py-2             (16px 8px)
Input padding:   px-3 py-2             (12px 8px)
Icon margin:     mr-2 / gap-3          (8px / 12px)
```

### Grid Gaps

```javascript
Quick Access:    gap-4  (16px)
Main Grid:       gap-4  (16px)
Form fields:     space-y-4  (16px)
```

---

## 🎭 Interactive States

### Buttons

```css
Default:  bg-blue-600 text-white
Hover:    bg-blue-700
Focus:    ring-2 ring-blue-500 ring-offset-2
Disabled: opacity-50 cursor-not-allowed
```

### Navigation Items

```css
Default:  text-gray-600 hover:bg-gray-50
Active:   bg-blue-50 text-blue-600
Hover:    text-gray-900 bg-gray-50
```

### Cards

```css
Default:  border-gray-200 shadow-sm
Hover:    border-gray-300 shadow-md -translate-y-0.5
Focus:    ring-2 ring-blue-500
```

### Inputs

```css
Default:  bg-gray-50 border-gray-200
Focus:    ring-2 ring-blue-500 border-transparent
Error:    border-red-500 ring-red-500
```

---

## 🎬 Animations & Transitions

### Duration

```css
Fast:     150ms  (hover state changes)
Normal:   200ms  (default transitions)
Slow:     300ms  (sidebar, modals)
```

### Easing

```css
ease-in-out:  Default for most transitions
ease-out:     For appearing elements
ease-in:      For disappearing elements
```

### Transform Examples

```css
Hover lift:     hover:-translate-y-0.5
Scale:          hover:scale-105
Fade:           opacity-0 hover:opacity-100
```

---

## 📱 Responsive Grid System

### Quick Access Cards

```javascript
Mobile:   grid-cols-1           (1 column)
Tablet:   sm:grid-cols-2        (2 columns)
Desktop:  lg:grid-cols-4        (4 columns)
```

### Main Dashboard Cards

```javascript
Mobile:   grid-cols-1           (1 column)
Tablet:   sm:grid-cols-2        (2 columns)
Laptop:   lg:grid-cols-3        (3 columns)
Desktop:  xl:grid-cols-4        (4 columns)
```

### Breakpoints

```javascript
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

---

## 🎯 Icon Usage

### Icon Library: Lucide React

### Sizes

```javascript
Small:   h-4 w-4  (16px)  - Buttons, inline
Medium:  h-5 w-5  (20px)  - Navigation, headers
Large:   h-6 w-6  (24px)  - Card icons, features
XL:      h-8 w-8  (32px)  - Empty states
```

### Color Classes

```javascript
Primary: text - blue - 600;
Success: text - green - 600;
Warning: text - yellow - 600;
Danger: text - red - 600;
Purple: text - purple - 600;
Muted: text - gray - 400;
```

### Common Icons

```javascript
Folder:         📁  Folder
File:           📄  FileText
Image:          🖼️  Image
Settings:       ⚙️  Settings
User:           👤  User
Search:         🔍  Search
Notification:   🔔  Bell
Menu:           ☰   Menu
Plus:           ➕  Plus
More:           ⋮   MoreVertical
Close:          ✕   X
```

---

## 🔲 Border Radius System

### Components

```javascript
Button:     rounded-lg    (0.5rem / 8px)
Card:       rounded-xl    (0.75rem / 12px)
Input:      rounded-lg    (0.5rem / 8px)
Avatar:     rounded-full  (9999px)
Badge:      rounded-full  (9999px)
Icon box:   rounded-lg    (0.5rem / 8px)
```

---

## 🎨 Shadow System

### Elevation Levels

```javascript
sm:      shadow-sm       (subtle, default cards)
md:      shadow-md       (hover state)
lg:      shadow-lg       (modals, dropdowns)
xl:      shadow-xl       (popovers)
none:    shadow-none     (flat elements)
```

---

## ✨ Special Effects

### Backdrop Blur (Mobile Menu)

```css
backdrop-blur-sm  (8px blur)
bg-black/20       (20% opacity)
```

### Gradient Backgrounds

```css
avatar/logo: bg-gradient-to-br from-blue-500 to-blue-600;
```

### Ring (Focus States)

```css
focus: ring-2 ring-blue-500 ring-offset-2;
```

---

## 📋 Component Checklist

Use this checklist when creating new components:

- [ ] Follows color system
- [ ] Uses consistent spacing
- [ ] Has hover state
- [ ] Has focus state (for interactive)
- [ ] Has disabled state (for inputs)
- [ ] Mobile responsive
- [ ] Uses appropriate border radius
- [ ] Has proper shadow elevation
- [ ] Uses transition animations
- [ ] Follows typography scale
- [ ] Uses Lucide React icons
- [ ] Accessible (ARIA labels)

---

## 🎓 Best Practices

### Do's ✅

- Use utility classes from Tailwind
- Maintain consistent spacing
- Add hover effects to interactive elements
- Use the color system variables
- Keep typography hierarchy clear
- Make it responsive by default

### Don'ts ❌

- Don't use arbitrary values (stick to Tailwind scale)
- Don't mix color systems
- Don't forget mobile breakpoints
- Don't skip hover/focus states
- Don't use outdated color names
- Don't create custom CSS unless necessary

---

## 🔍 Quick Reference

### Common Class Combinations

**Page Container:**

```javascript
className = "p-6 lg:p-8 max-w-[1600px] mx-auto";
```

**Section Header:**

```javascript
<h1 className="text-2xl font-bold text-gray-900">Title</h1>
<p className="text-gray-600 mt-1 text-sm">Description</p>
```

**Card:**

```javascript
<Card className="border-gray-200 shadow-sm">
```

**Button (Primary):**

```javascript
<Button className="bg-blue-600 hover:bg-blue-700">
```

**Icon Box:**

```javascript
<div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
  <Icon className="h-6 w-6 text-blue-600" />
</div>
```

**Input:**

```javascript
<Input className="max-w-md" />
```

---

**Use this guide as a reference when building new components or pages!** 🎨
