import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { ToastProvider } from '@/components/ui/toast'
import { NavHeader } from '@/components/site/nav-header'
import { SiteFooter } from '@/components/site/site-footer'
import { NetworkBanner } from '@/components/NetworkBanner'
import { SITE } from '@/lib/site'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    'Pre-funded USDC milestones on Arc. The money exists before the work starts; release follows agreed rules, not promises.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-white text-ink">
        <Providers>
          <ToastProvider>
            <NavHeader />
            <NetworkBanner />
            <main>{children}</main>
            <SiteFooter />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
