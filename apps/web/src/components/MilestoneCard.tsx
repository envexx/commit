'use client'

import Link from 'next/link'
import { ArrowRight, Check, ExternalLink, OctagonX } from 'lucide-react'
import { explorerAddress } from '@/lib/config'
import { formatUsdc, shortAddress } from '@/lib/format'
import { lifecycleFor, type PartyRole } from '@/lib/lifecycle'
import type { MilestoneRecord } from '@/lib/registry'
import type { VaultState } from '@/lib/state'
import type { VaultConfigData } from '@/hooks/useVault'
import { cn } from '@/lib/utils'
import { LifecycleStepper } from '@/components/work/LifecycleStepper'

const LEAD_TONE: Record<string, string> = {
  safe: 'text-emerald-700',
  progress: 'text-ink',
  review: 'text-amber-700',
  action: 'text-brand-strong',
  blocked: 'text-rose-700',
  done: 'text-emerald-700',
  neutral: 'text-ink-muted',
}

function splitOnce(text: string, needle: string): [string, string] {
  const at = text.indexOf(needle)
  if (at === -1) return ['', text]
  return [text.slice(0, at), text.slice(at + needle.length)]
}

export interface MilestoneCardProps {
  record: MilestoneRecord
  role: PartyRole
  /** Chain state; undefined renders the degraded "cannot verify" view. */
  state?: VaultState
  config?: VaultConfigData
  submitDeadlineSec?: bigint
  reviewDeadlineSec?: bigint
  className?: string
}

/**
 * Level 1 = human meaning (what this means for you), level 2 = financial
 * (how much, locked or released), level 3 = verification (proof on Arc).
 * Hook-free: all chain data arrives via props from a batched parent read.
 */
export function MilestoneCard({
  record,
  role,
  state,
  config,
  submitDeadlineSec,
  reviewDeadlineSec,
  className,
}: MilestoneCardProps) {
  const detailHref = `/milestone?address=${record.address}`
  const explorer = explorerAddress(record.address)

  const amount = config
    ? `${formatUsdc(config.amount)} USDC`
    : record.amountDisplay
      ? `${record.amountDisplay} USDC`
      : ''

  const view = lifecycleFor(state, role, {
    amountLabel: amount || undefined,
    nowSec: Math.floor(Date.now() / 1000),
    submitDeadlineSec,
    reviewDeadlineSec,
    detailHref,
  })

  const counterparty =
    role === 'client' ? record.contractor : record.client
  const [finPre, finPost] = splitOnce(view.financial, amount)

  return (
    <article
      className={cn(
        'group relative rounded-3xl border border-line-light bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-light',
        view.requiresMyAction && 'border-brand/50 shadow-[0_0_0_1px_rgba(255,85,0,0.25)]',
        className,
      )}
    >
      <Link
        href={detailHref}
        className="block after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-ink">
              {record.title || 'Milestone'}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {role === 'client' ? 'Your contractor' : 'Your client'}{' '}
              <span className="font-mono text-[11px]">{shortAddress(counterparty)}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-line-light bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            {role === 'client' ? 'you pay' : 'you get paid'}
          </span>
        </div>

        <p
          className={cn(
            'mt-4 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider',
            LEAD_TONE[view.meaningTone] ?? 'text-ink-muted',
          )}
        >
          {view.meaningTone === 'safe' || view.meaningTone === 'done' ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          ) : view.meaningTone === 'blocked' ? (
            <OctagonX className="h-3.5 w-3.5" aria-hidden />
          ) : null}
          {view.meaningLead}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink">{view.meaning}</p>

        <LifecycleStepper steps={view.steps} className="mt-5 border-t border-line-light pt-4" />

        {view.nextStep && (
          <div className="mt-4 rounded-2xl border border-line-light bg-zinc-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Next step
            </p>
            <p className="mt-1.5 text-sm font-semibold text-ink">{view.nextStep.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{view.nextStep.body}</p>
            {view.nextStep.ctaLabel && (
              <span
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  view.requiresMyAction
                    ? 'bg-brand text-white shadow-glow group-hover:bg-brand-strong'
                    : 'border border-line-light bg-white text-ink group-hover:border-zinc-300',
                )}
              >
                {view.nextStep.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-ink-muted">
          {finPre}
          {amount && (
            <span className="font-mono font-semibold tabular-nums text-ink">{amount}</span>
          )}
          {finPost}
        </p>
      </Link>

      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-line-light pt-3 font-mono text-[11px] text-ink-muted">
        {state !== undefined && config !== undefined ? (
          <>
            <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} aria-hidden />
            <span>Verified on Arc</span>
            <span aria-hidden>·</span>
            <span>{shortAddress(record.address)}</span>
          </>
        ) : (
          <span>Not verified yet — open this milestone to check</span>
        )}
        {explorer && state !== undefined && config !== undefined && (
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 ml-auto inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            View on Arc Explorer
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </p>
    </article>
  )
}
