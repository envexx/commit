'use client'

import { useState } from 'react'
import { erc20Abi, zeroAddress } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import { vaultAbi } from '@/lib/abi'
import { useTx } from '@/hooks/useTx'
import { useToast } from '@/components/ui/toast'
import { VaultState, isTerminal } from '@/lib/state'
import { formatUsdc, hashText, periodLabel } from '@/lib/format'
import { TxButton, TxError, TxLink } from './TxButton'
import { Countdown } from './Countdown'
import type { VaultConfigData, VaultStatusData } from '@/hooks/useVault'
import { cn } from '@/lib/utils'

type Hash = `0x${string}`

const same = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase()

function Panel({
  title,
  tone,
  children,
}: {
  title: string
  tone?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('border border-line-light bg-panel p-6', tone)}>
      <h3 className="label-mono mb-4">{title}</h3>
      {children}
    </section>
  )
}

function Note({ children, tone = 'text-ink-muted' }: { children: React.ReactNode; tone?: string }) {
  return <p className={cn('mt-3 text-xs leading-relaxed', tone)}>{children}</p>
}

function SubmitWorkForm({
  run,
  busy,
  vaultAddress,
  label,
}: {
  run: (key: string, send: () => Promise<Hash>, successTitle?: string) => Promise<boolean>
  busy: string | null
  vaultAddress: Hash
  label: string
}) {
  const [url, setUrl] = useState('')
  const { writeContractAsync } = useWriteContract()

  const valid = /^https?:\/\/\S+$/i.test(url.trim())
  const evidenceHash = valid ? hashText(url.trim()) : null

  const submit = () =>
    run(
      'submit',
      () =>
        writeContractAsync({
          abi: vaultAbi,
          address: vaultAddress,
          functionName: 'submitWork',
          args: [evidenceHash!, url.trim()],
        }),
      'Work submitted onchain',
    )

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-muted">Deliverable URL (required)</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/you/repo/pull/1"
          className="field"
        />
      </div>
      {evidenceHash && (
        <p className="break-all font-mono text-[11px] text-ink-muted">
          evidence hash: <span className="text-ink-muted">{evidenceHash}</span>
        </p>
      )}
      <TxButton onClick={submit} pending={busy === 'submit'} disabled={!valid}>
        {label}
      </TxButton>
      <Note>
        Submitting starts the client review window. The URL and its hash are stored onchain and become the
        permanent evidence record.
      </Note>
    </div>
  )
}

function RevisionForm({
  run,
  busy,
  vaultAddress,
}: {
  run: (key: string, send: () => Promise<Hash>, successTitle?: string) => Promise<boolean>
  busy: string | null
  vaultAddress: Hash
}) {
  const [reason, setReason] = useState('')
  const { writeContractAsync } = useWriteContract()

  const request = () =>
    run(
      'revise',
      () =>
        writeContractAsync({
          abi: vaultAbi,
          address: vaultAddress,
          functionName: 'requestRevision',
          args: [hashText(reason.trim() || 'revision requested')],
        }),
      'Revision requested onchain',
    )

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-muted">What needs to change?</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Nav is broken on mobile; please fix and resubmit."
          className="field"
        />
      </div>
      <TxButton onClick={request} pending={busy === 'revise'} variant="outline">
        Request revision
      </TxButton>
      <Note>
        Returns the milestone to the contractor with a fresh submission window. Money does not move.
      </Note>
    </div>
  )
}

