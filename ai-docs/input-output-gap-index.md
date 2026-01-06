# Workout Generation: Input-Output Gap Analysis Index

**Document Type:** Master Index
**Analysis Date:** January 2026
**Status:** Active - Findings require implementation

---

## Overview

Comprehensive analysis of workout generation quality across 28 benchmark scenarios tested with 6 AI models per scenario. This index provides a prioritized view of all gaps between user input constraints and generated workout outputs.

| Metric | Value |
|--------|-------|
| Total Benchmark Scenarios | 28 |
| Models Tested Per Scenario | 6 |
| Major Gap Categories | 4 |
| Overall Input Constraint Compliance | 79% |

The 21% non-compliance represents systematic failures that affect user trust, workout effectiveness, and training safety. This document links to detailed analyses of each gap category.

---

## Priority Matrix

| Priority | Gap Category | Impact | Status | Report Link |
|----------|--------------|--------|--------|-------------|
| P0 | Duration Constraints | 6 scenarios 50-100% over time | Open | [Duration Report](./input-output-gap-duration-constraints.md) |
| P0 | Training Style Params | HIT methodology broken | Open | [Style Params Report](./input-output-gap-training-style-params.md) |
| ~~P1~~ | ~~Muscle Targeting~~ | ~~Wrong muscles on Bro Split~~ | ✅ **RESOLVED** | [Muscle Targeting Report](./input-output-gap-muscle-targeting.md) |
| P1 | Equipment Mapping | 100% metric is misleading | Open | [Equipment Report](./input-output-gap-equipment-mapping.md) |

> **Note:** Muscle Targeting was a benchmark configuration error, not an edge function bug. Fixed Jan 1, 2026.

### Priority Definitions

- **P0 (Critical):** Renders workout unusable or violates core training methodology
- **P1 (High):** Reduces workout effectiveness but workout is still usable
- **P2 (Medium):** Quality degradation, user experience impact
- **P3 (Low):** Minor issues, polish items

---

## Quick Stats

### Duration Violations
- **Affected Scenarios:** 6 (all STRENGTH workouts)
- **Worst Case:** PPL Strength + Bodybuilding (Push) - 168 min generated for 75 min slot (+93 min)
- **Common Pattern:** 60 min slot with 5x6 @ 180s rest = 133 min minimum
- **Root Cause:** Exercise count ignores duration input completely

### HIT Set Cap Violations
- **Occurrences:** 20+ exercises across 4 scenarios
- **Violation Type:** 4 sets generated when maximum 2 allowed
- **Affected Scenarios:** Full Body HIT, Upper/Lower HIT, PPL HIT, Bro Split HIT
- **Root Cause:** Default bodybuilding volume applied instead of HIT constraints

### Muscle Mismatches ✅ RESOLVED
- **Status:** Fixed - Benchmark configuration error, not edge function bug
- **Actual Root Cause:** Benchmark was sending wrong `targetMuscles` and missing `splitDayType` field
- **Fix:** Updated `benchmark-shared.mjs` with correct Bro Split configuration
- **Edge Function:** `muscle-filter.ts` was already correctly implemented

### Equipment Ignored
- **User-Specified Items Never Used:** 4+ per scenario average
- **Worst Cases:** Upper/Lower HIT ignores all 3 upper body machines
- **False Positive Risk:** 100% equipment match metric masks selection issues
- **Root Cause:** Equipment name mapping between user-friendly and ExerciseDB formats

---

## Root Cause Summary

| System Location | What's Ignored | Affected Reports |
|-----------------|----------------|------------------|
| Exercise count logic | Duration input | Duration |
| Rest assignment | Duration fit-check | Duration, Style Params |
| Mixed style resolution | Per-exercise rest | Style Params |
| HIT handling | 2-set maximum | Style Params |
| ~~Day focus filtering~~ | ~~Primary muscle only~~ | ~~Muscle Targeting~~ ✅ |
| ~~Split day context~~ | ~~Muscle group ownership~~ | ~~Muscle Targeting~~ ✅ |
| Equipment matching | User-friendly names | Equipment Mapping |
| Equipment scoring | Utilization tracking | Equipment Mapping |

### Cross-Cutting Issues

1. **No Duration Awareness:** System selects exercises and sets without calculating total time
2. **Style Constraints Not Enforced:** Training style parameters (HIT, Strength, Endurance) are suggestions, not constraints
3. ~~**Split Context Lost:** Bro Split day assignments not respected when filtering exercises~~ ✅ **RESOLVED** - Was benchmark config issue
4. **Equipment Mapping Gap:** User equipment names don't map cleanly to exercise database equipment tags

---

## Implementation Order

