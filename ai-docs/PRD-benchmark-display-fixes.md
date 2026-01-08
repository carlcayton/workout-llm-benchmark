# PRD: Benchmark Display Fixes

**Date:** 2026-01-07
**Status:** Draft
**Priority:** High
**Owner:** Carl Cayton

---

## Problem Statement

The LLM Benchmark dashboard at `localhost:5173/benchmark` displays exercise IDs instead of proper names for some exercises. For example, users see "Exercise 0576" instead of "lever chest press".

### Current Behavior
- Some models (notably Gemini 3 Flash, Grok 4.1) show many exercises as "Exercise XXXX"
- Other models (Claude, GPT) show a mix of proper names and ID placeholders
- The issue is inconsistent - same exercise ID shows correctly for one model but not another

### Root Cause
**File:** `benchmark-combiner.mjs` line 271

```javascript
// Current (BUG):
name: getExerciseName(e.id, exerciseNames),

// The raw model files ALREADY have correct names (e.name)
// But the combiner OVERWRITES them with a Supabase lookup
// If the Supabase fetch fails/times out, all lookups return "Exercise {id}"
```

The combiner ignores the `e.name` field from source data and always does a fresh lookup.

---

## Requirements

### R1: Preserve Existing Exercise Names (Critical)
**Priority:** P0

The benchmark combiner MUST preserve exercise names that already exist in the source data.

**Acceptance Criteria:**
- [ ] If `e.name` exists and is not a placeholder, use it directly
- [ ] Only fall back to Supabase lookup if `e.name` is missing/null/undefined
- [ ] Only fall back to "Exercise {id}" if both source and lookup fail

**Implementation:**
```javascript
// Fix at benchmark-combiner.mjs:271
const isPlaceholderName = (name) =>
  !name || name.startsWith('Exercise ') && /^Exercise \d{4}$/.test(name);

name: isPlaceholderName(e.name)
  ? getExerciseName(e.id, exerciseNames)
  : e.name,
```

### R2: Improve Supabase Fetch Resilience (High)
**Priority:** P1

The Supabase exercise name fetch should be more resilient.

**Acceptance Criteria:**
- [ ] Add retry logic (3 attempts with exponential backoff)
- [ ] Log warning if fetch returns fewer than 1000 exercises
- [ ] Cache exercise names locally after successful fetch
- [ ] Use cached names if fresh fetch fails

**Implementation:**
```javascript
async function fetchExerciseNames(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(...);
      if (!response.ok) throw new Error(response.statusText);

      const exercises = await response.json();
      if (exercises.length < 1000) {
        console.warn(`Warning: Only ${exercises.length} exercises fetched (expected ~1300)`);
      }
      return buildNameMap(exercises);
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }
}
```

### R3: Re-run Combiner to Fix Existing Data (High)
**Priority:** P1

Re-combine existing model files to fix the corrupted `public/benchmark-data.json`.

**Acceptance Criteria:**
- [ ] Run `node benchmark-combiner.mjs` after applying R1 fix
- [ ] Verify all exercises have proper names in output
- [ ] Copy updated JSON to `public/benchmark-data.json`
- [ ] Verify dashboard displays all names correctly

### R4: Add Validation to Combiner Output (Medium)
**Priority:** P2

The combiner should validate that exercise names are resolved.

**Acceptance Criteria:**
- [ ] After combining, count exercises with placeholder names
- [ ] Log warning if any placeholders remain
- [ ] Include placeholder count in output metadata

**Implementation:**
```javascript
// After combining scenarios
const placeholderCount = combined.scenarios
  .flatMap(s => s.results)
  .flatMap(r => r.exercises || [])
  .filter(e => e.name.startsWith('Exercise '))
  .length;

if (placeholderCount > 0) {
  console.warn(`Warning: ${placeholderCount} exercises still have placeholder names`);
}

combined.metadata.placeholderExerciseCount = placeholderCount;
```

---

## Display Requirements (Reference)

The benchmark dashboard MUST display:

| Field | Source | Location |
|-------|--------|----------|
| Split type | `scenario.split` | Filter chips + scenario card |
| Duration | `scenario.duration` | Filter chips + badge |
| Training styles (blends) | `scenario.trainingStyles[]` | Badges |
| Equipment | `scenario.equipment[]` | Equipment pills |
| All 6 models | `scenario.results[]` | Grid cards |
| Exercise name | `result.exercises[].name` | Exercise list |
| Exercise GIF | `result.exercises[].gifUrl` | Thumbnail |
| Sets/Reps/Rest | `result.exercises[].sets/reps/restSeconds` | Exercise details |

### Models Expected (6)
1. Claude 4.5 Haiku (fast)
2. Claude Sonnet 4.5 (premium)
3. Gemini 3 Flash (fast)
4. Gemini 3 Pro (premium)
5. GPT-5.2 (premium)
6. Grok 4.1 (fast)

---

## Test Cases

### TC1: Exercise Name Preservation
```
GIVEN a model result file with exercises containing proper names
WHEN the benchmark combiner runs
THEN the combined output preserves those names unchanged
```

### TC2: Placeholder Name Fallback
```
GIVEN a model result file with exercises missing the name field
WHEN the benchmark combiner runs
THEN it looks up the name from Supabase
AND uses "Exercise {id}" only if lookup fails
```

### TC3: Supabase Fetch Failure Recovery
```
GIVEN the Supabase fetch fails on first attempt
WHEN the combiner retries
THEN it succeeds on subsequent attempts
AND all exercise names are resolved
```

### TC4: No Placeholder Names in Final Output
```
GIVEN the fix is applied and combiner is re-run
WHEN viewing the benchmark dashboard
THEN ALL exercises show proper names (e.g., "lever chest press")
AND NO exercises show "Exercise XXXX" format
```

### TC5: All 6 Models Present
```
GIVEN a complete benchmark run
WHEN viewing any scenario on the dashboard
THEN all 6 model cards are visible
AND each shows exercise details with proper names
```

---

## Implementation Plan

1. **Fix combiner** (10 min)
   - Edit `benchmark-combiner.mjs` line 271
   - Add `isPlaceholderName()` helper

2. **Re-run combiner** (2 min)
   - `node benchmark-combiner.mjs`
   - Copy output to `public/benchmark-data.json`

3. **Verify fix** (5 min)
   - Refresh dashboard
   - Check Gemini 3 Flash exercises
   - Confirm all show proper names

4. **Add resilience** (optional, 15 min)
   - Add retry logic to `fetchExerciseNames()`
   - Add validation logging

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Exercises with placeholder names | ~40% | 0% |
| Models displayed per scenario | 6 | 6 |
| Exercise name resolution rate | ~60% | 100% |

---

## References

- **Bug location:** `showcase/benchmark-combiner.mjs:271`
- **Dashboard component:** `showcase/src/components/benchmark/LLMBenchmark.jsx`
- **Data file:** `showcase/public/benchmark-data.json`
- **Supabase exercises table:** `ivfllbccljoyaayftecd.exercises`
