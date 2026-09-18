'use client'

import { WagmiProvider, cookieStorage, createConfig, createStorage, http, injected } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { arcLocal, arcMainnet, arcTestnet } from '@/lib/chains'

const config = createConfig({
  chains: [arcMainnet, arcTestnet, arcLocal],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [arcMainnet.id]: http(),
    [arcTestnet.id]: http(),
    [arcLocal.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
      }),
  )
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
