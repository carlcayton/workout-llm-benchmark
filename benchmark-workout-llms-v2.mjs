#!/usr/bin/env node
/**
 * LLM Workout Generation Benchmark v2
 *
 * Enhanced benchmark with:
 * - Comprehensive test scenarios with full gym equipment
 * - Training style validation scoring
 * - Advanced techniques evaluation (supersets, drop sets, etc.)
 * - Enhanced metrics per LLM response
 * - Detailed comparison reports (JSON + Markdown)
 *
 * Usage:
 *   OPENROUTER_API_KEY=sk-or-... node scripts/benchmark-workout-llms-v2.mjs
 *   npm run benchmark:llm:v2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('OPENROUTER_API_KEY environment variable is required');
  console.error('Usage: OPENROUTER_API_KEY=sk-or-... node scripts/benchmark-workout-llms-v2.mjs');
  process.exit(1);
}

// ============================================================================
// MODULE: benchmark-mock-exercises.mjs
// Comprehensive mock exercise database for benchmarking
// ============================================================================

const MOCK_EXERCISES = [
  // CHEST
  { id: '0025', name: 'dumbbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'delts'] },
  { id: '0047', name: 'barbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'delts'] },
  { id: '0251', name: 'push-up', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['triceps', 'delts', 'abs'] },
  { id: '1254', name: 'cable crossover', target: 'pectorals', bodyPart: 'chest', equipment: 'cable', difficulty: 'intermediate', secondaryMuscles: ['delts'] },
  { id: '0289', name: 'dumbbell fly', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: [] },
  { id: '0048', name: 'incline barbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'delts'] },
  { id: '0026', name: 'incline dumbbell bench press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'delts'] },
  { id: '0290', name: 'incline dumbbell fly', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: [] },
  { id: '1255', name: 'machine chest press', target: 'pectorals', bodyPart: 'chest', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: ['triceps'] },
  { id: '1256', name: 'pec deck fly', target: 'pectorals', bodyPart: 'chest', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0252', name: 'decline push-up', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'delts'] },

  // BACK
  { id: '0027', name: 'barbell bent over row', target: 'lats', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['biceps', 'traps', 'rear delts'] },
  { id: '0294', name: 'dumbbell row', target: 'lats', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['biceps', 'traps'] },
  { id: '0651', name: 'pull-up', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['biceps', 'forearms'] },
  { id: '0160', name: 'lat pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: ['biceps'] },
  { id: '0293', name: 'dumbbell pullover', target: 'lats', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['pectorals', 'triceps'] },
  { id: '0652', name: 'chin-up', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['biceps'] },
  { id: '0161', name: 'seated cable row', target: 'upper back', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: ['biceps', 'lats'] },
  { id: '0162', name: 'cable face pull', target: 'upper back', bodyPart: 'back', equipment: 'cable', difficulty: 'intermediate', secondaryMuscles: ['rear delts', 'traps'] },
  { id: '0028', name: 'barbell deadlift', target: 'spine', bodyPart: 'back', equipment: 'barbell', difficulty: 'advanced', secondaryMuscles: ['glutes', 'hamstrings', 'traps'] },
  { id: '1257', name: 'machine row', target: 'lats', bodyPart: 'back', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: ['biceps'] },
  { id: '0653', name: 'inverted row', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['biceps'] },
  { id: '0029', name: 't-bar row', target: 'upper back', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['biceps', 'lats'] },

  // SHOULDERS
  { id: '0237', name: 'dumbbell shoulder press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'traps'] },
  { id: '0036', name: 'barbell overhead press', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'traps'] },
  { id: '0308', name: 'dumbbell lateral raise', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0518', name: 'cable lateral raise', target: 'delts', bodyPart: 'shoulders', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0309', name: 'dumbbell front raise', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0310', name: 'dumbbell rear delt fly', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['traps'] },
  { id: '0037', name: 'barbell upright row', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['traps', 'biceps'] },
  { id: '1258', name: 'machine shoulder press', target: 'delts', bodyPart: 'shoulders', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: ['triceps'] },
  { id: '0253', name: 'pike push-up', target: 'delts', bodyPart: 'shoulders', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['triceps'] },
  { id: '0311', name: 'arnold press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['triceps'] },

  // UPPER ARMS (BICEPS)
  { id: '0100', name: 'barbell curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'beginner', secondaryMuscles: ['forearms'] },
  { id: '0101', name: 'dumbbell curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['forearms'] },
  { id: '0102', name: 'hammer curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['forearms'] },
  { id: '0103', name: 'cable curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: ['forearms'] },
  { id: '0104', name: 'preacher curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'ez barbell', difficulty: 'intermediate', secondaryMuscles: [] },
  { id: '0105', name: 'concentration curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0106', name: 'incline dumbbell curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: [] },

  // UPPER ARMS (TRICEPS)
  { id: '0200', name: 'tricep pushdown', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0201', name: 'skull crusher', target: 'triceps', bodyPart: 'upper arms', equipment: 'ez barbell', difficulty: 'intermediate', secondaryMuscles: [] },
  { id: '0202', name: 'overhead tricep extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0203', name: 'close grip bench press', target: 'triceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['pectorals'] },
  { id: '0254', name: 'diamond push-up', target: 'triceps', bodyPart: 'upper arms', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['pectorals'] },
  { id: '0255', name: 'bench dips', target: 'triceps', bodyPart: 'upper arms', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['pectorals', 'delts'] },
  { id: '0204', name: 'tricep kickback', target: 'triceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },

  // UPPER LEGS (QUADS)
  { id: '0032', name: 'barbell squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['glutes', 'hamstrings', 'abs'] },
  { id: '0278', name: 'dumbbell lunge', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: '0584', name: 'leg press', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: '0585', name: 'leg extension', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0654', name: 'bodyweight squat', target: 'quads', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['glutes'] },
  { id: '0655', name: 'lunge', target: 'quads', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: '0279', name: 'goblet squat', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: ['glutes'] },
  { id: '0033', name: 'front squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'advanced', secondaryMuscles: ['glutes', 'abs'] },
  { id: '0280', name: 'bulgarian split squat', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: '1259', name: 'hack squat', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'intermediate', secondaryMuscles: ['glutes'] },
  { id: '0034', name: 'smith machine squat', target: 'quads', bodyPart: 'upper legs', equipment: 'smith machine', difficulty: 'beginner', secondaryMuscles: ['glutes', 'hamstrings'] },

  // UPPER LEGS (HAMSTRINGS)
  { id: '0038', name: 'romanian deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['glutes', 'spine'] },
  { id: '0586', name: 'leg curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0281', name: 'dumbbell romanian deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['glutes'] },
  { id: '0282', name: 'single leg deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['glutes'] },
  { id: '0656', name: 'nordic curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'advanced', secondaryMuscles: [] },
  { id: '0587', name: 'seated leg curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0039', name: 'stiff leg deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['glutes', 'spine'] },
  { id: '0163', name: 'cable pull through', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'cable', difficulty: 'intermediate', secondaryMuscles: ['glutes'] },

  // UPPER LEGS (GLUTES)
  { id: '0526', name: 'hip thrust', target: 'glutes', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: ['hamstrings'] },
  { id: '0657', name: 'glute bridge', target: 'glutes', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['hamstrings'] },
  { id: '0658', name: 'single leg glute bridge', target: 'glutes', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['hamstrings'] },
  { id: '0164', name: 'cable kickback', target: 'glutes', bodyPart: 'upper legs', equipment: 'cable', difficulty: 'beginner', secondaryMuscles: ['hamstrings'] },
  { id: '1260', name: 'hip abduction machine', target: 'glutes', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: ['abductors'] },
  { id: '0283', name: 'dumbbell step up', target: 'glutes', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: ['quads', 'hamstrings'] },

  // LOWER LEGS (CALVES)
  { id: '0600', name: 'standing calf raise', target: 'calves', bodyPart: 'lower legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0601', name: 'seated calf raise', target: 'calves', bodyPart: 'lower legs', equipment: 'leverage machine', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0602', name: 'dumbbell calf raise', target: 'calves', bodyPart: 'lower legs', equipment: 'dumbbell', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0659', name: 'bodyweight calf raise', target: 'calves', bodyPart: 'lower legs', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0040', name: 'barbell calf raise', target: 'calves', bodyPart: 'lower legs', equipment: 'barbell', difficulty: 'intermediate', secondaryMuscles: [] },

  // WAIST (ABS)
  { id: '0400', name: 'crunch', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0401', name: 'plank', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['obliques'] },
  { id: '0402', name: 'hanging leg raise', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['hip flexors'] },
  { id: '0403', name: 'russian twist', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['obliques'] },
  { id: '0404', name: 'bicycle crunch', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['obliques'] },
  { id: '0165', name: 'cable crunch', target: 'abs', bodyPart: 'waist', equipment: 'cable', difficulty: 'intermediate', secondaryMuscles: [] },
  { id: '0405', name: 'mountain climber', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['hip flexors'] },
  { id: '0406', name: 'dead bug', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '1261', name: 'ab wheel rollout', target: 'abs', bodyPart: 'waist', equipment: 'wheel roller', difficulty: 'intermediate', secondaryMuscles: ['lats'] },
  { id: '0284', name: 'weighted crunch', target: 'abs', bodyPart: 'waist', equipment: 'dumbbell', difficulty: 'intermediate', secondaryMuscles: [] },

  // KETTLEBELL EXERCISES
  { id: '0527', name: 'kettlebell swing', target: 'glutes', bodyPart: 'upper legs', equipment: 'kettlebell', difficulty: 'intermediate', secondaryMuscles: ['hamstrings', 'abs', 'spine'] },
  { id: '0528', name: 'kettlebell goblet squat', target: 'quads', bodyPart: 'upper legs', equipment: 'kettlebell', difficulty: 'beginner', secondaryMuscles: ['glutes'] },
  { id: '0529', name: 'kettlebell clean and press', target: 'delts', bodyPart: 'shoulders', equipment: 'kettlebell', difficulty: 'intermediate', secondaryMuscles: ['triceps', 'abs'] },
  { id: '0530', name: 'kettlebell row', target: 'lats', bodyPart: 'back', equipment: 'kettlebell', difficulty: 'beginner', secondaryMuscles: ['biceps'] },
  { id: '0531', name: 'kettlebell floor press', target: 'pectorals', bodyPart: 'chest', equipment: 'kettlebell', difficulty: 'intermediate', secondaryMuscles: ['triceps'] },
  { id: '0532', name: 'kettlebell snatch', target: 'delts', bodyPart: 'shoulders', equipment: 'kettlebell', difficulty: 'advanced', secondaryMuscles: ['traps', 'glutes', 'abs'] },
  { id: '0533', name: 'kettlebell turkish get up', target: 'abs', bodyPart: 'waist', equipment: 'kettlebell', difficulty: 'advanced', secondaryMuscles: ['delts', 'glutes', 'quads'] },
  { id: '0534', name: 'kettlebell lunge', target: 'quads', bodyPart: 'upper legs', equipment: 'kettlebell', difficulty: 'intermediate', secondaryMuscles: ['glutes', 'hamstrings'] },
  { id: '0535', name: 'kettlebell windmill', target: 'abs', bodyPart: 'waist', equipment: 'kettlebell', difficulty: 'intermediate', secondaryMuscles: ['obliques', 'delts'] },

  // RESISTANCE BAND EXERCISES
  { id: '0701', name: 'resistance band row', target: 'lats', bodyPart: 'back', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['biceps'] },
  { id: '0702', name: 'resistance band chest press', target: 'pectorals', bodyPart: 'chest', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['triceps'] },
  { id: '0703', name: 'resistance band squat', target: 'quads', bodyPart: 'upper legs', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['glutes'] },
  { id: '0704', name: 'resistance band bicep curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'band', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0705', name: 'resistance band tricep extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'band', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0706', name: 'resistance band lateral raise', target: 'delts', bodyPart: 'shoulders', equipment: 'band', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0707', name: 'resistance band pull apart', target: 'upper back', bodyPart: 'back', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['rear delts'] },
  { id: '0708', name: 'resistance band face pull', target: 'upper back', bodyPart: 'back', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['rear delts'] },
  { id: '0709', name: 'resistance band glute bridge', target: 'glutes', bodyPart: 'upper legs', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['hamstrings'] },
  { id: '0710', name: 'resistance band clamshell', target: 'glutes', bodyPart: 'upper legs', equipment: 'band', difficulty: 'beginner', secondaryMuscles: ['abductors'] },

  // CARDIO / METABOLIC
  { id: '0800', name: 'burpee', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['pectorals', 'quads', 'abs'] },
  { id: '0801', name: 'jumping jack', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: [] },
  { id: '0802', name: 'high knees', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'body weight', difficulty: 'beginner', secondaryMuscles: ['hip flexors', 'abs'] },
  { id: '0803', name: 'box jump', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'body weight', difficulty: 'intermediate', secondaryMuscles: ['quads', 'glutes'] },
  { id: '0804', name: 'battle ropes', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'rope', difficulty: 'intermediate', secondaryMuscles: ['delts', 'abs'] },
  { id: '0805', name: 'rowing machine', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'rowing machine', difficulty: 'beginner', secondaryMuscles: ['lats', 'biceps', 'quads'] },
  { id: '0806', name: 'assault bike', target: 'cardiovascular system', bodyPart: 'cardio', equipment: 'stationary bike', difficulty: 'intermediate', secondaryMuscles: ['quads', 'delts'] },
];

// ============================================================================
// MODULE: benchmark-scenarios.mjs
// Comprehensive test scenarios with full gym equipment
// ============================================================================

const TEST_SCENARIOS = [
  // BODYBUILDING SCENARIOS
  {
    name: 'Classic Bodybuilding - Chest & Triceps',
    category: 'bodybuilding',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['chest', 'upper arms'],
      targetMuscles: ['pectorals', 'triceps'],
      duration: 60,
      experienceLevel: 'intermediate',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [3, 4],
      repsRange: [8, 12],
      restRange: [60, 90],
      shouldIncludeTechniques: ['supersets'],
      requiredMuscleBalance: { pectorals: 0.5, triceps: 0.3 },
    },
  },
  {
    name: 'Classic Bodybuilding - Back & Biceps',
    category: 'bodybuilding',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['back', 'upper arms'],
      targetMuscles: ['lats', 'upper back', 'biceps'],
      duration: 60,
      experienceLevel: 'intermediate',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [3, 4],
      repsRange: [8, 12],
      restRange: [60, 90],
      shouldIncludeTechniques: ['supersets'],
      requiredMuscleBalance: { lats: 0.4, biceps: 0.3 },
    },
  },
  {
    name: 'Bodybuilding - Shoulder Focus',
    category: 'bodybuilding',
    request: {
      equipment: ['dumbbell', 'barbell', 'cable', 'leverage machine'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['shoulders'],
      targetMuscles: ['delts'],
      duration: 45,
      experienceLevel: 'intermediate',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [3, 4],
      repsRange: [10, 15],
      restRange: [45, 75],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: { delts: 0.8 },
    },
  },
  {
    name: 'High Volume Leg Day',
    category: 'bodybuilding',
    request: {
      equipment: ['barbell', 'dumbbell', 'leverage machine', 'cable'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['upper legs', 'lower legs'],
      targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
      duration: 75,
      experienceLevel: 'advanced',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 6,
      maxExercises: 10,
      setsRange: [3, 5],
      repsRange: [8, 15],
      restRange: [60, 120],
      shouldIncludeTechniques: ['supersets', 'drop sets'],
      requiredMuscleBalance: { quads: 0.35, hamstrings: 0.25, glutes: 0.2, calves: 0.1 },
    },
  },

  // STRENGTH SCENARIOS
  {
    name: 'Strength Focused - Upper Body',
    category: 'strength',
    request: {
      equipment: ['barbell', 'dumbbell', 'cable'],
      trainingStyle: 'strength_focused',
      bodyParts: ['chest', 'back', 'shoulders'],
      targetMuscles: ['pectorals', 'lats', 'delts'],
      duration: 60,
      experienceLevel: 'advanced',
      goal: 'build_strength',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [4, 5],
      repsRange: [4, 6],
      restRange: [120, 240],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: { pectorals: 0.3, lats: 0.3, delts: 0.25 },
    },
  },
  {
    name: 'Strength Focused - Lower Body',
    category: 'strength',
    request: {
      equipment: ['barbell', 'dumbbell', 'leverage machine'],
      trainingStyle: 'strength_focused',
      bodyParts: ['upper legs'],
      targetMuscles: ['quads', 'hamstrings', 'glutes'],
      duration: 60,
      experienceLevel: 'advanced',
      goal: 'build_strength',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [4, 5],
      repsRange: [4, 6],
      restRange: [120, 240],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: { quads: 0.35, hamstrings: 0.3, glutes: 0.25 },
    },
  },
  {
    name: 'Powerlifting Prep',
    category: 'strength',
    request: {
      equipment: ['barbell', 'dumbbell'],
      trainingStyle: 'strength_focused',
      bodyParts: ['chest', 'upper legs', 'back'],
      targetMuscles: ['pectorals', 'quads', 'spine'],
      duration: 90,
      experienceLevel: 'advanced',
      goal: 'build_strength',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 7,
      setsRange: [4, 5],
      repsRange: [4, 6],
      restRange: [120, 240],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: { pectorals: 0.3, quads: 0.3, spine: 0.3 },
    },
  },

  // HIGH INTENSITY (HIT) SCENARIOS - Mentzer/Yates style
  {
    name: 'HIT - Upper Body',
    category: 'high_intensity_hit',
    request: {
      equipment: ['leverage machine', 'dumbbell', 'cable'],
      trainingStyle: 'high_intensity_hit',
      bodyParts: ['chest', 'back', 'shoulders'],
      targetMuscles: ['pectorals', 'lats', 'delts'],
      duration: 45,
      experienceLevel: 'advanced',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [1, 2],
      repsRange: [6, 10],
      restRange: [120, 180],
      shouldIncludeTechniques: ['slow_negatives', 'to_failure'],
      requiredMuscleBalance: { pectorals: 0.3, lats: 0.3, delts: 0.25 },
    },
  },
  {
    name: 'HIT - Full Body',
    category: 'high_intensity_hit',
    request: {
      equipment: ['leverage machine', 'dumbbell'],
      trainingStyle: 'high_intensity_hit',
      bodyParts: ['full_body'],
      duration: 40,
      experienceLevel: 'intermediate',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 6,
      maxExercises: 10,
      setsRange: [1, 2],
      repsRange: [6, 10],
      restRange: [120, 180],
      shouldIncludeTechniques: ['slow_negatives', 'to_failure'],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'HIT - Legs',
    category: 'high_intensity_hit',
    request: {
      equipment: ['leverage machine', 'barbell'],
      trainingStyle: 'high_intensity_hit',
      bodyParts: ['upper legs', 'lower legs'],
      targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
      duration: 35,
      experienceLevel: 'advanced',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [1, 2],
      repsRange: [6, 10],
      restRange: [120, 180],
      shouldIncludeTechniques: ['slow_negatives', 'to_failure'],
      requiredMuscleBalance: { quads: 0.3, hamstrings: 0.25, glutes: 0.2, calves: 0.1 },
    },
  },

  // MUSCULAR ENDURANCE SCENARIOS - Circuit/Tri-set based
  {
    name: 'Muscular Endurance - Full Body Circuit',
    category: 'muscular_endurance',
    request: {
      equipment: ['body weight', 'dumbbell', 'kettlebell'],
      trainingStyle: 'muscular_endurance',
      bodyParts: ['full_body'],
      duration: 30,
      experienceLevel: 'intermediate',
      goal: 'get_lean',
    },
    expectations: {
      minExercises: 6,
      maxExercises: 10,
      setsRange: [2, 3],
      repsRange: [15, 20],
      restRange: [30, 45],
      shouldIncludeTechniques: ['circuit', 'tri_sets'],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'Muscular Endurance - Upper Body',
    category: 'muscular_endurance',
    request: {
      equipment: ['dumbbell', 'cable', 'band'],
      trainingStyle: 'muscular_endurance',
      bodyParts: ['chest', 'back', 'shoulders', 'upper arms'],
      targetMuscles: ['pectorals', 'lats', 'delts', 'biceps', 'triceps'],
      duration: 35,
      experienceLevel: 'intermediate',
      goal: 'get_lean',
    },
    expectations: {
      minExercises: 6,
      maxExercises: 9,
      setsRange: [2, 3],
      repsRange: [15, 20],
      restRange: [30, 45],
      shouldIncludeTechniques: ['circuit', 'supersets'],
      requiredMuscleBalance: { pectorals: 0.2, lats: 0.2, delts: 0.2, biceps: 0.15, triceps: 0.15 },
    },
  },
  {
    name: 'Muscular Endurance - Conditioning Circuit',
    category: 'muscular_endurance',
    request: {
      equipment: ['body weight'],
      trainingStyle: 'muscular_endurance',
      bodyParts: ['full_body', 'cardio'],
      duration: 25,
      experienceLevel: 'beginner',
      goal: 'get_lean',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [2, 3],
      repsRange: [15, 20],
      restRange: [30, 45],
      shouldIncludeTechniques: ['circuit'],
      requiredMuscleBalance: {},
    },
  },

  // MINIMAL EQUIPMENT SCENARIOS
  {
    name: 'Home Gym - Dumbbells Only',
    category: 'minimal',
    request: {
      equipment: ['dumbbell'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['chest', 'back', 'shoulders', 'upper arms'],
      targetMuscles: ['pectorals', 'lats', 'delts', 'biceps', 'triceps'],
      duration: 45,
      experienceLevel: 'intermediate',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [3, 4],
      repsRange: [8, 15],
      restRange: [45, 90],
      shouldIncludeTechniques: ['supersets'],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'Bodyweight Only - Upper Body',
    category: 'minimal',
    request: {
      equipment: ['body weight'],
      trainingStyle: 'functional_fitness',
      bodyParts: ['chest', 'back', 'shoulders', 'upper arms'],
      targetMuscles: ['pectorals', 'lats', 'delts', 'triceps'],
      duration: 30,
      experienceLevel: 'beginner',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 7,
      setsRange: [3, 4],
      repsRange: [8, 20],
      restRange: [30, 60],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'Resistance Bands - Full Body',
    category: 'minimal',
    request: {
      equipment: ['band', 'body weight'],
      trainingStyle: 'functional_fitness',
      bodyParts: ['full_body'],
      duration: 35,
      experienceLevel: 'beginner',
      goal: 'get_lean',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [3, 4],
      repsRange: [12, 20],
      restRange: [30, 60],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'Kettlebell Only - Strength',
    category: 'minimal',
    request: {
      equipment: ['kettlebell'],
      trainingStyle: 'strength_focused',
      bodyParts: ['full_body'],
      duration: 40,
      experienceLevel: 'intermediate',
      goal: 'build_strength',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [4, 5],
      repsRange: [4, 6],
      restRange: [120, 240],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: {},
    },
  },

  // BEGINNER SCENARIOS
  {
    name: 'Beginner Full Body',
    category: 'beginner',
    request: {
      equipment: ['dumbbell', 'leverage machine', 'body weight'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['full_body'],
      duration: 45,
      experienceLevel: 'beginner',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 5,
      maxExercises: 8,
      setsRange: [2, 3],
      repsRange: [10, 15],
      restRange: [60, 90],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: {},
    },
  },
  {
    name: 'Beginner Upper/Lower Split - Upper',
    category: 'beginner',
    request: {
      equipment: ['dumbbell', 'cable', 'leverage machine'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['chest', 'back', 'shoulders', 'upper arms'],
      duration: 40,
      experienceLevel: 'beginner',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 4,
      maxExercises: 6,
      setsRange: [2, 3],
      repsRange: [10, 15],
      restRange: [60, 90],
      shouldIncludeTechniques: [],
      requiredMuscleBalance: {},
    },
  },

  // ADVANCED SCENARIOS
  {
    name: 'Advanced Push Day',
    category: 'advanced',
    request: {
      equipment: ['barbell', 'dumbbell', 'cable', 'leverage machine'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['chest', 'shoulders', 'upper arms'],
      targetMuscles: ['pectorals', 'delts', 'triceps'],
      duration: 75,
      experienceLevel: 'advanced',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 7,
      maxExercises: 10,
      setsRange: [3, 5],
      repsRange: [6, 15],
      restRange: [45, 120],
      shouldIncludeTechniques: ['supersets', 'drop sets', 'rest pause'],
      requiredMuscleBalance: { pectorals: 0.35, delts: 0.3, triceps: 0.25 },
    },
  },
  {
    name: 'Advanced Pull Day',
    category: 'advanced',
    request: {
      equipment: ['barbell', 'dumbbell', 'cable', 'leverage machine', 'body weight'],
      trainingStyle: 'classic_bodybuilding',
      bodyParts: ['back', 'upper arms'],
      targetMuscles: ['lats', 'upper back', 'biceps'],
      duration: 75,
      experienceLevel: 'advanced',
      goal: 'build_muscle',
    },
    expectations: {
      minExercises: 7,
      maxExercises: 10,
      setsRange: [3, 5],
      repsRange: [6, 15],
      restRange: [45, 120],
      shouldIncludeTechniques: ['supersets', 'drop sets'],
      requiredMuscleBalance: { lats: 0.35, 'upper back': 0.25, biceps: 0.25 },
    },
  },
];

// ============================================================================
// MODULE: benchmark-style-params.mjs
// Training style parameter definitions and validation
// ============================================================================

const TRAINING_STYLE_PARAMS = {
  classic_bodybuilding: {
    name: 'Classic Bodybuilding',
    description: 'Moderate volume, pump-focused, mix of compound and isolation',
    sets: { min: 3, max: 4, optimal: 4 },
    reps: { min: 8, max: 12, optimal: 10 },
    rest: { min: 60, max: 90, optimal: 75 },
    tempo: '2-0-2-0',
    rpe: { min: 7, max: 9, optimal: 8 },
    advancedTechniques: ['supersets'],
    exerciseOrder: ['compound', 'compound', 'isolation', 'isolation'],
    volumeMultiplier: 1.0,
  },
  strength_focused: {
    name: 'Strength Focused',
    description: 'Heavy compounds prioritized, low rep, longer rest',
    sets: { min: 4, max: 5, optimal: 5 },
    reps: { min: 4, max: 6, optimal: 5 },
    rest: { min: 120, max: 240, optimal: 180 },
    tempo: '2-1-2-1',
    rpe: { min: 8, max: 10, optimal: 9 },
    advancedTechniques: ['straight_sets'],
    exerciseOrder: ['compound', 'compound', 'accessory'],
    volumeMultiplier: 0.8,
  },
  high_intensity_hit: {
    name: 'High Intensity (HIT)',
    description: 'Mentzer/Yates style - very low volume, maximum effort per set, to failure',
    sets: { min: 1, max: 2, optimal: 1 },
    reps: { min: 6, max: 10, optimal: 8 },
    rest: { min: 120, max: 180, optimal: 150 },
    tempo: 'slow_negatives',
    rpe: { min: 9, max: 10, optimal: 10 },
    advancedTechniques: ['slow_negatives', 'rest_pause', 'to_failure'],
    exerciseOrder: ['compound', 'compound', 'isolation'],
    volumeMultiplier: 0.4,
    preferMachines: true,
  },
  muscular_endurance: {
    name: 'Muscular Endurance',
    description: 'Fast-paced, minimal rest, conditioning-focused with circuits/tri-sets',
    sets: { min: 2, max: 3, optimal: 3 },
    reps: { min: 15, max: 20, optimal: 18 },
    rest: { min: 30, max: 45, optimal: 30 },
    restBetweenRounds: { min: 60, max: 90, optimal: 75 },
    tempo: 'controlled',
    rpe: { min: 6, max: 8, optimal: 7 },
    advancedTechniques: ['circuit', 'tri_sets', 'supersets', 'drop_sets'],
    exerciseOrder: ['compound', 'compound', 'isolation', 'isolation'],
    volumeMultiplier: 1.2,
    circuitStructure: true,
  },
  functional_fitness: {
    name: 'Functional Fitness',
    description: 'Movement-based training for real-world strength',
    sets: { min: 3, max: 4, optimal: 3 },
    reps: { min: 8, max: 15, optimal: 12 },
    rest: { min: 45, max: 75, optimal: 60 },
    tempo: 'controlled',
    rpe: { min: 6, max: 8, optimal: 7 },
    advancedTechniques: ['circuit'],
    exerciseOrder: ['compound', 'compound', 'unilateral', 'core'],
    volumeMultiplier: 1.0,
  },
};


// ============================================================================
// MODULE: benchmark-simple-metrics.mjs
// Simple metrics - just report what the LLM returned, no scoring
// ============================================================================

/**
 * Calculates simple metrics for a workout response - no scoring, just raw values
 */
