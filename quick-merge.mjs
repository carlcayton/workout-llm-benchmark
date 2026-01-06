#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const resultsDir = './benchmark-results';
const files = fs.readdirSync(resultsDir)
  .filter(f => f.startsWith('workout-llm-benchmark-v2-2026-01-05') && f.endsWith('.json'))
  .sort();

console.log('Found files:', files);

// Collect all data
const scenarioMap = new Map(); // scenario name -> { scenario, results by modelId }
const modelStats = {};
const models = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
  console.log('Loading', file, '- Models:', data.models?.map(m => m.name).join(', '));

  // Collect unique models
  for (const model of (data.models || [])) {
    const exists = models.find(m => m.id === model.id);
    if (!exists) {
      models.push(model);
    }
  }

  // Merge scenarios - combine results from different files for same scenario
  for (const scenario of (data.scenarios || [])) {
    const key = scenario.name;

    if (!scenarioMap.has(key)) {
      // Clone scenario without modelResults
      const baseScenario = { ...scenario };
      delete baseScenario.modelResults;
      baseScenario.results = [];
      scenarioMap.set(key, baseScenario);
    }

    const mergedScenario = scenarioMap.get(key);

    // Transform each modelResult to the dashboard format
    for (const mr of (scenario.modelResults || [])) {
      // Check if we already have results for this model
      const existingResult = mergedScenario.results.find(r => r.modelId === mr.model.id);
      if (existingResult) continue; // Skip duplicates

      // Extract exercises from sections
      const exercises = [];
      if (mr.parsedWorkout?.sections) {
        for (const section of mr.parsedWorkout.sections) {
          for (const ex of (section.exercises || [])) {
            exercises.push({
              id: ex.id,
              name: ex.name || `Exercise ${ex.id}`,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds,
              notes: ex.notes,
              gifUrl: ex.gifUrl || null
            });
          }
        }
      }

      // Transform to dashboard format
      const result = {
        modelId: mr.model.id,
        model: mr.model.name,
        status: mr.success ? 'success' : 'error',
        latency: mr.latency || 0,
        exerciseCount: mr.metrics?.exerciseCount || exercises.length,
        equipmentMatch: mr.metrics?.equipmentMatchRate || 0,
        avgSets: mr.metrics?.avgSets || 0,
        avgReps: mr.metrics?.avgReps || 0,
        avgRest: mr.metrics?.avgRest || 0,
        exercises: exercises,
        error: mr.parseError || mr.error || null,
        // Additional metrics for variety display
        equipmentUtilization: mr.metrics?.equipmentUtilization || 0,
        diversityIndex: mr.metrics?.diversityIndex || 0,
        uniquenessScore: mr.metrics?.uniquenessScore || 0
      };

      mergedScenario.results.push(result);
    }
  }

  // Collect model summaries
  if (data.modelSummaries) {
    for (const [modelId, summary] of Object.entries(data.modelSummaries)) {
      modelStats[modelId] = summary;
    }
  }
}

// Convert scenarioMap to array
const allScenarios = Array.from(scenarioMap.values());

// Convert modelStats object to array with model info (dashboard expects array)
const modelStatsArray = models.map(model => ({
  modelId: model.id,
  modelName: model.name,
  tier: model.tier,
  successRate: modelStats[model.id]?.successRate || 0,
  avgLatency: modelStats[model.id]?.avgLatency || 0,
  avgExerciseCount: modelStats[model.id]?.avgExercises || 0,
  avgEquipmentMatchRate: modelStats[model.id]?.avgEquipmentMatch || 0,
  avgEquipmentUtilization: modelStats[model.id]?.avgEquipmentUtilization || 0,
  avgDiversity: modelStats[model.id]?.avgDiversity || 0,
  avgUniqueness: modelStats[model.id]?.avgUniqueness || 0
}));

const combined = {
  timestamp: new Date().toISOString(),
  version: '2.0-combined',
  models,
  modelStats: modelStatsArray,
  scenarios: allScenarios,
  totalScenarios: allScenarios.length,
  totalModels: models.length
};

const outFile = path.join(resultsDir, 'combined-benchmark-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
fs.writeFileSync(outFile, JSON.stringify(combined, null, 2));

console.log('\n=== Merge Complete ===');
console.log('Output:', outFile);
console.log('Total models:', models.length);
console.log('Total scenarios:', allScenarios.length);
console.log('Models:', models.map(m => m.name).join(', '));

// Also copy to public folder for dashboard
const publicFile = './public/benchmark-data.json';
fs.writeFileSync(publicFile, JSON.stringify(combined, null, 2));
console.log('\nCopied to:', publicFile);
