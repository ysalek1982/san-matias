import { cn } from '@/lib/utils'

export function MunicipalMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[40%_60%_55%_45%] bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(18,71,52,.2)]',
        className,
      )}
    >
      <svg viewBox="0 0 48 48" className="size-8" fill="none">
        <path d="M4 30c7-5 13 5 20 0s13 5 20 0v11H4V30Z" fill="#83C9DF" />
        <path d="M9 29c3-10 7-16 11-18-1 8-2 14-3 19M20 29c2-12 6-20 10-22 0 9-1 16-2 23" stroke="#E8E2BF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="37" cy="11" r="5" fill="#ECA84C" />
      </svg>
    </span>
  )
}

