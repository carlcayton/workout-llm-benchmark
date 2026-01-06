# Input-Output Gap: Duration Constraints Completely Ignored

**Document Type:** Critical Bug Analysis
**Severity:** P0 - Critical
**Component:** `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/`
**Last Updated:** 2026-01-01
**Status:** Unresolved - Requires Immediate Architectural Fix

---

## Executive Summary

The workout generation system **completely ignores the user's requested duration** when planning workouts. The `duration` parameter is passed through the chain but is **never used to calculate or constrain exercise count, rest periods, or total volume**. This results in generated workouts that systematically exceed user-requested durations by 43-93 minutes (72-155% overrun).

### The Core Problem

```
User Request: "I have 60 minutes to work out"
System Output: "Here's a 133-minute workout"
```

The `duration` field flows through the system but is only used for:
1. Logging: `[META_PLANNER] Input: split=upper_lower, day=upper, duration=60min`
2. Cosmetic estimation: `estimatedDuration` is calculated AFTER the workout is built

**Duration is NEVER used to:**
- Adjust exercise count
- Modify rest periods to fit time budget
- Reduce sets per exercise
- Gate the workout structure

---

## Evidence Table: Duration Violations Across 6 Strength-Focused Scenarios

| Scenario | Input Duration | Estimated Output | Delta | % Overrun |
|----------|----------------|------------------|-------|-----------|
| Upper/Lower - Strength (Upper) | 60 min | 131-133 min | **+71-73 min** | 118-122% |
| Upper/Lower - Strength (Lower) | 60 min | 131-133 min | **+71-73 min** | 118-122% |
| Full Body - Strength | 90 min | 131-133 min | **+41-43 min** | 46-48% |
| Full Body - Strength (Kettlebell) | 60 min | 130-132 min | **+70-72 min** | 117-120% |
| PPL - Strength + Bodybuilding (Push) | 75 min | 127-168 min | **+52-93 min** | 69-124% |
| Full Body - Strength + Endurance | 90 min | 142-156 min | **+52-66 min** | 58-73% |

**Source:** Benchmark results from `/home/arian/expo-work/showcase/benchmark-results/combined-benchmark-2025-12-30T13-27-53-017Z.json`

### Detailed Breakdown by Model

#### Upper/Lower - Strength (Upper) - 60 min requested

| Model | Estimated Duration | Exercises | Total Sets |
|-------|-------------------|-----------|------------|
| Claude Haiku 4.5 | 131 min | 8 | 40 |
| Claude Sonnet 4.5 | 131 min | 8 | 40 |
| Gemini 3 Flash | 131 min | 8 | 40 |
| Gemini 3 Pro | 131 min | 8 | 40 |
| GPT-5.2 | 131 min | 8 | 40 |
| Grok 4.1 Fast | 131 min | 8 | 40 |

**Pattern:** All models produce identical structure because exercise count is determined deterministically in `meta-planner.ts`, not by the LLM.

---

## Root Cause Analysis

### 1. Meta-Planner Ignores Duration Constraint

**File:** `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/meta-planner.ts`

**Lines 137-145:**
```typescript
// Determine exercise count based on duration and style
let exerciseCount: number;
if (input.selectedStyles.includes("HIT")) {
  exerciseCount = Math.min(6, Math.max(3, Math.floor(input.duration / 10)));
} else if (input.selectedStyles.includes("ENDURANCE")) {
  exerciseCount = Math.min(9, Math.max(6, Math.floor(input.duration / 5)));
} else {
  exerciseCount = Math.min(8, Math.max(4, Math.floor(input.duration / 7)));
}
```

**The Broken Math:**

For a 60-minute STRENGTH workout:
```
exerciseCount = Math.min(8, Math.max(4, Math.floor(60 / 7)))
             = Math.min(8, Math.max(4, 8))
             = Math.min(8, 8)
             = 8 exercises
```

This formula produces the same 8 exercises for ANY duration between 56-90 minutes.

### 2. Fixed Sets/Reps Regardless of Duration

**File:** `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/types.ts`

