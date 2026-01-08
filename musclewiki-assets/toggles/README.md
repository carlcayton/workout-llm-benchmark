# MuscleWiki Toggle Components

Extracted from [musclewiki.com](https://musclewiki.com/) on 2026-01-07.

## Overview

MuscleWiki uses three toggle switches to control the muscle map display:

| Toggle | Purpose | Default State |
|--------|---------|---------------|
| **Male/Female** | Switch body map between male and female anatomy | Male |
| **Advanced** | Show detailed muscle anatomy vs. simplified view | OFF |
| **Joints** | Overlay joint indicators on the body map | OFF |

## Toggle Behavior

### Male/Female Toggle
- **ON (red background)**: Shows female body map
- **OFF (blue background)**: Shows male body map
- URL parameter: `?model=f` for female, no param for male
- Contains SVG icons that swap based on state:
  - Female: Venus symbol (circle with cross below)
  - Male: Mars symbol (circle with arrow)

### Advanced Toggle
- **ON (red background)**: Shows detailed muscle anatomy with individual muscle groups highlighted
- **OFF (blue background)**: Shows simplified body outline
- The advanced view displays separate muscle regions that can be clicked individually

### Joints Toggle
- **ON (red background)**: Overlays joint markers (circles) on shoulders, elbows, wrists, hips, knees, ankles
- **OFF (blue background)**: Hides joint indicators
- Useful for exercises targeting joint mobility/stability

## Technical Implementation

### Framework
- Built with [HeadlessUI](https://headlessui.com/) Switch component
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Uses custom MuscleWiki color palette

### Color Palette

```css
/* Toggle States */
--mw-red-400: rgb(254, 107, 139);  /* ON state background */
--mw-blue-200: rgb(98, 121, 184);  /* OFF state background */
--mw-blue-600: rgb(25, 51, 123);   /* Ring/focus outline */

/* Icon Colors */
--mw-red-800: rgb(153, 27, 59);    /* Female icon */
--mw-blue-600: rgb(25, 51, 123);   /* Male icon */
```

### HTML Structure

```html
<div class="toggle-group">
  <!-- Gender Toggle with Icons -->
  <div class="toggle-container">
    <button role="switch" aria-checked="false" class="toggle-switch">
      <span class="sr-only">Gender Selector</span>
      <span class="toggle-thumb">
        <!-- Female icon (visible when checked) -->
        <span class="toggle-icon-container toggle-icon-on">
          <svg class="toggle-icon toggle-icon-female"><!-- Venus --></svg>
        </span>
        <!-- Male icon (visible when unchecked) -->
        <span class="toggle-icon-container toggle-icon-off">
          <svg class="toggle-icon toggle-icon-male"><!-- Mars --></svg>
        </span>
      </span>
    </button>
    <label class="toggle-label">Female</label>
  </div>

  <!-- Simple Toggle (Advanced/Joints) -->
  <div class="toggle-container">
    <button role="switch" aria-checked="false" class="toggle-switch">
      <span class="toggle-thumb"></span>
    </button>
    <label class="toggle-label">Advanced</label>
  </div>
</div>
```

### State Management

The toggles use HeadlessUI's built-in state management:

```jsx
// React/Next.js implementation pattern
import { Switch } from '@headlessui/react';

function GenderToggle() {
  const [isFemale, setIsFemale] = useState(false);

  return (
    <Switch
      checked={isFemale}
      onChange={setIsFemale}
      className={`${isFemale ? 'bg-mw-red-400' : 'bg-mw-blue-200'} ...`}
    >
      {/* Thumb with icons */}
    </Switch>
  );
}
```

### URL State Sync

The gender toggle syncs with URL parameters:
- Female: `https://musclewiki.com/?model=f`
- Male: `https://musclewiki.com/` (no param)

## Files in This Directory

| File | Description |
|------|-------------|
| `toggle-icons.svg` | Male (Mars) and Female (Venus) SVG symbols |
| `toggle-styles.css` | Complete CSS for toggle components |
| `female-advanced-on.png` | Screenshot: Female + Advanced ON |
| `README.md` | This documentation |

## Usage Notes

1. **Accessibility**: Toggles use proper `role="switch"` and `aria-checked` attributes
2. **Focus State**: Blue ring outline (`ring-2 ring-mw-blue-600`) indicates focus
3. **Animation**: 200ms ease-in-out transitions for smooth state changes
4. **Responsive**: Scale adjusts at lg breakpoint (`scale-90`)
5. **Dark Mode**: Thumb background changes in dark mode

## SVG Icon Paths

### Female (Venus Symbol)
```svg
<path d="M430 190c0-95.94-78.06-174-174-174S82 94.06 82 190c0 88.49 66.4 161.77 152 172.61V394h-58v44h58v58h44v-58h58v-44h-58v-31.39c85.6-10.84 152-84.12 152-172.61zm-304 0c0-71.68 58.32-130 130-130s130 58.32 130 130-58.32 130-130 130-130-58.32-130-130z"/>
```

### Male (Mars Symbol)
```svg
<path d="M330 48v44h58.89l-60.39 60.39c-68.2-52.86-167-48-229.54 14.57C31.12 234.81 31.12 345.19 99 413a174.21 174.21 0 0 0 246 0c62.57-62.58 67.43-161.34 14.57-229.54L420 123.11V182h44V48zm-16.08 333.92a130.13 130.13 0 0 1-183.84 0c-50.69-50.68-50.69-133.16 0-183.84s133.16-50.69 183.84 0 50.69 133.16 0 183.84z"/>
```

Both icons use `viewBox="0 0 512 512"` and are from the Ionicons library.
