'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useVault } from '@/hooks/useVault'
import { StatusBadge } from './StatusBadge'
import { Badge } from '@/components/ui/badge'
import { CryptoAmount } from '@/components/ui/amount'
import { Skeleton } from '@/components/ui/skeleton'
import { shortAddress } from '@/lib/format'
import type { MilestoneRecord } from '@/lib/registry'

export function MilestoneCard({ record, wallet }: { record: MilestoneRecord; wallet?: string }) {
  const { status, config } = useVault(record.address as `0x${string}`)
  const state = status?.state
  const isClient = wallet ? record.client.toLowerCase() === wallet.toLowerCase() : null

  return (
    <Link
      href={`/milestone?address=${record.address}`}
      className="group block rounded-3xl border border-line-light bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-light"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-ink">
            {record.title || 'Milestone'}
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">{shortAddress(record.address)}</p>
        </div>
        {state !== undefined ? (
          <StatusBadge state={state} />
        ) : (
          <Skeleton className="h-6 w-24 rounded-full" />
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <CryptoAmount
          value={config ? Number(config.amount) / 1_000_000 : Number(record.amountDisplay || 0)}
          symbol="USDC"
          dp={2}
          className="font-mono text-lg font-bold text-ink"
        />
        {isClient !== null && (
          <Badge tone={isClient ? 'brand' : 'neutral'}>{isClient ? 'you are client' : 'you are contractor'}</Badge>
        )}
        <ArrowUpRight
          className="ml-auto h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
          aria-hidden
        />
      </div>
    </Link>
  )
}
