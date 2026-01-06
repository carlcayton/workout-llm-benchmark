# Workout Benchmark Analysis: Sets/Reps/Rest Programming Issues

**Document Version:** 1.0
**Analysis Date:** January 2026
**Scope:** Programming parameter violations found in workout generation benchmark data

---

## Executive Summary

This document identifies systematic issues with workout programming parameters (sets, reps, rest periods) found during benchmark testing. These violations indicate the LLM is not properly applying training style constraints, resulting in suboptimal or incorrect workout prescriptions.

**Total Issues Identified:** 37+ occurrences across 6 categories

| Severity | Count | Category |
|----------|-------|----------|
| CRITICAL | 20 | HIT 2-Set Cap Violations |
| HIGH | 10 | Strength Reps/Rest Out of Range |
| MEDIUM | 12+ | Endurance Rest, HIT Rest, Rep Variance |
| LOW | - | Missing Tempo Notation (100% affected) |

---

## 1. HIT 2-Set Cap Violations

**Severity:** CRITICAL
**Occurrences:** 20
**Impact:** Defeats the purpose of High Intensity Training methodology

### Background

High Intensity Training (HIT) is predicated on maximum effort with minimal volume. The defining characteristic is **1-2 sets per exercise taken to absolute muscular failure**. Exceeding 2 sets indicates the trainee is not reaching true failure, negating the HIT protocol's effectiveness.

### Violations Found

#### Upper/Lower - HIT + Bodybuilding (Upper Day)

| Exercise | Sets Generated | Maximum Allowed | Violation |
|----------|----------------|-----------------|-----------|
| Lever Chest Press | 4 | 2 | +2 sets |
| Assisted Standing Pull-up | 4 | 2 | +2 sets |
| Lever Shoulder Press | 4 | 2 | +2 sets |
| Cable Lateral Raise | 4 | 2 | +2 sets |
| Cable Triceps Pushdown | 4 | 2 | +2 sets |

#### Full Body - HIT

| Exercise | Sets Generated | Maximum Allowed | Violation |
|----------|----------------|-----------------|-----------|
| Lever T-Bar Reverse Grip Row | 4 | 2 | +2 sets |
| Dumbbell One Arm Incline Chest Press | 4 | 2 | +2 sets |
| Barbell Squat | 4 | 2 | +2 sets |
| Dumbbell Romanian Deadlift | 4 | 2 | +2 sets |

### Root Cause Analysis

The LLM appears to be defaulting to standard bodybuilding volume (3-4 sets) when HIT is specified. The constraint "maximum 2 sets" is either:
1. Not present in the system prompt
2. Being overridden by general volume guidelines
3. Not weighted heavily enough in the prompt structure

### Recommendation

Add explicit constraint in workout generation prompt:
```
CRITICAL CONSTRAINT - HIT Training Style:
- MAXIMUM 2 sets per exercise (1-2 only)
- If sets > 2, this is NOT a valid HIT workout
- Each set must be taken to absolute muscular failure
- Violating this constraint invalidates the entire workout
```

---

## 2. Strength Reps Out of Range

**Severity:** HIGH
**Occurrences:** 5
**Impact:** Strength workouts training wrong energy systems (glycolytic vs phosphocreatine)

### Background

Strength training targets the phosphocreatine energy system, which supports maximal efforts lasting 0-15 seconds. This corresponds to **3-6 repetitions** at 85-100% 1RM. Higher rep ranges shift the stimulus toward muscular endurance and hypertrophy, defeating the strength adaptation goal.

### Violations Found

| Workout Scenario | Avg Reps Generated | Expected Range | Delta |
|------------------|-------------------|----------------|-------|
| PPL - Strength + Bodybuilding (Push) | 10 | 3-6 | +4-7 reps |
| Upper/Lower - Strength (Upper) | 10 | 3-6 | +4-7 reps |
| Full Body - Strength | 8 | 3-6 | +2-5 reps |
| PPL - Strength (Pull) | 8-10 | 3-6 | +2-7 reps |
| Bro Split - Strength (Chest) | 8 | 3-6 | +2-5 reps |

### Analysis

