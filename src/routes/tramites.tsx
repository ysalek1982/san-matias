import { createFileRoute } from '@tanstack/react-router'
import { Clock3, DollarSign, FileCheck2, FileSearch2, HelpCircle, ListChecks } from 'lucide-react'

import { PageHero } from '@/components/layout/page-hero'
import { getProcedures } from '@/server/public'

export const Route = createFileRoute('/tramites')({ loader: () => getProcedures(), component: TramitesPage })

const money = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 })

function TramitesPage() {
  const procedures = Route.useLoaderData()

  // Group by category
  const byCategory = procedures.reduce<Record<string, typeof procedures>>((acc, p) => {
    acc[p.category] = [...(acc[p.category] ?? []), p]
    return acc
  }, {})

  return (
    <main>
      <PageHero
        eyebrow="Servicios municipales"
        title="Trámites y servicios"
        description="Consulte los requisitos, costos y tiempos estimados para realizar gestiones ante el Gobierno Autónomo Municipal de San Matías."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        {Object.keys(byCategory).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-[2rem] border border-forest-900/10 bg-white py-24 text-center">
            <FileSearch2 className="size-14 text-forest-200" />
            <h2 className="font-display text-2xl font-semibold text-forest-950">Catálogo en actualización</h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              El equipo municipal está cargando los trámites disponibles. Vuelva pronto o contáctenos directamente.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {Object.entries(byCategory).map(([category, items]) => (
              <div key={category}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-forest-900 text-white">
                    <FileCheck2 className="size-5" />
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-forest-950">{category}</h2>
                  <span className="ml-auto rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">
                    {items.length} {items.length === 1 ? 'trámite' : 'trámites'}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((procedure) => (
                    <article
                      key={procedure.id}
                      className="group flex flex-col rounded-[1.75rem] border border-forest-900/10 bg-white p-7 shadow-[0_8px_30px_rgba(13,30,23,.06)] transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <h3 className="font-display text-xl font-semibold leading-tight text-forest-950">
                        {procedure.title}
                      </h3>

                      {procedure.description && (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-3">
                          {procedure.description}
                        </p>
                      )}

                      <div className="mt-6 grid gap-2.5">
                        {procedure.cost != null && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-earth-100 text-earth-700">
                              <DollarSign className="size-3.5" />
                            </span>
                            <span className="font-semibold text-forest-950">
                              {procedure.cost === 0 ? 'Gratuito' : money.format(procedure.cost)}
                            </span>
                          </div>
                        )}

                        {procedure.estimated_duration && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700">
                              <Clock3 className="size-3.5" />
                            </span>
                            <span className="text-muted-foreground">{procedure.estimated_duration}</span>
                          </div>
                        )}
                      </div>

                      {procedure.requirements && procedure.requirements.length > 0 && (
                        <div className="mt-6 rounded-2xl bg-[#f8f6ef] p-4">
                          <p className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold tracking-[.15em] text-earth-700 uppercase">
                            <ListChecks className="size-3.5" /> Requisitos
                          </p>
                          <ul className="space-y-1.5">
                            {procedure.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-forest-900">
                                <span className="mt-0.5 size-4 shrink-0 rounded-full bg-forest-900/10 text-center text-[9px] font-bold leading-4">{i + 1}</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-auto pt-6">
                        <a
                          href="/denuncias"
                          className="flex items-center gap-2 text-xs font-bold text-forest-700 transition hover:text-forest-950"
                        >
                          <HelpCircle className="size-4" />
                          ¿Necesita ayuda? Contáctenos
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
