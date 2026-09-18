import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({
  tone = 'dark',
  className,
  children,
}: {
  tone?: 'dark' | 'deep' | 'light' | 'glass'
  className?: string
  children: ReactNode
}) {
  const tones = {
    dark: 'card-dark',
    deep: 'rounded-3xl border border-line-dark bg-surface-deep',
    light: 'card-light',
    glass: 'card-glass',
  }
  return <div className={cn(tones[tone], className)}>{children}</div>
}

export function CardEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500', className)}>
      {children}
    </p>
  )
}