When "strength" is specified as a training style, the model consistently generates rep ranges appropriate for **bodybuilding** (8-12 reps) rather than true strength training (3-6 reps).

**Example Violation - PPL Push Day (Strength):**
```
Exercise: Barbell Bench Press
Generated: 4 sets x 10 reps @ 90s rest
Expected:  5 sets x 4 reps @ 180-300s rest

This is a bodybuilding prescription, not strength training.
```

### Root Cause Analysis

The LLM may be:
1. Conflating "strength training" (the general activity) with "strength" (the specific training style)
2. Defaulting to "safe" moderate rep ranges
3. Not differentiating between training goals in the prompt

### Recommendation

Explicitly define rep ranges with hard boundaries:
```
STRENGTH Training Style Parameters:
- Reps: 3-6 ONLY (never exceed 6 reps)
- Sets: 3-5
- Rest: 180-300 seconds (3-5 minutes)
- Load: 85-100% of 1RM
- If reps > 6, reclassify as BODYBUILDING
```

---

## 3. Rest Period Violations

**Severity:** HIGH to MEDIUM
**Impact:** Incorrect energy system recovery, suboptimal training adaptation

### 3.1 Strength Rest Too Short

**Severity:** HIGH
**Occurrences:** 3

| Workout | Rest Generated | Required Rest | Deficit |
|---------|----------------|---------------|---------|
| PPL - Strength + Bodybuilding (Push) | 90s | 180-300s | -90 to -210s |
| Upper/Lower - Strength (Upper) | 120s | 180-300s | -60 to -180s |
| Full Body - Strength | 90s | 180-300s | -90 to -210s |

**Impact:** Phosphocreatine system requires 3-5 minutes for full replenishment. Short rest periods force trainees to reduce load, converting strength work into metabolic stress training.

### 3.2 Endurance Rest Too Long

**Severity:** MEDIUM
**Occurrences:** 5

| Workout | Rest Generated | Maximum Rest | Excess |
|---------|----------------|--------------|--------|
| Full Body - Endurance (Bands) | 78s | 60s | +18s |
| Upper/Lower - Endurance (Upper) | 70s | 60s | +10s |
| Full Body - Endurance | 75s | 60s | +15s |
| PPL - Endurance (Push) | 72s | 60s | +12s |
| Upper/Lower - Endurance (Lower) | 68s | 60s | +8s |

**Impact:** Endurance training relies on maintaining elevated heart rate and metabolic stress. Longer rest periods allow excessive recovery, reducing the cardiovascular and muscular endurance adaptations.

### 3.3 HIT Rest Too Short

**Severity:** MEDIUM
**Occurrences:** 4

| Workout | Rest Generated | Required Rest | Deficit |
|---------|----------------|---------------|---------|
| Full Body - HIT | 78s | 120-300s | -42 to -222s |
| Upper/Lower - HIT (Upper) | 90s | 120-300s | -30 to -210s |
| PPL - HIT (Pull) | 85s | 120-300s | -35 to -215s |
| Bro Split - HIT (Back) | 80s | 120-300s | -40 to -220s |

**Impact:** HIT requires complete neuromuscular recovery between sets to achieve true muscular failure. Insufficient rest leads to cardiovascular or metabolic failure before muscular failure, negating the HIT stimulus.

### Recommendation

Implement rest period validation in post-processing:
```typescript
const REST_RANGES = {
  strength: { min: 180, max: 300 },
  bodybuilding: { min: 60, max: 90 },
  endurance: { min: 30, max: 60 },
  hit: { min: 120, max: 300 },
};

function validateRest(style: TrainingStyle, restSeconds: number): boolean {
  const range = REST_RANGES[style];
  return restSeconds >= range.min && restSeconds <= range.max;
}
```

---

## 4. Inconsistent Reps Within Workouts

**Severity:** MEDIUM
**Occurrences:** 7
**Impact:** Confusing workout structure, unclear training stimulus

### Background

Within a single workout session, rep ranges should remain relatively consistent to maintain a coherent training stimulus. Variance of more than 3-4 reps between exercises suggests conflicting goals or poor programming structure.

### Violations Found

