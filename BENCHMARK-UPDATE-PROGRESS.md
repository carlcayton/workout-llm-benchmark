# LLM Workout Benchmark v2 - Alignment with Spec

**Date:** 2025-12-26
**Status:** Complete
**Task:** Align benchmark evaluation with LLM guidance docs (`reqs/llm-guidance/`)

---

## Problem Statement

The benchmark (`scripts/benchmark-workout-llms-v2.mjs`) had drifted from the authoritative LLM guidance specifications. Key issues:

| Issue | Benchmark (Wrong) | Spec (Correct) |
|-------|-------------------|----------------|
| Training type naming | `high_intensity`, `endurance` | `high_intensity_hit`, `muscular_endurance` |
| HIT sets | 3-4 sets | **1-2 sets** (Mentzer/Yates methodology) |
| Power building | Standalone style | **Blend** of strength + bodybuilding |
| Muscular endurance structure | Linear exercises | **Circuit/tri-set structure** required |
| Blending logic | Not tested | 2-style combos should blend 50/50 |

---

## Source of Truth

**LLM Guidance Docs** (under `reqs/llm-guidance/`):
- `01-gemini-overview.md` - High-level training type overview
- `02-claude-overview.md` - Claude-specific implementation notes
- `03-gemini-dev-spec.md` - Detailed Gemini developer spec
- `04-claude-dev-spec.md` - Authoritative parameter definitions

Key spec from `04-claude-dev-spec.md`:
```json
{
  "classic_bodybuilding": { "rep_range": [8, 12], "rest_seconds": [60, 90], "sets": [3, 4] },
  "strength_focused": { "rep_range": [4, 6], "rest_seconds": [120, 240], "sets": [4, 5] },
  "high_intensity": { "rep_range": [6, 10], "rest_seconds": [120, 180], "sets": [1, 2] },
  "muscular_endurance": { "rep_range": [15, 20], "rest_seconds": [30, 45], "sets": [2, 3] }
}
```

---

## Changes Made

### 1. Training Style Parameters (`benchmark-style-params.mjs`)

