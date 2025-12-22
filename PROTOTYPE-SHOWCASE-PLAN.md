# Prototype Showcase - Migration & Redesign Plan

> Compiled from 5 sub-agent research findings on December 22, 2025

---

## Executive Summary

**Goal:** Transform the existing GIF Gallery into a comprehensive "Prototype Showcase" app displaying:
1. Exercise GIF Gallery (existing)
2. Video-to-Video AI Comparison (existing)
3. LLM Benchmark Results (new)

**Tech Stack Migration:**
- From: Plain CSS + React + Vite
- To: shadcn/ui + Tailwind CSS + React + Vite

---

## 1. Current Project Analysis

### Location & Structure

```
/home/arian/expo-work/gif-gallery/
├── src/
│   ├── App.jsx              # Main gallery component
│   ├── Comparison.jsx       # Video model comparison
│   ├── main.jsx             # React entry point
│   ├── App.css              # Gallery styles (~9KB)
│   └── index.css            # Global styles (~2KB)
├── public/
│   └── comparison/          # Video comparison assets
│       ├── original.gif
│       ├── ltx2-fast.mp4
│       ├── wan25.mp4
│       ├── minimax.mp4
│       └── [exercise variants]
├── index.html
├── vite.config.js
├── package.json
└── .vercel/                 # Already deployed to Vercel
```

### Current Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| Styling | Plain CSS | - |
| Data | Supabase REST API | - |
| Deployment | Vercel | Active |

### Current Features

**1. Exercise Gallery View**
- 1,300+ exercises with animated GIFs
- Fetches from Supabase REST API
- Text search + body part filter
- Modal fullscreen view with keyboard navigation
- Responsive grid layout

**2. Model Comparison View**
- Side-by-side video generation comparison
- 3 models tested: LTX-2, Wan 2.5, MiniMax Hailuo
- Exercise selector (0001, 0025)
- Version selector (v1, v2 prompts)
- Cost + generation time displayed

### Data Sources

| Source | Type | URL Pattern |
|--------|------|-------------|
| Exercise metadata | Supabase Postgres | `/rest/v1/exercises?select=...` |
| Exercise GIFs | Supabase Storage | `/storage/v1/object/public/exercise-gifs/{id}.gif` |
| Comparison videos | Local `/public/` | `/comparison/{model}.mp4` |

### Deployment Status

- **Platform:** Vercel
- **Project ID:** `prj_ewP825fMVoqif9XYakHzL5MBFUir`
- **Build:** `npm run build` → `dist/`

---

## 2. New Project Structure

### Proposed Name

**"Prototype Showcase"** or **"AI Prototypes"**

Package name: `prototype-showcase`

### Folder Structure

```
prototype-showcase/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── theme-provider.tsx     # Dark mode provider
│   │   ├── mode-toggle.tsx        # Theme switcher
│   │   ├── gallery/               # GIF gallery components
│   │   │   ├── ExerciseGrid.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── ExerciseModal.tsx
│   │   │   └── SearchFilter.tsx
│   │   ├── comparison/            # Video comparison components
│   │   │   ├── ModelComparison.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   └── ExerciseSelector.tsx
│   │   └── benchmark/             # LLM benchmark components
│   │       ├── BenchmarkDashboard.tsx
│   │       ├── ModelComparisonTable.tsx
│   │       ├── ScenarioView.tsx
│   │       ├── MetricsCard.tsx
│   │       └── WorkoutPreview.tsx
│   ├── lib/
│   │   ├── utils.ts               # cn() utility
│   │   └── supabase.ts            # Supabase client
│   ├── data/
│   │   └── benchmark-results.json # LLM benchmark data
│   ├── types/
│   │   ├── exercise.ts
│   │   ├── comparison.ts
│   │   └── benchmark.ts
│   ├── App.tsx                    # Main app with tabs
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind base styles
├── public/
│   └── comparison/                # Video assets (keep existing)
├── components.json                # shadcn config
├── tailwind.config.js             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config
└── package.json
```

---

## 3. shadcn/ui + Tailwind Setup

### Installation Commands