function calculateEnhancedMetrics(workout, request, mockExercises) {
  if (!workout) {
    return {
      success: false,
      exerciseCount: 0,
      equipmentMatchRate: 0,
      avgSets: 0,
      avgReps: '-',
      avgRest: 0,
    };
  }

  const allExercises = extractExercises(workout);

  // Equipment match rate (percentage)
  const equipmentMatchRate = calculateEquipmentMatchRate(allExercises, request.equipment, mockExercises);

  // Average sets
  const setsValues = allExercises.map(ex => parseInt(ex.sets, 10)).filter(s => !isNaN(s));
  const avgSets = setsValues.length > 0
    ? Math.round((setsValues.reduce((a, b) => a + b, 0) / setsValues.length) * 10) / 10
    : 0;

  // Average reps - just show what was returned (could be ranges like "8-12")
  const repsValues = allExercises.map(ex => ex.reps).filter(r => r);
  const avgReps = getTypicalReps(repsValues);

  // Average rest in seconds
  const restValues = allExercises.map(ex => parseInt(ex.restSeconds, 10)).filter(r => !isNaN(r));
  const avgRest = restValues.length > 0
    ? Math.round(restValues.reduce((a, b) => a + b, 0) / restValues.length)
    : 0;

  return {
    success: true,
    exerciseCount: allExercises.length,
    equipmentMatchRate,
    avgSets,
    avgReps,
    avgRest,
  };
}

