# Input-Output Gap: Wrong Muscle Group Exercises on Training Days

## ✅ RESOLVED - Jan 1, 2026

**Root Cause:** Benchmark configuration error, NOT edge function bug.

The edge function's `muscle-filter.ts` was already correctly implemented with proper Bro Split mappings:
- `chest: ["pectorals"]` (NO triceps)
- `back: ["lats", "upper back", "traps", "spine"]` (NO biceps)

**What was wrong:**
1. Benchmark used `dayFocus` field, but edge function expects `dayType` or `splitDayType`
2. Benchmark scenarios explicitly requested wrong muscles (e.g., `targetMuscles: ['pectorals', 'triceps']` for chest day)

**Fix applied:** Updated `/home/arian/expo-work/showcase/benchmark-shared.mjs`:
- Added `splitDayType` field to all 5 Bro Split scenarios
- Removed triceps from Chest day's `targetMuscles` and `bodyParts`
- Removed biceps from Back day's `targetMuscles` and `bodyParts`
- Updated `requiredMuscleBalance` expectations

---

## Original Analysis (Historical Context)

### Executive Summary

The workout generation system assigns exercises targeting **wrong muscle groups** to specific training days in the Bro Split. Triceps isolation exercises appear on Chest day, and biceps isolation exercises appear on Back day. This violates the fundamental principle of Bro Split programming where each muscle group has a dedicated isolation day.

**Severity:** ~~Critical~~ **RESOLVED**
**Impact:** ~~Undermines training split integrity~~ **Fixed via benchmark config**
**Affected Split:** Bro Split (5-day)

---

## Critical Evidence: Bro Split - Chest Day

### Input Parameters
```json
{
  "split": "bro_split",
  "dayFocus": "Chest",
  "dayNumber": 1
}
```

### Expected Output
Only exercises targeting **pectoral muscles**:
- Bench press variations
- Dumbbell flyes
- Cable crossovers
- Push-up variations
- Machine chest press

### Actual Wrong Exercises in Output

| Exercise Name | Target Muscle | Why It's Wrong |
|---------------|---------------|----------------|
| Dumbbell Standing Triceps Extension | **TRICEPS** | Isolation movement for triceps |
| Dumbbell Lying One Arm Supinated Triceps Extension | **TRICEPS** | Isolation movement for triceps |
| Dumbbells Seated Triceps Extension | **TRICEPS** | Isolation movement for triceps |
| Dumbbell Kickback | **TRICEPS** | Isolation movement for triceps |
| Barbell Lying Triceps Extension | **TRICEPS** | Skullcrusher - pure triceps isolation |
| Cable Lying Triceps Extension | **TRICEPS** | Isolation movement for triceps |
| Dumbbell Tricep Kickback With Stork Stance | **TRICEPS** | Isolation movement for triceps |
| Barbell Reverse Grip Skullcrusher | **TRICEPS** | Isolation movement for triceps |

### Impact Analysis
In a proper Bro Split:
- **Chest Day** = Chest isolation ONLY
- **Arms Day** = Biceps AND Triceps isolation
- Triceps are hit as **secondary movers** during chest pressing, NOT as primary targets
- Including tricep isolation on Chest day means:
  - Triceps get double volume (Chest day + Arms day)
  - Arms day becomes redundant for triceps
  - Recovery is compromised

---

## Critical Evidence: Bro Split - Back Day

### Input Parameters
```json
{
  "split": "bro_split",
  "dayFocus": "Back",
  "dayNumber": 2
}
```

### Expected Output
Only exercises targeting **back muscles**:
- Lats (latissimus dorsi)
- Traps (trapezius)
- Rhomboids
- Rear delts (acceptable crossover)
- Erector spinae

### Actual Wrong Exercises in Output

| Exercise Name | Target Muscle | Why It's Wrong |
|---------------|---------------|----------------|
| Dumbbell Waiter Biceps Curl | **BICEPS** | Isolation movement for biceps |
| Dumbbell Hammer Curls (With Arm Blaster) | **BICEPS** | Isolation movement for biceps |
| Lever Preacher Curl | **BICEPS** | Isolation movement for biceps |
| Cable Rope One Arm Hammer Preacher Curl | **BICEPS** | Isolation movement for biceps |
| Cable One Arm Curl | **BICEPS** | Isolation movement for biceps |
| Dumbbell Cross Body Hammer Curl | **BICEPS** | Isolation movement for biceps |
| Cable Overhead Curl | **BICEPS** | Isolation movement for biceps |
| Dumbbell Alternate Hammer Preacher Curl | **BICEPS** | Isolation movement for biceps |

