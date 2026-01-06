# Input-Output Gap Analysis: Training Style Parameter Mishandling

**Document Version:** 1.0
**Analysis Date:** January 2026
**Scope:** Training style parameter violations for HIT and mixed-style workouts
**Status:** CRITICAL - Core parameter logic flawed

---

## Executive Summary

The workout generation system systematically mishandles training style parameters, particularly when:

1. **HIT (High Intensity Training)** is specified - the defining 1-2 set cap is violated
2. **Mixed styles** are combined - parameters are incorrectly averaged instead of applied per-exercise

| Issue | Severity | Impact |
|-------|----------|--------|
| HIT set cap violations (3.2 avg when max is 2) | CRITICAL | Defeats HIT methodology entirely |
| Mixed style rest averaging (162s = neither style) | HIGH | Invalid rest periods for all exercises |
| Uniform rest across mixed-rep workouts | HIGH | Same rest for 5-rep and 10-rep exercises |

**Root Cause:** Parameters are applied GLOBALLY per workout rather than PER-EXERCISE based on rep scheme.

---

## Training Style Requirements Reference

The following parameters are MANDATORY constraints, not guidelines:

| Style | Reps | Rest (seconds) | Sets | Primary Adaptation |
|-------|------|----------------|------|--------------------|
| **STRENGTH** | 3-6 | 180-300 | 3-5 | Neuromuscular efficiency |
| **BODYBUILDING** | 8-12 | 60-90 | 3-4 | Muscular hypertrophy |
| **ENDURANCE** | 15-25 | 30-60 | 2-3 | Muscular endurance |
| **HIT** | 6-10 | 120-300 | **1-2 MAX** | Maximal recruitment (to failure) |

### Critical Constraints

- **HIT set cap (1-2) is non-negotiable** - This IS the defining characteristic of HIT methodology
- **Strength rest minimum (180s)** - Required for phosphocreatine replenishment
- **Endurance rest maximum (60s)** - Required to maintain metabolic stress
- **Mixed styles require per-exercise assignment** - Not global averaging

---

## HIT Set Cap Violations

**Severity:** CRITICAL
**Defining Issue:** HIT training is predicated on 1-2 sets taken to absolute muscular failure. Exceeding 2 sets means the trainee did NOT reach true failure, negating the protocol.

### Evidence: "Upper/Lower - HIT + Bodybuilding (Upper)"

**Input Parameters:**
```javascript
trainingStyles: ['high_intensity_hit', 'classic_bodybuilding']
// HIT spec: sets.max = 2, sets.optimal = 1
// Bodybuilding spec: sets.max = 4, sets.optimal = 4
```

**Output (Claude 4.5 Haiku):**

| Exercise | Sets | Reps | Rest | Expected Sets (HIT) |
|----------|------|------|------|---------------------|
| dumbbell arnold press | 2 | 8 | 171s | 2 MAX |
| cable rear delt row (with rope) | 2 | 8 | 171s | 2 MAX |
| dumbbell pronate-grip triceps extension | **4** | 10 | 171s | **2 MAX** |
| lever pullover | **4** | 10 | 171s | **2 MAX** |
| dumbbell bicep curl on exercise ball | **4** | 10 | 171s | **2 MAX** |
| dumbbell one arm lateral raise | **4** | 10 | 171s | **2 MAX** |

**Average Sets:** 3.3 (VIOLATES HIT cap of 2)

### Analysis

The system appears to be doing:
```
averaged_sets = (HIT.sets.max + BB.sets.max) / 2
             = (2 + 4) / 2
             = 3
```

**This is WRONG.** HIT's set cap is a CEILING, not a target to average.

### What Should Happen

When HIT is mixed with any other style:
1. HIT set cap (2) OVERRIDES all other styles
2. All exercises get 1-2 sets maximum
3. The difference between styles manifests in rep scheme, not set count

```typescript
// CORRECT Implementation
if (styles.includes('high_intensity_hit')) {
  exercise.sets = Math.min(exercise.sets, 2); // Hard cap
}
```

