"use client"

import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * "Nothing yet" register in the app's retro language: a hairline panel, a
 * square icon chip, one line of ink and one quiet action. The emptiness is the
 * design; nothing decorates it.
 */
export function EmptyState({
  icon,
  title = "Nothing here yet",
  hint = "this space fills in as the work moves",
  action = "Get started",
  onAction,
  className,
}: {
  icon?: ReactNode
  title?: string
  hint?: string
  /** Button label; pass null to render no action. */
  action?: string | null
  onAction?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[420px] flex-col items-center border border-line-light bg-panel bg-grid-retro px-8 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="grid h-10 w-10 place-items-center border border-line-light bg-brand/10 text-brand-strong">
          {icon}
        </span>
      )}
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-ink">{title}</p>
      <p className="mt-2 max-w-[280px] font-mono text-[11px] uppercase leading-relaxed tracking-wide text-ink-muted">
        {hint}
      </p>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-full bg-brand px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-strong"
        >
          {action}
        </button>
      )}
    </div>
  )
}
