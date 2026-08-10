import type { ReactNode } from 'react'

export function PageHero({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return (
    <section className="surface-grain relative overflow-hidden bg-forest-950 text-white">
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,#b9e1ed_1px,transparent_1px),linear-gradient(to_bottom,#b9e1ed_1px,transparent_1px)] [background-size:68px_68px] [mask-image:linear-gradient(to_right,transparent,black_45%,transparent)]" />
      <div className="absolute -top-36 right-[-8%] size-[420px] rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute bottom-[-70%] left-[15%] size-[420px] rounded-full bg-earth-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1fr_auto] md:items-end md:py-24">
        <div className="reveal-up max-w-3xl">
          <p className="text-xs font-extrabold tracking-[0.2em] text-earth-300 uppercase">{eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance md:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">{description}</p>
        </div>
        {aside && <div className="reveal-up-delay">{aside}</div>}
      </div>
      <p className="absolute right-6 bottom-5 hidden text-[9px] font-bold tracking-[.24em] text-white/25 uppercase xl:block">16°21′ S · 58°24′ O</p>
    </section>
  )
}
