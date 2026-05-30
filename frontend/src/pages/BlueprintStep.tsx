import { useState } from 'react'
import { runBlueprint } from '../api/client'
import type { Blueprint, ProjectState } from '../types'

interface Props {
  project: ProjectState
  onUpdate: (p: ProjectState) => void
  onComplete: () => void
}

export default function BlueprintStep({ project, onUpdate, onComplete }: Props) {
  const [bp, setBp] = useState<Blueprint | null>(project.blueprint?.blueprint_json || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await runBlueprint(project.id)
      setBp(result.blueprint_json)
      onUpdate({ ...project, blueprint: result })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      {children}
    </section>
  )

  const Chip = ({ label }: { label: string }) => (
    <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">{label}</span>
  )

  const PriorityChip = ({ p }: { p: string }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
      ${p === 'core' ? 'bg-green-50 text-green-700' : p === 'secondary' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-500'}`}>
      {p}
    </span>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Frontend Blueprint</h1>
          <p className="text-gray-500 text-sm">Read-only implementation document. Review it, then generate your React app.</p>
        </div>
        <div className="flex gap-2">
          {!bp && (
            <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
              {loading ? 'Generating…' : 'Generate Blueprint'}
            </button>
          )}
          {bp && (
            <button onClick={onComplete} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
              Generate Frontend →
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          Building your frontend blueprint…
        </div>
      )}

      {bp && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <Section title="1. Product Overview">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Name</span><p className="font-medium mt-0.5">{bp.product_overview?.name}</p></div>
              <div><span className="text-gray-400">Type</span><p className="font-medium mt-0.5">{bp.product_overview?.type}</p></div>
              <div className="col-span-2"><span className="text-gray-400">Goal</span><p className="font-medium mt-0.5">{bp.product_overview?.goal}</p></div>
              <div className="col-span-2"><span className="text-gray-400 block mb-2">Tech Stack</span>
                <div className="flex flex-wrap gap-2">{(bp.product_overview?.tech_stack || []).map(t => <Chip key={t} label={t} />)}</div>
              </div>
            </div>
          </Section>

          <Section title="2. Screen Inventory">
            <div className="flex flex-col gap-3">
              {(bp.screen_inventory || []).map((s, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{s.name}</span>
                    <div className="flex items-center gap-2"><code className="text-xs bg-white px-2 py-0.5 rounded border border-gray-100">{s.route}</code><PriorityChip p={s.priority} /></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                  <div className="flex flex-wrap gap-1">{s.components.map(c => <span key={c} className="text-xs bg-white border border-gray-100 px-2 py-0.5 rounded">{c}</span>)}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Component Inventory">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-400 border-b border-gray-100"><th className="text-left py-2 pr-4">Component</th><th className="text-left py-2 pr-4">Type</th><th className="text-left py-2">Description</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(bp.component_inventory || []).map((c, i) => (
                    <tr key={i}><td className="py-2 pr-4 font-mono text-xs text-indigo-600">{c.name}</td><td className="py-2 pr-4"><span className="text-xs bg-gray-50 px-2 py-0.5 rounded">{c.type}</span></td><td className="py-2 text-xs text-gray-600">{c.description}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Design System">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-2">Colors</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(bp.design_system?.colors || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: v as string }} />
                      <span className="text-xs text-gray-500">{k}</span>
                      <code className="text-xs text-gray-400">{v as string}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">Accessibility</p>
                <ul className="text-xs text-gray-600 space-y-1">{(bp.accessibility_requirements || []).map((a, i) => <li key={i}>• {a}</li>)}</ul>
              </div>
            </div>
          </Section>

          <Section title="5. Recommended Libraries">
            <div className="flex flex-col gap-2">
              {(bp.recommended_libraries || []).map((lib, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium">{lib.name}</p><p className="text-xs text-gray-500 mt-0.5">{lib.purpose}</p></div>
                  <code className="text-xs bg-white border border-gray-100 px-2 py-1 rounded text-gray-600">{lib.install}</code>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
