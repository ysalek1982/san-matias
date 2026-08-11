import { cn } from '@/lib/utils'

export function MunicipalMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest-950 p-0.5 shadow-[0_8px_24px_rgba(18,71,52,.25)] ring-1 ring-white/15',
        className,
      )}
    >
      <img
        src="/images/logo.jpg"
        alt="GAM San Matías"
        className="h-full w-full object-cover rounded-[14px]"
      />
    </span>
  )
}
