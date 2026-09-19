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
import { Reveal } from '@/components/fx/reveal'
import { ScrollSequenceHero } from '@/components/marketing/scroll-sequence-hero'
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
      <p
        className={cn(
          'label-mono flex items-center gap-2',
          align === 'center' && 'justify-center',
          dark ? 'text-brand' : 'text-brand-strong',
        )}
      >
        <span className="inline-block h-1.5 w-1.5 bg-brand" />
        {eyebrow}
      </p>
      <h2 className={cn('heading-retro mt-4 text-3xl font-bold sm:text-4xl', dark ? 'text-zinc-50' : 'text-ink')}>
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
      <span className="flex h-11 w-11 items-center justify-center border border-line-light bg-canvas text-ink transition group-hover:border-brand group-hover:text-brand-strong">
        {icon ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d={icon.path} />
          </svg>
        ) : (
          <ExternalLink className="h-5 w-5" aria-hidden />
        )}
      </span>
      <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
        {name}
        {!url && <Badge tone="outline" className="px-2 py-0.5 text-[10px]">soon</Badge>}
      </span>
      <span className="mt-1 text-xs text-ink-muted">{url ? 'Open profile' : note ?? 'Link coming'}</span>
    </>
  )

  if (!url) {
    return (
      <div className="group flex cursor-default flex-col border border-line-light bg-panel p-5">
        {inner}
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col border border-line-light bg-panel p-5 transition hover:shadow-hard-sm"
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
      <ScrollSequenceHero
        className="border-b border-line-light"
        scenes={[
          <p
            key="eyebrow"
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-brand"
          >
            Pre-funded USDC milestones · Arc Mainnet
          </p>,
          <h1
            key="headline"
            className="heading-retro mt-5 text-4xl font-bold text-zinc-50 sm:text-5xl md:text-6xl lg:text-[4.5rem]"
          >
            <span className="text-zinc-50">Work funded.</span>
            <span className="text-zinc-400"> Payment proven.</span>
          </h1>,
          <p key="sub" className="mt-6 max-w-xl text-base leading-relaxed text-zinc-200/90 sm:text-lg">
            Funds are locked before work begins and released only when proof meets the agreed terms. No
            promises. Just verifiable execution.
          </p>,
          <div key="cta" className="mt-9 flex flex-wrap items-center gap-3">
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
              variant="outlineLight"
              size="lg"
              className="text-xs font-bold uppercase tracking-[0.14em]"
            >
              How settlement works
            </ButtonLink>
          </div>,
        ]}
      />

      <section className="bg-grid-retro border-b border-line-light bg-canvas section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Arc at a glance"
            title="Money that carries a condition"
            description="Stablecoins solved how digital dollars move. This is what a digital dollar does when it stays committed until a milestone is submitted and accepted."
            align="center"
          />
          <div className="mt-10 grid grid-cols-1 border-l border-t border-line-light sm:grid-cols-2 md:grid-cols-4">
            {TICKER.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className="group flex h-full flex-col border-b border-r border-line-light bg-panel p-5 transition duration-200 hover:bg-canvas">
                  <p className="label-mono">0{i + 1}</p>
                  <span className="mt-4 flex h-10 w-10 items-center justify-center border border-line-light bg-brand/10 text-brand-strong">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{item.meta}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-grid-retro border-b border-line-light bg-canvas section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Core guarantee"
            title="One rule for each side, written before work starts"
            description="The contractor never starts unfunded. The client never pays unproven. Both promises live in the same vault, and neither side can move the money alone."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-1">
              <div className="flex h-full flex-col justify-between border border-brand bg-brand p-7 text-white">
                <div>
                  <Badge className="border-white/40 bg-white/15 text-white">Contractor</Badge>
                  <h3 className="heading-retro mt-5 text-2xl font-bold">
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
                  <span className="flex h-11 w-11 items-center justify-center border border-line-light bg-ink text-white">
                    <FileCheck2 className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="heading-retro mt-5 text-2xl font-bold text-ink">
                    Do not release money until the work is submitted.
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                    The client commits the amount without paying it. The vault holds it, the contractor can
                    prove it, and release happens only against a submitted deliverable — or by a review
                    window the client pre-agreed to.
                  </p>
                </div>
                <div className="mt-8 border border-line-light">
                  {[
                    ['Vault balance', 'amount committed'],
                    ['Scope', 'keccak256 commitment'],
                    ['Release rule', 'approval · review timeout'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-line-light bg-canvas px-4 py-3 last:border-b-0"
                    >
                      <span className="label-mono">{k}</span>
                      <span className="font-mono text-xs text-ink">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card tone="light" className="h-full p-7">
                <span className="flex h-11 w-11 items-center justify-center border border-line-light bg-brand/10 text-brand-strong">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="heading-retro mt-5 text-xl font-bold text-ink">
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
              <div id="security" className="flex h-full flex-col border border-line-light bg-panel p-7">
                <span className="flex h-11 w-11 items-center justify-center border border-line-light bg-brand/10 text-brand-strong">
                  <Ban className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="heading-retro mt-5 text-xl font-bold text-ink">
                  A disagreement cannot silently drain the vault.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Raising a dispute pauses the timeout release. In V1 a dispute ends only by client
                  approval or a bilateral mutual cancel. No administrator, no platform key, no seizure
                  function exists in the contract.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="how" className="bg-grid-retro border-b border-line-light bg-canvas pb-16 md:pb-24">
        <div className="container-fx">
          <Reveal>
            <div className="relative border border-line-light bg-panel p-8 md:p-12">
              <div className="relative grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
                <div>
                  <p className="label-mono text-brand">Process</p>
                  <h2 className="heading-retro mt-3 text-3xl font-bold text-ink sm:text-4xl">
                    Why Commit?
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                    One primitive, three irreversible steps. Money is committed, work is proven, and
                    settlement is executed by code — every step a verifiable transaction on Arc.
                  </p>
                  <div className="mt-8">
                    <ButtonLink href="/create" arrow>
                      Create a milestone
                    </ButtonLink>
                  </div>
                  <div className="mt-8 border border-line-light bg-canvas p-5">
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

                <ol className="relative space-y-8 border-l border-line-light pl-8">
                  <span className="absolute left-[-1px] top-2 h-[70%] w-px bg-brand" />
                  {[
                    { step: 'Commit', tag: 'FUNDED', body: 'The client deploys a milestone vault and moves the exact USDC amount into it. Immutable amount, parties and deadlines.' },
                    { step: 'Prove', tag: 'SUBMITTED', body: 'The contractor submits the deliverable URL and its hash onchain. The review clock starts, deterministic from the chain timestamp.' },
                    { step: 'Settle', tag: 'SETTLED', body: 'Approval or review-window timeout releases USDC to the contractor. No submission before the deadline refunds the client.' },
                  ].map((node, i) => (
                    <li key={node.step} className="relative">
                      <span className="absolute -left-[41px] top-1.5 h-3 w-3 border border-brand bg-panel" />
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-ink-muted">0{i + 1}</span>
                        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                          {node.step}
                        </h3>
                        <Badge tone="brand">{node.tag}</Badge>
                      </div>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">{node.body}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative mt-12 flex justify-center">
                <ScreenShuffle
                  caption="funded → review → settled"
                  screens={[
                    { id: 'funded', grad: 'linear-gradient(135deg, #3a2412 0%, #201709 55%, #efece6 100%)', tint: 'rgba(255,119,0,0.55)' },
                    { id: 'review', grad: 'linear-gradient(135deg, #3a2f12 0%, #1f1909 55%, #efece6 100%)', tint: 'rgba(232,180,90,0.5)' },
                    { id: 'settled', grad: 'linear-gradient(135deg, #123a33 0%, #0c1f1d 55%, #efece6 100%)', tint: 'rgba(52,194,138,0.5)' },
                  ]}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="limits" className="bg-grid-retro border-b border-line-light bg-canvas section-y">
        <div className="container-fx">
          <SectionHeading
            eyebrow="Honest boundaries"
            title="What V1 does not promise"
            description="Commit is narrow on purpose. These limits are shown to both parties before funding — never buried."
            align="center"
          />
          <div className="mt-10 grid border-l border-t border-line-light md:grid-cols-3">
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
                <div className="h-full border-b border-r border-line-light bg-panel p-7 transition duration-200 hover:bg-canvas">
                  <span className="flex h-11 w-11 items-center justify-center border border-line-light bg-canvas text-ink">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="heading-retro mt-5 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-grid-retro border-b border-line-light bg-canvas section-y">
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
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-line-light bg-brand/10 text-brand-strong">
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

          <div className="grid grid-cols-1 border-l border-t border-line-light sm:grid-cols-2">
            {STACK_META.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.05}>
                <div className="group h-full border-b border-r border-line-light bg-panel p-5 transition duration-200 hover:bg-canvas">
                  <span className="flex h-10 w-10 items-center justify-center border border-line-light bg-canvas text-ink">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-base font-bold uppercase tracking-wide text-ink">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-grid-retro border-b border-line-light bg-canvas section-y">
        <div className="container-fx">
          <Reveal>
            <div className="grid border border-line-light bg-panel md:grid-cols-2 md:items-center">
              <div className="relative h-[340px] w-full border-b border-line-light md:border-b-0 md:border-r">
                <BrowserWindow
                  variant="chrome"
                  headerStyle="full"
                  showNavButtons
                  showActions
                  url="commit.app/milestone?address=0x7a3f…1c2e"
                >
                  <div className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="border border-emerald-600/40 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
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
                              'grid h-5 w-5 place-items-center text-[10px] font-bold',
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

              <div className="p-8 md:p-12">
                <p className="label-mono text-brand-strong">Spotlight</p>
                <h2 className="heading-retro mt-3 text-3xl font-bold text-ink">
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

      <section className="bg-grid-retro bg-canvas pt-16 md:pt-24">
        <div className="container-fx">
          <Reveal>
            <div className="border border-line-light bg-panel p-8 text-center md:p-12">
              <p className="label-mono justify-center text-brand">Community</p>
              <h2 className="heading-retro mx-auto mt-3 text-2xl font-bold text-ink sm:text-3xl">
                Build in the open
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                The contract, the app and the deployment evidence are published for the Arc microgrant
                submission. Follow along or reach out.
              </p>
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {SOCIALS.map((social) => (
                  <SocialCard key={social.name} {...social} />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-xs uppercase tracking-wide text-ink-muted">
                <Link href="/create" className="inline-flex items-center gap-1 transition hover:text-brand-strong">
                  Create a milestone <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link href="/milestones" className="transition hover:text-brand-strong">
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
