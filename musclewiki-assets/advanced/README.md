# MuscleWiki Advanced Mode - SVG Assets

Extracted from https://musclewiki.com/ on 2026-01-07

## Overview

MuscleWiki provides two muscle visualization modes:
- **Basic Mode**: Simplified muscle groups (e.g., "biceps", "quads")
- **Advanced Mode**: Detailed muscle subdivisions (e.g., "long-head-bicep", "short-head-bicep")

## Key Differences

| Aspect | Basic Mode | Advanced Mode |
|--------|------------|---------------|
| ViewBox | `0 0 660.46 1206.46` | `0 0 676.49 1203.49` |
| Front SVG paths | 65 | 116 |
| Back SVG paths | 52 | 97 |
| Muscle granularity | Major muscle groups | Individual muscle heads |

## Files

### Screenshots
- `00-default-mode.png` - Default view (no Advanced, no Joints)
- `01-basic-mode.png` - Basic mode muscle map
- `02-advanced-mode.png` - Advanced mode with detailed subdivisions

### SVG Assets
- `front-body-basic.svg` - Front view, basic muscle groups
- `back-body-basic.svg` - Back view, basic muscle groups
- `front-body-advanced.svg` - Front view, advanced muscle subdivisions
- `back-body-advanced.svg` - Back view, advanced muscle subdivisions

## Basic Mode Muscle Groups

### Front View (15 groups)
| ID | Description |
|----|-------------|
| `calves` | Calf muscles |
| `quads` | Quadriceps |
| `abdominals` | Abdominal muscles |
| `obliques` | Oblique muscles |
| `forearms` | Forearm muscles |
| `biceps` | Biceps (combined) |
| `front-shoulders` | Anterior deltoids |
| `chest` | Pectoralis |
| `traps` | Trapezius |
| `shoulders` | Deltoids (general) |
| `elbow` | Elbow joint |
| `wrist` | Wrist joint |
| `hips` | Hip joint |
| `knees` | Knee joint |
| `ankles` | Ankle joint |

### Back View (17 groups)
| ID | Description |
|----|-------------|
| `traps` | Upper trapezius |
| `calves` | Calf muscles |
| `hamstrings` | Hamstring muscles |
| `glutes` | Gluteal muscles |
| `forearms` | Forearm muscles |
| `triceps` | Triceps (combined) |
| `lats` | Latissimus dorsi |
| `lowerback` | Lower back / erector spinae |
| `traps-middle` | Middle trapezius |
| `rear-shoulders` | Posterior deltoids |
| `ankles` | Ankle joint |
| `knees` | Knee joint |
| `wrist` | Wrist joint |
| `elbow` | Elbow joint |
| `upper-spine` | Upper spine joint |
| `scapula` | Scapula / shoulder blade |
| `lower-spine` | Lower spine joint |

## Advanced Mode Muscle Groups

### Front View (20 groups)

| ID | Description | Basic Mode Equivalent |
|----|-------------|----------------------|
| `upper-abdominals` | Upper rectus abdominis | abdominals |
| `lower-abdominals` | Lower rectus abdominis | abdominals |
| `obliques` | External/internal obliques | obliques |
| `gastrocnemius` | Gastrocnemius (calf) | calves |
| `tibialis` | Tibialis anterior | calves |
| `soleus` | Soleus (deep calf) | calves |
| `outer-quadricep` | Vastus lateralis | quads |
| `rectus-femoris` | Rectus femoris | quads |
| `inner-quadricep` | Vastus medialis | quads |
| `inner-thigh` | Adductors | quads |
| `groin` | Hip flexors / iliopsoas | - |
| `wrist-flexors` | Wrist/finger flexors | forearms |
| `wrist-extensors` | Wrist/finger extensors | forearms |
| `short-head-bicep` | Biceps short head | biceps |
| `long-head-bicep` | Biceps long head | biceps |
| `upper-pectoralis` | Pectoralis major (clavicular) | chest |
| `mid-lower-pectoralis` | Pectoralis major (sternal) | chest |
| `anterior-deltoid` | Anterior deltoid | front-shoulders |
| `lateral-deltoid` | Lateral deltoid | shoulders |
| `upper-trapzeius` | Upper trapezius | traps |

