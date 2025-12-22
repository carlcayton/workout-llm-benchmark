import { useState } from 'react'

const exercises = {
  '0001': {
    name: '3/4 Sit-up',
    versions: {
      'v1': {
        label: 'v1 (Original Prompt)',
        models: [
          { id: 'original', name: 'Original', file: '/comparison/original.gif', type: 'gif', cost: '-', time: '-' },
          { id: 'ltx2', name: 'LTX-2 Fast', file: '/comparison/ltx2-fast.mp4', type: 'video', cost: '$0.24', time: '31s' },
          { id: 'wan25', name: 'Wan 2.5', file: '/comparison/wan25.mp4', type: 'video', cost: '$0.25', time: '46s' },
          { id: 'minimax', name: 'MiniMax Hailuo', file: '/comparison/minimax.mp4', type: 'video', cost: '$0.27', time: '89s' },
        ]
      }
    }
  },
  '0025': {
    name: 'Alternate Heel Touchers',
    versions: {
      'v1': {
        label: 'v1 (Original Prompt)',
        models: [
          { id: 'original', name: 'Original', file: '/comparison/0025-original.gif', type: 'gif', cost: '-', time: '-' },
          { id: 'ltx2', name: 'LTX-2 Fast', file: '/comparison/0025-ltx2.mp4', type: 'video', cost: '$0.24', time: '34s' },
          { id: 'wan25', name: 'Wan 2.5', file: '/comparison/0025-wan25.mp4', type: 'video', cost: '$0.25', time: '45s' },
          { id: 'minimax', name: 'MiniMax Hailuo', file: '/comparison/0025-minimax.mp4', type: 'video', cost: '$0.27', time: '102s' },
        ]
      },
      'v2': {
        label: 'v2 (Improved Prompt)',
        models: [
          { id: 'original', name: 'Original', file: '/comparison/0025-original.gif', type: 'gif', cost: '-', time: '-' },
          { id: 'ltx2', name: 'LTX-2 Fast', file: '/comparison/0025-ltx2-v2.mp4', type: 'video', cost: '$0.24', time: '31s' },
          { id: 'wan25', name: 'Wan 2.5', file: '/comparison/0025-wan25-v2.mp4', type: 'video', cost: '$0.50', time: '68s' },
          { id: 'minimax', name: 'MiniMax Hailuo', file: '/comparison/0025-minimax-v2.mp4', type: 'video', cost: '$0.27', time: '100s' },
        ]
      }
    }
  }
}

export default function Comparison() {
  const [exerciseId, setExerciseId] = useState('0025')
  const [version, setVersion] = useState('v2')
  const exercise = exercises[exerciseId]
  const versions = Object.keys(exercise.versions)
  const currentVersion = exercise.versions[version] || exercise.versions[versions[0]]

  return (
    <div className="comparison">
      <h2>Model Comparison</h2>
      <p>Same input GIF processed through 3 different fal.ai models</p>

      <div className="exercise-selector">
        {Object.entries(exercises).map(([id, ex]) => (
          <button
            key={id}
            className={exerciseId === id ? 'active' : ''}
            onClick={() => { setExerciseId(id); setVersion(Object.keys(ex.versions)[0]); }}
          >
            {id}: {ex.name}
          </button>
        ))}
      </div>

      {versions.length > 1 && (
        <div className="version-selector">
          {versions.map(v => (
            <button
              key={v}
              className={version === v ? 'active' : ''}
              onClick={() => setVersion(v)}
            >
              {exercise.versions[v].label}
            </button>
          ))}
        </div>
      )}

      <div className="comparison-grid">
        {currentVersion.models.map(m => (
          <div key={m.id} className="comparison-card">
            <h3>{m.name}</h3>
            {m.type === 'gif' ? (
              <img src={m.file} alt={m.name} />
            ) : (
              <video src={m.file} autoPlay loop muted playsInline />
            )}
            <div className="stats">
              <span>Cost: {m.cost}</span>
              <span>Time: {m.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
