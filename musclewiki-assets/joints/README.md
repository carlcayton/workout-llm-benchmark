# MuscleWiki Joints Mode Analysis

Extracted from https://musclewiki.com on 2026-01-07

## Overview

MuscleWiki has a **Joints mode** that overlays clickable joint markers on the anatomical body model. When enabled, users can click on joints to find mobility/stretching exercises.

## How to Access

1. Go to https://musclewiki.com
2. Find the toggle switches in the top-right control panel
3. Toggle "Joints" to ON (orange)
4. URL parameter: `?joints=true`

## Joint Locations (6 joint types)

| Joint | Description | Use Case |
|-------|-------------|----------|
| Shoulders | Shoulder joint (glenohumeral) | Shoulder mobility, rotator cuff |
| Elbow | Elbow joint | Elbow pain, tennis elbow stretches |
| Wrist | Wrist/carpal joint | Wrist mobility, carpal tunnel |
| Hips | Hip joint (acetabulofemoral) | Hip mobility, hip flexor stretches |
| Knees | Knee joint | Knee rehab, patellar exercises |
| Ankles | Ankle joint | Ankle mobility, Achilles stretches |

## SVG Implementation Details

### ViewBox
- `viewBox="0 0 660.46 1206.46"`
- Same coordinate space as the muscle body model

### Joint Marker Design (2-ellipse pattern)

Each joint location has TWO ellipses stacked:

1. **Hover ellipse** (larger, ~25px radius)
   - Fill: `url(#jointradial)` - radial gradient from pink center to gray edge
   - Purpose: Provides larger clickable area and visual hover feedback

2. **Center ellipse** (smaller, ~12px radius)
   - Fill: `currentColor` (inherits from parent, typically red `#fe5b7f`)
   - Stroke: 3.5px solid, rounded caps
   - Purpose: Visual indicator of joint position

### Radial Gradient

```svg
<radialGradient id="jointradial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
  <stop offset="0%" style="stop-color: rgb(254, 91, 127); stop-opacity: 1;"/>
  <stop offset="100%" style="stop-color: rgb(231, 236, 239); stop-opacity: 1;"/>
</radialGradient>
```

Colors:
- Center: `#fe5b7f` (MuscleWiki red/pink)
- Edge: `#e7ecef` (light gray)

### CSS Classes

**Visible state:**
```css
.joints {
  /* Uses Tailwind classes */
  color: text-mw-red;           /* Red color for joint dots */
  stroke: stroke-[#484a68];     /* Dark blue-gray stroke */
}

.joints:hover {
  color: text-mw-green;         /* Green on hover */
  stroke: stroke-gray-900;      /* Darker stroke on hover */
}
```

**Hidden state:**
```css
.hidden { display: none; }
```

### Toggle Mechanism

The joints toggle controls visibility via CSS class:
- OFF: Joint groups have `class="hidden"`
- ON: Joint groups have `class="joints text-mw-red stroke-[#484a68] hover:text-mw-green hover:stroke-gray-900"`

## Front View Joint Coordinates

| Joint | Left X | Left Y | Right X | Right Y |
|-------|--------|--------|---------|---------|
| Shoulders | 219.33 | 261.13 | 441.13 | 261.13 |
| Elbow | 118.6 | 412.77 | 541.86 | 412.77 |
| Wrist | 42.41 | 531.02 | 618.05 | 531.02 |
| Hips | 247.71 | 523.37 | 412.75 | 523.37 |
| Knees | 241.09 | 874.7 | 419.37 | 874.7 |
| Ankles | 221.14 | 1105.65 | 439.32 | 1105.65 |

## Back View Joint Coordinates

| Joint | Left X | Left Y | Right X | Right Y |
|-------|--------|--------|---------|---------|
| Elbow | 119.84 | 396.23 | 540.68 | 396.23 |
| Wrist | 30.54 | 548.63 | 629.98 | 548.63 |
| Knees | 237.16 | 879.63 | 423.36 | 879.63 |
| Ankles | 214.71 | 1119.64 | 445.81 | 1119.64 |

Note: Back view does not have shoulders or hips joints (they are not visible from behind).

## Files in This Directory

- `README.md` - This documentation
- `joints-svg-data.json` - Complete SVG data for all joints (coordinates, paths, styles)
- `01-muscles-mode-before.png` - Screenshot before enabling joints (muscles view)
- `02-joints-mode-enabled.png` - Captured from local prototype showcase app
- `03-joints-mode-full-body.png` - **KEY SCREENSHOT** - MuscleWiki with joints visible (pink dots at shoulders, elbows, wrists, hips, knees, ankles)
- `04-joints-mode-activated.png` - Joints toggle activated
- `05-joints-mode-url-param.png` - Accessed via URL parameter (?joints=true)
- `06-joints-mode-simple-view.png` - Simple (non-advanced) view with joints toggle

## Usage Notes

1. **Joints mode disables muscle selection** - When joints are enabled, the equipment checkboxes become disabled and you can only click on joints, not muscles.

2. **Advanced mode compatibility** - Joints work with both simple and advanced muscle views.

3. **Gender toggle** - Joint positions are the same for male/female models.

## Integration Ideas

For a fitness app, the joint overlay could be used for:
- Injury location selection ("Where does it hurt?")
- Mobility assessment flows
- Stretching/warm-up exercise selection
- Rehab exercise filtering