```bash
# Navigate to project
cd /home/arian/expo-work/gif-gallery

# Install TypeScript (convert from JSX)
npm install -D typescript @types/node

# Install Tailwind CSS v4 with Vite plugin
npm install tailwindcss @tailwindcss/vite

# Initialize shadcn/ui
npx shadcn@latest init

# Add required components
npx shadcn@latest add button card tabs table input label dialog dropdown-menu
```

### Configuration Files

#### `vite.config.ts`

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### `components.json` (shadcn config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Required shadcn Components

| Component | Purpose |
|-----------|---------|
| `button` | CTAs, navigation |
| `card` | Exercise cards, metric cards |
| `tabs` | Main navigation (Gallery/Comparison/Benchmark) |
| `table` | Benchmark results table |
| `input` | Search field |
| `label` | Form labels |
| `dialog` | Exercise modal, workout preview |
| `dropdown-menu` | Theme toggle, filters |
| `badge` | Status indicators, tier badges |
| `scroll-area` | Scrollable containers |

---

## 4. LLM Benchmark Data Structure

### TypeScript Interfaces

```typescript
// types/benchmark.ts

export interface BenchmarkModel {
  id: string;                    // e.g., "openai/gpt-4o"
  name: string;                  // e.g., "GPT-4o"
  tier: 'current' | 'premium' | 'budget' | 'experimental';
}

export interface WorkoutRequest {
  equipment: string[];
  trainingStyle: string;
  bodyParts: string[];
  targetMuscles?: string[];
  duration: number;
  experienceLevel: string;
  goal: string;
}

export interface ExerciseDetail {
  id: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutMetrics {
  exerciseCount: number;
  sectionCount: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasTips: boolean;
  equipmentMatchRate: number;    // 0-100
  avgSets: number;
  exercises: ExerciseDetail[];
}

export interface Workout {
  title: string;
  description: string;
  estimatedDuration: number;
  sections: Array<{
    name: string;
    exercises: Array<{
      id: string;
      sets: number;
      reps: string;
      restSeconds: number;
      notes?: string;
    }>;
  }>;
  tips?: string[];
}

export interface ModelResult {
  model: BenchmarkModel;
  success: boolean;
  error?: string;
  latency: number;               // milliseconds
  rawResponse: string | null;
  parsedWorkout: Workout | null;
  parseError?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metrics: WorkoutMetrics | null;
}

export interface ScenarioResult {
  name: string;
  request: WorkoutRequest;
  exercisesAvailable: number;
  modelResults: ModelResult[];
}

export interface BenchmarkResults {
  timestamp: string;
  models: BenchmarkModel[];
  scenarios: ScenarioResult[];
}
```

### Data Flow

```
benchmark-results.json (static file in /src/data/)
         │
         ▼
BenchmarkDashboard.tsx (loads JSON, manages state)
         │
         ├── ModelComparisonTable (summary view)
         │
         ├── ScenarioView (per-scenario breakdown)
         │
         └── WorkoutPreview (expandable workout details)
```

---

## 5. Component Designs

### Main App Layout

```
┌─────────────────────────────────────────────────────┐
│  🧪 Prototype Showcase              [🌙/☀️] Theme  │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │ Gallery │ │ Video Models│ │ LLM Benchmarks  │   │
│  └─────────┘ └─────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────┤
│                                                     │
│              [Tab Content Area]                     │
│                                                     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Gallery Tab

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Search exercises...    [Body Part ▼] [Equipment]│
│ Showing 1,324 exercises                             │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │  [GIF]   │ │  [GIF]   │ │  [GIF]   │ │  [GIF]   ││
│ │          │ │          │ │          │ │          ││
│ │ Bench    │ │ Squat    │ │ Deadlift │ │ Row      ││
│ │ Press    │ │          │ │          │ │          ││
│ │ chest    │ │ legs     │ │ back     │ │ back     ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │  [GIF]   │ │  [GIF]   │ │  [GIF]   │ │  [GIF]   ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────┘
```

### Video Comparison Tab

