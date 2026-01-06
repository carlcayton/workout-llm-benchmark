#!/usr/bin/env node

/**
 * Auto-update INDEX.md with current file modification dates
 *
 * Usage: node scripts/update-index.mjs
 */

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Files to track with descriptions
const TRACKED_FILES = {
  // Benchmark scripts
  'benchmark-orchestrator.mjs': 'Spawns parallel model benchmarks',
  'benchmark-single-model.mjs': 'Tests one model against scenarios',
  'benchmark-combiner.mjs': 'Aggregates results from all models',
  'benchmark-shared.mjs': 'Shared scenarios, configs, utilities',
  'benchmark-workout-llms-v2.mjs': 'Legacy v2 benchmark runner',
  'merge-benchmarks.mjs': 'Merge multiple benchmark runs',
  'quick-merge.mjs': 'Quick merge utility',
  'run-5-splits.mjs': 'Run benchmarks for 5 splits',
  'compare-exercises.mjs': 'Compare exercise selections',
  'transform-benchmark.mjs': 'Transform benchmark data formats',

  // Documentation
  'README.md': 'Project documentation',
  'PROTOTYPE-SHOWCASE-PLAN.md': 'Overall showcase architecture',
  'ARNOLD-BLEND-BENCHMARK-PLAN.md': 'Arnold Split blending strategy',
  'BENCHMARK-REFACTOR.md': 'Data organization refactor plan',
  'BENCHMARK-ANALYSIS-2025-12-29.md': 'Detailed analysis report',
  'BENCHMARK_COMPARISON.md': 'Model comparison summary',

  // AI Docs
  'ai-docs/input-output-gap-index.md': 'Master index of gap analysis',
  'ai-docs/input-output-gap-duration-constraints.md': 'Duration violations analysis',
  'ai-docs/input-output-gap-training-style-params.md': 'HIT/Strength style violations',
  'ai-docs/input-output-gap-muscle-targeting.md': 'Muscle group analysis',
  'ai-docs/input-output-gap-equipment-mapping.md': 'Equipment utilization',
  'ai-docs/benchmark-gaps-exercise-selection.md': 'Exercise selection analysis',
  'ai-docs/benchmark-gaps-programming-parameters.md': 'Sets/reps/rest analysis',
  'ai-docs/benchmark-gaps-structure-volume.md': 'Volume and structure gaps',

  // React Components
  'src/App.jsx': 'Main app component',
  'src/components/benchmark/LLMBenchmark.jsx': 'Benchmark visualization UI',
  'src/components/exercises/ExerciseReview.jsx': 'Exercise review interface',
  'src/components/comparison/VideoComparison.jsx': 'Video model comparison',
  'src/components/gallery/Gallery.jsx': 'Gallery component',

  // Data Files
  'public/benchmark-data.json': 'Active benchmark data for UI',
  'package.json': 'NPM dependencies and scripts',
  'vercel.json': 'Vercel deployment config',
};

function getModDate(filePath) {
  const fullPath = join(ROOT, filePath);
  if (!existsSync(fullPath)) return null;
  const stat = statSync(fullPath);
  return stat.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
}

function groupFiles() {
  const groups = {
    'Benchmark Scripts': [],
    'Documentation': [],
    'AI Docs (Gap Analysis)': [],
    'React Components': [],
    'Data Files': [],
  };

  for (const [file, desc] of Object.entries(TRACKED_FILES)) {
    const modDate = getModDate(file);
    if (!modDate) continue;

    const entry = { file, desc, modDate };

    if (file.endsWith('.mjs')) {
      groups['Benchmark Scripts'].push(entry);
    } else if (file.startsWith('ai-docs/')) {
      groups['AI Docs (Gap Analysis)'].push(entry);
    } else if (file.startsWith('src/')) {
      groups['React Components'].push(entry);
    } else if (file.endsWith('.md')) {
      groups['Documentation'].push(entry);
    } else {
      groups['Data Files'].push(entry);
    }
  }

  // Sort each group by modification date (newest first)
  for (const group of Object.values(groups)) {
    group.sort((a, b) => b.modDate.localeCompare(a.modDate));
  }

  return groups;
}

function getRecentlyModified(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const recent = {};
  for (const [file, desc] of Object.entries(TRACKED_FILES)) {
    const modDate = getModDate(file);
    if (modDate && modDate >= cutoffStr) {
      if (!recent[modDate]) recent[modDate] = [];
      recent[modDate].push(file);
    }
  }

  return Object.entries(recent)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, files]) => ({ date, files }));
}

function generateMarkdown(groups, recentlyModified) {
  const today = new Date().toISOString().split('T')[0];

  let md = `# Showcase Directory Index

Central tracking file for all important files in the showcase project.

**Last Index Update:** ${today}

---

`;

  // Generate each section
  for (const [groupName, files] of Object.entries(groups)) {
    if (files.length === 0) continue;

    md += `## ${groupName}\n\n`;
    md += `| File | Description | Last Modified |\n`;
    md += `|------|-------------|---------------|\n`;

    for (const { file, desc, modDate } of files) {
      md += `| \`${file}\` | ${desc} | ${modDate} |\n`;
    }

    md += `\n---\n\n`;
  }

  // Directories section (static)
  md += `## Directories

| Directory | Purpose |
|-----------|---------|
| \`benchmark-results/\` | Raw benchmark output JSON files |
| \`benchmark-results/archive/\` | Deprecated benchmark data |
| \`ai-docs/\` | Gap analysis and AI documentation |
| \`src/components/\` | React UI components |
| \`public/\` | Static assets served by Vite |

---

`;

  // Recently modified section
  md += `## Recently Modified (Last 7 Days)

`;

  if (recentlyModified.length === 0) {
    md += `No files modified in the last 7 days.\n\n`;
  } else {
    for (const { date, files } of recentlyModified) {
      md += `- **${date}** - ${files.map(f => `\`${f.split('/').pop()}\``).join(', ')}\n`;
    }
    md += `\n`;
  }

  md += `---

## Update Instructions

To refresh this index with current modification dates:

\`\`\`bash
node scripts/update-index.mjs
\`\`\`

Or manually check dates:

\`\`\`bash
ls -lt --time-style="+%Y-%m-%d" *.md *.mjs package.json
ls -lt --time-style="+%Y-%m-%d" ai-docs/*.md
ls -lt --time-style="+%Y-%m-%d" src/components/*/*.jsx
\`\`\`
`;

  return md;
}

// Main
const groups = groupFiles();
const recentlyModified = getRecentlyModified(7);
const markdown = generateMarkdown(groups, recentlyModified);

const indexPath = join(ROOT, 'INDEX.md');
writeFileSync(indexPath, markdown);

console.log(`✅ INDEX.md updated with ${Object.values(TRACKED_FILES).length} tracked files`);
console.log(`   Recently modified (7 days): ${recentlyModified.reduce((acc, r) => acc + r.files.length, 0)} files`);
