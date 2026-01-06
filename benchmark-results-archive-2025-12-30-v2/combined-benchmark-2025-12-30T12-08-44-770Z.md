# LLM Workout Generation Benchmark - Combined Results

**Generated:** 2025-12-30T12:08:44.770Z
**Version:** 2.1-parallel
**Scenarios Tested:** 5
**Models Tested:** 6
**Source Files:** 6

**Results Period:** 2025-12-30T11:44:15.843Z to 2025-12-30T11:54:13.089Z

## Models Overview

| Model | Tier | Success Rate | Avg Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|------|--------------|-------------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | unknown | 100% | 1846ms | 7.6 | 95% | 4.2 | 10 | 100s |
| Claude Sonnet 4.5 | premium | 100% | 51940ms | 7.6 | 93% | 4.2 | 10 | 100s |
| Gemini 3 Flash | fast | 100% | 17714ms | 7.6 | 90% | 4.2 | 10 | 100s |
| GPT-5.2 | premium | 100% | 74332ms | 7.6 | 90% | 4.2 | 10 | 100s |
| grok-4.1 | unknown | 100% | 1850ms | 7.6 | 88% | 4.2 | 10 | 100s |
| Gemini 3 Pro | premium | 80% | 64385ms | 7.5 | 97% | 4 | 10 | 80s |

## Quick Stats

- **Fastest Response:** claude-4.5-haiku (1846ms avg)
- **Highest Success Rate:** claude-4.5-haiku (100%)
- **Best Equipment Match:** Gemini 3 Pro (97%)
- **Most Exercises (avg):** claude-4.5-haiku (7.6)

## Cross-LLM Similarity Analysis

### Overall Similarity

- **Average Jaccard Similarity:** 2.7%
- **Total Pairwise Comparisons:** 70
- **Scenarios with Valid Comparisons:** 5
- **Most Similar Scenario:** Upper/Lower - Strength (Upper) (3.4%)
- **Least Similar Scenario:** Bro Split - Bodybuilding (Back) (2.3%)

### Exercise Uniqueness by Model

*Higher uniqueness = model picks more exercises that other models don't pick*

| Model | Total Exercises | Unique Exercises | Uniqueness Score |
|-------|-----------------|------------------|------------------|
| claude-4.5-haiku | 38 | 32 | 84.2% |
| GPT-5.2 | 38 | 31 | 81.6% |
| Gemini 3 Pro | 30 | 24 | 80.0% |
| grok-4.1 | 38 | 30 | 78.9% |
| Claude Sonnet 4.5 | 38 | 29 | 76.3% |
| Gemini 3 Flash | 38 | 25 | 65.8% |

### Per-Scenario Similarity

| Scenario | Avg Similarity | Pairs Compared |
|----------|----------------|----------------|
| Bro Split - Bodybuilding (Chest) | 2.7% | 15 |
| Bro Split - Bodybuilding (Back) | 2.3% | 15 |
| Bro Split - Bodybuilding (Shoulders) | 3.0% | 15 |
| PPL - Bodybuilding (Legs) | 2.4% | 15 |
| Upper/Lower - Strength (Upper) | 3.4% | 10 |

## Results by Category

### Uncategorized Scenarios

#### Bro Split - Bodybuilding (Chest)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | OK | 2428ms | 8 | 100% | 4 | 10 | 78s |
| Claude Sonnet 4.5 | OK | 63092ms | 8 | 100% | 4 | 10 | 78s |
| Gemini 3 Flash | OK | 19746ms | 8 | 88% | 4 | 10 | 78s |
| Gemini 3 Pro | OK | 77817ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | OK | 88915ms | 8 | 100% | 4 | 10 | 78s |
| grok-4.1 | OK | 2346ms | 8 | 88% | 4 | 10 | 78s |

#### Bro Split - Bodybuilding (Back)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | OK | 3227ms | 8 | 100% | 4 | 10 | 78s |
| Claude Sonnet 4.5 | OK | 39274ms | 8 | 100% | 4 | 10 | 78s |
| Gemini 3 Flash | OK | 17417ms | 8 | 100% | 4 | 10 | 78s |
| Gemini 3 Pro | OK | 56873ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | OK | 90938ms | 8 | 100% | 4 | 10 | 78s |
| grok-4.1 | OK | 3121ms | 8 | 100% | 4 | 10 | 78s |

#### Bro Split - Bodybuilding (Shoulders)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | OK | 1222ms | 6 | 100% | 4 | 10 | 73s |
| Claude Sonnet 4.5 | OK | 37816ms | 6 | 100% | 4 | 12 | 73s |
| Gemini 3 Flash | OK | 15127ms | 6 | 100% | 4 | 10 | 73s |
| Gemini 3 Pro | OK | 62320ms | 6 | 100% | 4 | 10 | 73s |
| GPT-5.2 | OK | 57395ms | 6 | 100% | 4 | 10 | 73s |
| grok-4.1 | OK | 1336ms | 6 | 100% | 4 | 10 | 73s |

#### PPL - Bodybuilding (Legs)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | OK | 1062ms | 8 | 75% | 4 | 10 | 90s |
| Claude Sonnet 4.5 | OK | 58800ms | 8 | 63% | 4 | 10 | 90s |
| Gemini 3 Flash | OK | 19069ms | 8 | 63% | 4 | 10 | 90s |
| Gemini 3 Pro | OK | 60529ms | 8 | 88% | 4 | 10 | 90s |
| GPT-5.2 | OK | 71026ms | 8 | 50% | 4 | 10 | 90s |
| grok-4.1 | OK | 1276ms | 8 | 50% | 4 | 10 | 90s |

#### Upper/Lower - Strength (Upper)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| claude-4.5-haiku | OK | 1292ms | 8 | 100% | 5 | 5 | 180s |
| Claude Sonnet 4.5 | OK | 60718ms | 8 | 100% | 5 | 5 | 180s |
| Gemini 3 Flash | OK | 17210ms | 8 | 100% | 5 | 5 | 180s |
| Gemini 3 Pro | API Err | 158896ms | - | 0% | - | - | 0s |
| GPT-5.2 | OK | 63385ms | 8 | 100% | 5 | 5 | 180s |
| grok-4.1 | OK | 1170ms | 8 | 100% | 5 | 5 | 180s |

## Methodology

### Metrics Reported

- **Exercise Count:** Number of exercises in the workout
- **Equipment Match Rate:** Percentage of exercises using requested equipment
- **Avg Sets:** Average sets per exercise
- **Avg Reps:** Most common reps value returned
- **Avg Rest:** Average rest period in seconds

### Training Style Parameters (Reference)

| Style | Sets | Reps | Rest |
|-------|------|------|------|
| Classic Bodybuilding | 3-4 | 8-12 | 60-90s |
| Strength Focused | 4-5 | 4-6 | 120-240s |
| High Intensity (HIT) | 1-2 | 6-10 | 120-180s |
| Muscular Endurance | 2-3 | 15-20 | 30-45s |

---

*Combined from 6 individual model result files.*
