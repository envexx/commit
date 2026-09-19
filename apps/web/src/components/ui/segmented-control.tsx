"use client"

import { useId, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface SegmentedControlProps {
  options: string[]
  /** Controlled value; omit to let the control manage its own state. */
  value?: string
  onChange?: (v: string) => void
  className?: string
}

/**
 * The range switcher as a primitive: a hairline pill whose thumb glides
 * between options with a shared-layout spring. Tabular labels, no chrome.
 */
export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  const reduced = useReducedMotion()
  const uid = useId()
  const [inner, setInner] = useState(value ?? options[0])
  const current = value ?? inner

  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full border border-line-light bg-panel p-0.5", className)}>
      {options.map((o) => {
        const on = o === current
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => {
              setInner(o)
              onChange?.(o)
            }}
            className={cn(
              "relative rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-200",
              on ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {on && (
              /* transitions.dev sliding-tabs feel: a clean 250ms smooth-out tween */
              <motion.span
                layoutId={`${uid}-thumb`}
                className="absolute inset-0 rounded-full bg-brand/15"
                transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative">{o}</span>
          </button>
        )
      })}
    </div>
  )
}
