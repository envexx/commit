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
      <div className="flex flex-col border border-brand/40 bg-brand/[0.05] p-7">
        <p className="label-mono flex items-center gap-2 text-brand-strong">
          <span className="inline-block h-1.5 w-1.5 bg-brand" />
          I&rsquo;m hiring someone
        </p>
        <h2 className="heading-retro mt-4 text-xl font-bold text-ink">
          Protect a new payment
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Create the milestone, secure the USDC, then share it with your
          contractor. The money is provably there before work starts.
        </p>
        <div className="mt-6">
          <ButtonLink href="/create" size="sm" arrow>
            Protect a payment
          </ButtonLink>
        </div>
      </div>

      <div className="flex flex-col border border-line-light bg-panel p-7">
        <p className="label-mono flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          I&rsquo;m doing the work
        </p>
        <h2 className="heading-retro mt-4 text-xl font-bold text-ink">
          Check if my payment is secured
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Open the milestone from your client and verify the money exists
          before starting. Never begin unfunded work.
        </p>
        <div className="mt-6">
          <OpenSharedMilestoneForm inputRef={openInputRef} />
        </div>
      </div>
    </div>
  )
}
