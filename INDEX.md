# Showcase Directory Index

Central tracking file for all important files in the showcase project.

**Last Index Update:** 2026-01-06

---

## Benchmark Scripts

| File | Description | Last Modified |
|------|-------------|---------------|
| `benchmark-orchestrator.mjs` | Spawns parallel model benchmarks | 2026-01-05 |
| `benchmark-single-model.mjs` | Tests one model against scenarios | 2026-01-05 |
| `benchmark-combiner.mjs` | Aggregates results from all models | 2026-01-05 |
| `benchmark-shared.mjs` | Shared scenarios, configs, utilities | 2026-01-05 |
| `merge-benchmarks.mjs` | Merge multiple benchmark runs | 2026-01-05 |
| `quick-merge.mjs` | Quick merge utility | 2026-01-05 |
| `benchmark-workout-llms-v2.mjs` | Legacy v2 benchmark runner | 2026-01-04 |
| `run-5-splits.mjs` | Run benchmarks for 5 splits | 2026-01-04 |
| `compare-exercises.mjs` | Compare exercise selections | 2026-01-04 |
| `transform-benchmark.mjs` | Transform benchmark data formats | 2025-12-31 |

---

## Documentation

| File | Description | Last Modified |
|------|-------------|---------------|
| `README.md` | Project documentation | 2026-01-05 |
| `ARNOLD-BLEND-BENCHMARK-PLAN.md` | Arnold Split blending strategy | 2026-01-05 |
| `BENCHMARK-ANALYSIS-2025-12-29.md` | Detailed analysis report | 2025-12-29 |
| `BENCHMARK-REFACTOR.md` | Data organization refactor plan | 2025-12-28 |
| `BENCHMARK_COMPARISON.md` | Model comparison summary | 2025-12-28 |
| `PROTOTYPE-SHOWCASE-PLAN.md` | Overall showcase architecture | 2025-12-22 |

---

## AI Docs (Gap Analysis)

| File | Description | Last Modified |
|------|-------------|---------------|
| `ai-docs/input-output-gap-index.md` | Master index of gap analysis | 2026-01-01 |
| `ai-docs/input-output-gap-duration-constraints.md` | Duration violations analysis | 2026-01-01 |
| `ai-docs/input-output-gap-training-style-params.md` | HIT/Strength style violations | 2026-01-01 |
| `ai-docs/input-output-gap-muscle-targeting.md` | Muscle group analysis | 2026-01-01 |
| `ai-docs/input-output-gap-equipment-mapping.md` | Equipment utilization | 2026-01-01 |
| `ai-docs/benchmark-gaps-exercise-selection.md` | Exercise selection analysis | 2026-01-01 |
| `ai-docs/benchmark-gaps-programming-parameters.md` | Sets/reps/rest analysis | 2026-01-01 |
| `ai-docs/benchmark-gaps-structure-volume.md` | Volume and structure gaps | 2026-01-01 |

---

## React Components

| File | Description | Last Modified |
|------|-------------|---------------|
| `src/components/benchmark/LLMBenchmark.jsx` | Benchmark visualization UI | 2026-01-05 |
| `src/components/exercises/ExerciseReview.jsx` | Exercise review interface | 2026-01-05 |
| `src/App.jsx` | Main app component | 2026-01-04 |
| `src/components/comparison/VideoComparison.jsx` | Video model comparison | 2025-12-22 |
| `src/components/gallery/Gallery.jsx` | Gallery component | 2025-12-22 |

---

## Data Files

| File | Description | Last Modified |
|------|-------------|---------------|
| `public/benchmark-data.json` | Active benchmark data for UI | 2026-01-05 |
| `package.json` | NPM dependencies and scripts | 2026-01-04 |
| `vercel.json` | Vercel deployment config | 2025-12-27 |

---

## Directories

| Directory | Purpose |
|-----------|---------|
| `benchmark-results/` | Raw benchmark output JSON files |
| `benchmark-results/archive/` | Deprecated benchmark data |
| `ai-docs/` | Gap analysis and AI documentation |
| `src/components/` | React UI components |
| `public/` | Static assets served by Vite |

---

## Recently Modified (Last 7 Days)

- **2026-01-05** - `benchmark-orchestrator.mjs`, `benchmark-single-model.mjs`, `benchmark-combiner.mjs`, `benchmark-shared.mjs`, `merge-benchmarks.mjs`, `quick-merge.mjs`, `README.md`, `ARNOLD-BLEND-BENCHMARK-PLAN.md`, `LLMBenchmark.jsx`, `ExerciseReview.jsx`, `benchmark-data.json`
- **2026-01-04** - `benchmark-workout-llms-v2.mjs`, `run-5-splits.mjs`, `compare-exercises.mjs`, `App.jsx`, `package.json`
- **2026-01-01** - `input-output-gap-index.md`, `input-output-gap-duration-constraints.md`, `input-output-gap-training-style-params.md`, `input-output-gap-muscle-targeting.md`, `input-output-gap-equipment-mapping.md`, `benchmark-gaps-exercise-selection.md`, `benchmark-gaps-programming-parameters.md`, `benchmark-gaps-structure-volume.md`
- **2025-12-31** - `transform-benchmark.mjs`

---

## Update Instructions

To refresh this index with current modification dates:

```bash
node scripts/update-index.mjs
```

Or manually check dates:

```bash
ls -lt --time-style="+%Y-%m-%d" *.md *.mjs package.json
ls -lt --time-style="+%Y-%m-%d" ai-docs/*.md
ls -lt --time-style="+%Y-%m-%d" src/components/*/*.jsx
```
