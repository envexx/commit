import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/providers'
import { ToastProvider } from '@/components/ui/toast'
import { NavHeader } from '@/components/site/nav-header'
import { SiteFooter } from '@/components/site/site-footer'
import { NetworkBanner } from '@/components/site/NetworkBanner'
import { SITE } from '@/lib/site'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = localFont({
  src: [
    { path: './fonts/GcEpicProDemoThin-xR0JR.ttf', weight: '100', style: 'normal' },
    { path: './fonts/GcEpicProDemoExtraLight-aYjO9.ttf', weight: '200', style: 'normal' },
    { path: './fonts/GcEpicProDemoLight-E4jYl.ttf', weight: '300', style: 'normal' },
    { path: './fonts/GcEpicProDemoRegular-Zpj8K.ttf', weight: '400', style: 'normal' },
    { path: './fonts/GcEpicProDemoMedium-OGjP3.ttf', weight: '500', style: 'normal' },
    { path: './fonts/GcEpicProDemoSemiBold-3l7qz.ttf', weight: '600', style: 'normal' },
    { path: './fonts/GcEpicProDemoBold-e9ROB.ttf', weight: '700', style: 'normal' },
    { path: './fonts/GcEpicProDemoExtraBold-Wpjev.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    'Pre-funded USDC milestones on Arc. The money exists before the work starts; release follows agreed rules, not promises.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-canvas text-ink">
        <Providers>
          <ToastProvider>
            <NavHeader />
            <NetworkBanner />
            <main className="bg-grid-retro">{children}</main>
            <SiteFooter />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
