import { useState, useEffect } from 'react'
import { User, RotateCcw } from 'lucide-react'
import { Legend } from './Legend'
import { LevelPickerModal } from './LevelPickerModal'
import { useMuscleStrength } from './useMuscleStrength'

const MUSCLE_NAMES = {
  'calves': 'Calves',
  'quads': 'Quadriceps',
  'abdominals': 'Abdominals',
  'obliques': 'Obliques',
  'hands': 'Hands',
  'forearms': 'Forearms',
  'biceps': 'Biceps',
  'front-shoulders': 'Front Delts',
  'chest': 'Chest',
  'traps': 'Traps',
  'hamstrings': 'Hamstrings',
  'glutes': 'Glutes',
  'triceps': 'Triceps',
  'lats': 'Lats',
  'lowerback': 'Lower Back',
  'traps-middle': 'Mid Traps',
  'rear-shoulders': 'Rear Delts'
}

// Level definitions with colors (cool→warm spectrum for intuitive progression)
const LEVELS = [
  { id: 'beginner', label: 'Beginner', color: '#94A3B8' },      // Slate grey - starting point
  { id: 'novice', label: 'Novice', color: '#38BDF8' },          // Sky blue - early progress
  { id: 'intermediate', label: 'Intermediate', color: '#4ADE80' }, // Green - solid foundation
  { id: 'advanced', label: 'Advanced', color: '#FACC15' },      // Yellow - heating up
  { id: 'elite', label: 'Elite', color: '#FB923C' },            // Orange - high performance
  { id: 'worldClass', label: 'World Class', color: '#F43F5E' }  // Rose/Red - peak mastery
]

const COLORS = {
  default: '#FFFFFF',
  hover: '#FE9CB2',
  background: '#F5F5F5'
}

export function MuscleMap() {
  const [frontSvg, setFrontSvg] = useState('')
  const [backSvg, setBackSvg] = useState('')
  const { muscleLevels, loading, setMuscleLevel, clearAll } = useMuscleStrength()
  const [selectedMuscleId, setSelectedMuscleId] = useState(null) // For modal

  useEffect(() => {
    // Load SVGs
    fetch('/assets/front-body.svg')
      .then(r => r.text())
      .then(setFrontSvg)
    fetch('/assets/back-body.svg')
      .then(r => r.text())
      .then(setBackSvg)
  }, [])

  // Handle clicks on muscle groups using event delegation
  const handleBodyMapClick = (e) => {
    const group = e.target.closest('.bodymap')
    if (group) {
      setSelectedMuscleId(group.id) // Open modal
    }
  }

  // Generate dynamic CSS for muscle colors based on levels
  const dynamicStyles = Object.entries(muscleLevels)
    .map(([muscleId, levelId]) => {
      const levelData = LEVELS.find(l => l.id === levelId)
      if (levelData) {
        return `#${muscleId} { color: ${levelData.color} !important; }`
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')

  const clearSelection = () => clearAll()

  // Handle level selection from modal
  const handleLevelSelect = (muscleId, levelId) => {
    setMuscleLevel(muscleId, levelId)
  }

  // Open modal for a muscle (used by badge click)
  const openMuscleModal = (muscleId) => {
    setSelectedMuscleId(muscleId)
  }

  // Get muscles grouped by level for display
  const musclesByLevel = LEVELS.reduce((acc, level) => {
    const muscles = Object.entries(muscleLevels)
      .filter(([, lvl]) => lvl === level.id)
      .map(([id]) => id)
    if (muscles.length > 0) {
      acc[level.id] = muscles
    }
    return acc
  }, {})

  const hasSelections = Object.keys(muscleLevels).length > 0

  return (
    <div className="space-y-6">
      {/* CSS for muscle colors - default + hover + dynamic level colors */}
      <style>{`
        .bodymap {
          color: ${COLORS.default};
          cursor: pointer;
        }
        .bodymap:hover {
          color: ${COLORS.hover} !important;
        }
        ${dynamicStyles}
      `}</style>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Muscle Map Selector</h2>
        <p className="text-zinc-500 mt-1">Click muscles to set strength level. Extracted from MuscleWiki.</p>
      </div>

      {loading && (
        <div className="text-center text-zinc-400 text-sm">Loading saved data...</div>
      )}

      {/* Gender toggle - MVP: Male only */}
      <div className="flex justify-center">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium">
          <User className="w-4 h-4" />
          Male
        </button>
      </div>

      {/* Body maps */}
      <div className="flex justify-center gap-6">
        <div className="flex-1 max-w-md">
          <p className="text-center text-xs uppercase tracking-wider text-zinc-400 mb-3">Front</p>
          <div
            className="bg-gray-100 rounded-xl p-6"
            dangerouslySetInnerHTML={{ __html: frontSvg }}
            style={{ '--muscle-default': COLORS.default }}
            onClick={handleBodyMapClick}
          />
        </div>
        <div className="flex-1 max-w-md">
          <p className="text-center text-xs uppercase tracking-wider text-zinc-400 mb-3">Back</p>
          <div
            className="bg-gray-100 rounded-xl p-6"
            dangerouslySetInnerHTML={{ __html: backSvg }}
            onClick={handleBodyMapClick}
          />
        </div>
      </div>

      {/* Level Legend - below body maps, above panel */}
      <Legend />

      {/* Muscle Levels panel */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-zinc-900">Muscle Levels</span>
          <button
            onClick={clearSelection}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-500 transition-colors"
            disabled={!hasSelections}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        </div>

        {!hasSelections ? (
          <span className="text-zinc-400 text-sm">Click on muscle groups to assign strength levels</span>
        ) : (
          <div className="space-y-3">
            {LEVELS.map(level => {
              const muscles = musclesByLevel[level.id]
              if (!muscles) return null

              return (
                <div key={level.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {level.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {muscles.map(id => (
                      <button
                        key={id}
                        onClick={() => openMuscleModal(id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-full text-sm hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: level.color }}
                      >
                        {MUSCLE_NAMES[id] || id}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Level Picker Modal */}
      <LevelPickerModal
        muscleId={selectedMuscleId}
        muscleName={MUSCLE_NAMES[selectedMuscleId] || selectedMuscleId}
        currentLevel={muscleLevels[selectedMuscleId] || null}
        onSelect={handleLevelSelect}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  )
}

export default MuscleMap