### Impact Analysis
In a proper Bro Split:
- **Back Day** = Back isolation ONLY
- **Arms Day** = Biceps AND Triceps isolation
- Biceps are hit as **secondary movers** during pulling, NOT as primary targets
- Including bicep isolation on Back day means:
  - Biceps get double volume (Back day + Arms day)
  - Arms day becomes redundant for biceps
  - Recovery is compromised

---

## Why This Matters for Bro Split

### Bro Split Philosophy
The Bro Split (5-day body part split) is designed around **one muscle group per day**:

| Day | Muscle Group | Isolation Focus |
|-----|--------------|-----------------|
| Day 1 | Chest | Pectorals only |
| Day 2 | Back | Lats, traps, rhomboids only |
| Day 3 | Shoulders | Deltoids only |
| Day 4 | Legs | Quads, hamstrings, glutes, calves |
| Day 5 | Arms | Biceps AND triceps |

### The Synergist Confusion Problem

**Compound movements involve synergist muscles:**
- Bench Press: Primary = Chest, Secondary = Triceps, Anterior Delts
- Barbell Row: Primary = Back, Secondary = Biceps, Rear Delts

**The system appears to be doing:**
```
IF dayFocus == "Chest" THEN
  include chest exercises
  include triceps exercises  // WRONG: Synergist ≠ Day Target
```

**The system SHOULD be doing:**
```
IF dayFocus == "Chest" AND split == "bro_split" THEN
  include chest exercises ONLY
  // Triceps get worked passively via compound pressing
  // Triceps get isolated on dedicated Arms day
```

### Training Split Comparison

| Split Type | Chest Day Includes | Back Day Includes |
|------------|-------------------|-------------------|
| Push/Pull/Legs | Chest + Triceps + Shoulders | Back + Biceps |
| Upper/Lower | Chest + Back + Arms + Shoulders | N/A |
| **Bro Split** | **Chest ONLY** | **Back ONLY** |

The current system treats Bro Split like Push/Pull/Legs, which is fundamentally wrong.

---

## Root Cause Analysis

### ✅ ACTUAL ROOT CAUSE (Discovered Jan 1, 2026)

The edge function was **correctly implemented** all along. The bug was in the benchmark configuration:

1. **Field name mismatch:** Benchmark used `dayFocus: 'Chest'`, but edge function expects `dayType` or `splitDayType`
2. **Explicit wrong values:** Benchmark scenarios included wrong muscles in request:
   ```javascript
   // WRONG - What benchmark was sending
   targetMuscles: ['pectorals', 'triceps'],  // triceps shouldn't be here
   bodyParts: ['chest', 'upper arms'],       // upper arms shouldn't be here
   ```
3. **Missing wiring:** No `splitDayType` field to wire to edge function's `filterByTargetMuscles()`

**Evidence:** `muscle-filter.ts` (implemented Dec 28) has correct mappings:
```typescript
// Line 73-78 of muscle-filter.ts
chest: ["pectorals"],              // NO triceps ✓
back: ["lats", "upper back", "traps", "spine"],  // NO biceps ✓
```

### Original Hypotheses (Incorrect)

~~### Hypothesis 1: Compound Movement Synergist Leak~~
~~The exercise selection algorithm may be:~~
~~1. Identifying compound chest exercises (bench press)~~
~~2. Seeing that triceps are involved~~
~~3. Including tricep isolation exercises as "related"~~

**Status:** DISPROVED - Edge function filtering is correct.

~~### Hypothesis 2: Missing Split-Aware Filtering~~
~~The filtering logic likely lacks split-specific checks~~

**Status:** DISPROVED - `filterByTargetMuscles()` handles this correctly.

~~### Hypothesis 3: Database Query Issue~~
~~The ExerciseDB query may be using OR logic instead of AND~~

**Status:** DISPROVED - Query logic is correct.

### Lesson Learned
When gap analysis shows unexpected results, verify the **test harness/benchmark configuration** before assuming the production code is buggy.

---

## Recommended Fix

### 1. Create Split-Aware Muscle Group Enums

