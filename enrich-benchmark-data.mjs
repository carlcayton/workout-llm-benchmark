#!/usr/bin/env node
/**
 * Enrich existing benchmark-data.json with real exercise names and GIF URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://ivfllbccljoyaayftecd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZmxsYmNjbGpveWFheWZ0ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTkwMTQsImV4cCI6MjA4MTY5NTAxNH0.714kFWsFFKwVAywLY5NOyZz2_eMoi7-Js8JGCwtpycs';
const GIF_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs`;

// Scenario metadata to derive split and duration
const SCENARIO_METADATA = {
  // Bro Split / Bodybuilding
  'Classic Bodybuilding - Chest & Triceps': { split: 'bro_split', duration: 60, dayFocus: 'Chest & Triceps' },
  'Classic Bodybuilding - Back & Biceps': { split: 'bro_split', duration: 60, dayFocus: 'Back & Biceps' },
  'Bodybuilding - Shoulder Focus': { split: 'bro_split', duration: 60, dayFocus: 'Shoulders' },
  'High Volume Leg Day': { split: 'bro_split', duration: 75, dayFocus: 'Legs' },

  // Upper/Lower
  'Strength Focused - Upper Body': { split: 'upper_lower', duration: 60, dayFocus: 'Upper' },
  'Strength Focused - Lower Body': { split: 'upper_lower', duration: 60, dayFocus: 'Lower' },
  'Upper/Lower Split - Upper': { split: 'upper_lower', duration: 60, dayFocus: 'Upper' },

  // PPL
  'PPL - Push Day': { split: 'ppl', duration: 60, dayFocus: 'Push' },
  'PPL - Pull Day': { split: 'ppl', duration: 60, dayFocus: 'Pull' },
  'PPL - Legs': { split: 'ppl', duration: 60, dayFocus: 'Legs' },
  'Push Day': { split: 'ppl', duration: 60, dayFocus: 'Push' },
  'Pull Day': { split: 'ppl', duration: 60, dayFocus: 'Pull' },

  // Full Body
  'Full Body - Strength': { split: 'full_body', duration: 45, dayFocus: 'Full Body' },
  'Full Body - Hypertrophy': { split: 'full_body', duration: 60, dayFocus: 'Full Body' },
  'Full Body': { split: 'full_body', duration: 60, dayFocus: 'Full Body' },

  // Arnold Split
  'Arnold Split - Chest & Back': { split: 'arnold_split', duration: 75, dayFocus: 'Chest/Back' },
  'Arnold Split - Shoulders & Arms': { split: 'arnold_split', duration: 60, dayFocus: 'Shoulders/Arms' },

  // HIT (High Intensity Training)
  'HIT - Upper Body': { split: 'upper_lower', duration: 30, dayFocus: 'Upper' },
  'HIT - Full Body': { split: 'full_body', duration: 30, dayFocus: 'Full Body' },
  'HIT - Legs': { split: 'bro_split', duration: 30, dayFocus: 'Legs' },

  // Endurance
  'Muscular Endurance - Full Body Circuit': { split: 'full_body', duration: 45, dayFocus: 'Full Body' },
  'Muscular Endurance - Upper Body': { split: 'upper_lower', duration: 45, dayFocus: 'Upper' },

  // Specialty
  'Powerlifting Prep': { split: 'full_body', duration: 90, dayFocus: 'Powerlifting' },
  'Home Gym - Dumbbells Only': { split: 'full_body', duration: 45, dayFocus: 'Full Body' },
};

async function fetchExerciseNames() {
  console.log('Fetching exercise names from Supabase...');
  const exerciseNames = {};
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
      console.warn(`Failed to fetch exercises: ${response.status}`);
      return {};
    }

    const exercises = await response.json();
    if (exercises.length === 0) break;

    for (const ex of exercises) {
      exerciseNames[ex.id] = ex.name;
    }

    offset += batchSize;
    if (exercises.length < batchSize) break;
  }

  console.log(`Loaded ${Object.keys(exerciseNames).length} exercise names`);
  return exerciseNames;
}

function getExerciseName(id, exerciseNames) {
  const name = exerciseNames[id];
  if (!name) return `Exercise ${id}`;
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

async function main() {
  const inputPath = path.join(__dirname, 'public', 'benchmark-data.json');
  const outputPath = inputPath; // Overwrite in place

  console.log('Reading', inputPath);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const exerciseNames = await fetchExerciseNames();

  let enrichedExercises = 0;
  let enrichedScenarios = 0;

  for (const scenario of data.scenarios) {
    // Enrich scenario metadata
    const meta = SCENARIO_METADATA[scenario.name] || {};

    if (!scenario.split || scenario.split === 'other') {
      scenario.split = meta.split || 'other';
    }
    if (!scenario.duration) {
      scenario.duration = scenario.request?.duration || meta.duration || 60;
    }
    if (!scenario.dayFocus) {
      scenario.dayFocus = meta.dayFocus || '';
    }
    if (!scenario.trainingStyles || scenario.trainingStyles.length === 0) {
      scenario.trainingStyles = [scenario.category || 'bodybuilding'];
    }

    enrichedScenarios++;

    // Enrich exercises in results
    for (const result of scenario.results) {
      if (!result.exercises) continue;

      for (const exercise of result.exercises) {
        // Enrich exercise name
        if (!exercise.name || exercise.name.startsWith('Exercise ')) {
          exercise.name = getExerciseName(exercise.id, exerciseNames);
          enrichedExercises++;
        }

        // Add GIF URL if missing
        if (!exercise.gifUrl) {
          exercise.gifUrl = `${GIF_BASE_URL}/${exercise.id}.gif`;
        }
      }
    }
  }

  // Update timestamp
  data.enrichedAt = new Date().toISOString();

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log('\nEnrichment complete!');
  console.log(`  Scenarios enriched: ${enrichedScenarios}`);
  console.log(`  Exercises enriched: ${enrichedExercises}`);
  console.log(`  Output: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
