# Button Theme Documentation

## Overview
This document outlines the standardized button theme used throughout the Tenant Dashboard. All buttons (except logout, theme toggle, hamburger menu, and X/close buttons) follow this consistent styling pattern.

## Key-Value Specifications

### State Management
```
hoverState: useState(false)
onMouseEnter: () => setHoverState(true)
onMouseLeave: () => setHoverState(false)
```

### Class Names
```
baseClass: "bw-btn bw-btn-action"
hoverClass: "custom-hover-border"
fullClassName: `bw-btn bw-btn-action ${isHovered ? 'custom-hover-border' : ''}`
```

### Style Properties

#### Padding
```
mobile: clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)
desktop: 14px 24px
```

#### Font Size
```
mobile: clamp(14px, 2vw, 16px)
desktop: 14px
```

#### Typography
```
fontFamily: "Work Sans", sans-serif
fontWeight: 600
```

#### Layout
```
display: flex
alignItems: center
justifyContent: center
gap: mobile ? clamp(8px, 1.5vw, 10px) : 8px
width: mobile ? 100% : auto
```

#### Border & Radius
```
borderRadius: 7
border: hovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined
borderColor: hovered ? 'rgba(155, 97, 209, 0.81)' : undefined
```

#### Colors
```
hoverColor: rgba(155, 97, 209, 0.81)
textColor: hovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit'
```

#### Transitions
```
transition: 'all 0.2s ease'
```

### Icon Styling

#### Icon Size
```
mobile: clamp(18px, 2.5vw, 20px)
desktop: 18px
```

#### Icon Colors
```
color: hovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit'
fill: hovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor'
```

### Text Styling
```
textColor: hovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit'
```

## Implementation Example

```tsx
const [isButtonHovered, setIsButtonHovered] = useState(false)

<button 
  className={`bw-btn bw-btn-action ${isButtonHovered ? 'custom-hover-border' : ''}`}
  onClick={handleClick}
  onMouseEnter={() => setIsButtonHovered(true)}
  onMouseLeave={() => setIsButtonHovered(false)}
  style={{
    padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
    fontFamily: '"Work Sans", sans-serif',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
    width: isMobile ? '100%' : 'auto',
    justifyContent: 'center',
    borderRadius: 7,
    border: isButtonHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
    borderColor: isButtonHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
    color: isButtonHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
    transition: 'all 0.2s ease'
  } as React.CSSProperties}
>
  <Icon className="w-4 h-4" style={{ 
    width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
    height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
    color: isButtonHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit',
    fill: isButtonHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor' 
  }} />
  <span style={{ color: isButtonHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
    Button Text
  </span>
</button>
```

## Excluded Buttons
The following buttons do NOT use this theme:
- Logout buttons
- Theme toggle buttons
- Hamburger menu buttons
- X/Close buttons

## Notes
- All hover effects use the purple color: `rgba(155, 97, 209, 0.81)`
- Mobile breakpoint is determined by `isMobile` state (window.innerWidth <= 844)
- All transitions are smooth with 0.2s ease timing
- Border radius is consistently 7px across all buttons

