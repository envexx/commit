import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xl bg-ink/[0.06]', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-line-light bg-white p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-6 w-2/3" />
      <Skeleton className="mt-5 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
    </div>
  )
}
