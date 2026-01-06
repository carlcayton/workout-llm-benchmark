/**
 * Training Style Parameters & Validation for LLM Workout Benchmark
 *
 * Defines expected sets/reps/rest ranges per training style and goal.
 * Provides validation functions to score LLM output accuracy.
 *
 * Usage:
 *   import { validateWorkoutParams, scoreWorkoutForStyle } from './benchmark-style-params.mjs';
 */

// ============================================================================
// TRAINING STYLE PARAMETER DEFINITIONS
// ============================================================================

export const STYLE_PARAMS = {
  BODYBUILD: {
    name: 'Classic Bodybuilding',
    description: 'Moderate volume, pump-focused, mix of compound and isolation',
    sets: { min: 3, max: 4, ideal: 4 },
    reps: { min: 8, max: 12, ideal: 10 },
    rest: { min: 60, max: 90, ideal: 75 },
    techniques: ['straight_sets', 'supersets_same_muscle'],
    supersetExpected: false,
    compoundToIsolationRatio: 'balanced',
    priority: 'pump_and_volume',
  },

  STRENGTH: {
    name: 'Strength Focused',
    description: 'Heavy compounds prioritized, low rep, longer rest',
    sets: { min: 4, max: 5, ideal: 5 },
    reps: { min: 4, max: 6, ideal: 5 },
    rest: { min: 120, max: 240, ideal: 180 },
    techniques: ['straight_sets'],
    supersetExpected: false,
    compoundToIsolationRatio: 'compound_heavy',
    priority: 'load_progression',
  },

  HIT: {
    name: 'High Intensity (HIT)',
    description: 'Mentzer/Yates style, very low volume, maximum effort per set to failure',
    sets: { min: 1, max: 2, ideal: 1 },
    reps: { min: 6, max: 10, ideal: 8 },
    rest: { min: 120, max: 180, ideal: 150 },
    techniques: ['slow_negatives', 'rest_pause', 'forced_reps', 'to_failure'],
    supersetExpected: false,
    machinePreferred: true,
    compoundToIsolationRatio: 'compound_heavy',
    priority: 'max_effort_per_set',
  },

  ENDURANCE: {
    name: 'Muscular Endurance',
    description: 'Fast-paced, minimal rest, conditioning-focused',
    sets: { min: 2, max: 3, ideal: 3 },
    reps: { min: 15, max: 20, ideal: 18 },
    rest: { min: 30, max: 45, ideal: 38 },
    techniques: ['supersets', 'tri_sets', 'circuits', 'drop_sets'],
    supersetExpected: true,
    circuitStructure: true,
    compoundToIsolationRatio: 'balanced',
    priority: 'minimal_rest_high_volume',
  },

  ai_optimize: {
    name: 'Let AI Optimize',
    description: 'AI selects based on user goal and experience from onboarding',
    derivedFrom: 'user_goal_and_experience',
    fallback: 'BODYBUILD',
    sets: { min: 3, max: 4, ideal: 3 },
    reps: { min: 8, max: 12, ideal: 10 },
    rest: { min: 60, max: 90, ideal: 75 },
    techniques: [],
    supersetExpected: false,
  },
};

// ============================================================================
// GOAL MODIFIERS
// ============================================================================

export const GOAL_MODIFIERS = {
  build_muscle: {
    repsMultiplier: 1.0,
    restMultiplier: 1.0,
    setsMultiplier: 1.0,
    description: '8-12 reps, moderate rest (60-90s)',
  },

  get_lean: {
    repsMultiplier: 1.25,
    restMultiplier: 0.75,
    setsMultiplier: 0.9,
    description: '12-15 reps, shorter rest (45-60s)',
  },

  build_strength: {
    repsMultiplier: 0.6,
    restMultiplier: 1.5,
    setsMultiplier: 1.2,
    description: '4-6 reps, long rest (120-180s)',
  },

  stay_fit: {
    repsMultiplier: 1.1,
    restMultiplier: 0.8,
    setsMultiplier: 0.8,
    description: '10-15 reps, moderate rest (45s)',
  },
};

// ============================================================================
// EXPERIENCE LEVEL ADJUSTMENTS
// ============================================================================

