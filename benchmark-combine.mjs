#!/usr/bin/env node
/**
 * Benchmark Combiner & Publisher
 *
 * Combines multiple benchmark result files and publishes to showcase UI.
 * Automatically archives previous results before writing.
 *
 * Usage:
 *   node scripts/benchmark-combine.mjs <result-file-1> [result-file-2] ...
 *   node scripts/benchmark-combine.mjs /tmp/benchmark-*.json
 *
 * Example:
 *   node scripts/benchmark-combine.mjs /tmp/benchmark-gemini-flash.json /tmp/benchmark-haiku.json
 */

import fs from 'fs';
import path from 'path';

const SHOWCASE_DIR = '/home/arian/expo-work/showcase';
const PUBLIC_FILE = path.join(SHOWCASE_DIR, 'public/benchmark-data.json');
const ARCHIVE_DIR = path.join(SHOWCASE_DIR, 'benchmark-results/archive');

// Model metadata
const MODEL_META = {
  'google/gemini-3-flash-preview': { name: 'Gemini 3 Flash', tier: 'fast' },
  'google/gemini-3-pro-preview': { name: 'Gemini 3 Pro', tier: 'premium' },
  'anthropic/claude-haiku-4.5': { name: 'Claude 4.5 Haiku', tier: 'fast' },
  'anthropic/claude-sonnet-4.5': { name: 'Claude Sonnet 4.5', tier: 'premium' },
  'openai/gpt-5': { name: 'GPT-5', tier: 'premium' },
  'openai/gpt-5.2': { name: 'GPT-5.2', tier: 'premium' },
  'x-ai/grok-4.1-fast': { name: 'Grok 4.1', tier: 'fast' },
  'edge-function': { name: 'Edge Function (Production)', tier: 'pipeline' },
};

// Scenario metadata for UI display
const SCENARIO_META = {
  'Bodybuilding - Chest & Triceps': {
    category: 'bodybuilding',
    split: 'bro_split',
    bodyParts: ['chest', 'upper arms'],
    targetMuscles: ['pectorals', 'triceps'],
    duration: 60,
  },
  'Strength - Lower Body': {
    category: 'strength',
    split: 'upper_lower',
    bodyParts: ['upper legs'],
    targetMuscles: ['quads', 'hamstrings', 'glutes'],
    duration: 60,
  },
  'HIT - Upper Body': {
    category: 'hit',
    split: 'full_body',
    bodyParts: ['chest', 'back', 'upper arms'],
    targetMuscles: ['pectorals', 'lats', 'biceps', 'triceps'],
    duration: 30,
  },
  'Endurance - Full Body Circuit': {
    category: 'endurance',
    split: 'full_body',
    bodyParts: ['chest', 'back', 'upper legs', 'shoulders'],
    targetMuscles: ['pectorals', 'lats', 'quads', 'delts'],
    duration: 45,
  },
  'PPL - Push Day': {
    category: 'ppl',
    split: 'ppl',
    bodyParts: ['chest', 'shoulders', 'upper arms'],
    targetMuscles: ['pectorals', 'delts', 'triceps'],
    duration: 60,
  },
  'Dumbbell Only - Upper Body': {
    category: 'equipment_filter',
    split: 'upper_lower',
    bodyParts: ['chest', 'back', 'upper arms'],
    targetMuscles: ['pectorals', 'lats', 'biceps', 'triceps'],
    duration: 45,
  },
  'Chest Day - No Bench Press': {
    category: 'exclusion_test',
    split: 'bro_split',
    bodyParts: ['chest', 'upper arms'],
    targetMuscles: ['pectorals', 'triceps'],
    duration: 60,
  },
  'Hybrid - Strength + Bodybuilding Back Day': {
    category: 'blend',
    split: 'ppl',
    bodyParts: ['back'],
    targetMuscles: ['lats', 'traps', 'upper back'],
    duration: 60,
  },
};

