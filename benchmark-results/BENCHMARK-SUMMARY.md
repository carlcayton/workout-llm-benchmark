# LLM Workout Generation Benchmark Results

**Date:** 2025-12-28
**Edge Function:** `generate-workout` (production)
**Scenarios:** 26 workout generation requests across various splits and training styles

## Summary Table

| Model | Success Rate | Avg Latency | Equip Match | API Errors | Status |
|-------|-------------|-------------|-------------|------------|--------|
| Gemini 3 Flash | **100%** | **13.2s** | 26% | 0 | Complete |
| Claude Haiku 4.5 | **100%** | 15.2s | 23% | 0 | Complete |
| Claude Sonnet 4.5 | **100%** | 21.0s | **33%** | 0 | Complete |
| Claude Sonnet 4 | **100%** | 24.7s | 23% | 0 | Complete |
| Grok 4.1 | 96% | 34.5s | 25% | 1 | Complete |
| Gemini 3 Pro | **100%** | 52.7s | 0% | 0 | Complete |
| GPT-5 | — | — | — | — | Timeout |
| DeepSeek R1 | — | — | — | — | Cancelled |

## Winners

| Category | Model | Value |
|----------|-------|-------|
| Fastest | Gemini 3 Flash | 13.2s avg |
| Best Equipment Match | Claude Sonnet 4.5 | 33% |
| Best Value (fast + reliable) | Claude Haiku 4.5 | 15.2s, 100% |

## Detailed Results

### Gemini 3 Flash (google/gemini-3-flash-preview)
- **Tier:** Fast
- **Success Rate:** 100% (26/26)
- **Average Latency:** 13,152ms
- **Equipment Match:** 26%
- **Average Sets:** 3.7
- **Average Reps:** 8-12
- **Average Rest:** 82s

### Claude Haiku 4.5 (anthropic/claude-haiku-4.5)
- **Tier:** Fast
- **Success Rate:** 100% (26/26)
- **Average Latency:** 15,229ms
- **Equipment Match:** 23%
- **Average Sets:** 3.7
- **Average Reps:** 8-12
- **Average Rest:** 82s

### Claude Sonnet 4.5 (anthropic/claude-sonnet-4.5)
- **Tier:** Premium
- **Success Rate:** 100% (26/26)
- **Average Latency:** 20,976ms
- **Equipment Match:** 33%
- **Average Sets:** 3.7
- **Average Reps:** 8-12
- **Average Rest:** 83s

### Claude Sonnet 4 (anthropic/claude-sonnet-4)
- **Tier:** Premium
- **Success Rate:** 100% (26/26)
- **Average Latency:** 24,677ms
- **Equipment Match:** 23%
- **Average Sets:** 3.7
- **Average Reps:** 8-12
- **Average Rest:** 83s

### Grok 4.1 (x-ai/grok-4.1-fast)
- **Tier:** Fast
- **Success Rate:** 96% (25/26)
- **Average Latency:** 34,453ms
- **Equipment Match:** 25%
- **API Errors:** 1

### Gemini 3 Pro (google/gemini-3-pro-preview)
- **Tier:** Premium
- **Success Rate:** 100% (26/26)
- **Average Latency:** 52,722ms
- **Equipment Match:** 0% (needs investigation)
- **Average Sets:** 3.7
- **Average Reps:** 8-12
- **Average Rest:** 82s

### GPT-5 (openai/gpt-5)
- **Status:** Timeout after 40+ minutes
- **Issue:** Edge function calls not completing

### DeepSeek R1 (deepseek/deepseek-r1)
- **Status:** Cancelled by user

## Test Scenarios

The benchmark tests 26 scenarios across:

**Workout Splits:**
- Bro Split (5 days)
- Push/Pull/Legs (3-6 days)
- Upper/Lower (4 days)
- Arnold Split (6 days)
- Full Body (2-4 days)

**Training Styles:**
- BODYBUILD (Classic Bodybuilding)
- STRENGTH (Strength Focused)
- HIT (Heavy Duty / High Intensity)
- ENDURANCE (Muscular Endurance)
- Hybrid combinations

## Architecture

```
Benchmark Script
    ↓
Edge Function (POST /generate-workout?model=X)
    ├── Request validation (Zod)
    ├── Exercise DB query (Supabase)
    ├── 3-call LLM chain:
    │   ├── Meta-Planner (deterministic fallback)
    │   ├── Exercise Selector (LLM with retries)
    │   └── Param Assigner (LLM with retries)
    └── Response enrichment (GIF URLs, metadata)
```

## Files

**Benchmark Scripts:**
- `/home/arian/expo-work/showcase/benchmark-single-model.mjs`
- `/home/arian/expo-work/showcase/benchmark-shared.mjs`

**Result Files:**
- `model-anthropic-claude-sonnet-4-2025-12-28T15-24-26-509Z.json`
- `model-anthropic-claude-sonnet-4-5-2025-12-28T17-56-58-920Z.json`
- `model-anthropic-claude-haiku-4-5-2025-12-28T17-56-58-840Z.json`
- `model-google-gemini-3-flash-preview-2025-12-28T17-56-58-406Z.json`
- `model-google-gemini-3-pro-preview-2025-12-28T17-57-03-597Z.json`
- `model-x-ai-grok-4-1-fast-2025-12-28T17-56-58-887Z.json`

## Recommendations

1. **Production Default:** Claude Sonnet 4.5 (best equipment matching, reliable)
2. **Cost-Optimized:** Claude Haiku 4.5 or Gemini 3 Flash (fast, 100% reliable)
3. **Investigate:** Gemini 3 Pro 0% equipment match despite 100% success
4. **Avoid:** GPT-5 (timeout issues with edge function)

## Running Benchmarks

```bash
cd /home/arian/expo-work/showcase

# Single model
node benchmark-single-model.mjs anthropic/claude-sonnet-4.5

# Available models
node benchmark-single-model.mjs openai/gpt-5
node benchmark-single-model.mjs anthropic/claude-sonnet-4.5
node benchmark-single-model.mjs anthropic/claude-sonnet-4
node benchmark-single-model.mjs anthropic/claude-haiku-4.5
node benchmark-single-model.mjs google/gemini-3-pro-preview
node benchmark-single-model.mjs google/gemini-3-flash-preview
node benchmark-single-model.mjs deepseek/deepseek-r1
node benchmark-single-model.mjs x-ai/grok-4.1-fast
```