**Removed:**
- `power_building` (it's a blend, not standalone)

**Updated:**
```javascript
high_intensity_hit: {
  sets: { min: 1, max: 2, ideal: 1 },  // Was 3-4
  reps: { min: 6, max: 10, ideal: 8 },
  rest: { min: 120, max: 180, ideal: 150 },
  techniques: ['slow_negatives', 'rest_pause', 'forced_reps', 'to_failure'],
  machinePreferred: true,  // NEW: HIT favors machines for safety at failure
}

muscular_endurance: {
  sets: { min: 2, max: 3, ideal: 3 },
  reps: { min: 15, max: 20, ideal: 18 },
  rest: { min: 30, max: 45, ideal: 38 },
  techniques: ['supersets', 'tri_sets', 'circuits', 'drop_sets'],
  circuitStructure: true,  // NEW: Must use circuits/tri-sets
  supersetExpected: true,
}
```

### 2. Blend Test Scenarios (`benchmark-scenarios.mjs`)

Added 8 blend scenarios testing 2-type combinations:
- Strength + Bodybuilding (Powerbuilding) - Upper/Lower
- Bodybuilding + Endurance - Full Body
- Strength + Endurance - Legs
- HIT + Bodybuilding - Back
- Bodybuilding + Strength - Push Day
- Endurance + Bodybuilding - Arms
- HIT + Endurance - Chest
- Strength + HIT - Shoulders

Each scenario includes:
```javascript
{
  trainingStyles: ['strength_focused', 'classic_bodybuilding'],
  blendExpectation: {
    compoundStyle: 'strength_focused',
    isolationStyle: 'classic_bodybuilding',
    compoundParams: { repRange: [4, 6], restSeconds: [120, 240], sets: [4, 5] },
    isolationParams: { repRange: [8, 12], restSeconds: [60, 90], sets: [3, 4] },
  },
  expectedTechniques: ['straight_sets'],
}
```

### 3. Circuit Structure Validation (`benchmark-advanced-techniques.mjs`)

**New functions:**
- `detectCircuitStructure(workout)` - Checks section grouping, rest patterns, naming
- `validateEnduranceStructure(workout)` - Scores 0-100 based on circuit quality

**Scoring:**
| Structure | Score |
|-----------|-------|
| Proper circuit + correct rest | 100 |
| Circuit but imperfect rest | 85 |
| Circuit naming only | 75 |
| Tri-sets (2+) | 90 |
| Linear with short rest (<30s) | 50 |
| Linear with long rest | 25 |

### 4. HIT Validation (`benchmark-advanced-techniques.mjs`)

**New functions:**
- `validateHITConstraints(workout, exercises)` - Enforces 1-2 sets max
- `detectHITTechniques(workout)` - Finds slow negatives, to-failure, machines
- `scoreHITCompliance(workout)` - 0-100 compliance score

**HIT Compliance Criteria:**
| Criteria | Weight | Detection |
|----------|--------|-----------|
| Low volume (1-2 sets avg) | 30% | Average sets per exercise |
| Slow negatives | 25% | Keywords in notes ("4 sec down", "eccentric") |
| Machine preference | 20% | % exercises using machines/cables |
| To-failure indicators | 25% | Keywords ("to failure", "muscular failure") |

### 5. Main Benchmark (`benchmark-workout-llms-v2.mjs`)

**New scoring functions:**
- `calculateHitComplianceScore()` - Only for `high_intensity_hit` style
- `calculateCircuitStructureScore()` - Only for `muscular_endurance` style
- `validateBlend()` - When 2 training styles selected

**Updated weight system:**
```javascript
const weights = {
  structure: 0.08,
  equipment: 0.22,
  style: 0.25,
  technique: 0.10,
  muscleBalance: 0.15,
  exerciseCount: 0.08,
  // Style-specific (only when applicable):
  hitCompliance: 0.12,
  circuitStructure: 0.12,
  blendBalance: 0.10,
};
```

**Enhanced prompts with style-specific instructions:**
```
CRITICAL HIT TRAINING RULES:
- Maximum 1-2 working sets per exercise (Mentzer/Yates methodology)
- Use slow negatives (4-6 seconds down) on every rep
- Train to complete muscular failure on each working set
- Prefer machines for failure sets (safer than free weights)

CRITICAL MUSCULAR ENDURANCE RULES:
- Structure workout as circuits or tri-sets
- 0 seconds rest between exercises within a circuit/tri-set
- 60-90 seconds rest between rounds/circuits
- 15-20+ reps per exercise
```

---

## Files Modified

| File | Changes |
|------|---------|
| `scripts/benchmark-style-params.mjs` | Updated training types, removed power_building |
| `scripts/benchmark-scenarios.mjs` | Added BLEND_TEST_SCENARIOS (8 scenarios) |
| `scripts/benchmark-advanced-techniques.mjs` | Added circuit/HIT validation functions |
| `scripts/benchmark-workout-llms-v2.mjs` | Integrated new scoring, enhanced prompts |

---

## How to Run

```bash
cd /home/arian/expo-work/fitness-app
npm run benchmark:llm:v2
```

**Output:**
- JSON results: `benchmark-results/workout-llm-benchmark-v2-{timestamp}.json`
- Markdown report: `benchmark-results/workout-llm-benchmark-v2-{timestamp}.md`

---

## Additional Fix: TEST_SCENARIOS Enhancement (2025-12-26)

Client feedback indicated that the TEST_SCENARIOS lacked expected parameter details for validation.

### Changes Made:

1. **Fixed TRAINING_STYLES** (was still using old names):
   ```javascript
   // Before (wrong)
   ['classic_bodybuilding', 'strength_focus', 'power_building', 'high_intensity', 'endurance']

   // After (correct, aligned with spec)
   ['classic_bodybuilding', 'strength_focused', 'high_intensity_hit', 'muscular_endurance']
   ```

2. **Added STYLE_EXPECTED_PARAMS** - Central source of truth for expected parameters:
   ```javascript
   export const STYLE_EXPECTED_PARAMS = {
     classic_bodybuilding: { sets: [3,4], reps: [8,12], rest: [60,90], techniques: [...] },
     strength_focused: { sets: [4,5], reps: [4,6], rest: [120,240], techniques: [...] },
     high_intensity_hit: { sets: [1,2], reps: [6,10], rest: [120,180], machinePreferred: true, ... },
     muscular_endurance: { sets: [2,3], reps: [15,20], rest: [30,45], circuitStructure: true, ... },
   };
   ```

3. **Added expectedParams to ALL 20 TEST_SCENARIOS**:
   ```javascript
   {
     name: 'Full Body - Beginner - Classic Bodybuilding',
     request: { ... },
     expectedParams: {
       sets: [3, 4],
       reps: [8, 12],
       rest: [60, 90],
       techniques: ['straight_sets', 'supersets_same_muscle'],
       supersetExpected: false,
     },
   }
   ```

4. **Fixed BLEND_TEST_SCENARIOS style names** to use correct spec names

5. **Updated generateScenario() helper** to automatically include expectedParams

### Summary:
| Metric | Before | After |
|--------|--------|-------|
| TEST_SCENARIOS with expectedParams | 0/20 | **20/20** |
| BLEND_SCENARIOS with expectations | 8/8 | 8/8 |
| Training styles aligned with spec | ❌ | ✅ |

---

## Next Steps (Optional)

1. **Run benchmark** and compare LLM performance on new scenarios
2. **Tune scoring weights** based on results
3. **Add more blend scenarios** if needed
4. **Sync edge function** (`supabase/functions/generate-workout/`) with same spec

---

## Architecture Decision

> **Benchmark tests against SPEC, not edge function.**

Both the benchmark and edge function should align to the guidance docs independently. This:
- Reduces coupling between benchmark and production code
- Allows benchmark to catch edge function drift
- Makes the spec the single source of truth
