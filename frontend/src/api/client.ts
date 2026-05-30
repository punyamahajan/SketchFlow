const BASE = '/api'

export async function uploadSketch(file: File, projectName?: string) {
  const form = new FormData()
  form.append('file', file)
  if (projectName) form.append('project_name', projectName)
  const res = await fetch(`${BASE}/projects/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed')
  return res.json()
}

export async function getIntent(projectId: string) {
  const res = await fetch(`${BASE}/projects/${projectId}/intent`)
  if (!res.ok) throw new Error('Failed to load intent')
  return res.json()
}

export async function editIntent(projectId: string, edited: object) {
  const res = await fetch(`${BASE}/projects/${projectId}/intent`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edited_intent: edited }),
  })
  if (!res.ok) throw new Error('Failed to save intent')
  return res.json()
}

export async function confirmIntent(projectId: string, edited?: object) {
  const res = await fetch(`${BASE}/projects/${projectId}/intent/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edited_intent: edited }),
  })
  if (!res.ok) throw new Error('Failed to confirm intent')
  return res.json()
}

export async function runAudit(projectId: string) {
  const res = await fetch(`${BASE}/projects/${projectId}/audit`, { method: 'POST' })
  if (!res.ok) throw new Error((await res.json()).detail || 'Audit failed')
  return res.json()
}

export async function runBlueprint(projectId: string) {
  const res = await fetch(`${BASE}/projects/${projectId}/blueprint`, { method: 'POST' })
  if (!res.ok) throw new Error((await res.json()).detail || 'Blueprint failed')
  return res.json()
}

export async function generateFrontend(projectId: string) {
  const res = await fetch(`${BASE}/projects/${projectId}/generate`, { method: 'POST' })
  if (!res.ok) throw new Error((await res.json()).detail || 'Generation failed')
  return res.json()
}
