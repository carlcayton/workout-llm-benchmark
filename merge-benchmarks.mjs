#!/usr/bin/env node

/**
 * merge-benchmarks.mjs
 *
 * Merges benchmark scenarios from a new benchmark JSON into an existing one.
 * Recalculates all modelStats aggregates after merging.
 *
 * Usage:
 *   node merge-benchmarks.mjs --existing path/to/existing.json --new path/to/new.json [--output path/to/output.json]
 *
 * If --output is not specified, outputs to stdout.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';

// -----------------------------------------------------------------------------
// Argument Parsing
// -----------------------------------------------------------------------------

function parseArguments() {
  const options = {
    existing: { type: 'string', short: 'e' },
    new: { type: 'string', short: 'n' },
    output: { type: 'string', short: 'o' },
    help: { type: 'boolean', short: 'h' },
  };

  let parsed;
  try {
    parsed = parseArgs({ options, allowPositionals: false });
  } catch (err) {
    console.error(`Error parsing arguments: ${err.message}`);
    printUsage();
    process.exit(1);
  }

  if (parsed.values.help) {
    printUsage();
    process.exit(0);
  }

  if (!parsed.values.existing) {
    console.error('Error: --existing is required');
    printUsage();
    process.exit(1);
  }

  if (!parsed.values.new) {
    console.error('Error: --new is required');
    printUsage();
    process.exit(1);
  }

  return {
    existingPath: resolve(parsed.values.existing),
    newPath: resolve(parsed.values.new),
    outputPath: parsed.values.output ? resolve(parsed.values.output) : null,
  };
}

function printUsage() {
  console.log(`
Usage: node merge-benchmarks.mjs --existing <path> --new <path> [--output <path>]

Options:
  --existing, -e  Path to existing benchmark-data.json (required)
  --new, -n       Path to new benchmark JSON to merge in (required)
  --output, -o    Path for output file (optional, defaults to stdout)
  --help, -h      Show this help message

Examples:
  # Merge and output to stdout
  node merge-benchmarks.mjs --existing data/benchmark-data.json --new data/new-results.json

  # Merge and write to file
  node merge-benchmarks.mjs -e data/existing.json -n data/new.json -o data/merged.json
`);
}

// -----------------------------------------------------------------------------
// File I/O
// -----------------------------------------------------------------------------

function loadJson(filePath, label) {
  console.error(`[INFO] Loading ${label}: ${filePath}`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    console.error(`[INFO] Successfully loaded ${label}`);
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`[ERROR] File not found: ${filePath}`);
    } else if (err instanceof SyntaxError) {
      console.error(`[ERROR] Invalid JSON in ${filePath}: ${err.message}`);
    } else {
      console.error(`[ERROR] Failed to read ${filePath}: ${err.message}`);
    }
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// Scenario Merging
// -----------------------------------------------------------------------------

/**
 * Creates a unique key for a scenario to detect duplicates.
 * Uses: name + split + duration + dayFocus + sorted equipment + sorted trainingStyles
 */
function getScenarioKey(scenario) {
  const parts = [
    scenario.name || '',
    scenario.split || '',
    String(scenario.duration || ''),
    scenario.dayFocus || '',
    (scenario.equipment || []).slice().sort().join(','),
    (scenario.trainingStyles || []).slice().sort().join(','),
  ];
  return parts.join('|');
}

/**
 * Merges scenarios from newData into existingData.
 * Returns the merged scenarios array and counts.
 */
function mergeScenarios(existingScenarios, newScenarios) {
  const existingKeys = new Set(existingScenarios.map(getScenarioKey));
  const merged = [...existingScenarios];
  let addedCount = 0;
  let skippedCount = 0;

  for (const scenario of newScenarios) {
    const key = getScenarioKey(scenario);
    if (existingKeys.has(key)) {
      skippedCount++;
      console.error(`[INFO] Skipping duplicate scenario: ${scenario.name}`);
    } else {
      merged.push(scenario);
      existingKeys.add(key);
      addedCount++;
    }
  }

  console.error(`[INFO] Merged ${addedCount} new scenarios, skipped ${skippedCount} duplicates`);
  return merged;
}

// -----------------------------------------------------------------------------
// Model Registry
// -----------------------------------------------------------------------------

