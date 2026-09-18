'use client'

import Link from 'next/link'
import {
  siFarcaster,
  siGithub,
  siX,
} from 'simple-icons'
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  Boxes,
  Coins,
  ExternalLink,
  FileCheck2,
  Landmark,
  Lock,
  Scale,
  ShieldCheck,
  Timer,
  Wallet,
} from 'lucide-react'
import { GlowRibbon } from '@/components/fx/fx'
import { Reveal } from '@/components/fx/reveal'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BrowserWindow } from '@/components/ui/mock-browser-window'
import { ScreenShuffle } from '@/components/ui/screen-shuffle'
import { OnboardingChecklist } from '@/components/ui/onboarding-checklist'
import { SOCIALS, EXTERNAL } from '@/lib/site'
import { cn } from '@/lib/utils'

const SOCIAL_ICONS: Record<string, { path: string; title: string }> = {
  GitHub: siGithub,
  'X / Twitter': siX,
  Farcaster: siFarcaster,
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  dark = false,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  dark?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em]', dark ? 'text-brand' : 'text-brand-strong')}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl',
          dark ? 'text-zinc-50' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-4 text-base leading-relaxed', dark ? 'text-zinc-400' : 'text-ink-muted')}>
          {description}
        </p>
      )}
    </div>
  )
}

function SocialCard({ name, url, note }: { name: string; url: string | null; note?: string }) {
  const icon = SOCIAL_ICONS[name]
  const inner = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line-dark bg-white/[0.03] text-zinc-200 transition group-hover:border-brand/50 group-hover:text-brand">
        {icon ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d={icon.path} />
          </svg>
        ) : (
          <ExternalLink className="h-5 w-5" aria-hidden />
        )}
      </span>
      <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
        {name}
        {!url && <Badge tone="outline" className="px-2 py-0.5 text-[10px]">soon</Badge>}
      </span>
      <span className="mt-1 text-xs text-zinc-500">{url ? 'Open profile' : note ?? 'Link coming'}</span>
    </>
  )

  if (!url) {
    return (
      <div className="group flex cursor-default flex-col rounded-2xl border border-line-dark bg-white/[0.02] p-5">
        {inner}
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl border border-line-dark bg-white/[0.02] p-5 transition hover:-translate-y-1 hover:border-brand/40"
    >
      {inner}
    </a>
  )
}

const TICKER = [
  { icon: Coins, title: '0% platform fee', meta: 'USDC goes straight through' },
  { icon: Boxes, title: 'One vault per milestone', meta: 'Isolated, auditable accounting' },
  { icon: Timer, title: '<1s settlement finality', meta: 'Arc mainnet · chain 5042' },
  { icon: ShieldCheck, title: 'Rule-bound vault', meta: 'No operator keys, no seizure' },
]

const VALUE_POINTS = [
  { icon: ShieldCheck, title: 'Payment assurance, not just transfers', body: 'The committed amount is provably locked before work begins.' },
  { icon: Timer, title: 'Deterministic exits', body: 'Review timeout for the contractor, deadline refund for the client.' },
  { icon: Scale, title: 'Rules before conflict', body: 'Amount, parties, deadlines and review window are immutably fixed at creation.' },
  { icon: Lock, title: 'No custody by us', body: 'Funds live in a contract vault controlled only by encoded rules.' },
]

const STACK_META = [
  { name: 'Arc', body: 'USDC-native gas, sub-second finality, EVM equivalent.', icon: Landmark },
  { name: 'Circle USDC', body: 'Settles through the native ERC-20 interface on Arc.', icon: Coins },
  { name: 'Foundry / EVM', body: '74 contract tests, no upgradeability, no admin backdoor.', icon: BadgeCheck },
  { name: 'Wallets', body: 'MetaMask, Rabby, Coinbase Wallet, Rainbow.', icon: Wallet },
]

