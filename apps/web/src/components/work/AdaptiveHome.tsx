'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { NarrativeLanding } from '@/components/marketing/narrative-landing'
import { WorkHome } from '@/components/work/WorkHome'

/**
 * Disconnected (and pre-mount, so the prerendered export matches): the
 * product narrative. Connected: the payment workflow home. Accepted
 * trade-off: a connected user sees the narrative for one frame before the
 * gate flips — same mounted-gate pattern the dashboard used.
 */
export function AdaptiveHome() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()

  if (!mounted || !isConnected || !address) return <NarrativeLanding />
  return <WorkHome address={address} />
}