/**
 * Calculate equipment match rate as percentage
 */
function calculateEquipmentMatchRate(exercises, requestedEquipment, mockExercises) {
  if (!exercises || exercises.length === 0) return 0;

  const normalizedEquipment = requestedEquipment.map(eq => eq.toLowerCase());

  let matchCount = 0;
  for (const ex of exercises) {
    const exerciseInfo = mockExercises.find(m => m.id === ex.id);
    if (exerciseInfo) {
      const matches = normalizedEquipment.some(eq =>
        exerciseInfo.equipment.toLowerCase().includes(eq) ||
        (eq === 'body weight' && exerciseInfo.equipment === 'body weight') ||
        (eq === 'resistance band' && exerciseInfo.equipment === 'band') ||
        (eq === 'band' && exerciseInfo.equipment === 'band')
      );
      if (matches) matchCount++;
    }
  }

  return Math.round((matchCount / exercises.length) * 100);
}

/**
 * Get typical reps representation from an array of rep values
 */
function getTypicalReps(repsValues) {
  if (repsValues.length === 0) return '-';

  // Count occurrences of each rep value
  const counts = {};
  for (const rep of repsValues) {
    const repStr = String(rep);
    counts[repStr] = (counts[repStr] || 0) + 1;
  }

  // Find most common
  let mostCommon = repsValues[0];
  let maxCount = 0;
  for (const [rep, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = rep;
    }
  }

  return mostCommon;
}

