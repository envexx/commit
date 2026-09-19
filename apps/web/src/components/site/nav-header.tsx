'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { useAccount } from 'wagmi'
import { buttonVariants } from '@/components/ui/button'
import { ConnectButton } from '@/components/site/ConnectButton'
import { BrandLockup } from '@/components/site/brand-lockup'
import { cn } from '@/lib/utils'

const NAV = [{ href: '/about', label: 'How it works' }]

export function NavHeader() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [mounted, setMounted] = useState(false)
  const lastY = useRef(0)
  const pathname = usePathname()
  const { isConnected } = useAccount()

  useEffect(() => setMounted(true), [])

  // The hide-on-scroll behaviour belongs to the marketing hero only. Once the
  // app takes over (a connected home, /create, a milestone page), the header
  // stays put so navigation is always reachable.
  const marketingPath = pathname === '/' || pathname === '/about'
  const heroMode = marketingPath && !(mounted && isConnected)

  useEffect(() => {
    if (!heroMode) {
      setHidden(false)
      return
    }
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y <= 8) setHidden(true)
      else if (y < lastY.current - 2) setHidden(false)
      else if (y > lastY.current + 2) setHidden(true)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroMode])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const hiddenNow = heroMode && hidden

  return (
    <header
      aria-hidden={hiddenNow}
      inert={hiddenNow}
      className={cn(
        'z-50 border-b border-line-light bg-canvas/85 backdrop-blur-xl transition-transform duration-300 ease-out',
        heroMode
          ? 'fixed inset-x-0 top-0'
          : 'sticky top-0 translate-y-0',
        hiddenNow ? 'pointer-events-none -translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="container-fx flex h-14 items-center justify-between gap-4">
        <Link href="/" aria-label="Home" className="flex items-center">
          <BrandLockup />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition',
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <span className={cn('mr-1.5 inline-block h-1.5 w-1.5 align-middle', active ? 'bg-brand' : 'bg-line-strong')} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <ConnectButton />

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center border border-line-light text-ink transition hover:bg-ink/[0.06] md:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/20 backdrop-blur-sm" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-y-0 right-0 z-[90] flex w-[86vw] max-w-sm flex-col gap-6 border-l border-line-light bg-canvas p-6"
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                    Menu
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close navigation"
                      className="flex h-9 w-9 items-center justify-center border border-line-light text-ink transition hover:bg-ink/[0.06]"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </Dialog.Close>
                </div>

                <nav className="flex flex-col border-t border-line-light">
                  {NAV.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'border-b border-line-light px-1 py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] transition',
                        pathname === link.href ? 'text-brand-strong' : 'text-ink hover:text-brand-strong',
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
                    Protect a payment
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
