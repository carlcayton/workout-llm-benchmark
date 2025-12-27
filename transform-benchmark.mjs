#!/usr/bin/env node
/**
 * Transform benchmark results from model-based to scenario-based format
 * for the UI component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Exercise ID to name mapping (from ExerciseDB)
const EXERCISE_NAMES = {
  // CHEST
  '0025': 'dumbbell bench press',
  '0047': 'barbell bench press',
  '0251': 'push-up',
  '1254': 'cable crossover',
  '0289': 'dumbbell fly',
  '0048': 'incline barbell bench press',
  '0026': 'incline dumbbell bench press',
  '0290': 'incline dumbbell fly',
  '1255': 'machine chest press',
  '1256': 'pec deck fly',
  '0252': 'decline push-up',
  // BACK
  '0027': 'barbell bent over row',
  '0294': 'dumbbell row',
  '0651': 'pull-up',
  '0160': 'lat pulldown',
  '0293': 'dumbbell pullover',
  '0652': 'chin-up',
  '0161': 'seated cable row',
  '0162': 'cable face pull',
  '0028': 'barbell deadlift',
  '1257': 'machine row',
  '0653': 'inverted row',
  '0029': 't-bar row',
  // SHOULDERS
  '0237': 'dumbbell shoulder press',
  '0036': 'barbell overhead press',
  '0308': 'dumbbell lateral raise',
  '0518': 'cable lateral raise',
  '0309': 'dumbbell front raise',
  '0310': 'dumbbell rear delt fly',
  '0037': 'barbell upright row',
  '1258': 'machine shoulder press',
  '0253': 'pike push-up',
  '0311': 'arnold press',
  // BICEPS
  '0100': 'barbell curl',
  '0101': 'dumbbell curl',
  '0102': 'hammer curl',
  '0103': 'cable curl',
  '0104': 'preacher curl',
  '0105': 'concentration curl',
  '0106': 'incline dumbbell curl',
  // TRICEPS
  '0200': 'tricep pushdown',
  '0201': 'skull crusher',
  '0202': 'overhead tricep extension',
  '0203': 'close grip bench press',
  '0254': 'diamond push-up',
  '0255': 'bench dips',
  '0204': 'tricep kickback',
  // LEGS - QUADS
  '0032': 'barbell squat',
  '0278': 'dumbbell lunge',
  '0584': 'leg press',
  '0585': 'leg extension',
  '0654': 'bodyweight squat',
  '0655': 'lunge',
  '0279': 'goblet squat',
  '0033': 'front squat',
  '0280': 'bulgarian split squat',
  '1259': 'hack squat',
  '0034': 'smith machine squat',
  // LEGS - HAMSTRINGS
  '0038': 'romanian deadlift',
  '0586': 'leg curl',
  '0281': 'dumbbell romanian deadlift',
  '0282': 'single leg deadlift',
  '0656': 'nordic curl',
  '0587': 'seated leg curl',
  '0039': 'stiff leg deadlift',
  '0163': 'cable pull through',
  // LEGS - GLUTES
  '0526': 'hip thrust',
  '0657': 'glute bridge',
  '0658': 'single leg glute bridge',
  '0164': 'cable kickback',
  '1260': 'hip abduction machine',
  '0283': 'dumbbell step up',
  // CALVES
  '0600': 'standing calf raise',
  '0601': 'seated calf raise',
  '0602': 'dumbbell calf raise',
  '0659': 'bodyweight calf raise',
  '0040': 'barbell calf raise',
  // ABS
  '0400': 'crunch',
  '0401': 'plank',
  '0402': 'hanging leg raise',
  '0403': 'russian twist',
  '0404': 'bicycle crunch',
  '0165': 'cable crunch',
  '0405': 'mountain climber',
  '0406': 'dead bug',
  '1261': 'ab wheel rollout',
  '0284': 'weighted crunch',
  // KETTLEBELL
  '0527': 'kettlebell swing',
  '0528': 'kettlebell goblet squat',
  '0529': 'kettlebell clean and press',
  '0530': 'kettlebell row',
  '0531': 'kettlebell floor press',
  '0532': 'kettlebell snatch',
  '0533': 'kettlebell turkish get up',
  '0534': 'kettlebell lunge',
  '0535': 'kettlebell windmill',
  // RESISTANCE BANDS
  '0701': 'resistance band row',
  '0702': 'resistance band chest press',
  '0703': 'resistance band squat',
  '0704': 'resistance band bicep curl',
  '0705': 'resistance band tricep extension',
  '0706': 'resistance band lateral raise',
  '0707': 'resistance band pull apart',
  '0708': 'resistance band face pull',
  '0709': 'resistance band glute bridge',
  '0710': 'resistance band clamshell',
  // CARDIO
  '0800': 'burpee',
  '0801': 'jumping jack',
  '0802': 'high knees',
  '0803': 'box jump',
  '0804': 'battle ropes',
  '0805': 'rowing machine',
  '0806': 'assault bike',
};

// Helper to get exercise name with title case
function getExerciseName(id) {
  const name = EXERCISE_NAMES[id];
  if (!name) return `Unknown Exercise (${id})`;
  // Title case the name
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resultsDir = path.join(__dirname, 'benchmark-results');

const files = fs.readdirSync(resultsDir)
  .filter(f => f.startsWith('model-') && f.endsWith('.json'))
  .sort((a, b) => b.localeCompare(a));

const latestByModel = {};
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
    const modelId = data.modelId;
    if (!latestByModel[modelId]) {
      latestByModel[modelId] = data;
    }
  } catch (e) {
    console.error('Error parsing', file, e.message);
  }
}

console.log('Found', Object.keys(latestByModel).length, 'unique models');

// Pivot: group by scenario name, collect results from each model
const scenarioMap = {};

for (const [modelId, modelData] of Object.entries(latestByModel)) {
  for (const scenario of modelData.scenarios) {
    if (!scenarioMap[scenario.name]) {
      scenarioMap[scenario.name] = {
        name: scenario.name,
        category: scenario.category,
        trainingStyle: scenario.trainingStyle,
        results: []
      };
    }

    // Extract exercises from workout sections
    let exercises = [];
    if (scenario.workout?.sections) {
      exercises = scenario.workout.sections.flatMap(s =>
        s.exercises.map(e => ({
          name: getExerciseName(e.id),
          id: e.id,
          sets: e.sets,
          reps: e.reps,
          rest: e.restSeconds || 60
        }))
      );
    }

    scenarioMap[scenario.name].results.push({
      model: modelData.modelName,
      modelId: modelId,
      status: scenario.success ? 'success' : 'error',
      latency: scenario.latency,
      equipmentMatch: scenario.equipmentMatchRate,
      exerciseCount: scenario.exerciseCount,
      avgSets: scenario.avgSets,
      avgReps: scenario.avgReps,
      avgRest: scenario.avgRest,
      error: scenario.error,
      exercises: exercises
    });
  }
}

// Sort results within each scenario by success rate and latency
for (const scenario of Object.values(scenarioMap)) {
  scenario.results.sort((a, b) => {
    if (a.status === 'success' && b.status !== 'success') return -1;
    if (a.status !== 'success' && b.status === 'success') return 1;
    return a.latency - b.latency;
  });
}

// Create model summary stats
const modelStats = {};
for (const [modelId, modelData] of Object.entries(latestByModel)) {
  modelStats[modelData.modelName] = {
    modelId,
    modelName: modelData.modelName,
    tier: modelData.tier,
    successRate: modelData.summary.successRate,
    avgLatency: modelData.summary.avgLatency,
    avgExerciseCount: modelData.summary.avgExerciseCount,
    avgEquipmentMatchRate: modelData.summary.avgEquipmentMatchRate,
    successCount: modelData.summary.successCount,
    parseErrorCount: modelData.summary.parseErrorCount
  };
}

const combined = {
  timestamp: new Date().toISOString(),
  modelStats: Object.values(modelStats).sort((a, b) => b.successRate - a.successRate || a.avgLatency - b.avgLatency),
  scenarios: Object.values(scenarioMap)
};

const outputPath = path.join(__dirname, 'public', 'benchmark-data.json');
fs.writeFileSync(outputPath, JSON.stringify(combined, null, 2));

console.log('Wrote', outputPath);
console.log('Scenarios:', combined.scenarios.length);
console.log('Models:', combined.modelStats.length);
console.log('\nModel Rankings:');
combined.modelStats.forEach((m, i) => {
  console.log(`  ${i+1}. ${m.modelName}: ${m.successRate}% success, ${m.avgLatency}ms avg`);
});
