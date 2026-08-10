import { createFileRoute } from '@tanstack/react-router'
import { Banknote, Building2, MapPin, TrendingUp } from 'lucide-react'

import { WorkStatusBadge } from '@/components/content/status-badge'
import { PageHero } from '@/components/layout/page-hero'
import { Progress } from '@/components/ui/progress'
import { getWorks } from '@/server/public'

export const Route = createFileRoute('/obras')({
  loader: () => getWorks(),
  component: WorksPage,
})

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 })

function WorksPage() {
  const works = Route.useLoaderData()

  const totalBudget = works.reduce((acc, w) => acc + w.budget, 0)
  const avgProgress = works.length
    ? Math.round(works.reduce((acc, w) => acc + w.physical_progress, 0) / works.length)
    : 0

  return (
    <main>
      <PageHero
        eyebrow="Inversión pública"
        title="Obras con seguimiento abierto"
        description="Consulte estado, ubicación, inversión y avance físico de los proyectos municipales publicados."
        aside={
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-center backdrop-blur">
              <strong className="font-display text-3xl font-semibold">{works.length}</strong>
              <span className="mt-1 block text-[10px] font-bold tracking-wide text-white/55 uppercase">Proyectos</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-center backdrop-blur">
              <strong className="font-display text-3xl font-semibold">{avgProgress}%</strong>
              <span className="mt-1 block text-[10px] font-bold tracking-wide text-white/55 uppercase">Avance promedio</span>
            </div>
          </div>
        }
      />

      {/* Summary bar */}
      <div className="border-b border-forest-900/8 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-5">
          <div className="flex items-center gap-2.5 text-sm">
            <Building2 className="size-4 text-sky-600" />
            <span className="text-muted-foreground">Total obras:</span>
            <strong className="font-bold text-forest-950">{works.length}</strong>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Banknote className="size-4 text-earth-600" />
            <span className="text-muted-foreground">Presupuesto total:</span>
            <strong className="font-bold text-forest-950">{money.format(totalBudget)}</strong>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <TrendingUp className="size-4 text-emerald-600" />
            <span className="text-muted-foreground">Avance promedio:</span>
            <strong className="font-bold text-forest-950">{avgProgress}%</strong>
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
        {works.map((work, index) => (
          <article
            key={work.id}
            className={`group overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-[0_10px_40px_rgba(13,30,23,.07)] transition hover:-translate-y-1 hover:shadow-xl ${index % 3 === 0 ? 'md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr]' : ''}`}
          >
            {/* Image */}
            <div className={`relative overflow-hidden ${index % 3 === 0 ? 'min-h-80' : 'h-64'}`}>
              <img
                src={work.cover_image_url ?? '/images/pantanal.png'}
                alt={work.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/30 to-transparent" />
              <div className="absolute left-5 top-5">
                <WorkStatusBadge status={work.status} />
              </div>
              {/* Progress overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                <div className="rounded-xl bg-forest-950/70 px-4 py-3 backdrop-blur">
                  <div className="flex justify-between text-[10px] font-bold text-white uppercase mb-1.5">
                    <span>Avance físico</span>
                    <span>{work.physical_progress}%</span>
                  </div>
                  <Progress value={work.physical_progress} className="h-1.5 bg-white/20" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-7 sm:p-8">
              <h2 className="font-display text-2xl font-semibold leading-tight text-forest-950 sm:text-3xl">
                {work.title}
              </h2>
              {work.summary && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground line-clamp-3">{work.summary}</p>
              )}

              <div className="mt-7 grid gap-2.5 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-sky-600" />
                  {work.location}
                </span>
                {work.contractor && (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-4 shrink-0 text-forest-600" />
                    {work.contractor}
                  </span>
                )}
                <span className="flex items-center gap-2 font-semibold text-forest-950">
                  <Banknote className="size-4 shrink-0 text-earth-600" />
                  {money.format(work.budget)}
                </span>
              </div>

              {/* Progress bar in card */}
              <div className="mt-7 hidden md:block">
                <div className="flex justify-between text-[10px] font-extrabold uppercase text-muted-foreground mb-2">
                  <span>Avance físico</span>
                  <span className="text-forest-950">{work.physical_progress}%</span>
                </div>
                <Progress value={work.physical_progress} className="h-2 bg-forest-100" />
              </div>
            </div>
          </article>
        ))}

        {works.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-forest-900/10 bg-white py-24 text-center">
            <Building2 className="size-14 text-forest-200" />
            <h2 className="font-display text-2xl font-semibold text-forest-950">Obras en preparación</h2>
            <p className="max-w-md text-sm text-muted-foreground">Los proyectos municipales serán publicados próximamente.</p>
          </div>
        )}
      </section>
    </main>
  )
}
