import { VaultState } from './state'

/**
 * The single translator from the onchain state machine to workflow language.
 * Answers the four product questions for any milestone card:
 * where am I (steps), is the money safe (meaning), what do I do next
 * (nextStep), how much is involved (financial). Pure — no React, no wagmi.
 */

export type PartyRole = 'client' | 'contractor'
export type StepMark = 'done' | 'todo' | 'current' | 'attention' | 'outcome'
export type MeaningTone =
  | 'neutral'
  | 'safe'
  | 'progress'
  | 'review'
  | 'action'
  | 'blocked'
  | 'done'

export interface LifecycleStep {
  n: 1 | 2 | 3 | 4
  label: string
  mark: StepMark
}

export interface NextStep {
  title: string
  body: string
  ctaLabel: string | null
  ctaHref: string | null
}

export interface LifecycleCtx {
  /** Pre-formatted amount, e.g. "1,500.00 USDC". */
  amountLabel?: string
  /** Current time in seconds (chain-clock). Enables deadline overrides. */
  nowSec?: number
  submitDeadlineSec?: bigint
  reviewDeadlineSec?: bigint
  /** Detail-page href copied into every nextStep.ctaHref. */
  detailHref?: string
}

export interface LifecycleView {
  state: VaultState | undefined
  role: PartyRole
  /** True when the chain state could not be read (offline / unknown vault). */
  unknown: boolean
  steps: [LifecycleStep, LifecycleStep, LifecycleStep, LifecycleStep]
  meaningLead: string
  meaning: string
  meaningTone: MeaningTone
  financial: string
  nextStep: NextStep | null
  requiresMyAction: boolean
  /** Lower floats higher in "Your Work". See actionRank(). */
  rank: number
}

export const LIFECYCLE_STEP_LABELS = [
  'Terms agreed',
  'Payment secured',
  'Work submitted',
  'Payment released',
] as const

const DEFAULT_AMOUNT = 'The agreed amount'

const step = (n: 1 | 2 | 3 | 4, mark: StepMark, label?: string): LifecycleStep => ({
  n,
  label: label ?? LIFECYCLE_STEP_LABELS[n - 1],
  mark,
})

const detail = (ctx: LifecycleCtx | undefined): string | null =>
  ctx?.detailHref ?? null

const isExpired = (deadline: bigint | undefined, nowSec: number | undefined): boolean =>
  deadline !== undefined && nowSec !== undefined && Number(deadline) < nowSec

