'use client'

import { useState, type FormEvent, type RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { parseMilestoneInput } from '@/lib/milestone-input'

const INPUT_CLASS =
  'w-full rounded-2xl border border-line-light bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand/60 disabled:opacity-60'

/**
 * The contractor's entry point: paste the link (or bare address) the client
 * shared and go straight to the verification screen.
 */
export function OpenSharedMilestoneForm({
  inputRef,
}: {
  inputRef?: RefObject<HTMLInputElement | null>
}) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const address = parseMilestoneInput(value)
    if (!address) {
      setError('That does not look like a milestone link or a 0x… address.')
      return
    }
    setError(null)
    router.push(`/milestone?address=${address}`)
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="shared-milestone" className="sr-only">
        Milestone link or address
      </label>
      <div className="flex gap-2">
        <input
          id="shared-milestone"
          ref={inputRef}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste the milestone link or 0x… address"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          className={`${INPUT_CLASS} font-mono text-xs`}
        />
        <button
          type="submit"
          aria-label="Open milestone"
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-glow transition hover:bg-brand-strong"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </form>
  )
}