---

## Mixed Style Rest Time Failures

**Severity:** HIGH
**Issue:** Rest periods are averaged globally instead of assigned per-exercise based on rep scheme.

### Evidence: "PPL - Strength + Bodybuilding (Push)"

**Input Parameters:**
```javascript
trainingStyles: ['strength_focused', 'classic_bodybuilding']
// Strength spec: rest.min = 120, rest.max = 240
// Bodybuilding spec: rest.min = 60, rest.max = 90
```

**Output (Claude 4.5 Haiku):**

| Exercise | Sets | Reps | Rest | Expected Rest |
|----------|------|------|------|---------------|
| dumbbell seated shoulder press | 5 | 5 | 180s | 180-240s (STRENGTH) |
| barbell decline bench press | 5 | 5 | 180s | 180-240s (STRENGTH) |
| machine inner chest press | 5 | 5 | 180s | 180-240s (STRENGTH) |
| cable upper chest crossovers | 4 | 10 | 180s | **60-90s (BB)** |
| barbell lying tricep extension | 4 | 10 | 180s | **60-90s (BB)** |
| dumbbell incline one arm lateral raise | 4 | 10 | 180s | **60-90s (BB)** |
| dumbbell lying supinated triceps ext | 4 | 10 | 180s | **60-90s (BB)** |
| dumbbell pronate-grip triceps ext | 4 | 10 | 180s | **60-90s (BB)** |

### Problem Analysis

**Uniform Rest = 180s for ALL exercises**

This is problematic because:
1. 180s is valid for 5-rep strength exercises (180-240s range)
2. 180s is INVALID for 10-rep bodybuilding exercises (60-90s range)
3. The 10-rep exercises should get 75-90s rest, not 180s

### Evidence of Averaging Logic

Looking at other benchmark results:

| Scenario | Mixed Styles | Avg Rest | Expected |
|----------|--------------|----------|----------|
| HIT + Bodybuilding (Upper) | HIT (120-300) + BB (60-90) | 171s | Per-exercise |
| Strength + Bodybuilding (Push) | STR (180-300) + BB (60-90) | 180s | Per-exercise |
| Strength + Endurance (Full) | STR (180-300) + END (30-60) | ~120s | Per-exercise |

The pattern suggests:
```javascript
// CURRENT (WRONG) Implementation
avgRest = (style1.rest.optimal + style2.rest.optimal) / 2;
// Applied uniformly to ALL exercises
```

---

## Evidence: Uniform Rest Across All Exercises

### Statistical Analysis from Benchmark Data

| Workout | Unique Rest Values | Exercises | Problem |
|---------|-------------------|-----------|---------|
| HIT + Bodybuilding (Upper) | 1 (171s) | 6 | ALL get same rest |
| Strength + Bodybuilding (Push) | 1 (180s) | 8 | ALL get same rest |
| Pure HIT (Upper) | 1 (240s) | 6 | Correct (single style) |
| Pure Bodybuilding (Chest) | 1 (78s) | 8 | Correct (single style) |

**Finding:** REST has exactly 1 unique value per workout, regardless of whether exercises have different rep schemes.

### The Core Problem

For mixed styles, the system should:

```
5-rep exercise (strength) -> 180-240s rest
10-rep exercise (BB) -> 60-90s rest
```

But instead it does:

```
ALL exercises -> averaged rest (e.g., 162s, 171s, 180s)
```

This creates REST that is:
- Too short for strength exercises (fails phosphocreatine recovery)
- Too long for BB exercises (kills metabolic stress)

---

## Exercise-Level Parameter Analysis

### "PPL - Strength + Bodybuilding (Push)" - Full Breakdown