export function NarrativeLanding() {
  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden border-b border-line-dark bg-base">
        <GlowRibbon />
        <div className="container-fx relative flex min-h-[78vh] flex-col justify-center py-24 md:py-32">
          <Reveal>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Pre-funded USDC milestones · Arc mainnet
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              <span className="text-zinc-500">Never start </span>
              <span className="text-zinc-50">unfunded work</span>
              <span className="text-zinc-500"> again.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              An invoice records a debt after the work. A funded milestone proves the money exists before
              it — committed onchain, released by agreed rules, never by promises.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink
                href="/create"
                size="lg"
                arrow
                className="text-xs font-bold uppercase tracking-[0.14em]"
              >
                Create a milestone
              </ButtonLink>
              <ButtonLink
                href="/about#how"
                variant="outline"
                size="lg"
                className="text-xs font-bold uppercase tracking-[0.14em]"
              >
                How settlement works
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-gray section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Arc at a glance"
            title="Money that carries a condition"
            description="Stablecoins solved how digital dollars move. This is what a digital dollar does when it stays committed until a milestone is submitted and accepted."
            align="center"
          />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {TICKER.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="group flex h-full flex-col rounded-2xl border border-line-light bg-white p-5 transition duration-200 hover:-translate-y-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-strong">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{item.meta}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Core guarantee"
            title="The two promises this product enforces"
            description="One rule for each side of the agreement, written into the vault before anyone starts working."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-1">
              <div className="flex h-full flex-col justify-between rounded-3xl bg-brand p-7 text-white shadow-stack-2">
                <div>
                  <Badge className="border-white/30 bg-white/15 text-white">Contractor</Badge>
                  <h3 className="mt-5 font-display text-2xl font-bold leading-snug">
                    Do not start work until the money exists.
                  </h3>
                </div>
                <p className="mt-8 text-sm leading-relaxed text-white/85">
                  Open the shared link, read the vault balance onchain, and start only when the state says
                  FUNDED. No unfunded milestones, no unpaid assessments.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="lg:col-span-2">
              <Card tone="light" className="flex h-full flex-col justify-between p-7">
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
                    <FileCheck2 className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
                    Do not release money until the work is submitted.
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                    The client commits the amount without paying it. The vault holds it, the contractor can
                    prove it, and release happens only against a submitted deliverable — or by a review
                    window the client pre-agreed to.
                  </p>
                </div>
                <div className="mt-8 overflow-hidden rounded-2xl border border-line-light">
                  {[
                    ['Vault balance', 'amount committed'],
                    ['Scope', 'keccak256 commitment'],
                    ['Release rule', 'approval · review timeout'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-line-light bg-surface-gray/60 px-4 py-3 last:border-b-0"
                    >
                      <span className="text-xs uppercase tracking-wide text-ink-muted">{k}</span>
                      <span className="font-mono text-xs text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card tone="light" className="h-full p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand-strong">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">
                  Release follows agreed rules, not promises.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Client approval releases instantly. If the client goes silent after a valid submission,
                  the pre-agreed review window ends in a deterministic release. If the contractor never
                  submits, the client reclaims after the deadline.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.15}>
              <div id="security" className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#0A0A0B] p-7 shadow-stack-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                  <Ban className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-zinc-50">
                  A disagreement cannot silently drain the vault.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Raising a dispute pauses the timeout release. In V1 a dispute ends only by client
                  approval or a bilateral mutual cancel. No administrator, no platform key, no seizure
                  function exists in the contract.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white pb-16 md:pb-24">
        <div className="container-fx">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-surface-deep p-8 md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
              <div className="relative grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">Process</p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                    Why Arc Milestone Assurance?
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
                    One primitive, three irreversible steps. Money is committed, work is proven, and
                    settlement is executed by code — every step a verifiable transaction on Arc.
                  </p>
                  <div className="mt-8">
                    <ButtonLink href="/create" arrow>
                      Create a milestone
                    </ButtonLink>
                  </div>
                  <div className="mt-8 rounded-2xl border border-line-dark bg-white/[0.02] p-5">
                    <OnboardingChecklist
                      title="A milestone, step by step"
                      className="w-full max-w-[320px]"
                      initiallyDone={['fund']}
                      steps={[
                        { id: 'fund', label: 'Client commits USDC to the vault' },
                        { id: 'prove', label: 'Contractor submits evidence onchain' },
                        { id: 'settle', label: 'Agreed rules release the USDC' },
                      ]}
                    />
                  </div>
                </div>

                <ol className="relative space-y-8 border-l border-white/10 pl-8">
                  <span className="absolute left-[-1px] top-2 h-[70%] w-0.5 bg-gradient-to-b from-brand to-transparent" />
                  {[
                    { step: 'Commit', tag: 'FUNDED', body: 'The client deploys a milestone vault and moves the exact USDC amount into it. Immutable amount, parties and deadlines.' },
                    { step: 'Prove', tag: 'SUBMITTED', body: 'The contractor submits the deliverable URL and its hash onchain. The review clock starts, deterministic from the chain timestamp.' },
                    { step: 'Settle', tag: 'SETTLED', body: 'Approval or review-window timeout releases USDC to the contractor. No submission before the deadline refunds the client.' },
                  ].map((node, i) => (
                    <li key={node.step} className="relative">
                      <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full bg-brand shadow-glow" />
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-zinc-500">0{i + 1}</span>
                        <h3 className="font-display text-lg font-bold text-zinc-50">{node.step}</h3>
                        <Badge tone="brand">{node.tag}</Badge>
                      </div>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-400">{node.body}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative mt-12 flex justify-center">
                <ScreenShuffle
                  caption="funded → review → settled"
                  screens={[
                    { id: 'funded', grad: 'linear-gradient(135deg, #3a2412 0%, #201709 55%, var(--surface) 100%)', tint: 'rgba(255,119,0,0.55)' },
                    { id: 'review', grad: 'linear-gradient(135deg, #3a2f12 0%, #1f1909 55%, var(--surface) 100%)', tint: 'rgba(232,180,90,0.5)' },
                    { id: 'settled', grad: 'linear-gradient(135deg, #123a33 0%, #0c1f1d 55%, var(--surface) 100%)', tint: 'rgba(52,194,138,0.5)' },
                  ]}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="limits" className="bg-surface-gray section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Honest boundaries"
            title="What V1 does not promise"
            description="Assurance is narrow on purpose. These limits are shown to both parties before funding — never buried."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: 'Work quality stays human',
                body: 'The vault guarantees funding and settlement rules, not that the deliverable is objectively good.',
              },
              {
                icon: Scale,
                title: 'No third-party arbitration',
                body: 'A dispute freezes the timeout. V1 resolves it by approval or mutual cancel, nothing else.',
              },
              {
                icon: Landmark,
                title: 'Not a licensed escrow',
                body: 'Descriptive language only: pre-funded milestone, conditional payment, rule-bound vault.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="h-full rounded-3xl border border-line-light bg-white p-7 transition duration-200 hover:-translate-y-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-gray text-ink">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white section-y">
        <div className="container-fx grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Capability matrix"
                title="Built for work that already has a client"
                description="No marketplace, no discovery, no reputation game. Just the payment commitment around an agreement you already made."
              />
              <ul className="mt-8 space-y-5">
                {VALUE_POINTS.map((point) => (
                  <li key={point.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-strong">
                      <point.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{point.title}</p>
                      <p className="mt-1 text-sm text-ink-muted">{point.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STACK_META.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.05}>
                <div className="group h-full rounded-2xl border border-line-light bg-surface-gray/60 p-5 transition duration-200 hover:-translate-y-1 hover:bg-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink shadow-sm">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-base font-bold text-ink">{item.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-gray section-y">
        <div className="container-fx">
          <Reveal>
            <div className="grid gap-10 rounded-3xl border border-line-light bg-surface-gray/60 p-8 md:grid-cols-2 md:items-center md:p-12">
              <div className="relative h-[340px] w-full">
                <BrowserWindow
                  variant="chrome"
                  headerStyle="full"
                  showNavButtons
                  showActions
                  url="assurance.app/milestone?address=0x7a3f…1c2e"
                >
                  <div className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        settled
                      </span>
                      <span className="font-mono text-base font-bold text-foreground">1,250.00 USDC</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Landing page build — February</p>
                    <div className="space-y-2.5">
                      {[
                        ['Client', 'funds committed before work'],
                        ['Contractor', 'evidence submitted onchain'],
                        ['Settlement', 'approved and released'],
                      ].map(([k, v], i) => (
                        <div key={k} className="flex items-center gap-3">
                          <span
                            className={cn(
                              'grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold',
                              i < 3 ? 'bg-emerald-500 text-white' : 'bg-foreground/10 text-foreground/50',
                            )}
                          >
                            ✓
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground/85">{k}</p>
                            <p className="text-[11px] text-foreground/45">{v}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-foreground/[0.07] pt-3 font-mono text-[10px] text-foreground/40">
                      0x7a3f…1c2e · funded → submitted → settled
                    </div>
                  </div>
                </BrowserWindow>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-strong">Spotlight</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                  Every state change leaves a verifiable transaction.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  Funding, submission, revision, dispute, release and refunds are all onchain events with
                  a transaction hash, visible from the shared milestone link. The UI reads the vault
                  directly — there is no backend that can lie about the money.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/create" arrow>
                    Create a milestone
                  </ButtonLink>
                  <ButtonLink href={EXTERNAL.arcExplorer} external variant="outlineLight">
                    Verify on Arc explorer
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-base pt-16 md:pt-24">
        <div className="container-fx">
          <Reveal>
            <div className="rounded-2xl border border-line-dark bg-surface p-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">Community</p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
                Build in the open
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                The contract, the app and the deployment evidence are published for the Arc microgrant
                submission. Follow along or reach out.
              </p>
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {SOCIALS.map((social) => (
                  <SocialCard key={social.name} {...social} />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                <Link href="/create" className="inline-flex items-center gap-1 transition hover:text-brand">
                  Create a milestone <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link href="/milestones" className="transition hover:text-brand">
                  My milestones
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
