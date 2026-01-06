# LLM Workout Generation Benchmark v2

**Generated:** 2026-01-05T12:58:47.422Z
**Version:** 2.0
**Scenarios Tested:** 17
**Models Tested:** 1

## Models Overview

| Model | Tier | Success | Latency | Exercises | Equip Match |
|-------|------|---------|---------|-----------|-------------|
| GPT-5.2 | premium | 100% | 537ms | 6.8 | 100% |

## Variety Metrics Overview

These metrics measure how varied and unique each LLM's exercise selections are.

| Model | Equip Util | Diversity | Uniqueness |
|-------|------------|-----------|------------|
| GPT-5.2 | 89% | 54% | 100% |

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
| GPT-5.2 | OK | 523ms | 6 | 100% | 75% | 33% | 100% |

#### Classic Bodybuilding - Back & Biceps

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 386ms | 7 | 100% | 100% | 36% | 100% |

#### Bodybuilding - Shoulder Focus

**Config:** dumbbell, barbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 619ms | 6 | 100% | 100% | 17% | 100% |

#### High Volume Leg Day

**Config:** barbell, dumbbell, leverage machine, cable | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 392ms | 7 | 100% | 50% | 43% | 100% |

### Strength Scenarios

#### Strength Focused - Upper Body

**Config:** barbell, dumbbell, cable | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 688ms | 7 | 100% | 100% | 50% | 100% |

#### Strength Focused - Lower Body

**Config:** barbell, dumbbell, leverage machine | STRENGTH | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 386ms | 6 | 100% | 67% | 33% | 100% |

#### Powerlifting Prep

**Config:** barbell, dumbbell | STRENGTH | 90min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 690ms | 5 | 100% | 100% | 70% | 100% |

### HIT Scenarios

#### HIT - Upper Body

**Config:** leverage machine, dumbbell, cable | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 401ms | 7 | 100% | 100% | 50% | 100% |

#### HIT - Full Body

**Config:** leverage machine, dumbbell | HIT | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 713ms | 6 | 100% | 100% | 92% | 100% |

#### HIT - Legs

**Config:** leverage machine, barbell | HIT | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 707ms | 5 | 100% | 100% | 60% | 100% |

### ENDURANCE Scenarios

#### Muscular Endurance - Full Body Circuit

**Config:** body weight, dumbbell, kettlebell | ENDURANCE | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 706ms | 8 | 100% | 100% | 81% | 100% |

#### Muscular Endurance - Upper Body

**Config:** dumbbell, cable, band | ENDURANCE | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 389ms | 7 | 100% | 100% | 64% | 100% |

### Minimal Scenarios

#### Home Gym - Dumbbells Only

**Config:** dumbbell | BODYBUILD | 60min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 358ms | 8 | 100% | 100% | 56% | 100% |

### Beginner Scenarios

#### Full Body

**Config:** dumbbell, leverage machine, body weight | BODYBUILD | 30min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 1000ms | 8 | 100% | 100% | 88% | 100% |

#### Upper/Lower Split - Upper

**Config:** dumbbell, cable, leverage machine | BODYBUILD | 45min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 389ms | 7 | 100% | 67% | 64% | 100% |

### Advanced Scenarios

#### Push Day

**Config:** barbell, dumbbell, cable, leverage machine | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 428ms | 7 | 100% | 75% | 43% | 100% |

#### Pull Day

**Config:** barbell, dumbbell, cable, leverage machine, body weight | BODYBUILD | 75min

| Model | Status | Latency | Ex | Match | Util | Div | Uniq |
|-------|--------|---------|-------|-------|------|-----|------|
| GPT-5.2 | OK | 353ms | 8 | 100% | 80% | 31% | 100% |

## Sample Workout Outputs

Selected examples showing workout structure:

### Classic Bodybuilding - Chest & Triceps

#### GPT-5.2

**Title:** Classic Bodybuilding: Chest + Triceps (60 min)

**Description:** Hypertrophy-focused session prioritizing heavy presses for chest thickness, then isolation for full pec contraction and triceps volume.

**Chest — Heavy Pressing:**
- barbell bench press: 4 x 6, 120s rest
- incline dumbbell bench press: 3 x 8, 90s rest

**Chest — Stretch + Squeeze (Isolation):**
- dumbbell fly: 3 x 10, 75s rest
- cable crossover: 3 x 12, 60s rest

**Triceps — Strength + Pump:**
- close grip bench press: 3 x 6, 120s rest
- tricep pushdown: 3 x 12, 75s rest

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