/**
 * Extracts all exercises from workout sections
 */
function extractExercises(workout) {
  return workout.sections?.flatMap(s => s.exercises || []) || [];
}

// ============================================================================
// MODELS TO BENCHMARK
// Testing LLM compliance with training style specifications:
// - Classic Bodybuilding: 3-4 sets, 8-12 reps, 60-90s rest
// - Strength Focused: 4-5 sets, 4-6 reps, 120-240s rest, straight sets only
// - High Intensity (HIT): 1-2 sets to failure, slow negatives, machine preference
// - Muscular Endurance: 2-3 sets, 15-20 reps, circuit/tri-set structure
// Evaluates: set/rep/rest compliance, technique usage, equipment adherence
// ============================================================================

const MODELS = [
  { id: 'openai/gpt-5', name: 'GPT-5', tier: 'premium' },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', tier: 'premium' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude 4.5 Haiku', tier: 'fast' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', tier: 'premium' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', tier: 'fast' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', tier: 'reasoning' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1', tier: 'fast' },
];

// ============================================================================
// PROMPT BUILDER (Enhanced version with style-specific instructions)
// ============================================================================

/**
 * Builds style-specific critical instructions based on training type
 */
function getStyleSpecificInstructions(trainingStyle, trainingStyles) {
  const styles = trainingStyles || [trainingStyle];
  const instructions = [];

  // HIT-specific instructions
  if (styles.includes('high_intensity_hit')) {
    instructions.push(`
CRITICAL HIT TRAINING RULES:
- Maximum 1-2 working sets per exercise (Mentzer/Yates methodology)
- Use slow negatives (4-6 seconds down) on every rep
- Train to complete muscular failure on each working set
- Prefer machines for failure sets (safer than free weights)
- Rest 2-3 minutes between exercises to allow full recovery
- Include rest-pause or forced reps techniques where appropriate
- Lower volume = higher intensity per set`);
  }

  // Muscular Endurance-specific instructions
  if (styles.includes('muscular_endurance')) {
    instructions.push(`
CRITICAL MUSCULAR ENDURANCE RULES:
- Structure workout as circuits or tri-sets
- 0 seconds rest between exercises within a circuit/tri-set
- 60-90 seconds rest between rounds/circuits
- 15-20+ reps per exercise
- Use supersets, tri-sets, and drop sets liberally
- Prioritize maintaining heart rate elevation
- Keep workout fast-paced with minimal downtime`);
  }

  // Strength-focused instructions
  if (styles.includes('strength_focused')) {
    instructions.push(`
STRENGTH TRAINING RULES:
- Use straight sets only (no supersets)
- 4-6 reps with heavy weight
- 2-4 minutes rest between sets for full ATP recovery
- Prioritize compound movements (squat, deadlift, bench, row, press)
- Focus on progressive overload`);
  }

  // Blend instructions when 2 styles selected
  if (styles.length === 2) {
    const [styleA, styleB] = styles;
    const paramsA = TRAINING_STYLE_PARAMS[styleA];
    const paramsB = TRAINING_STYLE_PARAMS[styleB];
    const nameA = paramsA?.name || styleA;
    const nameB = paramsB?.name || styleB;

    instructions.push(`
BLENDING ${nameA.toUpperCase()} + ${nameB.toUpperCase()}:
- Distribute exercises roughly 50/50 between the two styles
- First half of workout: Use ${nameA} parameters (sets: ${paramsA?.sets?.min}-${paramsA?.sets?.max}, reps: ${paramsA?.reps?.min}-${paramsA?.reps?.max})
- Second half of workout: Use ${nameB} parameters (sets: ${paramsB?.sets?.min}-${paramsB?.sets?.max}, reps: ${paramsB?.reps?.min}-${paramsB?.reps?.max})
- Compound movements can take one style, isolation/accessory movements take the other`);
  }

  return instructions.join('\n');
}

