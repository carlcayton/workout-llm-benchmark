#!/usr/bin/env node
/**
 * Quick Benchmark - runs 5 scenarios for a single model
 *
 * MODES:
 * - Default: Direct LLM benchmark (tests prompt following)
 *   Usage: OPENROUTER_API_KEY=sk-or-... node benchmark-quick.mjs <model-id> <output-file>
 *
 * - Edge function: BENCHMARK_MODE=edge (tests full pipeline including DB filtering + tier compliance)
 *   Usage: BENCHMARK_MODE=edge node benchmark-quick.mjs edge <output-file>
 */

import fs from 'fs';

const BENCHMARK_MODE = process.env.BENCHMARK_MODE || 'llm';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ivfllbccljoyaayftecd.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZmxsYmNjbGpveWFheWZ0ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTkwMTQsImV4cCI6MjA4MTY5NTAxNH0.TbyTu64syBF3MUExV_6uvu6gPCUnLuT_08k9dPYLqvA';
const MODEL_ID = process.argv[2];
const OUTPUT_FILE = process.argv[3] || (BENCHMARK_MODE === 'edge' ? 'benchmark-edge.json' : `benchmark-${MODEL_ID.replace(/\//g, '-')}.json`);

if (BENCHMARK_MODE === 'edge') {
  console.log('Running in EDGE FUNCTION mode');
} else {
  if (!OPENROUTER_API_KEY || !MODEL_ID) {
    console.error('Usage: OPENROUTER_API_KEY=... node benchmark-quick.mjs <model-id> [output-file]');
    console.error('   OR: BENCHMARK_MODE=edge node benchmark-quick.mjs edge [output-file]');
    process.exit(1);
  }
  console.log('Running in LLM mode');
}

// 7 representative scenarios covering main training styles + compliance tests
const SCENARIOS = [
  {
    name: 'Bodybuilding - Chest & Triceps',
    category: 'bodybuilding',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'upper arms'],
      targetMuscles: ['pectorals', 'triceps'],
      duration: 60,
      experienceLevel: 5,
      goal: 'build_muscle',
    },
    expectations: { setsRange: [3, 4], repsRange: [8, 12], restRange: [60, 90] },
  },
  {
    name: 'Strength - Lower Body',
    category: 'strength',
    request: {
      equipment: ['barbell', 'dumbbell', 'leverage machine'],
      trainingStyle: 'STRENGTH',
      bodyParts: ['upper legs'],
      targetMuscles: ['quads', 'hamstrings', 'glutes'],
      duration: 60,
      experienceLevel: 6,
      goal: 'build_strength',
    },
    expectations: { setsRange: [4, 5], repsRange: [4, 6], restRange: [120, 240] },
  },
  {
    name: 'HIT - Upper Body',
    category: 'hit',
    request: {
      equipment: ['leverage machine', 'cable', 'dumbbell'],
      trainingStyle: 'HIT',
      bodyParts: ['chest', 'back', 'upper arms'],
      targetMuscles: ['pectorals', 'lats', 'biceps', 'triceps'],
      duration: 30,
      experienceLevel: 7,
      goal: 'build_muscle',
    },
    expectations: { setsRange: [1, 2], repsRange: [6, 10], restRange: [120, 180] },
  },
  {
    name: 'Endurance - Full Body Circuit',
    category: 'endurance',
    request: {
      equipment: ['dumbbell', 'kettlebell', 'body weight'],
      trainingStyle: 'ENDURANCE',
      bodyParts: ['chest', 'back', 'upper legs', 'shoulders'],
      targetMuscles: ['pectorals', 'lats', 'quads', 'delts'],
      duration: 45,
      experienceLevel: 4,
      goal: 'stay_fit',
    },
    expectations: { setsRange: [2, 3], repsRange: [15, 20], restRange: [30, 45] },
  },
  {
    name: 'PPL - Push Day',
    category: 'ppl',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'shoulders', 'upper arms'],
      targetMuscles: ['pectorals', 'delts', 'triceps'],
      duration: 60,
      experienceLevel: 5,
      goal: 'build_muscle',
    },
    expectations: { setsRange: [3, 4], repsRange: [8, 12], restRange: [60, 90] },
  },
  {
    name: 'Dumbbell Only - Upper Body',
    category: 'equipment_filter',
    request: {
      equipment: ['dumbbell'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'back', 'upper arms'],
      targetMuscles: ['pectorals', 'lats', 'biceps', 'triceps'],
      duration: 45,
      experienceLevel: 5,
      goal: 'build_muscle',
    },
    expectations: { setsRange: [3, 4], repsRange: [8, 12], restRange: [60, 90] },
  },
  {
    name: 'Chest Day - No Bench Press',
    category: 'exclusion_test',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'upper arms'],
      targetMuscles: ['pectorals', 'triceps'],
      duration: 60,
      experienceLevel: 5,
      goal: 'build_muscle',
      excludedExercises: ['0047', '0025'],
    },
    expectations: { setsRange: [3, 4], repsRange: [8, 12], restRange: [60, 90] },
  },
  {
    name: 'Hybrid - Strength + Bodybuilding Back Day',
    category: 'blend',
    request: {
      equipment: ['barbell', 'dumbbell', 'cable', 'leverage machine'],
      trainingStyles: ['STRENGTH', 'BODYBUILD'], // Blend: compounds get STRENGTH, isolations get BODYBUILD
      bodyParts: ['back'],
      targetMuscles: ['lats', 'traps', 'upper back'],
      duration: 60,
      experienceLevel: 6,
      goal: 'build_strength',
    },
    // Expect: Primary compounds (deadlift, rows) get STRENGTH params (4-5 sets, 4-6 reps, long rest)
    // Secondary/isolation (pulldown, face pulls) get BODYBUILD params (3-4 sets, 8-12 reps, moderate rest)
    expectations: { setsRange: [3, 5], repsRange: [4, 12], restRange: [60, 240] },
  },
];

