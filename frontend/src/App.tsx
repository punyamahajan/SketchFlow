import { useState } from 'react'
import UploadStep from './pages/UploadStep'
import IntentStep from './pages/IntentStep'
import AuditStep from './pages/AuditStep'
import BlueprintStep from './pages/BlueprintStep'
import GenerateStep from './pages/GenerateStep'
import type { ProjectState } from './types'

const STEPS = [
  { id: 'upload',    label: 'Upload Sketch',    num: 1 },
  { id: 'intent',    label: 'Intent Editor',     num: 2 },
  { id: 'audit',     label: 'Product Audit',     num: 3 },
  { id: 'blueprint', label: 'Blueprint',         num: 4 },
  { id: 'generate',  label: 'Generate Frontend', num: 5 },
]

export default function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [project, setProject] = useState<ProjectState | null>(null)

  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
  const goTo   = (i: number) => { if (i <= currentStep) setCurrentStep(i) }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4f2' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: '#fff',
        borderRight: '1px solid #e5e7eb', display: 'flex',
        flexDirection: 'column', padding: '32px 16px',
        minHeight: '100vh', position: 'sticky', top: 0, alignSelf: 'flex-start',
      }}>
        <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 24, paddingLeft: 8 }}>
          Workflow
        </p>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STEPS.map((step, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            const locked = i > currentStep
            return (
              <li key={step.id}>
                <button
                  onClick={() => goTo(i)}
                  disabled={locked}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 12, border: 'none',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    background: active ? '#eef2ff' : 'transparent',
                    color: active ? '#4338ca' : done ? '#374151' : '#d1d5db',
                    fontWeight: active ? 600 : 400, fontSize: 14, textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    fontWeight: 700, flexShrink: 0,
                    background: active ? '#4f46e5' : done ? '#d1fae5' : '#f3f4f6',
                    color: active ? '#fff' : done ? '#059669' : '#9ca3af',
                  }}>
                    {done ? '✓' : step.num}
                  </span>
                  {step.label}
                </button>
              </li>
            )
          })}
        </ol>
        <div style={{ marginTop: 'auto', paddingTop: 32, paddingLeft: 8, paddingRight: 8 }}>
          <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.6 }}>
            "Teams don't fail because they can't code. They fail because they start coding before requirements are complete."
          </p>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 32px', height: 64, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>S</div>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>
              SketchFlow <span style={{ color: '#6366f1' }}>AI</span>
            </span>
          </div>
          {project && (
            <span style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', padding: '4px 12px', borderRadius: 99, border: '1px solid #e5e7eb' }}>
              {project.title}
            </span>
          )}
        </header>

        <main style={{ flex: 1, padding: 40 }}>
          {currentStep === 0 && <UploadStep onComplete={(p) => { setProject(p); goNext() }} />}
          {currentStep === 1 && project && <IntentStep project={project} onUpdate={setProject} onComplete={goNext} />}
          {currentStep === 2 && project && <AuditStep project={project} onUpdate={setProject} onComplete={goNext} />}
          {currentStep === 3 && project && <BlueprintStep project={project} onUpdate={setProject} onComplete={goNext} />}
          {currentStep === 4 && project && <GenerateStep project={project} />}
        </main>
      </div>
    </div>
  )
}