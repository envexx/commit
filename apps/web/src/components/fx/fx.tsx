import { cn } from '@/lib/utils'

const ARC_PATH = 'M-160 700 C 320 650, 620 380, 980 250 S 1440 100, 1680 66'

export function GlowRibbon({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute -right-[12%] -top-[18%] h-[75%] w-[70%] rounded-full bg-brand/25 blur-[130px]" />
      <div className="absolute -left-[18%] top-[38%] h-[46%] w-[52%] rounded-full bg-brand/15 blur-[120px]" />
      <div className="absolute right-[6%] top-[22%] h-[34%] w-[38%] rounded-full bg-brand-strong/20 blur-[110px]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="fx-arc" x1="0" y1="720" x2="1500" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5500" stopOpacity="0" />
            <stop offset="0.32" stopColor="#FF5500" stopOpacity="0.85" />
            <stop offset="0.72" stopColor="#FF7700" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FF7700" stopOpacity="0" />
          </linearGradient>
          <filter id="fx-arc-blur" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <filter id="fx-arc-soft" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <path
          d={ARC_PATH}
          stroke="url(#fx-arc)"
          strokeWidth="72"
          strokeLinecap="round"
          opacity="0.5"
          filter="url(#fx-arc-blur)"
        />
        <path
          d={ARC_PATH}
          stroke="url(#fx-arc)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.5"
          filter="url(#fx-arc-soft)"
        />
        <g style={{ filter: 'drop-shadow(0 0 35px rgba(255, 85, 0, 0.6))' }}>
          <path d={ARC_PATH} stroke="url(#fx-arc)" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M-160 738 C 320 688, 626 416, 986 286 S 1446 136, 1680 102"
            stroke="url(#fx-arc)"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M-160 662 C 320 612, 614 344, 974 214 S 1434 64, 1680 30"
            stroke="url(#fx-arc)"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.45"
          />
        </g>
      </svg>
    </div>
  )
}

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
      <div className="absolute left-1/2 top-0 h-24 w-2/3 -translate-x-1/2 bg-brand/10 blur-3xl" />
    </div>
  )
}

export function Watermark({
  text,
  className,
  withMark = false,
}: {
  text: string
  className?: string
  withMark?: boolean
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute flex select-none items-center gap-4 font-display font-black leading-[0.8] tracking-tighter text-white/90',
        className,
      )}
    >
      {withMark && (
        <span className="flex aspect-square h-[0.62em] items-center justify-center rounded-[0.16em] bg-brand text-[0.42em] font-black text-white shadow-glow">
          A
        </span>
      )}
      {text}
    </div>
  )
}