export function ActionPanel({
  vaultAddress,
  config,
  status,
  account,
}: {
  vaultAddress: Hash
  config: VaultConfigData
  status: VaultStatusData
  account?: Hash
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const tx = useTx()
  const { toast } = useToast()
  const { writeContractAsync } = useWriteContract()

  const run = async (
    key: string,
    send: () => Promise<Hash>,
    successTitle = 'Confirmed onchain',
  ): Promise<boolean> => {
    setBusy(key)
    try {
      const result = await tx.execute(send)
      if (result.ok) {
        toast({ tone: 'success', title: successTitle })
      } else {
        toast({ tone: 'error', title: 'Transaction failed', description: result.error ?? undefined })
      }
      return result.ok
    } finally {
      setBusy(null)
    }
  }

  const isClient = same(account, config.client)
  const isContractor = same(account, config.contractor)
  const nowSec = Math.floor(Date.now() / 1000)

  const vaultAction = (
    key: string,
    functionName:
      | 'fundMilestone'
      | 'acknowledgeStart'
      | 'approveAndRelease'
      | 'dispute'
      | 'claimAfterReview'
      | 'refundExpired'
      | 'proposeMutualCancel',
    successTitle?: string,
  ) =>
    run(
      key,
      () => writeContractAsync({ abi: vaultAbi, address: vaultAddress, functionName }),
      successTitle,
    )

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    address: config.token,
    functionName: 'allowance',
    args: [account ?? zeroAddress, vaultAddress],
    query: { enabled: !!account && isClient && status.state === VaultState.Created },
  })

  const { data: clientBalance } = useReadContract({
    abi: erc20Abi,
    address: config.token,
    functionName: 'balanceOf',
    args: [account ?? zeroAddress],
    query: { enabled: !!account && isClient && status.state === VaultState.Created },
  })

  if (!account) {
    return (
      <Panel title="Actions">
        <p className="text-sm text-ink-muted">Connect a wallet to interact with this milestone.</p>
      </Panel>
    )
  }

  if (!isClient && !isContractor) {
    return (
      <Panel title="Actions">
        <p className="text-sm leading-relaxed text-ink-muted">
          You are a third-party observer of this milestone. After a valid submission and review-window
          expiry, the timeout release becomes callable by anyone — funds always go to the contractor.
        </p>
        {status.state === VaultState.Submitted && BigInt(status.reviewDeadline) <= BigInt(nowSec) && (
          <div className="mt-4">
            <TxButton
              onClick={() => vaultAction('claim', 'claimAfterReview', 'Timeout release executed')}
              pending={busy === 'claim'}
            >
              Execute timeout release
            </TxButton>
          </div>
        )}
        <TxError error={tx.error} />
        <TxLink hash={tx.txHash} />
      </Panel>
    )
  }

  const role = isClient ? 'client' : 'contractor'
  const canRefund =
    isClient &&
    [VaultState.Funded, VaultState.Active, VaultState.RevisionRequested].includes(status.state) &&
    BigInt(status.submitDeadline) < BigInt(nowSec)
  const canMutualCancel = [
    VaultState.Funded,
    VaultState.Active,
    VaultState.RevisionRequested,
    VaultState.Disputed,
  ].includes(status.state)
  const otherProposedCancel = isClient ? status.contractorCancelProposed : status.clientCancelProposed
  const iProposedCancel = isClient ? status.clientCancelProposed : status.contractorCancelProposed

  const fundSection =
    status.state === VaultState.Created && isClient ? (
      <Panel title="Fund this milestone" tone="border-brand/40">
        <p className="mb-4 text-sm leading-relaxed text-ink">
          Commit <span className="font-semibold text-ink">{formatUsdc(config.amount)} USDC</span> to the
          vault. Nothing moves until you approve and fund.
        </p>
        {clientBalance !== undefined && (
          <p className="mb-4 text-xs text-ink-muted">
            Your USDC balance: {formatUsdc(clientBalance)}
            {clientBalance < config.amount && (
              <span className="ml-2 text-rose-600">insufficient for this milestone</span>
            )}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <TxButton
            variant="outline"
            pending={busy === 'approve'}
            disabled={!!allowance && allowance >= config.amount}
            onClick={() =>
              run(
                'approve',
                () =>
                  writeContractAsync({
                    abi: erc20Abi,
                    address: config.token,
                    functionName: 'approve',
                    args: [vaultAddress, config.amount],
                  }),
                'USDC approved',
              )
            }
          >
            {allowance && allowance >= config.amount ? 'USDC approved ✓' : '1. Approve USDC'}
          </TxButton>
          <TxButton
            variant="success"
            pending={busy === 'fund'}
            disabled={!allowance || allowance < config.amount}
            onClick={() => vaultAction('fund', 'fundMilestone', 'Milestone funded — money is committed')}
          >
            2. Fund milestone
          </TxButton>
        </div>
        <TxError error={tx.error} />
        <TxLink hash={tx.txHash} />
        <Note>
          The vault can only ever move exactly {formatUsdc(config.amount)} USDC — the amount is immutable
          after creation and release goes only to the contractor wallet or back to you.
        </Note>
      </Panel>
    ) : status.state === VaultState.Created && isContractor ? (
      <Panel title="Waiting for funding" tone="border-rose-500/40">
        <p className="text-sm font-semibold text-rose-700">Do not start work yet.</p>
        <Note>
          This milestone is <span className="font-semibold text-ink">unfunded</span>. Per the core rule
          of this product: no verified funds, no work. Ask the client to fund the milestone — this page
          will show FUNDED with onchain proof once they do.
        </Note>
      </Panel>
    ) : null

  const contractorSection =
    (status.state === VaultState.Funded || status.state === VaultState.Active) && isContractor ? (
      <Panel title="Your move as contractor">
        <div className="space-y-4">
          {status.state === VaultState.Funded && (
            <div>
              <TxButton
                variant="outline"
                pending={busy === 'ack'}
                onClick={() => vaultAction('ack', 'acknowledgeStart', 'Start acknowledged')}
              >
                Acknowledge start
              </TxButton>
              <Note>Optional onchain signal that work has begun. Not required before submitting.</Note>
            </div>
          )}
          <div className="border-t border-line-light pt-4">
            <SubmitWorkForm run={run} busy={busy} vaultAddress={vaultAddress} label="Submit work" />
          </div>
        </div>
        <TxError error={tx.error} />
        <TxLink hash={tx.txHash} />
      </Panel>
    ) : status.state === VaultState.RevisionRequested && isContractor ? (
      <Panel title="Resubmit your work" tone="border-violet-500/40">
        <p className="mb-4 text-sm leading-relaxed text-ink">
          The client requested changes. Resubmit before the deadline or the client can reclaim the funds.
        </p>
        <SubmitWorkForm run={run} busy={busy} vaultAddress={vaultAddress} label="Resubmit work" />
        <TxError error={tx.error} />
        <TxLink hash={tx.txHash} />
      </Panel>
    ) : null

  const reviewSection =
    status.state === VaultState.Submitted ? (
      BigInt(status.reviewDeadline) > BigInt(nowSec) ? (
        <Panel
          title={isClient ? 'Review the submitted work' : 'Waiting for client review'}
          tone={isClient ? 'border-amber-500/40' : undefined}
        >
          {isClient ? (
            <div className="space-y-4">
              <TxButton
                variant="success"
                pending={busy === 'release'}
                onClick={() => vaultAction('release', 'approveAndRelease', 'Work approved — USDC released')}
              >
                Approve & release {formatUsdc(config.amount)} USDC
              </TxButton>
              <div className="border-t border-line-light pt-4">
                <RevisionForm run={run} busy={busy} vaultAddress={vaultAddress} />
              </div>
              <div className="border-t border-line-light pt-4">
                <TxButton
                  variant="danger"
                  pending={busy === 'dispute'}
                  onClick={() => vaultAction('dispute', 'dispute', 'Dispute raised — timeout paused')}
                >
                  Raise dispute
                </TxButton>
                <Note tone="text-rose-700">
                  Pauses the timeout release. In V1 a dispute is only resolved by your approval or a mutual
                  cancel — there is no third-party arbitration. The other party is shown this limitation
                  before funding.
                </Note>
              </div>
              <TxError error={tx.error} />
              <TxLink hash={tx.txHash} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink">
              Evidence is in. Review window ends <Countdown deadlineSec={status.reviewDeadline} />. If the
              client takes no action, you can release the funds yourself when it expires.
            </p>
          )}
        </Panel>
      ) : (
        <Panel title="Review window expired" tone="border-emerald-500/40">
          <p className="mb-4 text-sm leading-relaxed text-ink">
            The pre-agreed review window has passed. The contractor can now execute the timeout release —
            funds go to the contractor wallet. This action is permissionless.
          </p>
          <TxButton
            variant="success"
            pending={busy === 'claim'}
            onClick={() => vaultAction('claim', 'claimAfterReview', 'Timeout release executed')}
          >
            Execute timeout release
          </TxButton>
          <TxError error={tx.error} />
          <TxLink hash={tx.txHash} />
        </Panel>
      )
    ) : null

  const disputeSection =
    status.state === VaultState.Disputed ? (
      <Panel title="Disputed — funds are held under the agreed rules" tone="border-rose-500/40">
        {isClient ? (
          <div className="space-y-4">
            <TxButton
              variant="success"
              pending={busy === 'release'}
              onClick={() => vaultAction('release', 'approveAndRelease', 'Work approved — USDC released')}
            >
              Approve & release {formatUsdc(config.amount)} USDC
            </TxButton>
            <Note>
              Or resolve by mutual cancellation below (requires the contractor to agree). No automatic
              release can happen while disputed.
            </Note>
            <TxError error={tx.error} />
            <TxLink hash={tx.txHash} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-ink">
            The client disputed your submission. Your options: agree to a mutual cancellation below, or
            wait for the client to approve. V1 has no third-party arbitration — this limitation was
            disclosed to both parties before funding.
          </p>
        )}
      </Panel>
    ) : null

  const sharedSection = !isTerminal(status.state) ? (
    <Panel title="Exits & safety rules">
      <div className="space-y-4">
        {canRefund && (
          <div>
            <TxButton
              variant="danger"
              pending={busy === 'refund'}
              onClick={() => vaultAction('refund', 'refundExpired', 'Refund executed — USDC returned')}
            >
              Reclaim {formatUsdc(config.amount)} USDC (deadline expired)
            </TxButton>
            <Note>The submission deadline passed with no live submission. Funds return to you.</Note>
          </div>
        )}
        {canMutualCancel && (
          <div className="border-t border-line-light pt-4">
            {otherProposedCancel ? (
              <>
                <TxButton
                  variant="danger"
                  pending={busy === 'cancel'}
                  onClick={() =>
                    vaultAction('cancel', 'proposeMutualCancel', 'Mutual cancellation executed — refunded')
                  }
                >
                  Accept mutual cancellation — refund {role === 'client' ? 'you' : 'the client'}
                </TxButton>
                <Note>The other party proposed cancellation. Your signature executes the refund.</Note>
              </>
            ) : iProposedCancel ? (
              <p className="text-sm text-ink-muted">
                You proposed cancellation. Waiting for the other party to agree — nothing moves until both
                sign.
              </p>
            ) : (
              <>
                <TxButton
                  variant="outline"
                  pending={busy === 'cancel'}
                  onClick={() =>
                    vaultAction('cancel', 'proposeMutualCancel', 'Cancellation proposed — waiting for the other party')
                  }
                >
                  Propose mutual cancellation
                </TxButton>
                <Note>Needs both parties. Refunds the client in full; the record stays onchain forever.</Note>
              </>
            )}
          </div>
        )}
        <div className="space-y-1.5 border-t border-line-light pt-4 text-xs leading-relaxed text-ink-muted">
          <p>
            <span className="font-semibold text-ink-muted">Client inactive?</span> After a valid submission,
            the contractor releases via the review-window timeout ({periodLabel(config.reviewPeriod)}).
          </p>
          <p>
            <span className="font-semibold text-ink-muted">Contractor inactive?</span> The client reclaims
            after the submission deadline ({periodLabel(config.submissionPeriod)}).
          </p>
          <p>
            <span className="font-semibold text-ink-muted">Disagreement?</span> Dispute pauses the timeout;
            resolution is approval or mutual cancel (V1 scope).
          </p>
        </div>
        <TxError error={tx.error} />
        <TxLink hash={tx.txHash} />
      </div>
    </Panel>
  ) : null

  const terminalSection = isTerminal(status.state) ? (
    <Panel
      title="Milestone closed"
      tone={
        status.state === VaultState.Settled || status.state === VaultState.SettledByTimeout
          ? 'border-emerald-500/30'
          : 'border-line-light'
      }
    >
      <p className="text-sm leading-relaxed text-ink">
        {status.state === VaultState.Settled || status.state === VaultState.SettledByTimeout
          ? `Settled. ${formatUsdc(config.amount)} USDC released to the contractor.`
          : `Closed. ${formatUsdc(config.amount)} USDC returned to the client.`}
      </p>
      <Note>All terminal states are final onchain. See the activity timeline for transaction proof.</Note>
    </Panel>
  ) : null

  return (
    <div className="space-y-4">
      {fundSection}
      {contractorSection}
      {reviewSection}
      {disputeSection}
      {terminalSection}
      {sharedSection}
    </div>
  )
}
