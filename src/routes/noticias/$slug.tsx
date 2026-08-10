import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, Share2, Tag } from 'lucide-react'

import { getNewsArticle } from '@/server/public'

export const Route = createFileRoute('/noticias/$slug')({
  loader: ({ params }) => getNewsArticle({ data: { slug: params.slug } }),
  component: ArticlePage,
})

function ArticlePage() {
  const article = Route.useLoaderData()
  const publishDate = new Date(article.published_at ?? article.created_at)
    .toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main>
      <article>
        {/* Hero image */}
        <div className="relative h-[58vh] min-h-[460px] overflow-hidden bg-forest-950">
          <img
            src={article.cover_image_url ?? '/images/pantanal.png'}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/50 to-transparent" />

          {/* Back link */}
          <div className="absolute left-0 right-0 top-0 mx-auto max-w-5xl px-6 pt-8">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="size-3.5" />
              Sala de prensa
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 pb-12 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-extrabold tracking-[.14em] text-earth-200 uppercase backdrop-blur">
                <Tag className="size-3" />
                {article.category}
              </span>
              <span className="text-xs font-semibold text-white/50 capitalize">{publishDate}</span>
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-stone-50 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            {/* Excerpt / lead */}
            <p className="font-display text-xl leading-9 text-forest-900 border-l-4 border-forest-700 pl-6">
              {article.excerpt}
            </p>

            {/* Body */}
            <div className="mt-10 space-y-6 text-lg leading-9 text-foreground/75 [&>p]:text-base [&>p]:leading-8">
              {article.body.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Footer meta */}
            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-forest-900/10 pt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                <span className="capitalize">{publishDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-earth-100 px-3 py-1 text-xs font-bold text-earth-800">
                  {article.category}
                </span>
                <button
                  type="button"
                  onClick={() => { if (navigator.share) void navigator.share({ title: article.title, url: window.location.href }) }}
                  className="flex items-center gap-1.5 rounded-full border border-forest-900/15 px-3 py-1.5 text-xs font-semibold text-forest-700 transition hover:border-forest-900/30 hover:text-forest-950"
                >
                  <Share2 className="size-3.5" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Back to news */}
            <div className="mt-12">
              <Link
                to="/noticias"
                className="group inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-forest-800"
              >
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
                Ver todas las noticias
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
