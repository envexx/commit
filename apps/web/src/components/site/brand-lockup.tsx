import { chainLabel } from '@/lib/config'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

export const BRAND_SPRING = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.9 }

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-black text-white shadow-glow',
        className,
      )}
    >
      A
    </span>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandGlyph />
      <span className="flex flex-col leading-tight">
        <span className="font-display text-sm font-bold tracking-tight text-ink">{SITE.name}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {chainLabel}
        </span>
      </span>
    </div>
  )
}
