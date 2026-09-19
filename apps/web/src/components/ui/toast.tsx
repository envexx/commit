'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'error' | 'info'

export type ToastInput = {
  title: string
  description?: string
  tone?: Tone
}

type ToastItem = ToastInput & { id: number; tone: Tone }

const ToastContext = createContext<{ toast: (t: ToastInput) => void }>({ toast: () => {} })

const TONE_STYLES: Record<Tone, { ring: string; icon: string; Icon: typeof Info }> = {
  success: { ring: 'border-emerald-500/30 bg-emerald-50', icon: 'text-emerald-600', Icon: CheckCircle2 },
  error: { ring: 'border-rose-500/30 bg-rose-50', icon: 'text-rose-600', Icon: XCircle },
  info: { ring: 'border-brand/40 bg-brand/[0.06]', icon: 'text-brand', Icon: Info },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev.slice(-3), { ...input, tone: input.tone ?? 'info', id }])
      setTimeout(() => dismiss(id), 6500)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const { ring, icon, Icon } = TONE_STYLES[item.tone]
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 border border-line-light bg-panel p-4 shadow-hard-sm',
                  ring,
                )}
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 break-words text-xs leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="rounded-full p-1 text-ink-muted transition hover:bg-canvas hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
