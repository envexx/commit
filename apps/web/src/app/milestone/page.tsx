'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isAddress, type Address } from 'viem'
import { useAccount } from 'wagmi'
import { CheckCircle2, Copy, ExternalLink, FileText, Link2, SearchX } from 'lucide-react'
import { useVault } from '@/hooks/useVault'
import { useVaultEvents } from '@/hooks/useVaultEvents'
import { VaultState, STATE_META, isTerminal } from '@/lib/state'
import { explorerAddress, explorerTx, targetChain } from '@/lib/config'
import { parseMetadataUri, periodLabel, shortAddress } from '@/lib/format'
import { loadRecords, type MilestoneRecord } from '@/lib/registry'
import { hashText } from '@/lib/format'
import { StatusBadge } from '@/components/milestone/StatusBadge'
import { Countdown } from '@/components/milestone/Countdown'
import { ActionPanel } from '@/components/milestone/ActionPanel'
import { Timeline } from '@/components/milestone/Timeline'
import { Badge } from '@/components/ui/badge'
import { CryptoAmount } from '@/components/ui/amount'
import { AvatarStack } from '@/components/ui/avatar-stack'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[11px] uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="min-w-0 break-words text-right text-sm text-ink">{children}</span>
    </div>
  )
}

function PartyLink({ address, role, you }: { address: string; role: string; you: boolean }) {
  const url = explorerAddress(address)
  return (
    <span>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="font-mono text-brand hover:underline">
          {shortAddress(address)}
        </a>
      ) : (
        <span className="font-mono">{shortAddress(address)}</span>
      )}
      <span className="ml-2 text-[11px] text-ink-muted">
        {role}
        {you && <span className="ml-1 font-semibold text-emerald-700">· you</span>}
      </span>
    </span>
  )
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line-light bg-panel p-5">
      <h2 className="label-mono">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function MilestoneDetail({ vaultAddress }: { vaultAddress: Address }) {
  const router = useRouter()
  const { address: account } = useAccount()
  const { config, status, isLoading, error } = useVault(vaultAddress)
  const { logs } = useVaultEvents(vaultAddress)
  const { toast } = useToast()
  const [record, setRecord] = useState<MilestoneRecord | null>(null)
  const [copied, setCopied] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    setRecord(
      loadRecords(targetChain.id).find((r) => r.address.toLowerCase() === vaultAddress.toLowerCase()) ?? null,
    )
  }, [vaultAddress])

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  if (isLoading) {
    return (
      <div className="container-fx py-10">
        <Skeleton className="h-40 w-full" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !config || !status) {
    return (
      <div className="container-fx py-10 md:py-14">
        <EmptyState
          className="mx-auto"
          icon={<SearchX className="h-4 w-4" />}
          title="No milestone found at this address"
          hint="check the vault address and that your wallet is on the right Arc network"
          action="Create a milestone"
          onAction={() => router.push('/create')}
        />
      </div>
    )
  }

  const meta = parseMetadataUri(config.metadataURI)
  const title = record?.title ?? meta?.title ?? null
  const scopeText = record?.scope ?? meta?.scope ?? null
  const scopeVerified = scopeText ? hashText(scopeText) === config.scopeHash : false
  const stateMeta = STATE_META[status.state]
  const addrUrl = explorerAddress(vaultAddress)
  const youAreClient = !!account && account.toLowerCase() === config.client.toLowerCase()
  const youAreContractor = !!account && account.toLowerCase() === config.contractor.toLowerCase()

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast({ tone: 'success', title: 'Link copied', description: 'Share it with the other party.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ tone: 'error', title: 'Could not copy the link' })
    }
  }

  return (
    <div className="container-fx py-10 md:py-14">
      <div className={cn('border p-6 md:p-8', stateMeta.banner)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-mono opacity-70">
              Verified on Arc · read straight from the chain
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge state={status.state} size="lg" />
              {title && (
                <h1 className="font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
              )}
            </div>
          </div>
          <CryptoAmount
            value={Number(config.amount) / 1_000_000}
            symbol="USDC"
            dp={2}
            className="font-mono text-2xl font-bold md:text-3xl"
          />
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-80">{stateMeta.desc}</p>
        <div className="mt-5 flex items-center gap-3">
          <AvatarStack names={['Client', 'Contractor']} max={2} />
          <span className="text-xs opacity-70">client · contractor</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ActionPanel vaultAddress={vaultAddress} config={config} status={status} account={account} />

          <section className="border border-line-light bg-panel p-6">
            <h2 className="label-mono mb-4">
              Activity timeline
            </h2>
            <Timeline logs={logs} clientAddr={config.client} contractorAddr={config.contractor} />
          </section>
        </div>

        <aside className="space-y-4">
          <SidePanel title="Details">
            <div className="divide-y divide-line-light">
              <Row label="Client">
                <PartyLink address={config.client} role="client" you={youAreClient} />
              </Row>
              <Row label="Contractor">
                <PartyLink address={config.contractor} role="contractor" you={youAreContractor} />
              </Row>
              <Row label="Vault">
                {addrUrl ? (
                  <a
                    href={addrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                  >
                    {shortAddress(vaultAddress)}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <span className="font-mono text-xs">{shortAddress(vaultAddress)}</span>
                )}
              </Row>
              {status.fundedAt > 0n &&
                (() => {
                  const fundingTx = logs.find((l) => l.eventName === 'MilestoneFunded')?.transactionHash
                  if (!fundingTx) return null
                  const txUrl = explorerTx(fundingTx)
                  return (
                    <Row label="Funding transaction">
                      {txUrl ? (
                        <a
                          href={txUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                        >
                          {shortAddress(fundingTx)}
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : (
                        <span className="font-mono text-xs">{shortAddress(fundingTx)}</span>
                      )}
                    </Row>
                  )
                })()}
              <Row label="Work deadline">
                {status.state === VaultState.Created ? (
                  <span className="text-ink-muted">{periodLabel(config.submissionPeriod)} after funding</span>
                ) : (
                  <Countdown deadlineSec={status.submitDeadline} />
                )}
              </Row>
              <Row label="Review window">{periodLabel(config.reviewPeriod)}</Row>
              <Row label="Review ends">
                <Countdown deadlineSec={status.reviewDeadline} />
              </Row>
              <Row label="Revisions">{status.revisionCount}</Row>
            </div>
          </SidePanel>

          <SidePanel title="Scope">
            <div className="flex items-center justify-between gap-2">
              {scopeVerified ? (
                <Badge tone="success">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  hash verified
                </Badge>
              ) : (
                <Badge tone="neutral">hash onchain</Badge>
              )}
            </div>
            {scopeText ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{scopeText}</p>
            ) : (
              <p className="mt-3 break-all font-mono text-[11px] text-ink-muted">{config.metadataURI}</p>
            )}
            <p className="mt-3 break-all font-mono text-[10px] text-ink-muted">scopeHash: {config.scopeHash}</p>
          </SidePanel>

          {status.evidenceURI && (
            <div className="border border-amber-500/30 bg-amber-50 p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                Submitted evidence
              </h2>
              <a
                href={status.evidenceURI}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-start gap-2 break-all text-sm text-brand hover:underline"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {status.evidenceURI}
              </a>
              <p className="mt-2 break-all font-mono text-[10px] text-ink-muted">
                {hashText(status.evidenceURI) === status.evidenceHash ? 'hash verified ✓ ' : ''}
                evidenceHash: {status.evidenceHash}
              </p>
              {!isTerminal(status.state) && status.submittedAt > 0n && (
                <p className="mt-2 text-xs text-ink-muted">
                  Submitted {new Date(Number(status.submittedAt) * 1000).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <SidePanel title="Share">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
              <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Send this page to the other party. State is read straight from the chain — no account needed
              and no backend that can lie about the money.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </SidePanel>
        </aside>
      </div>
    </div>
  )
}

function MilestoneView() {
  const router = useRouter()
  const params = useSearchParams()
  const raw = params.get('address') ?? ''

  if (!isAddress(raw)) {
    return (
      <div className="container-fx py-10 md:py-14">
        <EmptyState
          className="mx-auto"
          icon={<SearchX className="h-4 w-4" />}
          title="Open a milestone by its vault address"
          hint="every share link looks like /milestone?address=0x…"
          action="Create a milestone"
          onAction={() => router.push('/create')}
        />
      </div>
    )
  }

  return <MilestoneDetail vaultAddress={raw as Address} />
}

export default function MilestonePage() {
  return (
    <Suspense
      fallback={
        <div className="container-fx py-10">
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <MilestoneView />
    </Suspense>
  )
}
