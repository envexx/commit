'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount, useReadContracts } from 'wagmi'
import { ArrowRight, Plus, Wallet } from 'lucide-react'
import { vaultAbi } from '@/lib/abi'
import { useVault } from '@/hooks/useVault'
import { loadRecords, type MilestoneRecord } from '@/lib/registry'
import { targetChain } from '@/lib/config'
import { formatUsdc, shortAddress } from '@/lib/format'
import { VaultState, isTerminal } from '@/lib/state'
import { MilestoneCard } from '@/components/MilestoneCard'
import { Countdown } from '@/components/Countdown'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ButtonLink } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'

type Row = { record: MilestoneRecord; state: VaultState | undefined }

export function Dashboard() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [records, setRecords] = useState<MilestoneRecord[]>([])

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && address) setRecords(loadRecords(targetChain.id))
  }, [mounted, address])

  const mine = address
    ? records.filter(
        (r) =>
          r.client.toLowerCase() === address.toLowerCase() ||
          r.contractor.toLowerCase() === address.toLowerCase(),
      )
    : []

  const { data: statuses } = useReadContracts({
    contracts: mine.map((r) => ({
      abi: vaultAbi,
      address: r.address as `0x${string}`,
      functionName: 'getStatus' as const,
    })),
    query: { enabled: mine.length > 0 },
  })

  const rows: Row[] = mine.map((record, i) => {
    const s = statuses?.[i]
    const state = s?.status === 'success' ? ((s.result as readonly unknown[])[0] as VaultState) : undefined
    return { record, state }
  })

  const live = rows.filter((r) => r.state !== undefined && !isTerminal(r.state))
  const totalCommitted = live.reduce(
    (acc, r) => acc + (Number(r.record.amountDisplay || 0) || 0),
    0,
  )
  const countIn = (states: VaultState[]) => rows.filter((r) => r.state !== undefined && states.includes(r.state)).length
  const inProgress = countIn([VaultState.Funded, VaultState.Active, VaultState.RevisionRequested])
  const inReview = countIn([VaultState.Submitted])
  const settled = countIn([VaultState.Settled, VaultState.SettledByTimeout])
  const attention = rows.filter(
    (r) =>
      r.state === VaultState.Created ||
      r.state === VaultState.Submitted ||
      r.state === VaultState.Disputed,
  )

  const stats = [
    { label: 'Total committed', value: `${formatUsdc(BigInt(Math.round(totalCommitted)) * 1_000_000n)} USDC`, accent: true },
    { label: 'In progress', value: String(inProgress) },
    { label: 'In review', value: String(inReview) },
    { label: 'Settled', value: String(settled) },
  ]

  return (
    <div className="container-fx py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">Workspace</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {mounted && isConnected
              ? `${mine.length} milestone${mine.length === 1 ? '' : 's'} on ${targetChain.name} — every number below is read from the chain.`
              : `Milestones you create or receive on ${targetChain.name} appear here.`}
          </p>
        </div>
        <ButtonLink href="/create" arrow>
          <Plus className="h-4 w-4" aria-hidden />
          New milestone
        </ButtonLink>
      </div>

      <div className="mt-8">
        {!mounted ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !isConnected || !address ? (
          <div className="flex justify-center">
            <EmptyState
              icon={<Wallet className="h-4 w-4" />}
              title="Connect your wallet"
              hint="the dashboard reads everything straight from the chain"
              action={null}
            />
          </div>
        ) : mine.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState
              icon={<Plus className="h-4 w-4" />}
              title="No milestones yet"
              hint="commit USDC before the work starts — that is the whole point"
              action="Create your first milestone"
              onAction={() => router.push('/create')}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={
                    s.accent
                      ? 'rounded-2xl border border-brand/30 bg-brand/[0.04] p-5'
                      : 'rounded-2xl border border-line-light bg-white p-5'
                  }
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{s.label}</p>
                  <p
                    className={
                      s.accent
                        ? 'mt-2 font-display text-2xl font-bold tabular-nums text-brand-strong'
                        : 'mt-2 font-display text-2xl font-bold tabular-nums text-ink'
                    }
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {attention.length > 0 && (
              <div className="mt-6 rounded-2xl border border-line-light bg-zinc-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Needs attention
                </p>
                <ul className="mt-3 divide-y divide-line-light">
                  {attention.map(({ record, state }) => (
                    <li key={record.address}>
                      <Link
                        href={`/milestone?address=${record.address}`}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 transition hover:text-brand"
                      >
                        <StatusBadge state={state!} />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                          {record.title || shortAddress(record.address)}
                        </span>
                        {state === VaultState.Submitted && <ReviewDeadlineNote record={record} />}
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {rows.map(({ record }) => (
                <MilestoneCard key={record.address} record={record} wallet={address} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-line-light bg-white p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: '01', t: 'Commit', d: 'Client locks an exact USDC amount in a dedicated vault before work starts.' },
            { n: '02', t: 'Prove', d: 'Contractor submits the deliverable URL — its hash lands onchain.' },
            { n: '03', t: 'Settle', d: 'Approval, review timeout, deadline refund or mutual cancel. Rules only.' },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-mono text-xs font-semibold text-brand">{s.n}</p>
              <p className="mt-1.5 text-sm font-semibold text-ink">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line-light pt-4 text-xs text-ink-muted">
          How settlement works in detail:{' '}
          <Link href="/about#how" className="font-semibold text-brand hover:underline">
            read the product story
          </Link>
        </p>
      </div>
    </div>
  )
}

function ReviewDeadlineNote({ record }: { record: MilestoneRecord }) {
  const { status } = useVault(record.address as `0x${string}`)
  if (!status?.reviewDeadline) return null
  return (
    <span className="text-xs text-ink-muted">
      review ends <Countdown deadlineSec={status.reviewDeadline} />
    </span>
  )
}
