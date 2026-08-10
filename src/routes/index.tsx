import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Building2, Clock3, Eye, FileText, LifeBuoy, MapPinned, MessageCircle, Newspaper, ShieldCheck, TrendingUp, Waves } from 'lucide-react'

import { WorkStatusBadge } from '@/components/content/status-badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getHomeData } from '@/server/public'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  component: HomePage,
})

const jewels = [
  { name: 'La Curicha', eyebrow: 'Agua natural', image: '/images/la-curicha.jpg', className: 'md:col-span-2 md:row-span-2' },
  { name: 'Pantanal boliviano', eyebrow: 'Humedal vivo', image: '/images/pantanal.png', className: 'md:row-span-2' },
  { name: 'Paraba Azul', eyebrow: 'Fauna emblemática', image: '/images/paraba-azul.png', className: '' },
  { name: 'Laguna Mandioré', eyebrow: 'Frontera de agua', image: '/images/laguna-mandiore.png', className: '' },
]

const services = [
  { to: '/obras', label: 'Obras públicas', text: 'Conozca el avance físico de cada proyecto.', icon: Building2 },
  { to: '/documentos', label: 'Transparencia', text: 'POA, resoluciones y documentos públicos.', icon: FileText },
  { to: '/noticias', label: 'Noticias', text: 'La gestión municipal, directamente de la fuente.', icon: Newspaper },
  { to: '/denuncias', label: 'Atención ciudadana', text: 'Reporte un problema y reciba un ticket.', icon: LifeBuoy },
] as const

