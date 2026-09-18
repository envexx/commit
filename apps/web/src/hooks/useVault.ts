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

// getConfig/getStatus declare multiple flat ABI outputs, so viem decodes the
// result as a positional array — the raw data must never be cast straight to
// the object types above. Mapping order is coupled to the outputs order in
// src/lib/abi.ts; update both together.
export function parseVaultConfig(raw: unknown): VaultConfigData | undefined {
  if (!Array.isArray(raw) || raw.length !== 8) return undefined
  return {
    client: raw[0] as Address,
    contractor: raw[1] as Address,
    token: raw[2] as Address,
    amount: raw[3] as bigint,
    scopeHash: raw[4] as `0x${string}`,
    metadataURI: raw[5] as string,
    submissionPeriod: raw[6] as bigint,
    reviewPeriod: raw[7] as bigint,
  }
}

export function parseVaultStatus(raw: unknown): VaultStatusData | undefined {
  if (!Array.isArray(raw) || raw.length !== 10) return undefined
  const state = Number(raw[0])
  if (!Number.isInteger(state) || state < 0 || state > 9) return undefined
  return {
    state: state as VaultState,
    fundedAt: raw[1] as bigint,
    submitDeadline: raw[2] as bigint,
    submittedAt: raw[3] as bigint,
    reviewDeadline: raw[4] as bigint,
    evidenceHash: raw[5] as `0x${string}`,
    evidenceURI: raw[6] as string,
    revisionCount: Number(raw[7]),
    clientCancelProposed: raw[8] as boolean,
    contractorCancelProposed: raw[9] as boolean,
  }
}

export function useVaultConfig(address?: Address) {
  const query = useReadContract({
    abi: vaultAbi,
    address,
    functionName: 'getConfig',
    query: { enabled: !!address },
  })
  return {
    config: parseVaultConfig(query.data),
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
    status: parseVaultStatus(query.data),
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
