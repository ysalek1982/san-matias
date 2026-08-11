import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MapPin, ShieldCheck, Trees } from 'lucide-react'

import { PageHero } from '@/components/layout/page-hero'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/turismo')({
  component: TurismoPage,
})

const destinations = [
  {
    title: 'Área Natural de Manejo Integrado (ANMI) San Matías',
    eyebrow: 'Patrimonio de Biodiversidad',
    description: 'Con cerca de 3 millones de hectáreas, es la segunda área protegida más grande de Bolivia y el corazón del Pantanal boliviano. Refugio de yaguaretés, antas, caimanes y cientos de especies de aves.',
    image: '/images/pantanal.png',
    badge: 'Reserva Ecológica',
    tags: ['Ecoturismo', 'Safari Fotográfico', 'Observación de Aves'],
  },
  {
    title: 'Santuario de la Paraba Azul (San Fernando)',
    eyebrow: 'Fauna Emblemática',
    description: 'La comunidad de San Fernando es el hogar y custodio protegido de la Paraba Azul (Anodorhynchus hyacinthinus). Los comunarios guían recorridos para avistar su vuelo libre entre palmeras de motacú.',
    image: '/images/paraba-azul.png',
    badge: 'Especie Protegida',
    tags: ['Conservación', 'Comunidad Local', 'Aves Exóticas'],
  },
  {
    title: 'Laguna Mandioré y Laguna La Gaiba',
    eyebrow: 'Espejos de Agua Fronterizos',
    description: 'Impresionantes superficies hídricas que marcan la frontera natural entre Bolivia y Brasil. Ideales para la navegación ecológica, pesca deportiva reglamentada y atardeceres de ensueño.',
    image: '/images/laguna-mandiore.png',
    badge: 'Navegación & Pesca',
    tags: ['Naturaleza Hídrica', 'Frontera Viva', 'Paseos en Lancha'],
  },
  {
    title: 'La Curicha y Tradición Chiquitana',
    eyebrow: 'Agua Natural y Cultura',
    description: 'Manantial de aguas vertientes cristalinas reconocido por las familias matieñas. Un punto de encuentro cultural donde se entrelazan la gastronomía chiquitana y las costumbres tradicionales.',
    image: '/images/la-curicha.jpg',
    badge: 'Manantial & Tradición',
    tags: ['Aguas Naturales', 'Cultura Matieña', 'Gastronomía Local'],
  },
]

function TurismoPage() {
  return (
    <main>
      <PageHero
        eyebrow="Puerta al Pantanal Boliviano"
        title="Turismo, Cultura y Naturaleza"
        description="Descubra la majestuosidad biológica de San Matías: humedales vivos, fauna protegida, aguas vertientes y la calidez de nuestra gente en la frontera cruceña."
      />

      {/* Featured destinations grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-12 flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-earth-700 uppercase">
            <Trees className="size-4" /> Maravillas Naturales
          </p>
          <h2 className="font-display text-3xl font-semibold text-forest-950 sm:text-4xl">
            Destinos imperdibles en San Matías
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            El Gobierno Autónomo Municipal promueve el turismo ecológico y responsable en colaboración con las comunidades locales.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {destinations.map((dest) => (
            <article
              key={dest.title}
              className="group relative overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-[0_8px_30px_rgba(13,30,23,.06)] transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-black/20" />
                <span className="absolute left-5 top-5 rounded-full bg-forest-950/80 px-3.5 py-1 text-[10px] font-extrabold tracking-[.14em] text-sky-200 uppercase backdrop-blur ring-1 ring-white/20">
                  {dest.badge}
                </span>
              </div>

              <div className="p-7">
                <p className="text-[10px] font-extrabold tracking-[0.2em] text-earth-700 uppercase">
                  {dest.eyebrow}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-forest-950">
                  {dest.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {dest.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800 border border-forest-900/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Sustainable Tourism Notice Banner */}
      <section className="bg-forest-950 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-12 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-3.5 py-1 text-[10px] font-extrabold tracking-[.14em] text-sky-200 uppercase">
                <ShieldCheck className="size-3.5" /> Compromiso Ambiental 2026
              </span>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Turismo Sostenible y Respetuoso con la Biodiversidad
              </h2>
              <p className="text-sm leading-relaxed text-white/70">
                El ANMI San Matías es un santuario protegido por ley. Invitamos a todos los visitantes a contratar guías comunitarios acreditados, respetar los hábitats nidificantes de la Paraba Azul y no dejar huella en nuestras fuentes de agua.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="rounded-full bg-sky-400 font-bold text-forest-950 hover:bg-sky-300 shadow-md">
                <Link to="/tramites">
                  Consultar Ficha Ambiental <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                <Link to="/denuncias">
                  Reportar problema ambiental <MapPin className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