function archiveExisting() {
  if (!fs.existsSync(PUBLIC_FILE)) {
    console.log('[ARCHIVE] No existing benchmark-data.json to archive');
    return;
  }

  // Ensure archive directory exists
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    console.log('[ARCHIVE] Created archive directory:', ARCHIVE_DIR);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(ARCHIVE_DIR, `benchmark-data-${timestamp}.json`);

  const stats = fs.statSync(PUBLIC_FILE);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  fs.copyFileSync(PUBLIC_FILE, archivePath);
  console.log(`[ARCHIVE] Archived previous results to: ${path.basename(archivePath)} (${fileSizeKB} KB)`);
}

function loadResultFiles(files) {
  const results = [];
  console.log(`[LOAD] Loading ${files.length} result file(s)...`);

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`[LOAD] ⚠️  File not found: ${file}`);
      continue;
    }

    try {
      const stats = fs.statSync(file);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      const content = fs.readFileSync(file, 'utf-8');
      const data = JSON.parse(content);

      const scenarioCount = data.scenarios?.length || 0;
      console.log(`[LOAD] ✓ Loaded: ${path.basename(file)}`);
      console.log(`[LOAD]   - Model: ${data.model}`);
      console.log(`[LOAD]   - Size: ${fileSizeKB} KB`);
      console.log(`[LOAD]   - Scenarios: ${scenarioCount}`);

      if (scenarioCount > 0) {
        console.log(`[LOAD]   - Scenario names: ${data.scenarios.map(s => s.name).join(', ')}`);
      }

      results.push(data);
    } catch (err) {
      console.warn(`[LOAD] ⚠️  Failed to parse: ${file} - ${err.message}`);
    }
  }

  console.log(`[LOAD] Total files loaded successfully: ${results.length}`);
  return results;
}

