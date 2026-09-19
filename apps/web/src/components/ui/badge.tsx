import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'violet'
  | 'light'
  | 'outline'

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line-light bg-canvas text-ink-muted',
  brand: 'border-brand/50 bg-brand/10 text-brand-strong',
  success: 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700',
  warning: 'border-amber-600/40 bg-amber-500/10 text-amber-700',
  danger: 'border-rose-600/40 bg-rose-500/10 text-rose-700',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-700',
  light: 'border-line-light bg-panel text-ink',
  outline: 'border-line-strong bg-transparent text-ink-muted',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