```
┌─────────────────────────────────────────────────────┐
│ Exercise: [0001 3/4 Sit-up ▼]  Version: [v1] [v2]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────┐│
│ │ Original  │ │ LTX-2     │ │ Wan 2.5   │ │MiniMax││
│ │           │ │           │ │           │ │       ││
│ │  [GIF]    │ │ [VIDEO]   │ │ [VIDEO]   │ │[VIDEO]││
│ │           │ │           │ │           │ │       ││
│ │           │ │ $0.24     │ │ $0.25     │ │ $0.27 ││
│ │ Reference │ │ 31s       │ │ 45s       │ │ 89s   ││
│ └───────────┘ └───────────┘ └───────────┘ └───────┘│
└─────────────────────────────────────────────────────┘
```

### Benchmark Tab

```
┌─────────────────────────────────────────────────────┐
│ LLM Workout Benchmark Results                       │
│ Last run: Dec 22, 2025 • 4 scenarios • 7 models    │
├─────────────────────────────────────────────────────┤
│ Model Performance Summary                           │
│ ┌───────────────────────────────────────────────┐  │
│ │ Model        │Success│Latency│Match│Exercises│  │
│ ├──────────────┼───────┼───────┼─────┼─────────┤  │
│ │👑 GPT-4o     │ 100%  │1234ms │ 95% │   6.5   │  │
│ │   Claude 3.5 │ 100%  │1890ms │ 92% │   6.2   │  │
│ │🔬 Gemini     │  75%  │2451ms │ 88% │   5.8   │  │
│ │   Qwen 3 VL  │ 100%  │ 920ms │ 85% │   5.5   │  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ Scenario: [Home Gym - Upper Body ▼]                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ GPT-4o  🏆  │ │ Claude 3.5  │ │ Qwen 3 VL   │   │
│ │ ✅ 1150ms   │ │ ✅ 1890ms   │ │ ✅ 920ms    │   │
│ │ 95% match   │ │ 92% match   │ │ 85% match   │   │
│ │             │ │             │ │             │   │
│ │ "Power      │ │ "Upper Body │ │ "Chest &    │   │
│ │  Upper..."  │ │  Strength"  │ │  Back..."   │   │
│ │             │ │             │ │             │   │
│ │ 1. Bench    │ │ 1. Barbell  │ │ 1. DB Bench │   │
│ │ 2. Row      │ │ 2. Pull-up  │ │ 2. Pull-up  │   │
│ │ 3. Press    │ │ 3. DB Press │ │ 3. Lat Pull │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 6. Deployment

### Current Setup (Keep)

Already deployed to Vercel with:
- Project ID: `prj_ewP825fMVoqif9XYakHzL5MBFUir`
- Auto-deploy from git push
- Build: `npm run build`
- Output: `dist/`

### Deployment Steps

```bash
# 1. Build locally to verify
npm run build

# 2. Preview build
npm run preview

# 3. Deploy via Vercel CLI (if needed)
npx vercel --prod

