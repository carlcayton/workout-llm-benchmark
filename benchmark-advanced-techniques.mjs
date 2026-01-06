/**
 * Advanced Training Techniques Detection for LLM Workout Benchmark
 *
 * Detects supersets, drop sets, compound sets, and other advanced techniques
 * in generated workouts. Validates their appropriateness for training styles.
 *
 * Usage:
 *   import { evaluateAdvancedTechniques, detectSupersets } from './benchmark-advanced-techniques.mjs';
 */

// ============================================================================
// ANTAGONIST MUSCLE PAIRS (for superset detection)
// ============================================================================

export const ANTAGONIST_PAIRS = {
  chest: ['back', 'lats', 'upper back'],
  back: ['chest', 'pectorals'],
  lats: ['chest', 'pectorals'],
  biceps: ['triceps'],
  triceps: ['biceps'],
  quads: ['hamstrings'],
  hamstrings: ['quads'],
  delts: ['lats', 'upper back'],
  abs: ['lower back', 'spine'],
};

// ============================================================================
// AGONIST MUSCLE PAIRS (for compound sets - same muscle group)
// ============================================================================

export const AGONIST_GROUPS = {
  chest: ['chest', 'pectorals', 'upper chest', 'lower chest'],
  back: ['back', 'lats', 'upper back', 'traps', 'rhomboids'],
  shoulders: ['delts', 'shoulders', 'front delts', 'rear delts', 'side delts'],
  biceps: ['biceps', 'brachialis'],
  triceps: ['triceps', 'long head', 'lateral head'],
  quads: ['quads', 'quadriceps', 'vastus'],
  hamstrings: ['hamstrings', 'glutes', 'hip flexors'],
  calves: ['calves', 'gastrocnemius', 'soleus'],
};

// ============================================================================
// TRAINING STYLES THAT EXPECT ADVANCED TECHNIQUES
// ============================================================================