/**
 * Builds a unified models array from both datasets.
 * Preserves all model metadata (id, name, tier).
 */
function mergeModels(existingModels, newModels) {
  const modelMap = new Map();

  // Add existing models
  for (const model of (existingModels || [])) {
    modelMap.set(model.id, model);
  }

  // Add/update with new models
  for (const model of (newModels || [])) {
    if (!modelMap.has(model.id)) {
      modelMap.set(model.id, model);
      console.error(`[INFO] Added new model: ${model.name} (${model.id})`);
    }
  }

  return Array.from(modelMap.values());
}

// -----------------------------------------------------------------------------
// Stats Recalculation
// -----------------------------------------------------------------------------

/**
 * Recalculates all model statistics from scratch based on scenario results.
 */
function recalculateModelStats(scenarios, models) {
  // Initialize accumulators for each model
  const stats = new Map();

  for (const model of models) {
    stats.set(model.id, {
      modelId: model.id,
      modelName: model.name,
      tier: model.tier,
      successCount: 0,
      parseErrorCount: 0,
      apiErrorCount: 0,
      totalLatency: 0,
      totalExerciseCount: 0,
      totalEquipmentMatch: 0,
      totalSets: 0,
      totalRest: 0,
      repsCounts: {},
      exerciseResults: 0, // count of results with exercise data for averaging
    });
  }

  // Aggregate data from all scenario results
  for (const scenario of scenarios) {
    for (const result of (scenario.results || [])) {
      const modelStats = stats.get(result.modelId);
      if (!modelStats) {
        // Model not in registry - add it dynamically
        const newModel = {
          modelId: result.modelId,
          modelName: result.model || result.modelId,
          tier: 'unknown',
          successCount: 0,
          parseErrorCount: 0,
          apiErrorCount: 0,
          totalLatency: 0,
          totalExerciseCount: 0,
          totalEquipmentMatch: 0,
          totalSets: 0,
          totalRest: 0,
          repsCounts: {},
          exerciseResults: 0,
        };
        stats.set(result.modelId, newModel);
        console.error(`[WARN] Found result for unregistered model: ${result.modelId}`);
      }

      const s = stats.get(result.modelId);

      // Count by status
      if (result.status === 'success') {
        s.successCount++;
      } else if (result.status === 'parse_error') {
        s.parseErrorCount++;
      } else if (result.status === 'api_error' || result.status === 'error') {
        s.apiErrorCount++;
      }

      // Aggregate latency (for all results that have it)
      if (typeof result.latency === 'number') {
        s.totalLatency += result.latency;
      }

      // Aggregate exercise-related stats (only for successful results)
      if (result.status === 'success') {
        s.exerciseResults++;

        if (typeof result.exerciseCount === 'number') {
          s.totalExerciseCount += result.exerciseCount;
        }

        if (typeof result.equipmentMatch === 'number') {
          s.totalEquipmentMatch += result.equipmentMatch;
        }

        if (typeof result.avgSets === 'number') {
          s.totalSets += result.avgSets;
        }

        if (typeof result.avgRest === 'number') {
          s.totalRest += result.avgRest;
        }

        // Track reps distribution
        if (result.avgReps !== undefined && result.avgReps !== null) {
          const repsKey = String(result.avgReps);
          s.repsCounts[repsKey] = (s.repsCounts[repsKey] || 0) + 1;
        }
      }
    }
  }

  // Calculate final stats
  const modelStats = [];
  const modelSummaries = {};

  for (const [modelId, s] of stats) {
    const totalResults = s.successCount + s.parseErrorCount + s.apiErrorCount;
    const successRate = totalResults > 0
      ? Math.round((s.successCount / totalResults) * 100)
      : 0;

    const avgLatency = totalResults > 0
      ? Math.round(s.totalLatency / totalResults)
      : 0;

    const avgExerciseCount = s.exerciseResults > 0
      ? Math.round((s.totalExerciseCount / s.exerciseResults) * 10) / 10
      : 0;

    const avgEquipmentMatchRate = s.exerciseResults > 0
      ? Math.round(s.totalEquipmentMatch / s.exerciseResults)
      : 0;

    const avgSets = s.exerciseResults > 0
      ? Math.round((s.totalSets / s.exerciseResults) * 10) / 10
      : 0;

    const avgRest = s.exerciseResults > 0
      ? Math.round(s.totalRest / s.exerciseResults)
      : 0;

    // Find most common reps value
    let avgReps = '0';
    let maxRepsCount = 0;
    for (const [reps, count] of Object.entries(s.repsCounts)) {
      if (count > maxRepsCount) {
        maxRepsCount = count;
        avgReps = reps;
      }
    }

    // Build modelStats entry (for the array)
    modelStats.push({
      modelId: s.modelId,
      modelName: s.modelName,
      tier: s.tier,
      successRate,
      avgLatency,
      avgExerciseCount,
      avgEquipmentMatchRate,
      successCount: s.successCount,
      parseErrorCount: s.parseErrorCount,
    });

    // Build modelSummaries entry (for the object)
    modelSummaries[modelId] = {
      successCount: s.successCount,
      parseErrorCount: s.parseErrorCount,
      apiErrorCount: s.apiErrorCount,
      totalLatency: s.totalLatency,
      avgLatency,
      avgExerciseCount,
      avgEquipmentMatchRate,
      avgSets,
      avgRest,
      repsCounts: s.repsCounts,
      avgReps,
      successRate,
      name: s.modelName,
      tier: s.tier,
    };
  }

  return { modelStats, modelSummaries };
}