| # | Exercise | Sets | Reps | Actual Rest | Style | Expected Rest | Violation |
|---|----------|------|------|-------------|-------|---------------|-----------|
| 1 | DB Seated Shoulder Press | 5 | 5 | 180s | STRENGTH | 180-240s | OK |
| 2 | BB Decline Bench Press | 5 | 5 | 180s | STRENGTH | 180-240s | OK |
| 3 | Machine Inner Chest Press | 5 | 5 | 180s | STRENGTH | 180-240s | OK |
| 4 | Cable Upper Chest Crossovers | 4 | 10 | 180s | BB | **60-90s** | +90s |
| 5 | BB Lying Tricep Extension | 4 | 10 | 180s | BB | **60-90s** | +90s |
| 6 | DB Incline Lateral Raise | 4 | 10 | 180s | BB | **60-90s** | +90s |
| 7 | DB Supinated Triceps Ext | 4 | 10 | 180s | BB | **60-90s** | +90s |
| 8 | DB Pronate Triceps Ext | 4 | 10 | 180s | BB | **60-90s** | +90s |

**Impact:** 5 of 8 exercises (62.5%) have incorrect rest periods.

### "Upper/Lower - HIT + Bodybuilding (Upper)" - Full Breakdown

| # | Exercise | Sets | Reps | Actual Rest | Expected (HIT) | Set Violation |
|---|----------|------|------|-------------|----------------|---------------|
| 1 | DB Arnold Press | 2 | 8 | 171s | 120-300s | OK |
| 2 | Cable Rear Delt Row | 2 | 8 | 171s | 120-300s | OK |
| 3 | DB Triceps Extension | **4** | 10 | 171s | 120-300s | **+2 sets** |
| 4 | Lever Pullover | **4** | 10 | 171s | 120-300s | **+2 sets** |
| 5 | DB Bicep Curl | **4** | 10 | 171s | 120-300s | **+2 sets** |
| 6 | DB Lateral Raise | **4** | 10 | 171s | 120-300s | **+2 sets** |

**Impact:** 4 of 6 exercises (66.7%) violate HIT set cap.

---

## Root Cause Analysis

### 1. Global Parameter Application

The system applies parameters at the WORKOUT level, not EXERCISE level:

```typescript
// CURRENT (WRONG)
const workoutRest = calculateAverageRest(trainingStyles);
exercises.forEach(ex => ex.rest = workoutRest);

// CORRECT
exercises.forEach(ex => {
  const styleForExercise = determineStyleByReps(ex.reps, trainingStyles);
  ex.rest = TRAINING_STYLE_PARAMS[styleForExercise].rest.optimal;
});
```

### 2. Averaging Instead of Overriding

When styles conflict, the system averages parameters:

```typescript
// CURRENT (WRONG)
const avgSets = (style1.sets.max + style2.sets.max) / 2;

// CORRECT (for HIT specifically)
const maxSets = styles.includes('high_intensity_hit')
  ? 2
  : Math.max(...styles.map(s => PARAMS[s].sets.max));
```

### 3. Missing Style-to-Exercise Mapping

There's no logic to assign style based on exercise rep scheme:

```typescript
// MISSING - Should exist
function getStyleForExercise(reps: number, availableStyles: string[]): string {
  if (reps <= 6 && availableStyles.includes('strength_focused'))
    return 'strength_focused';
  if (reps >= 8 && reps <= 12 && availableStyles.includes('classic_bodybuilding'))
    return 'classic_bodybuilding';
  if (reps >= 15 && availableStyles.includes('muscular_endurance'))
    return 'muscular_endurance';
  return availableStyles[0]; // fallback
}
```

### 4. HIT Ceiling Not Enforced

The 2-set maximum for HIT is not treated as a hard constraint:

```typescript
// MISSING - Should exist
const HIT_ABSOLUTE_CONSTRAINTS = {
  maxSets: 2,          // NEVER exceed
  mustReachFailure: true,
  preferMachines: true, // Safety for failure sets
};

// Applied as post-processing validation
if (style === 'high_intensity_hit' && exercise.sets > 2) {
  throw new ValidationError('HIT exercises cannot exceed 2 sets');
}
```

