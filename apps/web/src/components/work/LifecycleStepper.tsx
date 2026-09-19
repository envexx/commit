import { AlertTriangle, Check } from 'lucide-react'
import type { LifecycleStep, StepMark } from '@/lib/lifecycle'
import { cn } from '@/lib/utils'

const MARKER: Record<StepMark, string> = {
  done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
  todo: 'border-line-light bg-panel text-ink-muted',
  current: 'border-brand/50 bg-brand/10 text-brand-strong',
  attention: 'border-amber-500/40 bg-amber-50 text-amber-700',
  outcome: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
}

const LABEL: Record<StepMark, string> = {
  done: 'text-ink-muted',
  todo: 'text-ink-muted/70',
  current: 'text-ink font-semibold',
  attention: 'text-amber-700 font-medium',
  outcome: 'text-emerald-700 font-medium',
}

/**
 * The four human steps of a milestone — where am I? Presentational only;
 * marks come from lib/lifecycle.ts.
 */
export function LifecycleStepper({
  steps,
  className,
}: {
  steps: LifecycleStep[]
  className?: string
}) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {steps.map((s, i) => (
        <li key={s.n} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="mr-2.5 h-px w-4 bg-line-light" />}
          <span
            aria-hidden
            className={cn(
              'grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold',
              MARKER[s.mark],
            )}
          >
            {s.mark === 'done' || s.mark === 'outcome' ? (
              <Check className="h-3 w-3" strokeWidth={3} />
            ) : s.mark === 'attention' ? (
              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              s.n
            )}
          </span>
          <span className={cn('text-[11px] leading-none', LABEL[s.mark])}>{s.label}</span>
          <span className="sr-only">
            {s.mark === 'done' || s.mark === 'outcome'
              ? ' (done)'
              : s.mark === 'attention'
                ? ' (needs attention)'
                : s.mark === 'current'
                  ? ' (current step)'
                  : ''}
          </span>
        </li>
      ))}
    </ol>
  )
}
