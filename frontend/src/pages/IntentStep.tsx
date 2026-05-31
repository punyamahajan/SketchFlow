import { useState } from 'react'
import type React from 'react'
import { confirmIntent, editIntent } from '../api/client'
import type { Intent, ProjectState } from '../types'

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }
const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
const taStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 72 }
const tagStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', borderRadius: 8, padding: '4px 10px', fontSize: 13 }

interface Props { project: ProjectState; onUpdate: (p: ProjectState) => void; onComplete: () => void }

export default function IntentStep({ project, onUpdate, onComplete }: Props) {
  const [intent, setIntent] = useState<Intent>(project.intent?.final_intent || {} as Intent)
  const [saving, setSaving]       = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')

  const set = (k: keyof Intent, v: any) => setIntent(p => ({ ...p, [k]: v }))
  const setItem = (k: keyof Intent, i: number, v: string) => { const a = [...(intent[k] as string[])]; a[i] = v; set(k, a) }
  const addItem = (k: keyof Intent) => set(k, [...(intent[k] as string[]), ''])
  const removeItem = (k: keyof Intent, i: number) => set(k, (intent[k] as string[]).filter((_, j) => j !== i))

  const handleSave = async () => {
    setSaving(true)
    try { await editIntent(project.id, intent); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try { const r = await confirmIntent(project.id, intent); onUpdate({ ...project, intent: r }); onComplete() }
    catch (e: any) { setError(e.message) }
    finally { setConfirming(false) }
  }

  const ListField = ({ label: lbl, field }: { label: string; field: keyof Intent }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={label}>{lbl}</span>
        <button onClick={() => addItem(field)} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {((intent[field] as string[]) || []).map((val, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <input value={val} onChange={e => setItem(field, i, e.target.value)} style={inputStyle} />
            <button onClick={() => removeItem(field, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Intent Editor</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Review and edit extracted intent. Nothing proceeds until you confirm.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, marginLeft: 24 }}>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: saved ? '#059669' : '#374151' }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save edits'}
          </button>
          <button onClick={handleConfirm} disabled={confirming} style={{ padding: '9px 18px', background: confirming ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {confirming ? 'Confirming…' : 'Confirm intent →'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>{error}</div>}

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><span style={label}>Product name</span><input value={intent.product_name || ''} onChange={e => set('product_name', e.target.value)} style={inputStyle} /></div>
          <div><span style={label}>Product type</span><input value={intent.product_type || ''} onChange={e => set('product_type', e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={label}>User goal</span>
          <textarea value={intent.user_goal || ''} onChange={e => set('user_goal', e.target.value)} style={taStyle} rows={2} />
        </div>
        <div>
          <span style={label}>Layout notes</span>
          <textarea value={intent.layout_notes || ''} onChange={e => set('layout_notes', e.target.value)} style={taStyle} rows={2} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <ListField label="Screens" field="screens" />
          <ListField label="Features" field="features" />
          <ListField label="User roles" field="user_roles" />
        </div>
        <div style={card}>
          <ListField label="User flows" field="user_flows" />
          <ListField label="Detected UI" field="detected_ui" />
          <ListField label="Open questions" field="open_questions" />
        </div>
      </div>
    </div>
  )
}
