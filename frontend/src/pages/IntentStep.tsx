import { useState } from 'react'
import { confirmIntent, editIntent } from '../api/client'
import type { Intent, ProjectState } from '../types'

interface Props {
  project: ProjectState
  onUpdate: (p: ProjectState) => void
  onComplete: () => void
}

export default function IntentStep({ project, onUpdate, onComplete }: Props) {
  const base = project.intent?.final_intent
  const [intent, setIntent] = useState<Intent>(base || {} as Intent)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const update = (key: keyof Intent, value: any) =>
    setIntent(prev => ({ ...prev, [key]: value }))

  const updateList = (key: keyof Intent, index: number, value: string) => {
    const arr = [...(intent[key] as string[])]
    arr[index] = value
    update(key, arr)
  }

  const addItem = (key: keyof Intent) =>
    update(key, [...(intent[key] as string[]), ''])

  const removeItem = (key: keyof Intent, index: number) => {
    const arr = (intent[key] as string[]).filter((_, i) => i !== index)
    update(key, arr)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await editIntent(project.id, intent)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const updated = await confirmIntent(project.id, intent)
      onUpdate({ ...project, intent: updated })
      onComplete()
    } catch (e: any) { setError(e.message) }
    finally { setConfirming(false) }
  }

  const ListField = ({ label, field }: { label: string; field: keyof Intent }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <button onClick={() => addItem(field)} className="text-xs text-indigo-600 hover:text-indigo-800">+ Add</button>
      </div>
      <div className="flex flex-col gap-2">
        {(intent[field] as string[]).map((val, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={val}
              onChange={e => updateList(field, i, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button onClick={() => removeItem(field, i)} className="text-gray-300 hover:text-red-400 text-lg leading-none px-1">×</button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Intent Editor</h1>
          <p className="text-gray-500 text-sm">Review and edit the extracted intent. Confirm when ready — nothing else proceeds until you do.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save edits'}
          </button>
          <button onClick={handleConfirm} disabled={confirming} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
            {confirming ? 'Confirming…' : 'Confirm intent →'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Product name</label>
          <input value={intent.product_name || ''} onChange={e => update('product_name', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Product type</label>
          <input value={intent.product_type || ''} onChange={e => update('product_type', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-1">User goal</label>
        <textarea value={intent.user_goal || ''} onChange={e => update('user_goal', e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 block mb-1">Layout notes</label>
        <textarea value={intent.layout_notes || ''} onChange={e => update('layout_notes', e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <ListField label="Screens" field="screens" />
          <ListField label="Features" field="features" />
          <ListField label="User roles" field="user_roles" />
        </div>
        <div>
          <ListField label="User flows" field="user_flows" />
          <ListField label="Detected UI components" field="detected_ui" />
          <ListField label="Open questions" field="open_questions" />
        </div>
      </div>
    </div>
  )
}
