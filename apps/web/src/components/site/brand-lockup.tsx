import { chainLabel } from '@/lib/config'
import { SITE } from '@/lib/site'
import { cn } from '@/lib/utils'

export const BRAND_SPRING = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.9 }

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <img
      src="/brand/commit-logo.png"
      alt=""
      aria-hidden
      width={36}
      height={36}
      className={cn('h-9 w-9 select-none object-contain', className)}
    />
  )
}

export function BrandLockup({
  className,
  tone = 'dark',
}: {
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandGlyph />
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            'font-display text-sm font-bold tracking-tight',
            tone === 'light' ? 'text-white' : 'text-ink',
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.18em]',
            tone === 'light' ? 'text-white/60' : 'text-ink-muted',
          )}
        >
          {chainLabel}
        </span>
      </span>
    </div>
  )
}