**Lines 81-90 (STRENGTH style config):**
```typescript
STRENGTH: {
  id: "STRENGTH",
  userFriendlyName: "Strength Focused",
  sets: { min: 4, max: 5 },      // Always 4-5 sets
  reps: { min: 3, max: 6 },      // Always 3-6 reps
  restSeconds: { min: 180, max: 240 },  // Always 3-4 min rest
  tempo: "X-1-1",
  specialLogic: ["COMPOUND_PRIMARY"],
},
```

These parameters are applied uniformly regardless of the user's time constraint.

### 3. The Mathematical Impossibility

**STRENGTH workout time calculation:**

```
Time per exercise breakdown:
  - Work time per set = reps × rep_duration
                      = 5 reps × 4 seconds = 20 seconds
  - Rest time per set = 180 seconds (minimum for STRENGTH)
  - Total per set = 20s + 180s = 200 seconds
  - Sets per exercise = 5 (max for STRENGTH)
  - Time per exercise = 5 × 200s = 1000 seconds = 16.67 minutes

Total workout time:
  - Exercises = 8 (meta-planner output)
  - Total work time = 8 × 16.67 min = 133.3 minutes

Additional time (not counted):
  - Warmup: +5-10 min
  - Equipment transitions: +10-15 min
  - Bathroom breaks: +5 min
  - Actual realistic duration: ~160-170 minutes
```

**The minimum possible STRENGTH workout is 133 minutes.**

A 60-minute STRENGTH workout is mathematically impossible with:
- 8 exercises
- 5 sets per exercise
- 180-second rest periods

---

## Code Flow Trace

### Where Duration Enters the System

```
1. Client Request
   └─> WorkoutRequest.duration = 60

2. chain-orchestrator.ts:186-199
   └─> chainRequest.duration = request.duration (60)

3. chain-orchestrator.ts:206-217
   └─> metaPlannerInput.duration = chainRequest.duration (60)
   └─> Passed to createMetaPlan()

4. meta-planner.ts:131-145
   └─> Logs: "[META_PLANNER] Input: duration=60min"
   └─> exerciseCount = Math.floor(60 / 7) = 8
   └─> Duration NOT used to constrain sets/rest

5. param-assigner.ts (LLM Call)
   └─> Duration NOT passed to LLM prompt
   └─> LLM receives only style configs (sets.max=5, restSeconds.min=180)

6. chain-orchestrator.ts:756-763
   └─> calculateEstimatedDuration() runs AFTER workout is built
   └─> Returns 133 min (post-hoc calculation)

7. chain-orchestrator.ts:817-895
   └─> adjustRestTimesToFitDuration() attempts to fix
   └─> FAILS because rest floor (180s) prevents meaningful adjustment
```

### The "Fix" That Doesn't Fix

**File:** `chain-orchestrator.ts:817-895` - `adjustRestTimesToFitDuration()`

This function attempts to adjust rest times after the workout is generated, but:

```typescript
// Get rest bounds from style configs
const minRest = primaryConfig.restSeconds.min;  // 180s for STRENGTH
const maxRest = secondaryConfig
  ? Math.max(primaryConfig.restSeconds.max, secondaryConfig.restSeconds.max)
  : primaryConfig.restSeconds.max;

// Clamp target rest to style bounds
const adjustedRest = Math.max(minRest, Math.min(maxRest, targetRestPerPeriod));
```

**The Problem:** For STRENGTH training, `minRest = 180s`. Even if the target rest period calculates to 60s, the system clamps it back to 180s.

**Net effect:** This function cannot reduce workout duration for STRENGTH workouts because it respects the 180-second minimum rest.

---

## Recommended Fix: Duration-Aware Exercise Count

### Approach 1: Calculate Exercise Count From Duration

**Location:** `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/meta-planner.ts`

**Replace Lines 137-145 with:**

