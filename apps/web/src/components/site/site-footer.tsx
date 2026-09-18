import Link from 'next/link'
import { EXTERNAL, SITE } from '@/lib/site'
import { BrandGlyph } from '@/components/site/brand-lockup'
import { chainLabel, targetChain } from '@/lib/config'

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/' },
      { label: 'Create a milestone', href: '/create' },
      { label: 'Open a shared link', href: '/milestone' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Arc documentation', href: EXTERNAL.arcDocs, external: true },
      { label: 'Arc explorer', href: EXTERNAL.arcExplorer, external: true },
      { label: 'Arc community', href: EXTERNAL.arcCommunity, external: true },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'What V1 does not promise', href: '/about#limits' },
      { label: 'Settlement rules', href: '/about#how' },
      { label: 'Non-custodial model', href: '/about#limits' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line-light bg-zinc-50">
      <div className="container-fx grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandGlyph />
            <span className="font-display text-sm font-bold tracking-tight text-ink">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            {SITE.tagline} A pre-funded USDC milestone vault on Arc — the money exists before the work
            starts, and agreed rules settle it.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Prototype. Not a licensed escrow service. No operator keys can move user funds.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ink-muted transition hover:text-brand"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-sm text-ink-muted transition hover:text-brand">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line-light">
        <div className="container-fx flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
          <p>Â© 2026 {SITE.name}</p>
          <p className="font-mono">
            {chainLabel} · chain {targetChain.id} · USDC settled
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
    </footer>
  )
}
