import { useState } from 'react'
import { generateFrontend } from '../api/client'
import type { GenerationRecord, ProjectState } from '../types'

interface Props { project: ProjectState }

const STEPS_LOG = [
  'Sending sketch to Claude Vision…',
  'Pass 1/2 — Generating core structure (App, Layout, types)…',
  'Pass 2/2 — Generating pages and config files…',
  'Packaging React project into ZIP…',
  'Done!',
]

export default function GenerateStep({ project }: Props) {
  const [gen, setGen] = useState<GenerationRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [logIndex, setLogIndex] = useState(0)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setLogIndex(0)

    // Animate log steps while waiting
    const interval = setInterval(() => {
      setLogIndex(i => Math.min(i + 1, STEPS_LOG.length - 2))
    }, 8000)

    try {
      const result = await generateFrontend(project.id)
      clearInterval(interval)
      setLogIndex(STEPS_LOG.length - 1)
      setGen(result)
    } catch (e: any) {
      clearInterval(interval)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (gen?.zip_url) window.open(gen.zip_url, '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Generate AI Frontend</h1>
        <p className="text-gray-500 text-sm">
          Claude will use your sketch image + confirmed intent + audit + blueprint to generate a production-ready
          React / Vite / TypeScript / TailwindCSS project.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">What gets generated</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          {[
            'src/App.tsx', 'src/types/index.ts',
            'src/components/layout/Sidebar.tsx', 'src/components/layout/Navbar.tsx',
            'src/components/layout/Layout.tsx', 'src/pages/Dashboard.tsx',
            'src/pages/Orders.tsx', 'src/pages/Products.tsx',
            'src/components/ui/StatCard.tsx', 'src/components/ui/DataTable.tsx',
            'src/hooks/useSidebar.ts', 'package.json',
            'vite.config.ts', 'tailwind.config.js',
            'tsconfig.json', 'index.html',
          ].map(f => (
            <div key={f} className="flex items-center gap-2">
              <span className="text-indigo-400">📄</span>
              <code>{f}</code>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

      {loading && (
        <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm mb-6">
          {STEPS_LOG.slice(0, logIndex + 1).map((step, i) => (
            <div key={i} className={`flex items-center gap-2 mb-1 ${i === logIndex ? 'text-green-400' : 'text-gray-500'}`}>
              <span>{i === logIndex ? '▶' : '✓'}</span>
              {step}
            </div>
          ))}
          {logIndex < STEPS_LOG.length - 1 && (
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <div className="w-3 h-3 border border-gray-500 border-t-green-400 rounded-full animate-spin" />
              Processing…
            </div>
          )}
        </div>
      )}

      {gen?.generation_status === 'completed' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">✓</div>
            <div>
              <p className="font-bold text-green-900">React project generated!</p>
              <p className="text-sm text-green-700">Your ZIP is ready to download and run.</p>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-gray-300 mb-4">
            <p className="text-green-400 mb-2"># After downloading and unzipping:</p>
            <p>cd sketchflow-app</p>
            <p>npm install</p>
            <p>npm run dev</p>
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            ⬇ Download ZIP
          </button>
        </div>
      )}

      {!loading && gen?.generation_status !== 'completed' && (
        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Generate React Frontend →
        </button>
      )}
    </div>
  )
}
