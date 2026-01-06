# Arnold Split Blend Scenarios - Benchmark Execution Plan

## Problem Overview

The benchmark suite currently has **25 scenarios** in `benchmark-shared.mjs`, but the last full benchmark run (2026-01-05) only tested **21 scenarios** (63 with duration permutation). This means **4 new Arnold Split blend scenarios** were added after the last run and need to be benchmarked:

| Index | Scenario Name | Split | Day Focus | Training Styles |
|-------|--------------|-------|-----------|-----------------|
| 21 | Arnold Split - Bodybuilding + Endurance (Chest/Back) | arnold_split | Chest/Back | classic_bodybuilding, muscular_endurance |
| 22 | Arnold Split - Bodybuilding + HIT (Chest/Back) | arnold_split | Chest/Back | classic_bodybuilding, high_intensity_hit |
| 23 | Arnold Split - Bodybuilding + Endurance (Shoulders/Arms) | arnold_split | Shoulders/Arms | classic_bodybuilding, muscular_endurance |
| 24 | Arnold Split - Bodybuilding + HIT (Shoulders/Arms) | arnold_split | Shoulders/Arms | classic_bodybuilding, high_intensity_hit |

**Goal:** Run these 4 scenarios (12 with duration permutation) for all 6 models without losing the existing 63-scenario benchmark data.

---

## File Locations

| File | Purpose |
|------|---------|
| `/home/arian/expo-work/showcase/benchmark-shared.mjs` | Scenario definitions (TEST_SCENARIOS array) |
| `/home/arian/expo-work/showcase/benchmark-single-model.mjs` | Single model runner (supports SCENARIOS env var) |
| `/home/arian/expo-work/showcase/benchmark-orchestrator.mjs` | Parallel orchestrator (all models) |
| `/home/arian/expo-work/showcase/benchmark-combiner.mjs` | Combines per-model results into final JSON |
| `/home/arian/expo-work/showcase/benchmark-results/` | Output directory for results |

**Existing Data (PRESERVE):**
- `benchmark-results/combined-benchmark-2026-01-05T08-01-56-282Z.json` - Combined results (63 scenarios x 6 models)
- `benchmark-results/model-*.json` - Per-model results from the last run

---

## Execution Plan

### Step 1: Archive Existing Results (SAFETY FIRST)

Before running new benchmarks, archive the existing results to prevent accidental overwrite:

```bash
cd /home/arian/expo-work/showcase

# Create timestamped archive directory
ARCHIVE_DIR="benchmark-results/archive-pre-arnold-blend-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Move existing per-model files to archive (combiner will overwrite these)
mv benchmark-results/model-*.json "$ARCHIVE_DIR/"

# Copy combined results (keep a backup, original stays in place)
cp benchmark-results/combined-benchmark-2026-01-05T08-01-56-282Z.json "$ARCHIVE_DIR/"

echo "Archived to: $ARCHIVE_DIR"
```

### Step 2: Run Arnold Blend Scenarios Only

Use the `SCENARIOS` environment variable to run only the 4 new scenarios (indices 21-24):

**Option A: Sequential (safer for credit limits)**
```bash
cd /home/arian/expo-work/showcase

# Run all 6 models sequentially, each running scenarios 21-24 with duration permutation
SCENARIOS=21,22,23,24 DURATIONS=30,60,90 SEQUENTIAL=1 \
  OPENROUTER_API_KEY=sk-or-... \
  node benchmark-orchestrator.mjs
```

**Option B: Parallel (faster, uses more credits simultaneously)**
```bash
cd /home/arian/expo-work/showcase

# Run all 6 models in parallel
SCENARIOS=21,22,23,24 DURATIONS=30,60,90 \
  OPENROUTER_API_KEY=sk-or-... \
  node benchmark-orchestrator.mjs
```

**Option C: Single Model Test First (recommended)**
```bash
cd /home/arian/expo-work/showcase

# Test with cheapest model first
SCENARIOS=21,22,23,24 DURATIONS=30,60,90 \
  OPENROUTER_API_KEY=sk-or-... \
  node benchmark-single-model.mjs anthropic/claude-haiku-4.5
```

### Step 3: Verify New Results

After the benchmark completes, verify the output:

