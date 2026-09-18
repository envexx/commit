'use client'

import type { RefObject } from 'react'
import { KeyRound } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { OpenSharedMilestoneForm } from '@/components/work/OpenSharedMilestoneForm'

/**
 * "What do you want to do?" — the two entry points. A wallet can be a client
 * on one milestone and the contractor on another, so this is an intent, not
 * a permanent role.
 */
export function RoleIntentCards({
  openInputRef,
}: {
  openInputRef?: RefObject<HTMLInputElement | null>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col rounded-3xl border border-brand/30 bg-brand/[0.04] p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-strong">
          I&rsquo;m hiring someone
        </p>
        <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
          Protect a new payment
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Create the milestone, secure the USDC, then share it with your
          contractor. The money is provably there before work starts.
        </p>
        <div className="mt-5">
          <ButtonLink href="/create" size="sm" arrow>
            Protect a payment
          </ButtonLink>
        </div>
      </div>

      <div className="flex flex-col rounded-3xl border border-line-light bg-white p-7">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          I&rsquo;m doing the work
        </p>
        <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
          Check if my payment is secured
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Open the milestone from your client and verify the money exists
          before starting. Never begin unfunded work.
        </p>
        <div className="mt-5">
          <OpenSharedMilestoneForm inputRef={openInputRef} />
        </div>
      </div>
    </div>
  )
}