```typescript
// src/constants/muscle-groups.ts

export const MUSCLE_GROUPS = {
  chest: ['pectorals'],
  back: ['lats', 'traps', 'rhomboids', 'upper back', 'spine'],
  shoulders: ['delts', 'anterior delts', 'lateral delts', 'rear delts'],
  arms: ['biceps', 'triceps', 'forearms'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'],
  core: ['abs', 'obliques', 'serratus anterior'],
} as const;

export const BRO_SPLIT_DAY_MUSCLES: Record<string, string[]> = {
  chest: MUSCLE_GROUPS.chest,
  back: MUSCLE_GROUPS.back,
  shoulders: MUSCLE_GROUPS.shoulders,
  legs: MUSCLE_GROUPS.legs,
  arms: MUSCLE_GROUPS.arms,
};

export const PPL_DAY_MUSCLES: Record<string, string[]> = {
  push: [...MUSCLE_GROUPS.chest, ...MUSCLE_GROUPS.shoulders, 'triceps'],
  pull: [...MUSCLE_GROUPS.back, 'biceps'],
  legs: MUSCLE_GROUPS.legs,
};
```

### 2. Implement Split-Aware Exercise Validator

```typescript
// supabase/functions/_shared/exercise-validator.ts

import { BRO_SPLIT_DAY_MUSCLES, PPL_DAY_MUSCLES } from './muscle-groups.ts';

interface Exercise {
  name: string;
  target: string;
  secondaryMuscles: string[];
}

interface ValidationContext {
  split: 'bro_split' | 'ppl' | 'upper_lower' | 'full_body';
  dayFocus: string;
}

export function isExerciseValidForDay(
  exercise: Exercise,
  context: ValidationContext
): boolean {
  const { split, dayFocus } = context;

  // Get allowed muscles for this day based on split type
  const allowedMuscles = getAllowedMuscles(split, dayFocus);

  if (!allowedMuscles) {
    console.warn(`Unknown day focus: ${dayFocus} for split: ${split}`);
    return true; // Fail open for unknown configurations
  }

  // For Bro Split: ONLY primary target muscle matters
  if (split === 'bro_split') {
    return allowedMuscles.some(muscle =>
      exercise.target.toLowerCase().includes(muscle.toLowerCase())
    );
  }

  // For PPL/Upper-Lower: Include synergist muscles
  return allowedMuscles.some(muscle =>
    exercise.target.toLowerCase().includes(muscle.toLowerCase()) ||
    exercise.secondaryMuscles.some(sec =>
      sec.toLowerCase().includes(muscle.toLowerCase())
    )
  );
}

function getAllowedMuscles(split: string, dayFocus: string): string[] | null {
  switch (split) {
    case 'bro_split':
      return BRO_SPLIT_DAY_MUSCLES[dayFocus.toLowerCase()] || null;
    case 'ppl':
    case 'ppl_3day':
    case 'ppl_6day':
      return PPL_DAY_MUSCLES[dayFocus.toLowerCase()] || null;
    // Add other splits as needed
    default:
      return null;
  }
}
```

### 3. Filter Exercises Before LLM Selection

```typescript
// In generate-workout edge function

const filteredExercises = candidateExercises.filter(exercise =>
  isExerciseValidForDay(exercise, {
    split: request.split,
    dayFocus: request.dayFocus,
  })
);

// Pass only valid exercises to LLM
const prompt = buildPrompt({
  ...request,
  availableExercises: filteredExercises, // Pre-filtered
});
```

### 4. Add Post-Generation Validation

```typescript
// Validate LLM output before returning

function validateWorkoutOutput(
  workout: GeneratedWorkout,
  context: ValidationContext
): ValidationResult {
  const invalidExercises = workout.exercises.filter(
    ex => !isExerciseValidForDay(ex, context)
  );

  if (invalidExercises.length > 0) {
    console.error('[VALIDATION_ERROR] Invalid exercises in output:', {
      dayFocus: context.dayFocus,
      split: context.split,
      invalidExercises: invalidExercises.map(e => ({
        name: e.name,
        target: e.target,
      })),
    });

    return {
      valid: false,
      errors: invalidExercises.map(e =>
        `Exercise "${e.name}" targets ${e.target}, not allowed on ${context.dayFocus} day`
      ),
    };
  }

  return { valid: true, errors: [] };
}
```

---

## Test Cases

### Bro Split Assertions

