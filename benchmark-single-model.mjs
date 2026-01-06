#!/usr/bin/env node
/**
 * Single Model Benchmark Runner - Production Edge Function Edition
 *
 * Tests the PRODUCTION Supabase edge function (generate-workout) by running
 * scenarios with a single model via the ?model=<model-id> parameter.
 *
 * This tests the complete production stack including:
 * - Edge function validation and normalization
 * - Exercise database queries
 * - 2-call LLM chain orchestrator (Exercise Selector + Param Assigner)
 * - Response enrichment with GIF URLs
 *
 * Usage:
 *   node benchmark-single-model.mjs openai/gpt-5           # Run all 26 scenarios
 *   LIMIT=5 node benchmark-single-model.mjs openai/gpt-5   # Run first 5 scenarios only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  MOCK_EXERCISES,
  TEST_SCENARIOS,
  MODELS,
  calculateEnhancedMetrics,
} from './benchmark-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Production Supabase edge function endpoint
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ivfllbccljoyaayftecd.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-workout`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZmxsYmNjbGpveWFheWZ0ZWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTkwMTQsImV4cCI6MjA4MTY5NTAxNH0.714kFWsFFKwVAywLY5NOyZz2_eMoi7-Js8JGCwtpycs';

// ============================================================================
// VALIDATE INPUTS
// ============================================================================

const modelId = process.argv[2];

if (!modelId) {
  console.error('Model ID is required as first argument');
  console.error('Usage: OPENROUTER_API_KEY=sk-or-... node benchmark-single-model.mjs <model-id>');
  console.error('\nAvailable models:');
  for (const model of MODELS) {
    console.error(`  ${model.id} (${model.name})`);
  }
  process.exit(1);
}

// Find model info from MODELS array, or create a generic entry
const modelInfo = MODELS.find(m => m.id === modelId) || {
  id: modelId,
  name: modelId.split('/').pop() || modelId,
  tier: 'unknown',
};

// Support LIMIT and OFFSET env vars for quick test runs
// e.g., LIMIT=5 OFFSET=5 node benchmark-single-model.mjs openai/gpt-5  # Run scenarios 6-10
const SCENARIO_OFFSET = parseInt(process.env.OFFSET, 10) || 0;
const SCENARIO_LIMIT = parseInt(process.env.LIMIT, 10) || TEST_SCENARIOS.length;
let SCENARIOS_TO_RUN = TEST_SCENARIOS.slice(SCENARIO_OFFSET, SCENARIO_OFFSET + SCENARIO_LIMIT);

// Support specific scenario indices
// e.g., SCENARIOS=0,5,6,8,19 node benchmark-single-model.mjs openai/gpt-5
if (process.env.SCENARIOS) {
  const indices = process.env.SCENARIOS.split(',').map(i => parseInt(i.trim(), 10));
  SCENARIOS_TO_RUN = indices.map(i => TEST_SCENARIOS[i]).filter(Boolean);
  console.log(`Running specific scenarios: ${indices.join(', ')}`);
}

// TEMPORARY: Duration permutation for testing time adherence
// e.g., DURATIONS=30,45,60 node benchmark-single-model.mjs ...
// This multiplies each scenario by the number of durations specified
if (process.env.DURATIONS) {
  const durations = process.env.DURATIONS.split(',').map(d => parseInt(d.trim(), 10));
  const permuted = [];
  for (const scenario of SCENARIOS_TO_RUN) {
    for (const duration of durations) {
      permuted.push({
        ...scenario,
        name: `${scenario.name} (${duration}min)`,
        request: { ...scenario.request, duration },
      });
    }
  }
  SCENARIOS_TO_RUN = permuted;
  console.log(`Duration permutation enabled: ${durations.join(', ')} min`);
}

// ============================================================================
// TRAINING STYLE MAPPING
// ============================================================================

// Map benchmark training style IDs to edge function format
function mapTrainingStyle(benchmarkStyle) {
  const mapping = {
    'classic_bodybuilding': 'BODYBUILD',
    'strength_focused': 'STRENGTH',
    'high_intensity_hit': 'HIT',
    'muscular_endurance': 'ENDURANCE',
    'functional_fitness': 'ENDURANCE', // Map to closest equivalent
  };
  return mapping[benchmarkStyle] || benchmarkStyle.toUpperCase();
}

// Map benchmark split IDs to edge function format
// Edge function validation expects: full_body, upper_lower, push_pull_legs, arnold_split, bro_split
function mapWorkoutSplit(benchmarkSplit) {
  // No mapping needed - benchmark scenarios already use edge function format
  return benchmarkSplit;
}

// ============================================================================
// EDGE FUNCTION API CALL
// ============================================================================

async function callEdgeFunction(modelId, scenarioRequest) {
  const startTime = Date.now();

  try {
    // Build edge function URL with model parameter
    const url = `${EDGE_FUNCTION_URL}?model=${encodeURIComponent(modelId)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarioRequest),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
        rawResponse: null,
        parsedWorkout: null,
      };
    }

    const data = await response.json();

    // Edge function returns { workout, meta } structure
    if (data.error) {
      return {
        success: false,
        error: data.error,
        latency,
        rawResponse: null,
        parsedWorkout: null,
      };
    }

    // Success - workout is already parsed and enriched by edge function
    return {
      success: true,
      latency,
      rawResponse: JSON.stringify(data.workout),
      parsedWorkout: data.workout,
      parseError: null,
      meta: data.meta,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      latency: Date.now() - startTime,
      rawResponse: null,
      parsedWorkout: null,
    };
  }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function runSingleModelBenchmark() {
  console.log(`Single Model Benchmark: ${modelInfo.name}`);
  console.log('='.repeat(60));
  console.log(`Model ID: ${modelId}`);
  console.log(`Tier: ${modelInfo.tier}`);
  console.log(`Scenarios: ${SCENARIOS_TO_RUN.length}${SCENARIO_LIMIT < TEST_SCENARIOS.length ? ` (limited from ${TEST_SCENARIOS.length})` : ''}`);
  console.log('='.repeat(60) + '\n');

  const timestamp = new Date().toISOString();

  const results = {
    modelId: modelInfo.id,
    modelName: modelInfo.name,
    tier: modelInfo.tier,
    timestamp,
    totalScenarios: SCENARIOS_TO_RUN.length,
    scenarios: [],
    summary: {
      successCount: 0,
      parseErrorCount: 0,
      apiErrorCount: 0,
      totalLatency: 0,
      avgLatency: 0,
      avgExerciseCount: 0,
      avgEquipmentMatchRate: 0,
      avgSets: 0,
      avgRest: 0,
      repsCounts: {},
      avgReps: '-',
    },
  };

  // Tracking for summary calculations
  let totalExerciseCount = 0;
  let totalEquipmentMatchRate = 0;
  let totalSets = 0;
  let totalRest = 0;

  for (let i = 0; i < SCENARIOS_TO_RUN.length; i++) {
    const scenario = SCENARIOS_TO_RUN[i];
    const scenarioNum = i + 1;

    console.log(`[${scenarioNum}/${SCENARIOS_TO_RUN.length}] ${scenario.name}`);
    console.log(`  Style: ${(scenario.request.trainingStyles || [scenario.request.trainingStyle]).join(', ')}`);

    // Build edge function request payload
    // Map scenario.request to WorkoutRequest format expected by edge function
    const benchmarkStyles = scenario.request.trainingStyles || [scenario.request.trainingStyle];
    const mappedStyles = benchmarkStyles.map(mapTrainingStyle);

    const dayTypeValue = scenario.request.splitDayType || scenario.dayFocus?.toLowerCase() || null;
    const edgeRequest = {
      equipment: scenario.request.equipment || [],
      bodyParts: scenario.request.bodyParts || [],
      targetMuscles: scenario.request.targetMuscles || [],
      duration: scenario.request.duration || 60,
      experienceLevel: scenario.request.experienceLevel || 'intermediate',
      selectedStyles: mappedStyles,
      goal: scenario.request.goal || 'general fitness',
      workoutSplit: scenario.split ? mapWorkoutSplit(scenario.split) : null,
      dayType: dayTypeValue,  // Edge function checks this first
      splitDayType: dayTypeValue,  // Fallback
      excludedAreas: scenario.request.excludedAreas || [],
      // Match real app API surface
      recentlyUsedExerciseIds: [],  // Empty for benchmark (clean slate each run)
      includeWarmup: true,
    };

    // Call production edge function
    process.stdout.write('  Calling edge function... ');
    const result = await callEdgeFunction(modelId, edgeRequest);

    // Calculate metrics from edge function workout response
    // Edge function returns enriched workout with sections/exercises or circuits
    const metrics = calculateEnhancedMetrics(result.parsedWorkout, edgeRequest, MOCK_EXERCISES);

    // Store scenario result
    const scenarioResult = {
      name: scenario.name,
      split: scenario.split || null,
      dayFocus: scenario.dayFocus || null,
      duration: scenario.request.duration || 60,  // Include duration for UI filtering
      trainingStyles: scenario.request.trainingStyles || null,
      category: scenario.category,
      trainingStyle: scenario.request.trainingStyle,
      equipment: edgeRequest.equipment,
      success: result.success && !!result.parsedWorkout,
      latency: result.latency,
      exerciseCount: metrics.exerciseCount,
      equipmentMatchRate: metrics.equipmentMatchRate,
      avgSets: metrics.avgSets,
      avgReps: metrics.avgReps,
      avgRest: metrics.avgRest,
      error: result.error || result.parseError || null,
      workout: result.parsedWorkout,
      meta: result.meta || null,  // Include edge function debug info
    };

    results.scenarios.push(scenarioResult);

    // Update summary
    if (result.success && result.parsedWorkout) {
      results.summary.successCount++;
      results.summary.totalLatency += result.latency;

      totalExerciseCount += metrics.exerciseCount || 0;
      totalEquipmentMatchRate += metrics.equipmentMatchRate || 0;
      totalSets += metrics.avgSets || 0;
      totalRest += metrics.avgRest || 0;

      // Track reps frequency
      const reps = String(metrics.avgReps || '-');
      results.summary.repsCounts[reps] = (results.summary.repsCounts[reps] || 0) + 1;

      console.log(`OK ${result.latency}ms`);
      console.log(`  Exercises: ${metrics.exerciseCount} | Equip: ${metrics.equipmentMatchRate}% | Sets: ${metrics.avgSets} | Reps: ${metrics.avgReps} | Rest: ${metrics.avgRest}s`);
    } else if (result.success && result.parseError) {
      results.summary.parseErrorCount++;
      console.log(`Parse Error`);
      console.log(`  ${result.parseError.substring(0, 80)}`);
    } else {
      results.summary.apiErrorCount++;
      console.log(`API Error`);
      console.log(`  ${(result.error || 'Unknown error').substring(0, 80)}`);
    }

    console.log('');

    // Rate limiting - wait 1 second between requests
    if (i < SCENARIOS_TO_RUN.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Finalize summary
  if (results.summary.successCount > 0) {
    const sc = results.summary.successCount;
    results.summary.avgLatency = Math.round(results.summary.totalLatency / sc);
    results.summary.avgExerciseCount = Math.round((totalExerciseCount / sc) * 10) / 10;
    results.summary.avgEquipmentMatchRate = Math.round(totalEquipmentMatchRate / sc);
    results.summary.avgSets = Math.round((totalSets / sc) * 10) / 10;
    results.summary.avgRest = Math.round(totalRest / sc);

    // Find most common reps value
    let mostCommonReps = '-';
    let maxCount = 0;
    for (const [reps, count] of Object.entries(results.summary.repsCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonReps = reps;
      }
    }
    results.summary.avgReps = mostCommonReps;
  }

  results.summary.successRate = Math.round((results.summary.successCount / results.totalScenarios) * 100);

  // Save results
  const outputDir = path.join(__dirname, 'benchmark-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create a safe filename from model ID
  const safeModelName = modelInfo.id.replace(/[^a-zA-Z0-9-]/g, '-');
  const fileTimestamp = timestamp.replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `model-${safeModelName}-${fileTimestamp}.json`);

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Print final summary
  console.log('='.repeat(60));
  console.log('BENCHMARK COMPLETE');
  console.log('='.repeat(60));
  console.log(`Model: ${modelInfo.name} (${modelInfo.id})`);
  console.log(`Success Rate: ${results.summary.successRate}% (${results.summary.successCount}/${results.totalScenarios})`);
  console.log(`Parse Errors: ${results.summary.parseErrorCount}`);
  console.log(`API Errors: ${results.summary.apiErrorCount}`);
  console.log(`Avg Latency: ${results.summary.avgLatency}ms`);
  console.log(`Avg Exercises: ${results.summary.avgExerciseCount}`);
  console.log(`Avg Equipment Match: ${results.summary.avgEquipmentMatchRate}%`);
  console.log(`Avg Sets: ${results.summary.avgSets}`);
  console.log(`Avg Reps: ${results.summary.avgReps}`);
  console.log(`Avg Rest: ${results.summary.avgRest}s`);
  console.log('='.repeat(60));
  console.log(`Results saved to: ${outputPath}`);
}

// Run
runSingleModelBenchmark().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