| Workout Scenario | Rep Range | Variance | Issue |
|------------------|-----------|----------|-------|
| Full Body - Strength + Endurance | 5-20 | 15 reps | Contradictory stimuli |
| PPL - Strength + Bodybuilding (Push) | 5-12 | 7 reps | Moderate conflict |
| Upper/Lower - Strength + Endurance | 5-20 | 15 reps | Contradictory stimuli |
| Full Body - Hybrid (All styles) | 4-18 | 14 reps | No clear direction |
| Bro Split - Strength + Bodybuilding | 5-12 | 7 reps | Moderate conflict |
| PPL - Bodybuilding + Endurance | 8-20 | 12 reps | Significant conflict |
| Upper/Lower - HIT + Endurance | 6-18 | 12 reps | Contradictory stimuli |

### Example: Full Body Strength + Endurance

```
Exercise 1: Barbell Deadlift - 4x5 (Strength)
Exercise 2: Leg Press - 3x8 (???)
Exercise 3: Dumbbell Lunges - 3x15 (Endurance)
Exercise 4: Calf Raises - 3x20 (Endurance)
Exercise 5: Plank - 3x60s (???)

Problem: Is this a strength workout or endurance workout?
The trainee gets neither optimal stimulus.
```

### Recommendation

For multi-style workouts, implement block programming:
```
BLOCK PROGRAMMING STRUCTURE:
When multiple training styles are specified:

Option A - Sequential Blocks:
- Complete all STRENGTH exercises first (3-6 reps)
- Then complete all BODYBUILDING exercises (8-12 reps)
- Finish with ENDURANCE exercises (15-25 reps)

Option B - Alternating by Muscle Group:
- Main lift: STRENGTH parameters
- Accessory lifts: BODYBUILDING parameters
- Finishers: ENDURANCE parameters

NEVER mix rep ranges randomly within a workout.
```

---

## 5. Training Style Parameter Reference

The following table defines the correct parameters for each training style. This should be embedded in the workout generation prompt.

### Definitive Parameter Matrix

| Training Style | Sets | Reps | Rest (seconds) | Intensity | Primary Adaptation |
|----------------|------|------|----------------|-----------|-------------------|
| **STRENGTH** | 3-5 | 3-6 | 180-300 | 85-100% 1RM | Neuromuscular efficiency |
| **BODYBUILDING** | 3-4 | 8-12 | 60-90 | 65-80% 1RM | Muscular hypertrophy |
| **ENDURANCE** | 2-3 | 15-25 | 30-60 | 40-60% 1RM | Muscular endurance |
| **HIT** | 1-2 | 6-10 | 120-300 | To failure | Maximal recruitment |

### Secondary Parameters

| Training Style | TUT (Time Under Tension) | Tempo | RIR (Reps in Reserve) |
|----------------|--------------------------|-------|----------------------|
| **STRENGTH** | 10-20s | Explosive concentric | 1-2 RIR |
| **BODYBUILDING** | 40-70s | 3-1-2-0 controlled | 1-3 RIR |
| **ENDURANCE** | 45-90s | 2-0-2-0 rhythmic | 2-4 RIR |
| **HIT** | 60-90s | 4-1-4-0 slow | 0 RIR (failure) |

### Constraint Priorities

When multiple styles conflict, apply this priority:
1. **HIT constraints override all** (never exceed 2 sets)
2. **Strength rest periods are non-negotiable** (minimum 180s)
3. **Endurance rest maximum enforced** (never exceed 60s)
4. **Rep ranges must match primary style** (no bodybuilding reps for strength)

---

## 6. Missing Tempo Notation

**Severity:** LOW (but affects quality)
**Occurrences:** 100% of bodybuilding workouts
**Impact:** Suboptimal hypertrophy stimulus, inconsistent execution

### Background

Tempo notation (e.g., "3-1-2-0") specifies the duration of each phase of a repetition:
- First number: Eccentric (lowering) phase
- Second number: Pause at stretched position
- Third number: Concentric (lifting) phase
- Fourth number: Pause at contracted position

For bodybuilding, controlled tempo is essential for maximizing time under tension and muscle damage.

