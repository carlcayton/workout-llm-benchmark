# LLM Workout Generation Benchmark Showcase

React + Vite application for visualizing LLM workout generation benchmark results.

## Overview

This showcase displays benchmark results comparing various LLM models' performance at generating workout routines via the fitness app's `generate-workout` edge function.

## Benchmark Architecture

**2-Call LLM Chain:**
1. **Exercise Selector** - Picks specific exercises from filtered pool based on equipment, training style, and body parts
2. **Param Assigner** - Assigns sets, reps, rest, tempo, notes; generates title and tips

## Running Benchmarks

### Quick Dry Run (2 fast models, 5 scenarios × 3 durations)

```bash
cd /home/arian/expo-work/showcase
DRY_RUN=1 SCENARIOS=0,1,2,3,4 DURATIONS=30,60,90 node benchmark-orchestrator.mjs
```

### Full Benchmark (8 models, 26 scenarios)

```bash
node benchmark-orchestrator.mjs
```

### Single Model Test

```bash
LIMIT=5 node benchmark-single-model.mjs anthropic/claude-haiku-4.5
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DRY_RUN` | Use only 2 fast models (Haiku + Gemini Flash) | `1` |
| `SCENARIOS` | Comma-separated scenario indices | `0,1,2,3,4` |
| `DURATIONS` | Comma-separated durations to test | `30,60,90` |
| `LIMIT` | Max scenarios to run | `5` |
| `OFFSET` | Skip first N scenarios | `10` |

## Benchmark Data Management

### Data Deprecation Policy

**IMPORTANT:** When running new benchmarks, older data should be deprecated:

1. **New benchmark run** automatically generates timestamped files in `benchmark-results/`
2. **Run combiner** to aggregate: `node benchmark-combiner.mjs`
3. **Copy to public** to make visible: `cp benchmark-results/combined-benchmark-LATEST.json public/benchmark-data.json`
4. **Archive old data** (optional): Move old combined files to `benchmark-results/archive/`

### Data Files

| File | Purpose |
|------|---------|
| `public/benchmark-data.json` | **Active data** displayed in UI |
| `benchmark-results/combined-*.json` | Aggregated results from all models |
| `benchmark-results/model-*.json` | Individual model run results |
| `benchmark-results/archive/` | Deprecated benchmark data |

### After Each New Benchmark Run

```bash
# 1. Run the combiner to aggregate all model results
node benchmark-combiner.mjs

# 2. Find the latest combined file
ls -t benchmark-results/combined-*.json | head -1

# 3. Copy to public folder (replace existing)
cp benchmark-results/combined-benchmark-YYYY-MM-DDTHH-MM-SS.json public/benchmark-data.json

# 4. Optionally archive old combined files
mkdir -p benchmark-results/archive
mv benchmark-results/combined-benchmark-OLD*.json benchmark-results/archive/
```

## Models Tested

### Full Suite (8 models)
- `anthropic/claude-sonnet-4.5` (premium)
- `anthropic/claude-haiku-4.5` (fast)
- `google/gemini-3-flash-preview` (fast)
- `google/gemini-3-pro-preview` (premium)
- `openai/gpt-5.2` (premium)
- `openai/gpt-5` (premium)
- `deepseek/deepseek-r1` (reasoning)
- `x-ai/grok-4.1-fast` (fast)

### Dry Run (2 fast models)
- `anthropic/claude-haiku-4.5`
- `google/gemini-3-flash-preview`

## Test Scenarios

26 scenarios covering:
- **Bro Split**: Chest, Back, Shoulders, Arms, Legs
- **PPL**: Push, Pull, Legs
- **Upper/Lower**: Strength, HIT, Endurance variants
- **Full Body**: Various configurations
- **Arnold Split**: Chest+Back, Shoulders+Arms
- **Blended Styles**: Mixed training approaches

### Valid Durations
- 30 minutes
- 60 minutes
- 90 minutes

## Development

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run benchmark` | Run full benchmark (all models) |
| `npm run benchmark:dry` | Dry run (2 fast models only) |

## Key Files

| File | Purpose |
|------|---------|
| `benchmark-orchestrator.mjs` | Spawns parallel model benchmarks |
| `benchmark-single-model.mjs` | Tests one model against scenarios |
| `benchmark-combiner.mjs` | Aggregates results from all models |
| `benchmark-shared.mjs` | Shared scenarios, configs, utilities |
| `src/components/benchmark/LLMBenchmark.jsx` | Main benchmark visualization UI |
