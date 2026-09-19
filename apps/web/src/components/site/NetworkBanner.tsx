'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { targetChain } from '@/lib/config'

export function NetworkBanner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || chainId === targetChain.id) return null

  return (
    <div className="border-b border-rose-500/30 bg-rose-500/10">
      <div className="container-fx flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="flex items-center gap-2 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Wrong network. This app settles on <span className="font-semibold">{targetChain.name}</span>.
        </p>
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => switchChain({ chainId: targetChain.id })}
        >
          Switch network
        </Button>
      </div>
    </div>
  )
}
