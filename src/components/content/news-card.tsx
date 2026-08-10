import { Link } from '@tanstack/react-router'
import { ArrowRight, Calendar } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { NewsArticle } from '@/types/database'

type NewsCardProps = {
  article: Pick<NewsArticle, 'id' | 'slug' | 'title' | 'excerpt' | 'category' | 'cover_image_url' | 'published_at'>
}

export function NewsCard({ article }: NewsCardProps) {
  const date = article.published_at
    ? new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(article.published_at))
    : 'Pronto'

  return (
    <Card className="group overflow-hidden rounded-2xl border-forest-900/10 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-50">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-forest-300">
            <span className="font-display font-medium">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-4 left-4 rounded-full bg-forest-950/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
          {article.category}
        </div>
      </div>
      
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-earth-600">
          <Calendar className="size-3.5" />
          <time dateTime={article.published_at || ''}>{date}</time>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-xl font-bold leading-tight text-forest-950">
          {article.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-5 pt-3">
        <p className="line-clamp-3 text-sm leading-relaxed text-forest-800/80">
          {article.excerpt}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Link
          to="/noticias/$slug" params={{ slug: article.slug }}
          className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition-colors hover:text-sky-900"
        >
          Leer noticia completa <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
