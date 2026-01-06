# Benchmark Migration Progress

**Goal**: All benchmark code lives in `showcase/`, `fitness-app/` is React Native only

**Status**: In Progress (January 6, 2026)

---

## Files Being Moved

### From `fitness-app/scripts/` → `showcase/`

| File | Status | Purpose |
|------|--------|---------|
| `benchmark-quick.mjs` | **NEEDS MOVE** | Quick single-model testing (5-7 scenarios) |
| `benchmark-combine.mjs` | **NEEDS MOVE** | Combines multi-model JSON results for UI dashboard |
| `benchmark-scenarios.mjs` | **NEEDS MOVE** | Scenario definitions (26 scenarios) |
| `benchmark-mock-exercises.mjs` | **NEEDS MOVE** | Mock exercise database for testing |
| `benchmark-style-params.mjs` | **NEEDS MOVE** | Expected params by training style |
| `benchmark-variety-test.mjs` | **NEEDS MOVE** | Tests exercise variety across models |
| `benchmark-advanced-techniques.mjs` | **NEEDS MOVE** | Advanced lifting techniques tests |
| `benchmark-workout-llms.mjs` | **NEEDS MOVE** | Legacy v1 benchmark runner |
| `benchmark-workout-llms-v2.mjs` | DUPLICATE | Already in showcase, remove from fitness-app |

### Already in `showcase/`

| File | Status | Purpose |
|------|--------|---------|
| `benchmark-shared.mjs` | ✅ DONE | Scenario definitions, models, metrics |
| `benchmark-orchestrator.mjs` | ✅ DONE | Parallel multi-model runner |
| `benchmark-single-model.mjs` | ✅ DONE | Tests production edge function with ?model= |
| `benchmark-combiner.mjs` | ✅ DONE | Combines results (different from combine.mjs) |
| `benchmark-workout-llms-v2.mjs` | ✅ DONE | Full v2 benchmark suite |
| `enrich-benchmark-data.mjs` | ✅ DONE | Enriches results with metadata |
| `merge-benchmarks.mjs` | ✅ DONE | Merges multiple benchmark runs |
| `quick-merge.mjs` | ✅ DONE | Quick merge utility |
| `transform-benchmark.mjs` | ✅ DONE | Transforms legacy format to v2 |
| `compare-exercises.mjs` | ✅ DONE | Exercise comparison tool |
| `run-5-splits.mjs` | ✅ DONE | Runs 5 training split scenarios |

---

## Architecture After Migration

```
showcase/
├── src/                          # React dashboard UI
├── benchmark-*.mjs               # All benchmark scripts
├── benchmark-results/            # JSON + Markdown outputs
└── public/                       # Static assets

fitness-app/
├── app/                          # React Native screens (Expo Router)
├── src/                          # RN components, API hooks
├── supabase/functions/           # Edge functions (generate-workout)
└── scripts/                      # NON-BENCHMARK utilities only
    ├── log-server.js
    ├── cleanup-*.mjs
    └── [other non-benchmark scripts]
```

---

## Benchmark System Overview

### Core Tools

| Script | Mode | Purpose |
|--------|------|---------|
| `benchmark-quick.mjs` | LLM or Edge | Quick 5-7 scenario test for single model |
| `benchmark-single-model.mjs` | Edge Only | Tests production edge function via ?model= |
| `benchmark-orchestrator.mjs` | LLM | Runs multiple models in parallel |
| `benchmark-workout-llms-v2.mjs` | LLM | Full 26-scenario suite |
| `benchmark-combine.mjs` | N/A | Merges JSON outputs for dashboard |

### Key Features

#### Edge Function Mode
- **Flag**: `BENCHMARK_MODE=edge`
- **Purpose**: Tests the full production pipeline
- **Tests**:
  - Exercise database queries and filtering
  - Tier compliance (excluded models, catalog-only exercises)
  - Equipment and exclusion compliance
  - 2-call LLM chain (Exercise Selector → Param Assigner)
  - Response enrichment with GIF URLs

#### LLM Mode
- **Flag**: `BENCHMARK_MODE=llm` (default)
- **Purpose**: Tests prompt following and output structure
- **Tests**:
  - Direct LLM calls via OpenRouter
  - Prompt adherence (sets/reps/rest/tempo)
  - JSON schema compliance
  - Style-specific parameters (BODYBUILD, STRENGTH, HIIT, ENDURANCE)

#### Compliance Scoring
- **Tier Compliance**: Checks if exercises are allowed for the model's tier
  - Excluded models: no exercises from their exclusion list
  - Catalog-only models: only exercises from their catalog
