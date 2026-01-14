# Theme System Documentation

## Overview

This project implements a comprehensive multi-theme system supporting 5 color themes (Blue, Green, Purple, Orange, Teal) with both light and dark modes. The system uses CSS variables for dynamic theming and integrates seamlessly with Next.js, Tailwind CSS, and Material-UI components.

## What Has Been Implemented

### ✅ Core Theme System
- **5 Color Themes**: Blue, Green, Purple, Orange, Teal
- **Light/Dark Modes**: Toggle between light and dark variants
- **Compound Theme Names**: `blue-light`, `green-dark`, etc.
- **CSS Variables**: Dynamic color system using CSS custom properties
- **next-themes Integration**: Persistent theme switching with localStorage

### ✅ Component Theming
- **AwesomeNavBar**: Fully themed navigation with dropdown menus
- **Select Dropdowns**: Theme-aware borders, text, chevron, and menu items
- **Tooltips**: BasicTooltip component with proper theming
- **Hover Effects**: Theme-aware hover states using white opacity overlays
- **MUI Components**: Material-UI integration with CSS variable theming

### ✅ Dark Mode Consistency
- **Text Colors**: Consistent white text in dark mode across all components
- **Background Colors**: Proper contrast ratios maintained
- **Interactive Elements**: Theme-aware hover and focus states

## How the Theme System Works

### 1. CSS Variables Architecture

The theme system uses CSS custom properties defined in `globals.css`:

```css
:root {
  /* Base variables */
  --bg-primary: #fbfbfb;
  --text-primary: #0a0a0a;
  --border-primary: #e5e7eb;
  --color-primary: #00539c;
}

.theme-blue-light {
  --color-primary: #00539c;
  --bg-primary: #fbfbfb;
  --text-primary: #0a0a0a;
  --border-primary: #00539c;
}

.theme-blue-dark {
  --color-primary: #00539c;
  --bg-primary: #00539c;
  --text-primary: #fbfbfb;
  --border-primary: #4d87ba;
}
```

### 2. Tailwind Configuration

`tailwind.config.js` maps CSS variables to Tailwind classes:

```javascript
colors: {
  'blog-black': 'var(--text-primary)',
  'blog-white': 'var(--bg-primary)',
  'fun-blue-500': 'var(--color-primary)',
  // ... other mappings
}
```

### 3. Theme Provider Setup

In `_app.tsx`, next-themes is configured with compound theme mappings:

```tsx
<ThemeProvider
  value={{
    'blue-light': 'theme-blue-light',
    'blue-dark': 'theme-blue-dark',
    'green-light': 'theme-green-light',
    // ... all theme mappings
  }}
  defaultTheme="blue-light"
>
```

## How to Theme Components

### Basic Component Theming

Use CSS variables directly in your Tailwind classes:

```tsx
function MyComponent() {
  return (
    <div className="bg-blog-white text-blog-black border border-fun-blue-300">
      {/* Component content */}
    </div>
  );
}
```

### Theme-Aware Hover Effects

Instead of fixed colors, use white opacity overlays:

```tsx
// ❌ Don't use fixed gray colors
<div className="hover:bg-gray-100 dark:hover:bg-gray-700">

// ✅ Use theme-aware white overlays
<div className="hover:bg-white hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10">
```

### Interactive Elements

For buttons and interactive components:

```tsx
<button className="bg-fun-blue-500 hover:bg-fun-blue-600 text-blog-white rounded-lg px-4 py-2 transition-colors">
  Click me
</button>
```

### MUI Component Theming

Use the `sx` prop with CSS variables:

```tsx
import { Select } from '@mui/material';

<Select
  sx={{
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--border-primary)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary)',
    },
  }}
>
```

### Custom Theme Hook

Use the custom `useThemeSettings` hook for programmatic theme access:

```tsx
import { useThemeSettings } from '../lib/use-theme-settings';

function ThemeAwareComponent() {
  const { color, mode } = useThemeSettings();

  return (
    <div className={`theme-${color}-${mode}`}>
      Current theme: {color} {mode}
    </div>
  );
}
```

## File Structure

```
apps/web/
├── styles/globals.css          # CSS variables and theme classes
├── tailwind.config.js          # Tailwind color mappings
├── pages/_app.tsx             # ThemeProvider setup
├── lib/use-theme-settings.ts   # Custom theme hook
├── components/
│   ├── AwesomeNavBar.tsx      # Themed navigation component
│   ├── Tooltip.tsx            # BasicTooltip component
│   └── ThemeColorPicker.tsx   # Theme selection UI
```

## Key Files Reference

### `globals.css`
- Defines all CSS variables for colors, backgrounds, borders
- Contains theme classes that override variables
- Includes base styles and theme-specific overrides

### `tailwind.config.js`
- Maps CSS variables to Tailwind color names
- Enables `text-blog-black`, `bg-blog-white`, etc.
- Supports dynamic theming through CSS variables

### `_app.tsx`
- Wraps the app with ThemeProvider
- Defines compound theme mappings
- Sets default theme

### `use-theme-settings.ts`
- Custom hook for parsing current theme
- Returns `{ color, mode }` from compound theme names
- Useful for conditional rendering

## Adding New Themes

### 1. Add CSS Variables

In `globals.css`, add new theme classes:

```css
.theme-newcolor-light {
  --color-primary: #your-color;
  --bg-primary: #light-bg;
  --text-primary: #dark-text;
  --border-primary: #your-color;
}

.theme-newcolor-dark {
  --color-primary: #your-color;
  --bg-primary: #dark-bg;
  --text-primary: #white-text;
  --border-primary: #lighter-variant;
}
```

### 2. Update ThemeProvider

In `_app.tsx`, add the new theme mappings:

```tsx
<ThemeProvider
  value={{
    // ... existing themes
    'newcolor-light': 'theme-newcolor-light',
    'newcolor-dark': 'theme-newcolor-dark',
  }}
>
```

### 3. Update Theme Picker

In `ThemeColorPicker.tsx`, add the new color option:

```tsx
const colors = [
  // ... existing colors
  { name: 'newcolor', label: 'New Color', value: '#your-color' }
];
```

## Best Practices

### ✅ Do's
- Always use CSS variables for colors (`var(--text-primary)`)
- Use white opacity overlays for hover effects
- Test components in all theme combinations
- Use the `useThemeSettings` hook for conditional logic
- Follow the established naming conventions

### ❌ Don'ts
- Don't use fixed gray colors for hover states
- Don't use Tailwind's `dark:` modifier for theme colors
- Don't hardcode color values in components
- Don't forget to test both light and dark modes

## Testing Themes

To test all theme combinations:

1. Start the development server: `yarn dev`
2. Use the theme picker in the navbar
3. Test each color theme in both light and dark modes
4. Verify hover effects, focus states, and interactive elements
5. Check contrast ratios for accessibility

## Deployment Considerations

- Theme preferences are stored in localStorage
- CSS variables ensure fast theme switching
- No server-side rendering issues with next-themes
- Bundle size impact is minimal due to CSS variable usage

## Future Enhancements

- [ ] Add theme persistence across devices
- [ ] Implement system theme detection
- [ ] Add smooth theme transitions
- [ ] Create theme customization options
- [ ] Add high contrast theme variants

---

**Status**: ✅ Complete and ready for deployment
**Last Updated**: January 14, 2026
**Tested**: All theme combinations working correctly