export const STYLE_TECHNIQUE_EXPECTATIONS = {
  BODYBUILD: {
    supersets: 'optional',
    dropSets: 'optional',
    compoundSets: 'common',
    circuits: 'rare',
  },
  STRENGTH: {
    supersets: 'rare',
    dropSets: 'rare',
    compoundSets: 'rare',
    circuits: 'never',
  },
  HIT: {
    slow_negatives: 'required',
    to_failure: 'required',
    rest_pause: 'common',
    forced_reps: 'optional',
    supersets: 'never',
    dropSets: 'rare',
    compoundSets: 'never',
    circuits: 'never',
  },
  ENDURANCE: {
    supersets: 'expected',
    dropSets: 'optional',
    compoundSets: 'common',
    circuits: 'required',
    tri_sets: 'common',
  },
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect if two exercises form an antagonist superset
 */
export function areAntagonistMuscles(target1, target2) {
  const t1 = target1?.toLowerCase() || '';
  const t2 = target2?.toLowerCase() || '';

  for (const [muscle, antagonists] of Object.entries(ANTAGONIST_PAIRS)) {
    if (t1.includes(muscle) || muscle.includes(t1)) {
      for (const ant of antagonists) {
        if (t2.includes(ant) || ant.includes(t2)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect if two exercises work the same muscle group (compound set)
 */
export function areSameMuscleGroup(target1, target2) {
  const t1 = target1?.toLowerCase() || '';
  const t2 = target2?.toLowerCase() || '';

  for (const muscles of Object.values(AGONIST_GROUPS)) {
    const t1Match = muscles.some(m => t1.includes(m) || m.includes(t1));
    const t2Match = muscles.some(m => t2.includes(m) || m.includes(t2));
    if (t1Match && t2Match) return true;
  }
  return false;
}

/**
 * Detect supersets in workout (consecutive exercises with minimal/no rest)
 */
export function detectSupersets(workout) {
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises)
    : workout.exercises || [];

  const supersets = [];
  const compoundSets = [];

  for (let i = 0; i < exercises.length - 1; i++) {
    const current = exercises[i];
    const next = exercises[i + 1];

    // Check for superset indicators:
    // 1. Very short rest (< 30s)
    // 2. Notes mentioning "superset"
    // 3. Consecutive exercises with antagonist muscles

    const shortRest = (current.restSeconds || 60) < 30;
    const hasSuperset = (current.notes || '').toLowerCase().includes('superset') ||
                       (next.notes || '').toLowerCase().includes('superset');
    const isAntagonist = areAntagonistMuscles(current.target, next.target);
    const isSameGroup = areSameMuscleGroup(current.target, next.target);

    if (hasSuperset || (shortRest && isAntagonist)) {
      supersets.push({
        exercises: [current.name || current.exerciseId, next.name || next.exerciseId],
        type: 'antagonist',
        targets: [current.target, next.target],
        index: i,
      });
    } else if (shortRest && isSameGroup) {
      compoundSets.push({
        exercises: [current.name || current.exerciseId, next.name || next.exerciseId],
        type: 'compound',
        targets: [current.target, next.target],
        index: i,
      });
    }
  }

  return { supersets, compoundSets };
}

/**
 * Detect drop sets (notes mentioning "drop", "reduce weight", etc.)
 */
export function detectDropSets(workout) {
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises)
    : workout.exercises || [];

  const dropSets = [];
  const dropPatterns = ['drop', 'reduce weight', 'strip set', 'descending'];

  for (const exercise of exercises) {
    const notes = (exercise.notes || '').toLowerCase();
    if (dropPatterns.some(p => notes.includes(p))) {
      dropSets.push({
        exercise: exercise.name || exercise.exerciseId,
        notes: exercise.notes,
      });
    }
  }

  return dropSets;
}

/**
 * Detect circuit training patterns
 */
export function detectCircuits(workout) {
  const sections = workout.sections || [];
  const circuits = [];

  for (const section of sections) {
    const sectionName = (section.name || '').toLowerCase();
    if (sectionName.includes('circuit') || sectionName.includes('round')) {
      circuits.push({
        name: section.name,
        exerciseCount: section.exercises?.length || 0,
      });
    }

    // Also check if all exercises in section have very short rest
    const exercises = section.exercises || [];
    if (exercises.length >= 3) {
      const allShortRest = exercises.every(e => (e.restSeconds || 60) <= 30);
      if (allShortRest) {
        circuits.push({
          name: section.name,
          exerciseCount: exercises.length,
          detected: 'by rest pattern',
        });
      }
    }
  }

  return circuits;
}

/**
 * Detect detailed circuit structure in a workout
 * Checks for proper grouping, rest patterns, and naming conventions
 */
export function detectCircuitStructure(workout) {
  const sections = workout.sections || [];

  const result = {
    hasCircuitGrouping: false,
    hasProperIntraCircuitRest: false,
    hasProperInterCircuitRest: false,
    hasCircuitNaming: false,
    circuitCount: 0,
    triSetCount: 0,
    details: [],
  };

  // Circuit naming patterns
  const circuitPatterns = ['circuit', 'round', 'tri-set', 'triset', 'tri set', 'giant set'];

  // Check section names for circuit/round/tri-set naming
  for (const section of sections) {
    const sectionName = (section.name || '').toLowerCase();
    const hasCircuitName = circuitPatterns.some(p => sectionName.includes(p));

    if (hasCircuitName) {
      result.hasCircuitNaming = true;

      if (sectionName.includes('tri-set') || sectionName.includes('triset') || sectionName.includes('tri set')) {
        result.triSetCount++;
      } else {
        result.circuitCount++;
      }

      const sectionExercises = section.exercises || [];

      // Check intra-circuit rest (should be 0s or very short between exercises in same circuit)
      const intraCircuitRests = sectionExercises.slice(0, -1).map(e => e.restSeconds ?? 60);
      const hasShortIntraRest = intraCircuitRests.length === 0 || intraCircuitRests.every(r => r <= 15);

      // Check inter-circuit rest (last exercise should have longer rest, 60-90s)
      const lastExercise = sectionExercises[sectionExercises.length - 1];
      const interCircuitRest = lastExercise?.restSeconds ?? 60;
      const hasProperInterRest = interCircuitRest >= 60 && interCircuitRest <= 120;

      result.details.push({
        name: section.name,
        exerciseCount: sectionExercises.length,
        intraCircuitRests,
        hasShortIntraRest,
        interCircuitRest,
        hasProperInterRest,
      });

      if (hasShortIntraRest) {
        result.hasProperIntraCircuitRest = true;
      }
      if (hasProperInterRest) {
        result.hasProperInterCircuitRest = true;
      }
    }
  }

  // Check if exercises are grouped (3+ exercises per section with short rest)
  const groupedSections = sections.filter(s => {
    const sectionExercises = s.exercises || [];
    if (sectionExercises.length < 3) return false;

    // Check if most exercises have very short rest (circuit pattern)
    const shortRestCount = sectionExercises.filter(e => (e.restSeconds ?? 60) <= 30).length;
    return shortRestCount >= sectionExercises.length - 1; // Allow last exercise to have longer rest
  });

  result.hasCircuitGrouping = groupedSections.length >= 2 || result.circuitCount >= 2;

  return result;
}

// ============================================================================
// ENDURANCE STRUCTURE VALIDATION
// ============================================================================

/**
 * Validate endurance workout structure
 * Returns score 0-100 based on circuit grouping quality
 *
 * Scoring:
 * - 100 = Proper circuit grouping with correct rest patterns
 * - 75 = Circuit naming but imperfect rest patterns
 * - 50 = Linear with short rest (acceptable for endurance)
 * - 25 = Linear with long rest (wrong for endurance)
 */
export function validateEnduranceStructure(workout) {
  const circuitInfo = detectCircuitStructure(workout);
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises)
    : workout.exercises || [];

  const result = {
    score: 0,
    structure: 'unknown',
    circuitInfo,
    feedback: [],
    isValid: false,
  };

  // Check for proper circuit grouping (ideal case)
  if (circuitInfo.hasCircuitGrouping && circuitInfo.hasCircuitNaming) {
    if (circuitInfo.hasProperIntraCircuitRest && circuitInfo.hasProperInterCircuitRest) {
      result.score = 100;
      result.structure = 'proper_circuit';
      result.feedback.push('Excellent circuit structure with proper rest patterns');
      result.isValid = true;
    } else if (circuitInfo.hasProperIntraCircuitRest || circuitInfo.hasProperInterCircuitRest) {
      result.score = 85;
      result.structure = 'circuit_imperfect_rest';
      result.feedback.push('Good circuit grouping but rest patterns could be improved');
      result.isValid = true;
    } else {
      result.score = 75;
      result.structure = 'circuit_naming_only';
      result.feedback.push('Has circuit naming but rest patterns are not optimal');
      result.isValid = true;
    }
  } else if (circuitInfo.triSetCount >= 2) {
    // Tri-sets are also valid for endurance
    result.score = 90;
    result.structure = 'tri_sets';
    result.feedback.push('Good use of tri-sets for muscular endurance');
    result.isValid = true;
  } else if (circuitInfo.hasCircuitNaming) {
    result.score = 70;
    result.structure = 'partial_circuit';
    result.feedback.push('Has circuit elements but grouping is incomplete');
    result.isValid = true;
  } else {
    // Linear structure - check rest patterns
    const avgRest = exercises.reduce((sum, e) => sum + (e.restSeconds ?? 60), 0) / (exercises.length || 1);

    if (avgRest <= 30) {
      result.score = 50;
      result.structure = 'linear_short_rest';
      result.feedback.push('Linear structure but with appropriately short rest (acceptable)');
      result.isValid = true;
    } else if (avgRest <= 45) {
      result.score = 40;
      result.structure = 'linear_medium_rest';
      result.feedback.push('Linear structure with moderate rest - should use circuits for endurance');
      result.isValid = false;
    } else {
      result.score = 25;
      result.structure = 'linear_long_rest';
      result.feedback.push('Linear structure with long rest - wrong for muscular endurance');
      result.isValid = false;
    }
  }

  return result;
}

// ============================================================================
// HIT (HEAVY DUTY / MENTZER) VALIDATION
// ============================================================================

// Machine exercises are preferred for HIT safety (easier to go to failure)
const MACHINE_KEYWORDS = [
  'machine', 'cable', 'smith', 'leg press', 'chest press', 'lat pulldown',
  'pec deck', 'hack squat', 'seated row', 'preacher curl', 'tricep pushdown',
  'leg extension', 'leg curl', 'calf raise machine', 'shoulder press machine',
];

/**
 * Check if an exercise is a machine exercise (safer for HIT failure sets)
 */
function isMachineExercise(exercise) {
  const name = (exercise.name || exercise.exerciseId || '').toLowerCase();
  const equipment = (exercise.equipment || '').toLowerCase();
  return MACHINE_KEYWORDS.some(kw => name.includes(kw) || equipment.includes(kw));
}

/**
 * Validate HIT constraints - checks that all exercises have 1-2 sets max
 * HIT (Heavy Duty / Mentzer style) has a HARD CAP of 1-2 working sets per exercise
 *
 * @param {Object} workout - The workout object with exercises or sections
 * @returns {{ valid: boolean, violations: Array<{exercise: string, sets: number}>, score: number }}
 */
export function validateHITConstraints(workout) {
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises || [])
    : workout.exercises || [];

  const violations = [];
  let validCount = 0;

  for (const exercise of exercises) {
    const sets = exercise.sets || exercise.workingSets || 1;
    const exerciseName = exercise.name || exercise.exerciseId || 'Unknown';

    if (sets > 2) {
      violations.push({
        exercise: exerciseName,
        sets,
        message: `${exerciseName} has ${sets} sets (HIT max is 2)`,
      });
    } else {
      validCount++;
    }
  }

  const totalExercises = exercises.length;
  const valid = violations.length === 0;
  const score = totalExercises > 0
    ? Math.round((validCount / totalExercises) * 100)
    : 100;

  return { valid, violations, score };
}

/**
 * Detect HIT-specific techniques in workout notes and parameters
 * Looks for: slow negatives, tempo, failure, machine preference
 *
 * @param {Object} workout - The workout object
 * @returns {{ hasSlowNegatives: boolean, hasFailure: boolean, machineRatio: number, details: Object }}
 */
export function detectHITTechniques(workout) {
  const exercises = workout.sections
    ? workout.sections.flatMap(s => s.exercises || [])
    : workout.exercises || [];

  // Patterns for slow negative detection
  const slowNegativePatterns = [
    'slow negative', 'slow eccentric', 'tempo', '4-1-4', '4 sec down',
    '4s down', '5 sec down', '5s down', '6 sec down', '6s down',
    'controlled negative', 'slow descent', '4-0-4', '5-0-5',
    'eccentric focus', 'negative emphasis',
  ];

  // Patterns for failure detection
  const failurePatterns = [
    'failure', 'to failure', 'until failure', 'complete failure',
    'muscular failure', 'absolute failure', 'concentric failure',
    'positive failure', 'momentary failure',
  ];

  let slowNegativeCount = 0;
  let failureCount = 0;
  let machineCount = 0;
  const detectedTechniques = [];

  for (const exercise of exercises) {
    const notes = (exercise.notes || '').toLowerCase();
    const tempo = (exercise.tempo || '').toLowerCase();
    const combined = `${notes} ${tempo}`;

    // Check for slow negatives
    if (slowNegativePatterns.some(p => combined.includes(p))) {
      slowNegativeCount++;
      detectedTechniques.push({
        exercise: exercise.name || exercise.exerciseId,
        technique: 'slow_negative',
      });
    }

    // Check for failure
    if (failurePatterns.some(p => combined.includes(p))) {
      failureCount++;
      detectedTechniques.push({
        exercise: exercise.name || exercise.exerciseId,
        technique: 'to_failure',
      });
    }

    // Check for machine exercises
    if (isMachineExercise(exercise)) {
      machineCount++;
    }
  }

  const totalExercises = exercises.length || 1;
  const hasSlowNegatives = slowNegativeCount > 0;
  const hasFailure = failureCount > 0;
  const machineRatio = machineCount / totalExercises;

  return {
    hasSlowNegatives,
    hasFailure,
    machineRatio,
    details: {
      slowNegativeCount,
      failureCount,
      machineCount,
      totalExercises,
      detectedTechniques,
    },
  };
}

/**
 * Score overall HIT compliance for a workout
 * - 100 = All exercises 1-2 sets + slow negatives + failure cues
 * - 75 = Correct sets but missing technique cues
 * - 50 = Some exercises have 3+ sets
 * - 25 = Doesn't follow HIT at all
 *
 * @param {Object} workout - The workout object
 * @returns {{ score: number, breakdown: Object, feedback: string[] }}
 */
export function scoreHITCompliance(workout) {
  const constraints = validateHITConstraints(workout);
  const techniques = detectHITTechniques(workout);
  const feedback = [];

  // Calculate component scores
  const setScore = constraints.score; // 0-100 based on set compliance
  const techniqueScore = calculateTechniqueScore(techniques);
  const safetyScore = calculateSafetyScore(techniques.machineRatio);

  // Weight the scores: sets are most important (50%), then techniques (35%), then safety (15%)
  const weightedScore = Math.round(
    setScore * 0.5 + techniqueScore * 0.35 + safetyScore * 0.15
  );

  // Generate feedback
  if (!constraints.valid) {
    feedback.push(`HIT violation: ${constraints.violations.length} exercise(s) exceed 2 sets`);
    for (const v of constraints.violations.slice(0, 3)) {
      feedback.push(`  - ${v.message}`);
    }
  }

  if (!techniques.hasSlowNegatives) {
    feedback.push('Missing slow negative/tempo cues (HIT requires 4-6 sec eccentric)');
  }

  if (!techniques.hasFailure) {
    feedback.push('Missing failure cues (HIT requires training to failure)');
  }

  if (techniques.machineRatio < 0.5) {
    feedback.push(`Low machine usage (${Math.round(techniques.machineRatio * 100)}%) - HIT prefers machines for safety`);
  }

  // Determine tier
  let tier;
  if (weightedScore >= 90 && constraints.valid && techniques.hasSlowNegatives && techniques.hasFailure) {
    tier = 'excellent';
  } else if (weightedScore >= 75 || (constraints.valid && (techniques.hasSlowNegatives || techniques.hasFailure))) {
    tier = 'good';
  } else if (weightedScore >= 50 || constraints.score >= 75) {
    tier = 'partial';
  } else {
    tier = 'non_compliant';
  }

  return {
    score: weightedScore,
    tier,
    breakdown: {
      setCompliance: setScore,
      techniqueScore,
      safetyScore,
      constraints,
      techniques,
    },
    feedback,
  };
}

/**
 * Calculate technique score based on presence of HIT techniques
 */
function calculateTechniqueScore(techniques) {
  let score = 50; // Base score

  if (techniques.hasSlowNegatives) score += 25;
  if (techniques.hasFailure) score += 25;

  return score;
}

/**
 * Calculate safety score based on machine usage ratio
 * HIT prefers machines for safety when training to failure
 */
function calculateSafetyScore(machineRatio) {
  if (machineRatio >= 0.7) return 100;
  if (machineRatio >= 0.5) return 80;
  if (machineRatio >= 0.3) return 60;
  return 40;
}

// ============================================================================
// ARNOLD SPLIT SPECIFIC EVALUATION
// ============================================================================

/**
 * Evaluate Arnold Split for proper antagonist pairing
 */
export function evaluateArnoldSplit(workout, dayType) {
  const results = {
    dayType,
    hasAntagonistPairs: false,
    supersetCount: 0,
    alternatingPattern: false,
    score: 0,
    feedback: [],
  };

  const { supersets, compoundSets } = detectSupersets(workout);
  results.supersetCount = supersets.length;
  results.hasAntagonistPairs = supersets.length > 0;

  if (dayType === 'chest_back') {
    // Arnold chest/back day should have chest-back supersets
    const chestBackSupersets = supersets.filter(s => {
      const targets = s.targets.map(t => t?.toLowerCase() || '');
      return (targets.some(t => t.includes('pectorals') || t.includes('chest')) &&
              targets.some(t => t.includes('lats') || t.includes('back')));
    });

    if (chestBackSupersets.length >= 2) {
      results.score = 100;
      results.feedback.push('Excellent chest-back superset programming');
    } else if (chestBackSupersets.length >= 1) {
      results.score = 75;
      results.feedback.push('Good chest-back pairing, could add more supersets');
    } else if (supersets.length > 0) {
      results.score = 50;
      results.feedback.push('Has supersets but not optimal chest-back pairs');
    } else {
      results.score = 25;
      results.feedback.push('Missing Arnold-style chest-back supersets');
    }
  } else if (dayType === 'shoulders_arms') {
    // Should have bicep-tricep supersets
    const armSupersets = supersets.filter(s => {
      const targets = s.targets.map(t => t?.toLowerCase() || '');
      return (targets.some(t => t.includes('biceps')) &&
              targets.some(t => t.includes('triceps')));
    });

    if (armSupersets.length >= 2) {
      results.score = 100;
    } else if (armSupersets.length >= 1) {
      results.score = 75;
    } else {
      results.score = 50;
    }
  } else {
    results.score = 70; // Legs day doesn't need supersets
  }

  return results;
}

// ============================================================================
// MAIN EVALUATION FUNCTION
// ============================================================================

/**
 * Evaluate all advanced techniques in a workout
 */
export function evaluateAdvancedTechniques(workout, trainingStyle, split = null, dayType = null) {
  const expectations = STYLE_TECHNIQUE_EXPECTATIONS[trainingStyle] || {};

  const { supersets, compoundSets } = detectSupersets(workout);
  const dropSets = detectDropSets(workout);
  const circuits = detectCircuits(workout);

  const results = {
    trainingStyle,
    detected: {
      supersets: supersets.length,
      compoundSets: compoundSets.length,
      dropSets: dropSets.length,
      circuits: circuits.length,
    },
    details: {
      supersets,
      compoundSets,
      dropSets,
      circuits,
    },
    expectations,
    scores: {},
    overallScore: 0,
    feedback: [],
  };

  // Score based on expectations
  results.scores.supersets = scoreTechnique(supersets.length, expectations.supersets);
  results.scores.dropSets = scoreTechnique(dropSets.length, expectations.dropSets);
  results.scores.circuits = scoreTechnique(circuits.length, expectations.circuits);

  results.overallScore = Math.round(
    (results.scores.supersets + results.scores.dropSets + results.scores.circuits) / 3
  );

  // Arnold split special handling
  if (split === 'arnold' && dayType) {
    const arnoldEval = evaluateArnoldSplit(workout, dayType);
    results.arnoldSplitScore = arnoldEval.score;
    results.feedback.push(...arnoldEval.feedback);
    results.overallScore = Math.round((results.overallScore + arnoldEval.score) / 2);
  }

  // Generate feedback
  if (expectations.supersets === 'expected' && supersets.length === 0) {
    results.feedback.push(`${trainingStyle} should include supersets`);
  }
  if (expectations.circuits === 'expected' && circuits.length === 0) {
    results.feedback.push(`${trainingStyle} should include circuit training`);
  }
  if (expectations.supersets === 'never' && supersets.length > 0) {
    results.feedback.push(`${trainingStyle} typically doesn't use supersets`);
  }

  return results;
}

/**
 * Score based on expectation level
 */
function scoreTechnique(count, expectation) {
  switch (expectation) {
    case 'expected':
      return count >= 2 ? 100 : count === 1 ? 70 : 30;
    case 'common':
      return count >= 1 ? 100 : 70;
    case 'optional':
      return 80; // Neutral - neither good nor bad
    case 'rare':
      return count === 0 ? 100 : count === 1 ? 80 : 60;
    case 'never':
      return count === 0 ? 100 : 50;
    default:
      return 70;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ANTAGONIST_PAIRS,
  AGONIST_GROUPS,
  STYLE_TECHNIQUE_EXPECTATIONS,
  areAntagonistMuscles,
  areSameMuscleGroup,
  detectSupersets,
  detectDropSets,
  detectCircuits,
  detectCircuitStructure,
  validateEnduranceStructure,
  validateHITConstraints,
  detectHITTechniques,
  scoreHITCompliance,
  evaluateArnoldSplit,
  evaluateAdvancedTechniques,
};