Prioritized by impact and implementation complexity:

### Phase 1: Quick Wins (Week 1)

1. **Fix HIT 2-set cap**
   - Add hard validation: `if (style === 'hit' && sets > 2) reject()`
   - Critical methodology fix, simple implementation
   - Affected file: `/fitness-app/supabase/functions/generate-workout/index.ts`

2. **Add strength rest validation**
   - Enforce minimum 180s rest for strength style
   - Prevents 90s rest on strength workouts
   - Affected file: Same as above

### Phase 2: Core Fixes (Week 2-3)

3. **Implement duration-aware exercise count**
   - Calculate total time before generating: `sets * exercises * (work_time + rest_time)`
   - Cap exercise count to fit duration input
   - Add 10-15% buffer for transitions

4. **Implement per-exercise rest for mixed styles**
   - When multiple styles specified (e.g., Strength + Bodybuilding)
   - Lead exercises get Strength rest (180s)
   - Accessory exercises get Bodybuilding rest (90s)

### Phase 3: Accuracy Improvements (Week 4-5)

5. ~~**Add split-aware muscle filtering**~~ ✅ **ALREADY DONE**
   - Edge function `muscle-filter.ts` already implements correct split-aware filtering
   - Benchmark configuration was fixed to properly wire `splitDayType` field
   - No additional code changes needed

6. **Improve equipment name mapping**
   - Reconcile user-friendly names (e.g., "Dumbbells") with ExerciseDB names (e.g., "dumbbell")
   - Add equipment utilization scoring
   - Target: 70% of available equipment used per workout

---

## Links to Related Files

### Benchmark Data
- **Raw Data:** `/showcase/public/benchmark-data.json`
- **Data Size:** 346KB covering all 28 scenarios

### Previous Analysis Documents
- **Exercise Selection:** `/showcase/ai-docs/benchmark-gaps-exercise-selection.md`
- **Programming Parameters:** `/showcase/ai-docs/benchmark-gaps-programming-parameters.md`
- **Structure & Volume:** `/showcase/ai-docs/benchmark-gaps-structure-volume.md`

### Implementation Targets
- **Edge Function:** `/fitness-app/supabase/functions/generate-workout/`
- **Shared Equipment Module:** `/fitness-app/supabase/functions/_shared/equipment.ts`
- **Frontend Equipment Mapping:** `/fitness-app/src/constants/equipment.ts`

---

## Validation Checklist

After implementing fixes, verify with these test cases:

### Duration Constraints
- [ ] 60-min Strength workout generates in under 70 min estimated time
- [ ] All strength workouts use 180-300s rest periods
- [ ] Exercise count scales down for shorter durations

### HIT Training Style
- [ ] No HIT workout has any exercise with more than 2 sets
- [ ] HIT rest periods are 120-300s (not 60-90s bodybuilding rest)
- [ ] HIT total volume is 10-15 sets (not 6 sets or 25 sets)

### Muscle Targeting ✅ (Already implemented in edge function)
- [x] Bro Split Back day has 0 bicep isolation exercises
- [x] Bro Split Chest day has 0 tricep isolation exercises
- [x] Bro Split Arms day has balanced bicep:tricep ratio (max 2:1)

### Equipment Mapping
- [ ] All user-specified equipment appears in at least one exercise
- [ ] Equipment utilization score >= 70% of available equipment
- [ ] No exercises using equipment not in user's list (e.g., no Smith Machine if not specified)

### Regression Tests
- [ ] Existing passing scenarios still pass
- [ ] No new constraint violations introduced
- [ ] Average workout quality score maintained or improved

---

## Appendix: Gap Category Definitions

### Duration Constraints
Workouts that exceed the user-specified time limit by more than 15%. Calculated using:
```
estimated_time = sum(exercise.sets * (work_time + exercise.rest)) + (exercises.length * transition_buffer)
violation = estimated_time > (scheduled_time * 1.15)
```

### Training Style Parameters
Violations of training style-specific constraints:
- HIT: Maximum 2 sets per exercise, 120-300s rest
- Strength: 3-6 reps, 180-300s rest, 85-100% 1RM
- Endurance: 15-25 reps, 30-60s rest, circuit format preferred

### Muscle Targeting
Exercises assigned to workout days that don't match the exercise's target muscle group. Particularly problematic in split programs (Bro Split, PPL) where each day has specific muscle group assignments.

### Equipment Mapping
Disconnect between user's available equipment and exercises selected:
- Equipment specified but never used
- Exercises requiring equipment not in user's list
- Poor utilization of specialized equipment (machines, cables)

---

*Master index for workout generation gap analysis. Links to 4 detailed category reports.*
*Last Updated: 2026-01-01*
