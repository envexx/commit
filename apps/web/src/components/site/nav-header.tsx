'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { ButtonLink, buttonVariants } from '@/components/ui/button'
import { ConnectButton } from '@/components/ConnectButton'
import { BrandLockup } from '@/components/site/brand-lockup'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/milestones', label: 'My milestones' },
  { href: '/about', label: 'About' },
]

export function NavHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-line-light bg-white/90 backdrop-blur-xl">
      <div className="container-fx flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Home" className="flex items-center">
          <BrandLockup />
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition',
                    active ? 'bg-brand/10 text-brand-strong' : 'text-ink-muted hover:bg-zinc-50 hover:text-ink',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <ButtonLink href="/create" size="sm" arrow className="hidden sm:inline-flex">
            New milestone
          </ButtonLink>
          <ConnectButton />

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line-light text-ink transition hover:bg-zinc-50 md:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/20 backdrop-blur-sm" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 right-0 z-[90] flex w-[86vw] max-w-sm flex-col gap-6 border-l border-line-light bg-white p-6 shadow-card-light"
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-sm font-bold text-ink">Menu</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close navigation"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line-light text-ink transition hover:bg-zinc-50"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <nav className="flex flex-col gap-1">
                  {NAV.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm font-medium transition',
                        pathname === link.href
                          ? 'bg-brand/10 text-brand-strong'
                          : 'text-ink hover:bg-zinc-50',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto">
                  <Link
                    href="/create"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ className: 'w-full' })}
                  >
                    New milestone
                  </Link>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  )
}
