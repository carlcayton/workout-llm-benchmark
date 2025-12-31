#!/usr/bin/env node
/**
 * Transform benchmark results from model-based to scenario-based format
 * for the UI component
 *
 * Fetches exercise names dynamically from Supabase database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_SCENARIOS } from './benchmark-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build scenario name -> equipment/duration mapping from TEST_SCENARIOS
const SCENARIO_EQUIPMENT_MAP = {};
const SCENARIO_DURATION_MAP = {};
for (const scenario of TEST_SCENARIOS) {
  SCENARIO_EQUIPMENT_MAP[scenario.name] = scenario.request?.equipment || [];
  SCENARIO_DURATION_MAP[scenario.name] = scenario.request?.duration || 60;
}

// Supabase config
const SUPABASE_URL = 'https://ivfllbccljoyaayftecd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZmxsYmNjbGpveWFheWZ0ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTkwMTQsImV4cCI6MjA4MTY5NTAxNH0.714kFWsFFKwVAywLY5NOyZz2_eMoi7-Js8JGCwtpycs';
const GIF_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs`;

// Cache for exercise names (loaded from Supabase)
let exerciseNamesCache = null;

/**
 * Fetch all exercise names from Supabase database
 * Uses pagination to get all 1324+ exercises (default limit is 1000)
 */