```bash
cd /home/arian/expo-work/showcase

# Check new per-model files exist
ls -la benchmark-results/model-*.json

# Verify scenario count in a new file (should be 12 = 4 scenarios x 3 durations)
node -e "
const fs = require('fs');
const files = fs.readdirSync('benchmark-results').filter(f => f.startsWith('model-') && f.endsWith('.json'));
const latest = files.sort().pop();
const data = JSON.parse(fs.readFileSync('benchmark-results/' + latest, 'utf-8'));
console.log('File:', latest);
console.log('Scenarios:', data.scenarios.length);
console.log('Expected: 12 (4 scenarios x 3 durations)');
data.scenarios.forEach(s => console.log(' -', s.name));
"
```

### Step 4: Merge Results (Manual Process Required)

The combiner will create a NEW combined file. To merge with existing data:

**Option A: Keep Separate Files**
- Keep the new `combined-benchmark-*.json` as a separate "Arnold Blend" report
- Reference both files when comparing models

**Option B: Merge JSON Manually**
```bash
cd /home/arian/expo-work/showcase

# After combiner runs, you'll have:
# - Old: combined-benchmark-2026-01-05T08-01-56-282Z.json (63 scenarios)
# - New: combined-benchmark-<new-timestamp>.json (12 scenarios)

# To merge, use a script like:
node -e "
const fs = require('fs');

// Load both files
const oldData = JSON.parse(fs.readFileSync('benchmark-results/combined-benchmark-2026-01-05T08-01-56-282Z.json', 'utf-8'));
const newFile = fs.readdirSync('benchmark-results')
  .filter(f => f.startsWith('combined-benchmark-') && f.endsWith('.json'))
  .sort()
  .pop();
const newData = JSON.parse(fs.readFileSync('benchmark-results/' + newFile, 'utf-8'));

console.log('Old scenarios:', oldData.totalScenarios);
console.log('New scenarios:', newData.totalScenarios);

// Merge logic would go here...
// For each model, append new scenarios to existing scenarios array
// Update totalScenarios, recalculate summaries
"
```

---

## Expected Output

After running the 4 Arnold blend scenarios with DURATIONS=30,60,90:

| Metric | Value |
|--------|-------|
| New scenarios per model | 12 |
| Total new API calls | 72 (12 scenarios x 6 models) |
| Estimated time (parallel) | ~5-7 minutes |
| Estimated time (sequential) | ~15-20 minutes |
| New results files | 6 per-model JSON + 1 combined JSON |

---

## Verification Checklist

After execution, verify:

- [ ] All 6 models completed successfully
- [ ] Each model file has exactly 12 scenarios
- [ ] All scenarios are Arnold Split blends (indices 21-24)
- [ ] Duration permutation worked (30min, 60min, 90min variants)
- [ ] Equipment match rate is 100% (or close)
- [ ] No parse errors or API errors
- [ ] Combined file was generated

**Quick verification command:**
```bash
cd /home/arian/expo-work/showcase

node -e "
const fs = require('fs');
const files = fs.readdirSync('benchmark-results')
  .filter(f => f.startsWith('model-') && f.endsWith('.json') && f.includes('2026-01-05'));

console.log('Per-model files found:', files.length);

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync('benchmark-results/' + f, 'utf-8'));
  const success = data.summary.successCount;
  const total = data.totalScenarios;
  const rate = data.summary.successRate;
  console.log(\`  \${data.modelName}: \${success}/\${total} (\${rate}%)\`);
});
"
```

---

## Troubleshooting

### "Credits exhausted" or API errors
- Use `SEQUENTIAL=1` mode with `ABORT_THRESHOLD=2`
- Run one model at a time with Option C

### Scenarios not found
- Verify indices: `node -e "import('./benchmark-shared.mjs').then(m => m.TEST_SCENARIOS.slice(21,25).forEach((s,i) => console.log(21+i, s.name)))"`
- Check for syntax errors in `benchmark-shared.mjs`

### Duration permutation not working
- Ensure `DURATIONS=30,60,90` is set (no spaces)
- Check output for "Duration permutation enabled: 30, 60, 90 min"

### Combiner fails
- Check that all per-model files have the same timestamp prefix
- Combiner looks for files matching pattern `model-*-<timestamp>.json`

---

## Notes

- The orchestrator uses the latest files in `benchmark-results/` for combining
- Old files in `archive/` are ignored by the combiner
- The `SCENARIOS` env var uses 0-indexed scenario indices
- Results include full workout JSON for each scenario (useful for debugging)
