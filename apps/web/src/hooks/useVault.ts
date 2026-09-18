'use client'

import { useReadContract } from 'wagmi'
import type { Address } from 'viem'
import { vaultAbi } from '@/lib/abi'
import { VaultState } from '@/lib/state'

export type VaultConfigData = {
  client: Address
  contractor: Address
  token: Address
  amount: bigint
  scopeHash: `0x${string}`
  metadataURI: string
  submissionPeriod: bigint
  reviewPeriod: bigint
}

export type VaultStatusData = {
  state: VaultState
  fundedAt: bigint
  submitDeadline: bigint
  submittedAt: bigint
  reviewDeadline: bigint
  evidenceHash: `0x${string}`
  evidenceURI: string
  revisionCount: number
  clientCancelProposed: boolean
  contractorCancelProposed: boolean
}

export function useVaultConfig(address?: Address) {
  const query = useReadContract({
    abi: vaultAbi,
    address,
    functionName: 'getConfig',
    query: { enabled: !!address },
  })
  return {
    config: query.data as VaultConfigData | undefined,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useVaultStatus(address?: Address) {
  const query = useReadContract({
    abi: vaultAbi,
    address,
    functionName: 'getStatus',
    query: { enabled: !!address, refetchInterval: 15_000 },
  })
  return {
    status: query.data as VaultStatusData | undefined,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useVault(address?: Address) {
  const cfg = useVaultConfig(address)
  const st = useVaultStatus(address)
  return {
    address,
    config: cfg.config,
    status: st.status,
    isLoading: cfg.isLoading || st.isLoading,
    error: cfg.error ?? st.error,
  }
}
