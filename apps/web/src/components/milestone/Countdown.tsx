'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatRemaining } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Countdown({ deadlineSec }: { deadlineSec: bigint | number | undefined }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(t)
  }, [])

  if (!deadlineSec || deadlineSec === 0n || deadlineSec === 0) {
    return <span className="text-ink-muted/60">—</span>
  }

  const expired = Number(deadlineSec) * 1000 <= (now ?? 0)
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-mono text-xs', expired ? 'text-rose-600' : 'text-ink')}
      title={new Date(Number(deadlineSec) * 1000).toLocaleString()}
    >
      <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
      {now === null ? '…' : expired ? 'expired' : formatRemaining(deadlineSec)}
    </span>
  )
}
