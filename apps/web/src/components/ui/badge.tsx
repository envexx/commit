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
  neutral: 'border-white/10 bg-white/[0.06] text-zinc-300',
  brand: 'border-brand/40 bg-brand/15 text-brand',
  success: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  warning: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  danger: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  violet: 'border-violet-500/40 bg-violet-500/15 text-violet-300',
  light: 'border-line-light bg-white text-ink',
  outline: 'border-line-dark bg-transparent text-zinc-400',
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