function combineResults(benchmarkResults) {
  const timestamp = new Date().toISOString();
  console.log('[MODEL] Starting result combination...');

  // Collect unique models
  const models = [];
  const modelIds = new Set();

  for (const result of benchmarkResults) {
    if (!modelIds.has(result.model)) {
      modelIds.add(result.model);
      const meta = MODEL_META[result.model] || { name: result.model, tier: 'unknown' };
      models.push({
        id: result.model,
        name: meta.name,
        tier: meta.tier,
      });
      console.log(`[MODEL] Registered model: ${result.model} -> ${meta.name} (${meta.tier})`);
    }
  }

  console.log(`[MODEL] Total unique models: ${models.length}`);

  // Calculate model stats
  console.log('[MODEL] Calculating model statistics...');
  const modelStats = models.map(model => {
    console.log(`[MODEL] Processing stats for: ${model.name}`);
    const modelResults = benchmarkResults.filter(r => r.model === model.id);
    const allScenarios = modelResults.flatMap(r => r.scenarios || []);
    const successScenarios = allScenarios.filter(s => !s.error);

    console.log(`[MODEL]   - Total scenarios: ${allScenarios.length}`);
    console.log(`[MODEL]   - Success scenarios: ${successScenarios.length}`);
    console.log(`[MODEL]   - Failed scenarios: ${allScenarios.length - successScenarios.length}`);

    const avgLatency = successScenarios.length > 0
      ? Math.round(successScenarios.reduce((sum, s) => sum + (s.latency || 0), 0) / successScenarios.length)
      : 0;

    const avgExercises = successScenarios.length > 0
      ? Math.round(successScenarios.reduce((sum, s) => sum + (s.exerciseCount || 0), 0) / successScenarios.length)
      : 0;

    const avgScore = successScenarios.length > 0
      ? Math.round(successScenarios.reduce((sum, s) => sum + (s.score || 0), 0) / successScenarios.length)
      : 0;

    const successRate = allScenarios.length > 0
      ? Math.round((successScenarios.length / allScenarios.length) * 100)
      : 0;

    console.log(`[MODEL]   - Success rate: ${successRate}%`);
    console.log(`[MODEL]   - Avg latency: ${avgLatency}ms`);
    console.log(`[MODEL]   - Avg exercise count: ${avgExercises}`);
    console.log(`[MODEL]   - Avg score: ${avgScore}%`);

    return {
      modelId: model.id,
      modelName: model.name,
      tier: model.tier,
      successRate,
      avgLatency,
      avgExerciseCount: avgExercises,
      avgScore,
      avgEquipmentMatchRate: 100, // Simplified
      avgEquipmentUtilization: 90,
      avgDiversity: 0,
      avgUniqueness: 0,
    };
  });

  // Sort by success rate, then by score
  modelStats.sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate;
    return b.avgScore - a.avgScore;
  });

  // Build scenarios with results from all models
  const scenarioNames = [...new Set(benchmarkResults.flatMap(r => (r.scenarios || []).map(s => s.name)))];
  console.log(`[SCENARIO] Building ${scenarioNames.length} unique scenarios...`);
  console.log(`[SCENARIO] Scenario names: ${scenarioNames.join(', ')}`);

  const scenarios = scenarioNames.map(name => {
    console.log(`[SCENARIO] Processing scenario: ${name}`);
    const meta = SCENARIO_META[name] || {
      category: 'other',
      split: 'full_body',
      bodyParts: [],
      targetMuscles: [],
      duration: 60,
    };

    // Find first scenario data for request info
    const firstScenario = benchmarkResults
      .flatMap(r => r.scenarios || [])
      .find(s => s.name === name);

    const results = models.map(model => {
      const modelBenchmark = benchmarkResults.find(r => r.model === model.id);
      const scenarioResult = modelBenchmark?.scenarios?.find(s => s.name === name);

      if (!scenarioResult) {
        console.log(`[SCENARIO]   - ${model.name}: NOT TESTED`);
        return {
          modelId: model.id,
          model: model.name,
          status: 'not_tested',
          latency: 0,
          exerciseCount: 0,
          equipmentMatch: 0,
          avgSets: 0,
          avgReps: '0',
          avgRest: 0,
          exercises: [],
          error: 'Not tested',
        };
      }

      if (scenarioResult.error) {
        console.log(`[SCENARIO]   - ${model.name}: ERROR - ${scenarioResult.error}`);
        return {
          modelId: model.id,
          model: model.name,
          status: 'error',
          latency: 0,
          exerciseCount: 0,
          equipmentMatch: 0,
          avgSets: 0,
          avgReps: '0',
          avgRest: 0,
          exercises: [],
          error: scenarioResult.error,
        };
      }

      const exerciseCount = scenarioResult.exerciseCount || 0;
      const exercisesArray = scenarioResult.exercises || [];
      console.log(`[SCENARIO]   - ${model.name}: SUCCESS - ${exerciseCount} exercises`);
      console.log(`[EXERCISE]     * Exercise count field: ${scenarioResult.exerciseCount}`);
      console.log(`[EXERCISE]     * Exercises array length: ${exercisesArray.length}`);
      console.log(`[EXERCISE]     * Has exercises array: ${!!scenarioResult.exercises}`);

      if (exercisesArray.length > 0) {
        console.log(`[EXERCISE]     * Exercise names: ${exercisesArray.map(e => e.name).join(', ')}`);
        console.log(`[EXERCISE]     * First exercise details:`, JSON.stringify(exercisesArray[0], null, 2));
      } else if (exerciseCount > 0) {
        console.warn(`[EXERCISE]     ⚠️  WARNING: exerciseCount=${exerciseCount} but exercises array is empty!`);
      }

      return {
        modelId: model.id,
        model: model.name,
        status: 'success',
        latency: scenarioResult.latency || 0,
        exerciseCount: scenarioResult.exerciseCount || 0,
        equipmentMatch: 100,
        score: scenarioResult.score || 0,
        avgSets: scenarioResult.avgSets || scenarioResult.details?.find(d => d.check?.includes('Sets'))?.actual || '0',
        avgReps: scenarioResult.avgReps || scenarioResult.details?.find(d => d.check?.includes('Reps'))?.actual || '0',
        avgRest: scenarioResult.avgRest || parseInt(scenarioResult.details?.find(d => d.check?.includes('Rest'))?.actual) || 0,
        exercises: scenarioResult.exercises || [],
        error: null,
        equipmentUtilization: 90,
        diversityIndex: 0,
        uniquenessScore: 100,
      };
    });

    const totalExercisesInResults = results.reduce((sum, r) => sum + (r.exercises?.length || 0), 0);
    console.log(`[SCENARIO]   Total exercises across all models: ${totalExercisesInResults}`);

    return {
      name,
      category: meta.category,
      split: meta.split,
      duration: meta.duration, // Top-level for UI filtering
      request: {
        equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
        trainingStyle: firstScenario?.style || 'BODYBUILD',
        bodyParts: meta.bodyParts,
        targetMuscles: meta.targetMuscles,
        duration: meta.duration,
        experienceLevel: 5,
        goal: 'build_muscle',
      },
      expectations: {
        minExercises: 4,
        maxExercises: 8,
        setsRange: firstScenario?.expectations?.setsRange || [3, 4],
        repsRange: firstScenario?.expectations?.repsRange || [8, 12],
        restRange: firstScenario?.expectations?.restRange || [60, 90],
      },
      exercisesAvailable: 20,
      results,
    };
  });

  console.log('[SCENARIO] All scenarios processed.');
  console.log(`[OUTPUT] Combined data structure built - ${scenarios.length} scenarios, ${models.length} models`);

  return {
    timestamp,
    version: '2.0-quick-benchmark',
    models,
    modelStats,
    scenarios,
  };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node benchmark-combine.mjs <result-file-1> [result-file-2] ...');
    console.log('Example: node benchmark-combine.mjs /tmp/benchmark-*.json');
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Benchmark Combiner & Publisher');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Archive existing
  archiveExisting();
  console.log('');

  // Load result files
  const results = loadResultFiles(args);

  if (results.length === 0) {
    console.error('❌ No valid result files found');
    process.exit(1);
  }

  console.log('');

  // Combine results
  const combined = combineResults(results);

  // Write to public folder
  const outputJson = JSON.stringify(combined, null, 2);
  fs.writeFileSync(PUBLIC_FILE, outputJson);
  const outputSizeKB = (outputJson.length / 1024).toFixed(2);
  console.log(`[OUTPUT] Published to: showcase/public/benchmark-data.json`);
  console.log(`[OUTPUT]   - File size: ${outputSizeKB} KB`);
  console.log(`[OUTPUT]   - Total scenarios: ${combined.scenarios.length}`);
  console.log(`[OUTPUT]   - Total models: ${combined.models.length}`);

  // Count total exercises in output
  const totalExercisesOutput = combined.scenarios.reduce((total, scenario) => {
    return total + scenario.results.reduce((sum, r) => sum + (r.exercises?.length || 0), 0);
  }, 0);
  console.log(`[OUTPUT]   - Total exercises across all scenarios/models: ${totalExercisesOutput}`);

  // Also save a copy to benchmark-results
  const resultsCopy = path.join(SHOWCASE_DIR, 'benchmark-results', `combined-benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(resultsCopy, outputJson);
  console.log(`[OUTPUT] Copy saved to: benchmark-results/`);

  // Print summary
  console.log('\n───────────────────────────────────────────────────────────');
  console.log('  SUMMARY');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`  Models:    ${combined.models.length}`);
  console.log(`  Scenarios: ${combined.scenarios.length}`);
  console.log('');
  console.log('  Model Rankings:');
  combined.modelStats.forEach((m, i) => {
    console.log(`    ${i + 1}. ${m.modelName.padEnd(20)} ${m.successRate}% success, ${m.avgScore}% score, ${m.avgLatency}ms`);
  });
  console.log('───────────────────────────────────────────────────────────\n');
}

main();
