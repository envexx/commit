'use client'

import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { vaultAbi } from '@/lib/abi'

export type TimelineLog = {
  eventName: string
  args: Record<string, unknown>
  blockNumber: bigint
  transactionHash: `0x${string}` | null
}

const STEP = 4_999n
const MAX_CHUNKS = 80

async function fetchVaultLogs(client: NonNullable<ReturnType<typeof usePublicClient>>, address: Address) {
  const head = await client.getBlockNumber()
  const collected: TimelineLog[] = []
  let to = head
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const from = to > STEP ? to - STEP : 0n
    const page = await client.getContractEvents({ address, abi: vaultAbi, fromBlock: from, toBlock: to })
    for (const log of page) {
      collected.push({
        eventName: (log as { eventName?: string }).eventName ?? 'Unknown',
        args: ((log as { args?: Record<string, unknown> }).args ?? {}) as Record<string, unknown>,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash ?? null,
      })
    }
    const sawFunding = collected.some((l) => l.eventName === 'MilestoneFunded')
    if (from === 0n || sawFunding) break
    to = from - 1n
  }
  return collected.sort((a, b) => (a.blockNumber >= b.blockNumber ? -1 : 1))
}

export function useVaultEvents(address?: Address) {
  const client = usePublicClient()
  const query = useQuery({
    queryKey: ['vault-events', client?.chain?.id, address],
    queryFn: () => fetchVaultLogs(client!, address!),
    enabled: !!client && !!address,
    refetchInterval: 15_000,
  })
  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
  }
}
