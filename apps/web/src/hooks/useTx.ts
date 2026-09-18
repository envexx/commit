'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'
import { useCallback, useState } from 'react'

type Hash = `0x${string}`

export type TxResult = { ok: boolean; error: string | null; hash: Hash | null }

export function shortError(err: unknown): string {
  const e = err as { name?: string; shortMessage?: string; message?: string }
  if (e?.name === 'UserRejectedRequestError' || /user rejected|denied/i.test(e?.message ?? '')) {
    return 'Rejected in wallet.'
  }
  const msg = e?.shortMessage ?? e?.message ?? 'Transaction failed.'
  return msg.length > 220 ? `${msg.slice(0, 220)}…` : msg
}

export function useTx() {
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [txHash, setTxHash] = useState<Hash | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (
      send: () => Promise<Hash>,
      opts?: { onConfirmed?: (hash: Hash) => void | Promise<void> },
    ): Promise<TxResult> => {
      setPending(true)
      setError(null)
      setTxHash(null)
      try {
        const hash = await send()
        setTxHash(hash)
        if (!publicClient) throw new Error('No chain client available.')
        await publicClient.waitForTransactionReceipt({ hash })
        await queryClient.invalidateQueries()
        await opts?.onConfirmed?.(hash)
        return { ok: true, error: null, hash }
      } catch (err) {
        const message = shortError(err)
        setError(message)
        return { ok: false, error: message, hash: null }
      } finally {
        setPending(false)
      }
    },
    [publicClient, queryClient],
  )

  const reset = useCallback(() => {
    setError(null)
    setTxHash(null)
  }, [])

  return { execute, pending, txHash, error, reset }
}