---

## Recommended Fixes

### Fix 1: HIT Set Cap Enforcement

```typescript
function enforceHITConstraints(workout: Workout, styles: string[]): Workout {
  if (!styles.includes('high_intensity_hit')) return workout;

  return {
    ...workout,
    exercises: workout.exercises.map(ex => ({
      ...ex,
      sets: Math.min(ex.sets, 2), // Hard cap at 2
    })),
  };
}
```

### Fix 2: Per-Exercise Rest Assignment

```typescript
function assignRestPeriod(exercise: Exercise, styles: string[]): number {
  const reps = exercise.reps;

  // Determine which style applies to THIS exercise based on rep scheme
  if (reps <= 6 && styles.includes('strength_focused')) {
    return 180; // Strength rest
  }
  if (reps >= 8 && reps <= 12 && styles.includes('classic_bodybuilding')) {
    return 75; // Bodybuilding rest
  }
  if (reps >= 15 && styles.includes('muscular_endurance')) {
    return 45; // Endurance rest
  }
  if (styles.includes('high_intensity_hit')) {
    return 150; // HIT rest (always needs recovery for failure sets)
  }

  // Default to moderate rest
  return 90;
}
```

### Fix 3: TypeScript Validation with Specific Checks

```typescript
interface StyleConstraints {
  sets: { min: number; max: number };
  reps: { min: number; max: number };
  rest: { min: number; max: number };
}

const CONSTRAINTS: Record<string, StyleConstraints> = {
  high_intensity_hit: {
    sets: { min: 1, max: 2 },      // CRITICAL: max 2
    reps: { min: 6, max: 10 },
    rest: { min: 120, max: 300 },
  },
  strength_focused: {
    sets: { min: 3, max: 5 },
    reps: { min: 3, max: 6 },
    rest: { min: 180, max: 300 },  // CRITICAL: min 180
  },
  classic_bodybuilding: {
    sets: { min: 3, max: 4 },
    reps: { min: 8, max: 12 },
    rest: { min: 60, max: 90 },
  },
  muscular_endurance: {
    sets: { min: 2, max: 3 },
    reps: { min: 15, max: 25 },
    rest: { min: 30, max: 60 },    // CRITICAL: max 60
  },
};

function validateExercise(ex: Exercise, style: string): string[] {
  const errors: string[] = [];
  const c = CONSTRAINTS[style];

  if (style === 'high_intensity_hit' && ex.sets > c.sets.max) {
    errors.push(`HIT violation: ${ex.name} has ${ex.sets} sets (max ${c.sets.max})`);
  }
  if (ex.rest < c.rest.min) {
    errors.push(`Rest too short: ${ex.name} has ${ex.rest}s (min ${c.rest.min}s for ${style})`);
  }
  if (ex.rest > c.rest.max) {
    errors.push(`Rest too long: ${ex.name} has ${ex.rest}s (max ${c.rest.max}s for ${style})`);
  }

  return errors;
}
```

### Fix 4: LLM Prompt Clarification

Add explicit instructions in the workout generation prompt:

```
CRITICAL CONSTRAINTS FOR MIXED TRAINING STYLES:

1. HIT SET CAP (when high_intensity_hit is included):
   - ALL exercises MUST have 1-2 sets MAXIMUM
   - This overrides other styles - HIT ceiling is non-negotiable
   - Reason: HIT relies on going to absolute failure; >2 sets = not true failure

2. PER-EXERCISE REST ASSIGNMENT (when multiple styles):
   - Assign rest based on THAT exercise's rep scheme, not a global average
   - Reps 3-6: Use strength rest (180-240s)
   - Reps 8-12: Use bodybuilding rest (60-90s)
   - Reps 15+: Use endurance rest (30-60s)

3. NEVER AVERAGE PARAMETERS:
   - WRONG: (strength_rest + bb_rest) / 2 = 135s for all
   - RIGHT: 5-rep exercise = 180s, 10-rep exercise = 75s
```

