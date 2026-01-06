# LLM Workout Generation Benchmark v2

**Generated:** 2026-01-05T12:57:08.242Z
**Version:** 2.0
**Scenarios Tested:** 17
**Models Tested:** 2

## Models Overview

| Model | Tier | Success | Latency | Exercises | Equip Match |
|-------|------|---------|---------|-----------|-------------|
| Gemini 3 Pro | premium | 47% | 4224ms | 5.9 | 100% |
| Gemini 3 Flash | fast | 100% | 1751ms | 6.9 | 100% |

## Variety Metrics Overview

These metrics measure how varied and unique each LLM's exercise selections are.

| Model | Equip Util | Diversity | Uniqueness |
|-------|------------|-----------|------------|
| Gemini 3 Pro | 97% | 51% | 21% |
| Gemini 3 Flash | 96% | 53% | 67% |

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
| Gemini 3 Pro | OK | 4416ms | 6 | 100% | 75% | 33% | 0% |
| Gemini 3 Flash | OK | 1599ms | 7 | 100% | 100% | 29% | 14% |

#### Classic Bodybuilding - Back & Biceps

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4170ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1795ms | 8 | 100% | 75% | 31% | 100% |

#### Bodybuilding - Shoulder Focus

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 4610ms | 5 | 100% | 100% | 20% | 0% |
| Gemini 3 Flash | OK | 1636ms | 6 | 100% | 100% | 17% | 17% |

#### High Volume Leg Day

**Config:** barbell, dumbbell, leverage machine, cable | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 3608ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1333ms | 7 | 100% | 75% | 43% | 100% |

### Strength Scenarios

#### Strength Focused - Upper Body

**Config:** barbell, dumbbell, cable | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 3998ms | 6 | 100% | 100% | 58% | 17% |
| Gemini 3 Flash | OK | 1864ms | 7 | 100% | 100% | 50% | 29% |

#### Strength Focused - Lower Body

**Config:** barbell, dumbbell, leverage machine | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 3760ms | 6 | 100% | 100% | 33% | 17% |
| Gemini 3 Flash | OK | 1845ms | 6 | 100% | 100% | 33% | 17% |

#### Powerlifting Prep

**Config:** barbell, dumbbell | STRENGTH | 90min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 4574ms | 6 | 100% | 100% | 58% | 17% |
| Gemini 3 Flash | OK | 1649ms | 7 | 100% | 100% | 50% | 29% |

### HIT Scenarios

#### HIT - Upper Body

**Config:** leverage machine, dumbbell, cable | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 3629ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1739ms | 7 | 100% | 100% | 43% | 100% |

#### HIT - Full Body

**Config:** leverage machine, dumbbell | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4310ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1345ms | 7 | 100% | 100% | 93% | 100% |

#### HIT - Legs

**Config:** leverage machine, barbell | HIT | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 4535ms | 5 | 100% | 100% | 50% | 20% |
| Gemini 3 Flash | OK | 1642ms | 6 | 100% | 100% | 50% | 33% |

### ENDURANCE Scenarios

#### Muscular Endurance - Full Body Circuit

**Config:** body weight, dumbbell, kettlebell | ENDURANCE | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 4291ms | 6 | 100% | 100% | 92% | 50% |
| Gemini 3 Flash | OK | 1763ms | 6 | 100% | 100% | 92% | 50% |

#### Muscular Endurance - Upper Body

**Config:** dumbbell, cable, band | ENDURANCE | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4056ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 2108ms | 7 | 100% | 100% | 71% | 100% |

### Minimal Scenarios

#### Home Gym - Dumbbells Only

**Config:** dumbbell | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | OK | 3611ms | 7 | 100% | 100% | 64% | 43% |
| Gemini 3 Flash | OK | 1423ms | 7 | 100% | 100% | 64% | 43% |

### Beginner Scenarios

#### Full Body

**Config:** dumbbell, leverage machine, body weight | BODYBUILD | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 3721ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1634ms | 7 | 100% | 100% | 93% | 100% |

#### Upper/Lower Split - Upper

**Config:** dumbbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4334ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1794ms | 7 | 100% | 100% | 71% | 100% |

### Advanced Scenarios

#### Push Day

**Config:** barbell, dumbbell, cable, leverage machine | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4356ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 2892ms | 8 | 100% | 75% | 38% | 100% |

#### Pull Day

**Config:** barbell, dumbbell, cable, leverage machine, body weight | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| Gemini 3 Pro | Parse Err | 4275ms | - | 0% | 0% | 0% | 100% |
| Gemini 3 Flash | OK | 1698ms | 8 | 100% | 100% | 31% | 100% |

## Sample Workout Outputs

Selected examples showing workout structure:

### Classic Bodybuilding - Chest & Triceps

#### Gemini 3 Pro

**Title:** Classic Chest & Triceps Builder

**Description:** A hypertrophy-focused push session targeting the pectorals and triceps using classic bodybuilding volume and intensity techniques. This workout balances heavy compound movements with isolation exercises to maximize muscle growth.

**Compound Chest Development:**
- barbell bench press: 4 x 8, 90s rest
- incline dumbbell bench press: 3 x 10, 90s rest

**Chest Isolation:**
- cable crossover: 3 x 12, 60s rest

**Triceps Power & Pump:**
- close grip bench press: 3 x 10, 90s rest
- tricep pushdown: 3 x 12, 60s rest
- overhead tricep extension: 3 x 15, 60s rest

---

#### Gemini 3 Flash

**Title:** Classic Bodybuilding: Chest & Triceps Hypertrophy

**Description:** A high-volume hypertrophy session focused on the pectorals and triceps, utilizing progressive overload and isolation movements to maximize muscle growth.

**Heavy Compound Pressing:**
- barbell bench press: 4 x 8, 90s rest
- incline dumbbell bench press: 3 x 10, 90s rest

**Chest Isolation & Volume:**
- pec deck fly: 3 x 12, 60s rest
- cable crossover: 3 x 15, 60s rest

**Triceps Development:**
- close grip bench press: 3 x 8, 90s rest
- overhead tricep extension: 3 x 12, 60s rest
- tricep pushdown: 3 x 15, 60s rest

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

