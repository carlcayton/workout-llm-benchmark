# Benchmark Refactor: Edge Function Integration

## Summary

Refactored the LLM benchmark to call the **production edge function** instead of making direct OpenRouter API calls. This tests the complete production stack rather than a simplified simulation.

## Changes Made

### 1. Edge Function (`generate-workout`)

Added `?model=<model-id>` query parameter support for benchmark testing.

**Files Modified:**

| File | Change |
|------|--------|
| `index.ts` | Extract model from URL params, pass to chain orchestrator |
| `phases/chain-orchestrator.ts` | Accept `modelOverride` param, pass to LLM calls |
| `phases/exercise-selector.ts` | Accept `modelOverride`, use in OpenRouter call |
| `phases/param-assigner.ts` | Accept `modelOverride`, use in OpenRouter call |
| `phases/meta-planner.ts` | Accept `modelOverride` (future-proofing, currently bypassed) |

**Usage:**
```bash
# Default (Claude Sonnet 4.5)
POST /generate-workout

# Benchmark with different model
POST /generate-workout?model=openai/gpt-4o
POST /generate-workout?model=x-ai/grok-3
```

**Comment in index.ts:**
```typescript
/**
 * Default LLM model for workout generation.
 *
 * IMPORTANT: The `model` URL query parameter is ONLY intended for benchmark testing.
 * Normal app usage should NOT pass this parameter - the default Claude Sonnet 4.5
 * is used for production workouts.
 */
const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";
```

### 2. Benchmark Script (`benchmark-single-model.mjs`)

Replaced direct OpenRouter calls with edge function calls.

**Before:**
- Called OpenRouter API directly
- Built prompts manually with `buildWorkoutPrompt()`
- Filtered exercises locally with `filterExercisesForScenario()`
- Parsed raw LLM JSON responses
- Required `OPENROUTER_API_KEY` env var

**After:**
- Calls production edge function via HTTP
- Edge function handles prompt building, exercise filtering, DB queries
- Receives enriched workout JSON (no parsing needed)
- Uses Supabase anon key for auth
- No API key needed

**New Usage:**
```bash
# No OPENROUTER_API_KEY needed
node benchmark-single-model.mjs anthropic/claude-sonnet-4.5
node benchmark-single-model.mjs openai/gpt-4o
```

### 3. Training Style Mappings

Added mapping functions to convert benchmark format to edge function format:

```javascript
// Training styles
'classic_bodybuilding' → 'BODYBUILD'
'strength_focused'     → 'STRENGTH'
'high_intensity_hit'   → 'HIT'
'muscular_endurance'   → 'ENDURANCE'

// Splits
'push_pull_legs' → 'ppl'
'arnold_split'   → 'arnold'
```

## Architecture Comparison

### Old Benchmark Flow
```
Benchmark Script
    ↓
filterExercisesForScenario()  (local mock exercises)
    ↓
buildWorkoutPrompt()          (local prompt builder)
    ↓
OpenRouter API                (single LLM call)
    ↓
Parse JSON response
    ↓
Calculate metrics
```

### New Benchmark Flow
```
Benchmark Script
    ↓
Edge Function (POST /generate-workout?model=X)
    ↓
    ├── Request validation (Zod)
    ├── Exercise DB query (Supabase)
    ├── 3-call LLM chain:
    │   ├── Meta-Planner (bypassed, deterministic)
    │   ├── Exercise Selector (LLM with retries)
    │   └── Param Assigner (LLM with retries)
    ├── Response enrichment (GIF URLs, metadata)
    ↓
Calculate metrics
```

## What This Tests

The refactored benchmark now tests the **complete production stack**:

1. Edge function request validation
2. Training style normalization (BODYBUILD, STRENGTH, HIT, ENDURANCE)
3. Exercise database filtering by equipment, body parts, difficulty
4. 3-call LLM chain orchestrator with retries and fallbacks
5. Response enrichment with exercise metadata and GIF URLs
6. All production error handling

## Deployment

```bash
# Deploy updated edge function
cd /home/arian/expo-work/fitness-app
SUPABASE_ACCESS_TOKEN=... npx supabase functions deploy generate-workout --project-ref ivfllbccljoyaayftecd
```

## Status

- [x] Edge function model parameter added
- [x] Chain orchestrator passes model through
- [x] All phase files updated (exercise-selector, param-assigner, meta-planner)
- [x] Benchmark refactored to call edge function
- [x] Training style/split mappings added
- [x] Edge function deployed
- [ ] Full benchmark run tested

## Files

**Edge Function:**
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/index.ts`
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/chain-orchestrator.ts`
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/exercise-selector.ts`
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/param-assigner.ts`
- `/home/arian/expo-work/fitness-app/supabase/functions/generate-workout/phases/meta-planner.ts`

**Benchmark:**
- `/home/arian/expo-work/showcase/benchmark-single-model.mjs`
