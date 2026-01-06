# LLM Workout Generation Benchmark - Combined Results

**Generated:** 2025-12-30T13:22:39.568Z
**Version:** 2.1-parallel
**Scenarios Tested:** 28
**Models Tested:** 4
**Source Files:** 4

**Results Period:** 2025-12-30T12:46:07.687Z to 2025-12-30T13:06:10.701Z

## Models Overview

| Model | Tier | Success Rate | Avg Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|------|--------------|-------------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | premium | 100% | 47303ms | 7.6 | 100% | 4 | 10 | 72s |
| Grok 4.1 | fast | 100% | 58690ms | 7.8 | 100% | 3.7 | 12 | 116s |
| GPT-5.2 | premium | 92% | 78933ms | 7.1 | 100% | 3.6 | 10 | 118s |
| Gemini 3 Pro | premium | 85% | 75026ms | 7.4 | 100% | 3.9 | 10 | 123s |

## Quick Stats

- **Fastest Response:** Claude Sonnet 4.5 (47303ms avg)
- **Highest Success Rate:** Claude Sonnet 4.5 (100%)
- **Best Equipment Match:** Claude Sonnet 4.5 (100%)
- **Most Exercises (avg):** Grok 4.1 (7.8)

## Results by Category

### Uncategorized Scenarios

#### Bro Split - Bodybuilding (Chest)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | OK | 65884ms | 8 | 100% | 4 | 10 | 78s |
| Gemini 3 Pro | OK | 60899ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | API Err | 10221ms | - | 0% | - | - | 0s |
| Grok 4.1 | OK | 47751ms | 8 | 100% | 4 | 12 | 78s |

#### Bro Split - Bodybuilding (Back)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | OK | 50507ms | 10 | 100% | 4 | 10 | 60s |
| Gemini 3 Pro | OK | 60993ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | OK | 90138ms | 8 | 100% | 4 | 10 | 78s |
| Grok 4.1 | OK | 38257ms | 8 | 100% | 4 | 12 | 78s |

#### Bro Split - Bodybuilding (Shoulders)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | OK | 41240ms | 6 | 100% | 4 | 10 | 73s |
| Gemini 3 Pro | OK | 60404ms | 6 | 100% | 4 | 10 | 73s |
| GPT-5.2 | OK | 55498ms | 6 | 100% | 4 | 10 | 73s |
| Grok 4.1 | OK | 31560ms | 6 | 100% | 4 | 12 | 73s |

#### Bro Split - Bodybuilding (Arms)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | OK | 39024ms | 6 | 100% | 4 | 12 | 73s |

#### Bro Split - Bodybuilding (Legs)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Claude Sonnet 4.5 | OK | 39860ms | 8 | 100% | 4 | 10 | 78s |

#### PPL - Bodybuilding (Legs)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 63403ms | 8 | 100% | 4 | 10 | 90s |
| GPT-5.2 | OK | 87826ms | 8 | 100% | 4 | 10 | 90s |
| Grok 4.1 | OK | 55644ms | 8 | 100% | 4 | 12 | 90s |

#### Upper/Lower - Strength (Upper)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 57262ms | 8 | 100% | 5 | 5 | 180s |
| GPT-5.2 | OK | 81633ms | 8 | 100% | 5 | 5 | 180s |
| Grok 4.1 | OK | 33473ms | 8 | 100% | 5 | 6 | 180s |

#### Upper/Lower - Strength (Lower)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 59489ms | 8 | 100% | 5 | 5 | 180s |
| GPT-5.2 | OK | 92097ms | 8 | 100% | 5 | 5 | 180s |
| Grok 4.1 | OK | 32186ms | 8 | 100% | 5 | 6 | 180s |

#### Full Body - Strength

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 61264ms | 8 | 100% | 5 | 5 | 180s |
| GPT-5.2 | OK | 93865ms | 8 | 100% | 5 | 5 | 180s |
| Grok 4.1 | OK | 47502ms | 8 | 100% | 5 | 6 | 180s |

#### Upper/Lower - HIT (Upper)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 60861ms | 3 | 100% | 2 | 8 | 240s |
| GPT-5.2 | OK | 16124ms | 3 | 100% | 2 | 6 | 240s |
| Grok 4.1 | OK | 39874ms | 3 | 100% | 2 | 8 | 240s |

#### Full Body - HIT

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 66218ms | 4 | 100% | 2 | 8 | 240s |
| GPT-5.2 | OK | 57063ms | 4 | 100% | 2 | 8 | 240s |
| Grok 4.1 | OK | 51785ms | 4 | 100% | 2 | 8 | 240s |

#### Upper/Lower - HIT (Lower)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | API Err | 63822ms | - | 0% | - | - | 0s |
| GPT-5.2 | OK | 14763ms | 3 | 100% | 2 | 6 | 240s |
| Grok 4.1 | OK | 31089ms | 3 | 100% | 2 | 8 | 240s |

#### Full Body - Endurance

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | API Err | 149155ms | - | 0% | - | - | 0s |
| GPT-5.2 | OK | 60198ms | 6 | 100% | 3 | 20 | 45s |
| Grok 4.1 | OK | 48793ms | 6 | 100% | 3 | 20 | 45s |

