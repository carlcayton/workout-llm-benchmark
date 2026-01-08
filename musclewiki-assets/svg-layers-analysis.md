# MuscleWiki SVG Layer Structure Analysis

**Analysis Date:** 2026-01-07
**Source URL:** https://musclewiki.com/
**Model:** Male (default view)

## Executive Summary

MuscleWiki uses **2 main body SVGs** (front view and back view), each containing:
1. **Muscle overlay groups** - Clickable/hoverable muscle regions with fills
2. **Body outline group** - Stroke-based anatomical lines (no fill)
3. **Joint indicator groups** - Hidden by default, shown when "Joints" toggle is enabled

The SVGs do NOT have a separate filled body silhouette - the body shape is created entirely through stroke paths in the `#body` group.

---

## SVG Overview

| Property | Front View (SVG #20) | Back View (SVG #21) |
|----------|---------------------|---------------------|
| **viewBox** | `0 0 660.46 1206.46` | `0 0 660.46 1206.46` |
| **Total Paths** | 65 | 52 |
| **Total Groups** | 17 | 19 |
| **Muscle Groups** | 10 visible | 11 visible |
| **Body Outline Paths** | 44 | 31 |
| **Lines (spine/groin)** | 8 | 1 |

---

## Layer Structure

### 1. Muscle Overlay Groups (Visible, Interactive)

Each muscle group has:
- **Class:** `bodymap text-mw-gray active:text-mw-red-700 lg:hover:text-mw-red-100`
- **Fill:** `currentColor` (controlled by CSS)
- **Stroke:** None
- **Behavior:** Changes color on hover/active states

#### Front View Muscle Groups:

| Group ID | Path Count | Muscle |
|----------|------------|--------|
| `calves` | 2 | Calves (gastrocnemius) |
| `quads` | 2 | Quadriceps |
| `abdominals` | 1 | Abdominals (complex path with muscle definition lines) |
| `obliques` | 2 | Obliques |
| `hands` | 4 | Hands |
| `forearms` | 2 | Forearms |
| `biceps` | 2 | Biceps |
| `front-shoulders` | 2 | Anterior deltoids |
| `chest` | 2 | Pectorals |
| `traps` | 2 | Upper trapezius |

#### Back View Muscle Groups:

| Group ID | Path Count | Muscle |
|----------|------------|--------|
| `traps` | 1 | Upper trapezius |
| `calves` | 2 | Calves |
| `hamstrings` | 2 | Hamstrings |
| `glutes` | 2 | Gluteus maximus |
| `hands` | 4 | Hands |
| `forearms` | 2 | Forearms |
| `triceps` | 2 | Triceps |
| `lats` | 2 | Latissimus dorsi |
| `lowerback` | 1 | Lower back/erector spinae |
| `traps-middle` | 1 | Middle trapezius |
| `rear-shoulders` | 2 | Posterior deltoids |

### 2. Body Outline Group (`#body`)

- **Class:** `body-map__model`
- **Fill:** `none`
- **Stroke:** `#484a68` (dark blue-gray)
- **Stroke Width:** `3.46px` (front) / `3.52px` (back)
- **Contains:** All anatomical detail lines including head, neck, torso, limbs

#### Key Body Parts in Outline:

**Head Region (Y < 200):**
- Head shape starting at ~`M282.69,83.67` (left ear area)
- Hair/skull outline
- Neck connecting to shoulders
- Face details (eyes, nose implied through curves)

**Torso:**
- Shoulder contours
- Arm outlines
- Chest/back surface lines
- Hip bones
- Spine indication (vertical lines)

**Lower Body:**
- Leg outlines
- Knee details
- Ankle/foot shapes

#### Largest Paths (Main Body Outline):

| SVG | Path Length | Description |
|-----|-------------|-------------|
| Front | 1806 chars | Left side body outline (head to foot) |
| Front | 1782 chars | Right side body outline (mirrored) |
| Back | 1462 chars | Full body outline with spine detail |

### 3. Joint Indicator Groups (Hidden by Default)

- **Class:** `hidden`
- **Path Count:** 0 (empty when joints disabled)
- **Controlled by:** "Joints" toggle in UI

#### Front View Joint Groups:
- `shoulders`
- `elbow`
- `wrist`
- `hips`
- `knees`
- `ankles`

#### Back View Joint Groups:
- `ankles`
- `knees`
- `wrist`
- `elbow`
- `upper-spine`
- `scapula`
- `lower-spine`

---

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Body Outline Stroke | `#484a68` | All anatomical lines |
| Muscle Fill (default) | `text-mw-gray` (CSS class) | Resting state |
| Muscle Fill (hover) | `text-mw-red-100` | Desktop hover |
| Muscle Fill (active) | `text-mw-red-700` | Click/tap state |

---

## SVG Structure Hierarchy

```
<svg viewBox="0 0 660.46 1206.46">
  <defs>
    <radialGradient id="jointradial">...</radialGradient>
  </defs>

  <!-- Muscle Overlay Groups (interactive, filled) -->
  <g id="calves" class="bodymap text-mw-gray...">
    <path fill="currentColor" d="..."/>
    <path fill="currentColor" d="..."/>
  </g>
  <g id="quads" class="bodymap...">...</g>
  <g id="abdominals" class="bodymap...">...</g>
  <!-- ... more muscle groups ... -->

  <!-- Body Outline Group (strokes only, no fill) -->
  <g id="body" class="body-map__model">
    <line ... stroke="#484a68"/>
    <path fill="none" stroke="#484a68" d="..."/>
    <!-- 40+ paths forming body outline -->
  </g>

  <!-- Joint Groups (hidden by default) -->
  <g id="shoulders" class="hidden"></g>
  <g id="elbow" class="hidden"></g>
  <!-- ... more joint groups ... -->
</svg>
```

---

## Technical Notes

### No Filled Body Silhouette

Unlike some muscle diagram implementations, MuscleWiki does NOT use:
- A filled body silhouette underneath muscle overlays
- A separate base layer for the body shape
- Image/raster elements

The body form is created entirely through **stroke paths** in the `#body` group.

### Symmetry

- Front view has mirrored paths for left/right body sides
- Path coordinates are symmetric around X=330 (center line)
- Vertical lines at X=330.05, 330.17, 330.29, 330.40 indicate body center (spine/groin)

### Head Details

The head is included in the body outline with paths starting around:
- **Front view:** `M282.69,83.67` (left side) / `M377.77,83.67` (right side)
- **Back view:** `M228.95,211.29` (shoulder/neck area)

Head paths include:
- Skull outline
- Ear shapes
- Neck connection
- Hair/crown indication

### Coordinate System

- Origin: Top-left
- Width: 660.46 units
- Height: 1206.46 units
- Body center: ~X=330
- Head top: ~Y=5-10
- Feet bottom: ~Y=1190-1200

---

## CSS Classes Used

```css
/* Muscle groups */
.bodymap { /* Base styles */ }
.text-mw-gray { /* Default gray fill */ }
.active\:text-mw-red-700 { /* Click state */ }
.lg\:hover\:text-mw-red-100 { /* Hover state (desktop) */ }

/* Body outline */
.body-map__model { /* Stroke-only body lines */ }

/* Joint indicators */
.hidden { display: none; }
```

---

## Files Extracted

| File | Description |
|------|-------------|
| `musclewiki-front-male.svg` | Front view complete SVG |
| `musclewiki-back-male.svg` | Back view complete SVG |
| `svg-layers-analysis.md` | This analysis document |

---

## Recommendations for Implementation

1. **For a similar muscle map:**
   - Use stroke-only paths for body outline
   - Use filled paths with CSS-controlled colors for muscle regions
   - Group muscles by ID for easy event handling
   - Use `currentColor` fill with class-based color switching

2. **For animation/interactivity:**
   - Target group IDs directly (`#biceps`, `#chest`, etc.)
   - Use CSS transitions for smooth color changes
   - Consider SVG filters for glow/highlight effects

3. **For responsive design:**
   - Use viewBox attribute for scaling
   - Apply CSS classes for responsive sizing
   - The 660x1206 aspect ratio works well for mobile portrait