// Mock exercises for the prompt
const MOCK_EXERCISES = [
  { id: '0047', name: 'barbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell' },
  { id: '0025', name: 'dumbbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell' },
  { id: '1254', name: 'cable crossover', target: 'pectorals', bodyPart: 'chest', equipment: 'cable' },
  { id: '0289', name: 'dumbbell fly', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell' },
  { id: '0200', name: 'tricep pushdown', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable' },
  { id: '0201', name: 'skull crusher', target: 'triceps', bodyPart: 'upper arms', equipment: 'ez barbell' },
  { id: '0027', name: 'barbell bent over row', target: 'lats', bodyPart: 'back', equipment: 'barbell' },
  { id: '0160', name: 'lat pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable' },
  { id: '0117', name: 'barbell deadlift', target: 'lats', bodyPart: 'back', equipment: 'barbell' },
  { id: '0293', name: 'dumbbell bent over row', target: 'lats', bodyPart: 'back', equipment: 'dumbbell' },
  { id: '0863', name: 'seated cable row', target: 'lats', bodyPart: 'back', equipment: 'cable' },
  { id: '0862', name: 'cable face pull', target: 'traps', bodyPart: 'back', equipment: 'cable' },
  { id: '0284', name: 'dumbbell shrug', target: 'traps', bodyPart: 'back', equipment: 'dumbbell' },
  { id: '0294', name: 'dumbbell rear delt fly', target: 'upper back', bodyPart: 'back', equipment: 'dumbbell' },
  { id: '0100', name: 'barbell curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'barbell' },
  { id: '0101', name: 'dumbbell curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell' },
  { id: '0032', name: 'barbell squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell' },
  { id: '0584', name: 'leg press', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine' },
  { id: '0038', name: 'romanian deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell' },
  { id: '0586', name: 'leg curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'leverage machine' },
  { id: '0526', name: 'hip thrust', target: 'glutes', bodyPart: 'upper legs', equipment: 'barbell' },
  { id: '0237', name: 'dumbbell shoulder press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell' },
  { id: '0308', name: 'dumbbell lateral raise', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell' },
  { id: '0527', name: 'kettlebell swing', target: 'glutes', bodyPart: 'upper legs', equipment: 'kettlebell' },
  { id: '0251', name: 'push-up', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight' },
  { id: '0651', name: 'pull-up', target: 'lats', bodyPart: 'back', equipment: 'body weight' },
];

const STYLE_NAMES = {
  BODYBUILD: 'Bodybuilding (Hypertrophy)',
  STRENGTH: 'Strength Training',
  HIT: 'High Intensity Training (Mentzer/Yates)',
  ENDURANCE: 'Muscular Endurance',
};

function buildPrompt(request, exercises) {
  // Handle both single trainingStyle and trainingStyles array (for blends)
  const styles = request.trainingStyles || [request.trainingStyle];
  const styleNames = styles.map(s => STYLE_NAMES[s] || s);
  const isBlend = styles.length > 1;

  const styleDescription = isBlend
    ? `Hybrid (${styleNames.join(' + ')})`
    : styleNames[0];

  const blendNote = isBlend
    ? `\n- HYBRID TRAINING: Use ${styleNames[0]} parameters (heavier, lower reps) for COMPOUND exercises, ${styleNames[1]} parameters (moderate) for ISOLATION exercises`
    : '';

  const exerciseList = exercises
    .filter(e => request.bodyParts.includes(e.bodyPart))
    .map(e => `- ${e.name} (${e.target}, ${e.equipment}) [ID: ${e.id}]`)
    .join('\n');

  const excludedNote = request.excludedExercises && request.excludedExercises.length > 0
    ? `- DO NOT include these exercise IDs: ${request.excludedExercises.join(', ')}`
    : '';

  return `You are a professional fitness trainer creating a personalized workout.

USER PROFILE:
- Goal: ${request.goal}
- Experience: ${request.experienceLevel}/10
- Training Style: ${styleDescription}
- Target Duration: ${request.duration} minutes
- Body Parts: ${request.bodyParts.join(', ')}
- Target Muscles: ${request.targetMuscles.join(', ')}
- Available Equipment: ${request.equipment.join(', ')}
${excludedNote ? '\n' + excludedNote : ''}

AVAILABLE EXERCISES:
${exerciseList}

Create a workout with the following JSON structure:
{
  "title": "Workout title",
  "exercises": [
    {
      "exerciseId": "ID from list",
      "name": "Exercise name",
      "sets": number,
      "reps": number or "range like 8-12",
      "rest": seconds,
      "notes": "optional form cues"
    }
  ],
  "tips": ["1-2 workout tips"]
}

Requirements:
- Use ONLY exercises from the provided list with their exact IDs
- Use ONLY equipment from the available equipment list
- Match parameters to the ${styleDescription} style${blendNote}
- Stay within ${request.duration} minute duration
${excludedNote ? '- Exclude the specified exercise IDs\n' : ''}- Return ONLY valid JSON, no markdown`;
}

async function callEdgeFunction(request) {
  const start = Date.now();

  console.log(`[EDGE_REQ] Sending request to edge function`);
  console.log(`[EDGE_REQ] Timestamp: ${new Date().toISOString()}`);
  console.log(`[EDGE_REQ] Request:`, JSON.stringify(request, null, 2));

  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(request),
  });

  const latency = Date.now() - start;

  console.log(`[EDGE_RES] Response received in ${latency}ms`);
  console.log(`[EDGE_RES] Status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`[EDGE_RES] ERROR: ${errorText}`);
    throw new Error(`Edge function error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  console.log(`[EDGE_RES] Workout title: ${data.title || 'N/A'}`);
  console.log(`[EDGE_RES] Exercise count: ${data.exercises?.length || 0}`);

  return { workout: data, latency };
}

async function callLLM(prompt) {
  const start = Date.now();

  console.log(`[LLM_REQ] Sending request to ${MODEL_ID}`);
  console.log(`[LLM_REQ] Timestamp: ${new Date().toISOString()}`);
  console.log(`[LLM_REQ] Prompt (first 500 chars):\n${prompt.substring(0, 500)}...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const latency = Date.now() - start;
  const data = await response.json();

  console.log(`[LLM_RES] Response received in ${latency}ms`);

  if (data.error) {
    console.log(`[LLM_RES] ERROR: ${data.error.message || JSON.stringify(data.error)}`);
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  const content = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  console.log(`[LLM_RES] Content (first 1000 chars):\n${content.substring(0, 1000)}...`);
  console.log(`[LLM_RES] Token usage: prompt=${usage.prompt_tokens || 'N/A'}, completion=${usage.completion_tokens || 'N/A'}, total=${usage.total_tokens || 'N/A'}`);
  console.log(`[LLM_RES] Latency: ${latency}ms`);

  return { content, latency, usage };
}

async function checkTierCompliance(exercises) {
  console.log(`[TIER_CHECK] Checking tier compliance for ${exercises.length} exercises`);

  // Fetch exercise tiers from Supabase
  const exerciseIds = exercises.map(e => e.id || e.exerciseId).filter(Boolean);

  if (exerciseIds.length === 0) {
    console.log(`[TIER_CHECK] No exercise IDs to check`);
    return { compliance: 100, violations: [] };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/exercises?id=in.(${exerciseIds.join(',')})&select=id,name,tier`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    console.log(`[TIER_CHECK] ERROR: Failed to fetch exercise tiers (${response.status})`);
    return { compliance: null, violations: [], error: 'Failed to fetch tiers' };
  }

  const dbExercises = await response.json();
  console.log(`[TIER_CHECK] Fetched ${dbExercises.length} exercises from DB`);

  const violations = [];

  for (const exercise of exercises) {
    const exerciseId = exercise.id || exercise.exerciseId;
    const dbExercise = dbExercises.find(e => e.id === exerciseId);

    if (!dbExercise) {
      violations.push({
        id: exerciseId,
        name: exercise.name,
        tier: 'NOT_FOUND',
        reason: 'Exercise ID not found in database',
      });
      continue;
    }

    if (dbExercise.tier === 'excluded' || dbExercise.tier === 'catalog') {
      violations.push({
        id: exerciseId,
        name: exercise.name || dbExercise.name,
        tier: dbExercise.tier,
        reason: `Exercise has tier "${dbExercise.tier}" (should only use "core" tier)`,
      });
    }
  }

  const compliance = exercises.length > 0 ? Math.round(((exercises.length - violations.length) / exercises.length) * 100) : 100;

  console.log(`[TIER_CHECK] Compliance: ${compliance}% (${violations.length} violations)`);

  if (violations.length > 0) {
    console.log(`[TIER_CHECK] VIOLATIONS:`);
    violations.forEach(v => {
      console.log(`[TIER_CHECK]   - ${v.name} (ID: ${v.id}, Tier: ${v.tier})`);
      console.log(`[TIER_CHECK]     ${v.reason}`);
    });
  } else {
    console.log(`[TIER_CHECK] ✓ All exercises are tier "core" - compliance passed`);
  }

  return { compliance, violations };
}

function parseJSON(content) {
  console.log(`[PARSE] Attempting to parse JSON response`);

  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = jsonMatch[1].trim();

  console.log(`[PARSE] Extracted string (first 500 chars): ${jsonStr.substring(0, 500)}...`);

  try {
    const parsed = JSON.parse(jsonStr);
    console.log(`[PARSE] SUCCESS - Parsed valid JSON`);
    console.log(`[PARSE] Top-level keys: ${Object.keys(parsed).join(', ')}`);
    console.log(`[PARSE] Exercise count: ${parsed.exercises?.length || 0}`);
    return parsed;
  } catch (e) {
    console.log(`[PARSE] Initial parse failed: ${e.message}`);
    // Try to find JSON object directly
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      console.log(`[PARSE] Attempting fallback parse of extracted object`);
      try {
        const parsed = JSON.parse(objMatch[0]);
        console.log(`[PARSE] FALLBACK SUCCESS - Parsed JSON from extracted object`);
        console.log(`[PARSE] Top-level keys: ${Object.keys(parsed).join(', ')}`);
        console.log(`[PARSE] Exercise count: ${parsed.exercises?.length || 0}`);
        return parsed;
      } catch (e2) {
        console.log(`[PARSE] Fallback parse failed: ${e2.message}`);
      }
    }
    console.log(`[PARSE] FAILED - Could not parse JSON from response`);
    throw new Error('Could not parse JSON');
  }
}

function scoreWorkout(workout, expectations, request) {
  console.log(`[SCORE] Starting workout scoring`);
  console.log(`[SCORE] Expected ranges: sets=[${expectations.setsRange}], reps=[${expectations.repsRange}], rest=[${expectations.restRange}]`);

  let score = 0;
  let maxScore = 0;
  const details = [];

  // Check if we got exercises
  const exercises = workout.exercises || [];
  console.log(`[SCORE] Exercise count: ${exercises.length}`);

  if (exercises.length > 0) {
    score += 20;
    details.push({ check: 'Has exercises', passed: true, points: 20 });
    console.log(`[SCORE] ✓ Has exercises (20 points)`);
  } else {
    details.push({ check: 'Has exercises', passed: false, points: 0 });
    console.log(`[SCORE] ✗ No exercises found (0 points)`);
  }
  maxScore += 20;

  // Check sets range
  const avgSets = exercises.reduce((sum, e) => sum + (e.sets || 0), 0) / Math.max(exercises.length, 1);
  const [minSets, maxSets] = expectations.setsRange;
  const setsInRange = avgSets >= minSets && avgSets <= maxSets;
  if (setsInRange) {
    score += 20;
    details.push({ check: `Sets in range [${minSets}-${maxSets}]`, passed: true, actual: avgSets.toFixed(1), points: 20 });
    console.log(`[SCORE] ✓ Sets in range: ${avgSets.toFixed(1)} (20 points)`);
  } else {
    details.push({ check: `Sets in range [${minSets}-${maxSets}]`, passed: false, actual: avgSets.toFixed(1), points: 0 });
    console.log(`[SCORE] ✗ Sets out of range: ${avgSets.toFixed(1)} (expected ${minSets}-${maxSets}) (0 points)`);
  }
  maxScore += 20;

  // Check reps range
  const repsValues = exercises.map(e => {
    if (typeof e.reps === 'number') return e.reps;
    if (typeof e.reps === 'string') {
      const match = e.reps.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  });
  const avgReps = repsValues.reduce((a, b) => a + b, 0) / Math.max(repsValues.length, 1);
  const [minReps, maxReps] = expectations.repsRange;
  const repsInRange = avgReps >= minReps && avgReps <= maxReps;
  if (repsInRange) {
    score += 20;
    details.push({ check: `Reps in range [${minReps}-${maxReps}]`, passed: true, actual: avgReps.toFixed(1), points: 20 });
    console.log(`[SCORE] ✓ Reps in range: ${avgReps.toFixed(1)} (20 points)`);
  } else {
    details.push({ check: `Reps in range [${minReps}-${maxReps}]`, passed: false, actual: avgReps.toFixed(1), points: 0 });
    console.log(`[SCORE] ✗ Reps out of range: ${avgReps.toFixed(1)} (expected ${minReps}-${maxReps}) (0 points)`);
  }
  maxScore += 20;

  // Check rest range
  const avgRest = exercises.reduce((sum, e) => sum + (e.rest || 0), 0) / Math.max(exercises.length, 1);
  const [minRest, maxRest] = expectations.restRange;
  const restInRange = avgRest >= minRest && avgRest <= maxRest;
  if (restInRange) {
    score += 20;
    details.push({ check: `Rest in range [${minRest}-${maxRest}s]`, passed: true, actual: `${avgRest.toFixed(0)}s`, points: 20 });
    console.log(`[SCORE] ✓ Rest in range: ${avgRest.toFixed(0)}s (20 points)`);
  } else {
    details.push({ check: `Rest in range [${minRest}-${maxRest}s]`, passed: false, actual: `${avgRest.toFixed(0)}s`, points: 0 });
    console.log(`[SCORE] ✗ Rest out of range: ${avgRest.toFixed(0)}s (expected ${minRest}-${maxRest}s) (0 points)`);
  }
  maxScore += 20;

  // Check valid exercise IDs
  const validIds = MOCK_EXERCISES.map(e => e.id);
  const validCount = exercises.filter(e => validIds.includes(e.exerciseId)).length;
  const allValid = validCount === exercises.length && exercises.length > 0;
  if (allValid) {
    score += 20;
    details.push({ check: 'All exercise IDs valid', passed: true, points: 20 });
    console.log(`[SCORE] ✓ All exercise IDs valid: ${validCount}/${exercises.length} (20 points)`);
  } else {
    details.push({ check: 'All exercise IDs valid', passed: false, actual: `${validCount}/${exercises.length}`, points: 0 });
    console.log(`[SCORE] ✗ Invalid exercise IDs: ${validCount}/${exercises.length} valid (0 points)`);
  }
  maxScore += 20;

  const percentage = Math.round((score / maxScore) * 100);
  console.log(`[SCORE] Final score: ${score}/${maxScore} (${percentage}%)`);

  // Calculate equipment compliance (not part of main score, reported separately)
  let equipmentCompliance = null;
  if (request.equipment && exercises.length > 0) {
    const allowedEquipment = request.equipment;
    const compliantCount = exercises.filter(ex => {
      const mockEx = MOCK_EXERCISES.find(m => m.id === ex.exerciseId);
      if (!mockEx) return false;
      return allowedEquipment.includes(mockEx.equipment);
    }).length;
    equipmentCompliance = Math.round((compliantCount / exercises.length) * 100);
    console.log(`[SCORE] Equipment compliance: ${compliantCount}/${exercises.length} (${equipmentCompliance}%)`);

    if (compliantCount < exercises.length) {
      const violations = exercises.filter(ex => {
        const mockEx = MOCK_EXERCISES.find(m => m.id === ex.exerciseId);
        return mockEx && !allowedEquipment.includes(mockEx.equipment);
      }).map(ex => {
        const mockEx = MOCK_EXERCISES.find(m => m.id === ex.exerciseId);
        return `${ex.name} (${mockEx?.equipment})`;
      });
      console.log(`[SCORE] Equipment violations: ${violations.join(', ')}`);
    }
  }

  // Calculate exclusion compliance (not part of main score, reported separately)
  let exclusionCompliance = null;
  if (request.excludedExercises && request.excludedExercises.length > 0) {
    const excludedIds = request.excludedExercises;
    const violations = exercises.filter(ex => excludedIds.includes(ex.exerciseId));
    exclusionCompliance = violations.length === 0 ? 100 : 0;
    console.log(`[SCORE] Exclusion compliance: ${exclusionCompliance}% (${violations.length} violations)`);

    if (violations.length > 0) {
      console.log(`[SCORE] Excluded exercises that appeared: ${violations.map(v => v.name).join(', ')}`);
    }
  }

  return {
    score,
    maxScore,
    percentage,
    details,
    equipmentCompliance,
    exclusionCompliance,
    tierCompliance: null, // Will be populated in edge function mode
    tierViolations: []
  };
}

async function runBenchmark() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Quick Benchmark: ${BENCHMARK_MODE === 'edge' ? 'Edge Function' : MODEL_ID}`);
  console.log(`${'═'.repeat(60)}\n`);

  const results = {
    model: BENCHMARK_MODE === 'edge' ? 'edge-function' : MODEL_ID,
    mode: BENCHMARK_MODE,
    timestamp: new Date().toISOString(),
    scenarios: [],
    summary: { totalScore: 0, maxScore: 0, avgLatency: 0, errors: 0 },
  };

  let totalLatency = 0;

  for (let i = 0; i < SCENARIOS.length; i++) {
    const scenario = SCENARIOS[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`[${i + 1}/${SCENARIOS.length}] ${scenario.name}...`);
    console.log(`${'─'.repeat(60)}`);

    try {
      let workout, latency, usage;

      if (BENCHMARK_MODE === 'edge') {
        // Edge function mode: call the real edge function
        // Handle both trainingStyle (single) and trainingStyles (array for blends)
        const styles = scenario.request.trainingStyles || [scenario.request.trainingStyle];
        const edgeRequest = {
          equipment: scenario.request.equipment,
          selectedStyles: styles,
          bodyParts: scenario.request.bodyParts,
          targetMuscles: scenario.request.targetMuscles,
          duration: scenario.request.duration,
          experienceLevel: scenario.request.experienceLevel,
          goal: scenario.request.goal,
          excludedExercises: scenario.request.excludedExercises || [],
        };

        const response = await callEdgeFunction(edgeRequest);
        workout = response.workout;
        latency = response.latency;
        usage = null; // Not available in edge function mode
      } else {
        // LLM mode: call OpenRouter directly
        const prompt = buildPrompt(scenario.request, MOCK_EXERCISES);
        const response = await callLLM(prompt);
        workout = parseJSON(response.content);
        latency = response.latency;
        usage = response.usage;
      }

      totalLatency += latency;

      const scoring = scoreWorkout(workout, scenario.expectations, scenario.request);

      console.log(`[EXERCISE] Processing ${workout.exercises?.length || 0} exercises`);

      // Check tier compliance in edge function mode
      if (BENCHMARK_MODE === 'edge' && workout.exercises && workout.exercises.length > 0) {
        const tierCheck = await checkTierCompliance(workout.exercises);
        scoring.tierCompliance = tierCheck.compliance;
        scoring.tierViolations = tierCheck.violations;
      }

      // Format exercises with GIF URLs
      const formattedExercises = (workout.exercises || []).map((ex, idx) => {
        const mockEx = MOCK_EXERCISES.find(m => m.id === (ex.exerciseId || ex.id));
        const formatted = {
          id: ex.exerciseId || ex.id,
          name: ex.name || mockEx?.name || 'Unknown',
          sets: ex.sets || 0,
          reps: typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps) || 0,
          restSeconds: ex.rest || ex.restSeconds || 0,
          notes: ex.notes || '',
          gifUrl: `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${ex.exerciseId || ex.id}.gif`,
        };

        console.log(`[EXERCISE] ${idx + 1}. ${formatted.name}`);
        console.log(`[EXERCISE]    ID: ${formatted.id}, Sets: ${formatted.sets}, Reps: ${formatted.reps}, Rest: ${formatted.restSeconds}s`);
        console.log(`[EXERCISE]    Notes: ${formatted.notes || 'None'}`);

        return formatted;
      });

      // Calculate averages for UI display
      const avgSets = formattedExercises.length > 0
        ? (formattedExercises.reduce((sum, e) => sum + e.sets, 0) / formattedExercises.length).toFixed(1)
        : '0';
      const avgReps = formattedExercises.length > 0
        ? Math.round(formattedExercises.reduce((sum, e) => sum + e.reps, 0) / formattedExercises.length)
        : 0;
      const avgRest = formattedExercises.length > 0
        ? Math.round(formattedExercises.reduce((sum, e) => sum + e.restSeconds, 0) / formattedExercises.length)
        : 0;

      console.log(`[SUMMARY] Total exercises: ${formattedExercises.length}`);
      console.log(`[SUMMARY] Averages: ${avgSets} sets, ${avgReps} reps, ${avgRest}s rest`);
      console.log(`[SUMMARY] Workout title: "${workout.title || 'N/A'}"`);
      console.log(`[SUMMARY] Tips provided: ${workout.tips?.length || 0}`);

      // Check for missing data
      const missingData = [];
      if (!workout.title || workout.title === 'Generated Workout') missingData.push('title (generic or missing)');
      if (!workout.tips || workout.tips.length === 0) missingData.push('tips');
      formattedExercises.forEach((ex, idx) => {
        if (!ex.sets) missingData.push(`exercise ${idx + 1} sets`);
        if (!ex.reps) missingData.push(`exercise ${idx + 1} reps`);
        if (!ex.restSeconds) missingData.push(`exercise ${idx + 1} rest`);
      });

      if (missingData.length > 0) {
        console.log(`[SUMMARY] ⚠️ Missing data: ${missingData.join(', ')}`);
      } else {
        console.log(`[SUMMARY] ✓ All required data present`);
      }

      // Handle both single style and blend styles
      const scenarioStyles = scenario.request.trainingStyles || [scenario.request.trainingStyle];
      results.scenarios.push({
        name: scenario.name,
        category: scenario.category,
        style: scenarioStyles.length > 1 ? scenarioStyles.join('+') : scenarioStyles[0],
        styles: scenarioStyles, // Array for detailed tracking
        latency,
        score: scoring.percentage,
        exerciseCount: formattedExercises.length,
        exercises: formattedExercises,
        avgSets,
        avgReps,
        avgRest,
        details: scoring.details,
        equipmentCompliance: scoring.equipmentCompliance,
        exclusionCompliance: scoring.exclusionCompliance,
        tierCompliance: scoring.tierCompliance,
        tierViolations: scoring.tierViolations,
        usage,
      });

      results.summary.totalScore += scoring.score;
      results.summary.maxScore += scoring.maxScore;

      console.log(`\n✓ Scenario Complete - Score: ${scoring.percentage}% | Latency: ${latency}ms | Exercises: ${workout.exercises?.length || 0}`);
    } catch (error) {
      console.log(`\n✗ Scenario Failed - Error: ${error.message}`);
      console.log(`[SUMMARY] No exercises captured due to error`);
      const errorStyles = scenario.request.trainingStyles || [scenario.request.trainingStyle];
      results.scenarios.push({
        name: scenario.name,
        category: scenario.category,
        style: errorStyles.length > 1 ? errorStyles.join('+') : errorStyles[0],
        styles: errorStyles,
        error: error.message,
        score: 0,
      });
      results.summary.errors++;
    }
  }

  results.summary.avgLatency = Math.round(totalLatency / SCENARIOS.length);
  results.summary.overallScore = Math.round((results.summary.totalScore / results.summary.maxScore) * 100);

  // Calculate tier compliance summary (edge function mode only)
  if (BENCHMARK_MODE === 'edge') {
    const scenariosWithTier = results.scenarios.filter(s => s.tierCompliance !== null && s.tierCompliance !== undefined);
    if (scenariosWithTier.length > 0) {
      const avgTierCompliance = scenariosWithTier.reduce((sum, s) => sum + s.tierCompliance, 0) / scenariosWithTier.length;
      const totalViolations = scenariosWithTier.reduce((sum, s) => sum + (s.tierViolations?.length || 0), 0);
      results.summary.avgTierCompliance = Math.round(avgTierCompliance);
      results.summary.totalTierViolations = totalViolations;
    }
  }

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${OUTPUT_FILE}`);

  // Print summary
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`SUMMARY: ${BENCHMARK_MODE === 'edge' ? 'Edge Function' : MODEL_ID}`);
  console.log(`${'─'.repeat(40)}`);
  console.log(`Overall Score: ${results.summary.overallScore}%`);
  console.log(`Avg Latency:   ${results.summary.avgLatency}ms`);
  console.log(`Errors:        ${results.summary.errors}/${SCENARIOS.length}`);
  if (BENCHMARK_MODE === 'edge' && results.summary.avgTierCompliance !== undefined) {
    console.log(`Tier Compliance: ${results.summary.avgTierCompliance}% (${results.summary.totalTierViolations} violations)`);
  }
  console.log(`${'─'.repeat(40)}\n`);

  return results;
}

runBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