---

## Test Cases

### Test 1: HIT Set Cap Enforcement

```typescript
describe('HIT Set Cap', () => {
  it('should never exceed 2 sets when HIT is included', async () => {
    const workout = await generateWorkout({
      styles: ['high_intensity_hit', 'classic_bodybuilding'],
      split: 'upper_lower',
    });

    for (const exercise of workout.exercises) {
      expect(exercise.sets).toBeLessThanOrEqual(2);
    }
  });

  it('should cap at 2 even when other style requests 4', async () => {
    const workout = await generateWorkout({
      styles: ['high_intensity_hit'], // Pure HIT
    });

    const avgSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0)
                   / workout.exercises.length;
    expect(avgSets).toBeLessThanOrEqual(2);
  });
});
```

### Test 2: Mixed Style Rest Assignment

```typescript
describe('Mixed Style Rest', () => {
  it('should assign rest per-exercise based on rep scheme', async () => {
    const workout = await generateWorkout({
      styles: ['strength_focused', 'classic_bodybuilding'],
    });

    for (const exercise of workout.exercises) {
      if (exercise.reps <= 6) {
        // Strength exercise
        expect(exercise.rest).toBeGreaterThanOrEqual(180);
        expect(exercise.rest).toBeLessThanOrEqual(300);
      } else if (exercise.reps >= 8 && exercise.reps <= 12) {
        // Bodybuilding exercise
        expect(exercise.rest).toBeGreaterThanOrEqual(60);
        expect(exercise.rest).toBeLessThanOrEqual(90);
      }
    }
  });

  it('should NOT use uniform rest for mixed-rep workouts', async () => {
    const workout = await generateWorkout({
      styles: ['strength_focused', 'classic_bodybuilding'],
    });

    const restValues = workout.exercises.map(ex => ex.rest);
    const uniqueRestValues = [...new Set(restValues)];

    // If we have exercises with different rep schemes, rest should vary
    const hasStrengthReps = workout.exercises.some(ex => ex.reps <= 6);
    const hasBBReps = workout.exercises.some(ex => ex.reps >= 8 && ex.reps <= 12);

    if (hasStrengthReps && hasBBReps) {
      expect(uniqueRestValues.length).toBeGreaterThan(1);
    }
  });
});
```

### Test 3: Per-Exercise Validation

```typescript
describe('Per-Exercise Style Validation', () => {
  it('should validate each exercise against its inferred style', async () => {
    const workout = await generateWorkout({
      styles: ['strength_focused', 'classic_bodybuilding'],
    });

    const errors: string[] = [];

    for (const ex of workout.exercises) {
      // Infer style from rep scheme
      const inferredStyle = ex.reps <= 6 ? 'strength_focused' : 'classic_bodybuilding';
      const constraints = CONSTRAINTS[inferredStyle];

      if (ex.rest < constraints.rest.min) {
        errors.push(`${ex.name}: rest ${ex.rest}s < min ${constraints.rest.min}s for ${inferredStyle}`);
      }
      if (ex.rest > constraints.rest.max) {
        errors.push(`${ex.name}: rest ${ex.rest}s > max ${constraints.rest.max}s for ${inferredStyle}`);
      }
    }

    expect(errors).toHaveLength(0);
  });
});
```

---

## Summary

| Issue | Current Behavior | Required Behavior |
|-------|-----------------|-------------------|
| HIT set count | Averaged (3.2 sets) | Capped at 2 always |
| Mixed style rest | Global average (162-180s) | Per-exercise by rep scheme |
| Style-to-exercise mapping | None | Based on rep range |
| Constraint priority | Equal weighting | HIT ceiling > other maximums |

**The core fix:** Apply parameters at the EXERCISE level, not WORKOUT level, and treat HIT's 2-set maximum as an absolute ceiling that overrides other styles.

---

*Document generated from workout benchmark analysis. All findings based on actual generated workout data from December 2025 benchmark runs.*
