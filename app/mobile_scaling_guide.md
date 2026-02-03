# Mobile Scaling Guide

This document outlines the mobile scaling strategy and sizing guidelines for the application using the CSS `clamp()` function approach, as implemented in the Rider Dashboard and menu bar.

## Mobile Scaling Format

The Rider Dashboard and menu bar use the CSS `clamp()` function for responsive scaling.

### Format Pattern

```css
clamp(minimum, preferred, maximum)
```

This pattern scales smoothly from mobile to desktop using viewport-based units between fixed min/max values.

---

## Common Patterns Used

### 1. Font Sizes

```tsx
fontSize: 'clamp(14px, 2vw, 16px)'        // Body text
fontSize: 'clamp(20px, 3vw, 28px)'        // Headings
fontSize: 'clamp(18px, 3vw, 22px)'        // Section titles
fontSize: 'clamp(28px, 5vw, 40px)'        // Large numbers/stats
```

### 2. Padding

```tsx
padding: 'clamp(12px, 2vw, 16px)'          // Small padding
padding: 'clamp(16px, 2.5vw, 24px)'        // Medium padding
padding: 'clamp(16px, 3vw, 24px)'          // Card padding
padding: 'clamp(12px, 2vw, 20px) 0'        // Vertical padding
```

### 3. Gaps/Spacing

```tsx
gap: 'clamp(12px, 2vw, 16px)'              // Standard gaps
gap: 'clamp(16px, 3vw, 24px)'               // Section gaps
```

### 4. Icon Sizes

```tsx
width: 'clamp(18px, 2.5vw, 20px)'
height: 'clamp(18px, 2.5vw, 20px)'
maxHeight: 'clamp(40px, 5vw, 50px)'        // Logo heights
```

### 5. Sidebar/Menu Width

```tsx
width: 'clamp(280px, 25vw, 320px)'         // Desktop sidebar
// Mobile: 100% width when open
```

### 6. Button Padding

```tsx
padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)'
padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 3vw, 24px)'
```

### 7. Grid/Container Sizing

```tsx
gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 250px), 1fr))'
gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 35vw, 300px), 1fr))'
```

---

## Viewport Unit Multipliers

| Multiplier | Usage |
|------------|-------|
| `2vw` | Small elements (text, small padding) |
| `2.5vw` | Medium elements (icons, medium padding) |
| `3vw` | Large elements (headings, card padding) |
| `4vw` | Extra large elements (button horizontal padding) |
| `5vw` | Very large elements (logos, large numbers) |
| `25vw` | Sidebar width (desktop) |

---

## Mobile Breakpoint Logic

### JavaScript State Management

```tsx
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768)
    if (window.innerWidth > 768) {
      setIsMenuOpen(false) // Close menu on desktop resize
    }
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

### Sidebar Behavior

```tsx
// Sidebar width
width: isMobile ? '100%' : 'clamp(280px, 25vw, 320px)'

// Sidebar position
left: isMobile ? (isMenuOpen ? '0' : '-100%') : '0'

// Main content margin
marginLeft: isMobile ? '0' : 'clamp(280px, 25vw, 320px)'
```

---

## Implementation Examples

### Example 1: Responsive Typography

```tsx
<h1 style={{
  fontSize: 'clamp(20px, 4vw, 28px)',
  fontWeight: 200,
  fontFamily: 'DM Sans, sans-serif',
  color: 'var(--bw-text)'
}}>
  Dashboard
</h1>
```

### Example 2: Responsive Card Padding

```tsx
<div style={{
  backgroundColor: 'var(--bw-card-bg)',
  border: '1px solid var(--bw-border)',
  borderRadius: '12px',
  padding: 'clamp(16px, 3vw, 24px)'
}}>
  {/* Card content */}
</div>
```

### Example 3: Responsive Grid Layout

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 250px), 1fr))',
  gap: 'clamp(12px, 2vw, 16px)'
}}>
  {/* Grid items */}
</div>
```

### Example 4: Responsive Button

```tsx
<button style={{
  padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)',
  fontSize: 'clamp(14px, 2.5vw, 16px)',
  fontFamily: 'Work Sans, sans-serif',
  fontWeight: 600
}}>
  Click Me
</button>
```

---

## Benefits of clamp() Approach

1. **Fluid Scaling**: Elements scale smoothly between breakpoints without abrupt changes
2. **No Media Queries Needed**: Single declaration handles all screen sizes
3. **Viewport-Based**: Uses viewport width units for proportional scaling
4. **Min/Max Constraints**: Ensures elements never get too small or too large
5. **Simpler Code**: Less CSS needed compared to multiple media query breakpoints

---

## Best Practices

1. **Choose Appropriate Multipliers**: Use smaller multipliers (2vw-3vw) for text and spacing, larger (4vw-5vw) for prominent elements
2. **Set Realistic Min/Max Values**: Ensure minimum values are readable and maximum values don't break layouts
3. **Test Across Devices**: Verify scaling works on various screen sizes (320px to 1920px+)
4. **Combine with Conditional Logic**: Use `isMobile` state for layout changes that can't be handled with clamp()
5. **Maintain Touch Targets**: Ensure interactive elements remain at least 44px on mobile

---

## Breakpoint Reference

- **Mobile**: `window.innerWidth <= 768px`
- **Desktop**: `window.innerWidth > 768px`

---

## Notes

- All scaling is handled through the `clamp()` function
- Mobile breakpoint at 768px is used for layout changes (sidebar behavior, etc.)
- Viewport units (vw) provide fluid scaling between min/max values
- This approach works well for components that need smooth scaling across all screen sizes
