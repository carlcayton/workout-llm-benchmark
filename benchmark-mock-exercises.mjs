/**
 * Comprehensive Mock Exercise Database for LLM Workout Benchmark
 *
 * 150+ exercises covering all body parts and equipment types.
 * Matches ExerciseDB format used in production edge functions.
 *
 * Usage:
 *   import { MOCK_EXERCISES, getExercisesByEquipment } from './benchmark-mock-exercises.mjs';
 */

// ============================================================================
// EXERCISE DATABASE (150+ exercises)
// ============================================================================

export const MOCK_EXERCISES = [
  // -------------------------------------------------------------------------
  // CHEST (25 exercises)
  // -------------------------------------------------------------------------
  { id: 'ch001', name: 'Barbell Bench Press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'ch002', name: 'Incline Barbell Bench Press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'ch003', name: 'Decline Barbell Bench Press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'ch004', name: 'Dumbbell Bench Press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch005', name: 'Incline Dumbbell Press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch006', name: 'Decline Dumbbell Press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch007', name: 'Dumbbell Flyes', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch008', name: 'Incline Dumbbell Flyes', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch009', name: 'Cable Crossover', target: 'pectorals', bodyPart: 'chest', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'ch010', name: 'Low Cable Crossover', target: 'pectorals', bodyPart: 'chest', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'ch011', name: 'High Cable Crossover', target: 'pectorals', bodyPart: 'chest', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'ch012', name: 'Pec Deck Machine', target: 'pectorals', bodyPart: 'chest', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'ch013', name: 'Chest Press Machine', target: 'pectorals', bodyPart: 'chest', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'ch014', name: 'Smith Machine Bench Press', target: 'pectorals', bodyPart: 'chest', equipment: 'smith machine', difficulty: 'beginner' },
  { id: 'ch015', name: 'Smith Machine Incline Press', target: 'pectorals', bodyPart: 'chest', equipment: 'smith machine', difficulty: 'beginner' },
  { id: 'ch016', name: 'Push-ups', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ch017', name: 'Incline Push-ups', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ch018', name: 'Decline Push-ups', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ch019', name: 'Diamond Push-ups', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ch020', name: 'Weighted Dips', target: 'pectorals', bodyPart: 'chest', equipment: 'weighted', difficulty: 'advanced' },
  { id: 'ch021', name: 'Chest Dips', target: 'pectorals', bodyPart: 'chest', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ch022', name: 'Landmine Press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'ch023', name: 'Floor Press', target: 'pectorals', bodyPart: 'chest', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'ch024', name: 'Svend Press', target: 'pectorals', bodyPart: 'chest', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ch025', name: 'Kettlebell Floor Press', target: 'pectorals', bodyPart: 'chest', equipment: 'kettlebell', difficulty: 'intermediate' },

  // -------------------------------------------------------------------------
  // BACK (30 exercises)
  // -------------------------------------------------------------------------
  { id: 'bk001', name: 'Barbell Row', target: 'lats', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bk002', name: 'Pendlay Row', target: 'lats', bodyPart: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'bk003', name: 'T-Bar Row', target: 'upper back', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bk004', name: 'Dumbbell Row', target: 'lats', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bk005', name: 'Incline Dumbbell Row', target: 'upper back', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bk006', name: 'Chest Supported Row', target: 'upper back', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bk007', name: 'Lat Pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bk008', name: 'Wide Grip Lat Pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bk009', name: 'Close Grip Lat Pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bk010', name: 'Straight Arm Pulldown', target: 'lats', bodyPart: 'back', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'bk011', name: 'Seated Cable Row', target: 'upper back', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bk012', name: 'Face Pull', target: 'upper back', bodyPart: 'back', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bk013', name: 'Pull-ups', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'bk014', name: 'Chin-ups', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'bk015', name: 'Wide Grip Pull-ups', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'advanced' },
  { id: 'bk016', name: 'Neutral Grip Pull-ups', target: 'lats', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'bk017', name: 'Assisted Pull-ups', target: 'lats', bodyPart: 'back', equipment: 'assisted', difficulty: 'beginner' },
  { id: 'bk018', name: 'Deadlift', target: 'spine', bodyPart: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'bk019', name: 'Romanian Deadlift', target: 'spine', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bk020', name: 'Rack Pull', target: 'spine', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bk021', name: 'Good Morning', target: 'spine', bodyPart: 'back', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bk022', name: 'Hyperextension', target: 'spine', bodyPart: 'back', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'bk023', name: 'Reverse Hyperextension', target: 'spine', bodyPart: 'back', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'bk024', name: 'Meadows Row', target: 'lats', bodyPart: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'bk025', name: 'Seal Row', target: 'upper back', bodyPart: 'back', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'bk026', name: 'Kettlebell Row', target: 'lats', bodyPart: 'back', equipment: 'kettlebell', difficulty: 'beginner' },
  { id: 'bk027', name: 'Renegade Row', target: 'lats', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'advanced' },
  { id: 'bk028', name: 'Inverted Row', target: 'upper back', bodyPart: 'back', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'bk029', name: 'Barbell Shrug', target: 'traps', bodyPart: 'back', equipment: 'barbell', difficulty: 'beginner' },
  { id: 'bk030', name: 'Dumbbell Shrug', target: 'traps', bodyPart: 'back', equipment: 'dumbbell', difficulty: 'beginner' },

  // -------------------------------------------------------------------------
  // SHOULDERS (25 exercises)
  // -------------------------------------------------------------------------
  { id: 'sh001', name: 'Overhead Press', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'sh002', name: 'Push Press', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'sh003', name: 'Behind the Neck Press', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'sh004', name: 'Dumbbell Shoulder Press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh005', name: 'Arnold Press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'sh006', name: 'Seated Dumbbell Press', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh007', name: 'Lateral Raise', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh008', name: 'Cable Lateral Raise', target: 'delts', bodyPart: 'shoulders', equipment: 'cable', difficulty: 'beginner' },
  { id: 'sh009', name: 'Machine Lateral Raise', target: 'delts', bodyPart: 'shoulders', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'sh010', name: 'Front Raise', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh011', name: 'Plate Front Raise', target: 'delts', bodyPart: 'shoulders', equipment: 'weighted', difficulty: 'beginner' },
  { id: 'sh012', name: 'Rear Delt Fly', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh013', name: 'Reverse Pec Deck', target: 'delts', bodyPart: 'shoulders', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'sh014', name: 'Cable Rear Delt Fly', target: 'delts', bodyPart: 'shoulders', equipment: 'cable', difficulty: 'beginner' },
  { id: 'sh015', name: 'Upright Row', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'sh016', name: 'Dumbbell Upright Row', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'sh017', name: 'Cable Upright Row', target: 'delts', bodyPart: 'shoulders', equipment: 'cable', difficulty: 'beginner' },
  { id: 'sh018', name: 'Smith Machine Shoulder Press', target: 'delts', bodyPart: 'shoulders', equipment: 'smith machine', difficulty: 'beginner' },
  { id: 'sh019', name: 'Machine Shoulder Press', target: 'delts', bodyPart: 'shoulders', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'sh020', name: 'Kettlebell Press', target: 'delts', bodyPart: 'shoulders', equipment: 'kettlebell', difficulty: 'intermediate' },
  { id: 'sh021', name: 'Landmine Shoulder Press', target: 'delts', bodyPart: 'shoulders', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'sh022', name: 'Pike Push-ups', target: 'delts', bodyPart: 'shoulders', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'sh023', name: 'Handstand Push-ups', target: 'delts', bodyPart: 'shoulders', equipment: 'body weight', difficulty: 'advanced' },
  { id: 'sh024', name: 'Lu Raises', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'sh025', name: 'Y-Raises', target: 'delts', bodyPart: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner' },

  // -------------------------------------------------------------------------
  // BICEPS (15 exercises)
  // -------------------------------------------------------------------------
  { id: 'bi001', name: 'Barbell Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'beginner' },
  { id: 'bi002', name: 'EZ Bar Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'ez barbell', difficulty: 'beginner' },
  { id: 'bi003', name: 'Preacher Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'ez barbell', difficulty: 'beginner' },
  { id: 'bi004', name: 'Dumbbell Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bi005', name: 'Hammer Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bi006', name: 'Incline Dumbbell Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'bi007', name: 'Concentration Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'bi008', name: 'Spider Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'bi009', name: 'Cable Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bi010', name: 'Cable Hammer Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'bi011', name: 'High Cable Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'bi012', name: 'Machine Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'bi013', name: 'Drag Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'bi014', name: 'Zottman Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'bi015', name: 'Kettlebell Curl', target: 'biceps', bodyPart: 'upper arms', equipment: 'kettlebell', difficulty: 'beginner' },

  // -------------------------------------------------------------------------
  // TRICEPS (15 exercises)
  // -------------------------------------------------------------------------
  { id: 'tr001', name: 'Close Grip Bench Press', target: 'triceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'tr002', name: 'Skull Crushers', target: 'triceps', bodyPart: 'upper arms', equipment: 'ez barbell', difficulty: 'intermediate' },
  { id: 'tr003', name: 'Overhead Tricep Extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'tr004', name: 'Tricep Kickback', target: 'triceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'tr005', name: 'Cable Pushdown', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'tr006', name: 'Rope Pushdown', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'tr007', name: 'Overhead Cable Extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'tr008', name: 'Tricep Dips', target: 'triceps', bodyPart: 'upper arms', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'tr009', name: 'Bench Dips', target: 'triceps', bodyPart: 'upper arms', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'tr010', name: 'Diamond Push-ups', target: 'triceps', bodyPart: 'upper arms', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'tr011', name: 'JM Press', target: 'triceps', bodyPart: 'upper arms', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'tr012', name: 'Tate Press', target: 'triceps', bodyPart: 'upper arms', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'tr013', name: 'Machine Tricep Extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'tr014', name: 'Single Arm Pushdown', target: 'triceps', bodyPart: 'upper arms', equipment: 'cable', difficulty: 'beginner' },
  { id: 'tr015', name: 'Kettlebell Tricep Extension', target: 'triceps', bodyPart: 'upper arms', equipment: 'kettlebell', difficulty: 'beginner' },

  // -------------------------------------------------------------------------
  // QUADS (20 exercises)
  // -------------------------------------------------------------------------
  { id: 'qu001', name: 'Barbell Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'qu002', name: 'Front Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'qu003', name: 'Goblet Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'qu004', name: 'Dumbbell Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'qu005', name: 'Leg Press', target: 'quads', bodyPart: 'upper legs', equipment: 'sled machine', difficulty: 'beginner' },
  { id: 'qu006', name: 'Hack Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'sled machine', difficulty: 'intermediate' },
  { id: 'qu007', name: 'Leg Extension', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'qu008', name: 'Walking Lunges', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'qu009', name: 'Bulgarian Split Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'qu010', name: 'Step-ups', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'qu011', name: 'Sissy Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'qu012', name: 'Smith Machine Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'smith machine', difficulty: 'beginner' },
  { id: 'qu013', name: 'Box Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'qu014', name: 'Pause Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'qu015', name: 'Zercher Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'advanced' },
  { id: 'qu016', name: 'Kettlebell Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'kettlebell', difficulty: 'beginner' },
  { id: 'qu017', name: 'Pistol Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'advanced' },
  { id: 'qu018', name: 'Air Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'qu019', name: 'Reverse Lunge', target: 'quads', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'qu020', name: 'Pendulum Squat', target: 'quads', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'intermediate' },

  // -------------------------------------------------------------------------
  // HAMSTRINGS & GLUTES (15 exercises)
  // -------------------------------------------------------------------------
  { id: 'hg001', name: 'Romanian Deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'hg002', name: 'Stiff-Leg Deadlift', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'hg003', name: 'Dumbbell RDL', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'hg004', name: 'Single Leg RDL', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'dumbbell', difficulty: 'intermediate' },
  { id: 'hg005', name: 'Lying Leg Curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'hg006', name: 'Seated Leg Curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'hg007', name: 'Nordic Curl', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'advanced' },
  { id: 'hg008', name: 'Hip Thrust', target: 'glutes', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'hg009', name: 'Glute Bridge', target: 'glutes', bodyPart: 'upper legs', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'hg010', name: 'Cable Pull-through', target: 'glutes', bodyPart: 'upper legs', equipment: 'cable', difficulty: 'beginner' },
  { id: 'hg011', name: 'Kickback Machine', target: 'glutes', bodyPart: 'upper legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'hg012', name: 'Cable Kickback', target: 'glutes', bodyPart: 'upper legs', equipment: 'cable', difficulty: 'beginner' },
  { id: 'hg013', name: 'Kettlebell Swing', target: 'glutes', bodyPart: 'upper legs', equipment: 'kettlebell', difficulty: 'intermediate' },
  { id: 'hg014', name: 'Good Morning', target: 'hamstrings', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'intermediate' },
  { id: 'hg015', name: 'Sumo Deadlift', target: 'glutes', bodyPart: 'upper legs', equipment: 'barbell', difficulty: 'advanced' },

  // -------------------------------------------------------------------------
  // CALVES (8 exercises)
  // -------------------------------------------------------------------------
  { id: 'ca001', name: 'Standing Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'ca002', name: 'Seated Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'leverage machine', difficulty: 'beginner' },
  { id: 'ca003', name: 'Donkey Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'sled machine', difficulty: 'intermediate' },
  { id: 'ca004', name: 'Smith Machine Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'smith machine', difficulty: 'beginner' },
  { id: 'ca005', name: 'Leg Press Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'sled machine', difficulty: 'beginner' },
  { id: 'ca006', name: 'Dumbbell Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'dumbbell', difficulty: 'beginner' },
  { id: 'ca007', name: 'Single Leg Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ca008', name: 'Barbell Calf Raise', target: 'calves', bodyPart: 'lower legs', equipment: 'barbell', difficulty: 'intermediate' },

  // -------------------------------------------------------------------------
  // ABS / CORE (15 exercises)
  // -------------------------------------------------------------------------
  { id: 'ab001', name: 'Cable Crunch', target: 'abs', bodyPart: 'waist', equipment: 'cable', difficulty: 'beginner' },
  { id: 'ab002', name: 'Hanging Leg Raise', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ab003', name: 'Captain Chair Leg Raise', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ab004', name: 'Ab Wheel Rollout', target: 'abs', bodyPart: 'waist', equipment: 'wheel roller', difficulty: 'intermediate' },
  { id: 'ab005', name: 'Crunches', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab006', name: 'Bicycle Crunch', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab007', name: 'Plank', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab008', name: 'Side Plank', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab009', name: 'Mountain Climbers', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab010', name: 'V-Ups', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ab011', name: 'Russian Twist', target: 'abs', bodyPart: 'waist', equipment: 'medicine ball', difficulty: 'beginner' },
  { id: 'ab012', name: 'Decline Sit-up', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'intermediate' },
  { id: 'ab013', name: 'Pallof Press', target: 'abs', bodyPart: 'waist', equipment: 'cable', difficulty: 'intermediate' },
  { id: 'ab014', name: 'Dead Bug', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'beginner' },
  { id: 'ab015', name: 'Dragon Flag', target: 'abs', bodyPart: 'waist', equipment: 'body weight', difficulty: 'advanced' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get exercises filtered by equipment
 */
export function getExercisesByEquipment(equipmentList) {
  const equipmentSet = new Set(equipmentList.map(e => e.toLowerCase()));
  return MOCK_EXERCISES.filter(ex =>
    equipmentSet.has(ex.equipment.toLowerCase()) ||
    ex.equipment.toLowerCase() === 'body weight'
  );
}

/**
 * Get exercises filtered by body part
 */
export function getExercisesByBodyPart(bodyPartList) {
  const bodyPartSet = new Set(bodyPartList.map(bp => bp.toLowerCase()));
  return MOCK_EXERCISES.filter(ex =>
    bodyPartSet.has(ex.bodyPart.toLowerCase())
  );
}

/**
 * Get exercises filtered by target muscle
 */
export function getExercisesByTarget(targetList) {
  const targetSet = new Set(targetList.map(t => t.toLowerCase()));
  return MOCK_EXERCISES.filter(ex =>
    targetSet.has(ex.target.toLowerCase())
  );
}

/**
 * Get exercises filtered by difficulty
 */
export function getExercisesByDifficulty(difficultyList) {
  const diffSet = new Set(difficultyList.map(d => d.toLowerCase()));
  return MOCK_EXERCISES.filter(ex =>
    diffSet.has(ex.difficulty.toLowerCase())
  );
}

/**
 * Get exercises matching multiple criteria
 */
export function getFilteredExercises({ equipment, bodyParts, targets, difficulty }) {
  let exercises = [...MOCK_EXERCISES];

  if (equipment?.length) {
    const equipSet = new Set(equipment.map(e => e.toLowerCase()));
    exercises = exercises.filter(ex =>
      equipSet.has(ex.equipment.toLowerCase()) ||
      ex.equipment.toLowerCase() === 'body weight'
    );
  }

  if (bodyParts?.length) {
    const bpSet = new Set(bodyParts.map(bp => bp.toLowerCase()));
    exercises = exercises.filter(ex =>
      bpSet.has(ex.bodyPart.toLowerCase())
    );
  }

  if (targets?.length) {
    const targetSet = new Set(targets.map(t => t.toLowerCase()));
    exercises = exercises.filter(ex =>
      targetSet.has(ex.target.toLowerCase())
    );
  }

  if (difficulty?.length) {
    const diffSet = new Set(difficulty.map(d => d.toLowerCase()));
    exercises = exercises.filter(ex =>
      diffSet.has(ex.difficulty.toLowerCase())
    );
  }

  return exercises;
}

/**
 * Get summary statistics
 */
export function getExerciseSummary() {
  const byBodyPart = {};
  const byEquipment = {};
  const byTarget = {};
  const byDifficulty = {};

  for (const ex of MOCK_EXERCISES) {
    byBodyPart[ex.bodyPart] = (byBodyPart[ex.bodyPart] || 0) + 1;
    byEquipment[ex.equipment] = (byEquipment[ex.equipment] || 0) + 1;
    byTarget[ex.target] = (byTarget[ex.target] || 0) + 1;
    byDifficulty[ex.difficulty] = (byDifficulty[ex.difficulty] || 0) + 1;
  }

  return {
    total: MOCK_EXERCISES.length,
    byBodyPart,
    byEquipment,
    byTarget,
    byDifficulty,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  MOCK_EXERCISES,
  getExercisesByEquipment,
  getExercisesByBodyPart,
  getExercisesByTarget,
  getExercisesByDifficulty,
  getFilteredExercises,
  getExerciseSummary,
};
