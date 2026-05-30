import { useState } from 'react'
import UploadStep from './pages/UploadStep'
import IntentStep from './pages/IntentStep'
import AuditStep from './pages/AuditStep'
import BlueprintStep from './pages/BlueprintStep'
import GenerateStep from './pages/GenerateStep'
import StepNav from './components/layout/StepNav'
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
  const goTo   = (i: number) => {
    // Can only go back or to completed steps
    if (i <= currentStep) setCurrentStep(i)
  }

  return (
    <div className="min-h-screen bg-[#f5f4f2] flex">
      <StepNav steps={STEPS} current={currentStep} onNavigate={goTo} />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">SketchFlow</span>
              <span className="text-indigo-500 font-semibold"> AI</span>
            </div>
          </div>
          {project && (
            <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {project.title}
            </span>
          )}
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          {currentStep === 0 && (
            <UploadStep onComplete={(p) => { setProject(p); goNext() }} />
          )}
          {currentStep === 1 && project && (
            <IntentStep project={project} onUpdate={setProject} onComplete={goNext} />
          )}
          {currentStep === 2 && project && (
            <AuditStep project={project} onUpdate={setProject} onComplete={goNext} />
          )}
          {currentStep === 3 && project && (
            <BlueprintStep project={project} onUpdate={setProject} onComplete={goNext} />
          )}
          {currentStep === 4 && project && (
            <GenerateStep project={project} />
          )}
        </main>
      </div>
    </div>
  )
}
