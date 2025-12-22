import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const exercises = {
  '0025': {
    name: 'Alternate Heel Touchers',
    versions: {
      'v3': {
        label: 'v3 (Dec 2025 - 10 Models)',
        models: [
          { id: 'original', name: 'Original GIF', file: '/comparison/0025-original.gif', type: 'gif', cost: '-', time: '-', tier: 'source' },
          // Budget Tier ($0.04-0.05/sec)
          { id: 'ltx2-fast', name: 'LTX-2 Fast', file: '/comparison/0025-ltx2-fast.mp4', type: 'video', cost: '$0.20', time: '40s', tier: 'budget' },
          { id: 'pixverse', name: 'PixVerse v5.5', file: '/comparison/0025-pixverse.mp4', type: 'video', cost: '$0.20', time: '65s', tier: 'budget' },
          { id: 'kling21-std', name: 'Kling 2.1 Std', file: '/comparison/0025-kling21-std.mp4', type: 'video', cost: '$0.25', time: '76s', tier: 'budget' },
          // Mid Tier ($0.07-0.10/sec)
          { id: 'kling26-pro', name: 'Kling 2.6 Pro', file: '/comparison/0025-kling26-pro.mp4', type: 'video', cost: '$0.35', time: '77s', tier: 'mid', recommended: true },
          { id: 'kling25-turbo', name: 'Kling 2.5 Turbo', file: '/comparison/0025-kling25-turbo.mp4', type: 'video', cost: '$0.35', time: '71s', tier: 'mid' },
          { id: 'hunyuan', name: 'Hunyuan 1.5', file: '/comparison/0025-hunyuan.mp4', type: 'video', cost: '$0.38', time: '260s', tier: 'mid' },
          { id: 'kling21-pro', name: 'Kling 2.1 Pro', file: '/comparison/0025-kling21-pro.mp4', type: 'video', cost: '$0.45', time: '88s', tier: 'mid' },
          { id: 'wan25', name: 'Wan 2.5', file: '/comparison/0025-wan25.mp4', type: 'video', cost: '$0.50', time: '68s', tier: 'mid' },
          // Premium Tier ($0.20+/sec)
          { id: 'veo31', name: 'Veo 3.1 (Google)', file: '/comparison/0025-veo31.mp4', type: 'video', cost: '$1.00', time: '46s', tier: 'premium' },
          { id: 'kling20-master', name: 'Kling 2.0 Master', file: '/comparison/0025-kling20-master.mp4', type: 'video', cost: '$1.40', time: '203s', tier: 'premium' },
        ]
      },
      'v2': {
        label: 'v2 (Old - 3 Models)',
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

const tierColors = {
  source: 'bg-zinc-200 text-zinc-700',
  budget: 'bg-green-100 text-green-700',
  mid: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
}

const tierLabels = {
  source: 'Source',
  budget: 'Budget',
  mid: 'Mid-Tier',
  premium: 'Premium',
}

export function VideoComparison() {
  const [exerciseId, setExerciseId] = useState('0025')
  const [version, setVersion] = useState('v3')
  const [tierFilter, setTierFilter] = useState('all')

  const exercise = exercises[exerciseId]
  const versions = Object.keys(exercise.versions)
  const currentVersion = exercise.versions[version] || exercise.versions[versions[0]]

  const filteredModels = tierFilter === 'all'
    ? currentVersion.models
    : currentVersion.models.filter(m => m.tier === tierFilter || m.tier === 'source')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Video Model Benchmark (Dec 2025)</h2>
        <p className="text-zinc-500 mt-1">10 fal.ai models compared for exercise GIF styling</p>
      </div>

      {/* Version Selector */}
      {versions.length > 1 && (
        <div className="flex gap-2">
          {versions.map(v => (
            <Button
              key={v}
              variant={version === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVersion(v)}
            >
              {exercise.versions[v].label}
            </Button>
          ))}
        </div>
      )}

      {/* Tier Filter */}
      {version === 'v3' && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-zinc-500 self-center mr-2">Filter:</span>
          {['all', 'budget', 'mid', 'premium'].map(tier => (
            <Button
              key={tier}
              variant={tierFilter === tier ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTierFilter(tier)}
            >
              {tier === 'all' ? 'All Models' : tierLabels[tier]}
            </Button>
          ))}
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModels.map(m => (
          <Card key={m.id} className={`overflow-hidden ${m.recommended ? 'ring-2 ring-yellow-400' : ''}`}>
            <div className="aspect-square bg-zinc-100 relative">
              {m.type === 'gif' ? (
                <img
                  src={m.file}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={m.file}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              {m.recommended && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                  BEST VALUE
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{m.name}</h3>
                {m.tier && (
                  <span className={`text-xs px-2 py-0.5 rounded ${tierColors[m.tier]}`}>
                    {tierLabels[m.tier]}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">Cost: {m.cost}</Badge>
                <Badge variant="secondary">Time: {m.time}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-zinc-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Benchmark Summary (Dec 2025)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-700 mb-1">Budget Tier ($0.20-0.25/5s)</h5>
              <ul className="text-zinc-600 space-y-1">
                <li>• <strong>LTX-2 Fast</strong> - Fastest (40s)</li>
                <li>• <strong>PixVerse v5.5</strong> - Good quality</li>
                <li>• <strong>Kling 2.1 Std</strong> - Reliable</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-700 mb-1">Mid Tier ($0.35-0.45/5s)</h5>
              <ul className="text-zinc-600 space-y-1">
                <li>• <strong>Kling 2.6 Pro</strong> - Best value</li>
                <li>• <strong>Kling 2.5 Turbo</strong> - Fast + quality</li>
                <li>• <strong>Kling 2.1 Pro</strong> - Professional</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-purple-700 mb-1">Premium Tier ($1.00+/5s)</h5>
              <ul className="text-zinc-600 space-y-1">
                <li>• <strong>Veo 3.1</strong> - Google DeepMind</li>
                <li>• <strong>Kling 2.0 Master</strong> - Cinema grade</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
