import fs from 'fs';
import path from 'path';

// Find the latest result file for each model
const resultsDir = 'benchmark-results';
const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json') && f.startsWith('model-'));

// Get files from today's single-scenario run
const todayFiles = files.filter(f => f.includes('2026-01-04T17-46'));

const models = {};
todayFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file)));
  if (data.scenarios && data.scenarios[0] && data.scenarios[0].workout) {
    models[data.modelName] = {
      latency: data.scenarios[0].latency,
      exercises: data.scenarios[0].workout.sections?.flatMap(s => s.exercises || []).map(e => e.name) || []
    };
  }
});

console.log('='.repeat(70));
console.log('BRO SPLIT (CHEST) - EXERCISE COMPARISON ACROSS ALL MODELS');
console.log('='.repeat(70));
console.log('');

// Print each model's exercises
const modelNames = Object.keys(models).sort((a, b) => models[a].latency - models[b].latency);
modelNames.forEach(name => {
  const m = models[name];
  console.log(`${name} (${m.latency}ms):`);
  m.exercises.forEach((ex, i) => console.log(`  ${i + 1}. ${ex}`));
  console.log('');
});

// Calculate pairwise overlap matrix
console.log('='.repeat(70));
console.log('SIMILARITY MATRIX (% overlap)');
console.log('='.repeat(70));

// Header
const shortNames = modelNames.map(n => n.split(' ')[0].substring(0, 8));
console.log('         ', shortNames.map(n => n.padEnd(10)).join(''));

modelNames.forEach((m1, i) => {
  const row = modelNames.map((m2, j) => {
    if (i === j) return '---'.padEnd(10);
    const overlap = models[m1].exercises.filter(e => models[m2].exercises.includes(e)).length;
    const pct = Math.round(overlap / 8 * 100);
    return `${pct}%`.padEnd(10);
  });
  console.log(`${shortNames[i].padEnd(10)}`, row.join(''));
});

// Find all unique exercises across all models
const allExercises = new Set();
modelNames.forEach(name => models[name].exercises.forEach(e => allExercises.add(e)));

console.log('');
console.log('='.repeat(70));
console.log('EXERCISE FREQUENCY');
console.log('='.repeat(70));

const frequency = {};
allExercises.forEach(ex => {
  frequency[ex] = modelNames.filter(m => models[m].exercises.includes(ex)).length;
});

// Sort by frequency
const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
sorted.forEach(([ex, count]) => {
  const stars = '★'.repeat(count) + '☆'.repeat(modelNames.length - count);
  console.log(`${stars} (${count}/${modelNames.length}) ${ex}`);
});

console.log('');
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Total unique exercises across ${modelNames.length} models: ${allExercises.size}`);
console.log(`If no creativity: 8 exercises (all same)`);
console.log(`Creativity score: ${Math.round((allExercises.size - 8) / (modelNames.length * 8 - 8) * 100)}%`);
