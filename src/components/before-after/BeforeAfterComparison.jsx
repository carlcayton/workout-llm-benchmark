import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { ChevronRight } from 'lucide-react'

// Color mappings for START (beginner state) - front + back
const START_COLORS = {
  // Front
  'quads': '#4ADE80',
  'chest': '#4ADE80',
  'biceps': '#4ADE80',
  'front-shoulders': '#4ADE80',
  'calves': '#FB923C',
  'forearms': '#FB923C',
  'abdominals': '#FB923C',
  'obliques': '#FB923C',
  // Back
  'glutes': '#4ADE80',
  'lats': '#4ADE80',
  'hamstrings': '#FB923C',
  'lowerback': '#FB923C',
  'triceps': '#FB923C'
}

// Color mappings for NOW (trained state) - front + back
const NOW_COLORS = {
  // Front
  'quads': '#A855F7',
  'chest': '#A855F7',
  'biceps': '#A855F7',
  'front-shoulders': '#A855F7',
  'traps': '#A855F7',
  'calves': '#22D3EE',
  'forearms': '#22D3EE',
  'abdominals': '#22D3EE',
  'obliques': '#22D3EE',
  // Back
  'lats': '#A855F7',
  'rear-shoulders': '#A855F7',
  'traps-middle': '#A855F7',
  'glutes': '#A855F7',
  'hamstrings': '#22D3EE',
  'triceps': '#22D3EE',
  'lowerback': '#22D3EE'
}

const DEFAULT_COLOR = '#FFFFFF'

export function BeforeAfterComparison() {
  const [frontSvg, setFrontSvg] = useState('')
  const [backSvg, setBackSvg] = useState('')
  const svgLoadedRef = useRef({ front: false, back: false })

  useEffect(() => {
    fetch('/assets/front-body.svg')
      .then(r => r.text())
      .then(svg => {
        setFrontSvg(svg)
        svgLoadedRef.current.front = true
      })
    fetch('/assets/back-body.svg')
      .then(r => r.text())
      .then(svg => {
        setBackSvg(svg)
        svgLoadedRef.current.back = true
      })
  }, [])

  const applyColors = useCallback(() => {
    // Apply colors to START bodies
    const startFront = document.getElementById('start-front')
    const startBack = document.getElementById('start-back')
    if (startFront) {
      startFront.querySelectorAll('.bodymap').forEach(el => {
        el.style.color = START_COLORS[el.id] || DEFAULT_COLOR
      })
    }
    if (startBack) {
      startBack.querySelectorAll('.bodymap').forEach(el => {
        el.style.color = START_COLORS[el.id] || DEFAULT_COLOR
      })
    }

    // Apply colors to NOW bodies
    const nowFront = document.getElementById('now-front')
    const nowBack = document.getElementById('now-back')
    if (nowFront) {
      nowFront.querySelectorAll('.bodymap').forEach(el => {
        el.style.color = NOW_COLORS[el.id] || DEFAULT_COLOR
      })
    }
    if (nowBack) {
      nowBack.querySelectorAll('.bodymap').forEach(el => {
        el.style.color = NOW_COLORS[el.id] || DEFAULT_COLOR
      })
    }
  }, [])

  useLayoutEffect(() => {
    applyColors()
  }, [frontSvg, backSvg, applyColors])

  return (
    <div className="bg-slate-800 rounded-2xl p-8">
      {/* Labels row */}
      <div className="flex justify-center gap-32 mb-8">
        <span className="text-white text-sm font-medium uppercase tracking-wider">
          Start
        </span>
        <span className="text-white text-sm font-medium uppercase tracking-wider">
          Now
        </span>
      </div>

      <div className="space-y-8">
        {/* Front row - front to front */}
        <div className="flex items-center justify-center gap-4">
          <div
            id="start-front"
            className="w-32"
            dangerouslySetInnerHTML={{ __html: frontSvg }}
          />
          <div className="px-4">
            <ChevronRight className="w-8 h-8 text-white/60" />
          </div>
          <div
            id="now-front"
            className="w-32"
            dangerouslySetInnerHTML={{ __html: frontSvg }}
          />
        </div>

        {/* Back row - back to back */}
        <div className="flex items-center justify-center gap-4">
          <div
            id="start-back"
            className="w-32"
            dangerouslySetInnerHTML={{ __html: backSvg }}
          />
          <div className="px-4">
            <ChevronRight className="w-8 h-8 text-white/60" />
          </div>
          <div
            id="now-back"
            className="w-32"
            dangerouslySetInnerHTML={{ __html: backSvg }}
          />
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterComparison
