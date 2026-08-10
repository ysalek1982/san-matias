import { createFileRoute } from '@tanstack/react-router'
import { Building, Landmark, Network, UserRound } from 'lucide-react'

import { PageHero } from '@/components/layout/page-hero'
import { getAuthorities } from '@/server/public'

export const Route = createFileRoute('/autoridades')({ loader: () => getAuthorities(), component: AuthoritiesPage })

const typeIcon = { alcalde: Landmark, concejal: UserRound, directivo: Building, unidad: Network } as const

function AuthoritiesPage() {
  const authorities = Route.useLoaderData()
  return <main><PageHero eyebrow="Gobierno municipal" title="Autoridades y organización" description="Conozca a las instancias responsables de conducir, legislar y administrar el municipio de San Matías." />
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {authorities.map((authority, index) => { const Icon = typeIcon[authority.authority_type]; return <article key={authority.id} className={`relative overflow-hidden rounded-[2rem] border border-forest-900/10 p-7 ${index === 0 ? 'bg-forest-900 text-white md:col-span-2 lg:col-span-2' : 'bg-white'}`}>
          {authority.photo_url ? (
            <img src={authority.photo_url} alt={authority.full_name} className="size-20 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className={`grid size-14 place-items-center rounded-2xl ${index === 0 ? 'bg-white/10 text-sky-200' : 'bg-forest-100 text-forest-800'}`}><Icon /></div>
          )}
          <p className={`mt-10 text-[10px] font-extrabold tracking-[0.17em] uppercase ${index === 0 ? 'text-earth-300' : 'text-earth-700'}`}>{authority.organization_area}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">{authority.full_name}</h2><p className={`mt-2 font-bold ${index === 0 ? 'text-white/70' : 'text-forest-700'}`}>{authority.position}</p>
          <p className={`mt-6 max-w-2xl text-sm leading-7 ${index === 0 ? 'text-white/60' : 'text-muted-foreground'}`}>{authority.biography}</p>
        </article> })}
      </div>
      <div className="mt-16 rounded-[2rem] border border-forest-900/10 bg-clay-50 p-8 sm:p-12"><p className="section-eyebrow">Estructura institucional</p><h2 className="section-title">Organigrama municipal</h2><div className="mt-10 grid gap-3 md:grid-cols-4">{authorities.map((authority, i) => <div key={authority.id} className="relative rounded-2xl border border-forest-900/10 bg-white p-5 text-center shadow-sm"><span className="text-[10px] font-bold text-earth-700">0{i + 1}</span><p className="mt-2 text-sm font-extrabold text-forest-950">{authority.position}</p><p className="mt-1 text-xs text-muted-foreground">{authority.organization_area}</p></div>)}</div></div>
    </section></main>
}