#### Upper/Lower - Endurance (Upper)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | API Err | 151661ms | - | 0% | - | - | 0s |
| GPT-5.2 | OK | 100800ms | 9 | 100% | 3 | 20 | 45s |
| Grok 4.1 | OK | 62572ms | 9 | 100% | 3 | 25 | 45s |

#### Full Body - Endurance (Conditioning)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | API Err | 149496ms | - | 0% | - | - | 0s |
| GPT-5.2 | OK | 78998ms | 6 | 100% | 3 | 20 | 45s |
| Grok 4.1 | OK | 47062ms | 6 | 100% | 3 | 20 | 45s |

#### Upper/Lower - Bodybuilding (Dumbbells)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 147474ms | 6 | 100% | 4 | 10 | 73s |
| GPT-5.2 | OK | 63737ms | 6 | 100% | 4 | 12 | 73s |
| Grok 4.1 | OK | 47625ms | 6 | 100% | 4 | 12 | 73s |

#### Upper/Lower - Endurance (Bodyweight)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 107853ms | 9 | 100% | 3 | 20 | 45s |
| GPT-5.2 | OK | 110708ms | 9 | 100% | 3 | 20 | 45s |
| Grok 4.1 | OK | 41956ms | 9 | 100% | 3 | 20 | 45s |

#### Full Body - Endurance (Bands)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 109079ms | 9 | 100% | 3 | 20 | 45s |
| GPT-5.2 | OK | 126912ms | 9 | 100% | 3 | 20 | 45s |
| Grok 4.1 | OK | 64243ms | 9 | 100% | 3 | 20 | 45s |

#### Full Body - Strength (Kettlebell)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 63842ms | 8 | 100% | 5 | 5 | 180s |
| GPT-5.2 | API Err | 101835ms | - | 0% | - | - | 0s |
| Grok 4.1 | OK | 64518ms | 8 | 100% | 5 | 4 | 180s |

#### Full Body - Bodybuilding (Beginner)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 64690ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | OK | 107228ms | 8 | 100% | 4 | 10 | 78s |
| Grok 4.1 | OK | 63533ms | 8 | 100% | 4 | 12 | 78s |

#### Upper/Lower - Bodybuilding (Beginner)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 55150ms | 6 | 100% | 4 | 10 | 73s |
| GPT-5.2 | OK | 56732ms | 6 | 100% | 4 | 12 | 73s |
| Grok 4.1 | OK | 50564ms | 8 | 100% | 4 | 10 | 60s |

#### PPL - Bodybuilding (Push)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 71738ms | 8 | 100% | 4 | 10 | 90s |
| GPT-5.2 | OK | 99814ms | 8 | 100% | 4 | 10 | 90s |
| Grok 4.1 | OK | 83036ms | 10 | 100% | 4 | 10 | 80s |

#### PPL - Bodybuilding (Pull)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 61592ms | 8 | 100% | 4 | 10 | 90s |
| GPT-5.2 | OK | 70738ms | 8 | 100% | 4 | 10 | 90s |
| Grok 4.1 | OK | 104365ms | 10 | 100% | 4 | 10 | 80s |

#### PPL - Strength + Bodybuilding (Push)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 65337ms | 8 | 100% | 4.4 | 10 | 180s |
| GPT-5.2 | OK | 91761ms | 8 | 100% | 4.4 | 10 | 180s |
| Grok 4.1 | OK | 96539ms | 11 | 100% | 4.5 | 10 | 180s |

#### Upper/Lower - HIT + Bodybuilding (Upper)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 139899ms | 6 | 100% | 3.3 | 10 | 171s |
| GPT-5.2 | OK | 56613ms | 6 | 100% | 3.3 | 10 | 171s |
| Grok 4.1 | OK | 47112ms | 8 | 100% | 3 | 8 | 139s |

#### Full Body - Strength + Endurance

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 72937ms | 9 | 100% | 3.7 | 20 | 180s |
| GPT-5.2 | OK | 105507ms | 9 | 100% | 3.7 | 20 | 180s |
| Grok 4.1 | OK | 97275ms | 12 | 100% | 3.8 | 20 | 180s |

#### Arnold Split - Bodybuilding (Chest/Back)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 73409ms | 8 | 100% | 4 | 10 | 90s |
| GPT-5.2 | OK | 106880ms | 8 | 100% | 4 | 10 | 90s |
| Grok 4.1 | OK | 78442ms | 10 | 100% | 4 | 12 | 90s |

#### Arnold Split - Bodybuilding (Shoulders/Arms)

| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |
|-------|--------|---------|-----------|-------------|----------|----------|----------|
| Gemini 3 Pro | OK | 66788ms | 8 | 100% | 4 | 10 | 78s |
| GPT-5.2 | OK | 68757ms | 8 | 100% | 4 | 10 | 78s |
| Grok 4.1 | OK | 119187ms | 10 | 100% | 4 | 10 | 60s |

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

*Combined from 4 individual model result files.*