### Back View (19 groups)

| ID | Description | Basic Mode Equivalent |
|----|-------------|----------------------|
| `upper-trapezius` | Upper trapezius | traps |
| `traps-middle` | Middle trapezius | traps-middle |
| `lower-trapezius` | Lower trapezius | traps |
| `gastrocnemius` | Gastrocnemius (calf) | calves |
| `soleus` | Soleus (deep calf) | calves |
| `inner-thigh` | Adductors | - |
| `medial-hamstrings` | Semitendinosus/semimembranosus | hamstrings |
| `lateral-hamstrings` | Biceps femoris | hamstrings |
| `gluteus-maximus` | Gluteus maximus | glutes |
| `gluteus-medius` | Gluteus medius | glutes |
| `lowerback` | Erector spinae | lowerback |
| `lats` | Latissimus dorsi | lats |
| `wrist-flexors` | Wrist/finger flexors | forearms |
| `wrist-extensors` | Wrist/finger extensors | forearms |
| `medial-head-triceps` | Triceps medial head | triceps |
| `long-head-triceps` | Triceps long head | triceps |
| `later-head-triceps` | Triceps lateral head | triceps |
| `posterior-deltoid` | Posterior deltoid | rear-shoulders |
| `lateral-deltoid` | Lateral deltoid | shoulders |

## Muscle Subdivision Mapping

This table shows how Advanced mode subdivides Basic mode muscles:

| Basic Muscle | Advanced Subdivisions |
|--------------|----------------------|
| **biceps** | `short-head-bicep`, `long-head-bicep` |
| **triceps** | `medial-head-triceps`, `long-head-triceps`, `later-head-triceps` |
| **quads** | `outer-quadricep`, `rectus-femoris`, `inner-quadricep`, `inner-thigh` |
| **hamstrings** | `medial-hamstrings`, `lateral-hamstrings` |
| **calves** | `gastrocnemius`, `tibialis`, `soleus` |
| **glutes** | `gluteus-maximus`, `gluteus-medius` |
| **chest** | `upper-pectoralis`, `mid-lower-pectoralis` |
| **abdominals** | `upper-abdominals`, `lower-abdominals` |
| **traps** | `upper-trapezius`, `traps-middle`, `lower-trapezius` |
| **shoulders** | `anterior-deltoid`, `lateral-deltoid`, `posterior-deltoid` |
| **forearms** | `wrist-flexors`, `wrist-extensors` |

## SVG Structure

Each SVG contains:
- `<g id="muscle-name">` groups for each clickable muscle region
- `<path>` elements with the actual muscle shape paths
- Stroke outlines using color `#484a68`
- Fill using `currentColor` for theming support

### Example SVG Group
```xml
<g id="long-head-bicep" class="bodymap text-mw-gray">
  <path d="M534.5,396.35c-2.48,1.92..." fill="currentColor"></path>
  <path d="M191.82,326.08c-0.43,0.7..." fill="currentColor"></path>
</g>
```

## Usage Notes

1. **CSS Classes**: Muscles use `class="bodymap text-mw-gray"` for styling
2. **Mirrored Paths**: Most muscles have 2 paths (left and right side of body)
3. **Color Theming**: Uses `currentColor` fill - set CSS color property to change muscle color
4. **Interaction**: MuscleWiki uses JavaScript to highlight muscles on hover/click

## Integration Tips

For fitness app integration:
1. Use Advanced mode IDs for precise muscle targeting in workout generation
2. Map ExerciseDB muscle names to these SVG IDs
3. Consider using Basic mode for simpler UI, Advanced for detailed muscle selection
4. The SVGs are designed to scale - use CSS to set dimensions

## License

These assets were extracted from MuscleWiki for reference purposes.
Please check MuscleWiki's terms of service for usage rights.
