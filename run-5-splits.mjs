#!/usr/bin/env node
/**
 * Run 5 scenarios (one per split) across all models
 */
import { spawn } from 'child_process';

const MODELS = [
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-haiku-4.5',
  'google/gemini-3-flash-preview',
  'google/gemini-3-pro-preview',
  'x-ai/grok-4.1-fast',
  // 'openai/gpt-5.2', // Skip - keeps timing out
];

// Scenario indices: one per split
// 0: Bro Split (Chest)
// 5: PPL - Bodybuilding (Legs)
// 6: Upper/Lower - Strength (Upper)
// 8: Full Body - Strength
// 19: Arnold Split - Bodybuilding (Chest/Back)
const SCENARIOS = '0,5,6,8,19';

console.log('Running 5 splits × ' + MODELS.length + ' models = ' + (5 * MODELS.length) + ' total scenarios\n');

// Run models in parallel
const promises = MODELS.map(model => {
  return new Promise((resolve) => {
    console.log(`Starting: ${model}`);

    const proc = spawn('node', ['benchmark-single-model.mjs', model], {
      env: { ...process.env, SCENARIOS },
      stdio: 'pipe'
    });

    let output = '';
    proc.stdout.on('data', (data) => output += data);
    proc.stderr.on('data', (data) => output += data);

    proc.on('close', (code) => {
      const lines = output.split('\n');
      const summary = lines.slice(-15).join('\n');
      console.log(`\n${'='.repeat(50)}\n${model}\n${'='.repeat(50)}`);
      console.log(summary);
      resolve({ model, code, output });
    });
  });
});

Promise.all(promises).then(() => {
  console.log('\n\nAll models complete!');
});
