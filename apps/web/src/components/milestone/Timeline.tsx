'use client'

import { ExternalLink } from 'lucide-react'
import { shortAddress } from '@/lib/format'
import type { TimelineLog } from '@/hooks/useVaultEvents'
import { explorerTx } from '@/lib/config'

type Item = { label: string; detail?: string; tone: string }

function describe(log: TimelineLog, clientAddr: string, contractorAddr: string): Item {
  const args = log.args as Record<string, unknown>
  switch (log.eventName) {
    case 'MilestoneFunded':
      return {
        label: 'Milestone funded',
        detail: 'USDC committed to the vault. Work can begin.',
        tone: 'border-brand/40 bg-brand/10',
      }
    case 'WorkAcknowledged':
      return { label: 'Contractor acknowledged start', tone: 'border-indigo-500/40 bg-indigo-500/10' }
    case 'WorkSubmitted':
      return {
        label: 'Work submitted',
        detail: String((args as { evidenceURI?: string }).evidenceURI ?? ''),
        tone: 'border-amber-500/30 bg-amber-50',
      }
    case 'RevisionRequested':
      return {
        label: `Revision requested (#${String((args as { revisionCount?: bigint }).revisionCount ?? '')})`,
        detail: 'Review clock reset. Contractor must resubmit before the new deadline.',
        tone: 'border-violet-500/40 bg-violet-500/10',
      }
    case 'MilestoneDisputed':
      return {
        label: 'Dispute raised by client',
        detail: 'Timeout release paused until approval or mutual cancel.',
        tone: 'border-rose-500/40 bg-rose-50',
      }
    case 'MilestoneApproved':
      return { label: 'Client approved the work', tone: 'border-emerald-500/40 bg-emerald-50' }
    case 'FundsReleased':
      return {
        label: `USDC released to ${shortAddress(String((args as { to?: string }).to ?? contractorAddr))}`,
        tone: 'border-emerald-500/40 bg-emerald-50',
      }
    case 'TimeoutReleased':
      return {
        label: 'Review window expired — timeout release executed',
        detail: 'Pre-agreed rule: no client action after review means release.',
        tone: 'border-emerald-500/40 bg-emerald-50',
      }
    case 'MilestoneRefunded': {
      const reason = Number((args as { reason?: bigint }).reason ?? 0)
      return {
        label: reason === 1 ? 'Mutual cancellation executed' : 'Refunded to client (deadline expired)',
        tone: 'border-teal-500/40 bg-teal-500/10',
      }
    }
    case 'MutualCancelProposed':
      return {
        label: `Mutual cancel proposed by ${shortAddress(String((args as { proposer?: string }).proposer ?? ''))}`,
        tone: 'border-line-light bg-canvas',
      }
    default:
      return { label: log.eventName, tone: 'border-line-light bg-canvas' }
  }
}

export function Timeline({
  logs,
  clientAddr,
  contractorAddr,
}: {
  logs: TimelineLog[]
  clientAddr: string
  contractorAddr: string
}) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No onchain activity yet. Every state change will appear here with its transaction.
      </p>
    )
  }

  return (
    <ol className="space-y-2.5">
      {logs.map((log, i) => {
        const item = describe(log, clientAddr, contractorAddr)
        const txUrl = log.transactionHash ? explorerTx(log.transactionHash) : null
        return (
          <li
            key={`${log.blockNumber}-${log.transactionHash ?? i}-${i}`}
            className={`border px-4 py-3.5 ${item.tone}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <span className="font-mono text-[11px] text-ink-muted">block {log.blockNumber.toString()}</span>
            </div>
            {item.detail && <p className="mt-1 break-all text-xs text-ink-muted">{item.detail}</p>}
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline"
              >
                view transaction
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
