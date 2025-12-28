#!/usr/bin/env node
/**
 * LLM Benchmark Results Combiner
 *
 * Combines individual model benchmark result files into a unified report.
 * Designed to work with the parallel benchmark runner that produces separate
 * model-*.json files for each tested model.
 *
 * Usage:
 *   node benchmark-combiner.mjs                    # Combine results
 *   node benchmark-combiner.mjs --cleanup          # Combine and delete individual files
 *
 * Expected input files: benchmark-results/model-*.json
 * Output files:
 *   - benchmark-results/combined-benchmark-{timestamp}.json
 *   - benchmark-results/combined-benchmark-{timestamp}.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'benchmark-results');

// Training style params for markdown report reference
const TRAINING_STYLE_PARAMS = {
  classic_bodybuilding: {
    name: 'Classic Bodybuilding',
    sets: { min: 3, max: 4 },
    reps: { min: 8, max: 12 },
    rest: { min: 60, max: 90 },
  },
  strength_focused: {
    name: 'Strength Focused',
    sets: { min: 4, max: 5 },
    reps: { min: 4, max: 6 },
    rest: { min: 120, max: 240 },
  },
  high_intensity_hit: {
    name: 'High Intensity (HIT)',
    sets: { min: 1, max: 2 },
    reps: { min: 6, max: 10 },
    rest: { min: 120, max: 180 },
  },
  muscular_endurance: {
    name: 'Muscular Endurance',
    sets: { min: 2, max: 3 },
    reps: { min: 15, max: 20 },
    rest: { min: 30, max: 45 },
  },
};

// ============================================================================
// FILE DISCOVERY
// ============================================================================

function discoverModelFiles() {
  if (!fs.existsSync(RESULTS_DIR)) {
    console.error(`Error: Results directory does not exist: ${RESULTS_DIR}`);
    console.error('Run the parallel benchmark first to generate model-*.json files.');
    process.exit(1);
  }

  const files = fs.readdirSync(RESULTS_DIR)
    .filter(f => f.startsWith('model-') && f.endsWith('.json'))
    .map(f => path.join(RESULTS_DIR, f));

  if (files.length === 0) {
    console.error('Error: No model-*.json files found in benchmark-results/');
    console.error('Expected files like: model-openai-gpt-5.json, model-anthropic-claude-sonnet-4.json');
    process.exit(1);
  }

  return files;
}

// ============================================================================
// FILE PARSING
// ============================================================================

function parseModelFile(filePath) {
  const fileName = path.basename(filePath);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Validate expected structure
    if (!data.model || !data.scenarios) {
      console.warn(`  Warning: ${fileName} missing expected structure (model, scenarios)`);
      return null;
    }

    return {
      fileName,
      filePath,
      data,
    };
  } catch (error) {
    console.warn(`  Warning: Failed to parse ${fileName}: ${error.message}`);
    return null;
  }
}

// ============================================================================
// RESULTS COMBINATION
// ============================================================================

function combineResults(modelFiles) {
  const parsedFiles = [];
  const allModels = [];
  const modelSummaries = {};
  const scenarioMap = new Map(); // scenario name -> { scenario info, modelResults[] }

  console.log('\nParsing model files...');

  for (const filePath of modelFiles) {
    const parsed = parseModelFile(filePath);
    if (parsed) {
      parsedFiles.push(parsed);
      console.log(`  [OK] ${parsed.fileName}`);
    }
  }

  if (parsedFiles.length === 0) {
    console.error('Error: No valid model files found.');
    process.exit(1);
  }

  console.log(`\nSuccessfully parsed ${parsedFiles.length} model files.`);

  // Extract models and build summaries
  for (const { data } of parsedFiles) {
    const model = data.model;
    allModels.push(model);

    // Build or use existing summary
    if (data.summary) {
      modelSummaries[model.id] = data.summary;
    } else {
      // Calculate summary from scenarios if not provided
      modelSummaries[model.id] = calculateModelSummary(model, data.scenarios);
    }

    // Process each scenario
    for (const scenarioResult of data.scenarios) {
      const scenarioName = scenarioResult.name;

      if (!scenarioMap.has(scenarioName)) {
        scenarioMap.set(scenarioName, {
          name: scenarioResult.name,
          category: scenarioResult.category,
          request: scenarioResult.request,
          expectations: scenarioResult.expectations,
          exercisesAvailable: scenarioResult.exercisesAvailable,
          modelResults: [],
        });
      }

      const scenario = scenarioMap.get(scenarioName);

      // Add this model's result to the scenario
      scenario.modelResults.push({
        model,
        success: scenarioResult.success,
        latency: scenarioResult.latency,
        parsedWorkout: scenarioResult.parsedWorkout,
        metrics: scenarioResult.metrics,
        error: scenarioResult.error,
        parseError: scenarioResult.parseError,
        rawResponse: scenarioResult.rawResponse,
      });
    }
  }

  // Convert scenario map to array
  const scenarios = Array.from(scenarioMap.values());

  // Get timestamps from files for metadata
  const timestamps = parsedFiles
    .map(f => f.data.timestamp)
    .filter(Boolean)
    .sort();

  const combined = {
    timestamp: new Date().toISOString(),
    version: '2.1-parallel',
    sourceFiles: parsedFiles.map(f => f.fileName),
    totalModels: allModels.length,
    totalScenarios: scenarios.length,
    models: allModels,
    modelSummaries,
    scenarios,
    metadata: {
      combinedAt: new Date().toISOString(),
      earliestResult: timestamps[0] || null,
      latestResult: timestamps[timestamps.length - 1] || null,
    },
  };

  return combined;
}

function calculateModelSummary(model, scenarios) {
  const summary = {
    name: model.name,
    tier: model.tier,
    totalTests: scenarios.length,
    successCount: 0,
    parseErrorCount: 0,
    apiErrorCount: 0,
    totalLatency: 0,
    totalExerciseCount: 0,
    totalEquipmentMatchRate: 0,
    totalSets: 0,
    totalRest: 0,
    repsCounts: {},
  };

  for (const scenario of scenarios) {
    if (scenario.success && scenario.parsedWorkout) {
      summary.successCount++;
      summary.totalLatency += scenario.latency || 0;

      const metrics = scenario.metrics || {};
      summary.totalExerciseCount += metrics.exerciseCount || 0;
      summary.totalEquipmentMatchRate += metrics.equipmentMatchRate || 0;
      summary.totalSets += metrics.avgSets || 0;
      summary.totalRest += metrics.avgRest || 0;

      const reps = String(metrics.avgReps || '-');
      summary.repsCounts[reps] = (summary.repsCounts[reps] || 0) + 1;
    } else if (scenario.success && scenario.parseError) {
      summary.parseErrorCount++;
    } else {
      summary.apiErrorCount++;
    }
  }

  // Calculate averages
  if (summary.successCount > 0) {
    summary.avgLatency = Math.round(summary.totalLatency / summary.successCount);
    summary.avgExerciseCount = Math.round((summary.totalExerciseCount / summary.successCount) * 10) / 10;
    summary.avgEquipmentMatchRate = Math.round(summary.totalEquipmentMatchRate / summary.successCount);
    summary.avgSets = Math.round((summary.totalSets / summary.successCount) * 10) / 10;
    summary.avgRest = Math.round(summary.totalRest / summary.successCount);

    // Find most common reps
    let mostCommonReps = '-';
    let maxCount = 0;
    for (const [reps, count] of Object.entries(summary.repsCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonReps = reps;
      }
    }
    summary.avgReps = mostCommonReps;
  }

  summary.successRate = Math.round((summary.successCount / summary.totalTests) * 100);

  return summary;
}

// ============================================================================
// MARKDOWN REPORT GENERATION
// ============================================================================

function generateMarkdownReport(results) {
  let md = `# LLM Workout Generation Benchmark - Combined Results\n\n`;
  md += `**Generated:** ${results.timestamp}\n`;
  md += `**Version:** ${results.version}\n`;
  md += `**Scenarios Tested:** ${results.totalScenarios}\n`;
  md += `**Models Tested:** ${results.totalModels}\n`;
  md += `**Source Files:** ${results.sourceFiles.length}\n\n`;

  if (results.metadata) {
    md += `**Results Period:** ${results.metadata.earliestResult || 'N/A'} to ${results.metadata.latestResult || 'N/A'}\n\n`;
  }

  // Models Overview
  md += `## Models Overview\n\n`;
  md += `| Model | Tier | Success Rate | Avg Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |\n`;
  md += `|-------|------|--------------|-------------|-----------|-------------|----------|----------|----------|\n`;

  // Sort models by success rate for display
  const sortedModels = [...results.models].sort((a, b) => {
    const summaryA = results.modelSummaries[a.id];
    const summaryB = results.modelSummaries[b.id];
    return (summaryB?.successRate || 0) - (summaryA?.successRate || 0);
  });

  for (const model of sortedModels) {
    const summary = results.modelSummaries[model.id];
    if (!summary) continue;

    md += `| ${model.name} | ${model.tier || '-'} | ${summary.successRate}% | ${summary.avgLatency || '-'}ms | ${summary.avgExerciseCount || '-'} | ${summary.avgEquipmentMatchRate || '-'}% | ${summary.avgSets || '-'} | ${summary.avgReps || '-'} | ${summary.avgRest || '-'}s |\n`;
  }

  // Quick Stats
  md += `\n## Quick Stats\n\n`;

  const rankedModels = Object.values(results.modelSummaries)
    .filter(s => s.successCount > 0);

  if (rankedModels.length > 0) {
    // Fastest
    const fastestSuccessful = rankedModels
      .filter(s => s.avgLatency)
      .sort((a, b) => a.avgLatency - b.avgLatency)[0];
    if (fastestSuccessful) {
      md += `- **Fastest Response:** ${fastestSuccessful.name} (${fastestSuccessful.avgLatency}ms avg)\n`;
    }

    // Highest success rate
    const highestSuccess = rankedModels.sort((a, b) => b.successRate - a.successRate)[0];
    if (highestSuccess) {
      md += `- **Highest Success Rate:** ${highestSuccess.name} (${highestSuccess.successRate}%)\n`;
    }

    // Best equipment match
    const bestEquipment = rankedModels
      .sort((a, b) => (b.avgEquipmentMatchRate || 0) - (a.avgEquipmentMatchRate || 0))[0];
    if (bestEquipment && bestEquipment.avgEquipmentMatchRate) {
      md += `- **Best Equipment Match:** ${bestEquipment.name} (${bestEquipment.avgEquipmentMatchRate}%)\n`;
    }

    // Most exercises on average
    const mostExercises = rankedModels
      .sort((a, b) => (b.avgExerciseCount || 0) - (a.avgExerciseCount || 0))[0];
    if (mostExercises && mostExercises.avgExerciseCount) {
      md += `- **Most Exercises (avg):** ${mostExercises.name} (${mostExercises.avgExerciseCount})\n`;
    }
  }

  // Results by Category
  md += `\n## Results by Category\n\n`;

  const categories = [...new Set(results.scenarios.map(s => s.category))];

  for (const category of categories) {
    md += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Scenarios\n\n`;

    const categoryScenarios = results.scenarios.filter(s => s.category === category);

    for (const scenario of categoryScenarios) {
      md += `#### ${scenario.name}\n\n`;

      if (scenario.request) {
        const equipment = scenario.request.equipment?.join(', ') || 'N/A';
        const style = scenario.request.trainingStyle || 'N/A';
        const duration = scenario.request.duration || 'N/A';
        md += `**Config:** ${equipment} | ${style} | ${duration}min\n\n`;
      }

      md += `| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |\n`;
      md += `|-------|--------|---------|-----------|-------------|----------|----------|----------|\n`;

      for (const result of scenario.modelResults) {
        const status = result.success && result.parsedWorkout ? 'OK' :
                       result.success ? 'Parse Err' : 'API Err';
        const latency = result.latency ? `${result.latency}ms` : '-';
        const exercises = result.metrics?.exerciseCount || '-';
        const equipMatch = result.metrics?.equipmentMatchRate !== undefined ?
                          `${result.metrics.equipmentMatchRate}%` : '-';
        const avgSets = result.metrics?.avgSets || '-';
        const avgReps = result.metrics?.avgReps || '-';
        const avgRest = result.metrics?.avgRest !== undefined ?
                       `${result.metrics.avgRest}s` : '-';

        md += `| ${result.model.name} | ${status} | ${latency} | ${exercises} | ${equipMatch} | ${avgSets} | ${avgReps} | ${avgRest} |\n`;
      }

      md += `\n`;
    }
  }

  // Methodology Reference
  md += `## Methodology\n\n`;
  md += `### Metrics Reported\n\n`;
  md += `- **Exercise Count:** Number of exercises in the workout\n`;
  md += `- **Equipment Match Rate:** Percentage of exercises using requested equipment\n`;
  md += `- **Avg Sets:** Average sets per exercise\n`;
  md += `- **Avg Reps:** Most common reps value returned\n`;
  md += `- **Avg Rest:** Average rest period in seconds\n\n`;

  md += `### Training Style Parameters (Reference)\n\n`;
  md += `| Style | Sets | Reps | Rest |\n`;
  md += `|-------|------|------|------|\n`;
  for (const [key, params] of Object.entries(TRAINING_STYLE_PARAMS)) {
    md += `| ${params.name} | ${params.sets.min}-${params.sets.max} | ${params.reps.min}-${params.reps.max} | ${params.rest.min}-${params.rest.max}s |\n`;
  }

  md += `\n---\n\n`;
  md += `*Combined from ${results.sourceFiles.length} individual model result files.*\n`;

  return md;
}

// ============================================================================
// CONSOLE SUMMARY
// ============================================================================

function printSummary(results, outputPaths) {
  console.log('\n' + '='.repeat(90));
  console.log('COMBINED BENCHMARK RESULTS');
  console.log('='.repeat(90));

  console.log('\nSOURCE FILES COMBINED:');
  for (const fileName of results.sourceFiles) {
    console.log(`  - ${fileName}`);
  }

  console.log('\nMODEL RANKINGS:');
  console.log('-'.repeat(90));
  console.log('| Rank | Model                | Success | Latency | Exercises | Equip Match | Sets | Reps |');
  console.log('|------|----------------------|---------|---------|-----------|-------------|------|------|');

  const rankedModels = Object.values(results.modelSummaries)
    .filter(s => s.successCount > 0)
    .sort((a, b) => {
      // Sort by success rate, then by latency
      if (b.successRate !== a.successRate) return b.successRate - a.successRate;
      return (a.avgLatency || Infinity) - (b.avgLatency || Infinity);
    });

  rankedModels.forEach((model, index) => {
    const rank = String(index + 1).padEnd(4);
    const name = model.name.padEnd(20);
    const success = `${model.successRate}%`.padEnd(7);
    const latency = `${model.avgLatency || '-'}ms`.padEnd(7);
    const exercises = String(model.avgExerciseCount || '-').padEnd(9);
    const equipMatch = `${model.avgEquipmentMatchRate || '-'}%`.padEnd(11);
    const sets = String(model.avgSets || '-').padEnd(4);
    const reps = String(model.avgReps || '-').padEnd(4);

    console.log(`| ${rank} | ${name} | ${success} | ${latency} | ${exercises} | ${equipMatch} | ${sets} | ${reps} |`);
  });

  console.log('\nQUICK STATS:');
  console.log('-'.repeat(90));

  if (rankedModels.length > 0) {
    const fastestSuccessful = rankedModels
      .filter(s => s.avgLatency)
      .sort((a, b) => a.avgLatency - b.avgLatency)[0];
    if (fastestSuccessful) {
      console.log(`  Fastest Response:       ${fastestSuccessful.name} (${fastestSuccessful.avgLatency}ms avg)`);
    }

    const highestSuccess = rankedModels[0];
    console.log(`  Highest Success Rate:   ${highestSuccess.name} (${highestSuccess.successRate}%)`);

    const bestEquipment = rankedModels
      .sort((a, b) => (b.avgEquipmentMatchRate || 0) - (a.avgEquipmentMatchRate || 0))[0];
    if (bestEquipment && bestEquipment.avgEquipmentMatchRate) {
      console.log(`  Best Equipment Match:   ${bestEquipment.name} (${bestEquipment.avgEquipmentMatchRate}%)`);
    }
  }

  console.log('\nOUTPUT FILES:');
  console.log('-'.repeat(90));
  console.log(`  JSON: ${outputPaths.json}`);
  console.log(`  Markdown: ${outputPaths.md}`);

  console.log('\n' + '='.repeat(90));
  console.log('Combination complete!');
  console.log('='.repeat(90) + '\n');
}

// ============================================================================
// CLEANUP
// ============================================================================

function cleanupModelFiles(modelFiles) {
  console.log('\nCleaning up individual model files...');

  for (const filePath of modelFiles) {
    try {
      fs.unlinkSync(filePath);
      console.log(`  [DELETED] ${path.basename(filePath)}`);
    } catch (error) {
      console.warn(`  [FAILED] ${path.basename(filePath)}: ${error.message}`);
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup');

  console.log('LLM Benchmark Results Combiner');
  console.log('==============================\n');

  // Discover model files
  const modelFiles = discoverModelFiles();
  console.log(`Found ${modelFiles.length} model result files.`);

  // Combine results
  const combined = combineResults(modelFiles);

  // Create output directory if needed
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  // Generate timestamp for filenames
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save JSON
  const jsonPath = path.join(RESULTS_DIR, `combined-benchmark-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(combined, null, 2));

  // Generate and save Markdown
  const mdContent = generateMarkdownReport(combined);
  const mdPath = path.join(RESULTS_DIR, `combined-benchmark-${timestamp}.md`);
  fs.writeFileSync(mdPath, mdContent);

  // Print summary
  printSummary(combined, { json: jsonPath, md: mdPath });

  // Cleanup if requested
  if (shouldCleanup) {
    cleanupModelFiles(modelFiles);
    console.log('\nIndividual model files cleaned up.');
  } else {
    console.log('\nTip: Run with --cleanup to delete individual model files after combining.');
  }
}

main();