function HomePage() {
  const { works, news } = Route.useLoaderData()
  const averageProgress = works.length
    ? Math.round(works.reduce((total, work) => total + work.physical_progress, 0) / works.length)
    : 0
  const publicPulse = [
    { value: String(works.length).padStart(2, '0'), label: 'obras visibles', icon: Building2 },
    { value: `${averageProgress}%`, label: 'avance promedio', icon: TrendingUp },
    { value: String(news.length).padStart(2, '0'), label: 'noticias recientes', icon: Newspaper },
    { value: '24/7', label: 'recepción de reportes', icon: Clock3 },
  ]

  return (
    <main>
      <section className="surface-grain relative overflow-hidden bg-forest-950 px-4 pt-7 pb-12 text-white sm:px-6 sm:pb-16">
        <div className="absolute inset-0 opacity-[0.09] [background-image:radial-gradient(circle_at_center,#b9e1ed_1px,transparent_1.5px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
            <div className="reveal-up max-w-4xl">
              <p className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-earth-300 uppercase"><Waves className="size-4" /> Portal ciudadano</p>
              <h1 className="font-display text-[clamp(3.1rem,8vw,7.8rem)] leading-[0.82] font-semibold tracking-[-0.065em] text-balance">
                Naturalmente<br /><span className="ml-[8vw] text-sky-200 italic">San Matías.</span>
              </h1>
            </div>
            <div className="reveal-up-delay max-w-xs pb-2">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold tracking-[.14em] text-sky-200 uppercase backdrop-blur"><i className="status-pulse size-1.5 rounded-full bg-sky-300" /> Gestión municipal 2026</span>
              <p className="text-sm leading-6 text-white/65">Un municipio fronterizo, abierto y transparente. Aquí encuentra información, servicios y una puerta al Pantanal boliviano.</p>
              <Button asChild variant="link" className="mt-3 h-auto p-0 font-bold text-white hover:text-earth-200">
                <Link to="/denuncias">Realizar una gestión <ArrowRight /></Link>
              </Button>
            </div>
          </div>

          <div className="reveal-up-late grid min-h-[620px] gap-3 md:grid-cols-4 md:grid-rows-2">
            {jewels.map((jewel, index) => (
              <article key={jewel.name} className={`group relative min-h-64 overflow-hidden rounded-[1.6rem] ring-1 ring-white/10 ${jewel.className}`}>
                <img src={jewel.image} alt={jewel.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-transparent to-black/10" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div><p className="text-[10px] font-extrabold tracking-[0.2em] text-earth-200 uppercase">{jewel.eyebrow}</p><h2 className="mt-1 font-display text-2xl font-semibold">{jewel.name}</h2></div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition group-hover:bg-white group-hover:text-forest-950"><ArrowRight className="size-4" /></span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Indicadores de la portada" className="relative z-10 mx-auto -mt-5 max-w-7xl px-6">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-forest-900/10 bg-white shadow-[0_18px_60px_rgba(13,30,23,.10)] sm:grid-cols-2 lg:grid-cols-4">
          {publicPulse.map(({ value, label, icon: Icon }, index) => (
            <div key={label} className="group flex items-center gap-4 border-forest-900/10 p-5 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${index === 1 ? 'bg-sky-100 text-sky-700' : 'bg-forest-100 text-forest-800'}`}><Icon className="size-4" /></span>
              <div><strong className="font-display text-2xl font-semibold tracking-tight text-forest-950">{value}</strong><span className="block text-[10px] font-bold tracking-[.08em] text-muted-foreground uppercase">{label}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-forest-900/10 bg-forest-900/10 md:grid-cols-4">
          {services.map(({ to, label, text, icon: Icon }, index) => (
            <Link key={to} to={to} className="group relative bg-stone-50 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl">
              <span className="absolute top-7 right-7 font-display text-3xl text-forest-900/10">0{index + 1}</span>
              <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-forest-100 text-forest-800 transition group-hover:bg-forest-900 group-hover:text-white"><Icon className="size-5" /></span></div>
              <h3 className="mt-7 font-display text-xl font-semibold text-forest-950">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              <span className="mt-5 flex items-center gap-2 text-xs font-extrabold tracking-wide text-forest-700 uppercase opacity-0 transition group-hover:opacity-100">Ingresar <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-clay-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="section-eyebrow">Gestión visible</p><h2 className="section-title">Obras que avanzan</h2></div>
            <Button asChild variant="outline" className="rounded-full bg-transparent"><Link to="/obras">Ver todas las obras <ArrowRight /></Link></Button>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {works.map((work) => (
              <article key={work.id} className="group overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white shadow-[0_15px_50px_rgba(27,73,54,.07)]">
                <div className="relative h-56 overflow-hidden"><img src={work.cover_image_url ?? '/images/pantanal.png'} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute top-4 left-4"><WorkStatusBadge status={work.status} /></div></div>
                <div className="p-6"><p className="text-xs font-bold tracking-wide text-earth-700 uppercase">{work.location}</p><h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-forest-950">{work.title}</h3><div className="mt-6 flex items-center justify-between text-xs font-bold"><span>Avance físico</span><span>{work.physical_progress}%</span></div><Progress value={work.physical_progress} className="mt-2 h-2 bg-forest-100" /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[.8fr_1.2fr]">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-sky-700 p-8 text-white sm:p-10">
          <div className="absolute -bottom-16 -right-12 size-64 rounded-full border-[40px] border-white/10" />
          <MapPinned className="size-10 text-sky-200" />
          <h2 className="mt-12 font-display text-4xl font-semibold leading-tight">La frontera que nos une.</h2>
          <p className="mt-5 max-w-md leading-7 text-white/70">San Matías es encuentro, naturaleza y cultura compartida. Descubra un territorio entre el bosque chiquitano y el gran humedal.</p>
        </div>
        <div>
          <div><p className="section-eyebrow">Actualidad municipal</p><h2 className="section-title">Lo que está pasando</h2></div>
          <div className="mt-8 divide-y divide-forest-900/10 border-y border-forest-900/10">
            {news.map((article) => (
              <Link key={article.id} to="/noticias/$slug" params={{ slug: article.slug }} className="group grid gap-4 py-6 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                <img src={article.cover_image_url ?? '/images/pantanal.png'} alt="" loading="lazy" className="h-24 w-full rounded-2xl object-cover sm:w-[110px]" />
                <div><p className="text-[10px] font-extrabold tracking-[0.16em] text-earth-700 uppercase">{article.category}</p><h3 className="mt-1 font-display text-xl font-semibold leading-tight text-forest-950">{article.title}</h3><p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{article.excerpt}</p></div>
                <ArrowRight className="hidden size-5 text-forest-400 transition group-hover:translate-x-1 sm:block" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="surface-grain relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.3rem] bg-earth-600 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="absolute -top-20 -right-10 size-72 rounded-full border-[46px] border-white/8" />
          <div className="relative p-8 sm:p-12">
            <p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[.2em] text-earth-200 uppercase"><Eye className="size-4" /> Municipio que escucha</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.02] font-semibold tracking-[-.035em] sm:text-5xl">¿Algo en su barrio necesita atención?</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">Registre el problema en línea y conserve su número de ticket para conocer cada avance de la respuesta municipal.</p>
          </div>
          <div className="relative flex flex-wrap gap-3 px-8 pb-8 sm:px-12 lg:max-w-sm lg:justify-end lg:p-12">
            <Button asChild size="lg" className="rounded-full bg-white text-earth-800 hover:bg-earth-100"><Link to="/denuncias"><MessageCircle className="size-4" /> Crear reporte</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/denuncias/seguimiento" search={{ ticket: '' }}><ShieldCheck className="size-4" /> Ver seguimiento</Link></Button>
          </div>
        </div>
      </section>
    </main>
  )
}
