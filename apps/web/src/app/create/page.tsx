'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { decodeEventLog, erc20Abi, isAddress, parseUnits, type Address } from 'viem'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { AlertTriangle, CheckCircle2, Rocket, ShieldCheck } from 'lucide-react'
import { factoryAbi, vaultAbi } from '@/lib/abi'
import { FACTORY_ADDRESS, USDC_ADDRESS, explorerTx, isConfigured, targetChain } from '@/lib/config'
import { buildMetadataUri, hashText } from '@/lib/format'
import { formatUsdc, periodLabel, shortAddress } from '@/lib/format'
import {
  saveRecord,
  loadCreateDraft,
  saveCreateDraft,
  clearCreateDraft,
} from '@/lib/registry'
import { useTx } from '@/hooks/useTx'
import { useToast } from '@/components/ui/toast'
import { TxButton, TxError, TxLink } from '@/components/milestone/TxButton'
import { Badge } from '@/components/ui/badge'
import { SegmentedControl } from '@/components/ui/segmented-control'

type Hash = `0x${string}`
type Step = 'form' | 'created'

const REVIEW_OPTIONS = [3, 7, 14]

export default function CreatePage() {
  const router = useRouter()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const { toast } = useToast()
  const tx = useTx()

  const configured = isConfigured()

  const [contractor, setContractor] = useState('')
  const [title, setTitle] = useState('')
  const [scope, setScope] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [submitDays, setSubmitDays] = useState(7)
  const [reviewDays, setReviewDays] = useState(7)

  const [step, setStep] = useState<Step>('form')
  const [vaultAddress, setVaultAddress] = useState<Hash | null>(null)
  const [createTx, setCreateTx] = useState<Hash | null>(null)
  const [history, setHistory] = useState<{ label: string; hash: Hash }[]>([])
  const [resumed, setResumed] = useState(false)
  const stepPanelRef = useRef<HTMLDivElement | null>(null)
  const restoredRef = useRef(false)
  const completedRef = useRef(false)

  const chainId = publicClient?.chain?.id ?? targetChain.id

  const addHistory = (label: string, hash: Hash) =>
    setHistory((prev) => (prev.some((h) => h.hash === hash) ? prev : [...prev, { label, hash }]))

  const resetCreate = () => {
    if (address) clearCreateDraft(chainId, address)
    completedRef.current = false
    setStep('form')
    setVaultAddress(null)
    setCreateTx(null)
    setHistory([])
    setResumed(false)
    tx.reset()
  }

  // Reload safety: a deployed-but-unfunded vault resumes at the top-up step
  // instead of vanishing when the tab is refreshed.
  useEffect(() => {
    if (restoredRef.current || !address) return
    restoredRef.current = true
    const draft = loadCreateDraft(chainId, address)
    if (draft?.vaultAddress) {
      setVaultAddress(draft.vaultAddress as Hash)
      setCreateTx((draft.createTx as Hash | null) ?? null)
      setHistory(
        draft.history.map((h) => ({ label: h.label, hash: h.hash as Hash })).slice(0, 20),
      )
      setStep('created')
      setResumed(true)
    }
  }, [address, chainId])

  // Persist every step so the record outlives the component.
  useEffect(() => {
    if (!address || !vaultAddress || completedRef.current) return
    saveCreateDraft(chainId, address, {
      vaultAddress,
      createTx,
      history: history.map((h) => ({ label: h.label, hash: h.hash })),
    })
  }, [address, chainId, vaultAddress, createTx, history])

  const amount = useMemo(() => {
    try {
      const v = parseUnits(amountInput || '0', 6)
      return v > 0n ? v : null
    } catch {
      return null
    }
  }, [amountInput])

  const contractorValid = isAddress(contractor)
  const selfContractor =
    contractorValid && address !== undefined && contractor.toLowerCase() === address.toLowerCase()
  const formValid =
    contractorValid && !selfContractor && title.trim().length > 0 && scope.trim().length > 0 && amount !== null

  const scopeHash = useMemo(() => (scope.trim() ? hashText(scope.trim()) : null), [scope])
  const metadataUri = useMemo(
    () =>
      title.trim() && scope.trim()
        ? buildMetadataUri({ version: 1, title: title.trim(), scope: scope.trim(), createdAt: Date.now() })
        : null,
    [title, scope],
  )

  const create = async () => {
    if (!address || !amount || !scopeHash || !metadataUri || !publicClient) return
    const result = await tx.execute(
      () =>
        writeContractAsync({
          abi: factoryAbi,
          address: FACTORY_ADDRESS,
          functionName: 'createMilestone',
          args: [
            contractor as Address,
            USDC_ADDRESS,
            amount,
            scopeHash,
            metadataUri,
            BigInt(submitDays) * 86400n,
            BigInt(reviewDays) * 86400n,
          ],
        }),
      {
        onConfirmed: async (hash) => {
          setCreateTx(hash)
          addHistory('Milestone vault deployed', hash)
          const receipt = await publicClient.getTransactionReceipt({ hash })
          let vault: Hash | null = null
          for (const log of receipt.logs) {
            try {
              const ev = decodeEventLog({ abi: factoryAbi, data: log.data, topics: log.topics })
              if (ev.eventName === 'MilestoneCreated') {
                vault = (ev.args as { vault: Hash }).vault
                break
              }
            } catch {
              continue
            }
          }
          if (!vault) return
          setVaultAddress(vault)
          saveRecord({
            address: vault,
            chainId: publicClient.chain.id,
            client: address,
            contractor: contractor.toLowerCase(),
            title: title.trim(),
            scope: scope.trim(),
            amountDisplay: amountInput,
            createdAt: Date.now(),
          })
          setStep('created')
          setTimeout(() => stepPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
        },
      },
    )
    if (result.ok) {
      toast({ tone: 'success', title: 'Vault deployed', description: 'Now approve and fund the USDC.' })
    } else {
      toast({ tone: 'error', title: 'Could not create milestone', description: result.error ?? undefined })
    }
  }

  const approve = async () => {
    if (!vaultAddress || !amount) return
    const result = await tx.execute(() =>
      writeContractAsync({
        abi: erc20Abi,
        address: USDC_ADDRESS,
        functionName: 'approve',
        args: [vaultAddress, amount],
      }),
    )
    if (result.ok) {
      if (result.hash) addHistory('USDC approved', result.hash)
      toast({ tone: 'success', title: 'USDC approved', description: 'Fund the milestone next.' })
    } else {
      toast({ tone: 'error', title: 'Approval failed', description: result.error ?? undefined })
    }
  }

  const fund = async () => {
    if (!vaultAddress) return
    const result = await tx.execute(() =>
      writeContractAsync({ abi: vaultAbi, address: vaultAddress, functionName: 'fundMilestone' }),
    )
    if (result.ok) {
      if (result.hash) addHistory('Milestone funded', result.hash)
      completedRef.current = true
      if (address) clearCreateDraft(chainId, address)
      toast({ tone: 'success', title: 'Milestone funded', description: 'The money is committed onchain.' })
      router.push(`/milestone?address=${vaultAddress}`)
    } else {
      toast({ tone: 'error', title: 'Funding failed', description: result.error ?? undefined })
    }
  }

  const inputClass = 'field'

  const summaryRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-xs uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  )

  return (
      <div className="container-fx py-10 md:py-14">
      <div className="max-w-2xl">
        <p className="label-mono flex items-center gap-2 text-brand-strong">
          <span className="inline-block h-1.5 w-1.5 bg-brand" />
          Client flow
        </p>
        <h1 className="heading-retro mt-4 text-3xl font-bold text-ink sm:text-4xl">
          Create a funded milestone
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          You are the client. The vault locks your USDC until the agreed rules fire — nothing is paid out
          on creation.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {!configured && (
            <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                Contracts are not configured for this network yet. Set{' '}
                <code className="font-mono">NEXT_PUBLIC_FACTORY_ADDRESS</code> and{' '}
                <code className="font-mono">NEXT_PUBLIC_USDC_ADDRESS</code>, then rebuild.
              </p>
            </div>
          )}

          {!address && (
            <div className="border border-line-light bg-panel p-4 text-sm text-ink">
              Connect a wallet to create a milestone.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Contractor wallet</label>
            <input
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder="0x…"
              disabled={step !== 'form'}
              className={`${inputClass} font-mono`}
            />
            {contractor.length > 0 && !contractorValid && (
              <p className="mt-1 text-xs text-rose-600">Not a valid address.</p>
            )}
            {selfContractor && (
              <p className="mt-1 text-xs text-rose-600">Contractor must differ from your wallet.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Milestone title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Landing page build — February"
              disabled={step !== 'form'}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Scope / success criteria
              <span className="ml-2 text-xs font-normal text-ink-muted">hashed onchain as the commitment</span>
            </label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={4}
              placeholder="Ship the landing page: hero, pricing, FAQ. Acceptance: deployed URL passes Lighthouse > 90 and client review."
              disabled={step !== 'form'}
              className={inputClass}
            />
            {scopeHash && step === 'form' && (
              <p className="mt-1 break-all font-mono text-[11px] text-ink-muted">scope hash: {scopeHash}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Amount (USDC)</label>
              <input
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                inputMode="decimal"
                placeholder="500"
                disabled={step !== 'form'}
                className={inputClass}
              />
              {amountInput && !amount && <p className="mt-1 text-xs text-rose-600">Invalid amount.</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Work deadline</label>
              <select
                value={submitDays}
                onChange={(e) => setSubmitDays(Number(e.target.value))}
                disabled={step !== 'form'}
                className={inputClass}
              >
                {[7, 14, 21, 30, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Review window</label>
              <SegmentedControl
                options={REVIEW_OPTIONS.map((d) => `${d}d`)}
                value={`${reviewDays}d`}
                onChange={(v) => setReviewDays(Number(v.replace('d', '')))}
              />
              <p className="mt-1.5 text-[11px] text-ink-muted">after a submission, no client action releases to contractor</p>
            </div>
          </div>

          {step === 'form' ? (
            <div className="border border-line-light bg-panel p-6">
              <TxButton onClick={create} pending={tx.pending} disabled={!formValid || !address || !configured} arrow>
                <Rocket className="h-4 w-4" aria-hidden />
                Create milestone — deploy vault
              </TxButton>
              <TxError error={tx.error} />
              <TxLink hash={tx.txHash} />
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                Two transactions total: this one deploys the milestone vault, the next approves and moves
                the USDC. Arc gas is paid in USDC — fractions of a cent.
              </p>
            </div>
          ) : (
            <div ref={stepPanelRef} className="space-y-5 border border-emerald-500/30 bg-emerald-500/[0.06] p-6">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Vault deployed
                </p>
                {vaultAddress && (
                  <p className="mt-2 break-all font-mono text-[11px] text-ink-muted">
                    vault: {vaultAddress}{' '}
                    <Link href={`/milestone?address=${vaultAddress}`} className="text-brand hover:underline">
                      open →
                    </Link>
                  </p>
                )}
                {createTx && explorerTx(createTx) && (
                  <a
                    href={explorerTx(createTx)!}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-mono text-[11px] text-brand hover:underline"
                  >
                    creation transaction →
                  </a>
                )}
              </div>
              {resumed && (
                <p className="border border-brand/30 bg-brand/[0.05] px-3 py-2 text-xs leading-relaxed text-ink">
                  Resumed from your last visit. This vault is deployed and still waiting for the top-up —
                  nothing was lost.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <TxButton variant="outline" pending={tx.pending} onClick={approve}>
                  2. Approve USDC
                </TxButton>
                <TxButton variant="success" pending={tx.pending} onClick={fund}>
                  3. Fund milestone
                </TxButton>
              </div>
              <TxError error={tx.error} />
              <TxLink hash={tx.txHash} />
              <p className="text-xs leading-relaxed text-ink-muted">
                Until step 3 completes the milestone stays{' '}
                <span className="font-semibold text-ink">UNFUNDED</span> — the contractor is warned not
                to start. This step is saved, so a refresh resumes right here.
              </p>
              <button
                type="button"
                onClick={resetCreate}
                className="font-mono text-[11px] uppercase tracking-wide text-ink-muted underline-offset-4 transition hover:text-brand hover:underline"
              >
                Start over with a new milestone
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border border-line-light bg-panel p-5">
            <p className="label-mono flex items-center gap-2">
              <Rocket className="h-3.5 w-3.5 text-brand" aria-hidden />
              Transaction history
            </p>
            {history.length === 0 ? (
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                Every step writes a transaction on Arc. Each hash appears here as you go: deploy the
                vault, approve USDC, then fund the milestone.
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {history.map((entry) => {
                  const url = explorerTx(entry.hash)
                  return (
                    <li key={entry.hash} className="border-l-2 border-brand/50 pl-3">
                      <p className="text-xs font-semibold text-ink">{entry.label}</p>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-brand hover:underline"
                        >
                          view on explorer →
                        </a>
                      ) : (
                        <span className="mt-0.5 block break-all font-mono text-[10px] text-ink-muted">
                          {entry.hash}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          <div className="border border-line-light bg-panel p-5">
            <p className="label-mono">Summary</p>
            <div className="mt-3 divide-y divide-line-light">
              {summaryRow('Client (you)', address ? shortAddress(address) : '—')}
              {summaryRow('Contractor', contractorValid ? shortAddress(contractor) : '—')}
              {summaryRow('Amount', amount ? `${formatUsdc(amount)} USDC` : '—')}
              {summaryRow('Work deadline', `${submitDays} days after funding`)}
              {summaryRow('Review window', periodLabel(BigInt(reviewDays) * 86400n))}
            </div>
          </div>

          <div className="border border-line-light bg-panel p-5">
            <p className="label-mono flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              Agreed rules
            </p>
            <ul className="mt-3 space-y-3 text-xs leading-relaxed text-ink-muted">
              <li>
                <span className="font-semibold text-ink">You go silent?</span> If the contractor
                submits valid work and you do nothing for {reviewDays} days, they can release the funds.
              </li>
              <li>
                <span className="font-semibold text-ink">They go silent?</span> Nothing submitted
                within {submitDays} days of funding and you reclaim the full amount.
              </li>
              <li>
                <span className="font-semibold text-ink">You disagree?</span> A dispute pauses the
                timeout; V1 resolves it by your approval or mutual cancellation.
              </li>
              <li>
                Amount and parties are immutable after creation. Mutual cancel always needs both
                signatures.
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="brand">0% fee</Badge>
              <Badge tone="neutral">non-custodial</Badge>
              <Badge tone="neutral">onchain proof</Badge>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
