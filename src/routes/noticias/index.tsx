import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { PageHero } from '@/components/layout/page-hero'
import { getNews } from '@/server/public'

export const Route = createFileRoute('/noticias/')({ loader: () => getNews(), component: NewsPage })

function NewsPage() { const news = Route.useLoaderData(); return <main><PageHero eyebrow="Sala de prensa" title="Noticias de nuestro municipio" description="Información institucional sobre salud, turismo, educación y la gestión que transforma San Matías." /><section className="mx-auto grid max-w-7xl gap-7 px-6 py-20 md:grid-cols-2 lg:grid-cols-3">{news.map((article, index) => <Link key={article.id} to="/noticias/$slug" params={{ slug: article.slug }} className={`group overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white ${index === 0 ? 'md:col-span-2 lg:col-span-2 lg:grid lg:grid-cols-2' : ''}`}><div className={`overflow-hidden ${index === 0 ? 'min-h-80' : 'h-60'}`}><img src={article.cover_image_url ?? '/images/pantanal.png'} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="p-7"><p className="text-[10px] font-extrabold tracking-[.17em] text-earth-700 uppercase">{article.category}</p><h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest-950">{article.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{article.excerpt}</p><span className="mt-8 flex items-center gap-2 text-sm font-bold text-forest-800">Leer noticia <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></div></Link>)}</section></main> }

