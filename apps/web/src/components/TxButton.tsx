'use client'

import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button'
import { explorerTx } from '@/lib/config'

export function TxButton({
  onClick,
  pending,
  disabled,
  variant = 'primary',
  size = 'md',
  arrow = false,
  children,
}: {
  onClick: () => void
  pending: boolean
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  arrow?: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      onClick={onClick}
      loading={pending}
      disabled={disabled}
      variant={variant}
      size={size}
      arrow={arrow}
    >
      {children}
    </Button>
  )
}

export function TxError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p className="mt-3 flex max-w-xl items-start gap-2 rounded-2xl border border-rose-500/40 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="break-words">{error}</span>
    </p>
  )
}

export function TxSuccess({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="mt-3 flex max-w-xl items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-50 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-700">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="break-words">{message}</span>
    </p>
  )
}

export function TxLink({ hash }: { hash: `0x${string}` | null }) {
  if (!hash) return null
  const url = explorerTx(hash)
  const label = `${hash.slice(0, 18)}…${hash.slice(-8)}`
  return (
    <p className="mt-3 font-mono text-xs text-ink0">
      tx:{' '}
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
          {label}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      ) : (
        <span>{label}</span>
      )}
    </p>
  )
}
