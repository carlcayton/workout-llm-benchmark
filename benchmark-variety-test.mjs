#!/usr/bin/env node
/**
 * Single-Input Multi-Model Variety Test
 *
 * Tests 5 LLM models with the SAME input to measure exercise variety.
 * If all models return identical exercises, variety fix isn't working.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-or-... node scripts/benchmark-variety-test.mjs
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY required');
  process.exit(1);
}

// 5 models to test (matching showcase benchmark models)
const MODELS = [
  { id: 'openai/gpt-5.2', name: 'GPT-5.2' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude 4.5 Haiku' },
];

// Single test input - Push day with full gym
const TEST_INPUT = {
  split: 'ppl',
  dayType: 'push',
  equipment: ['dumbbells', 'barbell', 'cable machine', 'flat bench', 'incline bench'],
  trainingStyle: 'BODYBUILD',
  bodyParts: ['chest', 'shoulders', 'upper arms'],
  targetMuscles: ['pectorals', 'delts', 'triceps'],
  duration: 60,
  experienceLevel: 5,
  goal: 'build_muscle',
};

// Mock exercises for the prompt
const EXERCISES = [
  { id: '0047', name: 'barbell bench press', type: 'compound', target: 'pectorals', equipment: 'barbell' },
  { id: '0025', name: 'dumbbell bench press', type: 'compound', target: 'pectorals', equipment: 'dumbbell' },
  { id: '0048', name: 'incline barbell bench press', type: 'compound', target: 'pectorals', equipment: 'barbell' },
  { id: '0026', name: 'incline dumbbell bench press', type: 'compound', target: 'pectorals', equipment: 'dumbbell' },
  { id: '1254', name: 'cable crossover', type: 'isolation', target: 'pectorals', equipment: 'cable' },
  { id: '0289', name: 'dumbbell fly', type: 'isolation', target: 'pectorals', equipment: 'dumbbell' },
  { id: '0290', name: 'incline dumbbell fly', type: 'isolation', target: 'pectorals', equipment: 'dumbbell' },
  { id: '0036', name: 'barbell overhead press', type: 'compound', target: 'delts', equipment: 'barbell' },
  { id: '0237', name: 'dumbbell shoulder press', type: 'compound', target: 'delts', equipment: 'dumbbell' },
  { id: '0308', name: 'dumbbell lateral raise', type: 'isolation', target: 'delts', equipment: 'dumbbell' },
  { id: '0518', name: 'cable lateral raise', type: 'isolation', target: 'delts', equipment: 'cable' },
  { id: '0309', name: 'dumbbell front raise', type: 'isolation', target: 'delts', equipment: 'dumbbell' },
  { id: '0310', name: 'dumbbell rear delt fly', type: 'isolation', target: 'delts', equipment: 'dumbbell' },
  { id: '0200', name: 'tricep pushdown', type: 'isolation', target: 'triceps', equipment: 'cable' },
  { id: '0201', name: 'skull crusher', type: 'isolation', target: 'triceps', equipment: 'ez barbell' },
  { id: '0202', name: 'overhead tricep extension', type: 'isolation', target: 'triceps', equipment: 'dumbbell' },
  { id: '0203', name: 'close grip bench press', type: 'compound', target: 'triceps', equipment: 'barbell' },
  { id: '0204', name: 'tricep kickback', type: 'isolation', target: 'triceps', equipment: 'dumbbell' },
  { id: '0311', name: 'arnold press', type: 'compound', target: 'delts', equipment: 'dumbbell' },
  { id: '1256', name: 'pec deck fly', type: 'isolation', target: 'pectorals', equipment: 'machine' },
];

function buildPrompt() {
  const exercisesJson = JSON.stringify(EXERCISES, null, 2);

  return `Select 6 exercises for a PUSH DAY workout (chest, shoulders, triceps).

AVAILABLE EXERCISES:
${exercisesJson}

REQUIREMENTS:
- 2-3 compound exercises
- 3-4 isolation exercises
- Target: pectorals, delts, triceps
- Use variety - don't pick the most obvious choices

Return JSON: {"exercises":[{"id":"...", "role":"primary_compound|secondary_compound|isolation"}]}`;
}

async function callModel(modelId, prompt) {
  const start = Date.now();

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const latency = Date.now() - start;

    if (data.error) {
      return { error: data.error.message, latency };
    }

    const content = data.choices?.[0]?.message?.content || '';

    // Parse exercises
    let exercises = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*"exercises"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        exercises = parsed.exercises || [];
      }
    } catch (e) {
      return { error: 'Parse error', latency, raw: content.slice(0, 200) };
    }

    return { exercises, latency };
  } catch (e) {
    return { error: e.message, latency: Date.now() - start };
  }
}

function analyzeVariety(results) {
  // Get exercise IDs from each model
  const exerciseSets = results
    .filter(r => r.exercises?.length > 0)
    .map(r => new Set(r.exercises.map(e => e.id)));

  if (exerciseSets.length < 2) return { similarity: 'N/A', uniqueCount: 0 };

  // Calculate pairwise Jaccard similarity
  let totalSimilarity = 0;
  let pairs = 0;

  for (let i = 0; i < exerciseSets.length; i++) {
    for (let j = i + 1; j < exerciseSets.length; j++) {
      const setA = exerciseSets[i];
      const setB = exerciseSets[j];
      const intersection = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...setA, ...setB]).size;
      totalSimilarity += intersection / union;
      pairs++;
    }
  }

  const avgSimilarity = pairs > 0 ? Math.round((totalSimilarity / pairs) * 100) : 0;

  // Count unique exercises across all models
  const allExercises = new Set();
  exerciseSets.forEach(set => set.forEach(id => allExercises.add(id)));

  return {
    similarity: avgSimilarity,
    uniqueCount: allExercises.size,
    totalPossible: EXERCISES.length,
  };
}

async function main() {
  const showPrompt = process.argv.includes('--show-prompt');
  const savePrompt = process.argv.includes('--save-prompt');

  console.log('='.repeat(60));
  console.log('VARIETY TEST: 5 Models, Same Input');
  console.log('='.repeat(60));
  console.log('\nTest Input: Push Day (Chest/Shoulders/Triceps), 60 min, BODYBUILD\n');

  const prompt = buildPrompt();

  // Show prompt if requested
  if (showPrompt) {
    console.log('='.repeat(60));
    console.log('PROMPT SENT TO ALL MODELS:');
    console.log('='.repeat(60));
    console.log(prompt);
    console.log('='.repeat(60));
    console.log(`Prompt length: ${prompt.length} chars\n`);
  } else {
    console.log(`Prompt length: ${prompt.length} chars (use --show-prompt to see full prompt)\n`);
  }

  // Save prompt to file if requested
  if (savePrompt) {
    const fs = await import('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptFile = `benchmark-prompts/variety-test-${timestamp}.txt`;

    // Ensure directory exists
    if (!fs.existsSync('benchmark-prompts')) {
      fs.mkdirSync('benchmark-prompts', { recursive: true });
    }

    fs.writeFileSync(promptFile, prompt);
    console.log(`Prompt saved to: ${promptFile}\n`);
  }

  const results = [];

  for (const model of MODELS) {
    process.stdout.write(`${model.name.padEnd(20)}... `);
    const result = await callModel(model.id, prompt);
    results.push({ model: model.name, ...result });

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else {
      const ids = result.exercises.map(e => e.id).join(', ');
      console.log(`✅ ${result.exercises.length} exercises (${result.latency}ms)`);
      console.log(`                      IDs: ${ids}`);
    }
  }

  // Analyze variety
  console.log('\n' + '='.repeat(60));
  console.log('VARIETY ANALYSIS');
  console.log('='.repeat(60));

  const variety = analyzeVariety(results);

  console.log(`\nCross-Model Similarity: ${variety.similarity}%`);
  console.log(`  (100% = all models picked identical exercises = BAD)`);
  console.log(`  (0% = no overlap = maximum variety = GOOD)`);
  console.log(`\nUnique Exercises Used: ${variety.uniqueCount} / ${variety.totalPossible}`);

  // Show exercise frequency
  const exerciseFreq = {};
  results.forEach(r => {
    r.exercises?.forEach(e => {
      const name = EXERCISES.find(ex => ex.id === e.id)?.name || e.id;
      exerciseFreq[name] = (exerciseFreq[name] || 0) + 1;
    });
  });

  console.log('\nExercise Selection Frequency:');
  Object.entries(exerciseFreq)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      const bar = '█'.repeat(count);
      console.log(`  ${name.padEnd(30)} ${bar} (${count}/${MODELS.length})`);
    });

  // Verdict
  console.log('\n' + '='.repeat(60));
  if (variety.similarity >= 80) {
    console.log('❌ VARIETY ISSUE: Models selecting nearly identical exercises');
  } else if (variety.similarity >= 50) {
    console.log('⚠️  MODERATE VARIETY: Some overlap but reasonable diversity');
  } else {
    console.log('✅ GOOD VARIETY: Models selecting diverse exercises');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
