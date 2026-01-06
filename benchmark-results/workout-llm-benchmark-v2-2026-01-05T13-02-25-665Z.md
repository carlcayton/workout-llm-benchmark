# LLM Workout Generation Benchmark v2

**Generated:** 2026-01-05T12:57:08.983Z
**Version:** 2.0
**Scenarios Tested:** 17
**Models Tested:** 1

## Models Overview

| Model | Tier | Success | Latency | Exercises | Equip Match |
|-------|------|---------|---------|-----------|-------------|
| Grok 4.1 | fast | 100% | 1085ms | 6.8 | 100% |

## Variety Metrics Overview

These metrics measure how varied and unique each LLM's exercise selections are.

| Model | Equip Util | Diversity | Uniqueness |
|-------|------------|-----------|------------|
| Grok 4.1 | 82% | 54% | 100% |

**Metric Definitions:**
- **Equip Util (Equipment Utilization):** % of provided equipment actually used in workout
- **Diversity:** Variety within workout (unique targets + body parts / total exercises)
- **Uniqueness:** % of exercises unique to this LLM (not used by other LLMs in same scenario)


## Results by Category

### Bodybuilding Scenarios

#### Classic Bodybuilding - Chest & Triceps

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1423ms | 6 | 100% | 75% | 33% | 100% |

#### Classic Bodybuilding - Back & Biceps

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 867ms | 6 | 100% | 75% | 42% | 100% |

#### Bodybuilding - Shoulder Focus

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1024ms | 6 | 100% | 75% | 17% | 100% |

#### High Volume Leg Day

**Config:** barbell, dumbbell, leverage machine, cable | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 935ms | 7 | 100% | 50% | 43% | 100% |

### Strength Scenarios

#### Strength Focused - Upper Body

**Config:** barbell, dumbbell, cable | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1133ms | 8 | 100% | 100% | 44% | 100% |

#### Strength Focused - Lower Body

**Config:** barbell, dumbbell, leverage machine | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1262ms | 6 | 100% | 100% | 33% | 100% |

#### Powerlifting Prep

**Config:** barbell, dumbbell | STRENGTH | 90min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 994ms | 6 | 100% | 100% | 58% | 100% |

### HIT Scenarios

#### HIT - Upper Body

**Config:** leverage machine, dumbbell, cable | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 765ms | 6 | 100% | 100% | 50% | 100% |

#### HIT - Full Body

**Config:** leverage machine, dumbbell | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1099ms | 8 | 100% | 100% | 88% | 100% |

#### HIT - Legs

**Config:** leverage machine, barbell | HIT | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1252ms | 6 | 100% | 100% | 50% | 100% |

### ENDURANCE Scenarios

#### Muscular Endurance - Full Body Circuit

**Config:** body weight, dumbbell, kettlebell | ENDURANCE | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1240ms | 6 | 100% | 67% | 92% | 100% |

#### Muscular Endurance - Upper Body

**Config:** dumbbell, cable, band | ENDURANCE | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 940ms | 6 | 100% | 67% | 83% | 100% |

### Minimal Scenarios

#### Home Gym - Dumbbells Only

**Config:** dumbbell | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1146ms | 8 | 100% | 100% | 56% | 100% |

### Beginner Scenarios

#### Full Body

**Config:** dumbbell, leverage machine, body weight | BODYBUILD | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1004ms | 7 | 100% | 67% | 86% | 100% |

#### Upper/Lower Split - Upper

**Config:** dumbbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1082ms | 8 | 100% | 67% | 63% | 100% |

### Advanced Scenarios

#### Push Day

**Config:** barbell, dumbbell, cable, leverage machine | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 831ms | 8 | 100% | 75% | 38% | 100% |

#### Pull Day

**Config:** barbell, dumbbell, cable, leverage machine, body weight | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Grok 4.1 | OK | 1446ms | 7 | 100% | 80% | 36% | 100% |

## Sample Workout Outputs

Selected examples showing workout structure:

### Classic Bodybuilding - Chest & Triceps

#### Grok 4.1

**Title:** Classic Chest & Triceps Hypertrophy

**Description:** Bodybuilding-focused workout targeting pectorals and triceps for muscle growth with compound and isolation movements.

**Chest:**
- barbell bench press: 4 x 8, 90s rest
- incline dumbbell bench press: 3 x 10, 60s rest
- cable crossover: 3 x 12, 60s rest

**Triceps:**
- close grip bench press: 3 x 8, 90s rest
- tricep pushdown: 3 x 12, 60s rest
- overhead tricep extension: 3 x 12, 60s rest

---

## Methodology

### Core Metrics

- **Exercise Count (Ex):** Number of exercises in the workout
- **Equipment Match Rate (Match):** % of exercises using requested equipment
- **Latency:** Response time in milliseconds
- **Success Rate:** Percentage of valid JSON responses

### Variety Metrics

These metrics help identify which LLMs produce more creative, varied workout programs:

- **Equipment Utilization (Util):** % of provided equipment actually used
  - Formula: `usedEquipmentTypes / providedEquipment.length * 100`
  - Higher = better utilization of available equipment

- **Diversity Index (Div):** Variety within a single workout
  - Formula: `(uniqueTargetMuscles + uniqueBodyParts) / totalExercises / 2 * 100`
  - Higher = more varied muscle targeting

- **Uniqueness Score (Uniq):** Cross-LLM comparison per scenario
  - Formula: `exercisesUniqueToThisLLM / totalExercises * 100`
  - Higher = more creative/unique exercise selection vs other LLMs
  - 0% means all exercises were also chosen by other LLMs
  - 100% means no other LLM chose the same exercises

