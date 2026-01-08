# MuscleWiki Body Map - Complete Structure Analysis

Extracted from https://musclewiki.com/ on 2026-01-07

## Overview

The MuscleWiki body map consists of **2 separate SVG elements** placed side-by-side in a flex container:
- **Front View**: Shows anterior muscles (chest, abs, quads, biceps, etc.)
- **Back View**: Shows posterior muscles (lats, hamstrings, glutes, triceps, etc.)

## Container Structure

```html
<div class="flex justify-center 2xl:flex-nowrap w-full px-10 gap-x-2 animate-fade-in">
  <svg viewBox="0 0 660.46 1206.46" ...><!-- Front --></svg>
  <svg viewBox="0 0 660.46 1206.46" ...><!-- Back --></svg>
</div>
```

## SVG Structure

Each SVG has 3 main layer types:

### 1. Definitions (`<defs>`)
Contains a radial gradient for joint hover effects:
```xml
<radialGradient id="jointradial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
  <stop offset="0%" style="stop-color: rgb(254, 91, 127); stop-opacity: 1;"/>
  <stop offset="100%" style="stop-color: rgb(231, 236, 239); stop-opacity: 1;"/>
</radialGradient>
```

### 2. Muscle Groups (`<g class="bodymap text-mw-gray">`)
Each muscle is a `<g>` element with:
- **id**: Muscle name (e.g., "biceps", "chest", "quads")
- **class**: `bodymap text-mw-gray active:text-mw-red-700 lg:hover:text-mw-red-100`
- **children**: 1-4 `<path>` elements with `fill="currentColor"`

### 3. Body Outline (`<g id="body" class="body-map__model">`)
Contains paths for the body silhouette:
- Stroke: `#484a68` (dark blue-gray)
- Stroke-width: ~3.5px
- Fill: none (transparent)
- Stroke-linecap/join: round

### 4. Joint Groups (Hidden by Default)
```xml
<g id="shoulders" class="hidden">
  <ellipse id="hover" cx="..." cy="..." rx="24.71" ry="25.24" fill="url(#jointradial)"/>
  <ellipse cx="..." cy="..." rx="12.04" ry="12.3" fill="currentColor"/>
</g>
```

## Front View Muscle IDs

| ID | Description | Path Count |
|----|-------------|------------|
| `calves` | Calf muscles | 2 (left/right) |
| `quads` | Quadriceps | 2 |
| `obliques` | Oblique muscles | 2 |
| `abdominals` | Abs (includes detail lines) | 1 |
| `hands` | Hand/finger muscles | 4 |
| `forearms` | Forearm muscles | 2 |
| `biceps` | Bicep muscles | 2 |
| `chest` | Pectoral muscles | 2 |
| `front-shoulders` | Anterior deltoids | 2 |
| `traps` | Upper trapezius (front view) | 2 |
| `body` | Body outline (not clickable) | ~50+ paths |

## Back View Muscle IDs

| ID | Description | Path Count |
|----|-------------|------------|
| `traps` | Trapezius (full) | 1 |
| `calves` | Calf muscles | 2 |
| `hamstrings` | Hamstring muscles | 2 |
| `glutes` | Gluteal muscles | 2 |
| `hands` | Hand/finger muscles | 4 |
| `forearms` | Forearm muscles | 2 |
| `triceps` | Tricep muscles | 2 |
| `lats` | Latissimus dorsi | 2 |
| `lowerback` | Lower back / erector spinae | 1 |
| `traps-middle` | Middle trapezius | 1 |
| `rear-shoulders` | Posterior deltoids | 2 |
| `body` | Body outline (not clickable) | ~35 paths |

## Joint IDs (Toggled with "Joints" Switch)

Front View:
- `shoulders` - Shoulder joints
- `elbow` - Elbow joints
- `wrist` - Wrist joints
- `hips` - Hip joints
- `knees` - Knee joints
- `ankles` - Ankle joints

Back View:
- `ankles`
- `knees`
- `wrist`
- `elbow`
- `upper-spine` - Cervical spine
- `scapula` - Shoulder blade area
- `lower-spine` - Lumbar spine

## Color System

### Default States
- **Inactive muscle**: `text-mw-gray` = `#EBEBEB` (light gray)
- **Body outline**: `#484A68` (dark blue-gray)

### Interactive States
- **Hover**: `lg:hover:text-mw-red-100` = `#FE9CB2` (light pink)
- **Active/Click**: `active:text-mw-red-700` = `#B13F58` (dark red)

### Muscle Highlighting (when exercise is selected)
- **Primary muscle**: `body-map__muscle_primary` = `#FE5B7F` (pink)
- **Secondary muscle**: `body-map__muscle_secondary` = `#F99F66` (orange)
- **Tertiary muscle**: `body-map__muscle_tertiary` = `#FFEA73` (yellow)

## Key Implementation Details

### 1. Color via CSS currentColor
All muscle paths use `fill="currentColor"`, meaning the fill color is inherited from the parent's CSS `color` property. This makes theming trivial:
```css
/* Change muscle color by changing text color */
#biceps { color: #FE5B7F; }
```

### 2. Responsive Sizing
SVG uses Tailwind breakpoint classes:
- `mc:h-[700px]` - Medium custom breakpoint
- `2xl:h-[90vh]` - 2XL screens
- `3xl:h-[95vh]` - 3XL screens
- `4xl:h-screen` - 4XL screens (full viewport)

### 3. Click Handling
Each `<g>` muscle group has the id used for routing:
```javascript
// Example click handler
document.querySelector('#biceps').addEventListener('click', () => {
  router.push('/exercises/biceps');
});
```

### 4. No Background Layers
The body map is **pure SVG** with no:
- Background images
- CSS background-image
- Pseudo-elements (::before, ::after)
- Multiple z-index layers

The visual effect comes from:
1. Gray muscle fills on top of
2. Dark outline strokes

## Files Included

- `body-map-structure.html` - Full HTML with embedded analysis
- `musclewiki-colors.css` - Extracted color system
- `front-body.svg` - Front view SVG (standalone)
- `back-body.svg` - Back view SVG (standalone)
- `ANALYSIS.md` - This document

## Usage Example

```html
<div style="display: flex; gap: 8px; background: #1a1a2e;">
  <svg viewBox="0 0 660.46 1206.46">
    <!-- Paste front-body.svg contents -->
  </svg>
  <svg viewBox="0 0 660.46 1206.46">
    <!-- Paste back-body.svg contents -->
  </svg>
</div>

<style>
  /* Default state */
  .bodymap { color: #EBEBEB; }

  /* Hover */
  .bodymap:hover { color: #FE9CB2; }

  /* Selected muscle */
  .bodymap.selected { color: #FE5B7F; }
</style>
```