// -----------------------------------------------------------------------------
// Main Merge Function
// -----------------------------------------------------------------------------

function mergeBenchmarks(existingData, newData) {
  console.error('[INFO] Starting merge...');

  // Merge models registry
  const mergedModels = mergeModels(existingData.models, newData.models);
  console.error(`[INFO] Total models after merge: ${mergedModels.length}`);

  // Merge scenarios (append new, skip duplicates)
  const mergedScenarios = mergeScenarios(
    existingData.scenarios || [],
    newData.scenarios || []
  );
  console.error(`[INFO] Total scenarios after merge: ${mergedScenarios.length}`);

  // Recalculate all model stats
  const { modelStats, modelSummaries } = recalculateModelStats(mergedScenarios, mergedModels);
  console.error(`[INFO] Recalculated stats for ${modelStats.length} models`);

  // Merge sourceFiles (deduplicated)
  const sourceFilesSet = new Set([
    ...(existingData.sourceFiles || []),
    ...(newData.sourceFiles || []),
  ]);
  const mergedSourceFiles = Array.from(sourceFilesSet);

  // Build merged output
  const merged = {
    timestamp: new Date().toISOString(),
    version: existingData.version || newData.version || '2.1-parallel',
    sourceFiles: mergedSourceFiles,
    totalModels: mergedModels.length,
    totalScenarios: mergedScenarios.length,
    models: mergedModels,
    modelSummaries,
    modelStats,
    scenarios: mergedScenarios,
  };

  console.error('[INFO] Merge complete');
  return merged;
}

// -----------------------------------------------------------------------------
// Entry Point
// -----------------------------------------------------------------------------

function main() {
  const args = parseArguments();

  // Load both files
  const existingData = loadJson(args.existingPath, 'existing benchmark');
  const newData = loadJson(args.newPath, 'new benchmark');

  // Validate basic structure
  if (!Array.isArray(existingData.scenarios)) {
    console.error('[ERROR] Existing benchmark has no scenarios array');
    process.exit(1);
  }
  if (!Array.isArray(newData.scenarios)) {
    console.error('[ERROR] New benchmark has no scenarios array');
    process.exit(1);
  }

  console.error(`[INFO] Existing: ${existingData.scenarios.length} scenarios, ${existingData.models?.length || 0} models`);
  console.error(`[INFO] New: ${newData.scenarios.length} scenarios, ${newData.models?.length || 0} models`);

  // Perform merge
  const merged = mergeBenchmarks(existingData, newData);

  // Output result
  const output = JSON.stringify(merged, null, 2);

  if (args.outputPath) {
    writeFileSync(args.outputPath, output, 'utf-8');
    console.error(`[INFO] Output written to: ${args.outputPath}`);
  } else {
    console.log(output);
  }

  // Summary
  console.error('');
  console.error('=== Merge Summary ===');
  console.error(`Total scenarios: ${merged.totalScenarios}`);
  console.error(`Total models: ${merged.totalModels}`);
  console.error(`Timestamp: ${merged.timestamp}`);
}

main();
