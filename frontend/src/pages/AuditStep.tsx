import { useState } from 'react'
import { runAudit } from '../api/client'
import type { Audit, ProjectState } from '../types'

interface Props {
  project: ProjectState
  onUpdate: (p: ProjectState) => void
  onComplete: () => void
}

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-yellow-50 text-yellow-700',
  low:    'bg-gray-50 text-gray-500',
}

const IMPACT_COLORS: Record<string, string> = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-blue-50 text-blue-600',
  low:    'bg-gray-50 text-gray-500',
}

export default function AuditStep({ project, onUpdate, onComplete }: Props) {
  const [audit, setAudit] = useState<Audit | null>(project.audit?.audit_json || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRun = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await runAudit(project.id)
      setAudit(result.audit_json)
      onUpdate({ ...project, audit: result })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const Badge = ({ label, color }: { label: string; color: string }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
  )

  const Section = ({ title, icon, items, render }: {
    title: string; icon: string
    items: any[]; render: (item: any, i: number) => React.ReactNode
  }) => items.length > 0 ? (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item, i) => render(item, i))}
      </div>
    </div>
  ) : null

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Audit</h1>
          <p className="text-gray-500 text-sm">UX and product review — missing screens, flows, states, and recommendations.</p>
        </div>
        <div className="flex gap-2">
          {!audit && (
            <button onClick={handleRun} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
              {loading ? 'Auditing…' : 'Run Audit'}
            </button>
          )}
          {audit && (
            <button onClick={onComplete} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
              Continue to Blueprint →
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

      {loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          Reviewing your product…
        </div>
      )}

      {audit && (
        <>
          {audit.summary && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-2xl text-sm text-indigo-800 leading-relaxed">
              {audit.summary}
            </div>
          )}

          <Section title="Missing Screens" icon="📱" items={audit.missing_screens}
            render={(item, i) => (
              <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                </div>
                <Badge label={item.priority} color={PRIORITY_COLORS[item.priority] || ''} />
              </div>
            )}
          />

          <Section title="Missing User Flows" icon="🔄" items={audit.missing_user_flows}
            render={(item, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-gray-900">{item.flow}</p>
                  <Badge label={item.priority} color={PRIORITY_COLORS[item.priority] || ''} />
                </div>
                {item.steps && <ol className="text-xs text-gray-500 ml-4 list-decimal space-y-0.5">{item.steps.map((s: string, si: number) => <li key={si}>{s}</li>)}</ol>}
              </div>
            )}
          />

          <Section title="Missing UI States" icon="🔲" items={audit.missing_ui_states}
            render={(item, i) => (
              <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.screen} — <span className="text-indigo-600">{item.state}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            )}
          />

          <Section title="UX Recommendations" icon="💡" items={audit.ux_recommendations}
            render={(item, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-gray-900">{item.area}</p>
                  <Badge label={item.impact} color={IMPACT_COLORS[item.impact] || ''} />
                </div>
                <p className="text-xs text-red-400 mb-1">{item.issue}</p>
                <p className="text-xs text-green-700">→ {item.recommendation}</p>
              </div>
            )}
          />

          <Section title="Industry Requirements" icon="🏭" items={audit.industry_requirements}
            render={(item, i) => (
              <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                  <p className="font-medium text-sm text-gray-900">{item.requirement}</p>
                </div>
                <Badge label={item.priority} color={PRIORITY_COLORS[item.priority] || ''} />
              </div>
            )}
          />
        </>
      )}
    </div>
  )
}