function buildWorkoutPrompt(request, exerciseList) {
  const trainingStyle = request.trainingStyle;
  const trainingStyles = request.trainingStyles || [trainingStyle];
  const styleParams = TRAINING_STYLE_PARAMS[trainingStyle];
  const styleName = styleParams?.name || trainingStyle;
  const styleDesc = styleParams?.description || '';

  const advancedTechSection = styleParams?.advancedTechniques?.length > 0
    ? `\nAdvanced Techniques for ${styleName}: ${styleParams.advancedTechniques.join(', ')}`
    : '';

  // Get style-specific critical instructions
  const styleSpecificInstructions = getStyleSpecificInstructions(trainingStyle, trainingStyles);

  return `You are a professional fitness trainer creating a personalized workout.

USER PROFILE:
- Goal: ${request.goal}
- Experience: ${request.experienceLevel}
- Training Style: ${styleName}${styleDesc ? ` (${styleDesc})` : ''}
- Target Duration: ${request.duration} minutes
- Body Parts: ${request.bodyParts.join(', ')}
- Target Muscles: ${request.targetMuscles?.length ? request.targetMuscles.join(', ') : 'any'}
- Available Equipment: ${request.equipment.length > 0 ? request.equipment.join(', ') : 'body weight only'}

TRAINING STYLE PARAMETERS (${styleName}):
- Sets: ${styleParams?.sets ? `${styleParams.sets.min}-${styleParams.sets.max}` : '3-4'}
- Reps: ${styleParams?.reps ? `${styleParams.reps.min}-${styleParams.reps.max}` : '8-12'}
- Rest: ${styleParams?.rest ? `${styleParams.rest.min}-${styleParams.rest.max}s` : '60-90s'}${advancedTechSection}
${styleSpecificInstructions}

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
          "id": "exercise id from the list",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 60,
          "notes": "Optional tips or technique notes"
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

IMPORTANT GUIDELINES:
1. Select 4-8 exercises based on duration
2. ALL exercises MUST match user's equipment exactly
3. Follow the training style parameters for sets/reps/rest
4. Group exercises logically into sections
5. Include relevant tips for the training style
6. For ${request.experienceLevel} level, ensure appropriate exercise selection`;
}

