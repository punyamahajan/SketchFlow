import { useState, useRef } from 'react'
import { uploadSketch } from '../api/client'
import type { ProjectState } from '../types'

interface Props {
  onComplete: (project: ProjectState) => void
}

export default function UploadStep({ onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const result = await uploadSketch(file, projectName || undefined)
      onComplete({
        id: result.project_id,
        title: projectName || file.name,
        status: 'intent_extracted',
        intent: result.intent,
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Sketch</h1>
        <p className="text-gray-500">Upload a wireframe, whiteboard photo, or hand-drawn sketch. Claude will extract intent from it.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="e.g. Sunnies Admin Dashboard"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors
          ${file ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">🖼️</div>
            <p className="font-medium text-gray-600">Drop your sketch here</p>
            <p className="text-sm">PNG, JPG — up to 25MB</p>
          </div>
        )}
      </div>

      {file && (
        <p className="mt-2 text-sm text-gray-500">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
      >
        {loading ? 'Analyzing with Claude Vision…' : 'Analyze Sketch →'}
      </button>
    </div>
  )
}
