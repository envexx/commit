import Link from 'next/link'
import { EXTERNAL, SITE } from '@/lib/site'
import { BrandLockup } from '@/components/site/brand-lockup'
import { chainLabel, targetChain } from '@/lib/config'

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/' },
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
    <footer className="relative mt-24 border-t border-line-light bg-canvas">
      <div className="container-fx">
        <div className="grid border-x border-line-light md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="border-b border-line-light p-6 md:border-b-0 md:border-r md:p-8">
            <BrandLockup />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
              {SITE.tagline} A pre-funded USDC milestone vault on Arc — the money exists before work
              starts, and the agreed rules settle it for both sides.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-wide text-ink-muted">
              Prototype. Not a licensed escrow service. No operator keys can move user funds.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div
              key={column.title}
              className="border-b border-line-light p-6 md:border-b-0 md:border-r md:p-8 last:md:border-r-0"
            >
              <p className="label-mono">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-ink-muted transition hover:text-brand-strong"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition hover:text-brand-strong"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line-light">
        <div className="container-fx flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-muted sm:flex-row">
          <p className="font-mono uppercase tracking-wide">© 2026 {SITE.name}</p>
          <p className="font-mono uppercase tracking-wide">
            {chainLabel} · chain {targetChain.id} · USDC settled
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-brand" />
    </footer>
  )
}
