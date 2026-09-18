export enum VaultState {
  Created = 0,
  Funded = 1,
  Active = 2,
  Submitted = 3,
  RevisionRequested = 4,
  Disputed = 5,
  Settled = 6,
  SettledByTimeout = 7,
  RefundedExpired = 8,
  CancelledMutual = 9,
}

export const STATE_META: Record<
  VaultState,
  { label: string; badge: string; banner: string; desc: string }
> = {
  [VaultState.Created]: {
    label: 'UNFUNDED',
    badge: 'border-zinc-300 bg-zinc-100 text-zinc-600',
    banner: 'border-line-light bg-zinc-50 text-ink',
    desc: 'Milestone created but no USDC committed yet. Work must not start.',
  },
  [VaultState.Funded]: {
    label: 'FUNDED',
    badge: 'border-brand/40 bg-brand/10 text-brand-strong',
    banner: 'border-brand/40 bg-brand/[0.05] text-ink',
    desc: 'USDC is committed in the vault. Contractor can start work.',
  },
  [VaultState.Active]: {
    label: 'FUNDED · IN PROGRESS',
    badge: 'border-orange-500/40 bg-orange-50 text-orange-700',
    banner: 'border-orange-500/30 bg-orange-50 text-ink',
    desc: 'Contractor acknowledged the start. USDC remains committed.',
  },
  [VaultState.Submitted]: {
    label: 'WORK SUBMITTED · IN REVIEW',
    badge: 'border-amber-500/40 bg-amber-50 text-amber-700',
    banner: 'border-amber-500/30 bg-amber-50 text-ink',
    desc: 'Evidence submitted. The review window is running.',
  },
  [VaultState.RevisionRequested]: {
    label: 'REVISION REQUESTED',
    badge: 'border-violet-500/40 bg-violet-50 text-violet-700',
    banner: 'border-violet-500/30 bg-violet-50 text-ink',
    desc: 'The client asked for changes. The contractor must resubmit before the new deadline.',
  },
  [VaultState.Disputed]: {
    label: 'DISPUTED',
    badge: 'border-rose-500/40 bg-rose-50 text-rose-700',
    banner: 'border-rose-500/30 bg-rose-50 text-ink',
    desc: 'The client disputed the submission. Timeout release is paused; funds move only by approval or mutual cancel.',
  },
  [VaultState.Settled]: {
    label: 'SETTLED',
    badge: 'border-emerald-500/40 bg-emerald-50 text-emerald-700',
    banner: 'border-emerald-500/30 bg-emerald-50 text-ink',
    desc: 'The client approved the work. USDC has been released to the contractor.',
  },
  [VaultState.SettledByTimeout]: {
    label: 'SETTLED BY TIMEOUT',
    badge: 'border-emerald-500/40 bg-emerald-50 text-emerald-700',
    banner: 'border-emerald-500/30 bg-emerald-50 text-ink',
    desc: 'The review window expired without action. USDC released to the contractor per the pre-agreed rule.',
  },
  [VaultState.RefundedExpired]: {
    label: 'REFUNDED (EXPIRED)',
    badge: 'border-teal-500/40 bg-teal-50 text-teal-700',
    banner: 'border-teal-500/30 bg-teal-50 text-ink',
    desc: 'No valid submission before the deadline. USDC returned to the client.',
  },
  [VaultState.CancelledMutual]: {
    label: 'CANCELLED (MUTUAL)',
    badge: 'border-zinc-300 bg-zinc-100 text-zinc-600',
    banner: 'border-line-light bg-zinc-50 text-ink',
    desc: 'Both parties agreed to cancel. USDC returned to the client.',
  },
}

export const isTerminal = (state: VaultState) => state >= VaultState.Settled
