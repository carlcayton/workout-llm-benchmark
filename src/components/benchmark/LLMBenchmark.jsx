import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Trophy, Clock, Target, Dumbbell, CheckCircle, XCircle, Layers } from 'lucide-react'

// Training splits from database
const trainingSplits = {
  'full-body': {
    name: 'Full Body',
    description: 'Train all major muscle groups in each session',
    minDays: 2,
    maxDays: 4,
    styles: ['beginner', 'general_fitness', 'strength'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'abs'] },
      { dayNumber: 2, bodyParts: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'abs'] },
      { dayNumber: 3, bodyParts: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'abs'] },
    ]
  },
  'upper-lower': {
    name: 'Upper/Lower',
    description: 'Alternate between upper and lower body days',
    minDays: 4,
    maxDays: 4,
    styles: ['strength', 'bodybuilding', 'general_fitness'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { dayNumber: 2, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
      { dayNumber: 3, bodyParts: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
      { dayNumber: 4, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
    ]
  },
  'ppl-3day': {
    name: 'Push/Pull/Legs (3x)',
    description: 'Push, pull, and leg days - once per week',
    minDays: 3,
    maxDays: 3,
    styles: ['bodybuilding', 'strength'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'shoulders', 'triceps'] },
      { dayNumber: 2, bodyParts: ['back', 'biceps'] },
      { dayNumber: 3, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
    ]
  },
  'ppl-6day': {
    name: 'Push/Pull/Legs (6x)',
    description: 'PPL cycle twice per week for high frequency',
    minDays: 6,
    maxDays: 6,
    styles: ['bodybuilding', 'strength'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'shoulders', 'triceps'] },
      { dayNumber: 2, bodyParts: ['back', 'biceps'] },
      { dayNumber: 3, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
      { dayNumber: 4, bodyParts: ['chest', 'shoulders', 'triceps'] },
      { dayNumber: 5, bodyParts: ['back', 'biceps'] },
      { dayNumber: 6, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
    ]
  },
  'arnold-split': {
    name: 'Arnold Split',
    description: 'Classic: Chest/Back, Shoulders/Arms, Legs',
    minDays: 6,
    maxDays: 6,
    styles: ['bodybuilding'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'back'] },
      { dayNumber: 2, bodyParts: ['shoulders', 'biceps', 'triceps'] },
      { dayNumber: 3, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
      { dayNumber: 4, bodyParts: ['chest', 'back'] },
      { dayNumber: 5, bodyParts: ['shoulders', 'biceps', 'triceps'] },
      { dayNumber: 6, bodyParts: ['legs', 'glutes', 'calves', 'abs'] },
    ]
  },
  'bro-split': {
    name: 'Bro Split',
    description: 'One major muscle group per day',
    minDays: 5,
    maxDays: 5,
    styles: ['bodybuilding'],
    days: [
      { dayNumber: 1, bodyParts: ['chest', 'abs'] },
      { dayNumber: 2, bodyParts: ['back'] },
      { dayNumber: 3, bodyParts: ['shoulders', 'abs'] },
      { dayNumber: 4, bodyParts: ['biceps', 'triceps', 'forearms'] },
      { dayNumber: 5, bodyParts: ['legs', 'glutes', 'calves'] },
    ]
  },
}