export function lifecycleFor(
  state: VaultState | undefined,
  role: PartyRole,
  ctx?: LifecycleCtx,
): LifecycleView {
  const A = ctx?.amountLabel?.trim() || DEFAULT_AMOUNT
  const href = detail(ctx)

  if (state === undefined) {
    return {
      state,
      role,
      unknown: true,
      steps: [step(1, 'current'), step(2, 'todo'), step(3, 'todo'), step(4, 'todo')],
      meaningLead: 'CANNOT VERIFY RIGHT NOW',
      meaning: 'We could not read this milestone from the chain just now.',
      meaningTone: 'neutral',
      financial: `${A} agreed for this milestone.`,
      nextStep: {
        title: 'Open this milestone to verify its current state',
        body: 'The state is read from the chain, not from this browser.',
        ctaLabel: 'Open milestone',
        ctaHref: href,
      },
      requiresMyAction: false,
      rank: 2,
    }
  }

  const base = { state, role, unknown: false as const }

  switch (state) {
    case VaultState.Created: {
      const isClient = role === 'client'
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'current'), step(3, 'todo'), step(4, 'todo')],
        meaningLead: isClient ? 'NOT SECURED YET' : 'WAITING FOR THE CLIENT',
        meaning: isClient
          ? 'Nothing is protected until you fund this milestone. Do not let work start before that.'
          : 'This milestone is not funded yet. Do not start work.',
        meaningTone: isClient ? 'action' : 'neutral',
        financial: `${A} agreed. Nothing has been secured yet.`,
        nextStep: isClient
          ? {
              title: 'Secure the payment',
              body: 'Approve and fund the milestone so your contractor can see the money is really there.',
              ctaLabel: 'Secure payment',
              ctaHref: href,
            }
          : {
              title: 'Wait for the payment to be secured',
              body: 'This page changes the moment the client funds it. Until then, no work.',
              ctaLabel: 'Open milestone',
              ctaHref: href,
            },
        requiresMyAction: isClient,
        rank: isClient ? 1 : 2,
      }
    }

    case VaultState.Funded:
    case VaultState.Active: {
      const inProgress = state === VaultState.Active
      const clientCanReclaim = isExpired(ctx?.submitDeadlineSec, ctx?.nowSec)
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'done'), step(3, 'current'), step(4, 'todo')],
        meaningLead: inProgress ? 'WORK IN PROGRESS' : 'PAYMENT SECURED',
        meaning: role === 'client'
          ? inProgress
            ? 'Your contractor has started. The amount stays locked until they submit.'
            : 'Your money is locked for this milestone and your contractor can safely start.'
          : inProgress
            ? 'Submit your delivery before the deadline. The amount is already secured.'
            : 'You can safely start this work. The money is already there.',
        meaningTone: inProgress ? 'progress' : 'safe',
        financial: `${A} locked for this milestone.`,
        nextStep:
          role === 'client' && clientCanReclaim
            ? {
                title: 'Reclaim the payment',
                body: 'The work deadline passed with nothing submitted. The agreed rule lets you take the amount back.',
                ctaLabel: 'Reclaim payment',
                ctaHref: href,
              }
            : role === 'client'
              ? {
                  title: 'Nothing to do until delivery',
                  body: 'You will see it here the moment your contractor submits. If the deadline passes with no delivery you can take the amount back.',
                  ctaLabel: 'Open milestone',
                  ctaHref: href,
                }
              : {
                  title: inProgress
                    ? 'Submit your delivery'
                    : 'Do the agreed work, then submit your delivery',
                  body: inProgress
                    ? 'Submitting starts the client’s review window.'
                    : 'Submit the deliverable link before the deadline to start the review.',
                  ctaLabel: 'Submit work',
                  ctaHref: href,
                },
        requiresMyAction: role === 'client' && clientCanReclaim,
        rank: role === 'client' && clientCanReclaim ? 0 : role === 'client' ? 2 : 1,
      }
    }

    case VaultState.Submitted: {
      const reviewOver = isExpired(ctx?.reviewDeadlineSec, ctx?.nowSec)
      const isClient = role === 'client'
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'done'), step(3, 'done'), step(4, 'current')],
        meaningLead: isClient ? 'IN REVIEW' : 'WAITING FOR REVIEW',
        meaning: isClient
          ? 'A delivery was submitted. Approve to release, ask for changes, or raise a problem before the window ends.'
          : 'Your delivery is in. If the client does nothing before the window ends, you can release the amount yourself.',
        meaningTone: 'review',
        financial: isClient
          ? `${A} locked — release waits on your review.`
          : `${A} locked — waiting on review.`,
        nextStep: reviewOver
          ? isClient
            ? {
                title: 'The review window ended',
                body: 'The contractor can now release without you. Approve now if the work is good.',
                ctaLabel: 'Review work',
                ctaHref: href,
              }
            : {
                title: 'Release the payment now',
                body: 'The review window ended. The pre-agreed rule lets you release the amount yourself — anyone can trigger it.',
                ctaLabel: 'Release payment',
                ctaHref: href,
              }
          : isClient
            ? {
                title: 'Review the delivery',
                body: 'Approving releases the amount straight away; the review window does the same if you do nothing.',
                ctaLabel: 'Review work',
                ctaHref: href,
              }
            : {
                title: 'Nothing to do yet',
                body: 'The release becomes available to you once the review window ends.',
                ctaLabel: 'Open milestone',
                ctaHref: href,
              },
        requiresMyAction: reviewOver || isClient,
        rank: reviewOver ? 0 : isClient ? 1 : 2,
      }
    }

    case VaultState.RevisionRequested: {
      const clientCanReclaim = isExpired(ctx?.submitDeadlineSec, ctx?.nowSec)
      const isClient = role === 'client'
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'done'), step(3, 'attention'), step(4, 'todo')],
        meaningLead: 'CHANGES REQUESTED',
        meaning: isClient
          ? 'You asked for changes. The amount stays locked until a new delivery arrives.'
          : 'The client sent it back for another pass. Resubmit before the deadline or they can take the amount back.',
        meaningTone: 'action',
        financial: isClient
          ? `${A} locked — back with your contractor for another pass.`
          : `${A} locked — resubmission needed.`,
        nextStep: clientCanReclaim
          ? {
              title: 'Reclaim the payment',
              body: 'The new deadline passed with nothing resubmitted. The agreed rule lets you take the amount back.',
              ctaLabel: 'Reclaim payment',
              ctaHref: href,
            }
          : isClient
            ? {
                title: 'Wait for the new delivery',
                body: 'If the new deadline passes with nothing resubmitted, you can reclaim the amount.',
                ctaLabel: 'Open milestone',
                ctaHref: href,
              }
            : {
                title: 'Resubmit your work',
                body: 'A fresh submission restarts the review window.',
                ctaLabel: 'Resubmit work',
                ctaHref: href,
              },
        requiresMyAction: (!isClient && !clientCanReclaim) || clientCanReclaim,
        rank: clientCanReclaim ? 0 : isClient ? 2 : 1,
      }
    }

    case VaultState.Disputed: {
      const isClient = role === 'client'
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'done'), step(3, 'done'), step(4, 'attention')],
        meaningLead: 'ON HOLD',
        meaning: isClient
          ? 'You raised a problem, so the automatic release is paused. Resolve it by releasing the amount or by agreeing to stop.'
          : 'The client disputed your delivery, so the automatic release is paused. Only their approval or a joint stop can move the amount.',
        meaningTone: 'blocked',
        financial: `${A} held — release paused.`,
        nextStep: isClient
          ? {
              title: 'Resolve the disagreement',
              body: 'Release the amount if the work is acceptable, or agree a mutual stop to return it.',
              ctaLabel: 'Resolve now',
              ctaHref: href,
            }
          : {
              title: 'Respond to the dispute',
              body: 'Open the milestone to reply, agree a stop, or wait for approval.',
              ctaLabel: 'Open milestone',
              ctaHref: href,
            },
        requiresMyAction: isClient,
        rank: 1,
      }
    }

    case VaultState.Settled:
    case VaultState.SettledByTimeout: {
      const byTimeout = state === VaultState.SettledByTimeout
      return {
        ...base,
        steps: [step(1, 'done'), step(2, 'done'), step(3, 'done'), step(4, 'done')],
        meaningLead: 'PAID',
        meaning: role === 'client'
          ? byTimeout
            ? 'The review window ended with no action, so the pre-agreed rule released the amount automatically.'
            : 'The work was approved and the amount went to your contractor.'
          : byTimeout
            ? 'The client did not act inside the review window, so the pre-agreed rule released the amount to you.'
            : 'The work was approved and the amount is yours.',
        meaningTone: 'done',
        financial: role === 'client' ? `${A} released to your contractor.` : `${A} released to you.`,
        nextStep: null,
        requiresMyAction: false,
        rank: 3,
      }
    }

    case VaultState.RefundedExpired:
    case VaultState.CancelledMutual: {
      const byExpiry = state === VaultState.RefundedExpired
      const isClient = role === 'client'
      return {
        ...base,
        steps: [
          step(1, 'done'),
          step(2, 'done'),
          step(3, 'todo'),
          step(4, 'outcome', 'Returned to client'),
        ],
        meaningLead: byExpiry ? 'CLOSED — NOT PAID' : 'STOPPED BY AGREEMENT',
        meaning: byExpiry
          ? isClient
            ? 'Nothing valid was delivered in time, so the amount came back to you.'
            : 'Nothing was delivered before the deadline, so the amount went back to the client.'
          : isClient
            ? 'Both sides agreed to end it. The amount is back with you.'
            : 'Both sides agreed to end it. The amount went back to the client.',
        meaningTone: 'neutral',
        financial: isClient ? `${A} returned to you.` : `${A} returned to the client.`,
        nextStep: null,
        requiresMyAction: false,
        rank: 4,
      }
    }
  }
}

/**
 * Sorting rank for "Your Work": 0 deadline-expired (time-sensitive), 1 my
 * move, 2 waiting on the other party, 3 paid, 4 closed unpaid.
 */
export function actionRank(view: LifecycleView): number {
  return view.rank
}

/** Stable, actionable-first sort. Newest first inside the same rank. */
export function sortActionableFirst<T extends { view: LifecycleView }>(
  rows: T[],
  createdAt: (row: T) => number = () => 0,
): T[] {
  return [...rows].sort(
    (a, b) => actionRank(a.view) - actionRank(b.view) || createdAt(b) - createdAt(a),
  )
}