```typescript
describe('Bro Split Muscle Targeting', () => {
  describe('Chest Day', () => {
    it('should ONLY include exercises targeting pectorals', async () => {
      const workout = await generateWorkout({
        split: 'bro_split',
        dayFocus: 'Chest',
        dayNumber: 1,
      });

      workout.exercises.forEach(exercise => {
        expect(exercise.target.toLowerCase()).toContain('pectoral');
        expect(exercise.target.toLowerCase()).not.toContain('triceps');
      });
    });

    it('should NOT include tricep isolation exercises', async () => {
      const workout = await generateWorkout({
        split: 'bro_split',
        dayFocus: 'Chest',
        dayNumber: 1,
      });

      const tricepIsolations = [
        'triceps extension',
        'kickback',
        'skullcrusher',
        'pushdown',
      ];

      workout.exercises.forEach(exercise => {
        tricepIsolations.forEach(isolation => {
          expect(exercise.name.toLowerCase()).not.toContain(isolation);
        });
      });
    });
  });

  describe('Back Day', () => {
    it('should ONLY include exercises targeting back muscles', async () => {
      const workout = await generateWorkout({
        split: 'bro_split',
        dayFocus: 'Back',
        dayNumber: 2,
      });

      const validTargets = ['lats', 'traps', 'rhomboid', 'upper back', 'spine'];

      workout.exercises.forEach(exercise => {
        const isValidTarget = validTargets.some(target =>
          exercise.target.toLowerCase().includes(target)
        );
        expect(isValidTarget).toBe(true);
      });
    });

    it('should NOT include bicep isolation exercises', async () => {
      const workout = await generateWorkout({
        split: 'bro_split',
        dayFocus: 'Back',
        dayNumber: 2,
      });

      const bicepIsolations = [
        'curl',
        'preacher',
        'hammer curl',
        'concentration',
      ];

      workout.exercises.forEach(exercise => {
        bicepIsolations.forEach(isolation => {
          expect(exercise.name.toLowerCase()).not.toContain(isolation);
        });
      });
    });
  });

  describe('Arms Day', () => {
    it('should include BOTH biceps AND triceps exercises', async () => {
      const workout = await generateWorkout({
        split: 'bro_split',
        dayFocus: 'Arms',
        dayNumber: 5,
      });

      const hasBiceps = workout.exercises.some(ex =>
        ex.target.toLowerCase().includes('biceps')
      );
      const hasTriceps = workout.exercises.some(ex =>
        ex.target.toLowerCase().includes('triceps')
      );

      expect(hasBiceps).toBe(true);
      expect(hasTriceps).toBe(true);
    });
  });
});
```

### PPL Split Assertions (Contrast Case)

```typescript
describe('PPL Split Muscle Targeting', () => {
  describe('Push Day', () => {
    it('should include chest AND triceps exercises', async () => {
      const workout = await generateWorkout({
        split: 'ppl',
        dayFocus: 'Push',
        dayNumber: 1,
      });

      const hasChest = workout.exercises.some(ex =>
        ex.target.toLowerCase().includes('pectoral')
      );
      const hasTriceps = workout.exercises.some(ex =>
        ex.target.toLowerCase().includes('triceps')
      );

      expect(hasChest).toBe(true);
      expect(hasTriceps).toBe(true); // Different from Bro Split!
    });
  });

  describe('Pull Day', () => {
    it('should include back AND biceps exercises', async () => {
      const workout = await generateWorkout({
        split: 'ppl',
        dayFocus: 'Pull',
        dayNumber: 2,
      });

      const hasBack = workout.exercises.some(ex =>
        ['lats', 'traps', 'rhomboid'].some(m =>
          ex.target.toLowerCase().includes(m)
        )
      );
      const hasBiceps = workout.exercises.some(ex =>
        ex.target.toLowerCase().includes('biceps')
      );

      expect(hasBack).toBe(true);
      expect(hasBiceps).toBe(true); // Different from Bro Split!
    });
  });
});
```

---

## Summary

### ✅ RESOLUTION STATUS

| Issue | Evidence | Actual Cause | Status |
|-------|----------|--------------|--------|
| Triceps on Chest Day | 8 tricep isolation exercises found | Benchmark sent `targetMuscles: ['pectorals', 'triceps']` | ✅ Fixed |
| Biceps on Back Day | 8 bicep isolation exercises found | Benchmark sent `targetMuscles: ['lats', 'upper back', 'biceps']` | ✅ Fixed |
| No split differentiation | Same logic for Bro Split and PPL | Benchmark missing `splitDayType` field | ✅ Fixed |
| Missing validation | Invalid exercises pass through | Benchmark requested wrong muscles explicitly | ✅ Fixed |

**Priority:** ~~P0~~ **RESOLVED** - Benchmark configuration fixed in `benchmark-shared.mjs`

### Files Changed
- `/home/arian/expo-work/showcase/benchmark-shared.mjs` - Fixed 5 Bro Split scenarios with correct `splitDayType` and `targetMuscles`

### No Code Changes Required
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/muscle-filter.ts` - Already correct ✓
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/index.ts` - Already wires to filter ✓
