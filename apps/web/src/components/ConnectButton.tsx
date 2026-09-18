'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { LogOut, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { shortAddress } from '@/lib/format'

export function ConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => setMounted(true), [])

  if (!mounted) return <Skeleton className="h-9 w-28 rounded-full" />

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 rounded-full border border-line-light bg-white px-3.5 py-2 font-mono text-xs text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {shortAddress(address)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
          className="px-3"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    )
  }

  const injectedConnector = connectors.find((c) => c.id === 'injected') ?? connectors[0]

  return (
    <Button
      size="sm"
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={!injectedConnector}
      loading={isPending}
    >
      <Wallet className="h-4 w-4" aria-hidden />
      Connect
    </Button>
  )
}