- **Equipment Compliance**: All exercises must use equipment from request
- **Exclusion Compliance**: No exercises from excludedExercises list
- **Body Part Compliance**: Exercises match requested body parts

#### Training Style Scenarios
- **BODYBUILD**: 3-4 sets, 8-12 reps, 60-90s rest
- **STRENGTH**: 4-5 sets, 4-6 reps, 180-240s rest
- **HIIT**: 3-4 sets, 15-20 reps, 30-45s rest
- **ENDURANCE**: 2-3 sets, 15-20 reps, 30-60s rest
- **HYBRID**: Blend of BODYBUILD + STRENGTH (variable ranges)
- **BLEND**: Multi-style workouts (first exercise STRENGTH, rest BODYBUILD)

---

## Scenarios Coverage (26 Total)

### By Training Style
- **BODYBUILD**: 8 scenarios (chest/triceps, back/biceps, shoulders, legs, etc.)
- **STRENGTH**: 6 scenarios (lower body, upper body, squat focus, bench focus, etc.)
- **HIIT**: 4 scenarios (cardio, full body, upper/lower splits)
- **ENDURANCE**: 3 scenarios (cardio endurance, circuit training, etc.)
- **HYBRID**: 3 scenarios (bodybuilding/strength blends)
- **BLEND**: 2 scenarios (multi-style workouts)

### By Body Part
- Upper body: 10 scenarios
- Lower body: 6 scenarios
- Full body: 6 scenarios
- Isolation: 4 scenarios

### Special Cases
- Equipment constraints (limited equipment, bodyweight only)
- Muscle group exclusions (injured areas)
- Experience levels (beginner vs advanced)
- Time constraints (30min, 45min, 60min, 90min)

---

## Usage Examples

### Quick Test (5 scenarios, single model)
```bash
# LLM mode (tests prompt following)
OPENROUTER_API_KEY=sk-or-... node benchmark-quick.mjs openai/gpt-4o results.json

# Edge function mode (tests full pipeline)
BENCHMARK_MODE=edge node benchmark-quick.mjs edge results.json
```

### Production Edge Function Test
```bash
# Tests production endpoint with ?model= override
node benchmark-single-model.mjs anthropic/claude-4.5-sonnet

# Run only first 5 scenarios
LIMIT=5 node benchmark-single-model.mjs openai/gpt-4o
```

### Full Multi-Model Benchmark
```bash
# Run all 26 scenarios across multiple models
node benchmark-orchestrator.mjs

# Custom scenario count
LIMIT=10 node benchmark-orchestrator.mjs
```

### Combine Results for Dashboard
```bash
# Merges all JSON files in benchmark-results/ into single combined.json
node benchmark-combine.mjs
```

---

## Migration Checklist

- [ ] Move `benchmark-quick.mjs` to showcase
- [ ] Move `benchmark-combine.mjs` to showcase (handle naming conflict with combiner.mjs)
- [ ] Move `benchmark-scenarios.mjs` to showcase
- [ ] Move `benchmark-mock-exercises.mjs` to showcase
- [ ] Move `benchmark-style-params.mjs` to showcase
- [ ] Move `benchmark-variety-test.mjs` to showcase
- [ ] Move `benchmark-advanced-techniques.mjs` to showcase
- [ ] Move `benchmark-workout-llms.mjs` to showcase (archive as legacy)
- [ ] Delete duplicate `benchmark-workout-llms-v2.mjs` from fitness-app
- [ ] Update all import paths in moved files
- [ ] Update README.md in showcase with usage instructions
- [ ] Update fitness-app/scripts/README.md to remove benchmark references
- [ ] Move or archive `fitness-app/benchmark-results/` to showcase
- [ ] Move or archive `fitness-app/benchmark-results-archive-2026-01-05/` to showcase
- [ ] Test all benchmark scripts in new location
- [ ] Update CLAUDE.md to reflect new structure

---

## Notes

### Naming Conflicts
- `benchmark-combine.mjs` (fitness-app) vs `benchmark-combiner.mjs` (showcase)
  - **Resolution needed**: Check if they're different or duplicates

### Dependencies
- All scripts depend on `benchmark-shared.mjs` (already in showcase)
- Some scripts use `MOCK_EXERCISES` from `benchmark-mock-exercises.mjs`
- Edge function mode requires `SUPABASE_ANON_KEY` and correct endpoint URL

### Testing After Migration
1. Verify all imports resolve correctly
2. Test edge function mode against production
3. Test LLM mode with OpenRouter
4. Verify dashboard can read combined results
5. Check all 26 scenarios run successfully

---

**Last Updated**: January 6, 2026