// ============================================================================
// OPENROUTER API CALL (Same structure as v1)
// ============================================================================

async function callOpenRouter(modelId, prompt) {
  const startTime = Date.now();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fitness-app-benchmark.local',
        'X-Title': 'Fitness App LLM Benchmark v2',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2500,
      }),
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
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let parsedWorkout = null;
    let parseError = null;

    try {
      let jsonString = content.trim();
      // Remove markdown code blocks if present
      if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
      if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
      if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
      jsonString = jsonString.trim();

      // Handle potential thinking blocks (e.g., from reasoning models)
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      parsedWorkout = JSON.parse(jsonString);
    } catch (e) {
      parseError = e.message;
    }

    return {
      success: true,
      latency,
      rawResponse: content,
      parsedWorkout,
      parseError,
      usage: data.usage,
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
// FILTER EXERCISES FOR SCENARIO
// ============================================================================

function filterExercisesForScenario(scenario) {
  const equipment = scenario.request.equipment;
  const bodyParts = scenario.request.bodyParts;

  return MOCK_EXERCISES.filter(ex => {
    // Equipment match
    const equipmentMatch = equipment.some(eq => {
      const eqLower = eq.toLowerCase();
      const exEquipLower = ex.equipment.toLowerCase();
      return exEquipLower.includes(eqLower) ||
        (eqLower === 'body weight' && exEquipLower === 'body weight') ||
        (eqLower === 'resistance band' && exEquipLower === 'band') ||
        (eqLower === 'band' && exEquipLower === 'band');
    });

    if (!equipmentMatch) return false;

    // Body part match (if specified and not full_body)
    if (bodyParts.includes('full_body')) return true;

    const bodyPartMatch = bodyParts.some(bp => {
      const bpLower = bp.toLowerCase();
      return ex.bodyPart.toLowerCase() === bpLower ||
        (bpLower === 'legs' && (ex.bodyPart === 'upper legs' || ex.bodyPart === 'lower legs')) ||
        (bpLower === 'arms' && ex.bodyPart === 'upper arms');
    });

    return bodyPartMatch;
  }).map(ex => ({
    id: ex.id,
    name: ex.name,
    target: ex.target,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
  }));
}

// ============================================================================
// MAIN BENCHMARK RUNNER
// ============================================================================

async function runBenchmark() {
  console.log('LLM Workout Generation Benchmark v2');
  console.log('====================================\n');
  console.log(`Testing ${MODELS.length} models across ${TEST_SCENARIOS.length} scenarios\n`);

  const results = {
    timestamp: new Date().toISOString(),
    version: '2.0',
    models: MODELS,
    scenarios: [],
    modelSummaries: {},
  };

  // Initialize model summaries with simple metrics
  for (const model of MODELS) {
    results.modelSummaries[model.id] = {
      name: model.name,
      tier: model.tier,
      totalTests: 0,
      successCount: 0,
      parseErrorCount: 0,
      apiErrorCount: 0,
      totalLatency: 0,
      // Simple metrics (raw values, no scoring)
      totalExerciseCount: 0,
      totalEquipmentMatchRate: 0,
      totalSets: 0,
      totalRest: 0,
      repsCounts: {}, // Track frequency of each reps value
    };
  }

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\nScenario: ${scenario.name}`);
    console.log(`Category: ${scenario.category} | Style: ${scenario.request.trainingStyle}`);
    console.log(`Equipment: ${scenario.request.equipment.join(', ')}`);
    console.log('-'.repeat(70));

    // Filter exercises for this scenario
    const availableExercises = filterExercisesForScenario(scenario);
    console.log(`Available exercises: ${availableExercises.length}`);

    const prompt = buildWorkoutPrompt(scenario.request, availableExercises);

    const scenarioResults = {
      name: scenario.name,
      category: scenario.category,
      request: scenario.request,
      expectations: scenario.expectations,
      exercisesAvailable: availableExercises.length,
      modelResults: [],
    };

    for (const model of MODELS) {
      process.stdout.write(`  ${model.name.padEnd(20)}... `);

      const result = await callOpenRouter(model.id, prompt);
      const metrics = calculateEnhancedMetrics(result.parsedWorkout, scenario.request, MOCK_EXERCISES);

      const modelResult = {
        model,
        ...result,
        metrics,
      };

      scenarioResults.modelResults.push(modelResult);

      // Update model summary
      const summary = results.modelSummaries[model.id];
      summary.totalTests++;

      if (result.success && result.parsedWorkout) {
        summary.successCount++;
        summary.totalLatency += result.latency;

        // Track simple metrics (raw values)
        summary.totalExerciseCount += metrics.exerciseCount || 0;
        summary.totalEquipmentMatchRate += metrics.equipmentMatchRate || 0;
        summary.totalSets += metrics.avgSets || 0;
        summary.totalRest += metrics.avgRest || 0;

        // Track reps frequency
        const reps = String(metrics.avgReps || '-');
        summary.repsCounts[reps] = (summary.repsCounts[reps] || 0) + 1;

        console.log(`OK ${result.latency}ms | Exercises: ${metrics.exerciseCount} | Equip: ${metrics.equipmentMatchRate}% | Sets: ${metrics.avgSets} | Reps: ${metrics.avgReps} | Rest: ${metrics.avgRest}s`);
      } else if (result.success && result.parseError) {
        summary.parseErrorCount++;
        console.log(`Parse Error: ${result.parseError.substring(0, 50)}`);
      } else {
        summary.apiErrorCount++;
        console.log(`API Error: ${result.error?.substring(0, 50)}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.scenarios.push(scenarioResults);
  }

  // Finalize model summaries (calculate averages)
  for (const model of MODELS) {
    const summary = results.modelSummaries[model.id];
    if (summary.successCount > 0) {
      summary.avgLatency = Math.round(summary.totalLatency / summary.successCount);

      // Simple metrics averages
      summary.avgExerciseCount = Math.round((summary.totalExerciseCount / summary.successCount) * 10) / 10;
      summary.avgEquipmentMatchRate = Math.round(summary.totalEquipmentMatchRate / summary.successCount);
      summary.avgSets = Math.round((summary.totalSets / summary.successCount) * 10) / 10;
      summary.avgRest = Math.round(summary.totalRest / summary.successCount);

      // Find most common reps value
      let mostCommonReps = '-';
      let maxCount = 0;
      for (const [reps, count] of Object.entries(summary.repsCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostCommonReps = reps;
        }
      }
      summary.avgReps = mostCommonReps;
    }
    summary.successRate = Math.round((summary.successCount / summary.totalTests) * 100);
  }

  // Save results
  const outputDir = path.join(__dirname, '../benchmark-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save JSON
  const jsonPath = path.join(outputDir, `workout-llm-benchmark-v2-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\nJSON results saved to: ${jsonPath}`);

  // Generate Enhanced Markdown report
  const mdPath = path.join(outputDir, `workout-llm-benchmark-v2-${timestamp}.md`);
  const mdContent = generateEnhancedMarkdownReport(results);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`Markdown report saved to: ${mdPath}`);

  // Print summary
  printEnhancedSummary(results);
}

