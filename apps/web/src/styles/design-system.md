# Diego Portfolio Design System

This document provides a comprehensive guide to the Diego Portfolio design system, including usage examples, accessibility guidelines, and component specifications.

## Color Palette

### Primary Colors
- **Primary**: `#000D7C` (Deep Royal Blue) - Main brand color, confident and professional
- **Secondary**: `#4F46E5` (Indigo Blue) - Modern, tech-forward accent
- **Accent**: `#F59E0B` (Amber) - Warm contrast, highlights and special elements

### Semantic Colors
- **Success**: `#10B981` (Emerald Green) - Positive feedback, completed states
- **Warning**: `#F59E0B` (Amber) - Cautions, important notices
- **Error**: `#EF4444` (Red) - Errors, destructive actions

### Background Colors
- **Background Dark**: `#0F172A` (Slate 900) - Main background, rich dark
- **Background Light**: `#1E293B` (Slate 800) - Cards, elevated surfaces

### Text Colors
- **Text Primary**: `#F8FAFC` (Slate 50) - Main text, high contrast
- **Text Secondary**: `#CBD5E1` (Slate 300) - Secondary text, readable

### Border Colors
- **Border**: `#334155` (Slate 700) - Dividers, borders, subtle

## Typography

### Font Families
- **Primary**: Inter (system-ui, -apple-system, sans-serif)
- **Monospace**: Fira Code (Courier New, monospace)

### Type Scale
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 48px (3rem) | 700 Bold | 1.2 | Page titles, hero |
| H2 | 36px (2.25rem) | 600 Semibold | 1.3 | Section headings |
| H3 | 24px (1.5rem) | 600 Semibold | 1.4 | Subsections, track titles |
| H4 | 20px (1.25rem) | 600 Semibold | 1.5 | Component headers |
| Body Large | 18px (1.125rem) | 400 Regular | 1.6 | Intro paragraphs, emphasis |
| Body | 16px (1rem) | 400 Regular | 1.6 | Main content, descriptions |
| Body Small | 14px (0.875rem) | 400 Regular | 1.5 | Captions, metadata, labels |
| Tiny | 12px (0.75rem) | 500 Medium | 1.4 | Tags, timestamps, smallest text |

## Spacing Scale

Based on 4px base unit:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 12px (0.75rem)
- **base**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)
- **4xl**: 96px (6rem)

## Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1279px
- **Wide**: 1280px+

## Component Classes

### Buttons
```css
.btn-primary     /* Primary action button */
.btn-secondary   /* Secondary action button */
.btn-accent      /* Accent/highlight button */
.btn-ghost       /* Transparent button */
```

### Cards
```css
.card           /* Standard card */
.card-elevated  /* Elevated card with shadow */
```

### Inputs
```css
.input-field    /* Form input field */
```

### Typography
```css
.text-h1        /* H1 heading */
.text-h2        /* H2 heading */
.text-h3        /* H3 heading */
.text-h4        /* H4 heading */
.text-body-lg   /* Large body text */
.text-body      /* Regular body text */
.text-body-sm   /* Small body text */
.text-tiny      /* Tiny text */
```

### Layout
```css
.container      /* Max-width container */
.section        /* Section spacing */
.section-sm     /* Small section spacing */
```

### Navigation
```css
.nav-link       /* Navigation link */
.nav-link-active /* Active navigation link */
```

### Audio Player
```css
.audio-control     /* Audio control button */
.audio-progress    /* Progress bar container */
.audio-progress-bar /* Progress bar fill */
```

### Track Components
```css
.track-card        /* Track card */
.track-card-active /* Active track card */
```

### Chat Components
```css
.chat-message      /* Chat message */
.chat-message-user /* User message */
.chat-message-ai   /* AI message */
.chat-input        /* Chat input field */
```

### Utilities
```css
.text-gradient     /* Gradient text effect */
.glass-effect      /* Glass morphism effect */
.animate-fade-in   /* Fade in animation */
.animate-slide-up  /* Slide up animation */
.animate-bounce-subtle /* Subtle bounce animation */
```

## Accessibility

### WCAG 2.1 AA Compliance
- All color combinations meet 4.5:1 contrast minimum
- Focus indicators: 2px solid, high contrast
- Text sizing: User can zoom to 200% without loss of functionality
- Keyboard navigation support
- Screen reader compatibility

### Focus Management
- All interactive elements have visible focus indicators
- Focus ring color: `#F59E0B` (accent color)
- Focus offset: 2px from element

### Reduced Motion Support
- Respects `prefers-reduced-motion` media query
- Animations disabled for users who prefer reduced motion

### High Contrast Support
- Supports `prefers-contrast: high` media query
- Enhanced colors for high contrast mode

## Usage Examples

### Using Theme in Components
```tsx
import { useTheme } from '../contexts/ThemeProvider';

const MyComponent = () => {
  const { getColor, getSpacing } = useTheme();
  
  return (
    <div 
      style={{ 
        backgroundColor: getColor('background.light'),
        padding: getSpacing('lg'),
        color: getColor('text.primary')
      }}
    >
      Content
    </div>
  );
};
```

### Using Tailwind Classes
```tsx
const MyComponent = () => {
  return (
    <div className="bg-background-light text-text-primary p-lg">
      <h1 className="text-h1">Title</h1>
      <p className="text-body">Content</p>
      <button className="btn-primary">Action</button>
    </div>
  );
};
```

### Responsive Design
```tsx
const ResponsiveComponent = () => {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-lg">
      <div className="card">Item 1</div>
      <div className="card">Item 2</div>
      <div className="card">Item 3</div>
    </div>
  );
};
```

## Best Practices

1. **Consistency**: Always use design system values instead of arbitrary values
2. **Accessibility**: Test color combinations for contrast compliance
3. **Responsive**: Use breakpoint-specific classes for responsive design
4. **Semantic**: Use semantic color names (primary, secondary) over specific colors
5. **Performance**: Use CSS classes over inline styles when possible
6. **Maintainability**: Use theme utilities for dynamic values

## Color Contrast Validation

The design system includes utilities to validate color contrast:

```tsx
import { checkWCAGCompliance } from '../utils/themeUtils';

const contrast = checkWCAGCompliance('#F8FAFC', '#0F172A');
console.log(contrast); // { ratio: 18.0, required: 4.5, isCompliant: true, level: 'AA' }
```

## Future Considerations

- Light theme support
- Dark mode toggle
- Custom theme variants
- Component-specific themes
- Animation presets
- Icon system integration
