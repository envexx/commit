'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const FRAME_COUNT = 49
const DEFAULT_SCREENS = 3

function frameSrc(index: number) {
  return `/frames/seq/frame-${String(index + 1).padStart(3, '0')}.webp`
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Each scene fades up while centered, then eases into its resting slot in the
// left column as the next one arrives. Windows deliberately leave a gap so two
// scenes are never fading in at once.
function sceneWindows(count: number) {
  const start = 0.06
  const step = 0.1
  const appear = 0.06
  const move = 0.16
  return Array.from({ length: count }, (_, i) => {
    const a = start + i * step
    return { a, b: a + appear, c: a + move }
  })
}

export function ScrollSequenceHero({
  scenes,
  className,
  screens = DEFAULT_SCREENS,
  frameCount = FRAME_COUNT,
}: {
  scenes: ReactNode[]
  className?: string
  screens?: number
  frameCount?: number
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const sceneRefs = useRef<HTMLDivElement[]>([])
  const baseX = useRef<number[]>([])
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const images: HTMLImageElement[] = []
    const loaded: boolean[] = new Array(frameCount).fill(false)
    const els = sceneRefs.current.slice(0, scenes.length)
    const windows = sceneWindows(els.length)

    // Damped scroll progress: whatever the wheel does, the motion eases toward
    // it instead of snapping, which is what makes the scrub feel smooth.
    let target = reduced ? 0.55 : 0
    let shown = target
    let lastProgress = target
    let raf: number | null = null
    let lastTime = 0

    const nearestLoaded = (index: number) => {
      if (loaded[index]) return index
      for (let d = 1; d < frameCount; d++) {
        if (index - d >= 0 && loaded[index - d]) return index - d
        if (index + d < frameCount && loaded[index + d]) return index + d
      }
      return -1
    }

    const drawCover = (img: HTMLImageElement, dpr: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const imageRatio = img.naturalWidth / img.naturalHeight
      const canvasRatio = width / height
      let drawWidth: number
      let drawHeight: number
      let offsetX: number
      let offsetY: number
      if (canvasRatio > imageRatio) {
        drawWidth = width
        drawHeight = width / imageRatio
        offsetX = 0
        offsetY = (height - drawHeight) / 2
      } else {
        drawHeight = height
        drawWidth = height * imageRatio
        offsetX = (width - drawWidth) / 2
        offsetY = 0
      }
      ctx.drawImage(img, offsetX * dpr, offsetY * dpr, drawWidth * dpr, drawHeight * dpr)
    }

    const renderFrame = (progress: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.round(width * dpr)
      const pixelHeight = Math.round(height * dpr)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }

      // One sharp frame at a time — never blend two frames (that reads as blur).
      const index = nearestLoaded(Math.round(clamp01(progress) * (frameCount - 1)))
      ctx.clearRect(0, 0, pixelWidth, pixelHeight)
      if (index < 0) return
      drawCover(images[index], dpr)
    }

    // Distance from the viewport centre (over the image) to the scene's
    // untransformed resting slot in the left column.
    const measure = () => {
      const viewportCenter = window.innerWidth / 2
      els.forEach((el, i) => {
        if (!el) return
        const previous = el.style.transform
        el.style.transform = 'none'
        const rect = el.getBoundingClientRect()
        baseX.current[i] = viewportCenter - (rect.left + rect.width / 2)
        el.style.transform = previous
      })
    }

    const renderText = (progress: number) => {
      els.forEach((el, i) => {
        if (!el) return
        if (reduced) {
          el.style.opacity = '1'
          el.style.transform = 'translate3d(0,0,0)'
          el.style.pointerEvents = 'auto'
          return
        }
        const w = windows[i]
        const appearRaw = clamp01((progress - w.a) / (w.b - w.a))
        const moveRaw = clamp01((progress - w.b) / (w.c - w.b))
        const appear = easeOutCubic(appearRaw)
        const move = easeInOutCubic(moveRaw)

        const x = (baseX.current[i] ?? 0) * (1 - move)
        const y = 96 * (1 - move)
        el.style.opacity = appear.toFixed(3)
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
        el.style.pointerEvents = progress >= w.c - 0.004 ? 'auto' : 'none'
      })
    }

    const render = (progress: number) => {
      lastProgress = progress
      renderFrame(progress)
      renderText(progress)
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp01(progress).toFixed(4)})`
    }

    const computeTarget = () => {
      const total = section.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), Math.max(total, 0))
      target = total > 0 ? scrolled / total : 0
    }

    const tick = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16
      lastTime = time
      // Time-based damping (~90ms time constant): identical feel at 60/120Hz.
      const alpha = 1 - Math.exp(-dt / 90)
      shown += (target - shown) * alpha
      if (Math.abs(target - shown) < 0.0006) {
        shown = target
        render(shown)
        raf = null
        lastTime = 0
        return
      }
      render(shown)
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (raf != null) return
      lastTime = 0
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      computeTarget()
      start()
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = frameSrc(i)
      images.push(img)
      const mark = () => {
        loaded[i] = true
        if (raf == null) render(lastProgress)
      }
      if (img.complete && img.naturalWidth > 0) mark()
      else {
        img.onload = mark
        img.onerror = mark
      }
    }

    const onResize = () => {
      measure()
      computeTarget()
      if (reduced) render(shown)
      else start()
    }

    measure()
    computeTarget()
    if (reduced) {
      shown = 0.55
      render(shown)
    } else {
      shown = target
      render(shown)
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
    }

    // Fonts can change text metrics after first paint; re-measure once ready.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        measure()
        computeTarget()
        render(shown)
      })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (raf != null) cancelAnimationFrame(raf)
    }
  }, [frameCount, reduced, scenes.length])

  return (
    <section
      ref={sectionRef}
      className={cn('relative bg-base', className)}
      style={reduced ? undefined : { height: `${(screens + 1) * 100}vh` }}
    >
      <div className={cn('h-[100svh] w-full overflow-hidden', reduced ? 'relative' : 'sticky top-0')}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="container-fx w-full">
            <div
              className="max-w-2xl"
              style={{ textShadow: '0 2px 30px rgba(2, 6, 23, 0.55)' }}
            >
              {scenes.map((scene, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) sceneRefs.current[i] = el
                  }}
                  className="will-change-transform"
                  style={{ opacity: 0, pointerEvents: 'none' }}
                >
                  {scene}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!reduced && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-px bg-white/10">
            <div ref={barRef} className="h-full origin-left scale-x-0 bg-brand" />
          </div>
        )}
      </div>
    </section>
  )
}
