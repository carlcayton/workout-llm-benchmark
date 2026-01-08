# MuscleWiki Interactive Muscle Map Assets

Extracted from https://musclewiki.com/ for the fitness app showcase.

## Files

| File | Description |
|------|-------------|
| `front-body.svg` | Front body SVG with 10 muscle groups |
| `back-body.svg` | Back body SVG with 11 muscle groups |
| `muscle-map.css` | CSS styles with color palette and interaction classes |
| `README.md` | This documentation |

## SVG Structure

Both SVGs share the same viewBox: `0 0 660.46 1206.46`

### Muscle Groups (Front Body)

| ID | Muscle | Path Count |
|----|--------|------------|
| `calves` | Calves | 2 |
| `quads` | Quadriceps | 2 |
| `abdominals` | Abs | 1 |
| `obliques` | Obliques | 2 |
| `hands` | Hands | 4 |
| `forearms` | Forearms | 2 |
| `biceps` | Biceps | 2 |
| `front-shoulders` | Front Deltoids | 2 |
| `chest` | Pectorals | 2 |
| `traps` | Upper Traps | 2 |

### Muscle Groups (Back Body)

| ID | Muscle | Path Count |
|----|--------|------------|
| `traps` | Upper Traps | 1 |
| `calves` | Calves | 2 |
| `hamstrings` | Hamstrings | 2 |
| `glutes` | Glutes | 2 |
| `hands` | Hands | 4 |
| `forearms` | Forearms | 2 |
| `triceps` | Triceps | 2 |
| `lats` | Latissimus Dorsi | 2 |
| `lowerback` | Lower Back | 1 |
| `traps-middle` | Middle Traps | 1 |
| `rear-shoulders` | Rear Deltoids | 2 |

## How It Works

### CSS-Only Interactions (No JavaScript Required for Basic Hover/Active)

The muscle map uses **CSS-only** interactions via Tailwind-style utility classes:

```html
<g id="biceps" class="bodymap text-mw-gray active:text-mw-red-700 lg:hover:text-mw-red-100">
  <path fill="currentColor" d="..." />
</g>
```

1. **Default State**: `text-mw-gray` → Light gray `#EBEBEB`
2. **Hover State** (desktop): `lg:hover:text-mw-red-100` → Light red `#FE9CB2`
3. **Active/Pressed**: `active:text-mw-red-700` → Dark red `#B13F58`

The trick: SVG paths use `fill="currentColor"`, so changing the CSS `color` property changes the fill.

### Color Palette

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| MuscleWiki Gray | `#EBEBEB` | `rgb(235, 235, 235)` | Default muscle state |
| MuscleWiki Red | `#FE5B7F` | `rgb(254, 91, 127)` | Brand primary |
| MuscleWiki Red 100 | `#FE9CB2` | `rgb(254, 156, 178)` | Hover state |
| MuscleWiki Red 700 | `#B13F58` | `rgb(177, 63, 88)` | Active/selected state |

## Implementation Guide

### Basic HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="muscle-map.css">
</head>
<body>
  <div class="muscle-map-container">
    <!-- Front body -->
    <object data="front-body.svg" type="image/svg+xml" class="muscle-map-svg"></object>

    <!-- Back body -->
    <object data="back-body.svg" type="image/svg+xml" class="muscle-map-svg"></object>
  </div>
</body>
</html>
```

### React Component Example

```tsx
import { useState } from 'react';
import FrontBody from './front-body.svg?react';
import BackBody from './back-body.svg?react';

const MUSCLE_IDS = {
  front: ['calves', 'quads', 'abdominals', 'obliques', 'hands', 'forearms', 'biceps', 'front-shoulders', 'chest', 'traps'],
  back: ['traps', 'calves', 'hamstrings', 'glutes', 'hands', 'forearms', 'triceps', 'lats', 'lowerback', 'traps-middle', 'rear-shoulders']
};

