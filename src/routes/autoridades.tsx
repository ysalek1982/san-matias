import { createFileRoute } from '@tanstack/react-router'
import { Building2, Landmark, Network, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { useState } from 'react'

import { PageHero } from '@/components/layout/page-hero'
import { getAuthorities } from '@/server/public'
import type { Authority } from '@/types/database'

export const Route = createFileRoute('/autoridades')({ loader: () => getAuthorities(), component: AuthoritiesPage })

const typeIcon = { alcalde: Landmark, concejal: UsersRound, directivo: Building2, unidad: Network } as const
const typeLabel = { alcalde: 'Alcaldía', concejal: 'Concejo Municipal', directivo: 'Dirección municipal', unidad: 'Unidad institucional' } as const

function isPortrait(url: string | null): url is string {
  return Boolean(url && !url.endsWith('/images/logo.jpg') && !url.endsWith('/logo.jpg'))
}

function AuthorityPortrait({ authority, featured = false }: { authority: Authority; featured?: boolean }) {
  const [failed, setFailed] = useState(false)
  const Icon = typeIcon[authority.authority_type]
  const photoUrl = isPortrait(authority.photo_url) ? authority.photo_url : null
  const showPhoto = Boolean(photoUrl) && !failed

  return (
    <div className={`portrait-arrive relative isolate overflow-hidden bg-forest-100 ${featured ? 'min-h-[28rem] lg:min-h-[38rem]' : 'aspect-[4/5]'}`}>
      {showPhoto ? (
        <>
          <img src={photoUrl ?? undefined} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-25 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/20 to-forest-950/15" />
          <img
            src={photoUrl ?? undefined}
            alt={`Fotografía de ${authority.full_name}`}
            loading={featured ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className="relative z-10 size-full object-contain object-center transition duration-700 group-hover:scale-[1.015]"
          />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#dceadf,transparent_42%),linear-gradient(145deg,#f4f1e9,#dceadf)]">
          <div className="absolute size-56 rounded-full border border-forest-700/10" />
          <div className="absolute size-36 rounded-full border border-forest-700/10" />
          <span className="relative grid size-24 place-items-center rounded-[2rem] bg-forest-950 text-sky-200 shadow-[0_22px_55px_rgba(13,30,23,.22)]"><Icon className="size-10" /></span>
        </div>
      )}
      <span className="absolute top-4 left-4 z-20 rounded-full border border-white/50 bg-white/85 px-3 py-1.5 text-[9px] font-extrabold tracking-[.16em] text-forest-900 uppercase shadow-sm backdrop-blur-md">
        {typeLabel[authority.authority_type]}
      </span>
    </div>
  )
}

function AuthoritiesPage() {
  const authorities = Route.useLoaderData()
  const featured = authorities.find((authority) => authority.authority_type === 'alcalde' && isPortrait(authority.photo_url)) ?? authorities[0]
  const remaining = featured ? authorities.filter((authority) => authority.id !== featured.id) : authorities

  return (
    <main>
      <PageHero
        eyebrow="Gobierno municipal"
        title="Autoridades y organización"
        description="Conozca a las personas e instancias responsables de conducir, legislar y administrar el municipio de San Matías."
        aside={(
          <div className="grid min-w-44 grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-white/15 bg-white/7 p-4 backdrop-blur-md">
            <span className="grid size-11 place-items-center rounded-xl bg-sky-200 text-forest-950"><UsersRound className="size-5" /></span>
            <span><strong className="block font-display text-2xl leading-none">{authorities.length}</strong><small className="mt-1 block text-[9px] font-bold tracking-[.12em] text-white/55 uppercase">registros públicos</small></span>
          </div>
        )}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="section-eyebrow">Representación institucional</p>
            <h2 className="section-title max-w-3xl">Un gobierno con rostro y responsabilidad.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">Información oficial publicada por el municipio y administrable desde el CMS institucional.</p>
        </div>

        {featured && (
          <article className="group pantanal-surface grid overflow-hidden rounded-[2rem] lg:grid-cols-[minmax(19rem,.78fr)_1.22fr]">
            <AuthorityPortrait authority={featured} featured />
            <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-14">
              <div className="absolute -right-24 -bottom-24 size-72 rounded-full border-[42px] border-sky-200/25" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-1.5 text-[10px] font-extrabold tracking-[.15em] text-forest-800 uppercase"><ShieldCheck className="size-3.5" /> Autoridad municipal</span>
                <p className="mt-10 text-[10px] font-extrabold tracking-[.18em] text-earth-700 uppercase">{featured.organization_area || typeLabel[featured.authority_type]}</p>
                <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[.98] font-semibold tracking-[-.045em] text-forest-950 sm:text-6xl">{featured.full_name}</h2>
                <p className="mt-4 text-base font-extrabold text-forest-700 sm:text-lg">{featured.position}</p>
                {featured.biography && <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{featured.biography}</p>}
              </div>
              <div className="relative mt-12 flex items-center gap-3 border-t border-forest-900/10 pt-5 text-xs font-bold text-forest-700">
                <span className="h-px w-10 bg-earth-500" /> Gobierno Autónomo Municipal de San Matías
              </div>
            </div>
          </article>
        )}

        {remaining.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remaining.map((authority) => (
              <article key={authority.id} className="group pantanal-surface overflow-hidden rounded-[1.7rem] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(13,30,23,.13)]">
                <AuthorityPortrait authority={authority} />
                <div className="p-6 sm:p-7">
                  <p className="text-[9px] font-extrabold tracking-[.17em] text-earth-700 uppercase">{authority.organization_area || typeLabel[authority.authority_type]}</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight font-semibold text-forest-950">{authority.full_name}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-forest-700">{authority.position}</p>
                  {authority.biography && <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{authority.biography}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        {authorities.length === 0 && (
          <div className="pantanal-surface rounded-[2rem] p-12 text-center"><UserRound className="mx-auto size-9 text-forest-400" /><h2 className="mt-5 font-display text-3xl font-semibold text-forest-950">Información en actualización</h2><p className="mt-2 text-sm text-muted-foreground">El municipio publicará aquí la nómina institucional.</p></div>
        )}

        <section className="surface-grain relative mt-20 overflow-hidden rounded-[2rem] bg-forest-950 p-7 text-white sm:p-12">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(131,201,223,.18),transparent_55%)]" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-[10px] font-extrabold tracking-[.18em] text-earth-300 uppercase">Estructura institucional</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.035em]">Organigrama municipal</h2></div>
            <p className="max-w-md text-sm leading-7 text-white/55">Una lectura resumida de las áreas y responsabilidades publicadas.</p>
          </div>
          <div className="relative mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {authorities.map((authority, index) => {
              const Icon = typeIcon[authority.authority_type]
              return <div key={authority.id} className="rounded-2xl border border-white/10 bg-white/[.055] p-5 backdrop-blur-sm transition hover:border-sky-200/30 hover:bg-white/[.09]"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-white/10 text-sky-200"><Icon className="size-4" /></span><span className="font-display text-xl text-white/20">{String(index + 1).padStart(2, '0')}</span></div><p className="mt-5 text-sm font-extrabold leading-5 text-white">{authority.position}</p><p className="mt-2 text-xs leading-5 text-white/45">{authority.organization_area}</p></div>
            })}
          </div>
        </section>
      </section>
    </main>
  )
}