// Mock benchmark data - in real app this would come from JSON file
const mockBenchmarkData = {
  timestamp: '2025-12-22T15:30:00Z',
  scenarios: [
    {
      name: 'PPL - Home Gym',
      split: 'ppl-3day',
      equipment: ['dumbbell', 'barbell', 'bench'],
      duration: 45,
      level: 'Intermediate',
      results: [
        { model: 'GPT-5', success: true, latency: 980, matchRate: 98, exercises: 7, title: 'Elite Push Protocol', exerciseList: ['Barbell Bench Press', 'Dumbbell Incline Press', 'Cable Fly', 'Overhead Press', 'Lateral Raise', 'Tricep Pushdown', 'Skull Crushers'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1150, matchRate: 96, exercises: 7, title: 'Precision Push Strength', exerciseList: ['Bench Press', 'Incline Dumbbell Press', 'Cable Crossover', 'Military Press', 'Dumbbell Lateral Raise', 'Rope Pushdown', 'Dips'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 320, matchRate: 91, exercises: 6, title: 'Swift Push Blast', exerciseList: ['Bench Press', 'Shoulder Press', 'Incline Fly', 'Lateral Raise', 'Tricep Extension', 'Diamond Push-up'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 450, matchRate: 93, exercises: 6, title: 'Flash Push Circuit', exerciseList: ['Dumbbell Press', 'Overhead Press', 'Cable Fly', 'Front Raise', 'Tricep Dips', 'Close-grip Bench'] },
        { model: 'DeepSeek R1', success: true, latency: 1890, matchRate: 94, exercises: 8, title: 'Reasoned Push Power', exerciseList: ['Barbell Bench', 'Incline Press', 'Pec Deck', 'Arnold Press', 'Cable Lateral', 'Face Pull', 'Tricep Pushdown', 'Overhead Extension'] },
        { model: 'Grok 4.1', success: true, latency: 380, matchRate: 89, exercises: 6, title: 'Grok Push Pump', exerciseList: ['Bench Press', 'Shoulder Press', 'Fly', 'Lateral Raise', 'Tricep Dip', 'Pushdown'] },
      ]
    },
    {
      name: 'Full Body - Minimal Equipment',
      split: 'full-body',
      equipment: ['body weight', 'resistance band'],
      duration: 30,
      level: 'Beginner',
      results: [
        { model: 'GPT-5', success: true, latency: 1020, matchRate: 100, exercises: 9, title: 'Complete Home Transformation', exerciseList: ['Push-up', 'Squat', 'Lunge', 'Band Row', 'Band Press', 'Plank', 'Mountain Climber', 'Glute Bridge', 'Band Pull-apart'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1280, matchRate: 100, exercises: 8, title: 'Bodyweight Mastery', exerciseList: ['Push-up', 'Bodyweight Squat', 'Walking Lunge', 'Band Row', 'Pike Push-up', 'Plank', 'Burpee', 'Hip Thrust'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 290, matchRate: 95, exercises: 7, title: 'Quick Body Circuit', exerciseList: ['Push-up', 'Squat', 'Lunge', 'Band Row', 'Plank', 'Burpee', 'Mountain Climber'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 380, matchRate: 97, exercises: 7, title: 'Flash Bodyweight', exerciseList: ['Push-up', 'Air Squat', 'Reverse Lunge', 'Band Pull', 'Plank Hold', 'Jumping Jack', 'Glute Bridge'] },
        { model: 'DeepSeek R1', success: true, latency: 2100, matchRate: 98, exercises: 9, title: 'Logical Full Body Flow', exerciseList: ['Push-up Variations', 'Squat', 'Split Squat', 'Band Row', 'Band Press', 'Dead Bug', 'Bird Dog', 'Hip Thrust', 'Calf Raise'] },
        { model: 'Grok 4.1', success: true, latency: 350, matchRate: 92, exercises: 6, title: 'Grok Home Workout', exerciseList: ['Push-up', 'Squat', 'Lunge', 'Band Row', 'Plank', 'Burpee'] },
      ]
    },
    {
      name: 'PPL 6-Day - Commercial Gym',
      split: 'ppl-6day',
      equipment: ['barbell', 'dumbbell', 'leg press', 'cable', 'smith machine'],
      duration: 60,
      level: 'Advanced',
      results: [
        { model: 'GPT-5', success: true, latency: 1150, matchRate: 96, exercises: 9, title: 'Ultimate Leg Annihilation', exerciseList: ['Barbell Squat', 'Leg Press', 'Romanian Deadlift', 'Walking Lunge', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Hip Thrust', 'Cable Pull-through'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1420, matchRate: 97, exercises: 10, title: 'Complete Lower Protocol', exerciseList: ['Back Squat', 'Front Squat', 'Leg Press', 'RDL', 'Bulgarian Split Squat', 'Leg Curl', 'Leg Extension', 'Standing Calf', 'Seated Calf', 'Glute Kickback'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 340, matchRate: 88, exercises: 6, title: 'Fast Leg Day', exerciseList: ['Squat', 'Leg Press', 'RDL', 'Lunge', 'Leg Curl', 'Calf Raise'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 520, matchRate: 90, exercises: 7, title: 'Flash Leg Destroyer', exerciseList: ['Barbell Squat', 'Leg Press', 'Deadlift', 'Lunges', 'Hamstring Curl', 'Quad Extension', 'Calf Press'] },
        { model: 'DeepSeek R1', success: true, latency: 2450, matchRate: 95, exercises: 9, title: 'Calculated Leg Gains', exerciseList: ['Back Squat', 'Hack Squat', 'Leg Press', 'Romanian DL', 'Walking Lunge', 'Lying Leg Curl', 'Leg Extension', 'Standing Calf', 'Seated Calf'] },
        { model: 'Grok 4.1', success: false, latency: 4200, matchRate: 0, exercises: 0, title: null, exerciseList: [] },
      ]
    },
    {
      name: 'Upper/Lower - Gym Setup',
      split: 'upper-lower',
      equipment: ['dumbbell', 'cable', 'pull-up bar'],
      duration: 50,
      level: 'Intermediate',
      results: [
        { model: 'GPT-5', success: true, latency: 1050, matchRate: 97, exercises: 8, title: 'Complete Upper Sculpt', exerciseList: ['Pull-up', 'Cable Row', 'Dumbbell Press', 'Lateral Raise', 'Cable Fly', 'Face Pull', 'Bicep Curl', 'Tricep Pushdown'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1220, matchRate: 98, exercises: 9, title: 'Upper Body Mastery', exerciseList: ['Weighted Pull-up', 'Cable Row', 'DB Bench', 'DB Shoulder Press', 'Cable Crossover', 'Rear Delt Fly', 'Hammer Curl', 'Rope Pushdown', 'Shrugs'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 310, matchRate: 92, exercises: 6, title: 'Quick Upper Blast', exerciseList: ['Pull-up', 'Cable Row', 'DB Press', 'Lateral Raise', 'Curl', 'Pushdown'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 420, matchRate: 94, exercises: 7, title: 'Flash Upper Circuit', exerciseList: ['Chin-up', 'Seated Row', 'Incline DB Press', 'Arnold Press', 'Cable Fly', 'Preacher Curl', 'Dips'] },
        { model: 'DeepSeek R1', success: true, latency: 2000, matchRate: 96, exercises: 8, title: 'Reasoned Upper Flow', exerciseList: ['Pull-up', 'Cable Pulldown', 'Seated Row', 'DB Bench', 'Shoulder Press', 'Face Pull', 'EZ Curl', 'Overhead Extension'] },
        { model: 'Grok 4.1', success: true, latency: 370, matchRate: 90, exercises: 6, title: 'Grok Upper Session', exerciseList: ['Pull-up', 'Row', 'Press', 'Raise', 'Curl', 'Extension'] },
      ]
    },
    {
      name: 'Arnold Split - Full Gym',
      split: 'arnold-split',
      equipment: ['barbell', 'dumbbell', 'cable', 'bench'],
      duration: 70,
      level: 'Advanced',
      results: [
        { model: 'GPT-5', success: true, latency: 1180, matchRate: 99, exercises: 10, title: 'Arnold Chest/Back Legacy', exerciseList: ['Barbell Bench', 'Incline DB Press', 'Cable Fly', 'Bent Over Row', 'Lat Pulldown', 'Seated Row', 'DB Pullover', 'Face Pull', 'Shrugs', 'Back Extension'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1350, matchRate: 98, exercises: 10, title: 'Classic Arnold Protocol', exerciseList: ['Flat Bench', 'Incline Press', 'Pec Deck', 'Deadlift', 'Barbell Row', 'Cable Row', 'Pull-up', 'Straight Arm Pulldown', 'Rear Delt', 'Hyperextension'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 350, matchRate: 87, exercises: 7, title: 'Fast Arnold Day', exerciseList: ['Bench Press', 'Incline Press', 'Fly', 'Barbell Row', 'Pulldown', 'Seated Row', 'Shrugs'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 480, matchRate: 91, exercises: 8, title: 'Flash Arnold Circuit', exerciseList: ['BB Bench', 'DB Incline', 'Cable Cross', 'Pendlay Row', 'Wide Pulldown', 'Cable Row', 'DB Pullover', 'Rear Fly'] },
        { model: 'DeepSeek R1', success: true, latency: 2300, matchRate: 97, exercises: 10, title: 'Calculated Arnold Gains', exerciseList: ['Bench Press', 'Incline DB', 'Low Cable Fly', 'T-Bar Row', 'Lat Pulldown', 'One-Arm Row', 'Cable Pullover', 'Face Pull', 'Trap Raise', 'Back Raise'] },
        { model: 'Grok 4.1', success: true, latency: 400, matchRate: 88, exercises: 7, title: 'Grok Arnold Pump', exerciseList: ['Bench', 'Incline', 'Fly', 'Row', 'Pulldown', 'Cable Row', 'Shrugs'] },
      ]
    },
    {
      name: 'Bro Split - Cable Focus',
      split: 'bro-split',
      equipment: ['dumbbell', 'cable', 'ez barbell'],
      duration: 45,
      level: 'Intermediate',
      results: [
        { model: 'GPT-5', success: true, latency: 920, matchRate: 100, exercises: 8, title: 'Ultimate Arm Blaster', exerciseList: ['EZ Bar Curl', 'DB Hammer Curl', 'Cable Curl', 'Preacher Curl', 'Rope Pushdown', 'Overhead Extension', 'Kickback', 'Close-grip Press'] },
        { model: 'Claude Sonnet 4', success: true, latency: 1100, matchRate: 100, exercises: 8, title: 'Complete Arm Protocol', exerciseList: ['Barbell Curl', 'Incline DB Curl', 'Cable Rope Curl', 'Concentration Curl', 'Skull Crusher', 'Rope Pushdown', 'Overhead Cable', 'Diamond Push-up'] },
        { model: 'Claude 4.5 Haiku', success: true, latency: 280, matchRate: 96, exercises: 6, title: 'Quick Arm Pump', exerciseList: ['EZ Curl', 'Hammer Curl', 'Cable Curl', 'Pushdown', 'Overhead Ext', 'Dips'] },
        { model: 'Gemini 2.5 Flash', success: true, latency: 390, matchRate: 98, exercises: 7, title: 'Flash Arm Destroyer', exerciseList: ['Standing Curl', 'Hammer Curl', 'High Cable Curl', 'V-Bar Pushdown', 'Skull Crusher', 'Kickback', 'Dip'] },
        { model: 'DeepSeek R1', success: true, latency: 1850, matchRate: 99, exercises: 8, title: 'Reasoned Arm Growth', exerciseList: ['EZ Bar Curl', 'Alternating DB Curl', 'Cable Preacher', 'Spider Curl', 'Close-Grip Bench', 'Rope Pushdown', 'DB Overhead', 'Cable Kickback'] },
        { model: 'Grok 4.1', success: true, latency: 340, matchRate: 94, exercises: 6, title: 'Grok Arm Session', exerciseList: ['Curl', 'Hammer', 'Cable Curl', 'Pushdown', 'Extension', 'Dip'] },
      ]
    }
  ]
}

// Calculate model averages
function getModelStats(data) {
  const modelStats = {}

  data.scenarios.forEach(scenario => {
    scenario.results.forEach(result => {
      if (!modelStats[result.model]) {
        modelStats[result.model] = {
          successes: 0,
          total: 0,
          totalLatency: 0,
          totalMatchRate: 0,
          totalExercises: 0,
          successCount: 0
        }
      }
      modelStats[result.model].total++
      if (result.success) {
        modelStats[result.model].successes++
        modelStats[result.model].totalLatency += result.latency
        modelStats[result.model].totalMatchRate += result.matchRate
        modelStats[result.model].totalExercises += result.exercises
        modelStats[result.model].successCount++
      }
    })
  })

  return Object.entries(modelStats).map(([model, stats]) => ({
    model,
    successRate: Math.round((stats.successes / stats.total) * 100),
    avgLatency: stats.successCount ? Math.round(stats.totalLatency / stats.successCount) : 0,
    avgMatchRate: stats.successCount ? Math.round(stats.totalMatchRate / stats.successCount) : 0,
    avgExercises: stats.successCount ? (stats.totalExercises / stats.successCount).toFixed(1) : 0
  })).sort((a, b) => b.avgMatchRate - a.avgMatchRate)
}

// Helper to get all unique body parts for a split
function getBodyPartsForSplit(splitId) {
  const split = trainingSplits[splitId]
  if (!split) return []
  // Get all unique body parts across all days
  const allParts = split.days.flatMap(d => d.bodyParts)
  return [...new Set(allParts)]
}

export function LLMBenchmark() {
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [splitFilter, setSplitFilter] = useState('all')
  const data = mockBenchmarkData

  // Filter scenarios by split
  const filteredScenarios = splitFilter === 'all'
    ? data.scenarios
    : data.scenarios.filter(s => s.split === splitFilter)

  const modelStats = getModelStats({ ...data, scenarios: filteredScenarios })
  const scenario = filteredScenarios[selectedScenario] || filteredScenarios[0]
  const splitInfo = scenario ? trainingSplits[scenario.split] : null
  const bodyParts = scenario ? getBodyPartsForSplit(scenario.split) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">LLM Workout Generation Benchmark</h2>
        <p className="text-zinc-500 mt-1">
          Comparing workout outputs from {modelStats.length} language models across {filteredScenarios.length} scenarios
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Last run: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Model Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Model</th>
                  <th className="text-center py-2 px-2">Success</th>
                  <th className="text-center py-2 px-2">Avg Latency</th>
                  <th className="text-center py-2 px-2">Match Rate</th>
                  <th className="text-center py-2 px-2">Avg Exercises</th>
                </tr>
              </thead>
              <tbody>
                {modelStats.map((stat, idx) => (
                  <tr key={stat.model} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="py-2 px-2 font-medium">
                      {idx === 0 && <Trophy className="inline w-4 h-4 text-yellow-500 mr-1" />}
                      {stat.model}
                    </td>
                    <td className="text-center py-2 px-2">
                      <Badge variant={stat.successRate === 100 ? 'success' : stat.successRate >= 75 ? 'warning' : 'error'}>
                        {stat.successRate}%
                      </Badge>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stat.avgLatency}ms
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className="flex items-center justify-center gap-1">
                        <Target className="w-3 h-3" />
                        {stat.avgMatchRate}%
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className="flex items-center justify-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {stat.avgExercises}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Split Filter */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Training Split Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={splitFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSplitFilter('all'); setSelectedScenario(0) }}
            >
              All Splits
            </Button>
            {Object.entries(trainingSplits).map(([id, split]) => (
              <Button
                key={id}
                variant={splitFilter === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setSplitFilter(id); setSelectedScenario(0) }}
              >
                {split.name}
              </Button>
            ))}
          </div>
          {splitFilter !== 'all' && splitInfo && (
            <p className="text-sm text-zinc-500 mt-3">
              {splitInfo.description} • {splitInfo.minDays}-{splitInfo.maxDays} days/week
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scenario Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <span className="font-medium">Scenario:</span>
        <Select
          value={selectedScenario}
          onChange={e => setSelectedScenario(Number(e.target.value))}
          className="w-full sm:w-auto"
        >
          {filteredScenarios.map((s, idx) => (
            <option key={idx} value={idx}>{s.name}</option>
          ))}
        </Select>
      </div>

      {/* Scenario Details */}
      {scenario && (
        <Card className="bg-zinc-50">
          <CardContent className="p-4 space-y-3">
            {/* Split Info */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {splitInfo?.name || scenario.split}
              </Badge>
              <Badge variant="outline">{scenario.level}</Badge>
              <Badge variant="outline">{scenario.duration} min</Badge>
            </div>

            {/* Body Parts */}
            <div>
              <span className="text-zinc-500 text-sm">Target Body Parts:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {bodyParts.map(part => (
                  <Badge key={part} variant="default" className="text-xs capitalize">
                    {part}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <span className="text-zinc-500 text-sm">Equipment:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {scenario.equipment.map(eq => (
                  <Badge key={eq} variant="outline" className="text-xs capitalize">
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Results Grid */}
      {scenario && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenario.results.map((result, idx) => (
          <Card
            key={result.model}
            className={result.success ? '' : 'opacity-60 border-red-200'}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {result.model}
                </CardTitle>
                {idx === 0 && result.success && (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-3">
                  <p className="font-medium text-zinc-800">"{result.title}"</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{result.latency}ms</Badge>
                    <Badge variant="secondary">{result.matchRate}% match</Badge>
                    <Badge variant="secondary">{result.exercises} exercises</Badge>
                  </div>
                  {result.exerciseList?.length > 0 && (
                    <div className="pt-2 border-t border-zinc-200">
                      <p className="text-xs text-zinc-500 mb-1">Exercises:</p>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        {result.exerciseList.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500 text-sm">Failed to generate workout</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>🏆 <strong>GPT-5</strong> - Best overall quality, highest match rates across all scenarios</p>
          <p>🎯 <strong>Claude Sonnet 4</strong> - Excellent reasoning, comprehensive workouts</p>
          <p>⚡ <strong>Claude 4.5 Haiku</strong> - Fastest responses (~300ms), great for real-time</p>
          <p>🔥 <strong>Gemini 2.5 Flash</strong> - Fast + accurate, solid cost-to-quality</p>
          <p>🧠 <strong>DeepSeek R1</strong> - Chain-of-thought reasoning, thorough but slower</p>
          <p>⚠️ <strong>Grok 4.1</strong> - Fast but occasional failures on complex scenarios</p>
        </CardContent>
      </Card>
    </div>
  )
}