function MuscleSelector({ onSelect }: { onSelect: (muscles: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleClick = (e: React.MouseEvent<SVGGElement>) => {
    const muscleId = e.currentTarget.id;
    setSelected(prev => {
      const newSelected = prev.includes(muscleId)
        ? prev.filter(id => id !== muscleId)
        : [...prev, muscleId];
      onSelect(newSelected);
      return newSelected;
    });
  };

  // Add click handlers and selection styling via useEffect
  // See muscle-map.css for .selected class

  return (
    <div className="flex gap-4">
      <FrontBody className="w-full max-w-[300px]" />
      <BackBody className="w-full max-w-[300px]" />
    </div>
  );
}
```

### React Native (with react-native-svg)

```tsx
import { SvgXml } from 'react-native-svg';
import frontBodySvg from './front-body.svg';
import backBodySvg from './back-body.svg';

// For React Native, you'll need to:
// 1. Parse the SVG and extract <g> elements
// 2. Add onPress handlers to each muscle group
// 3. Manage color via state instead of CSS

function MuscleMap() {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  // Convert SVG to use inline colors based on selection state
  const getColor = (muscleId: string) => {
    return selectedMuscles.includes(muscleId) ? '#B13F58' : '#EBEBEB';
  };

  // Implementation depends on SVG parsing approach
  // Options: react-native-svg-transformer, manual XML parsing
}
```

## Notes

- **Joint Highlights**: The SVGs include radial gradients (`paint0_radial_*` etc.) for joint areas creating a subtle highlight effect
- **Responsive**: Original uses Tailwind responsive classes for different screen sizes
- **Accessibility**: Consider adding `aria-label` attributes to muscle groups for screen readers
- **Touch Devices**: The `active:` state works on touch, `lg:hover:` only on desktop (1024px+)

## Equipment Filter Icons

All 18 equipment filter icons extracted from the filter panel. Icons use `currentColor` for easy styling.

### Icons List

| Icon | File | ViewBox |
|------|------|---------|
| Featured | `icons/featured.svg` | 0 0 67 40 |
| Barbell | `icons/barbell.svg` | 0 0 67 40 |
| Dumbbells | `icons/dumbbells.svg` | 0 0 62 61 |
| Bodyweight | `icons/bodyweight.svg` | 0 0 63.14 155 |
| Machine | `icons/machine.svg` | 0 0 67 40 |
| Medicine Ball | `icons/medicine-ball.svg` | 0 0 38 37 |
| Kettlebells | `icons/kettlebells.svg` | 0 0 92.09 113 |
| Stretches | `icons/stretches.svg` | 0 0 155 140.98 |
| Cables | `icons/cables.svg` | 0 0 155 140.96 |
| Band | `icons/band.svg` | 0 0 130 73.39 |
| Plate | `icons/plate.svg` | 0 0 114.49 155 |
| TRX | `icons/trx.svg` | 0 0 155.1 111.48 |
| Yoga | `icons/yoga.svg` | 0 0 162.39 142.29 |
| Bosu Ball | `icons/bosu-ball.svg` | 0 0 57 28 |
| Vitruvian | `icons/vitruvian.svg` | 0 0 31 40 |
| Cardio | `icons/cardio.svg` | 0 0 166 166 |
| Smith Machine | `icons/smith-machine.svg` | 0 0 144 151 |
| Recovery | `icons/recovery.svg` | 0 0 363 363 |

### Filter Panel Styles

See `filter-panel.css` for extracted CSS styles including:
- 2-column grid layout
- Checkbox styling with blue accent color (#2563eb)
- Responsive breakpoints (xl, mc/2xl)
- RTL support
- Dark mode support

### Usage Example

```html
<div class="equipment-filter-panel">
  <div class="equipment-filter-item">
    <input type="checkbox" class="equipment-checkbox" id="barbell" />
    <label for="barbell" class="equipment-label">
      <svg class="equipment-icon"><!-- SVG content --></svg>
      Barbell
    </label>
  </div>
</div>
```

### Icon Coloring

Icons use `currentColor` so they inherit the text color:

```css
.equipment-icon {
  color: #64748b; /* slate-500 - default */
}
```

## Source

- Website: https://musclewiki.com/
- API: https://api.musclewiki.com/
- Extracted: 2026-01-07
