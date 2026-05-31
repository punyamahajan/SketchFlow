import { useState } from 'react'
import { generateFrontend } from '../api/client'
import type { GenerationRecord, ProjectState } from '../types'

const STEPS_LOG = [
  '📤 Sending sketch image to Claude Vision…',
  '⚛️  Pass 1/2 — Generating App.tsx, Layout, types…',
  '📄 Pass 2/2 — Generating pages, hooks, config…',
  '📦 Packaging React project into ZIP…',
  '✅ Done!',
]

const fileList = [
  'src/App.tsx', 'src/types/index.ts',
  'src/components/layout/Sidebar.tsx', 'src/components/layout/Navbar.tsx',
  'src/components/layout/Layout.tsx', 'src/pages/Dashboard.tsx',
  'src/pages/Orders.tsx', 'src/pages/Products.tsx',
  'src/components/ui/StatCard.tsx', 'src/components/ui/DataTable.tsx',
  'src/hooks/useSidebar.ts', 'package.json',
  'vite.config.ts', 'tailwind.config.js',
  'tsconfig.json', 'index.html',
]

interface Props { project: ProjectState }

export default function GenerateStep({ project }: Props) {
  const [gen, setGen]           = useState<GenerationRecord | null>(null)
  const [loading, setLoading]   = useState(false)
  const [logIdx, setLogIdx]     = useState(0)
  const [error, setError]       = useState('')

  const handleGenerate = async () => {
    setLoading(true); setError(''); setLogIdx(0); setGen(null)
    const iv = setInterval(() => setLogIdx(i => Math.min(i + 1, STEPS_LOG.length - 2)), 9000)
    try {
      const r = await generateFrontend(project.id)
      clearInterval(iv); setLogIdx(STEPS_LOG.length - 1); setGen(r)
    } catch (e: any) { clearInterval(iv); setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Generate AI Frontend</h1>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.6 }}>
        Claude will use your sketch image + confirmed intent + audit + blueprint to generate a
        production-ready <strong>React / Vite / TypeScript / TailwindCSS</strong> project.
      </p>

      {/* File list preview */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 14px' }}>What gets generated</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
          {fileList.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#a5b4fc' }}>📄</span>
              <code style={{ fontSize: 12, color: '#6b7280' }}>{f}</code>
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>{error}</div>}

      {/* Terminal log */}
      {loading && (
        <div style={{ background: '#0f172a', borderRadius: 16, padding: 24, fontFamily: 'monospace', fontSize: 13, marginBottom: 24 }}>
          {STEPS_LOG.slice(0, logIdx + 1).map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: i === logIdx ? '#4ade80' : '#475569' }}>
              <span style={{ fontSize: 10 }}>{i === logIdx ? '▶' : '✓'}</span> {step}
            </div>
          ))}
          {logIdx < STEPS_LOG.length - 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', marginTop: 8 }}>
              <div style={{ width: 10, height: 10, border: '2px solid #334155', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span>Working…</span>
            </div>
          )}
        </div>
      )}

      {/* Success state */}
      {gen?.generation_status === 'completed' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', flexShrink: 0 }}>✓</div>
            <div>
              <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 16, color: '#14532d' }}>React project generated!</p>
              <p style={{ margin: 0, fontSize: 13, color: '#16a34a' }}>Your ZIP is ready. Unzip and run to see your app.</p>
            </div>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 12, padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
            <span style={{ color: '#4ade80', display: 'block', marginBottom: 6 }}># Get started:</span>
            <span style={{ display: 'block' }}>unzip sketchflow-app.zip</span>
            <span style={{ display: 'block' }}>cd sketchflow-app</span>
            <span style={{ display: 'block' }}>npm install</span>
            <span style={{ display: 'block' }}>npm run dev</span>
          </div>
          <a
            href={gen.zip_url || '#'}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', background: '#16a34a', color: '#fff', borderRadius: 12, padding: '14px 0', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
          >
            ⬇ Download ZIP
          </a>
        </div>
      )}

      {!loading && gen?.generation_status !== 'completed' && (
        <button onClick={handleGenerate} style={{ width: '100%', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Generate React Frontend →
        </button>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
