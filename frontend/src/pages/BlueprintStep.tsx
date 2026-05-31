import { useState } from 'react'
import { runBlueprint } from '../api/client'
import type { Blueprint, ProjectState } from '../types'

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, marginBottom: 24 }
const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px', paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }
const chip = (color = '#eef2ff', text = '#4338ca'): React.CSSProperties => ({ background: color, color: text, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 })
const priorityChip = (p: string) => ({ core: chip('#d1fae5', '#065f46'), secondary: chip('#fefce8', '#92400e'), 'nice-to-have': chip('#f3f4f6', '#6b7280') }[p] || chip())

interface Props { project: ProjectState; onUpdate: (p: ProjectState) => void; onComplete: () => void }

export default function BlueprintStep({ project, onUpdate, onComplete }: Props) {
  const [bp, setBp]         = useState<Blueprint | null>(project.blueprint?.blueprint_json || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const gen = async () => {
    setLoading(true); setError('')
    try { const r = await runBlueprint(project.id); setBp(r.blueprint_json); onUpdate({ ...project, blueprint: r }) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Frontend Blueprint</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Read-only implementation document. Review it, then generate your React app.</p>
        </div>
        <div style={{ marginLeft: 24, flexShrink: 0 }}>
          {!bp && <button onClick={gen} disabled={loading} style={{ padding: '9px 20px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Generating…' : 'Generate Blueprint'}</button>}
          {bp && <button onClick={onComplete} style={{ padding: '9px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Generate Frontend →</button>}
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>{error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 14 }}>Building your frontend blueprint…</p>
        </div>
      )}

      {bp && (
        <>
          {/* Product Overview */}
          <div style={card}>
            <p style={sectionTitle}>1. Product Overview</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
              <div><span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 3 }}>Name</span><strong>{bp.product_overview?.name}</strong></div>
              <div><span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 3 }}>Type</span><strong>{bp.product_overview?.type}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 3 }}>Goal</span><p style={{ margin: 0 }}>{bp.product_overview?.goal}</p></div>
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 8 }}>Tech Stack</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(bp.product_overview?.tech_stack || []).map(t => <span key={t} style={chip()}>{t}</span>)}</div>
              </div>
            </div>
          </div>

          {/* Screen Inventory */}
          <div style={card}>
            <p style={sectionTitle}>2. Screen Inventory</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(bp.screen_inventory || []).map((s, i) => (
                <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <code style={{ fontSize: 11, background: '#fff', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 6 }}>{s.route}</code>
                      <span style={priorityChip(s.priority)}>{s.priority}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{s.description}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.components.map(c => <span key={c} style={{ fontSize: 11, background: '#fff', border: '1px solid #e5e7eb', padding: '2px 8px', borderRadius: 6 }}>{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component Inventory */}
          <div style={card}>
            <p style={sectionTitle}>3. Component Inventory</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>{['Component', 'Type', 'Description'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(bp.component_inventory || []).map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#6366f1', fontSize: 12 }}>{c.name}</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>{c.type}</span></td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Design System */}
          <div style={card}>
            <p style={sectionTitle}>4. Design System</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Colors</p>
                {Object.entries(bp.design_system?.colors || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: v as string, border: '1px solid #e5e7eb', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#6b7280', width: 80 }}>{k}</span>
                    <code style={{ fontSize: 11, color: '#9ca3af' }}>{v as string}</code>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 10px' }}>Accessibility</p>
                {(bp.accessibility_requirements || []).map((a, i) => <p key={i} style={{ margin: '0 0 6px', fontSize: 13, color: '#374151' }}>• {a}</p>)}
              </div>
            </div>
          </div>

          {/* Recommended Libraries */}
          <div style={card}>
            <p style={sectionTitle}>5. Recommended Libraries</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(bp.recommended_libraries || []).map((lib, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f9fafb', borderRadius: 12, padding: '12px 16px' }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 14 }}>{lib.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{lib.purpose}</p>
                  </div>
                  <code style={{ fontSize: 11, background: '#fff', border: '1px solid #e5e7eb', padding: '4px 10px', borderRadius: 8, color: '#374151', flexShrink: 0, marginLeft: 16 }}>{lib.install}</code>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
