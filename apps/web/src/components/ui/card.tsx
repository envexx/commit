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
    deep: 'border border-line-light bg-panel',
    light: 'card-light',
    glass: 'card-glass',
  }
  return <div className={cn(tones[tone], className)}>{children}</div>
}

export function CardEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('label-mono', className)}>{children}</p>
}