```typescript
/**
 * Calculate maximum exercises that fit within the time budget.
 *
 * Formula:
 *   available_workout_time = duration - warmup_buffer - transition_buffer
 *   time_per_exercise = (sets × (work_time_per_set + rest_time)) + transition_time
 *   max_exercises = floor(available_workout_time / time_per_exercise)
 */
function calculateExerciseCountFromDuration(
  duration: number,
  style: TrainingStyleId
): number {
  const styleConfigs: Record<TrainingStyleId, {
    avgSets: number;
    avgReps: number;
    repDuration: number;  // seconds
    restSeconds: number;  // average rest
  }> = {
    STRENGTH: { avgSets: 5, avgReps: 5, repDuration: 4, restSeconds: 180 },
    BODYBUILD: { avgSets: 4, avgReps: 10, repDuration: 3, restSeconds: 75 },
    HIT: { avgSets: 1.5, avgReps: 8, repDuration: 10, restSeconds: 180 },
    ENDURANCE: { avgSets: 3, avgReps: 20, repDuration: 2, restSeconds: 45 },
    AI_AUTO: { avgSets: 4, avgReps: 10, repDuration: 3, restSeconds: 75 },
  };

  const config = styleConfigs[style] || styleConfigs.AI_AUTO;

  const WARMUP_BUFFER = 5;  // minutes
  const TRANSITION_TIME = 1;  // minutes between exercises

  const workTimePerSet = (config.avgReps * config.repDuration) / 60;  // minutes
  const restTimePerSet = config.restSeconds / 60;  // minutes
  const timePerExercise = config.avgSets * (workTimePerSet + restTimePerSet) + TRANSITION_TIME;

  const availableTime = duration - WARMUP_BUFFER;
  const maxExercises = Math.floor(availableTime / timePerExercise);

  // Apply reasonable bounds per style
  const bounds: Record<TrainingStyleId, { min: number; max: number }> = {
    STRENGTH: { min: 3, max: 6 },
    BODYBUILD: { min: 5, max: 10 },
    HIT: { min: 4, max: 8 },
    ENDURANCE: { min: 6, max: 12 },
    AI_AUTO: { min: 4, max: 8 },
  };

  const { min, max } = bounds[style] || bounds.AI_AUTO;
  return Math.min(max, Math.max(min, maxExercises));
}

// Usage in createMetaPlan():
const exerciseCount = calculateExerciseCountFromDuration(
  input.duration,
  input.selectedStyles[0]
);
```

**Result for 60-minute STRENGTH workout:**

```
availableTime = 60 - 5 = 55 minutes
timePerExercise = 5 × ((5 × 4 / 60) + (180 / 60)) + 1
                = 5 × (0.33 + 3.0) + 1
                = 5 × 3.33 + 1
                = 17.67 minutes

maxExercises = floor(55 / 17.67) = 3 exercises

Final exerciseCount = Math.min(6, Math.max(3, 3)) = 3 exercises
```

**New workout duration:** 3 exercises × 17.67 = 53 minutes (within budget)

### Approach 2: Dynamic Rest Time Adjustment

If the user wants more exercises than time permits, offer rest time reduction:

```typescript
interface DurationOptions {
  exercises: number;
  restSeconds: number;
  estimatedDuration: number;
  tradeoff: string;
}

function calculateDurationOptions(
  targetDuration: number,
  style: TrainingStyleId
): DurationOptions[] {
  const options: DurationOptions[] = [];

  // Option 1: Optimal rest, fewer exercises
  const optimalExercises = calculateExerciseCountFromDuration(targetDuration, style);
  options.push({
    exercises: optimalExercises,
    restSeconds: TRAINING_STYLES[style].restSeconds.min,
    estimatedDuration: calculateDuration(optimalExercises, style, TRAINING_STYLES[style].restSeconds.min),
    tradeoff: "Optimal recovery, standard volume"
  });

  // Option 2: Reduced rest, more exercises (if style permits)
  if (style !== "HIT") {  // HIT requires full rest
    const reducedRest = Math.max(90, TRAINING_STYLES[style].restSeconds.min - 60);
    const moreExercises = optimalExercises + 1;
    options.push({
      exercises: moreExercises,
      restSeconds: reducedRest,
      estimatedDuration: calculateDuration(moreExercises, style, reducedRest),
      tradeoff: "Higher volume, reduced recovery"
    });
  }

  return options;
}
```

---

## Validation Test Cases

### Unit Tests for Duration Constraint

