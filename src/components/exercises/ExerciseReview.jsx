import { useState, useEffect, useCallback, useRef } from 'react'
import { useExercises } from './useExercises'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  ImageOff,
} from 'lucide-react'

const TIER_OPTIONS = [
  { value: 'core', label: 'Core' },
  { value: 'always', label: 'Always' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'excluded', label: 'Excluded' },
]

const BULK_TIER_OPTIONS = [
  { value: 'core', label: 'Core' },
  { value: 'always', label: 'Always' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'excluded', label: 'Excluded' },
]

// GIF URLs from Supabase Storage (same as Gallery component)
const SUPABASE_URL = 'https://ivfllbccljoyaayftecd.supabase.co'
const getGifUrl = (exerciseId) =>
  `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${exerciseId}.gif`

function getScoreClass(score) {
  if (score > 80) return 'bg-red-100 text-red-700 border-red-200'
  if (score > 50) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (score > 20) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

function getTierSelectClass(tier) {
  switch (tier) {
    case 'core':
      return 'bg-indigo-50 text-indigo-700 border-indigo-300'
    case 'always':
      return 'bg-green-50 text-green-700 border-green-300'
    case 'catalog':
      return 'bg-amber-50 text-amber-700 border-amber-300'
    case 'excluded':
      return 'bg-red-50 text-red-700 border-red-300'
    default:
      return 'bg-zinc-50 text-zinc-600 border-zinc-300'
  }
}

function GifThumbnail({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-12 h-12 rounded bg-zinc-200 flex items-center justify-center">
        <ImageOff className="w-5 h-5 text-zinc-400" />
      </div>
    )
  }

  return (
    <div
      className="w-12 h-12 rounded bg-zinc-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

function HoverPreview({ src, position }) {
  const [loaded, setLoaded] = useState(false)

  if (!src || !position) return null

  // Position the preview to the right of the thumbnail
  // Adjust if it would go off-screen
  const previewWidth = 400
  const previewHeight = 400
  const padding = 16

  let left = position.right + padding
  let top = position.top

  // Check if preview would go off the right edge of the screen
  if (left + previewWidth > window.innerWidth - padding) {
    // Position to the left of the thumbnail instead
    left = position.left - previewWidth - padding
  }

  // Ensure the preview doesn't go off the top or bottom
  if (top + previewHeight > window.innerHeight - padding) {
    top = window.innerHeight - previewHeight - padding
  }
  if (top < padding) {
    top = padding
  }

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
      }}
    >
      <div
        className={`w-full h-full rounded-lg bg-white shadow-2xl border border-zinc-200 overflow-hidden transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <img
          src={src}
          alt="Exercise preview"
          className="w-full h-full object-contain bg-zinc-100"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

export function ExerciseReview() {
  const {
    exercises,
    loading,
    error,
    stats,
    filterOptions,
    totalCount,
    fetchExercises,
    updateTier,
    bulkUpdateTiers,
    fetchStats,
    fetchFilterOptions,
  } = useExercises()

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [bulkTier, setBulkTier] = useState('always')
  const [applyingBulk, setApplyingBulk] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [previewGif, setPreviewGif] = useState(null)
  const [hoverGif, setHoverGif] = useState({ src: null, position: null })
  const searchTimeoutRef = useRef(null)

  const handleGifHover = useCallback((src, rect) => {
    setHoverGif({
      src,
      position: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      },
    })
  }, [])

  const handleGifHoverEnd = useCallback(() => {
    setHoverGif({ src: null, position: null })
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchStats()
    fetchFilterOptions()
  }, [fetchStats, fetchFilterOptions])

  // Fetch exercises when filters or page changes
  useEffect(() => {
    fetchExercises(filters, page - 1)
  }, [filters, page, fetchExercises])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (searchValue !== (filters.search || '')) {
        handleFiltersChange({ ...filters, search: searchValue || undefined })
      }
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters)
    setPage(1)
    setSelectedIds(new Set())
  }, [])

  const handleSelect = useCallback((id, selected) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(
    (selected) => {
      if (selected) {
        setSelectedIds(new Set(exercises.map((e) => e.id)))
      } else {
        setSelectedIds(new Set())
      }
    },
    [exercises]
  )

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleBulkUpdate = useCallback(async () => {
    setApplyingBulk(true)
    try {
      await bulkUpdateTiers(Array.from(selectedIds), bulkTier)
      setSelectedIds(new Set())
      fetchStats()
    } finally {
      setApplyingBulk(false)
    }
  }, [selectedIds, bulkTier, bulkUpdateTiers, fetchStats])

  const handleUpdateTier = useCallback(
    async (id, tier) => {
      setSavingId(id)
      try {
        await updateTier(id, tier)
        fetchStats()
      } finally {
        setSavingId(null)
      }
    },
    [updateTier, fetchStats]
  )

  const handleStatClick = useCallback(
    (tier) => {
      if (tier === null) {
        handleFiltersChange({ ...filters, tierFilter: undefined })
      } else {
        handleFiltersChange({ ...filters, tierFilter: tier })
      }
    },
    [filters, handleFiltersChange]
  )

  const handleReset = useCallback(() => {
    setSearchValue('')
    handleFiltersChange({})
  }, [handleFiltersChange])

  const totalPages = Math.ceil(totalCount / 50)

  const derivedStats = stats
    ? {
        total: stats.total,
        flagged: 0,
        core: stats.core ?? 0,
        always: stats.always,
        catalog: stats.catalog,
        excluded: stats.excluded,
      }
    : {
        total: 0,
        flagged: 0,
        core: 0,
        always: 0,
        catalog: 0,
        excluded: 0,
      }

  const hasActiveFilters =
    filters.minScore !== undefined ||
    filters.maxScore !== undefined ||
    filters.equipment ||
    filters.bodyPart ||
    filters.search ||
    filters.tierFilter

  const allSelected =
    exercises.length > 0 && exercises.every((e) => selectedIds.has(e.id))
  const someSelected =
    exercises.some((e) => selectedIds.has(e.id)) && !allSelected

  const activeTier = filters.tierFilter

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-zinc-900">
          Error loading exercises
        </h2>
        <p className="text-zinc-600">{error}</p>
        <Button onClick={() => fetchExercises(filters, page - 1)}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Exercise Review Tool</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review and categorize exercises for workout generation quality
        </p>
      </div>

      {/* Score & Tier Legend */}
      <Card className="bg-zinc-50 border-zinc-200">
        <CardContent className="py-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weirdness Score Explanation */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 mb-2">Weirdness Score (0-100)</h3>
              <p className="text-xs text-zinc-600 mb-3">
                Algorithmic score identifying exercises that may confuse users or produce poor workouts.
                Higher scores = more likely to be problematic.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  0-20: Safe
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  21-50: Review
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  51-80: Risky
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  81-100: Exclude
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">
                Factors: obscure equipment, unusual body positions, niche sports movements, complex coordination requirements
              </p>
            </div>

            {/* Tier Explanation */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-800 mb-2">Review Tiers</h3>
              <p className="text-xs text-zinc-600 mb-3">
                Your decision on whether to include this exercise in generated workouts.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-20 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-300 text-center">Core</span>
                  <span className="text-xs text-zinc-600">Fundamental exercises, prioritize in all workouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-300 text-center">Always</span>
                  <span className="text-xs text-zinc-600">High-quality, universally applicable exercises</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-300 text-center">Catalog</span>
                  <span className="text-xs text-zinc-600">Good exercises, include when equipment matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-300 text-center">Excluded</span>
                  <span className="text-xs text-zinc-600">Never use in generated workouts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: derivedStats.total, tier: null },
          { label: 'Flagged', value: derivedStats.flagged, tier: 'flagged' },
          { label: 'Core', value: derivedStats.core, tier: 'core' },
          { label: 'Always', value: derivedStats.always, tier: 'always' },
          { label: 'Catalog', value: derivedStats.catalog, tier: 'catalog' },
          { label: 'Excluded', value: derivedStats.excluded, tier: 'excluded' },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => handleStatClick(card.tier)}
            className={`p-4 rounded-lg border transition-all text-left ${
              activeTier === card.tier || (card.tier === null && !activeTier)
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div className="text-2xl font-bold">{card.value}</div>
            <div
              className={`text-sm ${
                activeTier === card.tier || (card.tier === null && !activeTier)
                  ? 'text-zinc-300'
                  : 'text-zinc-500'
              }`}
            >
              {card.label}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Exercise name..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Min Score
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="0"
                value={filters.minScore ?? ''}
                onChange={(e) =>
                  handleFiltersChange({
                    ...filters,
                    minScore: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Max Score
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="100"
                value={filters.maxScore ?? ''}
                onChange={(e) =>
                  handleFiltersChange({
                    ...filters,
                    maxScore: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Equipment
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                value={filters.equipment || ''}
                onChange={(e) =>
                  handleFiltersChange({
                    ...filters,
                    equipment: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Equipment</option>
                {(filterOptions?.equipment || []).map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-48">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Body Part
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                value={filters.bodyPart || ''}
                onChange={(e) =>
                  handleFiltersChange({
                    ...filters,
                    bodyPart: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Body Parts</option>
                {(filterOptions?.bodyParts || []).map((bp) => (
                  <option key={bp} value={bp}>
                    {bp}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Tier
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                value={filters.tierFilter || ''}
                onChange={(e) =>
                  handleFiltersChange({
                    ...filters,
                    tierFilter: e.target.value || undefined,
                  })
                }
              >
                <option value="">All Tiers</option>
                <option value="core">Core</option>
                <option value="always">Always</option>
                <option value="catalog">Catalog</option>
                <option value="excluded">Excluded</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.size} selected
              </span>

              <select
                className="h-9 w-32 rounded-md border border-blue-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={bulkTier}
                onChange={(e) => setBulkTier(e.target.value)}
                disabled={applyingBulk}
              >
                {BULK_TIER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button onClick={handleBulkUpdate} disabled={applyingBulk}>
                {applyingBulk ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Apply to {selectedIds.size} selected
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleClearSelection}
                disabled={applyingBulk}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Table */}
      {loading && exercises.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-zinc-600">Loading exercises...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-zinc-300"
                        aria-label="Select all exercises on this page"
                      />
                    </th>
                    <th className="w-20 py-3 px-4 text-left font-medium text-zinc-600">
                      Score
                    </th>
                    <th className="w-16 py-3 px-4 text-left font-medium text-zinc-600">
                      GIF
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-zinc-600">
                      Name
                    </th>
                    <th className="w-40 py-3 px-4 text-left font-medium text-zinc-600">
                      Equipment
                    </th>
                    <th className="w-32 py-3 px-4 text-left font-medium text-zinc-600">
                      Body Part
                    </th>
                    <th className="w-36 py-3 px-4 text-left font-medium text-zinc-600">
                      Tier
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        No exercises found
                      </td>
                    </tr>
                  ) : (
                    exercises.map((exercise) => (
                      <tr
                        key={exercise.id}
                        className={`border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${
                          selectedIds.has(exercise.id) ? 'bg-blue-50' : ''
                        }`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          handleGifHover(getGifUrl(exercise.id), rect)
                        }}
                        onMouseLeave={handleGifHoverEnd}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(exercise.id)}
                            onChange={(e) =>
                              handleSelect(exercise.id, e.target.checked)
                            }
                            className="rounded border-zinc-300"
                            aria-label={`Select ${exercise.name}`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center justify-center w-10 h-6 text-xs font-medium rounded border ${getScoreClass(
                              exercise.weirdness_score ?? 0
                            )}`}
                          >
                            {exercise.weirdness_score ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <GifThumbnail
                            src={getGifUrl(exercise.id)}
                            alt={exercise.name}
                            onClick={() => setPreviewGif(getGifUrl(exercise.id))}
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {exercise.name}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {exercise.equipment}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {exercise.body_part}
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative">
                            <select
                              className={`h-8 w-28 rounded-md border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400 ${getTierSelectClass(
                                exercise.tier
                              )}`}
                              value={exercise.tier || ''}
                              onChange={(e) =>
                                handleUpdateTier(exercise.id, e.target.value)
                              }
                              disabled={savingId === exercise.id}
                            >
                              {TIER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {savingId === exercise.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {totalPages <= 1 ? (
            `Showing ${totalCount} exercise${totalCount !== 1 ? 's' : ''}`
          ) : (
            `Page ${page} of ${totalPages} (${(page - 1) * 50 + 1}-${Math.min(
              page * 50,
              totalCount
            )} of ${totalCount})`
          )}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Hover Preview */}
      <HoverPreview src={hoverGif.src} position={hoverGif.position} />

      {/* GIF Preview Modal */}
      {previewGif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewGif(null)}
        >
          <div className="relative max-w-lg max-h-[80vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-zinc-300"
              onClick={() => setPreviewGif(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewGif}
              alt="Exercise preview"
              className="max-w-full max-h-[80vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ExerciseReview
