import { VaultState, STATE_META } from '@/lib/state'
import { cn } from '@/lib/utils'

export function StatusBadge({ state, size = 'sm' }: { state: VaultState; size?: 'sm' | 'lg' }) {
  const meta = STATE_META[state]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-mono font-semibold uppercase tracking-wider',
        meta.badge,
        size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-2.5 py-0.5 text-[11px]',
      )}
    >
      {meta.label}
    </span>
  )
}