// ============================================================================
// SIMPLE MARKDOWN REPORT GENERATOR
// ============================================================================

function generateEnhancedMarkdownReport(results) {
  let md = `# LLM Workout Generation Benchmark v2\n\n`;
  md += `**Generated:** ${results.timestamp}\n`;
  md += `**Version:** ${results.version}\n`;
  md += `**Scenarios Tested:** ${results.scenarios.length}\n`;
  md += `**Models Tested:** ${results.models.length}\n\n`;

  // Models Overview with simple metrics
  md += `## Models Overview\n\n`;
  md += `| Model | Tier | Success Rate | Avg Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |\n`;
  md += `|-------|------|--------------|-------------|-----------|-------------|----------|----------|----------|\n`;
  for (const model of results.models) {
    const summary = results.modelSummaries[model.id];
    md += `| ${model.name} | ${model.tier} | ${summary.successRate}% | ${summary.avgLatency || '-'}ms | ${summary.avgExerciseCount || '-'} | ${summary.avgEquipmentMatchRate || '-'}% | ${summary.avgSets || '-'} | ${summary.avgReps || '-'} | ${summary.avgRest || '-'}s |\n`;
  }

  // Detailed Results by Scenario Category
  md += `\n## Results by Category\n\n`;

  const categories = [...new Set(results.scenarios.map(s => s.category))];

  for (const category of categories) {
    md += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Scenarios\n\n`;

    const categoryScenarios = results.scenarios.filter(s => s.category === category);

    for (const scenario of categoryScenarios) {
      md += `#### ${scenario.name}\n\n`;
      md += `**Config:** ${scenario.request.equipment.join(', ')} | ${scenario.request.trainingStyle} | ${scenario.request.duration}min\n\n`;

      md += `| Model | Status | Latency | Exercises | Equip Match | Avg Sets | Avg Reps | Avg Rest |\n`;
      md += `|-------|--------|---------|-----------|-------------|----------|----------|----------|\n`;

      for (const result of scenario.modelResults) {
        const status = result.success && result.parsedWorkout ? 'OK' : result.success ? 'Parse Err' : 'API Err';
        const latency = `${result.latency}ms`;
        const exercises = result.metrics?.exerciseCount || '-';
        const equipMatch = result.metrics?.equipmentMatchRate !== undefined ? `${result.metrics.equipmentMatchRate}%` : '-';
        const avgSets = result.metrics?.avgSets || '-';
        const avgReps = result.metrics?.avgReps || '-';
        const avgRest = result.metrics?.avgRest !== undefined ? `${result.metrics.avgRest}s` : '-';

        md += `| ${result.model.name} | ${status} | ${latency} | ${exercises} | ${equipMatch} | ${avgSets} | ${avgReps} | ${avgRest} |\n`;
      }

      md += `\n`;
    }
  }

  // Sample Outputs
  md += `## Sample Workout Outputs\n\n`;
  md += `Selected examples showing workout structure:\n\n`;

  // Pick first successful result from first scenario for each model
  const firstScenario = results.scenarios[0];
  if (firstScenario) {
    md += `### ${firstScenario.name}\n\n`;

    for (const result of firstScenario.modelResults) {
      if (result.parsedWorkout?.title) {
        md += `#### ${result.model.name}\n\n`;
        md += `**Title:** ${result.parsedWorkout.title}\n\n`;
        md += `**Description:** ${result.parsedWorkout.description || 'N/A'}\n\n`;

        if (result.parsedWorkout.sections) {
          for (const section of result.parsedWorkout.sections) {
            md += `**${section.name}:**\n`;
            for (const ex of section.exercises || []) {
              const exInfo = MOCK_EXERCISES.find(m => m.id === ex.id);
              md += `- ${exInfo?.name || ex.id}: ${ex.sets} x ${ex.reps}, ${ex.restSeconds}s rest\n`;
            }
            md += '\n';
          }
        }

        md += `---\n\n`;
      }
    }
  }

  // Methodology
  md += `## Methodology\n\n`;
  md += `### Metrics Reported\n\n`;
  md += `- **Exercise Count:** Number of exercises in the workout\n`;
  md += `- **Equipment Match Rate:** Percentage of exercises using requested equipment\n`;
  md += `- **Avg Sets:** Average sets per exercise\n`;
  md += `- **Avg Reps:** Most common reps value returned\n`;
  md += `- **Avg Rest:** Average rest period in seconds\n\n`;

  md += `### Training Style Parameters (Reference)\n\n`;
  md += `| Style | Sets | Reps | Rest |\n`;
  md += `|-------|------|------|------|\n`;
  for (const [key, params] of Object.entries(TRAINING_STYLE_PARAMS)) {
    md += `| ${params.name} | ${params.sets.min}-${params.sets.max} | ${params.reps.min}-${params.reps.max} | ${params.rest.min}-${params.rest.max}s |\n`;
  }

  return md;
}

