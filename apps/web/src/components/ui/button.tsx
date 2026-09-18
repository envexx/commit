'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'outlineLight'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'dark'

export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'rounded-full bg-brand text-white shadow-glow hover:bg-brand-strong hover:shadow-glow-lg',
  outline:
    'rounded-full border border-line-light bg-white text-ink hover:border-zinc-300 hover:bg-surface-soft',
  outlineLight:
    'rounded-full border border-line-light bg-white text-ink hover:border-zinc-400 hover:bg-surface-gray',
  ghost: 'rounded-full text-ink-muted hover:bg-surface-soft hover:text-ink',
  danger: 'rounded-full bg-rose-600 text-white shadow-[0_0_24px_rgba(225,29,72,0.35)] hover:bg-rose-500',
  success:
    'rounded-full bg-emerald-600 text-white shadow-[0_0_24px_rgba(5,150,105,0.35)] hover:bg-emerald-500',
  dark: 'rounded-full bg-ink text-white hover:bg-zinc-800',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'group inline-flex items-center justify-center gap-2 font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  arrow?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  arrow = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={buttonVariants({ variant, size, className })}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
      {arrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
        />
      )}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  arrow = false,
  external = false,
  className,
  children,
}: {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  arrow?: boolean
  external?: boolean
  className?: string
  children: ReactNode
}) {
  const classes = buttonVariants({ variant, size, className })
  const arrowIcon = arrow ? (
    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
  ) : null

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
        {arrowIcon}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {arrowIcon}
    </Link>
  )
}
