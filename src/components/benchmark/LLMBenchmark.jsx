import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Trophy, Clock, Target, Dumbbell, CheckCircle, XCircle, Layers, Loader2 } from 'lucide-react'

export function LLMBenchmark() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState(null)

  useEffect(() => {
    fetch('/benchmark-data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch benchmark data')
        return res.json()
      })
      .then(json => {
        setData(json)
        if (json.scenarios?.length > 0) {
          setSelectedScenario(json.scenarios[0].name)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading benchmark data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <XCircle className="w-8 h-8 text-red-500" />
        <span className="ml-2 text-red-600">Error: {error}</span>
      </div>
    )
  }

  if (!data) return null

  const { timestamp, modelStats, scenarios } = data

  // Sort models by success rate desc, then latency asc
  const sortedStats = [...modelStats].sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate
    return a.avgLatency - b.avgLatency
  })

  const currentScenario = scenarios.find(s => s.name === selectedScenario)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM Benchmark Results</h1>
          <p className="text-sm text-gray-500">
            Generated: {new Date(timestamp).toLocaleString()}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {scenarios.length} Scenarios
        </Badge>
      </div>

      {/* Model Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Model Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Model</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tier</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Success Rate</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Latency</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Exercises</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Equipment Match</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Success/Errors</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((stat, index) => (
                  <tr key={stat.modelId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {index === 0 ? (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <span className="text-gray-500">#{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{stat.modelName}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={stat.tier === 'premium' ? 'default' : 'secondary'}
                        className={stat.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}
                      >
                        {stat.tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${stat.successRate >= 80 ? 'text-green-600' : stat.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stat.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {(stat.avgLatency / 1000).toFixed(2)}s
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-600">
                        <Dumbbell className="w-4 h-4" />
                        {stat.avgExerciseCount.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-gray-600">
                        <Target className="w-4 h-4" />
                        {stat.avgEquipmentMatchRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-600">{stat.successCount}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">{stat.parseErrorCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scenario Results</span>
            <select
              value={selectedScenario || ''}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="text-sm font-normal border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              {scenarios.map(scenario => (
                <option key={scenario.name} value={scenario.name}>
                  {scenario.name} ({scenario.category} - {scenario.trainingStyle})
                </option>
              ))}
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentScenario && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">{currentScenario.category}</Badge>
                <Badge variant="outline">{currentScenario.trainingStyle}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentScenario.results.map((result, idx) => (
                  <Card key={result.modelId || idx} className={`${result.status === 'success' ? 'border-green-200' : 'border-red-200'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>{result.model}</span>
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {result.status === 'success' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Latency:</span>
                            <span className="font-medium">{(result.latency / 1000).toFixed(2)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Exercises:</span>
                            <span className="font-medium">{result.exerciseCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Equipment Match:</span>
                            <span className="font-medium">{result.equipmentMatch.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Avg Sets/Reps/Rest:</span>
                            <span className="font-medium">
                              {typeof result.avgSets === 'number' ? result.avgSets.toFixed(1) : (result.avgSets || '-')} / {typeof result.avgReps === 'number' ? result.avgReps.toFixed(1) : (result.avgReps || '-')} / {typeof result.avgRest === 'number' ? result.avgRest.toFixed(0) : (result.avgRest || '-')}s
                            </span>
                          </div>
                          {result.exercises && result.exercises.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">Exercises:</p>
                              <ul className="text-xs space-y-2">
                                {result.exercises.map((ex, i) => (
                                  <li key={i}>
                                    <div className="font-medium text-gray-800">{ex.name}</div>
                                    <div className="text-gray-500">
                                      {ex.sets} sets x {ex.reps} reps{ex.rest ? ` · ${ex.rest}s rest` : ''}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-red-600 text-xs">
                          <p className="font-medium">Error:</p>
                          <p className="mt-1">{result.error || 'Unknown error'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LLMBenchmark