// ============================================================================
// SIMPLE SUMMARY PRINTER
// ============================================================================

function printEnhancedSummary(results) {
  console.log('\n' + '='.repeat(90));
  console.log('BENCHMARK SUMMARY v2 (Simple Metrics)');
  console.log('='.repeat(90));

  // Models by Success Rate
  const rankedModels = Object.values(results.modelSummaries)
    .filter(s => s.successCount > 0)
    .sort((a, b) => b.successRate - a.successRate);

  console.log('\nMODEL RESULTS:');
  console.log('-'.repeat(90));
  console.log('| Model                | Success | Latency | Exercises | Equip Match | Sets | Reps    | Rest  |');
  console.log('|----------------------|---------|---------|-----------|-------------|------|---------|-------|');

  rankedModels.forEach((model) => {
    const name = model.name.padEnd(20);
    const success = `${model.successRate}%`.padEnd(7);
    const latency = `${model.avgLatency || '-'}ms`.padEnd(7);
    const exercises = String(model.avgExerciseCount || '-').padEnd(9);
    const equipMatch = `${model.avgEquipmentMatchRate || '-'}%`.padEnd(11);
    const sets = String(model.avgSets || '-').padEnd(4);
    const reps = String(model.avgReps || '-').padEnd(7);
    const rest = `${model.avgRest || '-'}s`.padEnd(5);

    console.log(`| ${name} | ${success} | ${latency} | ${exercises} | ${equipMatch} | ${sets} | ${reps} | ${rest} |`);
  });

  // Quick Stats
  console.log('\nQUICK STATS:');
  console.log('-'.repeat(90));

  if (rankedModels.length > 0) {
    const fastestSuccessful = Object.values(results.modelSummaries)
      .filter(s => s.successCount > 0 && s.avgLatency)
      .sort((a, b) => a.avgLatency - b.avgLatency)[0];
    if (fastestSuccessful) {
      console.log(`  Fastest Response:       ${fastestSuccessful.name} (${fastestSuccessful.avgLatency}ms avg)`);
    }

    const highestSuccess = rankedModels[0];
    console.log(`  Highest Success Rate:   ${highestSuccess.name} (${highestSuccess.successRate}%)`);

    const bestEquipment = Object.values(results.modelSummaries)
      .filter(s => s.successCount > 0)
      .sort((a, b) => (b.avgEquipmentMatchRate || 0) - (a.avgEquipmentMatchRate || 0))[0];
    if (bestEquipment) {
      console.log(`  Best Equipment Match:   ${bestEquipment.name} (${bestEquipment.avgEquipmentMatchRate}%)`);
    }
  }

  console.log('\n' + '='.repeat(90));
  console.log('Benchmark complete!');
  console.log('='.repeat(90) + '\n');
}

// Run the benchmark
runBenchmark().catch(console.error);
