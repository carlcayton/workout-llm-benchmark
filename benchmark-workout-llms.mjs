#!/usr/bin/env node
/**
 * LLM Workout Generation Benchmark
 *
 * Compares workout outputs from different LLMs given the same equipment config.
 * Outputs results to both JSON and Markdown for easy comparison.
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-or-... node scripts/benchmark-workout-llms.mjs
 *   npm run benchmark:llm
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY environment variable is required');
  console.error('   Usage: OPENROUTER_API_KEY=sk-or-... node scripts/benchmark-workout-llms.mjs');
  process.exit(1);
}

// ============================================================================
// MODELS TO BENCHMARK (Dec 2025 - from PROTOTYPE-SHOWCASE-PLAN.md)
// ============================================================================
const MODELS = [
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', tier: 'premium' },
  { id: 'openai/gpt-5', name: 'GPT-5', tier: 'premium' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', tier: 'premium' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude 4.5 Haiku', tier: 'fast' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', tier: 'fast' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1', tier: 'fast' },
];

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

// ============================================================================
// TEST SCENARIOS
// ============================================================================
const TEST_SCENARIOS = [
  {
    name: 'Home Gym - Upper Body',
    request: {
      equipment: ['dumbbell', 'barbell', 'flat bench', 'pull-up bar'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'back', 'shoulders'],
      targetMuscles: ['pectorals', 'lats', 'delts'],
      duration: 45,
      experienceLevel: 5,
      goal: 'build_muscle',
    },
  },
  {
    name: 'Minimal Equipment - Full Body',
    request: {
      equipment: ['body weight', 'resistance band'],
      trainingStyle: 'HIT',
      bodyParts: ['full_body'],
      duration: 30,
      experienceLevel: 5,
      goal: 'get_lean',
    },
  },
  {
    name: 'Commercial Gym - Leg Day',
    request: {
      equipment: ['barbell', 'dumbbell', 'leg press', 'cable'],
      trainingStyle: 'STRENGTH',
      bodyParts: ['legs', 'glutes'],
      targetMuscles: ['quads', 'hamstrings', 'glutes'],
      duration: 60,
      experienceLevel: 5,
      goal: 'build_strength',
    },
  },
  {
    name: 'Kettlebell Only - Push/Pull',
    request: {
      equipment: ['kettlebell'],
      trainingStyle: 'BODYBUILD',
      bodyParts: ['chest', 'back', 'shoulders'],
      duration: 40,
      experienceLevel: 5,
      goal: 'build_muscle',
    },
  },
];

// ============================================================================
// MOCK EXERCISES (simplified for benchmark - real system queries DB)
// ============================================================================
const MOCK_EXERCISES = [
  // Chest
  { id: '0025', name: 'dumbbell bench press', target: 'pectorals', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: '0047', name: 'barbell bench press', target: 'pectorals', equipment: 'barbell', difficulty: 'intermediate' },
  { id: '0251', name: 'push-up', target: 'pectorals', equipment: 'body weight', difficulty: 'beginner' },
  { id: '1254', name: 'cable crossover', target: 'pectorals', equipment: 'cable', difficulty: 'intermediate' },
  { id: '0289', name: 'dumbbell fly', target: 'pectorals', equipment: 'dumbbell', difficulty: 'intermediate' },

  // Back
  { id: '0027', name: 'barbell bent over row', target: 'lats', equipment: 'barbell', difficulty: 'intermediate' },
  { id: '0294', name: 'dumbbell row', target: 'lats', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '0651', name: 'pull-up', target: 'lats', equipment: 'body weight', difficulty: 'intermediate' },
  { id: '0160', name: 'lat pulldown', target: 'lats', equipment: 'cable', difficulty: 'beginner' },
  { id: '0293', name: 'dumbbell pullover', target: 'lats', equipment: 'dumbbell', difficulty: 'intermediate' },

  // Shoulders
  { id: '0237', name: 'dumbbell shoulder press', target: 'delts', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: '0036', name: 'barbell overhead press', target: 'delts', equipment: 'barbell', difficulty: 'intermediate' },
  { id: '0308', name: 'dumbbell lateral raise', target: 'delts', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '0518', name: 'cable face pull', target: 'delts', equipment: 'cable', difficulty: 'intermediate' },

  // Legs
  { id: '0032', name: 'barbell squat', target: 'quads', equipment: 'barbell', difficulty: 'intermediate' },
  { id: '0278', name: 'dumbbell lunge', target: 'quads', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: '0584', name: 'leg press', target: 'quads', equipment: 'leg press', difficulty: 'beginner' },
  { id: '0038', name: 'barbell deadlift', target: 'hamstrings', equipment: 'barbell', difficulty: 'advanced' },
  { id: '1460', name: 'cable pull through', target: 'glutes', equipment: 'cable', difficulty: 'intermediate' },
  { id: '0526', name: 'hip thrust', target: 'glutes', equipment: 'body weight', difficulty: 'beginner' },

  // Kettlebell exercises
  { id: '0527', name: 'kettlebell swing', target: 'glutes', equipment: 'kettlebell', difficulty: 'intermediate' },
  { id: '0528', name: 'kettlebell goblet squat', target: 'quads', equipment: 'kettlebell', difficulty: 'beginner' },
  { id: '0529', name: 'kettlebell clean and press', target: 'delts', equipment: 'kettlebell', difficulty: 'intermediate' },
  { id: '0530', name: 'kettlebell row', target: 'lats', equipment: 'kettlebell', difficulty: 'beginner' },
  { id: '0531', name: 'kettlebell floor press', target: 'pectorals', equipment: 'kettlebell', difficulty: 'intermediate' },

  // Body weight / bands
  { id: '0654', name: 'squat', target: 'quads', equipment: 'body weight', difficulty: 'beginner' },
  { id: '0655', name: 'lunge', target: 'quads', equipment: 'body weight', difficulty: 'beginner' },
  { id: '0656', name: 'burpee', target: 'cardiovascular system', equipment: 'body weight', difficulty: 'intermediate' },
  { id: '0657', name: 'mountain climber', target: 'abs', equipment: 'body weight', difficulty: 'beginner' },
  { id: '0701', name: 'resistance band row', target: 'lats', equipment: 'band', difficulty: 'beginner' },
  { id: '0702', name: 'resistance band chest press', target: 'pectorals', equipment: 'band', difficulty: 'beginner' },
  { id: '0703', name: 'resistance band squat', target: 'quads', equipment: 'band', difficulty: 'beginner' },
];

// ============================================================================
// PROMPT BUILDER (matches generate-workout edge function)
// ============================================================================
function buildWorkoutPrompt(request, exerciseList) {
  return `You are a professional fitness trainer creating a personalized workout.

USER PROFILE:
- Goal: ${request.goal}
- Experience: ${request.experienceLevel}
- Training Style: ${request.trainingStyle}
- Target Duration: ${request.duration} minutes
- Body Parts: ${request.bodyParts.join(', ')}
- Target Muscles: ${request.targetMuscles?.length ? request.targetMuscles.join(', ') : 'any'}
- Available Equipment: ${request.equipment.length > 0 ? request.equipment.join(', ') : 'body weight only'}

CRITICAL EQUIPMENT RULE:
- User's equipment: ${request.equipment.length > 0 ? request.equipment.join(', ') : 'body weight only'}
- You MUST ONLY select exercises that use the user's available equipment
- Body weight exercises are ONLY allowed if user explicitly listed "body weight"

AVAILABLE EXERCISES (pick from these ONLY):
${JSON.stringify(exerciseList, null, 2)}

Create a workout program. Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "title": "Workout title",
  "description": "Brief description",
  "estimatedDuration": ${request.duration},
  "sections": [
    {
      "name": "Section name",
      "exercises": [
        {
          "id": "exercise id",
          "sets": 3,
          "reps": 10,
          "restSeconds": 60,
          "notes": "Optional tips"
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Guidelines:
- Select 4-8 exercises total based on duration
- ALL exercises MUST match user's equipment
- reps must be a single integer (not a range string)
- Match sets/reps/rest to the goal:
  - Build muscle: 3-4 sets, 8-12 reps, 60-90s rest
  - Get lean: 3 sets, 12-15 reps, 45-60s rest
  - Build strength: 4-5 sets, 4-6 reps, 120-180s rest`;
}

// ============================================================================
// OPENROUTER API CALL (with retry logic)
// ============================================================================
async function callOpenRouter(modelId, prompt, retryCount = 0) {
  const startTime = Date.now();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fitness-app-benchmark.local',
        'X-Title': 'Fitness App LLM Benchmark',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      // Retry on 5xx errors or rate limits (429)
      if ((response.status >= 500 || response.status === 429) && retryCount < MAX_RETRIES) {
        console.log(`\n      ⏳ Retry ${retryCount + 1}/${MAX_RETRIES} for ${modelId} (${response.status})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
        return callOpenRouter(modelId, prompt, retryCount + 1);
      }
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
        rawResponse: null,
        parsedWorkout: null,
        retries: retryCount,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsedWorkout = null;
    let parseError = null;

    try {
      let jsonString = content.trim();
      if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
      if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
      if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
      jsonString = jsonString.trim();
      parsedWorkout = JSON.parse(jsonString);
    } catch (e) {
      parseError = e.message;
      // Retry on parse errors (model returned bad JSON)
      if (retryCount < MAX_RETRIES) {
        console.log(`\n      ⏳ Retry ${retryCount + 1}/${MAX_RETRIES} for ${modelId} (parse error)...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return callOpenRouter(modelId, prompt, retryCount + 1);
      }
    }

    return {
      success: true,
      latency,
      rawResponse: content,
      parsedWorkout,
      parseError,
      usage: data.usage,
      retries: retryCount,
    };
  } catch (error) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(`\n      ⏳ Retry ${retryCount + 1}/${MAX_RETRIES} for ${modelId} (${error.message})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
      return callOpenRouter(modelId, prompt, retryCount + 1);
    }
    return {
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
      rawResponse: null,
      parsedWorkout: null,
      retries: retryCount,
    };
  }
}

// ============================================================================
// WORKOUT QUALITY METRICS
// ============================================================================
function analyzeWorkout(workout, request) {
  if (!workout) return null;

  const allExercises = workout.sections?.flatMap(s => s.exercises) || [];
  const equipmentMatch = allExercises.filter(ex => {
    const exerciseInfo = MOCK_EXERCISES.find(m => m.id === ex.id);
    return exerciseInfo && request.equipment.some(eq =>
      exerciseInfo.equipment.toLowerCase().includes(eq.toLowerCase())
    );
  });

  return {
    exerciseCount: allExercises.length,
    sectionCount: workout.sections?.length || 0,
    hasTitle: !!workout.title,
    hasDescription: !!workout.description,
    hasTips: workout.tips?.length > 0,
    equipmentMatchRate: allExercises.length > 0
      ? Math.round((equipmentMatch.length / allExercises.length) * 100)
      : 0,
    avgSets: allExercises.length > 0
      ? Math.round(allExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0) / allExercises.length * 10) / 10
      : 0,
    exercises: allExercises.map(ex => ({
      id: ex.id,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.restSeconds,
    })),
  };
}

// ============================================================================
// MAIN BENCHMARK RUNNER
// ============================================================================
async function runBenchmark() {
  console.log('🏋️ LLM Workout Generation Benchmark');
  console.log('=====================================\n');
  console.log(`Testing ${MODELS.length} models across ${TEST_SCENARIOS.length} scenarios\n`);

  const results = {
    timestamp: new Date().toISOString(),
    models: MODELS,
    scenarios: [],
  };

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`   Equipment: ${scenario.request.equipment.join(', ')}`);
    console.log(`   Body Parts: ${scenario.request.bodyParts.join(', ')}`);
    console.log('-'.repeat(60));

    // Filter exercises for this scenario's equipment
    const availableExercises = MOCK_EXERCISES.filter(ex =>
      scenario.request.equipment.some(eq =>
        ex.equipment.toLowerCase().includes(eq.toLowerCase()) ||
        (eq === 'body weight' && ex.equipment === 'body weight') ||
        (eq === 'resistance band' && ex.equipment === 'band')
      )
    ).map(ex => ({
      id: ex.id,
      name: ex.name,
      target: ex.target,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
    }));

    console.log(`   Available exercises: ${availableExercises.length}`);

    const prompt = buildWorkoutPrompt(scenario.request, availableExercises);
    const scenarioResults = {
      name: scenario.name,
      request: scenario.request,
      exercisesAvailable: availableExercises.length,
      modelResults: [],
    };

    for (const model of MODELS) {
      process.stdout.write(`   Testing ${model.name}... `);

      const result = await callOpenRouter(model.id, prompt);
      const metrics = analyzeWorkout(result.parsedWorkout, scenario.request);

      scenarioResults.modelResults.push({
        model: model,
        ...result,
        metrics,
      });

      if (result.success && result.parsedWorkout) {
        console.log(`✅ ${result.latency}ms | ${metrics?.exerciseCount || 0} exercises | ${metrics?.equipmentMatchRate || 0}% equipment match`);
      } else if (result.success && result.parseError) {
        console.log(`⚠️  ${result.latency}ms | Parse error: ${result.parseError}`);
      } else {
        console.log(`❌ ${result.latency}ms | ${result.error}`);
      }

      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.scenarios.push(scenarioResults);
  }

  // Save results
  const outputDir = path.join(__dirname, '../benchmark-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save JSON
  const jsonPath = path.join(outputDir, `workout-llm-benchmark-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 JSON results saved to: ${jsonPath}`);

  // Generate Markdown report
  const mdPath = path.join(outputDir, `workout-llm-benchmark-${timestamp}.md`);
  const mdContent = generateMarkdownReport(results);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`📄 Markdown report saved to: ${mdPath}`);

  // Print summary
  printSummary(results);
}

// ============================================================================
// MARKDOWN REPORT GENERATOR
// ============================================================================
function generateMarkdownReport(results) {
  let md = `# LLM Workout Generation Benchmark\n\n`;
  md += `**Generated:** ${results.timestamp}\n\n`;
  md += `## Models Tested\n\n`;
  md += `| Model | Tier |\n|-------|------|\n`;
  for (const model of results.models) {
    md += `| ${model.name} | ${model.tier} |\n`;
  }

  md += `\n## Results by Scenario\n\n`;

  for (const scenario of results.scenarios) {
    md += `### ${scenario.name}\n\n`;
    md += `**Config:** ${scenario.request.equipment.join(', ')} | ${scenario.request.bodyParts.join(', ')} | ${scenario.request.duration}min\n\n`;

    md += `| Model | Status | Latency | Exercises | Equipment Match | Sets (avg) |\n`;
    md += `|-------|--------|---------|-----------|-----------------|------------|\n`;

    for (const result of scenario.modelResults) {
      const status = result.success && result.parsedWorkout ? '✅' : result.success ? '⚠️' : '❌';
      const latency = `${result.latency}ms`;
      const exercises = result.metrics?.exerciseCount || '-';
      const equipMatch = result.metrics ? `${result.metrics.equipmentMatchRate}%` : '-';
      const avgSets = result.metrics?.avgSets || '-';

      md += `| ${result.model.name} | ${status} | ${latency} | ${exercises} | ${equipMatch} | ${avgSets} |\n`;
    }

    md += `\n#### Workout Titles\n\n`;
    for (const result of scenario.modelResults) {
      if (result.parsedWorkout?.title) {
        md += `- **${result.model.name}:** "${result.parsedWorkout.title}"\n`;
      }
    }

    md += `\n#### Exercise Selection Comparison\n\n`;
    for (const result of scenario.modelResults) {
      if (result.metrics?.exercises?.length > 0) {
        const exerciseNames = result.metrics.exercises.map(ex => {
          const info = MOCK_EXERCISES.find(m => m.id === ex.id);
          return info?.name || ex.id;
        }).join(', ');
        md += `- **${result.model.name}:** ${exerciseNames}\n`;
      }
    }

    md += `\n---\n\n`;
  }

  return md;
}

// ============================================================================
// SUMMARY PRINTER
// ============================================================================
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BENCHMARK SUMMARY');
  console.log('='.repeat(60));

  // Calculate aggregate stats per model
  const modelStats = {};

  for (const model of results.models) {
    modelStats[model.id] = {
      name: model.name,
      successCount: 0,
      totalLatency: 0,
      avgEquipmentMatch: 0,
      avgExercises: 0,
      count: 0,
    };
  }

  for (const scenario of results.scenarios) {
    for (const result of scenario.modelResults) {
      const stats = modelStats[result.model.id];
      stats.count++;
      if (result.success && result.parsedWorkout) {
        stats.successCount++;
        stats.totalLatency += result.latency;
        stats.avgEquipmentMatch += result.metrics?.equipmentMatchRate || 0;
        stats.avgExercises += result.metrics?.exerciseCount || 0;
      }
    }
  }

  console.log('\n| Model | Success Rate | Avg Latency | Avg Equip Match | Avg Exercises |');
  console.log('|-------|--------------|-------------|-----------------|---------------|');

  for (const model of results.models) {
    const stats = modelStats[model.id];
    const successRate = `${Math.round((stats.successCount / stats.count) * 100)}%`;
    const avgLatency = stats.successCount > 0 ? `${Math.round(stats.totalLatency / stats.successCount)}ms` : '-';
    const avgEquip = stats.successCount > 0 ? `${Math.round(stats.avgEquipmentMatch / stats.successCount)}%` : '-';
    const avgEx = stats.successCount > 0 ? (stats.avgExercises / stats.successCount).toFixed(1) : '-';

    console.log(`| ${stats.name.padEnd(20)} | ${successRate.padEnd(12)} | ${avgLatency.padEnd(11)} | ${avgEquip.padEnd(15)} | ${avgEx.padEnd(13)} |`);
  }

  console.log('\n🏁 Benchmark complete!\n');
}

// Run the benchmark
runBenchmark().catch(console.error);