export const EXPERIENCE_ADJUSTMENTS = {
  beginner: {
    setsReduction: 1,
    repsReduction: 0,
    restIncrease: 15,
    description: 'Fewer sets, more rest for recovery',
  },

  intermediate: {
    setsReduction: 0,
    repsReduction: 0,
    restIncrease: 0,
    description: 'Standard parameters',
  },

  advanced: {
    setsReduction: -1, // Can add sets
    repsReduction: 0,
    restIncrease: -10,
    description: 'Higher volume, less rest needed',
  },
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Parse rep string to get min/max values
 * Handles: "10", "8-12", "10-12", etc.
 */
export function parseReps(repsValue) {
  if (typeof repsValue === 'number') {
    return { min: repsValue, max: repsValue };
  }

  const str = String(repsValue);
  if (str.includes('-')) {
    const [min, max] = str.split('-').map(Number);
    return { min, max };
  }

  const num = parseInt(str, 10);
  return { min: num, max: num };
}

/**
 * Check if sets are within expected range for training style
 */
export function validateSetsForStyle(sets, trainingStyle, experienceLevel = 'intermediate') {
  const params = STYLE_PARAMS[trainingStyle];
  if (!params) return { valid: false, reason: `Unknown style: ${trainingStyle}` };

  const adjustment = EXPERIENCE_ADJUSTMENTS[experienceLevel];
  const minSets = Math.max(1, params.sets.min - adjustment.setsReduction);
  const maxSets = params.sets.max - adjustment.setsReduction;

  const valid = sets >= minSets && sets <= maxSets + 1; // +1 tolerance
  return {
    valid,
    actual: sets,
    expected: { min: minSets, max: maxSets },
    deviation: valid ? 0 : Math.min(Math.abs(sets - minSets), Math.abs(sets - maxSets)),
    reason: valid ? 'Sets within range' : `Sets ${sets} outside range [${minSets}-${maxSets}]`,
  };
}

/**
 * Check if reps are within expected range for training style
 */
export function validateRepsForStyle(reps, trainingStyle, goal = 'build_muscle') {
  const params = STYLE_PARAMS[trainingStyle];
  if (!params) return { valid: false, reason: `Unknown style: ${trainingStyle}` };

  const modifier = GOAL_MODIFIERS[goal];
  const { min, max } = parseReps(reps);

  const expectedMin = Math.round(params.reps.min * modifier.repsMultiplier);
  const expectedMax = Math.round(params.reps.max * modifier.repsMultiplier);

  // Check if either min or max falls within expected range (with tolerance)
  const tolerance = 2;
  const valid = (min >= expectedMin - tolerance && min <= expectedMax + tolerance) ||
                (max >= expectedMin - tolerance && max <= expectedMax + tolerance);

  return {
    valid,
    actual: { min, max },
    expected: { min: expectedMin, max: expectedMax },
    deviation: valid ? 0 : Math.min(
      Math.abs(min - expectedMin),
      Math.abs(max - expectedMax)
    ),
    reason: valid ? 'Reps within range' : `Reps ${min}-${max} outside expected [${expectedMin}-${expectedMax}]`,
  };
}

/**
 * Check if rest period is within expected range for training style
 */
export function validateRestForStyle(restSeconds, trainingStyle, goal = 'build_muscle') {
  const params = STYLE_PARAMS[trainingStyle];
  if (!params) return { valid: false, reason: `Unknown style: ${trainingStyle}` };

  const modifier = GOAL_MODIFIERS[goal];
  const expectedMin = Math.round(params.rest.min * modifier.restMultiplier);
  const expectedMax = Math.round(params.rest.max * modifier.restMultiplier);

  const tolerance = 15; // 15 second tolerance
  const valid = restSeconds >= expectedMin - tolerance && restSeconds <= expectedMax + tolerance;

  return {
    valid,
    actual: restSeconds,
    expected: { min: expectedMin, max: expectedMax },
    deviation: valid ? 0 : Math.min(
      Math.abs(restSeconds - expectedMin),
      Math.abs(restSeconds - expectedMax)
    ),
    reason: valid ? 'Rest within range' : `Rest ${restSeconds}s outside expected [${expectedMin}-${expectedMax}s]`,
  };
}

// ============================================================================
// SCORING FUNCTION
// ============================================================================

/**
 * Score a workout's adherence to training style parameters
 * Returns 0-100 score with detailed breakdown
 */
export function scoreWorkoutForStyle(workout, trainingStyle, goal, experienceLevel) {
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises)
    : workout.exercises || [];

  if (exercises.length === 0) {
    return { score: 0, breakdown: {}, issues: ['No exercises found'] };
  }

  let totalSetsScore = 0;
  let totalRepsScore = 0;
  let totalRestScore = 0;
  const issues = [];

  for (const exercise of exercises) {
    // Sets validation
    const setsResult = validateSetsForStyle(exercise.sets, trainingStyle, experienceLevel);
    totalSetsScore += setsResult.valid ? 100 : Math.max(0, 100 - setsResult.deviation * 20);
    if (!setsResult.valid) {
      issues.push(`${exercise.name || 'Exercise'}: ${setsResult.reason}`);
    }

    // Reps validation
    const repsResult = validateRepsForStyle(exercise.reps, trainingStyle, goal);
    totalRepsScore += repsResult.valid ? 100 : Math.max(0, 100 - repsResult.deviation * 10);
    if (!repsResult.valid) {
      issues.push(`${exercise.name || 'Exercise'}: ${repsResult.reason}`);
    }

    // Rest validation
    const restResult = validateRestForStyle(exercise.restSeconds, trainingStyle, goal);
    totalRestScore += restResult.valid ? 100 : Math.max(0, 100 - restResult.deviation * 1);
    if (!restResult.valid) {
      issues.push(`${exercise.name || 'Exercise'}: ${restResult.reason}`);
    }
  }

  const exerciseCount = exercises.length;
  const avgSetsScore = totalSetsScore / exerciseCount;
  const avgRepsScore = totalRepsScore / exerciseCount;
  const avgRestScore = totalRestScore / exerciseCount;

  // Weighted average: reps and rest are more important than sets
  const overallScore = Math.round(
    avgSetsScore * 0.25 +
    avgRepsScore * 0.40 +
    avgRestScore * 0.35
  );

  return {
    score: overallScore,
    breakdown: {
      setsScore: Math.round(avgSetsScore),
      repsScore: Math.round(avgRepsScore),
      restScore: Math.round(avgRestScore),
    },
    exerciseCount,
    issues: issues.slice(0, 5), // Limit to first 5 issues
    styleParams: STYLE_PARAMS[trainingStyle],
    goalModifier: GOAL_MODIFIERS[goal],
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  STYLE_PARAMS,
  GOAL_MODIFIERS,
  EXPERIENCE_ADJUSTMENTS,
  parseReps,
  validateSetsForStyle,
  validateRepsForStyle,
  validateRestForStyle,
  scoreWorkoutForStyle,
};
