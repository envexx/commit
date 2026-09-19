'use client'

import { targetChain } from '@/lib/config'
import { lifecycleFor, type PartyRole } from '@/lib/lifecycle'
import { STATE_META, VaultState, isTerminal } from '@/lib/state'
import type { MilestoneRecord } from '@/lib/registry'
import type { VaultConfigData } from '@/hooks/useVault'
import { MilestoneCard } from '@/components/milestone/MilestoneCard'

// QA matrix: every state × role rendered through the real card. Dev-only —
// safe to delete before submission.

const CLIENT = '0x1111111111111111111111111111111111111111'
const CONTRACTOR = '0x2222222222222222222222222222222222222222'

const MOCK_CONFIG: VaultConfigData = {
  client: CLIENT as `0x${string}`,
  contractor: CONTRACTOR as `0x${string}`,
  token: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  amount: 1_500_000_000n,
  scopeHash: `0x${'ab'.repeat(32)}` as `0x${string}`,
  metadataURI: 'data:application/json;base64,e30=',
  submissionPeriod: 30n * 86_400n,
  reviewPeriod: 7n * 86_400n,
}

const mockRecord = (label: string, seq: number): MilestoneRecord => ({
  address: `0x${'4c'.repeat(18)}${seq.toString(16).padStart(2, '0')}${'a1'}`,
  chainId: targetChain.id,
  client: CLIENT,
  contractor: CONTRACTOR,
  title: `${label} — ${seq}`,
  scope: 'Build the landing page per the agreed scope.',
  amountDisplay: '1500',
  createdAt: Date.now() - seq,
})

const CASES: (VaultState | undefined)[] = [
  undefined,
  VaultState.Created,
  VaultState.Funded,
  VaultState.Active,
  VaultState.Submitted,
  VaultState.RevisionRequested,
  VaultState.Disputed,
  VaultState.Settled,
  VaultState.SettledByTimeout,
  VaultState.RefundedExpired,
  VaultState.CancelledMutual,
]

export default function LifecycleMatrixPage() {
  return (
    <div className="container-fx py-10 md:py-14">
      <p className="label-mono flex items-center gap-2 text-brand-strong">
        <span className="inline-block h-1.5 w-1.5 bg-brand" />
        QA · internal
      </p>
      <h1 className="heading-retro mt-4 text-3xl font-bold text-ink">
        Lifecycle matrix
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Every vault state × role rendered through the real milestone card, plus
        the degraded no-read column. Deadline overrides are not exercised here —
        check them on a seeded card with a passed deadline.
      </p>

      {(['contractor', 'client'] as PartyRole[]).map((role) => (
        <section key={role} className="mt-10">
          <h2 className="font-display text-lg font-bold text-ink">
            Role: {role === 'client' ? 'client (paying)' : 'contractor (getting paid)'}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CASES.map((state, i) => {
              const label = state === undefined ? 'NO CHAIN READ' : STATE_META[state].label
              return (
                <MilestoneCard
                  key={`${role}-${label}`}
                  record={mockRecord(label, i + 1)}
                  role={role}
                  state={state}
                  config={state === undefined ? undefined : MOCK_CONFIG}
                />
              )
            })}
          </div>
        </section>
      ))}

      <p className="mt-10 border-t border-line-light pt-4 text-xs text-ink-muted">
        Sanity: {CASES.length * 2} tiles · isTerminal(settled+) ={' '}
        {String(isTerminal(VaultState.Settled))} · lifecycleFor(undefined).rank ={' '}
        {lifecycleFor(undefined, 'contractor').rank}
      </p>
    </div>
  )
}
