import { useState } from 'react'
import type React from 'react'
import { runAudit } from '../api/client'
import type { Audit, ProjectState } from '../types'

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }
const cardHeader: React.CSSProperties = { padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }
const cardTitle: React.CSSProperties = { fontWeight: 600, fontSize: 14, color: '#111827', flex: 1 }
const row: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 12, alignItems: 'flex-start' }
const priorityColor = (p: string) => ({ high: { background: '#fef2f2', color: '#dc2626' }, medium: { background: '#fefce8', color: '#a16207' }, low: { background: '#f3f4f6', color: '#6b7280' } }[p] || { background: '#f3f4f6', color: '#6b7280' })
const badge = (p: string): React.CSSProperties => ({ ...priorityColor(p), fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0 })
const count = (n: number): React.CSSProperties => ({ background: '#f3f4f6', color: '#6b7280', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99 })

interface Props { project: ProjectState; onUpdate: (p: ProjectState) => void; onComplete: () => void }

export default function AuditStep({ project, onUpdate, onComplete }: Props) {
  const [audit, setAudit]   = useState<Audit | null>(project.audit?.audit_json || null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const run = async () => {
    setLoading(true); setError('')
    try { const r = await runAudit(project.id); setAudit(r.audit_json); onUpdate({ ...project, audit: r }) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Product Audit</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>UX and PM review — missing screens, flows, states, and recommendations.</p>
        </div>
        <div style={{ marginLeft: 24, flexShrink: 0 }}>
          {!audit && <button onClick={run} disabled={loading} style={{ padding: '9px 20px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Auditing…' : 'Run Audit'}</button>}
          {audit && <button onClick={onComplete} style={{ padding: '9px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Continue to Blueprint →</button>}
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>{error}</div>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 14 }}>Claude is reviewing your product…</p>
        </div>
      )}

      {audit && (
        <>
          {audit.summary && (
            <div style={{ background: '#eef2ff', borderRadius: 14, padding: '16px 20px', fontSize: 14, color: '#3730a3', lineHeight: 1.6, marginBottom: 20 }}>
              {audit.summary}
            </div>
          )}

          {/* Missing Screens */}
          {audit.missing_screens?.length > 0 && (
            <div style={card}>
              <div style={cardHeader}><span>📱</span><span style={cardTitle}>Missing Screens</span><span style={count(audit.missing_screens.length)}>{audit.missing_screens.length}</span></div>
              {audit.missing_screens.map((item, i) => (
                <div key={i} style={row}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{item.reason}</p>
                  </div>
                  <span style={badge(item.priority || 'low')}>{item.priority}</span>
                </div>
              ))}
            </div>
          )}

          {/* Missing Flows */}
          {audit.missing_user_flows?.length > 0 && (
            <div style={card}>
              <div style={cardHeader}><span>🔄</span><span style={cardTitle}>Missing User Flows</span><span style={count(audit.missing_user_flows.length)}>{audit.missing_user_flows.length}</span></div>
              {audit.missing_user_flows.map((item, i) => (
                <div key={i} style={row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.flow}</p>
                      <span style={badge(item.priority || 'low')}>{item.priority}</span>
                    </div>
                    {item.steps && <ol style={{ margin: 0, paddingLeft: 18 }}>{item.steps.map((s: string, j: number) => <li key={j} style={{ fontSize: 12, color: '#6b7280' }}>{s}</li>)}</ol>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Missing UI States */}
          {audit.missing_ui_states?.length > 0 && (
            <div style={card}>
              <div style={cardHeader}><span>🔲</span><span style={cardTitle}>Missing UI States</span><span style={count(audit.missing_ui_states.length)}>{audit.missing_ui_states.length}</span></div>
              {audit.missing_ui_states.map((item, i) => (
                <div key={i} style={row}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 14 }}>{item.screen} — <span style={{ color: '#6366f1' }}>{item.state}</span></p>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UX Recommendations */}
          {audit.ux_recommendations?.length > 0 && (
            <div style={card}>
              <div style={cardHeader}><span>💡</span><span style={cardTitle}>UX Recommendations</span><span style={count(audit.ux_recommendations.length)}>{audit.ux_recommendations.length}</span></div>
              {audit.ux_recommendations.map((item, i) => (
                <div key={i} style={row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.area}</p>
                      <span style={{ ...badge(item.impact || 'low'), background: item.impact === 'high' ? '#fef2f2' : item.impact === 'medium' ? '#eff6ff' : '#f3f4f6', color: item.impact === 'high' ? '#dc2626' : item.impact === 'medium' ? '#2563eb' : '#6b7280' }}>{item.impact}</span>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#ef4444' }}>⚠ {item.issue}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#059669' }}>→ {item.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Industry Requirements */}
          {audit.industry_requirements?.length > 0 && (
            <div style={card}>
              <div style={cardHeader}><span>🏭</span><span style={cardTitle}>Industry Requirements</span><span style={count(audit.industry_requirements.length)}>{audit.industry_requirements.length}</span></div>
              {audit.industry_requirements.map((item, i) => (
                <div key={i} style={row}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.requirement}</p>
                  </div>
                  <span style={badge(item.priority || 'low')}>{item.priority}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
