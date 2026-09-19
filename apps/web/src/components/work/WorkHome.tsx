'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useReadContracts } from 'wagmi'
import { HandCoins, Plus } from 'lucide-react'
import { vaultAbi } from '@/lib/abi'
import { targetChain } from '@/lib/config'
import { lifecycleFor, sortActionableFirst, type PartyRole } from '@/lib/lifecycle'
import { loadRecords, type MilestoneRecord } from '@/lib/registry'
import type { VaultState } from '@/lib/state'
import {
  parseVaultConfig,
  parseVaultStatus,
  type VaultConfigData,
  type VaultStatusData,
} from '@/hooks/useVault'
import { MilestoneCard } from '@/components/milestone/MilestoneCard'
import { EmptyState } from '@/components/ui/empty-state'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { RoleIntentCards } from '@/components/work/RoleIntentCards'

type Tab = 'Getting paid' | 'Paying'

type Row = {
  record: MilestoneRecord
  role: PartyRole
  state?: VaultState
  config?: VaultConfigData
  status?: VaultStatusData
  view: ReturnType<typeof lifecycleFor>
}

function roleOf(record: MilestoneRecord, wallet: string): PartyRole | null {
  const walletNorm = wallet.toLowerCase()
  if (record.client.toLowerCase() === walletNorm) return 'client'
  if (record.contractor.toLowerCase() === walletNorm) return 'contractor'
  return null
}

/**
 * The connected home: "What do you want to do?" first, then Your Work split
 * into Getting paid / Paying. One batched chain read backs every card;
 * actionable milestones float to the top.
 */
export function WorkHome({ address }: { address: `0x${string}` }) {
  const router = useRouter()
  const openInputRef = useRef<HTMLInputElement | null>(null)
  const [records, setRecords] = useState<MilestoneRecord[]>([])
  const [tab, setTab] = useState<Tab>('Getting paid')
  const didDefaultTab = useRef(false)

  useEffect(() => {
    setRecords(loadRecords(targetChain.id))
  }, [address])

  const mine = useMemo(
    () =>
      records
        .map((record) => ({ record, role: roleOf(record, address) }))
        .filter((entry): entry is { record: MilestoneRecord; role: PartyRole } => entry.role !== null),
    [records, address],
  )

  const contracts = useMemo(
    () =>
      mine.flatMap(({ record }) => [
        { abi: vaultAbi, address: record.address as `0x${string}`, functionName: 'getConfig' as const },
        { abi: vaultAbi, address: record.address as `0x${string}`, functionName: 'getStatus' as const },
      ]),
    [mine],
  )

  const { data: results } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0, refetchInterval: 15_000 },
  })

  const byAddress = useMemo(() => {
    const map: Record<
      string,
      { state?: VaultState; config?: VaultConfigData; status?: VaultStatusData }
    > = {}
    // Length guard: a registry change between query dispatch and render would
    // otherwise shift statuses onto the wrong milestone.
    if (!results || results.length !== mine.length * 2) return map
    mine.forEach(({ record }, i) => {
      const config = parseVaultConfig(results[i * 2]?.result)
      const status = parseVaultStatus(results[i * 2 + 1]?.result)
      map[record.address.toLowerCase()] = { state: status?.state, config, status }
    })
    return map
  }, [results, mine])

  const buildRow = ({ record, role }: { record: MilestoneRecord; role: PartyRole }): Row => {
    const entry = byAddress[record.address.toLowerCase()]
    const state = entry?.state
    const status = entry?.status
    return {
      record,
      role,
      state,
      config: entry?.config,
      status,
      view: lifecycleFor(state, role, {
        nowSec: Math.floor(Date.now() / 1000),
        submitDeadlineSec: status?.submitDeadline,
        reviewDeadlineSec: status?.reviewDeadline,
      }),
    }
  }

  const contractorRows = useMemo(
    () => sortActionableFirst(mine.filter((r) => r.role === 'contractor').map(buildRow), (r) => r.record.createdAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mine, byAddress],
  )
  const clientRows = useMemo(
    () => sortActionableFirst(mine.filter((r) => r.role === 'client').map(buildRow), (r) => r.record.createdAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mine, byAddress],
  )

  useEffect(() => {
    if (didDefaultTab.current) return
    didDefaultTab.current = true
    if (contractorRows.length === 0 && clientRows.length > 0) setTab('Paying')
  }, [contractorRows.length, clientRows.length])

  const activeRows = tab === 'Getting paid' ? contractorRows : clientRows
  const emptyAll = mine.length === 0

  const focusOpenInput = () => {
    openInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    openInputRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="container-fx py-10 md:py-14">
      <header className="max-w-2xl">
          <p className="label-mono flex items-center gap-2 text-brand-strong">
            <span className="inline-block h-1.5 w-1.5 bg-brand" />
            Your work · {targetChain.name}
          </p>
          <h1 className="heading-retro mt-4 text-3xl font-bold text-ink sm:text-4xl">
            What do you want to do?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            The same wallet can hire on one milestone and work on another. Every
            state below is read straight from the chain — nothing here is a
            promise.
          </p>
        </header>

        <div className="mt-8">
          <RoleIntentCards openInputRef={openInputRef} />
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="heading-retro text-2xl font-bold text-ink">Your work</h2>
            <SegmentedControl
              options={['Getting paid', 'Paying']}
              value={tab}
              onChange={(v) => setTab(v as Tab)}
            />
          </div>

          <div className="mt-6">
            {emptyAll ? (
              <div className="flex justify-center">
                <EmptyState
                  icon={<Plus className="h-4 w-4" />}
                  title="No payments protected yet"
                  hint="create the milestone, secure the USDC, then share it with your contractor"
                  action="Protect a payment"
                  onAction={() => router.push('/create')}
                />
              </div>
            ) : activeRows.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeRows.map((row) => (
                  <MilestoneCard
                    key={row.record.address}
                    record={row.record}
                    role={row.role}
                    state={row.state}
                    config={row.config}
                    submitDeadlineSec={row.status?.submitDeadline}
                    reviewDeadlineSec={row.status?.reviewDeadline}
                  />
                ))}
              </div>
            ) : tab === 'Getting paid' ? (
              <div className="flex justify-center">
                <EmptyState
                  icon={<HandCoins className="h-4 w-4" />}
                  title="Nothing shared with you yet"
                  hint="when a client shares a milestone with you it appears here — open the link they sent"
                  action="Open a shared milestone"
                  onAction={focusOpenInput}
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <EmptyState
                  icon={<Plus className="h-4 w-4" />}
                  title="No payments protected yet"
                  hint="create the milestone, secure the USDC, then share it with your contractor"
                  action="Protect a payment"
                  onAction={() => router.push('/create')}
                />
              </div>
            )}
          </div>
        </section>

        <p className="mt-10 border-t border-line-light pt-4 text-xs text-ink-muted">
          How settlement works in detail:{' '}
          <Link href="/about#how" className="font-semibold text-brand hover:underline">
            read the product story
          </Link>
        </p>
    </div>
  )
}