async function fetchExerciseNames() {
  if (exerciseNamesCache) return exerciseNamesCache;

  console.log('Fetching exercise names from Supabase...');

  exerciseNamesCache = {};
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/exercises?select=id,name&offset=${offset}&limit=${batchSize}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status}`);
    }

    const exercises = await response.json();
    if (exercises.length === 0) break;

    for (const ex of exercises) {
      exerciseNamesCache[ex.id] = ex.name;
    }

    offset += batchSize;
    if (exercises.length < batchSize) break;
  }

  console.log(`Loaded ${Object.keys(exerciseNamesCache).length} exercise names from database`);
  return exerciseNamesCache;
}

// Helper to get exercise name with title case
function getExerciseName(id, exerciseNames) {
  const name = exerciseNames[id];
  if (!name) return `Unknown Exercise (${id})`;
  // Title case the name
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

// Helper to convert rep ranges like "8-12" to a single numeric value (midpoint)
function parseRepsToNumber(reps) {
  if (typeof reps === 'number') return reps;
  if (typeof reps === 'string') {
    const match = reps.match(/(\d+)-(\d+)/);
    if (match) {
      return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2);
    }
    return parseInt(reps) || 10;
  }
  return 10;
}

// Split name mappings
const SPLIT_NAMES = {
  'full_body': 'Full Body',
  'upper_lower': 'Upper/Lower',
  'push_pull_legs': 'Push Pull Legs',
  'arnold_split': 'Arnold Split',
  'bro_split': 'Bro Split',
};

// Training style name mappings
const STYLE_NAMES = {
  'BODYBUILD': 'Bodybuilding',
  'STRENGTH': 'Strength',
  'HIT': 'High Intensity',
  'ENDURANCE': 'Endurance',
  'classic_bodybuilding': 'Bodybuilding',
  'strength_focused': 'Strength',
  'high_intensity_hit': 'High Intensity',
  'muscular_endurance': 'Endurance',
};

// Old scenario name -> new format mapping (for backwards compat)
const OLD_NAME_MAPPINGS = {
  // Bro Split
  'Bro Split - Chest Day': { split: 'bro_split', styles: ['classic_bodybuilding'], dayFocus: 'Chest' },
  'Bro Split - Back Day': { split: 'bro_split', styles: ['classic_bodybuilding'], dayFocus: 'Back' },
  'Bro Split - Shoulders': { split: 'bro_split', styles: ['classic_bodybuilding'], dayFocus: 'Shoulders' },
  // PPL
  'PPL - Push Day': { split: 'push_pull_legs', styles: ['classic_bodybuilding'], dayFocus: 'Push' },
  'PPL - Pull Day': { split: 'push_pull_legs', styles: ['classic_bodybuilding'], dayFocus: 'Pull' },
  'PPL - Legs': { split: 'push_pull_legs', styles: ['classic_bodybuilding'], dayFocus: 'Legs' },
  'PPL - Strength Push': { split: 'push_pull_legs', styles: ['strength_focused'], dayFocus: 'Push' },
  // Upper/Lower
  'Upper/Lower - Upper Strength': { split: 'upper_lower', styles: ['strength_focused'], dayFocus: 'Upper' },
  'Upper/Lower - Lower Strength': { split: 'upper_lower', styles: ['strength_focused'], dayFocus: 'Lower' },
  'Upper/Lower - Upper Hypertrophy': { split: 'upper_lower', styles: ['classic_bodybuilding'], dayFocus: 'Upper' },
  'Upper/Lower - Lower Hypertrophy': { split: 'upper_lower', styles: ['classic_bodybuilding'], dayFocus: 'Lower' },
  'Upper/Lower - Upper HIT': { split: 'upper_lower', styles: ['high_intensity_hit'], dayFocus: 'Upper' },
  'Upper/Lower - Lower HIT': { split: 'upper_lower', styles: ['high_intensity_hit'], dayFocus: 'Lower' },
  'Upper/Lower - Hybrid': { split: 'upper_lower', styles: ['strength_focused', 'classic_bodybuilding'], dayFocus: 'Upper' },
  // Full Body
  'Full Body - Strength': { split: 'full_body', styles: ['strength_focused'], dayFocus: 'Full Body' },
  'Full Body - Bodybuilding': { split: 'full_body', styles: ['classic_bodybuilding'], dayFocus: 'Full Body' },
  'Full Body - HIT': { split: 'full_body', styles: ['high_intensity_hit'], dayFocus: 'Full Body' },
  'Full Body - Endurance': { split: 'full_body', styles: ['muscular_endurance'], dayFocus: 'Full Body' },
  'Full Body - Hybrid S+B': { split: 'full_body', styles: ['strength_focused', 'classic_bodybuilding'], dayFocus: 'Full Body' },
  // Arnold Split
  'Arnold Split - Chest/Back': { split: 'arnold_split', styles: ['classic_bodybuilding'], dayFocus: 'Chest/Back' },
  'Arnold Split - Shoulders/Arms': { split: 'arnold_split', styles: ['classic_bodybuilding'], dayFocus: 'Shoulders/Arms' },
};

// Use original scenario name - it already contains all variation info
// (equipment, experience level, etc.) that would be lost by rebuilding from fields
function buildScenarioName(scenario) {
  return scenario.name;
}

async function main() {
  // Fetch exercise names from Supabase
  const exerciseNames = await fetchExerciseNames();

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
  const modelStats = {};

  for (const [modelId, modelData] of Object.entries(latestByModel)) {
    for (const scenario of modelData.scenarios) {
      // Build clean name from split + training styles
      const cleanName = buildScenarioName(scenario);

      if (!scenarioMap[cleanName]) {
        const scenarioEntry = {
          name: cleanName,
          duration: SCENARIO_DURATION_MAP[scenario.name] || scenario.request?.duration || 60,
          equipment: scenario.equipment || scenario.request?.equipment || SCENARIO_EQUIPMENT_MAP[scenario.name] || [],
          results: []
        };

        if (scenario.split !== undefined) scenarioEntry.split = scenario.split;
        if (scenario.dayFocus !== undefined) scenarioEntry.dayFocus = scenario.dayFocus;
        if (scenario.trainingStyles !== undefined) scenarioEntry.trainingStyles = scenario.trainingStyles;
        if (scenario.split === undefined && scenario.category !== undefined) scenarioEntry.category = scenario.category;
        if (scenario.trainingStyles === undefined && scenario.trainingStyle !== undefined) scenarioEntry.trainingStyle = scenario.trainingStyle;

        scenarioMap[cleanName] = scenarioEntry;
      }

      // Extract exercises from workout sections
      let exercises = [];
      if (scenario.workout?.sections) {
        exercises = scenario.workout.sections.flatMap(s =>
          s.exercises.map(e => ({
            name: getExerciseName(e.id, exerciseNames),
            id: e.id,
            sets: e.sets,
            reps: parseRepsToNumber(e.reps),
            rest: e.restSeconds || 60,
            gifUrl: `${GIF_BASE_URL}/${e.id}.gif`
          }))
        );
      } else if (scenario.workout?.exercises) {
        exercises = scenario.workout.exercises.map(e => ({
          name: getExerciseName(e.id, exerciseNames),
          id: e.id,
          sets: e.sets,
          reps: parseRepsToNumber(e.reps),
          rest: e.restSeconds || 60,
          gifUrl: `${GIF_BASE_URL}/${e.id}.gif`
        }));
      }

      scenarioMap[cleanName].results.push({
        model: modelData.modelName,
        modelId: modelData.modelId,
        status: scenario.success ? 'success' : 'error',
        latency: scenario.latency,
        equipmentMatch: scenario.equipmentMatchRate,
        exerciseCount: scenario.exerciseCount,
        avgSets: scenario.avgSets,
        avgReps: parseRepsToNumber(scenario.avgReps),
        avgRest: scenario.avgRest,
        error: scenario.error || null,
        exercises,
      });
    }

    // Collect model stats
    modelStats[modelId] = {
      modelId: modelData.modelId,
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
}

main().catch(err => {
  console.error('Transform failed:', err);
  process.exit(1);
});