# Or just push to git - Vercel auto-deploys
git add .
git commit -m "feat: migrate to shadcn/ui + add benchmark dashboard"
git push
```

### Environment Variables

None required - all data is:
- Supabase public API (anon key in code)
- Static JSON files
- Local video assets

---

## 7. Migration Checklist

### Phase 1: Setup (30 min)
- [ ] Rename package.json name to `prototype-showcase`
- [ ] Install TypeScript + Tailwind + shadcn dependencies
- [ ] Create `tsconfig.json`, `components.json`
- [ ] Update `vite.config.ts` with aliases
- [ ] Initialize shadcn with `npx shadcn@latest init`
- [ ] Add required components

### Phase 2: Convert to TypeScript (1 hour)
- [ ] Rename `.jsx` files to `.tsx`
- [ ] Add type annotations
- [ ] Create type definitions in `/types/`
- [ ] Update imports

### Phase 3: Migrate Components (2 hours)
- [ ] Create new `App.tsx` with shadcn Tabs
- [ ] Migrate Gallery view to use shadcn Card
- [ ] Migrate Comparison view to use shadcn components
- [ ] Add dark mode ThemeProvider

### Phase 4: Add Benchmark Dashboard (2 hours)
- [ ] Create benchmark type definitions
- [ ] Copy benchmark results JSON to `/data/`
- [ ] Build ModelComparisonTable component
- [ ] Build ScenarioView component
- [ ] Build WorkoutPreview component

### Phase 5: Polish & Deploy (30 min)
- [ ] Test all tabs and interactions
- [ ] Verify responsive design
- [ ] Run production build
- [ ] Deploy to Vercel
- [ ] Verify live deployment

**Total Estimated Time: 6 hours**

---

## 8. Models Benchmarked (Dec 2025)

| Model | OpenRouter ID | Tier | Notes |
|-------|---------------|------|-------|
| GPT-5 | `openai/gpt-5` | Premium | Best overall quality, highest match rates |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Premium | Excellent reasoning, comprehensive workouts |
| Claude 4.5 Haiku | `anthropic/claude-haiku-4.5` | Fast | ~300ms responses, great for real-time |
| Gemini 2.5 Flash | `google/gemini-2.5-flash` | Fast | Fast + accurate, solid cost-to-quality |
| DeepSeek R1 | `deepseek/deepseek-r1` | Reasoning | Chain-of-thought, thorough but slower |
| Grok 4.1 | `x-ai/grok-4.1-fast` | Fast | Quick but occasional failures on complex |

### Other Available Models (OpenRouter Dec 2025)

**Anthropic:**
- `anthropic/claude-opus-4.5` - Most capable
- `anthropic/claude-sonnet-4.5` - Balanced
- `anthropic/claude-3.7-sonnet:thinking` - With reasoning

**OpenAI:**
- `openai/gpt-5-codex` - Code-optimized
- `openai/gpt-5-mini` - Cost-efficient
- `openai/gpt-4.1` - Previous gen

**DeepSeek:**
- `deepseek/deepseek-v3.2` - Latest V3
- `deepseek/deepseek-r1-0528` - Dated R1
- `deepseek/deepseek-v3.2-speciale` - Special variant

**xAI Grok:**
- `x-ai/grok-4` - Full Grok 4
- `x-ai/grok-3` - Previous gen
- `x-ai/grok-code-fast-1` - Code-optimized

---

## 9. Test Scenarios

| Scenario | Equipment | Body Parts | Duration | Level |
|----------|-----------|------------|----------|-------|
| Home Gym - Upper Body | dumbbell, barbell, bench, pull-up bar | chest, back, shoulders | 45 min | Intermediate |
| Minimal Equipment | body weight, resistance band | full_body | 30 min | Beginner |
| Commercial Gym - Leg Day | barbell, dumbbell, leg press, cable | legs, glutes | 60 min | Advanced |
| Kettlebell Only | kettlebell | chest, back, shoulders | 40 min | Intermediate |

---

## 10. Success Metrics

After migration, the app should:

1. ✅ Display 3 tabs: Gallery, Video Comparison, LLM Benchmarks
2. ✅ Use shadcn/ui components consistently
3. ✅ Support dark/light mode toggle
4. ✅ Show benchmark results in sortable table
5. ✅ Allow scenario-by-scenario comparison
6. ✅ Display workout previews for each model
7. ✅ Be responsive on mobile and desktop
8. ✅ Load fast (< 2s initial load)
9. ✅ Deploy successfully to Vercel

---

## Appendix: Agent Research Sources

### Agent 1: Project Exploration
- Found project at `/home/arian/expo-work/gif-gallery/`
- Analyzed existing components, styles, and data sources
- Documented Vercel deployment configuration

### Agent 2: shadcn/ui Setup
- Researched Vite + React + TypeScript setup
- Provided installation commands and configuration files
- Documented dark mode implementation

### Agent 3: Architecture Design
- Identified 3 data storage options (chose static + Supabase hybrid)
- Recommended Vite SPA with client-side routing
- Designed tab-based navigation structure

### Agent 4: Benchmark Display
- Analyzed benchmark script output format
- Designed TypeScript interfaces for benchmark data
- Created component sketches for tables, cards, and visualizations

### Agent 5: Deployment Research
- Confirmed Vercel as optimal choice (already configured)
- Documented free tier limits (100GB bandwidth, 100 deploys/day)
- No changes needed to deployment pipeline
