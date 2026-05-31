import { useState, useRef } from 'react'
import { uploadSketch } from '../api/client'
import type { ProjectState } from '../types'

const S = {
  wrap:    { maxWidth: 600, margin: '0 auto' } as React.CSSProperties,
  h1:      { fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 8px' } as React.CSSProperties,
  sub:     { fontSize: 14, color: '#6b7280', margin: '0 0 32px', lineHeight: 1.5 } as React.CSSProperties,
  label:   { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 } as React.CSSProperties,
  input:   { width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 20 } as React.CSSProperties,
  zone:    (hasFile: boolean): React.CSSProperties => ({
    border: `2px dashed ${hasFile ? '#a5b4fc' : '#e5e7eb'}`,
    borderRadius: 20, padding: 48, textAlign: 'center',
    cursor: 'pointer', background: hasFile ? '#eef2ff' : '#fafafa',
    transition: 'all 0.2s',
  }),
  icon:    { fontSize: 40, marginBottom: 12 } as React.CSSProperties,
  zoneTxt: { fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 6px' } as React.CSSProperties,
  zoneHint:{ fontSize: 13, color: '#9ca3af', margin: 0 } as React.CSSProperties,
  preview: { maxHeight: 220, maxWidth: '100%', borderRadius: 12, objectFit: 'contain' as const },
  meta:    { fontSize: 13, color: '#9ca3af', marginTop: 8 } as React.CSSProperties,
  err:     { background: '#fef2f2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginTop: 16 } as React.CSSProperties,
  btn:     (disabled: boolean): React.CSSProperties => ({
    marginTop: 24, width: '100%', background: disabled ? '#e5e7eb' : '#4f46e5',
    color: disabled ? '#9ca3af' : '#fff', border: 'none', borderRadius: 12,
    padding: '14px 0', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
  }),
}

export default function UploadStep({ onComplete }: { onComplete: (p: ProjectState) => void }) {
  const [file, setFile]       = useState<File | null>(null)
  const [name, setName]       = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const pick = (f: File) => {
    setFile(f); setError('')
    const r = new FileReader()
    r.onload = e => setPreview(e.target?.result as string)
    r.readAsDataURL(f)
  }

  const submit = async () => {
    if (!file) return
    setLoading(true); setError('')
    try {
      const res = await uploadSketch(file, name || undefined)
      onComplete({ id: res.project_id, title: name || file.name, status: 'intent_extracted', intent: res.intent })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Upload Sketch</h1>
      <p style={S.sub}>Upload a wireframe, whiteboard photo, or hand-drawn sketch. Claude will extract the product intent.</p>

      <label style={S.label}>Project name <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
      <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunnies Admin Dashboard" />

      <div style={S.zone(!!file)}
        onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) pick(f) }}
        onDragOver={e => e.preventDefault()}
      >
        <input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && pick(e.target.files[0])} />
        {preview
          ? <img src={preview} alt="preview" style={S.preview} />
          : <>
              <div style={S.icon}>🖼️</div>
              <p style={S.zoneTxt}>Drop your sketch here</p>
              <p style={S.zoneHint}>PNG, JPG — up to 25MB</p>
            </>
        }
      </div>
      {file && <p style={S.meta}>{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
      {error && <div style={S.err}>{error}</div>}
      <button style={S.btn(!file || loading)} disabled={!file || loading} onClick={submit}>
        {loading ? '⏳ Analyzing with Claude Vision…' : 'Analyze Sketch →'}
      </button>
    </div>
  )
}
