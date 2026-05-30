interface Step { id: string; label: string; num: number }

interface Props {
  steps: Step[]
  current: number
  onNavigate: (i: number) => void
}

export default function StepNav({ steps, current, onNavigate }: Props) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col py-8 px-4 shrink-0 min-h-screen">
      <div className="mb-10 px-2">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Workflow</p>
      </div>
      <ol className="flex flex-col gap-1">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          const locked = i > current
          return (
            <li key={step.id}>
              <button
                onClick={() => onNavigate(i)}
                disabled={locked}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${active  ? 'bg-indigo-50 text-indigo-700 font-semibold' : ''}
                  ${done    ? 'text-gray-600 hover:bg-gray-50 cursor-pointer' : ''}
                  ${locked  ? 'text-gray-300 cursor-not-allowed' : ''}
                `}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${active ? 'bg-indigo-600 text-white' : ''}
                  ${done   ? 'bg-green-100 text-green-600' : ''}
                  ${locked ? 'bg-gray-100 text-gray-300' : ''}
                `}>
                  {done ? '✓' : step.num}
                </span>
                {step.label}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-auto px-2 pt-8">
        <blockquote className="text-xs text-gray-400 italic leading-relaxed">
          "Teams don't fail because they can't code. They fail because they start coding before requirements are complete."
        </blockquote>
      </div>
    </aside>
  )
}