### Current State

**All generated workouts:**
```json
{
  "exercise": "Dumbbell Bench Press",
  "sets": 4,
  "reps": 10,
  "rest": 90
  // No tempo specified
}
```

**Expected output:**
```json
{
  "exercise": "Dumbbell Bench Press",
  "sets": 4,
  "reps": 10,
  "rest": 90,
  "tempo": "3-1-1-0"
}
```

### Recommended Tempo by Training Style

| Style | Tempo | Rationale |
|-------|-------|-----------|
| Strength | 1-0-X-0 | Explosive concentric, minimal eccentric emphasis |
| Bodybuilding | 3-1-1-0 | Controlled eccentric for muscle damage |
| Endurance | 2-0-2-0 | Rhythmic, sustainable pace |
| HIT | 4-1-4-0 | Super slow for maximum TUT |

*Note: "X" denotes explosive/as fast as possible*

### Recommendation

Add tempo field to workout schema and include style-appropriate defaults:
```typescript
interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  tempo?: string; // Format: "E-P-C-P"
}
```

---

## Summary of Required Prompt Changes

### Critical Additions

1. **HIT Set Cap:**
   ```
   CRITICAL: HIT training style MUST have 1-2 sets per exercise MAXIMUM.
   Exceeding 2 sets is a validation failure.
   ```

2. **Strength Rep Range:**
   ```
   STRENGTH style: 3-6 reps ONLY. Reps > 6 = not strength training.
   ```

3. **Rest Period Bounds:**
   ```
   Rest periods are NON-NEGOTIABLE:
   - Strength: 180-300s (never less than 3 minutes)
   - Endurance: 30-60s (never more than 1 minute)
   - HIT: 120-300s (minimum 2 minutes for neuromuscular recovery)
   ```

### Schema Validation

Implement post-generation validation:
```typescript
function validateWorkout(workout: Workout, style: TrainingStyle): ValidationResult {
  const errors: string[] = [];

  for (const exercise of workout.exercises) {
    // HIT set cap
    if (style === 'hit' && exercise.sets > 2) {
      errors.push(`HIT violation: ${exercise.name} has ${exercise.sets} sets (max 2)`);
    }

    // Strength rep range
    if (style === 'strength' && exercise.reps > 6) {
      errors.push(`Strength violation: ${exercise.name} has ${exercise.reps} reps (max 6)`);
    }

    // Rest period bounds
    const restRange = REST_RANGES[style];
    if (exercise.rest < restRange.min || exercise.rest > restRange.max) {
      errors.push(`Rest violation: ${exercise.name} rest ${exercise.rest}s outside ${restRange.min}-${restRange.max}s`);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

## Appendix: Benchmark Test Cases

The following test scenarios should be added to validate parameter compliance:

```typescript
describe('Programming Parameter Validation', () => {
  describe('HIT Set Cap', () => {
    it('should never exceed 2 sets for HIT workouts', async () => {
      const workout = await generateWorkout({ style: 'hit', split: 'full-body' });
      for (const exercise of workout.exercises) {
        expect(exercise.sets).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Strength Rep Range', () => {
    it('should use 3-6 reps for strength workouts', async () => {
      const workout = await generateWorkout({ style: 'strength', split: 'upper-lower' });
      for (const exercise of workout.exercises) {
        expect(exercise.reps).toBeGreaterThanOrEqual(3);
        expect(exercise.reps).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('Rest Periods', () => {
    it('should use 180-300s rest for strength', async () => {
      const workout = await generateWorkout({ style: 'strength' });
      for (const exercise of workout.exercises) {
        expect(exercise.rest).toBeGreaterThanOrEqual(180);
        expect(exercise.rest).toBeLessThanOrEqual(300);
      }
    });

    it('should use 30-60s rest for endurance', async () => {
      const workout = await generateWorkout({ style: 'endurance' });
      for (const exercise of workout.exercises) {
        expect(exercise.rest).toBeGreaterThanOrEqual(30);
        expect(exercise.rest).toBeLessThanOrEqual(60);
      }
    });
  });
});
```

---

*Document generated from benchmark analysis of workout generation system.*