**File:** `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/__tests__/duration-constraints.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { createMetaPlan, MetaPlannerInput } from "../phases/meta-planner";
import { calculateEstimatedDuration } from "../phases/chain-orchestrator";
import { TRAINING_STYLES } from "../types";

describe("Duration Constraints", () => {
  describe("Exercise Count Respects Duration", () => {
    it.each([
      { duration: 30, style: "STRENGTH", expectedMax: 2 },
      { duration: 45, style: "STRENGTH", expectedMax: 3 },
      { duration: 60, style: "STRENGTH", expectedMax: 4 },
      { duration: 90, style: "STRENGTH", expectedMax: 5 },
      { duration: 60, style: "BODYBUILD", expectedMax: 7 },
      { duration: 45, style: "HIT", expectedMax: 6 },
      { duration: 30, style: "ENDURANCE", expectedMax: 8 },
    ])(
      "$duration-minute $style workout should have max $expectedMax exercises",
      ({ duration, style, expectedMax }) => {
        const input: MetaPlannerInput = {
          goal: "build strength",
          experienceLevel: 5,
          trainingDays: 4,
          workoutSplit: "upper_lower",
          splitDayType: "upper",
          duration,
          equipment: ["barbell", "dumbbell"],
          selectedStyles: [style as TrainingStyleId],
        };

        const plan = createMetaPlan(input);
        expect(plan.exerciseCount).toBeLessThanOrEqual(expectedMax);
      }
    );
  });

  describe("Estimated Duration Within Tolerance", () => {
    const TOLERANCE_PERCENT = 15; // Allow 15% variance

    it.each([
      { duration: 60, style: "STRENGTH" },
      { duration: 45, style: "BODYBUILD" },
      { duration: 30, style: "HIT" },
      { duration: 45, style: "ENDURANCE" },
    ])(
      "$duration-minute $style workout should estimate within $TOLERANCE_PERCENT% of target",
      ({ duration, style }) => {
        const input: MetaPlannerInput = {
          goal: "fitness",
          experienceLevel: 5,
          trainingDays: 4,
          workoutSplit: "full_body",
          splitDayType: "full_body",
          duration,
          equipment: ["barbell", "dumbbell"],
          selectedStyles: [style as TrainingStyleId],
        };

        const plan = createMetaPlan(input);

        // Mock sections for duration calculation
        const styleConfig = TRAINING_STYLES[style as TrainingStyleId];
        const mockSections = [{
          name: "Main",
          exercises: Array(plan.exerciseCount).fill({
            sets: styleConfig.sets.max,
            restSeconds: styleConfig.restSeconds.min,
          }),
        }];

        const estimated = calculateEstimatedDuration(mockSections);
        const variance = Math.abs(estimated - duration) / duration;

        expect(variance).toBeLessThan(TOLERANCE_PERCENT / 100);
      }
    );
  });

  describe("STRENGTH Style Duration Bounds", () => {
    it("should NEVER produce 8 exercises for 60-minute STRENGTH workout", () => {
      const input: MetaPlannerInput = {
        goal: "strength",
        experienceLevel: 7,
        trainingDays: 4,
        workoutSplit: "upper_lower",
        splitDayType: "upper",
        duration: 60,
        equipment: ["barbell", "dumbbell"],
        selectedStyles: ["STRENGTH"],
      };

      const plan = createMetaPlan(input);

      // 8 exercises at STRENGTH parameters = 133+ minutes
      // This should NEVER happen for a 60-minute request
      expect(plan.exerciseCount).toBeLessThan(8);
      expect(plan.exerciseCount).toBeLessThanOrEqual(4);
    });

    it("should require 90+ minutes for 6+ STRENGTH exercises", () => {
      // Time calculation: 6 exercises × 17 min/exercise = 102 min
      const shortInput: MetaPlannerInput = {
        goal: "strength",
        experienceLevel: 7,
        trainingDays: 4,
        workoutSplit: "full_body",
        splitDayType: "full_body",
        duration: 60, // Too short for 6 exercises
        equipment: ["barbell", "dumbbell"],
        selectedStyles: ["STRENGTH"],
      };

      const longInput = { ...shortInput, duration: 90 };

      const shortPlan = createMetaPlan(shortInput);
      const longPlan = createMetaPlan(longInput);

      expect(shortPlan.exerciseCount).toBeLessThan(6);
      expect(longPlan.exerciseCount).toBeGreaterThanOrEqual(5);
    });
  });
});
```

### Integration Test for End-to-End Duration

```typescript
import { describe, it, expect } from "vitest";
import { generateWorkoutWithChain } from "../phases/chain-orchestrator";

describe("End-to-End Duration Compliance", () => {
  it("generated workout duration should not exceed input + 15%", async () => {
    const targetDuration = 60;
    const request = {
      equipment: ["barbell", "dumbbell"],
      bodyParts: ["chest", "back", "shoulders"],
      duration: targetDuration,
      experienceLevel: 5,
      goal: "strength",
      workoutSplit: "upper_lower",
      splitDayType: "upper",
      selectedStyles: ["STRENGTH" as const],
    };

    const mockExercises = [/* ... filtered exercises ... */];

    const result = await generateWorkoutWithChain(request, mockExercises, []);

    const maxAllowed = targetDuration * 1.15;
    expect(result.workout.estimatedDuration).toBeLessThanOrEqual(maxAllowed);
  });
});
```

---

## Impact Assessment

### User Experience Impact

| Issue | User Impact | Frequency |
|-------|-------------|-----------|
| Workout exceeds lunch break | User can't complete workout | Every STRENGTH workout <90 min |
| Unrealistic expectations | User feels like failure | Every affected workout |
| Trust erosion | Users abandon app | Cumulative effect |

### Business Impact

- **Retention risk:** Users who can't complete workouts in their time window will churn
- **Review impact:** "App gives unrealistic workout times" reviews
- **Competitive disadvantage:** Competitors with proper duration handling win users

---

## Action Items

### Immediate (P0)

1. [ ] Implement `calculateExerciseCountFromDuration()` in `meta-planner.ts`
2. [ ] Add unit tests for duration constraints
3. [ ] Remove or fix the ineffective `adjustRestTimesToFitDuration()` function

### Short-term (P1)

4. [ ] Add user-facing warning when requested duration is too short for style
5. [ ] Implement "suggest shorter workout" option for time-constrained users
6. [ ] Create duration presets per training style in UI

### Validation

7. [ ] Re-run benchmark suite with fixed code
8. [ ] Verify all scenarios produce workouts within 15% of requested duration
9. [ ] Monitor production metrics for duration compliance

---

## Appendix: Benchmark Scenario Details

### Scenario Definitions (from `benchmark-shared.mjs`)

```javascript
// Upper/Lower - Strength (Upper)
{
  name: 'Upper/Lower - Strength (Upper)',
  split: 'upper_lower',
  dayFocus: 'Upper',
  request: {
    equipment: ['barbell', 'dumbbell', 'cable'],
    trainingStyles: ['strength_focused'],
    bodyParts: ['chest', 'back', 'shoulders'],
    targetMuscles: ['pectorals', 'lats', 'delts'],
    duration: 60,  // <-- REQUEST
    experienceLevel: 'advanced',
  },
  expectations: {
    minExercises: 4,
    maxExercises: 6,
    setsRange: [4, 5],
    repsRange: [4, 6],
    restRange: [120, 240],
  },
}

// Upper/Lower - Strength (Lower)
{
  name: 'Upper/Lower - Strength (Lower)',
  request: {
    duration: 60,  // <-- REQUEST
    // ... same pattern
  },
}

// Full Body - Strength
{
  name: 'Full Body - Strength',
  request: {
    duration: 90,  // <-- REQUEST
    // ...
  },
}

// Full Body - Strength (Kettlebell)
{
  name: 'Full Body - Strength (Kettlebell)',
  request: {
    duration: 60,  // <-- REQUEST
    // ...
  },
}

// PPL - Strength + Bodybuilding (Push)
{
  name: 'PPL - Strength + Bodybuilding (Push)',
  request: {
    duration: 75,  // <-- REQUEST
    // ...
  },
}

// Full Body - Strength + Endurance
{
  name: 'Full Body - Strength + Endurance',
  request: {
    duration: 90,  // <-- REQUEST
    // ...
  },
}
```

---

*Document generated from analysis of workout generation code and benchmark results. All duration values sourced from actual benchmark output files.*
